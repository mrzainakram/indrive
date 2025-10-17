using System.Data;
using Dapper;
using InDrive.API.Models;

namespace InDrive.API.Services;

public class UserService : IUserService
{
    private readonly IDbConnection _db;

    public UserService(IDbConnection db)
    {
        _db = db;
    }

    public async Task<UserDto> GetUserByIdAsync(Guid userId)
    {
        var user = await _db.QueryFirstOrDefaultAsync<User>(
            "SELECT * FROM users WHERE id = @UserId",
            new { UserId = userId }
        );

        if (user == null)
        {
            throw new Exception("User not found");
        }

        var userDto = new UserDto
        {
            Id = user.Id,
            Email = user.Email,
            FullName = user.FullName,
            PhoneNumber = user.PhoneNumber,
            Role = user.Role,
            ProfileImage = user.ProfileImage,
            IsActive = user.IsActive,
            IsVerified = user.IsVerified,
            Rating = user.Rating,
            TotalRatings = user.TotalRatings
        };

        // Get driver details if user is a driver
        if (user.Role == "Driver")
        {
            userDto.DriverDetails = await _db.QueryFirstOrDefaultAsync<DriverDetails>(
                "SELECT * FROM driver_details WHERE user_id = @UserId",
                new { UserId = userId }
            );
        }

        return userDto;
    }

    public async Task<User> GetUserEntityByIdAsync(Guid userId)
    {
        var user = await _db.QueryFirstOrDefaultAsync<User>(
            "SELECT * FROM users WHERE id = @UserId",
            new { UserId = userId }
        );

        if (user == null)
        {
            throw new Exception("User not found");
        }

        return user;
    }

    public async Task<UserDto> UpdateProfileAsync(Guid userId, UpdateProfileRequest request)
    {
        var updates = new List<string>();
        var parameters = new DynamicParameters();
        parameters.Add("UserId", userId);

        if (!string.IsNullOrEmpty(request.FullName))
        {
            updates.Add("full_name = @FullName");
            parameters.Add("FullName", request.FullName);
        }

        if (!string.IsNullOrEmpty(request.PhoneNumber))
        {
            updates.Add("phone_number = @PhoneNumber");
            parameters.Add("PhoneNumber", request.PhoneNumber);
        }

        if (!string.IsNullOrEmpty(request.ProfileImage))
        {
            updates.Add("profile_image = @ProfileImage");
            parameters.Add("ProfileImage", request.ProfileImage);
        }

        if (updates.Any())
        {
            var sql = $"UPDATE users SET {string.Join(", ", updates)} WHERE id = @UserId";
            await _db.ExecuteAsync(sql, parameters);
        }

        return await GetUserByIdAsync(userId);
    }

    public async Task<List<UserDto>> GetAllUsersAsync(string? role = null)
    {
        var sql = "SELECT * FROM users";
        if (!string.IsNullOrEmpty(role))
        {
            sql += " WHERE role = @Role";
        }
        sql += " ORDER BY created_at DESC";

        var users = await _db.QueryAsync<User>(sql, new { Role = role });
        var userDtos = new List<UserDto>();

        foreach (var user in users)
        {
            var userDto = new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                FullName = user.FullName,
                PhoneNumber = user.PhoneNumber,
                Role = user.Role,
                ProfileImage = user.ProfileImage,
                IsActive = user.IsActive,
                IsVerified = user.IsVerified,
                Rating = user.Rating,
                TotalRatings = user.TotalRatings
            };

            if (user.Role == "Driver")
            {
                userDto.DriverDetails = await _db.QueryFirstOrDefaultAsync<DriverDetails>(
                    "SELECT * FROM driver_details WHERE user_id = @UserId",
                    new { UserId = user.Id }
                );
            }

            userDtos.Add(userDto);
        }

        return userDtos;
    }
}

