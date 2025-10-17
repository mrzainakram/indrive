using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace InDrive.API.Hubs;

[Authorize]
public class RideHub : Hub
{
    private static readonly Dictionary<string, string> UserConnections = new();

    public override async Task OnConnectedAsync()
    {
        var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!string.IsNullOrEmpty(userId))
        {
            UserConnections[userId] = Context.ConnectionId;
            await Groups.AddToGroupAsync(Context.ConnectionId, $"user_{userId}");
        }
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!string.IsNullOrEmpty(userId))
        {
            UserConnections.Remove(userId);
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"user_{userId}");
        }
        await base.OnDisconnectedAsync(exception);
    }

    public async Task JoinRide(string rideId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"ride_{rideId}");
    }

    public async Task LeaveRide(string rideId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"ride_{rideId}");
    }

    public static string? GetConnectionId(string userId)
    {
        return UserConnections.TryGetValue(userId, out var connectionId) ? connectionId : null;
    }
}

