using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public class ExamResult
{
    public Guid Id { get; set; }
    public Guid PatientId { get; set; }

    [Required]
    public string Name { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public string? FileUrl { get; set; }
    
    public ExamType Type { get; set; }
    public ExamStatus Status { get; set; }
    
    public string? DoctorName { get; set; }
    public string? DoctorCrm { get; set; }
    public string? DigitalSignature { get; set; }
}
