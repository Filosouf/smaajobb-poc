using System.IdentityModel.Tokens.Jwt;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Options;
using SmaaJobb.Api.Auth;
using SmaaJobb.Api.Auth.Dtos;
using SmaaJobb.Api.Domain;
using SmaaJobb.Api.Domain.Entities;
using SmaaJobb.Api.Email;

namespace SmaaJobb.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private const string RefreshCookieName = "smaajobb_refresh";

    private readonly UserManager<AppUser> _userManager;
    private readonly IJwtTokenService _jwt;
    private readonly IRefreshTokenService _refresh;
    private readonly IWebHostEnvironment _env;
    private readonly IEmailSender _email;
    private readonly AppSettings _appSettings;
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        UserManager<AppUser> userManager,
        IJwtTokenService jwt,
        IRefreshTokenService refresh,
        IWebHostEnvironment env,
        IEmailSender email,
        IOptions<AppSettings> appSettings,
        ILogger<AuthController> logger)
    {
        _userManager = userManager;
        _jwt = jwt;
        _refresh = refresh;
        _env = env;
        _email = email;
        _appSettings = appSettings.Value;
        _logger = logger;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest req)
    {
        var ageNow = AgeAt(req.BirthDate, DateOnly.FromDateTime(DateTime.UtcNow));
        if (ageNow < 13)
            return BadRequest(new { error = "Brukere må være minst 13 år." });

        var existing = await _userManager.FindByEmailAsync(req.Email);
        if (existing is not null)
            return Conflict(new { error = "En bruker med denne e-postadressen finnes allerede." });

        var user = new AppUser
        {
            Id = Guid.NewGuid(),
            Email = req.Email,
            UserName = req.Email,
            FullName = req.FullName,
            BirthDate = req.BirthDate,
            PhoneNumber = req.PhoneNumber,
            PostalCode = req.PostalCode,
            UserType = ageNow >= 18 ? UserType.Adult : UserType.Minor,
        };

        var result = await _userManager.CreateAsync(user, req.Password);
        if (!result.Succeeded)
            return BadRequest(new { errors = result.Errors.Select(TranslateIdentityError) });

        return await IssueTokensAsync(user);
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest req)
    {
        var user = await _userManager.FindByEmailAsync(req.Email);
        if (user is null)
            return Unauthorized(new { error = "Feil e-post eller passord." });

        var ok = await _userManager.CheckPasswordAsync(user, req.Password);
        if (!ok)
            return Unauthorized(new { error = "Feil e-post eller passord." });

        return await IssueTokensAsync(user);
    }

    [HttpPost("refresh")]
    public async Task<ActionResult<AuthResponse>> Refresh()
    {
        if (!Request.Cookies.TryGetValue(RefreshCookieName, out var rawToken) || string.IsNullOrEmpty(rawToken))
            return Unauthorized();

        var existing = await _refresh.ValidateAsync(rawToken);
        if (existing is null)
            return Unauthorized();

        var user = await _userManager.FindByIdAsync(existing.UserId.ToString());
        if (user is null)
            return Unauthorized();

        var (newRaw, _) = await _refresh.RotateAsync(existing);
        SetRefreshCookie(newRaw);

        var access = _jwt.CreateAccessToken(user);
        return new AuthResponse(access, _jwt.GetAccessTokenExpiry(), ToDto(user));
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        if (Request.Cookies.TryGetValue(RefreshCookieName, out var rawToken) && !string.IsNullOrEmpty(rawToken))
        {
            var existing = await _refresh.ValidateAsync(rawToken);
            if (existing is not null)
                await _refresh.RevokeAsync(existing);
        }
        Response.Cookies.Delete(RefreshCookieName);
        return NoContent();
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest req)
    {
        var user = await _userManager.FindByEmailAsync(req.Email);

        // Lekk ikke om e-posten finnes: returnér alltid 204
        if (user is null)
        {
            _logger.LogInformation("Forgot-password request for unknown e-post {Email}", req.Email);
            return NoContent();
        }

        var rawToken = await _userManager.GeneratePasswordResetTokenAsync(user);
        var encodedToken = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(rawToken));

        var link = $"{_appSettings.FrontendBaseUrl.TrimEnd('/')}/reset-password"
            + $"?email={Uri.EscapeDataString(req.Email)}"
            + $"&token={encodedToken}";

        var html = $@"
            <p>Hei {System.Net.WebUtility.HtmlEncode(user.FullName)},</p>
            <p>Vi har mottatt en forespørsel om å tilbakestille passordet ditt på SmåJobb.</p>
            <p>Klikk på lenken nedenfor for å sette nytt passord. Lenken er gyldig i kort tid.</p>
            <p><a href=""{link}"">Tilbakestill passord</a></p>
            <p>Eller kopiér denne URL-en: <br/><code>{link}</code></p>
            <p>Hvis du ikke har bedt om dette, kan du trygt ignorere e-posten.</p>
            <p>Hilsen<br/>SmåJobb</p>";

        await _email.SendAsync(req.Email, "Tilbakestill passordet ditt", html);
        return NoContent();
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest req)
    {
        var user = await _userManager.FindByEmailAsync(req.Email);
        if (user is null)
            return BadRequest(new { error = "Ugyldig e-post eller token." });

        string decodedToken;
        try
        {
            decodedToken = Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(req.Token));
        }
        catch
        {
            return BadRequest(new { error = "Ugyldig token." });
        }

        var result = await _userManager.ResetPasswordAsync(user, decodedToken, req.NewPassword);
        if (!result.Succeeded)
            return BadRequest(new { errors = result.Errors.Select(TranslateIdentityError) });

        return NoContent();
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<UserDto>> Me()
    {
        var id = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
        if (id is null) return Unauthorized();

        var user = await _userManager.FindByIdAsync(id);
        if (user is null) return NotFound();

        return ToDto(user);
    }

    private async Task<AuthResponse> IssueTokensAsync(AppUser user)
    {
        var (rawRefresh, _) = await _refresh.CreateAsync(user.Id);
        SetRefreshCookie(rawRefresh);
        var access = _jwt.CreateAccessToken(user);
        return new AuthResponse(access, _jwt.GetAccessTokenExpiry(), ToDto(user));
    }

    private void SetRefreshCookie(string token)
    {
        var isProd = !_env.IsDevelopment();
        Response.Cookies.Append(RefreshCookieName, token, new CookieOptions
        {
            HttpOnly = true,
            Secure = isProd,
            SameSite = isProd ? SameSiteMode.Strict : SameSiteMode.Lax,
            Expires = DateTime.UtcNow.AddDays(7),
            Path = "/api/auth"
        });
    }

    private static UserDto ToDto(AppUser user) => new(
        user.Id,
        user.Email ?? string.Empty,
        user.FullName,
        AgeAt(user.BirthDate, DateOnly.FromDateTime(DateTime.UtcNow)),
        user.UserType.ToString(),
        user.AverageRating,
        user.CompletedJobs);

    private static int AgeAt(DateOnly birth, DateOnly at)
    {
        var age = at.Year - birth.Year;
        if (at < birth.AddYears(age)) age--;
        return age;
    }

    private static string TranslateIdentityError(IdentityError error) => error.Code switch
    {
        "PasswordTooShort" => "Passordet må være minst 8 tegn.",
        "PasswordRequiresDigit" => "Passordet må inneholde minst ett tall.",
        "PasswordRequiresLower" => "Passordet må inneholde minst en liten bokstav.",
        "PasswordRequiresUpper" => "Passordet må inneholde minst en stor bokstav.",
        "PasswordRequiresNonAlphanumeric" => "Passordet må inneholde minst ett spesialtegn.",
        "PasswordRequiresUniqueChars" => "Passordet må inneholde flere ulike tegn.",
        "DuplicateEmail" or "DuplicateUserName" => "En bruker med denne e-postadressen finnes allerede.",
        "InvalidEmail" => "E-postadressen er ikke gyldig.",
        "InvalidUserName" => "Brukernavnet er ikke gyldig.",
        "PasswordMismatch" => "Feil passord.",
        "InvalidToken" => "Lenken er ugyldig eller utløpt.",
        _ => error.Description
    };
}
