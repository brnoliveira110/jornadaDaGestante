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

    // 1. Check if Host resolves to IPv4 naturally or is already an IP
    try
    {
        // If it's already an IP, we are good.
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
            return connectionString;
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

    // 2. Identify if this is a Supabase IPv6-only host failure
    if (builder.Host != null && builder.Host.Contains("supabase.co"))
    {
        // We failed to find an IPv4 address for a Supabase host.
        // This is the specific Render vs Supabase Direct issue.
        
        var message = "\n================================================================================\n" +
                      "FATAL ERROR: Supabase Direct Connection (IPv6) failed on this environment (Render).\n\n" +
                      "SOLUTION: You must use the Supabase Transaction Pooler (IPv4) connection string.\n" +
                      "1. Go to Supabase Dashboard -> Project Settings -> Database -> Connection String -> URI -> Copy 'Transaction Pooler' mode.\n" +
                      "   It looks like: postgres://[user].[project]:[pass]@aws-0-[region].pooler.supabase.com:6543/postgres\n" +
                      "2. Update your Render Environment Variable 'DB_CONNECTION_STRING' with this value.\n" +
                      "3. Redeploy.\n" +
                      "================================================================================\n";
        
        // Throwing explicitly to stop the noisy "Network Unreachable" stack traces
        throw new Exception(message);
    }

    return connectionString;
}
