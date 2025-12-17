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
        Password = userInfo.Length > 1 ? userInfo[1] : null,
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
            Console.WriteLine($"--- DNS: Resolved to IPv4: {ipv4Address}");
            builderNpgsql.Host = ipv4Address.ToString();
        }
        else
        {
            Console.WriteLine("--- DNS: No IPv4 address found for db host. Attempting fallback to Supabase IPv4 Pooler...");
            
            // Extract Project ID (e.g., db.abcdefg.supabase.co -> abcdefg)
            var hostParts = builderNpgsql.Host.Split('.');
            if (hostParts.Length >= 4 && hostParts[0] == "db" && hostParts[2] == "supabase" && hostParts[3] == "co")
            {
                var projectId = hostParts[1];
                var originalUser = builderNpgsql.Username;
                
                // Try sa-east-1 (likely for this user) and us-east-1 (fallback)
                var regions = new[] { "sa-east-1", "us-east-1" };
                bool poolerFound = false;

                foreach (var region in regions)
                {
                    var poolerHost = $"aws-0-{region}.pooler.supabase.com";
                    try
                    {
                        Console.WriteLine($"--- DNS: Checking pooler {poolerHost}...");
                        var poolerIps = await Dns.GetHostAddressesAsync(poolerHost);
                        var poolerIpv4 = poolerIps.FirstOrDefault(ip => ip.AddressFamily == System.Net.Sockets.AddressFamily.InterNetwork);
                        
                        if (poolerIpv4 != null)
                        {
                            Console.WriteLine($"--- CONFIG: Switching to IPv4 Pooler: {poolerHost} ({poolerIpv4})");
                            builderNpgsql.Host = poolerHost; 
                            builderNpgsql.Port = 5432; // Session mode
                            builderNpgsql.Username = $"{originalUser}.{projectId}";
                            poolerFound = true;
                            break;
                        }
                    }
                    catch { /* Ignore DNS failures for regions */ }
                }

                if (!poolerFound)
                {
                     Console.WriteLine("--- DNS: Could not find a reachable IPv4 pooler.");
                }
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
