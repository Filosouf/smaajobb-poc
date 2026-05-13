namespace SmaaJobb.Api.Domain.Entities;

public class PostalCode
{
    public string Code { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string? Municipality { get; set; }
    public string? County { get; set; }
}
