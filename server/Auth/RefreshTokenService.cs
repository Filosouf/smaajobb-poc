using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using SmaaJobb.Api.Data;
using SmaaJobb.Api.Domain.Entities;

namespace SmaaJobb.Api.Auth;

public interface IRefreshTokenService
{
    Task<(string RawToken, RefreshToken Entity)> CreateAsync(Guid userId, CancellationToken ct = default);
    Task<RefreshToken?> ValidateAsync(string rawToken, CancellationToken ct = default);
    Task<(string RawToken, RefreshToken Entity)> RotateAsync(RefreshToken oldToken, CancellationToken ct = default);
    Task RevokeAsync(RefreshToken token, CancellationToken ct = default);
}

public class RefreshTokenService : IRefreshTokenService
{
    private readonly AppDbContext _db;
    private readonly JwtSettings _settings;

    public RefreshTokenService(AppDbContext db, IOptions<JwtSettings> settings)
    {
        _db = db;
        _settings = settings.Value;
    }

    public async Task<(string RawToken, RefreshToken Entity)> CreateAsync(Guid userId, CancellationToken ct = default)
    {
        var raw = GenerateRawToken();
        var entity = new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            TokenHash = HashToken(raw),
            ExpiresAt = DateTime.UtcNow.AddDays(_settings.RefreshTokenLifetimeDays),
            CreatedAt = DateTime.UtcNow,
        };
        _db.RefreshTokens.Add(entity);
        await _db.SaveChangesAsync(ct);
        return (raw, entity);
    }

    public async Task<RefreshToken?> ValidateAsync(string rawToken, CancellationToken ct = default)
    {
        var hash = HashToken(rawToken);
        var entity = await _db.RefreshTokens
            .FirstOrDefaultAsync(r => r.TokenHash == hash, ct);
        return entity?.IsActive == true ? entity : null;
    }

    public async Task<(string RawToken, RefreshToken Entity)> RotateAsync(RefreshToken oldToken, CancellationToken ct = default)
    {
        var (newRaw, newEntity) = await CreateAsync(oldToken.UserId, ct);
        oldToken.RevokedAt = DateTime.UtcNow;
        oldToken.ReplacedById = newEntity.Id;
        await _db.SaveChangesAsync(ct);
        return (newRaw, newEntity);
    }

    public async Task RevokeAsync(RefreshToken token, CancellationToken ct = default)
    {
        token.RevokedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
    }

    private static string GenerateRawToken()
    {
        var bytes = new byte[32];
        RandomNumberGenerator.Fill(bytes);
        return Convert.ToBase64String(bytes);
    }

    private static string HashToken(string token)
    {
        var bytes = Encoding.UTF8.GetBytes(token);
        var hash = SHA256.HashData(bytes);
        return Convert.ToBase64String(hash);
    }
}
