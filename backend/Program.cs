using backend.Data;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;
using System.Net;
using System.Net.Sockets;
using Npgsql;

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
    {
        return connectionString;
    }

    try 
    {
        var builder = new NpgsqlConnectionStringBuilder(connectionString);
        // If it's already an IP, skip
        if (IPAddress.TryParse(builder.Host, out _)) return connectionString;

        Console.WriteLine($"--- DNS: Resolving host {builder.Host} to IPv4...");
        // Use Dns.GetHostAddresses to avoid IPv6 resolution issues
        var addresses = Dns.GetHostAddresses(builder.Host!);
        
        // Find the first InterNetwork (IPv4) address
        var ipv4 = addresses.FirstOrDefault(ip => ip.AddressFamily == AddressFamily.InterNetwork);

        if (ipv4 != null)
        {
            Console.WriteLine($"--- DNS: Resolved to {ipv4}");
            builder.Host = ipv4.ToString();
            return builder.ToString();
        }
        Console.WriteLine("--- DNS: No IPv4 address found. Using original host.");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"--- DNS Error: {ex.Message}. Returning original connection string.");
    }
    return connectionString;
}

// Configure DbContext to use PostgreSQL
var rawConnectionString = builder.Configuration.GetConnectionString("DefaultConnection");

// Fallback to DB_CONNECTION_STRING if not found (common in Render/Docker)
if (string.IsNullOrWhiteSpace(rawConnectionString))
{
    rawConnectionString = Environment.GetEnvironmentVariable("DB_CONNECTION_STRING");
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
        var uri = new Uri(rawConnectionString);
        var userInfo = uri.UserInfo.Split(':');
        var npgsqlBuilder = new NpgsqlConnectionStringBuilder
        {
            Host = uri.Host,
            Port = uri.Port > 0 ? uri.Port : 5432,
            Username = userInfo.Length > 0 ? userInfo[0] : "",
            Password = userInfo.Length > 1 ? System.Net.WebUtility.UrlDecode(userInfo[1]) : "",
            Database = uri.AbsolutePath.TrimStart('/'),
            SslMode = SslMode.Prefer // Prefer SSL for external connections
        };
        rawConnectionString = npgsqlBuilder.ToString();
        Console.WriteLine("--- Notice: Conversion successful.");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"--- Warning: Failed to parse connection string URI: {ex.Message}");
    }
}


var ipv4ConnectionString = ResolveHostToIpv4(rawConnectionString);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(ipv4ConnectionString, 
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
app.UseStaticFiles();
app.UseAuthorization();

app.MapControllers();

app.Run();

async Task<string> TryFindWorkingConnection(string connectionString)
{
    // If empty, nothing to probe
    if (string.IsNullOrWhiteSpace(connectionString)) return connectionString;

    Console.WriteLine("Validating database connection...");
    if (await IsConnectionWorking(connectionString)) 
    {
        Console.WriteLine("Direct connection is working.");
        return connectionString;
    }
    
    Console.WriteLine("Direct connection failed. Attempting to fallback to Supabase poolers (IPv4 workarounds)...");

    var builder = new NpgsqlConnectionStringBuilder(connectionString);
    var originalHost = builder.Host;

    // Priority list of regions to try (sa-east-1 first for Brazil)
    var regions = new[] { 
        "sa-east-1", 
        "us-east-1", 
        "eu-central-1", 
        "ap-southeast-1",
        "us-west-1",
        "eu-west-1",
        "ap-northeast-1",
        "ap-northeast-2",
        "ap-southeast-2",
        "ca-central-1",
        "eu-west-2",
        "eu-west-3"
    };

    foreach (var region in regions)
    {
        var poolerHost = $"aws-0-{region}.pooler.supabase.com";
        // Try Session mode (port 5432) for compatibility
        builder.Host = poolerHost;
        builder.Port = 5432; 
        
        var candidate = builder.ToString();
        Console.WriteLine($"Testing connectivity to pooler: {poolerHost}...");
        
        if (await IsConnectionWorking(candidate))
        {
            Console.WriteLine($"Successfully connected via {poolerHost}! Updating connection string.");
            return candidate;
        }
    }
    
    Console.WriteLine("All fallback attempts failed. Returning original connection string.");
    return connectionString;
}

async Task<bool> IsConnectionWorking(string connString)
{
    try
    {
        var builder = new NpgsqlConnectionStringBuilder(connString);
        // Short timeout for probing
        builder.Timeout = 5; 
        using var conn = new NpgsqlConnection(builder.ToString());
        await conn.OpenAsync();
        return true;
    }
    catch (Exception ex)
    {
        // Nice to see why it failed
        Console.WriteLine($"Probe failed: {ex.Message}");
        return false;
    }
}
