namespace SmaaJobb.Api.Domain.Entities;

public class JobCategory
{
    public int Id { get; set; }
    public string Slug { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int MinAge { get; set; }
    public bool AdultsOnly { get; set; }
    public int DisplayOrder { get; set; }
}
