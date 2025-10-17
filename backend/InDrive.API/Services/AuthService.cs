using System.Data;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Dapper;
using InDrive.API.Models;
using Microsoft.IdentityModel.Tokens;

namespace InDrive.API.Services;

public class AuthService : IAuthService
{
    private readonly IDbConnection _db;
    private readonly IConfiguration _configuration;
    private readonly IUserService _userService;

    public AuthService(IDbConnection db, IConfiguration configuration, IUserService userService)
    {
        _db = db;
        _configuration = configuration;
        _userService = userService;
    }

    public async Task<LoginResponse> RegisterAsync(RegisterRequest request)
    {
        // Check if user already exists
        var existingUser = await _db.QueryFirstOrDefaultAsync<User>(
            "SELECT * FROM users WHERE email = @Email OR phone_number = @PhoneNumber",
            new { request.Email, request.PhoneNumber }
        );

        if (existingUser != null)
        {
            throw new Exception("User with this email or phone number already exists");
        }

        // Hash password
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

        // Create user
        var userId = await _db.QuerySingleAsync<Guid>(
            @"INSERT INTO users (email, password_hash, full_name, phone_number, role, is_verified)
              VALUES (@Email, @PasswordHash, @FullName, @PhoneNumber, @Role, @IsVerified)
              RETURNING id",
            new
            {
                request.Email,
                PasswordHash = passwordHash,
                request.FullName,
                request.PhoneNumber,
                request.Role,
                IsVerified = request.Role == "Admin"
            }
        );

        // If driver, create driver details
        if (request.Role == "Driver" && request.DriverDetails != null)
        {
            await _db.ExecuteAsync(
                @"INSERT INTO driver_details (user_id, license_number, vehicle_type, vehicle_model, 
                  vehicle_color, vehicle_plate, vehicle_year)
                  VALUES (@UserId, @LicenseNumber, @VehicleType, @VehicleModel, @VehicleColor, 
                  @VehiclePlate, @VehicleYear)",
                new
                {
                    UserId = userId,
                    request.DriverDetails.LicenseNumber,
                    request.DriverDetails.VehicleType,
                    request.DriverDetails.VehicleModel,
                    request.DriverDetails.VehicleColor,
                    request.DriverDetails.VehiclePlate,
                    request.DriverDetails.VehicleYear
                }
            );
        }

        // Get created user
        var user = await _db.QuerySingleAsync<User>("SELECT * FROM users WHERE id = @Id", new { Id = userId });
        var userDto = await _userService.GetUserByIdAsync(userId);

        return new LoginResponse
        {
            Token = GenerateJwtToken(user),
            User = userDto
        };
    }

    public async Task<LoginResponse> LoginAsync(LoginRequest request)
    {
        var user = await _db.QueryFirstOrDefaultAsync<User>(
            "SELECT * FROM users WHERE email = @Email",
            new { request.Email }
        );

        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            throw new Exception("Invalid email or password");
        }

        if (!user.IsActive)
        {
            throw new Exception("Your account has been deactivated");
        }

        var userDto = await _userService.GetUserByIdAsync(user.Id);

        return new LoginResponse
        {
            Token = GenerateJwtToken(user),
            User = userDto
        };
    }

    public string GenerateJwtToken(User user)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(_configuration["JwtSettings:Secret"]!);

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, user.FullName),
                new Claim(ClaimTypes.Role, user.Role)
            }),
            Expires = DateTime.UtcNow.AddMinutes(
                int.Parse(_configuration["JwtSettings:ExpiryMinutes"] ?? "1440")
            ),
            Issuer = _configuration["JwtSettings:Issuer"],
            Audience = _configuration["JwtSettings:Audience"],
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(key),
                SecurityAlgorithms.HmacSha256Signature
            )
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }
}

