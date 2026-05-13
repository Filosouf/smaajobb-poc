using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmaaJobb.Api.Messages;
using SmaaJobb.Api.Messages.Dtos;

namespace SmaaJobb.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/jobs/{jobId:guid}/messages")]
public class MessagesController : ControllerBase
{
    private readonly IMessageService _messages;

    public MessagesController(IMessageService messages) => _messages = messages;

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<MessageDto>>> List(Guid jobId, CancellationToken ct)
    {
        try { return Ok(await _messages.ListForJobAsync(jobId, RequireUserId(), ct)); }
        catch (KeyNotFoundException) { return NotFound(); }
        catch (UnauthorizedAccessException) { return Forbid(); }
    }

    [HttpPost]
    public async Task<ActionResult<MessageDto>> Send(
        Guid jobId, [FromBody] SendMessageRequest req, CancellationToken ct)
    {
        try { return Ok(await _messages.SendAsync(jobId, RequireUserId(), req.Body, ct)); }
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
