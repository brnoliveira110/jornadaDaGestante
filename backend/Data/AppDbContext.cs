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

        // Npgsql maps List<string> to text[] native array by default.
        // No conversion needed unless we want to store as JSON text (which conflicts with current DB schema).
    }
}
