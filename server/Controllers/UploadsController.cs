using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmaaJobb.Api.Storage;

namespace SmaaJobb.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/uploads")]
public class UploadsController : ControllerBase
{
    private const long MaxBytes = 8 * 1024 * 1024; // 8 MB per fil

    private readonly IBlobStorage _blobs;

    public UploadsController(IBlobStorage blobs) => _blobs = blobs;

    [HttpPost]
    [RequestSizeLimit(MaxBytes)]
    public async Task<ActionResult<BlobReference>> Upload(
        IFormFile file, CancellationToken ct)
    {
        if (file is null || file.Length == 0)
            return BadRequest(new { error = "Ingen fil mottatt." });
        if (file.Length > MaxBytes)
            return BadRequest(new { error = "Filen er for stor (maks 8 MB)." });
        if (!file.ContentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase))
            return BadRequest(new { error = "Kun bilder er støttet." });

        try
        {
            await using var stream = file.OpenReadStream();
            var blob = await _blobs.SaveAsync(stream, file.ContentType, file.FileName, ct);
            return Ok(blob);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}
