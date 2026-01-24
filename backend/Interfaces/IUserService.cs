using backend.DTOs;

namespace backend.Interfaces;

public interface IUserService
{
    Task<IEnumerable<UserResponseDto>> GetAllAsync();
    Task<UserResponseDto?> GetByIdAsync(Guid id);
    Task<UserResponseDto> CreateAsync(UserCreateDto dto);
    Task UpdateAsync(Guid id, UserCreateDto dto);
}
