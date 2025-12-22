using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public class User
{
    public Guid Id { get; set; }
    
    [Required]
    public string Name { get; set; } = string.Empty;
    
    public UserRole Role { get; set; }
    public string? AvatarUrl { get; set; }
    
    // Doctor specific
    public string? Crm { get; set; }
    public string? Specialty { get; set; }
    public string? Titles { get; set; }
}
