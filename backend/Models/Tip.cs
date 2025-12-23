using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public class Tip
{
    public Guid Id { get; set; }
    public int Month { get; set; }
    public string Category { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string ReadTime { get; set; } = string.Empty;
}
