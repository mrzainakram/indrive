using InDrive.API.Models;

namespace InDrive.API.Services;

public interface IDriverService
{
    Task UpdateAvailabilityAsync(Guid driverId, bool isAvailable);
    Task UpdateLocationAsync(Guid driverId, decimal latitude, decimal longitude);
    Task<DriverDetails> GetDriverDetailsAsync(Guid userId);
}

