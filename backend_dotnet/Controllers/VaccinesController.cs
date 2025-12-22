using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VaccinesController : ControllerBase
{
    private readonly AppDbContext _context;

    public VaccinesController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Vaccine>>> Get()
    {
        return await _context.Vaccines.ToListAsync();
    }
    
    [HttpGet("patient/{patientId}")]
    public async Task<ActionResult<IEnumerable<Vaccine>>> GetByPatient(Guid patientId)
    {
        return await _context.Vaccines.Where(v => v.PatientId == patientId).ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Vaccine>> Get(Guid id)
    {
        var item = await _context.Vaccines.FindAsync(id);
        if (item == null) return NotFound();
        return item;
    }

    [HttpPost]
    public async Task<ActionResult<Vaccine>> Post(Vaccine item)
    {
        if (item.Id == Guid.Empty) item.Id = Guid.NewGuid();
        _context.Vaccines.Add(item);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = item.Id }, item);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Put(Guid id, Vaccine item)
    {
        if (id != item.Id) return BadRequest();
        _context.Entry(item).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
