using InDrive.API.Models;

namespace InDrive.API.Services;

public interface IAdminService
{
    Task<AdminStats> GetDashboardStatsAsync();
    Task<UserDto> UpdateUserStatusAsync(Guid userId, bool isActive);
    Task<List<RideDto>> GetAllRidesAsync(int page = 1, int pageSize = 50);
}

public class AdminStats
{
    public int TotalUsers { get; set; }
    public int TotalRiders { get; set; }
    public int TotalDrivers { get; set; }
    public int TotalRides { get; set; }
    public int CompletedRides { get; set; }
    public int ActiveRides { get; set; }
    public decimal TotalRevenue { get; set; }
    public decimal AverageFare { get; set; }
    public List<DailyStats> DailyStats { get; set; } = new();
}

public class DailyStats
{
    public DateTime Date { get; set; }
    public int TotalRides { get; set; }
    public decimal TotalRevenue { get; set; }
}

