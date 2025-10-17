using InDrive.API.Models;

namespace InDrive.API.Services;

public interface IAuthService
{
    Task<LoginResponse> RegisterAsync(RegisterRequest request);
    Task<LoginResponse> LoginAsync(LoginRequest request);
    string GenerateJwtToken(User user);
}

