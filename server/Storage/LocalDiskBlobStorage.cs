using Microsoft.Extensions.Options;

namespace SmaaJobb.Api.Storage;

public class BlobStorageSettings
{
    /// <summary>
    /// Absolutt eller relativ sti der filer lagres på disk.
    /// Default: server/uploads/ (relativ til ContentRoot).
    /// </summary>
    public string LocalPath { get; set; } = "uploads";

    /// <summary>
    /// Public path-prefix bilder serveres på (matcher static-file-middleware).
    /// </summary>
    public string PublicPath { get; set; } = "/uploads";
}

public class LocalDiskBlobStorage : IBlobStorage
{
    private static readonly HashSet<string> AllowedExtensions =
        new(StringComparer.OrdinalIgnoreCase) { ".jpg", ".jpeg", ".png", ".webp", ".gif" };

    private readonly string _root;
    private readonly string _publicPath;
    private readonly ILogger<LocalDiskBlobStorage> _logger;

    public LocalDiskBlobStorage(
        IOptions<BlobStorageSettings> options,
        IWebHostEnvironment env,
        ILogger<LocalDiskBlobStorage> logger)
    {
        var settings = options.Value;
        _root = Path.IsPathRooted(settings.LocalPath)
            ? settings.LocalPath
            : Path.Combine(env.ContentRootPath, settings.LocalPath);
        _publicPath = settings.PublicPath.TrimEnd('/');
        _logger = logger;

        Directory.CreateDirectory(_root);
    }

    public string RootPath => _root;

    public async Task<BlobReference> SaveAsync(
        Stream content,
        string contentType,
        string originalFileName,
        CancellationToken ct = default)
    {
        var ext = Path.GetExtension(originalFileName).ToLowerInvariant();
        if (!AllowedExtensions.Contains(ext))
            throw new InvalidOperationException($"Filtype {ext} er ikke støttet.");

        var key = $"{Guid.NewGuid():N}{ext}";
        var fullPath = Path.Combine(_root, key);

        await using (var fs = new FileStream(fullPath, FileMode.CreateNew, FileAccess.Write, FileShare.None))
        {
            await content.CopyToAsync(fs, ct);
        }

        _logger.LogInformation("Blob lagret: {Key} ({Size} bytes)", key, new FileInfo(fullPath).Length);
        return new BlobReference(key, PublicUrlFor(key));
    }

    public Task DeleteAsync(string key, CancellationToken ct = default)
    {
        var safeKey = Path.GetFileName(key); // ingen traversering
        var fullPath = Path.Combine(_root, safeKey);
        if (File.Exists(fullPath))
            File.Delete(fullPath);
        return Task.CompletedTask;
    }

    public string PublicUrlFor(string key) => $"{_publicPath}/{key}";
}
