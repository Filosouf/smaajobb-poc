using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmaaJobb.Api.Domain;
using SmaaJobb.Api.Jobs;
using SmaaJobb.Api.Jobs.Dtos;

namespace SmaaJobb.Api.Controllers;

[ApiController]
[Route("api/jobs")]
public class JobsController : ControllerBase
{
    private readonly IJobService _jobs;

    public JobsController(IJobService jobs) => _jobs = jobs;

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<JobListItem>>> Search(
        [FromQuery] int? categoryId,
        [FromQuery] string? postalCode,
        [FromQuery] decimal? minPrice,
        [FromQuery] decimal? maxPrice,
        [FromQuery] JobStatus? status,
        [FromQuery] bool mineOnly,
        CancellationToken ct)
    {
        var currentUserId = TryGetUserId();
        var filter = new JobFilter(categoryId, postalCode, minPrice, maxPrice, status, mineOnly);
        var items = await _jobs.SearchAsync(filter, currentUserId, ct);
        return Ok(items);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<JobDetail>> Get(Guid id, CancellationToken ct)
    {
        var job = await _jobs.GetAsync(id, ct);
        return job is null ? NotFound() : Ok(job);
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<JobDetail>> Create([FromBody] CreateJobRequest req, CancellationToken ct)
    {
        try
        {
            var listerId = RequireUserId();
            var job = await _jobs.CreateAsync(listerId, req, ct);
            return CreatedAtAction(nameof(Get), new { id = job.Id }, job);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [Authorize]
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<JobDetail>> Update(Guid id, [FromBody] UpdateJobRequest req, CancellationToken ct)
    {
        try
        {
            var job = await _jobs.UpdateAsync(id, RequireUserId(), req, ct);
            return Ok(job);
        }
        catch (KeyNotFoundException) { return NotFound(); }
        catch (UnauthorizedAccessException) { return Forbid(); }
        catch (InvalidOperationException ex) { return BadRequest(new { error = ex.Message }); }
    }

    [Authorize]
    [HttpPost("{id:guid}/publish")]
    public async Task<ActionResult<PublishResponseDto>> Publish(Guid id, CancellationToken ct)
    {
        try
        {
            var result = await _jobs.PublishAsync(id, RequireUserId(), ct);
            return Ok(new PublishResponseDto(result.Job, result.CheckoutUrl));
        }
        catch (KeyNotFoundException) { return NotFound(); }
        catch (UnauthorizedAccessException) { return Forbid(); }
        catch (InvalidOperationException ex) { return BadRequest(new { error = ex.Message }); }
    }

    [Authorize]
    [HttpPost("{id:guid}/complete")]
    public async Task<ActionResult<JobDetail>> Complete(Guid id, CancellationToken ct)
    {
        try { return Ok(await _jobs.MarkCompletedAsync(id, RequireUserId(), ct)); }
        catch (KeyNotFoundException) { return NotFound(); }
        catch (UnauthorizedAccessException) { return Forbid(); }
        catch (InvalidOperationException ex) { return BadRequest(new { error = ex.Message }); }
    }

    [Authorize]
    [HttpPost("{id:guid}/confirm")]
    public async Task<ActionResult<JobDetail>> Confirm(Guid id, CancellationToken ct)
    {
        try { return Ok(await _jobs.ConfirmCompletionAsync(id, RequireUserId(), ct)); }
        catch (KeyNotFoundException) { return NotFound(); }
        catch (UnauthorizedAccessException) { return Forbid(); }
        catch (InvalidOperationException ex) { return BadRequest(new { error = ex.Message }); }
    }

    [Authorize]
    [HttpPost("{id:guid}/cancel")]
    public async Task<ActionResult<JobDetail>> Cancel(Guid id, CancellationToken ct)
    {
        try
        {
            var job = await _jobs.CancelAsync(id, RequireUserId(), ct);
            return Ok(job);
        }
        catch (KeyNotFoundException) { return NotFound(); }
        catch (UnauthorizedAccessException) { return Forbid(); }
        catch (InvalidOperationException ex) { return BadRequest(new { error = ex.Message }); }
    }

    [Authorize]
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        try
        {
            await _jobs.DeleteDraftAsync(id, RequireUserId(), ct);
            return NoContent();
        }
        catch (KeyNotFoundException) { return NotFound(); }
        catch (UnauthorizedAccessException) { return Forbid(); }
        catch (InvalidOperationException ex) { return BadRequest(new { error = ex.Message }); }
    }

    private Guid? TryGetUserId()
    {
        var sub = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
            ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(sub, out var id) ? id : null;
    }

    private Guid RequireUserId() =>
        TryGetUserId() ?? throw new UnauthorizedAccessException();
}
