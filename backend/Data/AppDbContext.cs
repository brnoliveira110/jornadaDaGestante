using Microsoft.EntityFrameworkCore;
using backend.Models;

namespace backend.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) {}

    public DbSet<User> Users { get; set; }
    public DbSet<PregnancyData> Pregnancies { get; set; }
    public DbSet<Consultation> Consultations { get; set; }
    public DbSet<Vaccine> Vaccines { get; set; }
    public DbSet<ExamResult> Exams { get; set; }
    public DbSet<Tip> Tips { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Conversão de List<string> <-> JSON String
        modelBuilder.Entity<Consultation>()
            .Property(c => c.RequestedExams)
            .HasConversion(
                v => System.Text.Json.JsonSerializer.Serialize(v, (System.Text.Json.JsonSerializerOptions?)null),
                v => System.Text.Json.JsonSerializer.Deserialize<List<string>>(v, (System.Text.Json.JsonSerializerOptions?)null) ?? new List<string>()
            );
    }
}
