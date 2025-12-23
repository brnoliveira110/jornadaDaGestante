using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ConsultationsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ConsultationsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Consultation>>> Get()
    {
        return await _context.Consultations.ToListAsync();
    }
    
    [HttpGet("patient/{patientId}")]
    public async Task<ActionResult<IEnumerable<Consultation>>> GetByPatient(Guid patientId)
    {
        return await _context.Consultations.Where(c => c.PatientId == patientId).ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Consultation>> Get(Guid id)
    {
        var item = await _context.Consultations.FindAsync(id);
        if (item == null) return NotFound();
        return item;
    }

    [HttpPost]
    public async Task<ActionResult<Consultation>> Post(Consultation item)
    {
        if (item.Id == Guid.Empty) item.Id = Guid.NewGuid();
        _context.Consultations.Add(item);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = item.Id }, item);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Put(Guid id, Consultation item)
    {
        if (id != item.Id) return BadRequest();
        _context.Entry(item).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
