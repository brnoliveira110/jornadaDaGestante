using System.ComponentModel.DataAnnotations;
using backend.Models;

namespace backend.DTOs;

public class UserCreateDto
{
    [Required(ErrorMessage = "O nome é obrigatório")]
    [StringLength(100, MinimumLength = 3)]
    public string Name { get; set; } = string.Empty;

    public UserRole Role { get; set; }
    public string? Crm { get; set; }
    public string? Specialty { get; set; }
    public string? AvatarUrl { get; set; }
}
