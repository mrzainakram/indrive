using System.Data;
using Dapper;
using InDrive.API.Models;

namespace InDrive.API.Services;

public class DriverService : IDriverService
{
    private readonly IDbConnection _db;

    public DriverService(IDbConnection db)
    {
        _db = db;
    }

    public async Task UpdateAvailabilityAsync(Guid driverId, bool isAvailable)
    {
        var driverDetails = await _db.QueryFirstOrDefaultAsync<DriverDetails>(
            "SELECT * FROM driver_details WHERE user_id = @DriverId",
            new { DriverId = driverId }
        );

        if (driverDetails == null)
        {
            throw new Exception("Driver details not found");
        }

        await _db.ExecuteAsync(
            "UPDATE driver_details SET is_available = @IsAvailable WHERE user_id = @DriverId",
            new { IsAvailable = isAvailable, DriverId = driverId }
        );
    }

    public async Task UpdateLocationAsync(Guid driverId, decimal latitude, decimal longitude)
    {
        await _db.ExecuteAsync(
            @"UPDATE driver_details 
              SET current_latitude = @Latitude, current_longitude = @Longitude 
              WHERE user_id = @DriverId",
            new { Latitude = latitude, Longitude = longitude, DriverId = driverId }
        );
    }

    public async Task<DriverDetails> GetDriverDetailsAsync(Guid userId)
    {
        var driverDetails = await _db.QueryFirstOrDefaultAsync<DriverDetails>(
            "SELECT * FROM driver_details WHERE user_id = @UserId",
            new { UserId = userId }
        );

        if (driverDetails == null)
        {
            throw new Exception("Driver details not found");
        }

        return driverDetails;
    }
}

