using System.ComponentModel.DataAnnotations;
using backend.Models;

namespace backend.DTOs;

public record ConsultationCreateDto
(
    [Required] Guid PatientId,
    [Required] DateTime Date,
    [Range(0, 45)] int GestationalAgeWeeks,
    double? UterineHeight,
    string? BloodPressure,
    int? FetalHeartRate,
    double CurrentWeight,
    bool Edema,
    string? Notes,
    string? Prescription,
    List<string>? RequestedExams,
    ConsultationStatus Status
);

public record ConsultationResponseDto : ConsultationCreateDto
{
    public Guid Id { get; init; }
    
    public ConsultationResponseDto(
        Guid PatientId, 
        DateTime Date, 
        int GestationalAgeWeeks, 
        double? UterineHeight, 
        string? BloodPressure, 
        int? FetalHeartRate, 
        double CurrentWeight, 
        bool Edema, 
        string? Notes, 
        string? Prescription, 
        List<string>? RequestedExams, 
        ConsultationStatus Status
    ) : base(PatientId, Date, GestationalAgeWeeks, UterineHeight, BloodPressure, FetalHeartRate, CurrentWeight, Edema, Notes, Prescription, RequestedExams, Status) { }
}
