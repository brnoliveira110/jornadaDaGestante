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
        
        // Example: If Primitive collections are not automatically supported in simpler SQLite scenarios
        // .NET 8 defaults to simple JSON serialization for primitive lists in some cases,
        // but explicit conversion is safer for 'RequestedExams' if needed.
        // For now relying on default behavior of .NET 8/10.
    }
}
