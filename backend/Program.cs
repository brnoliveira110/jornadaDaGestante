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
        var userInfo = uri.UserInfo;
        string? username = null;
        string? password = null;

        if (!string.IsNullOrEmpty(userInfo))
        {
            var colonIndex = userInfo.IndexOf(':');
            if (colonIndex != -1)
            {
                username = userInfo.Substring(0, colonIndex);
                password = Uri.UnescapeDataString(userInfo.Substring(colonIndex + 1));
            }
            else
            {
                username = userInfo;
            }
        }
        
        var npgsqlBuilder = new NpgsqlConnectionStringBuilder
        {
            Host = uri.Host,
            Port = uri.Port > 0 ? uri.Port : 5432,
            Database = uri.AbsolutePath.Trim('/'),
            Username = username,
            Password = password,
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




// Check for IPv4 compatibility (Render/Supabase support)
try 
{
    connectionString = GetIpv4ConnectionString(connectionString);
}
catch (Exception ex)
{
    Console.WriteLine($"FATAL ERROR: {ex.Message}");
    // We let it crash here so the user sees the logs immediately
    throw; 
}

// Fix for Supabase Transaction Pooler (port 6543) which doesn't support PREPARE statements
// This is critical when the user sets the pooler connection string manually.
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
    if (string.IsNullOrWhiteSpace(builder.Host)) return connectionString;

    var isRender = Environment.GetEnvironmentVariable("RENDER") == "true";
    
    // SCENARIO 1: We are on Render, using a Supabase direct connection string.
    // This is the known failure case. We MUST switch to the pooler and should not even attempt a DNS lookup.
    bool isSupabaseDirectConnection = builder.Host.Contains("supabase.co") && builder.Port != 6543;
    if (isRender && isSupabaseDirectConnection)
    {
        Console.WriteLine("--- Platform: Detected Render environment with a Supabase direct connection. Attempting to switch to the IPv4 pooler automatically.");
        
        var supabaseRegion = Environment.GetEnvironmentVariable("SUPABASE_REGION")?.Trim();
        if (!string.IsNullOrWhiteSpace(supabaseRegion))
        {
            // AUTO-FIX LOGIC
            Console.WriteLine($"--- Config: Found SUPABASE_REGION '{supabaseRegion}'. Constructing Supabase Transaction Pooler connection string.");
            
            var originalHost = builder.Host;
            if (originalHost.StartsWith("db.") && builder.Username == "postgres")
            {
                var parts = originalHost.Split('.');
                if (parts.Length > 2)
                {
                    var projectRef = parts[1];
                    builder.Username = $"postgres.{projectRef}";
                    Console.WriteLine($"--- Config: Auto-adjusted username for pooler to '{builder.Username}'.");
                }
            }

            builder.Host = $"aws-0-{supabaseRegion}.pooler.supabase.com";
            builder.Port = 6543;
            builder.Pooling = true;
            builder.MaxAutoPrepare = 0;
            builder.NoResetOnClose = true;

            Console.WriteLine($"--- Config: Switched to Supabase Pooler. Host: {builder.Host}, User: {builder.Username}");
            return builder.ToString();
        }
        else 
        {
            // If we are in the known failure case and the auto-fix isn't possible,
            // throw the error immediately without trying a DNS lookup.
            var message = "\n================================================================================\n" +
                          "FATAL ERROR: Supabase Direct Connection (IPv6) is not supported on Render.\n\n" +
                          "You are using a direct connection string on Render, which will fail. You must use the Transaction Pooler.\n\n" +
                          "SOLUTION 1: Use the Supabase Transaction Pooler (IPv4) connection string.\n" +
                          "1. Go to Supabase Dashboard -> Project Settings -> Database -> Connection String -> URI -> Copy 'Transaction Pooler' mode.\n" +
                          "   It looks like: postgres://[user].[project]:[pass]@aws-0-[region].pooler.supabase.com:6543/postgres\n" +
                          "2. Update your Render Environment Variable 'DB_CONNECTION_STRING' with this value and redeploy.\n\n" +
                          "SOLUTION 2: Set the SUPABASE_REGION environment variable for an automatic fix.\n" +
                          "1. Add an environment variable to Render named 'SUPABASE_REGION' with your project's region (e.g., 'us-east-1').\n" +
                          "2. Redeploy. The application will automatically build the correct pooler address.\n" +
                          "================================================================================\n";
            throw new Exception(message);
        }
    }

    // SCENARIO 2: For any other case (including user-provided pooler strings), we must verify DNS.
    // On Render, this check is now a mandatory pass/fail.
    try
    {
        Console.WriteLine($"--- DNS: Verifying host '{builder.Host}' on port {builder.Port}.");
        
        if (IPAddress.TryParse(builder.Host, out var ipAddr) && ipAddr.AddressFamily == AddressFamily.InterNetwork)
        {
            Console.WriteLine($"--- DNS: Host '{builder.Host}' is already a valid IPv4 address: {ipAddr}");
            return connectionString;
        }

        var addresses = Dns.GetHostAddresses(builder.Host);
        var ipv4 = addresses.FirstOrDefault(ip => ip.AddressFamily == AddressFamily.InterNetwork);
        
        if (ipv4 != null)
        {
            Console.WriteLine($"--- DNS: Successfully resolved host '{builder.Host}' to IPv4 address {ipv4}");
            return connectionString;
        }
        
        // If we get here, no IPv4 address was found.
        Console.WriteLine($"--- DNS ERROR: No IPv4 address was found for host '{builder.Host}'.");
        if (isRender)
        {
            var error = "\n================================================================================\n" +
                        $"FATAL ERROR: The database host '{builder.Host}' did not resolve to an IPv4 address.\n\n" +
                        "Outbound connections on Render require an IPv4 address.\n\n" +
                        "Please check the following:\n" +
                        "1. Is the `DB_CONNECTION_STRING` environment variable set correctly in Render?\n" +
                        "2. Is the hostname a valid, publicly accessible IPv4 host?\n" +
                        "3. HINT: Supabase pooler hostnames typically start with `aws-0-`. Your current one is different. Please verify the hostname in your Supabase dashboard.\n" +
                        "================================================================================\n";
            throw new Exception(error);
        }
    }
    catch (Exception ex) 
    {
         // If DNS lookup itself fails (e.g., host not found)
         if (isRender)
         {
             throw new Exception($"FATAL: DNS lookup for host '{builder.Host}' failed in the Render environment. Please ensure the hostname is correct. Details: {ex.Message}", ex);
         }
         Console.WriteLine($"--- DNS Check Warning: {ex.Message}");
    }

    // If not on Render, we return the string and let it try, as the environment might support IPv6.
    Console.WriteLine("--- DNS: Check could not confirm an IPv4 address. Returning original connection string and letting the driver attempt connection.");
    return connectionString;
}
