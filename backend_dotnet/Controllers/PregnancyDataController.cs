using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PregnancyDataController : ControllerBase
{
    private readonly AppDbContext _context;

    public PregnancyDataController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<PregnancyData>>> Get()
    {
        return await _context.Pregnancies.ToListAsync();
    }

    [HttpGet("patient/{patientId}")]
    public async Task<ActionResult<PregnancyData>> GetByPatient(Guid patientId)
    {
        var item = await _context.Pregnancies.FirstOrDefaultAsync(p => p.PatientId == patientId);
        if (item == null) return NotFound();
        return item;
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<PregnancyData>> Get(Guid id)
    {
        var item = await _context.Pregnancies.FindAsync(id);
        if (item == null) return NotFound();
        return item;
    }

    [HttpPost]
    public async Task<ActionResult<PregnancyData>> Post(PregnancyData item)
    {
        if (item.Id == Guid.Empty) item.Id = Guid.NewGuid();
        _context.Pregnancies.Add(item);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = item.Id }, item);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Put(Guid id, PregnancyData item)
    {
        if (id != item.Id) return BadRequest();
        _context.Entry(item).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
