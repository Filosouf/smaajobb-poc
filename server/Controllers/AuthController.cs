using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using SmaaJobb.Api.Auth;
using SmaaJobb.Api.Auth.Dtos;
using SmaaJobb.Api.Domain;
using SmaaJobb.Api.Domain.Entities;

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

    public AuthController(
        UserManager<AppUser> userManager,
        IJwtTokenService jwt,
        IRefreshTokenService refresh,
        IWebHostEnvironment env)
    {
        _userManager = userManager;
        _jwt = jwt;
        _refresh = refresh;
        _env = env;
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
            return BadRequest(new { errors = result.Errors.Select(e => e.Description) });

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
}
