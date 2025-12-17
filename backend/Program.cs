using backend.Data;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;
using System.Net;

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure DbContext to use PostgreSQL
var connectionString = Environment.GetEnvironmentVariable("DB_CONNECTION_STRING");

if (!string.IsNullOrEmpty(connectionString) && 
    (connectionString.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase) || 
     connectionString.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase)))
{
    Console.WriteLine("--- CONFIG: Detected URI-style connection string. Parsing...");
    var databaseUri = new Uri(connectionString);
    var userInfo = databaseUri.UserInfo.Split(new[] { ':' }, 2);
    var builderNpgsql = new Npgsql.NpgsqlConnectionStringBuilder
    {
        Host = databaseUri.Host,
        Port = databaseUri.Port,
        Username = userInfo[0],
        Password = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : null,
        Database = databaseUri.LocalPath.TrimStart('/'),
        SslMode = Npgsql.SslMode.Require,
    };

    // Supabase: Force port 6543 (Session Pooler) if on port 5432 to ensure IPv4 compatibility
    if (builderNpgsql.Host.Contains("supabase.co") && builderNpgsql.Port == 5432)
    {
        builderNpgsql.Port = 6543;
        Console.WriteLine("--- CONFIG: Switched to Supabase Pooler port 6543 for IPv4 compatibility.");
    }

    try
    {
        Console.WriteLine($"--- DNS: Resolving host {builderNpgsql.Host}...");
        var ipAddresses = await Dns.GetHostAddressesAsync(builderNpgsql.Host);
        var ipv4Address = ipAddresses.FirstOrDefault(ip => ip.AddressFamily == System.Net.Sockets.AddressFamily.InterNetwork);

        if (ipv4Address != null)
        {
            builderNpgsql.Host = ipv4Address.ToString();
        }
        else
        {
            
            // Extract Project ID (e.g., db.abcdefg.supabase.co -> abcdefg)
            var hostParts = builderNpgsql.Host.Split('.');
            if (hostParts.Length >= 4 && hostParts[0] == "db" && hostParts[2] == "supabase" && hostParts[3] == "co")
            {
                var projectId = hostParts[1];
                var originalUser = builderNpgsql.Username;
                
                // Try sa-east-1 first (detected via IP previously), then others
                var regions = new[] { 
                    "sa-east-1", "us-east-1", "us-east-2", "eu-central-1", "ap-southeast-1",
                    "us-west-1", "us-west-2", "eu-west-1", "eu-west-2", "eu-west-3",
                    "ap-northeast-1", "ap-northeast-2", "ap-south-1", "ap-southeast-2",
                    "ca-central-1"
                };
                
                string confirmedPoolerHost = null;

                foreach (var region in regions)
                {
                    var poolerHost = $"aws-0-{region}.pooler.supabase.com";
                    try
                    {
                        var poolerIps = await Dns.GetHostAddressesAsync(poolerHost);
                        var poolerIpv4 = poolerIps.FirstOrDefault(ip => ip.AddressFamily == System.Net.Sockets.AddressFamily.InterNetwork);
                        
                        if (poolerIpv4 != null)
                        {
                            var probeBuilder = new Npgsql.NpgsqlConnectionStringBuilder(builderNpgsql.ConnectionString)
                            {
                                Host = poolerHost,
                                Port = 6543,
                                Username = $"{originalUser}.{projectId}",
                                Options = $"reference={projectId}",
                                Pooling = false,
                                Timeout = 3
                            };
                            // Ensure password is correct (unescaped)
                            probeBuilder.Password = builderNpgsql.Password;

                            Console.WriteLine($"--- PROBE: Testing connection to {poolerHost}...");
                            try 
                            {
                                using var probeConn = new Npgsql.NpgsqlConnection(probeBuilder.ToString());
                                await probeConn.OpenAsync();
                                Console.WriteLine($"--- PROBE: Success! Found correct region: {region}");
                                confirmedPoolerHost = poolerHost;
                                break;
                            }
                            catch (Npgsql.PostgresException pex) when (pex.SqlState == "XX000") 
                            {
                                // Tenant not found in this region
                                continue; 
                            }
                            catch (Exception ex)
                            {
                                Console.WriteLine($"--- PROBE: Error {ex.Message}. Moving on.");
                            }
                        }
                    }
                    catch { /* DNS/Network error */ }
                }

                if (string.IsNullOrEmpty(confirmedPoolerHost))
                {
                     Console.WriteLine("--- DNS: Could not confirm any pooler region. Defaulting to sa-east-1.");
                     confirmedPoolerHost = "aws-0-sa-east-1.pooler.supabase.com";
                }

                Console.WriteLine($"--- CONFIG: Switching to IPv4 Pooler: {confirmedPoolerHost}");
                builderNpgsql.Host = confirmedPoolerHost; 
                builderNpgsql.Port = 6543;
                builderNpgsql.Username = $"{originalUser}.{projectId}";
                builderNpgsql.Options = $"reference={projectId}";
            }
            else
            {
                Console.WriteLine("--- DNS: Host format not recognized for automatic pooler fallback.");
            }
        }
    }
    catch (Exception ex) { Console.WriteLine($"--- DNS: Failed to resolve host: {ex.Message}"); }

    connectionString = builderNpgsql.ToString();
    Console.WriteLine($"--- CONFIG: Connection String Host set to: {builderNpgsql.Host}");
}

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString, o => o.EnableRetryOnFailure()));

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        policy => policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

var app = builder.Build();

// Log the connection string for debugging
var loggerForDebug = app.Services.GetRequiredService<ILogger<Program>>();
var connectionStringForDebug = Environment.GetEnvironmentVariable("DB_CONNECTION_STRING");
loggerForDebug.LogInformation("--- DEBUG: Reading environment variable DB_CONNECTION_STRING.");
loggerForDebug.LogInformation("--- DEBUG: Value is: '{ConnectionString}'", connectionStringForDebug);

// Automatically apply EF Core migrations on startup
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<AppDbContext>();
        context.Database.Migrate();
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while migrating the database.");
        // Decide if you want to stop the application on migration failure
    }
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");
app.UseStaticFiles();
app.UseAuthorization();

app.MapControllers();

app.Run();
