using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CommunityController : ControllerBase
{
    private readonly AppDbContext _context;

    public CommunityController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Post>>> Get()
    {
        return await _context.Posts.Include(p => p.Comments).OrderByDescending(p => p.Timestamp).ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Post>> Get(Guid id)
    {
        var item = await _context.Posts.Include(p => p.Comments).FirstOrDefaultAsync(p => p.Id == id);
        if (item == null) return NotFound();
        return item;
    }

    [HttpPost]
    public async Task<ActionResult<Post>> CreatePost(Post item)
    {
        if (item.Id == Guid.Empty) item.Id = Guid.NewGuid();
        if (item.Timestamp == default) item.Timestamp = DateTime.UtcNow;
        
        _context.Posts.Add(item);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = item.Id }, item);
    }
    
    [HttpPost("{postId}/comments")]
    public async Task<ActionResult<Comment>> AddComment(Guid postId, Comment comment)
    {
        var post = await _context.Posts.FindAsync(postId);
        if (post == null) return NotFound();
        
        if (comment.Id == Guid.Empty) comment.Id = Guid.NewGuid();
        comment.PostId = postId;
        if (comment.Timestamp == default) comment.Timestamp = DateTime.UtcNow;
        
        _context.Comments.Add(comment);
        await _context.SaveChangesAsync();
        
        return Ok(comment);
    }
    
    [HttpPost("{id}/like")]
    public async Task<IActionResult> Like(Guid id)
    {
        var post = await _context.Posts.FindAsync(id);
        if (post == null) return NotFound();
        post.Likes++;
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
