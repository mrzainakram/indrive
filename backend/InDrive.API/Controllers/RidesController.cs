using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using InDrive.API.Models;
using InDrive.API.Services;
using InDrive.API.Hubs;
using System.Security.Claims;

namespace InDrive.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class RidesController : ControllerBase
{
    private readonly IRideService _rideService;
    private readonly IHubContext<RideHub> _rideHubContext;

    public RidesController(IRideService rideService, IHubContext<RideHub> rideHubContext)
    {
        _rideService = rideService;
        _rideHubContext = rideHubContext;
    }

    [HttpPost]
    [Authorize(Roles = "Rider")]
    public async Task<ActionResult<RideDto>> CreateRide([FromBody] CreateRideRequest request)
    {
        try
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var ride = await _rideService.CreateRideAsync(userId, request);
            return Ok(ride);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<RideDto>> GetRide(Guid id)
    {
        try
        {
            var ride = await _rideService.GetRideByIdAsync(id);
            return Ok(ride);
        }
        catch (Exception ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpGet("my-rides")]
    public async Task<ActionResult<List<RideDto>>> GetMyRides([FromQuery] string? status = null)
    {
        try
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var role = User.FindFirst(ClaimTypes.Role)!.Value;

            List<RideDto> rides;
            if (role == "Driver")
            {
                rides = await _rideService.GetRidesForDriverAsync(userId, status);
            }
            else
            {
                rides = await _rideService.GetRidesForRiderAsync(userId, status);
            }

            return Ok(rides);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("available")]
    [Authorize(Roles = "Driver")]
    public async Task<ActionResult<List<RideDto>>> GetAvailableRides()
    {
        try
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var rides = await _rideService.GetAvailableRidesAsync(userId);
            return Ok(rides);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("offers")]
    [Authorize(Roles = "Driver")]
    public async Task<ActionResult<RideOffer>> CreateOffer([FromBody] CreateOfferRequest request)
    {
        try
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var offer = await _rideService.CreateOfferAsync(userId, request);

            // Notify rider via SignalR
            await _rideHubContext.Clients.Group($"ride_{request.RideId}")
                .SendAsync("OfferReceived", offer);

            return Ok(offer);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("offers/{offerId}/accept")]
    [Authorize(Roles = "Rider")]
    public async Task<ActionResult<RideDto>> AcceptOffer(Guid offerId)
    {
        try
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var ride = await _rideService.AcceptOfferAsync(userId, offerId);

            // Notify driver via SignalR
            if (ride.Driver != null)
            {
                await _rideHubContext.Clients.Group($"user_{ride.Driver.Id}")
                    .SendAsync("OfferAccepted", ride);
            }

            return Ok(ride);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id}/status")]
    public async Task<ActionResult<RideDto>> UpdateRideStatus(
        Guid id,
        [FromBody] UpdateRideStatusRequest request)
    {
        try
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var ride = await _rideService.UpdateRideStatusAsync(id, request.Status, userId, request.CancellationReason);

            // Notify both parties via SignalR
            await _rideHubContext.Clients.Group($"ride_{id}")
                .SendAsync("RideStatusUpdated", ride);

            return Ok(ride);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<List<RideDto>>> GetAllRides([FromQuery] int page = 1, [FromQuery] int pageSize = 50)
    {
        try
        {
            var rides = await _rideService.GetAllRidesAsync(page, pageSize);
            return Ok(rides);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}

