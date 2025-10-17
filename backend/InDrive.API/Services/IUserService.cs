using InDrive.API.Models;

namespace InDrive.API.Services;

public interface IUserService
{
    Task<UserDto> GetUserByIdAsync(Guid userId);
    Task<User> GetUserEntityByIdAsync(Guid userId);
    Task<UserDto> UpdateProfileAsync(Guid userId, UpdateProfileRequest request);
    Task<List<UserDto>> GetAllUsersAsync(string? role = null);
}

public class UpdateProfileRequest
{
    public string? FullName { get; set; }
    public string? PhoneNumber { get; set; }
    public string? ProfileImage { get; set; }
}

