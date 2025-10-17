using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using InDrive.API.Services;
using System.Security.Claims;

namespace InDrive.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Driver")]
public class DriversController : ControllerBase
{
    private readonly IDriverService _driverService;

    public DriversController(IDriverService driverService)
    {
        _driverService = driverService;
    }

    [HttpPut("availability")]
    public async Task<IActionResult> UpdateAvailability([FromBody] UpdateAvailabilityRequest request)
    {
        try
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            await _driverService.UpdateAvailabilityAsync(userId, request.IsAvailable);
            return Ok(new { message = "Availability updated successfully" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("location")]
    public async Task<IActionResult> UpdateLocation([FromBody] UpdateLocationRequest request)
    {
        try
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            await _driverService.UpdateLocationAsync(userId, request.Latitude, request.Longitude);
            return Ok(new { message = "Location updated successfully" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}

public class UpdateAvailabilityRequest
{
    public bool IsAvailable { get; set; }
}

public class UpdateLocationRequest
{
    public decimal Latitude { get; set; }
    public decimal Longitude { get; set; }
}

