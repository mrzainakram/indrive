using System.Data;
using Dapper;
using InDrive.API.Models;

namespace InDrive.API.Services;

public class AdminService : IAdminService
{
    private readonly IDbConnection _db;
    private readonly IUserService _userService;
    private readonly IRideService _rideService;

    public AdminService(IDbConnection db, IUserService userService, IRideService rideService)
    {
        _db = db;
        _userService = userService;
        _rideService = rideService;
    }

    public async Task<AdminStats> GetDashboardStatsAsync()
    {
        var stats = new AdminStats();

        // User stats
        stats.TotalUsers = await _db.QuerySingleAsync<int>("SELECT COUNT(*) FROM users");
        stats.TotalRiders = await _db.QuerySingleAsync<int>("SELECT COUNT(*) FROM users WHERE role = 'Rider'");
        stats.TotalDrivers = await _db.QuerySingleAsync<int>("SELECT COUNT(*) FROM users WHERE role = 'Driver'");

        // Ride stats
        stats.TotalRides = await _db.QuerySingleAsync<int>("SELECT COUNT(*) FROM rides");
        stats.CompletedRides = await _db.QuerySingleAsync<int>("SELECT COUNT(*) FROM rides WHERE status = 'completed'");
        stats.ActiveRides = await _db.QuerySingleAsync<int>(
            "SELECT COUNT(*) FROM rides WHERE status IN ('accepted', 'started')"
        );

        // Revenue stats
        var revenueData = await _db.QueryFirstAsync<(decimal total, decimal avg)>(
            "SELECT COALESCE(SUM(final_fare), 0)::decimal, COALESCE(AVG(final_fare), 0)::decimal FROM rides WHERE status = 'completed'"
        );
        stats.TotalRevenue = revenueData.total;
        stats.AverageFare = revenueData.avg;

        // Daily stats for last 7 days
        var dailyStats = await _db.QueryAsync<DailyStats>(
            @"SELECT 
                DATE(completed_at) as Date,
                COUNT(*)::int as TotalRides,
                COALESCE(SUM(final_fare), 0)::decimal as TotalRevenue
              FROM rides 
              WHERE status = 'completed' 
                AND completed_at >= CURRENT_DATE - INTERVAL '7 days'
              GROUP BY DATE(completed_at)
              ORDER BY Date DESC"
        );

        stats.DailyStats = dailyStats.ToList();

        return stats;
    }

    public async Task<UserDto> UpdateUserStatusAsync(Guid userId, bool isActive)
    {
        await _db.ExecuteAsync(
            "UPDATE users SET is_active = @IsActive WHERE id = @UserId",
            new { IsActive = isActive, UserId = userId }
        );

        return await _userService.GetUserByIdAsync(userId);
    }

    public async Task<List<RideDto>> GetAllRidesAsync(int page = 1, int pageSize = 50)
    {
        return await _rideService.GetAllRidesAsync(page, pageSize);
    }
}

