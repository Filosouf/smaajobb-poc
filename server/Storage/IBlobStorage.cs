namespace SmaaJobb.Api.Storage;

public record BlobReference(string Key, string PublicUrl);

public interface IBlobStorage
{
    /// <summary>
    /// Lagrer en strøm og returnerer en nøkkel som kan brukes til å hente
    /// blobben igjen, pluss en URL frontend kan vise.
    /// </summary>
    Task<BlobReference> SaveAsync(
        Stream content,
        string contentType,
        string originalFileName,
        CancellationToken ct = default);

    Task DeleteAsync(string key, CancellationToken ct = default);

    string PublicUrlFor(string key);
}
