using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TipsController : ControllerBase
{
    private readonly AppDbContext _context;

    public TipsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Tip>>> Get()
    {
        return await _context.Tips.ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Tip>> Get(Guid id)
    {
        var item = await _context.Tips.FindAsync(id);
        if (item == null) return NotFound();
        return item;
    }

    [HttpPost]
    public async Task<ActionResult<Tip>> Post(Tip item)
    {
        if (item.Id == Guid.Empty) item.Id = Guid.NewGuid();
        _context.Tips.Add(item);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = item.Id }, item);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Put(Guid id, Tip item)
    {
        if (id != item.Id) return BadRequest();
        _context.Entry(item).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
