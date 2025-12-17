using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public class Consultation
{
    public Guid Id { get; set; }
    
    // Foreign Key
    public Guid PatientId { get; set; }

    public DateTime Date { get; set; }
    public int GestationalAgeWeeks { get; set; }
    public double? UterineHeight { get; set; }
    public string? BloodPressure { get; set; }
    public int? FetalHeartRate { get; set; }
    public double CurrentWeight { get; set; }
    public bool Edema { get; set; }
    
    public string Notes { get; set; } = string.Empty;
    public string Prescription { get; set; } = string.Empty;
    
    // SQLite support for primitive collections usually works in simple cases or requires configuring 
    // serialization. If this fails, we will wrap in a JSON string.
    public List<string> RequestedExams { get; set; } = new();
    
    public ConsultationStatus Status { get; set; }
}
