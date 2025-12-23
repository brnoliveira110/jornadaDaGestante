using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public class Vaccine
{
    public Guid Id { get; set; }
    public Guid PatientId { get; set; }

    [Required]
    public string Name { get; set; } = string.Empty;
    public int Dose { get; set; }
    public int TotalDoses { get; set; }
    public DateTime? DateAdministered { get; set; }
    
    public VaccineStatus Status { get; set; }
    
    public string? Notes { get; set; }
    
    public string? PrescribedBy { get; set; }
    public string? DoctorCrm { get; set; }
    public string? DigitalSignature { get; set; }
    public DateTime? RequestDate { get; set; }
}
