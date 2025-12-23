using backend.Data;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure DbContext
// Prioritize Environment Variables for Docker/Render, fallback to appsettings
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
var host = Environment.GetEnvironmentVariable("DB_HOST");
if (!string.IsNullOrEmpty(host))
{
    var dbName = Environment.GetEnvironmentVariable("DB_NAME");
    var user = Environment.GetEnvironmentVariable("DB_USER");
    var password = Environment.GetEnvironmentVariable("DB_PASSWORD");
    var port = Environment.GetEnvironmentVariable("DB_PORT") ?? "5432";
    connectionString = $"Host={host};Port={port};Database={dbName};Username={user};Password={password}";
}

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

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
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");
// app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
