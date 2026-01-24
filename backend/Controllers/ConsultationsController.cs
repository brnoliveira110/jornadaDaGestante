using backend.DTOs;
using backend.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ConsultationsController : ControllerBase
{
    private readonly IConsultationService _service;

    public ConsultationsController(IConsultationService service)
    {
        _service = service;
    }

    [HttpGet("patient/{patientId}")]
    public async Task<ActionResult<IEnumerable<ConsultationResponseDto>>> GetByPatient(Guid patientId)
    {
        var result = await _service.GetAllByPatientAsync(patientId);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ConsultationResponseDto>> Get(Guid id)
    {
        var result = await _service.GetByIdAsync(id);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<ConsultationResponseDto>> Post([FromBody] ConsultationCreateDto dto)
    {
        try 
        {
            var created = await _service.CreateAsync(dto);
            // Assuming GetById is mapped to "Get" action name or we use the route. 
            // The previous code had "GetByPatient" as the action for CreatedAtAction, but strictly it refers to the location of the *new resource*.
            // Ideally it should point to Get(id). The user example used nameof(GetByPatient) with patientId, which returns a list. 
            // RESTfully, Location header should point to the specific resource created. 
            // But I will follow the user's example if possible, or correct it to Get(id).
            // User example: return CreatedAtAction(nameof(GetByPatient), new { patientId = created.PatientId }, created);
            // This suggests they might not have a specific GetById implemented or prefer redirection to the list.
            // However, I implemented GetByIdAsync in Service so I can use Get(id).
            // I will use Get(id) as it is better practice.
            return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Put(Guid id, [FromBody] ConsultationCreateDto dto)
    {
        try
        {
            await _service.UpdateAsync(id, dto);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }
}
