using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmaaJobb.Api.Applications;
using SmaaJobb.Api.Applications.Dtos;

namespace SmaaJobb.Api.Controllers;

[ApiController]
[Authorize]
public class ApplicationsController : ControllerBase
{
    private readonly IApplicationService _apps;

    public ApplicationsController(IApplicationService apps) => _apps = apps;

    [HttpGet("api/jobs/{jobId:guid}/applications")]
    public async Task<ActionResult<IReadOnlyList<ApplicationDto>>> ListForJob(Guid jobId, CancellationToken ct)
    {
        try { return Ok(await _apps.ListForJobAsync(jobId, RequireUserId(), ct)); }
        catch (KeyNotFoundException) { return NotFound(); }
        catch (UnauthorizedAccessException) { return Forbid(); }
    }

    [HttpGet("api/applications/mine")]
    public async Task<ActionResult<IReadOnlyList<ApplicationDto>>> ListMine(CancellationToken ct)
        => Ok(await _apps.ListMineAsync(RequireUserId(), ct));

    [HttpPost("api/jobs/{jobId:guid}/applications")]
    public async Task<ActionResult<ApplicationDto>> Apply(
        Guid jobId, [FromBody] CreateApplicationRequest req, CancellationToken ct)
    {
        try { return Ok(await _apps.ApplyAsync(jobId, RequireUserId(), req.Message, ct)); }
        catch (KeyNotFoundException) { return NotFound(); }
        catch (InvalidOperationException ex) { return BadRequest(new { error = ex.Message }); }
    }

    [HttpPost("api/applications/{id:guid}/accept")]
    public async Task<ActionResult<ApplicationDto>> Accept(Guid id, CancellationToken ct)
    {
        try { return Ok(await _apps.AcceptAsync(id, RequireUserId(), ct)); }
        catch (KeyNotFoundException) { return NotFound(); }
        catch (UnauthorizedAccessException) { return Forbid(); }
        catch (InvalidOperationException ex) { return BadRequest(new { error = ex.Message }); }
    }

    [HttpPost("api/applications/{id:guid}/reject")]
    public async Task<ActionResult<ApplicationDto>> Reject(Guid id, CancellationToken ct)
    {
        try { return Ok(await _apps.RejectAsync(id, RequireUserId(), ct)); }
        catch (KeyNotFoundException) { return NotFound(); }
        catch (UnauthorizedAccessException) { return Forbid(); }
        catch (InvalidOperationException ex) { return BadRequest(new { error = ex.Message }); }
    }

    [HttpPost("api/applications/{id:guid}/withdraw")]
    public async Task<ActionResult<ApplicationDto>> Withdraw(Guid id, CancellationToken ct)
    {
        try { return Ok(await _apps.WithdrawAsync(id, RequireUserId(), ct)); }
        catch (KeyNotFoundException) { return NotFound(); }
        catch (UnauthorizedAccessException) { return Forbid(); }
        catch (InvalidOperationException ex) { return BadRequest(new { error = ex.Message }); }
    }

    private Guid RequireUserId()
    {
        var sub = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
            ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(sub, out var id) ? id : throw new UnauthorizedAccessException();
    }
}
