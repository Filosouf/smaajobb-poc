namespace SmaaJobb.Api.Email;

public class EmailSettings
{
    public string Host { get; set; } = "localhost";
    public int Port { get; set; } = 2525;
    public string FromAddress { get; set; } = "noreply@smaajobb.local";
    public string FromName { get; set; } = "SmåJobb";
    public bool UseStartTls { get; set; } = false;
    public string? Username { get; set; }
    public string? Password { get; set; }
}

public class AppSettings
{
    public string FrontendBaseUrl { get; set; } = "http://localhost:4200";
}
