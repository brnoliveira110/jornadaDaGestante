using backend.Data;
using backend.Services;
using backend.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// 1. AppSec: Configuração de CORS restritiva
// Em produção, as origens devem vir do appsettings/env vars.
// Ex: "AllowedOrigins": ["https://meuapp.com"]
var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>() ?? Array.Empty<string>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("ProductionCors", policy => 
        policy.WithOrigins(allowedOrigins)
              .AllowAnyMethod()
              .AllowAnyHeader());
              
    options.AddPolicy("AllowAll", policy => 
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader());
});

// 2. Injeção de Dependência (Camadas)
builder.Services.AddScoped<IUserService, UserService>();

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// 3. Database: Abstração da lógica de conexão
string connectionString = GetConnectionString(builder.Configuration);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

var app = builder.Build();

// 4. AppSec: Global Exception Handler
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/error");
    app.UseHsts();
    app.UseCors("ProductionCors");
}
else 
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.UseCors("AllowAll");

    // Mantendo migração automática apenas em ambiente de desenvolvimento para facilitar
    using (var scope = app.Services.CreateScope())
    {
        try {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            db.Database.Migrate();
        } catch (Exception ex) {
            Console.WriteLine($"Migration failed: {ex.Message}");
        }
    }
}

app.UseAuthorization();

app.MapControllers();
app.MapGet("/health", () => Results.Ok("Healthy"));

app.Run();

// Helper method para manter o código limpo
static string GetConnectionString(IConfiguration configuration)
{
    // 1. Tenta DATABASE_URL (Heroku/Render style)
    var databaseUrl = Environment.GetEnvironmentVariable("DATABASE_URL");
    if (!string.IsNullOrEmpty(databaseUrl))
    {
        try 
        {
            var uri = new Uri(databaseUrl);
            var userInfo = uri.UserInfo.Split(':');
            return $"Host={uri.Host};Port={uri.Port};Database={uri.AbsolutePath.TrimStart('/')};Username={userInfo[0]};Password={userInfo[1]};SSL Mode=Require;Trust Server Certificate=true";
        }
        catch
        {
            return databaseUrl; // Retorna raw se falhar parse (pode ser connection string direta)
        }
    }

    // 2. Tenta variáveis discretas (Docker Compose style)
    var host = Environment.GetEnvironmentVariable("DB_HOST");
    if (!string.IsNullOrEmpty(host))
    {
        var dbName = Environment.GetEnvironmentVariable("DB_NAME");
        var user = Environment.GetEnvironmentVariable("DB_USER");
        var password = Environment.GetEnvironmentVariable("DB_PASSWORD");
        var port = Environment.GetEnvironmentVariable("DB_PORT") ?? "5432";
        return $"Host={host};Port={port};Database={dbName};Username={user};Password={password}";
    }

    // 3. Fallback para appsettings.json
    return configuration.GetConnectionString("DefaultConnection") ?? "";
}
