using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;
using InDrive.API.Services;

namespace InDrive.API.Hubs;

[Authorize(Roles = "Driver")]
public class LocationHub : Hub
{
    private readonly IDriverService _driverService;

    public LocationHub(IDriverService driverService)
    {
        _driverService = driverService;
    }

    public async Task UpdateLocation(decimal latitude, decimal longitude)
    {
        var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!string.IsNullOrEmpty(userId) && Guid.TryParse(userId, out var driverId))
        {
            await _driverService.UpdateLocationAsync(driverId, latitude, longitude);
            
            // Broadcast location to any active rides this driver is on
            await Clients.Group($"driver_{driverId}").SendAsync("LocationUpdated", new
            {
                driverId,
                latitude,
                longitude,
                timestamp = DateTime.UtcNow
            });
        }
    }

    public async Task JoinDriverGroup(string driverId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"driver_{driverId}");
    }
}

