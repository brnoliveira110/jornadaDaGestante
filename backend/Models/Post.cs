using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public class Post
{
    public Guid Id { get; set; }
    public string AuthorName { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public int Likes { get; set; }
    public DateTime Timestamp { get; set; }
    
    public List<Comment> Comments { get; set; } = new();
}

public class Comment
{
    public Guid Id { get; set; }
    public Guid PostId { get; set; }
    
    public string AuthorName { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
}
