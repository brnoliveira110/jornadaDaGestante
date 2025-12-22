using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AlertsController : ControllerBase
{
    private readonly AppDbContext _context;

    public AlertsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Alert>>> Get()
    {
        return await _context.Alerts.OrderByDescending(a => a.Date).ToListAsync();
    }
    
    [HttpGet("user/{userId}")]
    public async Task<ActionResult<IEnumerable<Alert>>> GetByUser(Guid userId)
    {
        return await _context.Alerts.Where(a => a.UserId == userId).OrderByDescending(a => a.Date).ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Alert>> Get(Guid id)
    {
        var item = await _context.Alerts.FindAsync(id);
        if (item == null) return NotFound();
        return item;
    }

    [HttpPost]
    public async Task<ActionResult<Alert>> Post(Alert item)
    {
        if (item.Id == Guid.Empty) item.Id = Guid.NewGuid();
        if (item.Date == default) item.Date = DateTime.UtcNow;
        
        _context.Alerts.Add(item);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = item.Id }, item);
    }

    [HttpPut("{id}/read")]
    public async Task<IActionResult> MarkAsRead(Guid id)
    {
        var item = await _context.Alerts.FindAsync(id);
        if (item == null) return NotFound();
        item.Read = true;
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
