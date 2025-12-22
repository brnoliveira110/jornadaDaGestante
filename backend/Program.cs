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
app.UseStaticFiles();
app.UseAuthorization();

app.MapControllers();

app.Run();
