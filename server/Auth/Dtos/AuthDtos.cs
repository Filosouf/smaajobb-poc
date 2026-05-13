using System.ComponentModel.DataAnnotations;

namespace SmaaJobb.Api.Auth.Dtos;

public record RegisterRequest(
    [Required, EmailAddress] string Email,
    [Required, MinLength(8)] string Password,
    [Required, MinLength(2), MaxLength(200)] string FullName,
    [Required] DateOnly BirthDate,
    string? PhoneNumber,
    string? PostalCode);

public record LoginRequest(
    [Required, EmailAddress] string Email,
    [Required] string Password);

public record AuthResponse(
    string AccessToken,
    DateTime ExpiresAt,
    UserDto User);

public record UserDto(
    Guid Id,
    string Email,
    string FullName,
    int Age,
    string UserType,
    decimal? AverageRating,
    int CompletedJobs);
