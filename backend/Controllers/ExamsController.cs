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

    [HttpPost("upload")]
    public async Task<ActionResult<ExamResult>> Upload([FromForm] IFormFile file, [FromForm] Guid patientId, [FromForm] string name)
    {
        if (file == null || file.Length == 0)
            return BadRequest("No file uploaded.");

        var uploads = Path.Combine(_environment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads");
        if (!Directory.Exists(uploads)) Directory.CreateDirectory(uploads);

        var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
        var filePath = Path.Combine(uploads, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        var exam = new ExamResult
        {
            Id = Guid.NewGuid(),
            PatientId = patientId,
            Name = name,
            Date = DateTime.Now,
            FileUrl = $"/uploads/{fileName}",
            Type = file.ContentType.Contains("pdf") ? ExamType.PDF : ExamType.IMAGE,
            Status = ExamStatus.REVIEWED, // Auto-complete for now since result is there
            DoctorName = "Upload Externo"
        };
        
        _context.Exams.Add(exam);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(Get), new { id = exam.Id }, exam);
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
