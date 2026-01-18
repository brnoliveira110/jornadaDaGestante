using backend.Data;
using backend.DTOs;
using backend.Interfaces;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class UserService : IUserService
{
    private readonly AppDbContext _context;

    public UserService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<UserResponseDto>> GetAllAsync()
    {
        var users = await _context.Users.ToListAsync();
        return users.Select(u => new UserResponseDto 
        { 
            Id = u.Id, 
            Name = u.Name, 
            Role = u.Role.ToString(),
            AvatarUrl = u.AvatarUrl
        });
    }

    public async Task<UserResponseDto?> GetByIdAsync(Guid id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return null;

        return new UserResponseDto 
        { 
            Id = user.Id, 
            Name = user.Name, 
            Role = user.Role.ToString(),
            AvatarUrl = user.AvatarUrl
        };
    }

    public async Task<UserResponseDto> CreateAsync(UserCreateDto dto)
    {
        // Aqui você pode adicionar validações de negócio (ex: verificar CRM duplicado)
        
        var user = new User
        {
            Id = Guid.NewGuid(),
            Name = dto.Name,
            Role = dto.Role,
            Crm = dto.Crm,
            Specialty = dto.Specialty,
            AvatarUrl = dto.AvatarUrl
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return new UserResponseDto { Id = user.Id, Name = user.Name, Role = user.Role.ToString(), AvatarUrl = user.AvatarUrl };
    }

    public async Task UpdateAsync(Guid id, UserCreateDto dto)
    {
        var existingUser = await _context.Users.FindAsync(id);
        if (existingUser == null) throw new KeyNotFoundException("User not found");

        existingUser.Name = dto.Name;
        existingUser.Role = dto.Role;
        existingUser.Crm = dto.Crm;
        existingUser.Specialty = dto.Specialty;
        if (!string.IsNullOrEmpty(dto.AvatarUrl)) existingUser.AvatarUrl = dto.AvatarUrl;

        _context.Entry(existingUser).State = EntityState.Modified;
        await _context.SaveChangesAsync();
    }
}
