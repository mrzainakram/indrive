namespace InDrive.API.Models;

public class User
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string Role { get; set; } = "Rider";
    public string? ProfileImage { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsVerified { get; set; } = false;
    public decimal Rating { get; set; } = 5.00m;
    public int TotalRatings { get; set; } = 0;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class DriverDetails
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string LicenseNumber { get; set; } = string.Empty;
    public string VehicleType { get; set; } = string.Empty;
    public string VehicleModel { get; set; } = string.Empty;
    public string VehicleColor { get; set; } = string.Empty;
    public string VehiclePlate { get; set; } = string.Empty;
    public int? VehicleYear { get; set; }
    public bool IsAvailable { get; set; } = false;
    public decimal? CurrentLatitude { get; set; }
    public decimal? CurrentLongitude { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class UserDto
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string? ProfileImage { get; set; }
    public bool IsActive { get; set; }
    public bool IsVerified { get; set; }
    public decimal Rating { get; set; }
    public int TotalRatings { get; set; }
    public DriverDetails? DriverDetails { get; set; }
}

public class RegisterRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string Role { get; set; } = "Rider";
    public DriverRegistrationDto? DriverDetails { get; set; }
}

public class DriverRegistrationDto
{
    public string LicenseNumber { get; set; } = string.Empty;
    public string VehicleType { get; set; } = string.Empty;
    public string VehicleModel { get; set; } = string.Empty;
    public string VehicleColor { get; set; } = string.Empty;
    public string VehiclePlate { get; set; } = string.Empty;
    public int? VehicleYear { get; set; }
}

public class LoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class LoginResponse
{
    public string Token { get; set; } = string.Empty;
    public UserDto User { get; set; } = null!;
}

