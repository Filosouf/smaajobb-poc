namespace SmaaJobb.Api.Auth;

public class JwtSettings
{
    public string Issuer { get; set; } = "SmaaJobb";
    public string Audience { get; set; } = "SmaaJobb";
    public string Secret { get; set; } = string.Empty;
    public int AccessTokenLifetimeMinutes { get; set; } = 15;
    public int RefreshTokenLifetimeDays { get; set; } = 7;
}
