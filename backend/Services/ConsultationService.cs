using backend.Data;
using backend.DTOs;
using backend.Interfaces;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class ConsultationService : IConsultationService
{
    private readonly AppDbContext _context;

    public ConsultationService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<ConsultationResponseDto> CreateAsync(ConsultationCreateDto dto)
    {
        var patientExists = await _context.Users.AnyAsync(u => u.Id == dto.PatientId);
        if (!patientExists) throw new ArgumentException("Paciente não encontrada.");

        var consultation = new Consultation
        {
            Id = Guid.NewGuid(),
            PatientId = dto.PatientId,
            Date = dto.Date,
            GestationalAgeWeeks = dto.GestationalAgeWeeks,
            UterineHeight = dto.UterineHeight,
            BloodPressure = dto.BloodPressure,
            FetalHeartRate = dto.FetalHeartRate,
            CurrentWeight = dto.CurrentWeight,
            Edema = dto.Edema,
            Notes = dto.Notes ?? string.Empty,
            Prescription = dto.Prescription ?? string.Empty,
            RequestedExams = dto.RequestedExams ?? new List<string>(),
            Status = dto.Status
        };

        _context.Consultations.Add(consultation);
        await _context.SaveChangesAsync();

        return MapToDto(consultation);
    }

    public async Task<IEnumerable<ConsultationResponseDto>> GetAllByPatientAsync(Guid patientId)
    {
        var consultations = await _context.Consultations
            .Where(c => c.PatientId == patientId)
            .OrderByDescending(c => c.Date)
            .ToListAsync();

        return consultations.Select(MapToDto);
    }

    public async Task<ConsultationResponseDto?> GetByIdAsync(Guid id)
    {
        var consultation = await _context.Consultations.FindAsync(id);
        if (consultation == null) return null;
        return MapToDto(consultation);
    }

    public async Task UpdateAsync(Guid id, ConsultationCreateDto dto)
    {
        var consultation = await _context.Consultations.FindAsync(id);
        if (consultation == null) throw new KeyNotFoundException("Consulta não encontrada.");

        consultation.Date = dto.Date;
        consultation.GestationalAgeWeeks = dto.GestationalAgeWeeks;
        consultation.UterineHeight = dto.UterineHeight;
        consultation.BloodPressure = dto.BloodPressure;
        consultation.FetalHeartRate = dto.FetalHeartRate;
        consultation.CurrentWeight = dto.CurrentWeight;
        consultation.Edema = dto.Edema;
        consultation.Notes = dto.Notes ?? string.Empty;
        consultation.Prescription = dto.Prescription ?? string.Empty;
        consultation.RequestedExams = dto.RequestedExams ?? new List<string>();
        consultation.Status = dto.Status;
        // PatientId is generally stable, not updating it here to avoid moving consultations between patients unintentionally.

        await _context.SaveChangesAsync();
    }

    private static ConsultationResponseDto MapToDto(Consultation c)
    {
        return new ConsultationResponseDto(
            c.PatientId, c.Date, c.GestationalAgeWeeks, c.UterineHeight,
            c.BloodPressure, c.FetalHeartRate, c.CurrentWeight, c.Edema,
            c.Notes, c.Prescription, c.RequestedExams, c.Status
        ) { Id = c.Id };
    }
}
