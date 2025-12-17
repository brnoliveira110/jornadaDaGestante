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

// Helper function to force IPv4 resolution for Render compatibility
static string ResolveHostToIpv4(string connectionString)
{
    try 
    {
        var builder = new NpgsqlConnectionStringBuilder(connectionString);
        // If it's already an IP, skip
        if (IPAddress.TryParse(builder.Host, out _)) return connectionString;

        Console.WriteLine($"--- DNS: Resolving host {builder.Host} to IPv4...");
        var hostEntry = Dns.GetHostEntry(builder.Host!);
        
        // Find the first InterNetwork (IPv4) address
        var ipv4 = hostEntry.AddressList.FirstOrDefault(ip => ip.AddressFamily == AddressFamily.InterNetwork);

        if (ipv4 != null)
        {
            Console.WriteLine($"--- DNS: Resolved to {ipv4}");
            builder.Host = ipv4.ToString();
            return builder.ToString();
        }
        Console.WriteLine("--- DNS: No IPv4 and address found. Using original host.");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"--- DNS Error: {ex.Message}");
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
