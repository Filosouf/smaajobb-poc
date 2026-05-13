using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmaaJobb.Api.Data;
using SmaaJobb.Api.Jobs.Dtos;

namespace SmaaJobb.Api.Controllers;

[ApiController]
[Route("api/categories")]
public class CategoriesController : ControllerBase
{
    private readonly AppDbContext _db;

    public CategoriesController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<CategoryDto>>> List(CancellationToken ct)
    {
        var items = await _db.JobCategories
            .OrderBy(c => c.DisplayOrder)
            .Select(c => new CategoryDto(c.Id, c.Slug, c.Name, c.Description, c.MinAge, c.AdultsOnly))
            .ToListAsync(ct);

        return items;
    }
}
