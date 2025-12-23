using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.IO;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ExamsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IWebHostEnvironment _environment;

    public ExamsController(AppDbContext context, IWebHostEnvironment environment)
    {
        _context = context;
        _environment = environment;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ExamResult>>> Get()
    {
        return await _context.Exams.ToListAsync();
    }
    
    [HttpGet("patient/{patientId}")]
    public async Task<ActionResult<IEnumerable<ExamResult>>> GetByPatient(Guid patientId)
    {
        return await _context.Exams.Where(e => e.PatientId == patientId).ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ExamResult>> Get(Guid id)
    {
        var item = await _context.Exams.FindAsync(id);
        if (item == null) return NotFound();
        return item;
    }

    [HttpPost]
    public async Task<ActionResult<ExamResult>> Post(ExamResult item)
    {
        if (item.Id == Guid.Empty) item.Id = Guid.NewGuid();
        _context.Exams.Add(item);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = item.Id }, item);
    }



    [HttpPut("{id}")]
    public async Task<IActionResult> Put(Guid id, ExamResult item)
    {
        if (id != item.Id) return BadRequest();
        _context.Entry(item).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
