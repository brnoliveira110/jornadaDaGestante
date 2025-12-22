using backend.Data;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;
using System.Net;
using System.Net.Sockets;
using Npgsql;
using System.IO;

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
var rawConnectionString = builder.Configuration.GetConnectionString("DefaultConnection");

// Fallback to DB_CONNECTION_STRING if not found (common in Render/Docker)
if (string.IsNullOrWhiteSpace(rawConnectionString))
{
    rawConnectionString = Environment.GetEnvironmentVariable("DB_CONNECTION_STRING");
}

// Helper function to force IPv4 resolution for Render compatibility
static string ResolveHostToIpv4(string connectionString)
{
    if (string.IsNullOrWhiteSpace(connectionString))
        return connectionString;

    try 
    {
        var builder = new NpgsqlConnectionStringBuilder(connectionString);
        
        // 1. Try to resolve the current host to IPv4
        bool isIpv4 = false;
        if (IPAddress.TryParse(builder.Host, out var ipAddr))
        {
             isIpv4 = ipAddr.AddressFamily == AddressFamily.InterNetwork;
        }
        
        if (!isIpv4)
        {
            Console.WriteLine($"--- DNS: Resolving host {builder.Host} to IPv4...");
            try 
            {
                var addresses = Dns.GetHostAddresses(builder.Host!);
                var ipv4 = addresses.FirstOrDefault(ip => ip.AddressFamily == AddressFamily.InterNetwork);
                if (ipv4 != null)
                {
                    Console.WriteLine($"--- DNS: Resolved to {ipv4}");
                    builder.Host = ipv4.ToString();
                    return builder.ToString();
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"--- DNS Resolution failed: {ex.Message}");
            }
        }
        else
        {
            return connectionString;
        }

        // 2. If IPv4 failed and it's Supabase, try Regional Poolers
        if (builder.Host != null && builder.Host.Contains("supabase.co"))
        {
            Console.WriteLine("--- DNS: No IPv4 address found for Supabase host. Attempting fallback to Regional Poolers (IPv4 compatible)...");

            string projectRef = "";
            var parts = builder.Host.Split('.');
            if (parts.Length >= 4 && parts[0] == "db")
            {
                // Format: db.[ref].supabase.co
                projectRef = parts[1];
            }
            else
            {
                Console.WriteLine("--- Could not extract Project Ref from host. Returning original.");
                return connectionString;
            }

            // Common Supabase regions to probe
            var regions = new[] { 
                "sa-east-1",  // São Paulo (Prioritized for this user)
                "us-east-1",  // N. Virginia (Common default)
                "eu-central-1", // Frankfurt
                "ap-southeast-1", // Singapore
                "us-west-1",
                "eu-west-1",
                "eu-west-2",
                "eu-west-3"
            };

            foreach (var region in regions)
            {
                var poolerHost = $"aws-0-{region}.pooler.supabase.com";
                Console.WriteLine($"--- Probing Pooler: {poolerHost} (Port 6543)...");

                try
                {
                    // Construct pooler connection string
                    var poolerBuilder = new NpgsqlConnectionStringBuilder(connectionString)
                    {
                        Host = poolerHost,
                        Port = 6543, // Pooler port for session/transaction
                        Pooling = false, // Disable pooling for the probe
                        Timeout = 3, // Fast fail
                    };

                    // Pooler username must be [user].[project_ref] if not already
                    if (!string.IsNullOrEmpty(poolerBuilder.Username) && !poolerBuilder.Username.Contains(projectRef))
                    {
                        poolerBuilder.Username = $"{poolerBuilder.Username}.{projectRef}";
                    }

                    using (var conn = new NpgsqlConnection(poolerBuilder.ToString()))
                    {
                        conn.Open(); // Will throw if fails
                    }

                    Console.WriteLine($"--- SUCCESS: Connected to {region} pooler!");
                    
                    // Return the working connection string with correct settings
                    poolerBuilder.Pooling = new NpgsqlConnectionStringBuilder(connectionString).Pooling; // Restore original pooling setting
                    poolerBuilder.Timeout = 15;

                    return poolerBuilder.ToString();
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"--- Probe failed for {region}: {ex.Message}");
                }
            }
            
            // If we get here, all probes failed.
            Console.WriteLine("--- FATAL: Could not connect to any Supabase Regional Pooler. Please check your DB credentials.");
            
            // Print the original helper message as a last resort
             var message = $"\n\nFATAL ERROR: The host '{builder.Host}' resolved to IPv6 addresses only.\n" +
                           "Please update your DB_CONNECTION_STRING in Render to use the 'Session Pooler' connection string.\n" +
                           "Format: 'postgres://[user].[project]:[pass]@aws-0-[region].pooler.supabase.com:6543/postgres'\n\n";
             Console.WriteLine(message);
        }
        else 
        {
             Console.WriteLine("--- DNS: No IPv4 address found. Using original host.");
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"--- DNS/Fallback Error: {ex.Message}. Returning original connection string.");
    }
    return connectionString;
}

