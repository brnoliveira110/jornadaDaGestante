using backend.DTOs;

namespace backend.Interfaces;

public interface IConsultationService
{
    Task<IEnumerable<ConsultationResponseDto>> GetAllByPatientAsync(Guid patientId);
    Task<ConsultationResponseDto?> GetByIdAsync(Guid id);
    Task<ConsultationResponseDto> CreateAsync(ConsultationCreateDto dto);
    Task UpdateAsync(Guid id, ConsultationCreateDto dto);
}
