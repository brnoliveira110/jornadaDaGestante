using backend.Data;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;
using Npgsql;
using System.IO;
using System.Net;
using System.Net.Sockets;

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
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

// Fallback to DB_CONNECTION_STRING if not found (common in Render/Docker)
if (string.IsNullOrWhiteSpace(connectionString))
{
    connectionString = Environment.GetEnvironmentVariable("DB_CONNECTION_STRING");
}

// Clean up the string (remove quotes if present from env var)
connectionString = (connectionString ?? "").Trim().Trim('"').Trim('\'');

// Helper to parse URI-style connection strings (postgres://...) commonly used in Render
if (!string.IsNullOrWhiteSpace(connectionString) && 
    (connectionString.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase) || 
     connectionString.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase)))
{
    try
    {
        var uri = new Uri(connectionString);
        var userInfo = uri.UserInfo.Split(':');
        var npgsqlBuilder = new NpgsqlConnectionStringBuilder
        {
            Host = uri.Host,
            Port = uri.Port > 0 ? uri.Port : 5432,
            Database = uri.AbsolutePath.Trim('/'),
            Username = userInfo.Length > 0 ? userInfo[0] : null,
            Password = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : null,
            SslMode = SslMode.Prefer
        };

        // Fix common mistake: brackets around password in env vars
        if (npgsqlBuilder.Password != null && npgsqlBuilder.Password.StartsWith("[") && npgsqlBuilder.Password.EndsWith("]"))
        {
            npgsqlBuilder.Password = npgsqlBuilder.Password.Substring(1, npgsqlBuilder.Password.Length - 2);
        }

        connectionString = npgsqlBuilder.ToString();
    }
    catch (Exception ex)
    {
         Console.WriteLine($"--- Warning: Failed to parse connection string URI: {ex.Message}");
    }
}


connectionString = GetIpv4ConnectionString(connectionString);

// Fix for Supabase Transaction Pooler (port 6543) which doesn't support PREPARE statements
var finalBuilder = new NpgsqlConnectionStringBuilder(connectionString);
if (finalBuilder.Port == 6543)
{
    finalBuilder.MaxAutoPrepare = 0;
    connectionString = finalBuilder.ToString();
}

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString, 
                      o => o.EnableRetryOnFailure()));

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        policy => policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

var app = builder.Build();



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
// Ensure wwwroot exists to avoid StaticFileMiddleware warnings
var wwwroot = Path.Combine(app.Environment.ContentRootPath, "wwwroot");
if (!Directory.Exists(wwwroot))
{
    Directory.CreateDirectory(wwwroot);
}
app.UseStaticFiles();
app.UseAuthorization();

app.MapControllers();

app.Run();

// Helper to ensure IPv4 connection (Render does not support IPv6 for outbound yet)
static string GetIpv4ConnectionString(string connectionString)
{
    if (string.IsNullOrWhiteSpace(connectionString)) return connectionString;

    try
    {
        var builder = new NpgsqlConnectionStringBuilder(connectionString);
        
        // 1. Check if Host resolves to IPv4
        bool isIpv4 = false;
        if (IPAddress.TryParse(builder.Host, out var ipAddr))
        {
             isIpv4 = ipAddr.AddressFamily == AddressFamily.InterNetwork;
        }

        if (isIpv4) return connectionString;

        Console.WriteLine($"--- DNS: Checking if host {builder.Host} resolves to IPv4...");
        try 
        {
            var addresses = Dns.GetHostAddresses(builder.Host!);
            var ipv4 = addresses.FirstOrDefault(ip => ip.AddressFamily == AddressFamily.InterNetwork);
            if (ipv4 != null)
            {
                // Found an IPv4 address, strictly speaking we could use it, 
                // but for Supabase it's better to use the Pooler if it's the direct host.
                // However, let's just return if we found an IPv4 to be safe.
                Console.WriteLine($"--- DNS: Resolved {builder.Host} to {ipv4}");
                // If it's NOT a supabase host, or if it is but has an A record, we might be fine.
                // But generally Supabase direct is IPv6 only.
            }
            else
            {
                Console.WriteLine("--- DNS: No IPv4 address found.");
            }
        }
        catch {}

        // 2. Specialized Supabase Handling
        if (builder.Host != null && builder.Host.Contains("supabase.co"))
        {
            // Check if we are potentially on the IPv6 direct connection
            // We'll aggressively search for a pooler content if we suspect issues.
            
            string projectRef = "";
            var parts = builder.Host.Split('.');
            if (parts.Length >= 4 && parts[0] == "db")
            {
                projectRef = parts[1];
            }

            if (!string.IsNullOrEmpty(projectRef))
            {
                Console.WriteLine("--- Supabase detected. Probing Regional Poolers for IPv4 connectivity...");
                // Lista expandida de regiões e timeout maior
                var regions = new[] { 
                    "us-east-1", "us-east-2", "us-west-1", "us-west-2",
                    "eu-central-1", "eu-west-1", "eu-west-2", "eu-west-3", "eu-north-1",
                    "ap-southeast-1", "ap-southeast-2", "ap-northeast-1", "ap-northeast-2", "ap-south-1",
                    "sa-east-1", "ca-central-1" 
                };
                
                foreach (var region in regions)
                {
                    var poolerHost = $"aws-0-{region}.pooler.supabase.com";
                    try 
                    {
                        // Lightweight test
                        var probeBuilder = new NpgsqlConnectionStringBuilder(connectionString)
                        {
                            Host = poolerHost,
                            Port = 6543,
                            Pooling = false,
                            Timeout = 5 // Aumentado para 5 segundos para evitar falsos negativos no Render
                        };
                        
                        // Fix username for pooler
                        if (!probeBuilder.Username.Contains(projectRef))
                        {
                            probeBuilder.Username = $"{probeBuilder.Username}.{projectRef}";
                        }

                        using var conn = new NpgsqlConnection(probeBuilder.ToString());
                        conn.Open();
                        
                        Console.WriteLine($"--- SUCCESS: Connected to {region} pooler!");
                        
                        // Apply to main builder
                        builder.Host = poolerHost;
                        builder.Port = 6543;
                        builder.Username = probeBuilder.Username;
                        return builder.ToString();
                    }
                    catch 
                    { 
                        // Continue probing
                    }
                }
            }
            
            Console.WriteLine("--- WARNING: Could not auto-connect to Supabase Pooler. Ensure DB_CONNECTION_STRING is correct.");
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"--- Warning during IPv4 check: {ex.Message}");
    }

    return connectionString;
}