// Clean up the string (remove quotes if present from env var) and handle null
rawConnectionString = (rawConnectionString ?? "").Trim().Trim('"').Trim('\'');

// Support URI-style connection strings by converting them
if (!string.IsNullOrWhiteSpace(rawConnectionString) && 
    (rawConnectionString.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase) || 
     rawConnectionString.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase)))
{
    Console.WriteLine("--- Notice: Converting URI-style connection string to standard format.");
    try
    {
        // Use a manual parser to be more lenient with formatting (e.g., handling brackets in password)
        var tempUri = rawConnectionString;
        var schemeEnd = tempUri.IndexOf("://");
        if (schemeEnd > 0) tempUri = tempUri.Substring(schemeEnd + 3);

        string dbPart = "postgres"; // default
        string hostPart = "";
        int port = 5432;
        string username = "";
        string password = "";

        // Extract Database
        var slashIndex = tempUri.IndexOf('/');
        if (slashIndex >= 0)
        {
            var dbSegment = tempUri.Substring(slashIndex + 1);
            var qMark = dbSegment.IndexOf('?');
            dbPart = qMark > 0 ? dbSegment.Substring(0, qMark) : dbSegment;
            tempUri = tempUri.Substring(0, slashIndex);
        }

        // Extract UserInfo and Host
        var atIndex = tempUri.LastIndexOf('@');
        if (atIndex > 0)
        {
            var userInfo = tempUri.Substring(0, atIndex);
            hostPart = tempUri.Substring(atIndex + 1);

            // Parse UserInfo
            var colonIndex = userInfo.IndexOf(':');
            if (colonIndex >= 0)
            {
                username = userInfo.Substring(0, colonIndex);
                password = userInfo.Substring(colonIndex + 1);
                
                // Fix common mistake: brackets around password
                if (password.StartsWith("[") && password.EndsWith("]"))
                {
                    Console.WriteLine("--- Notice: Detected brackets in password. Removing them.");
                    password = password.Substring(1, password.Length - 2);
                }
                
                // Decode password
                password = System.Net.WebUtility.UrlDecode(password);
            }
            else
            {
                username = userInfo;
            }
        }
        else
        {
            hostPart = tempUri; // No auth info
        }

        // Parse Host/Port
        var portColon = hostPart.LastIndexOf(':');
        // Check if colon is for port (not inside IPv6 brackets)
        var endBracket = hostPart.LastIndexOf(']');
        if (portColon > 0 && portColon > endBracket)
        {
             if (int.TryParse(hostPart.Substring(portColon + 1), out int p))
             {
                 port = p;
                 hostPart = hostPart.Substring(0, portColon);
             }
        }

        var npgsqlBuilder = new NpgsqlConnectionStringBuilder
        {
            Host = hostPart,
            Port = port,
            Username = username,
            Password = password,
            Database = dbPart,
            SslMode = SslMode.Prefer 
        };
        rawConnectionString = npgsqlBuilder.ToString();
        Console.WriteLine("--- Notice: Conversion successful.");
    }
    catch (Exception ex)
    {
         Console.WriteLine($"--- Warning: Failed to parse connection string URI: {ex.Message}");
    }
}


var finalConnectionString = ResolveHostToIpv4(rawConnectionString);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(finalConnectionString, 
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
