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



// Force Supabase Pooler Fallback/Check
try 
{
    connectionString = GetIpv4ConnectionString(connectionString);
}
catch (Exception ex)
{
    Console.WriteLine($"FATAL: Failed to resolve valid connection string: {ex.Message}");
    throw; // Stop startup if we can't get a valid connection
}

// Fix for Supabase Transaction Pooler (port 6543) which doesn't support PREPARE statements
var finalBuilder = new NpgsqlConnectionStringBuilder(connectionString);
if (finalBuilder.Port == 6543)
{
    Console.WriteLine("--- Config: Detected Transaction Pooler (Port 6543). Disabling Prepared Statements.");
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
// Helper to ensure IPv4 connection (Render does not support IPv6 for outbound yet)
static string GetIpv4ConnectionString(string connectionString)
{
    if (string.IsNullOrWhiteSpace(connectionString)) return connectionString;

    var builder = new NpgsqlConnectionStringBuilder(connectionString);

    // 1. Check if Host resolves to IPv4 naturally
    try
    {
        if (IPAddress.TryParse(builder.Host, out var ipAddr))
        {
             if (ipAddr.AddressFamily == AddressFamily.InterNetwork) return connectionString;
        }

        Console.WriteLine($"--- DNS: Checking if host {builder.Host} resolves to IPv4...");
        var addresses = Dns.GetHostAddresses(builder.Host!);
        var ipv4 = addresses.FirstOrDefault(ip => ip.AddressFamily == AddressFamily.InterNetwork);
        if (ipv4 != null)
        {
            Console.WriteLine($"--- DNS: Resolved {builder.Host} to {ipv4}");
            // Found strict IPv4, acceptable to use.
            // However, if it IS Supabase, we still might prefer the pooler for connection stability 
            // on strict IPv4 environments (like Render) but let's stick to simple resolution first.
            // If direct connection fails later, we can't retry here easily. 
            // But usually Dns.GetHostAddresses returns what is reachable. 
            // For Supabase, direct IPv4 is NOT available usually, so this block likely won't hit for db.xxx.supabase.co
        }
        else
        {
            Console.WriteLine("--- DNS: No IPv4 address found.");
        }
    }
    catch (Exception ex) 
    {
         Console.WriteLine($"--- DNS Check Warning: {ex.Message}");
    }

    // 2. Specialized Supabase Handling
    if (builder.Host != null && builder.Host.Contains("supabase.co"))
    {
        string projectRef = "";
        var parts = builder.Host.Split('.');
        if (parts.Length >= 4 && parts[0] == "db")
        {
            projectRef = parts[1];
        }

        if (!string.IsNullOrEmpty(projectRef))
        {
            Console.WriteLine("--- Supabase detected. Probing Regional Poolers for IPv4 connectivity...");
            
            // Prioritized regions
            var regions = new[] { 
                "sa-east-1",     // São Paulo (Primary)
                "us-east-1",     // N. Virginia
                "eu-central-1",  // Frankfurt
                "ap-southeast-1",// Singapore
                "us-west-1", "eu-west-1", "eu-west-2", "eu-west-3"
            };
            
            foreach (var region in regions)
            {
                var poolerHost = $"aws-0-{region}.pooler.supabase.com";
                Console.WriteLine($"--- Probing: {poolerHost}...");

                try 
                {
                    // Lightweight test builder
                    var probeBuilder = new NpgsqlConnectionStringBuilder(connectionString)
                    {
                        Host = poolerHost,
                        Port = 6543,
                        Pooling = false,
                        Timeout = 5
                    };
                    
                    // Supabase Pooler requires [user].[project_ref] as username
                    if (!probeBuilder.Username.Contains(projectRef))
                    {
                        probeBuilder.Username = $"{probeBuilder.Username}.{projectRef}";
                    }

                    using var conn = new NpgsqlConnection(probeBuilder.ToString());
                    conn.Open();
                    
                    Console.WriteLine($"--- SUCCESS: Connected to {region} pooler!");
                    
                    // Apply to main builder to return the working config
                    builder.Host = poolerHost;
                    builder.Port = 6543;
                    builder.Username = probeBuilder.Username;
                    
                    // Do NOT set MaxAutoPrepare here, done in main block
                    return builder.ToString();
                }
                catch (Exception ex)
                { 
                    Console.WriteLine($"--- Probe failed for {region}: {ex.Message}");
                }
            }
            
            // If loop finishes, we failed to connect to ANY pooler.
            // Throwing here is better than returning the broken IPv6 string, 
            // because it gives a clear error message in the logs.
            throw new Exception("Supabase Reachability Error: Could not connect to any IPv4 Regional Pooler. Render requires IPv4.");
        }
    }

    return connectionString;
}
