using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmaaJobb.Api.Ratings;
using SmaaJobb.Api.Ratings.Dtos;

namespace SmaaJobb.Api.Controllers;

[ApiController]
public class RatingsController : ControllerBase
{
    private readonly IRatingService _ratings;

    public RatingsController(IRatingService ratings) => _ratings = ratings;

    [HttpGet("api/jobs/{jobId:guid}/ratings")]
    public async Task<ActionResult<JobRatingsDto>> ForJob(Guid jobId, CancellationToken ct)
    {
        try { return Ok(await _ratings.GetForJobAsync(jobId, TryGetUserId(), ct)); }
        catch (KeyNotFoundException) { return NotFound(); }
    }

    [Authorize]
    [HttpPost("api/jobs/{jobId:guid}/ratings")]
    public async Task<ActionResult<RatingDto>> Rate(
        Guid jobId, [FromBody] CreateRatingRequest req, CancellationToken ct)
    {
        try { return Ok(await _ratings.RateAsync(jobId, RequireUserId(), req.Score, req.Comment, ct)); }
        catch (KeyNotFoundException) { return NotFound(); }
        catch (UnauthorizedAccessException) { return Forbid(); }
        catch (InvalidOperationException ex) { return BadRequest(new { error = ex.Message }); }
    }

    [HttpGet("api/users/{userId:guid}/ratings")]
    public async Task<ActionResult<IReadOnlyList<RatingDto>>> ForUser(Guid userId, CancellationToken ct)
        => Ok(await _ratings.ListForUserAsync(userId, ct));

    private Guid? TryGetUserId()
    {
        var sub = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
            ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(sub, out var id) ? id : null;
    }

    private Guid RequireUserId() =>
        TryGetUserId() ?? throw new UnauthorizedAccessException();
}
