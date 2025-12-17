using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public class Alert
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; } // Linked to specific user
    
    [Required]
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    
    public AlertType Type { get; set; }
    public DateTime Date { get; set; }
    public bool Read { get; set; }
    
    public AlertTargetRole TargetRole { get; set; }
}
