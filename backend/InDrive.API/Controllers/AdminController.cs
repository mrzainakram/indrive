using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using InDrive.API.Services;

namespace InDrive.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly IAdminService _adminService;

    public AdminController(IAdminService adminService)
    {
        _adminService = adminService;
    }

    [HttpGet("stats")]
    public async Task<ActionResult<AdminStats>> GetDashboardStats()
    {
        try
        {
            var stats = await _adminService.GetDashboardStatsAsync();
            return Ok(stats);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("users/{userId}/status")]
    public async Task<IActionResult> UpdateUserStatus(Guid userId, [FromBody] UpdateUserStatusRequest request)
    {
        try
        {
            await _adminService.UpdateUserStatusAsync(userId, request.IsActive);
            return Ok(new { message = "User status updated successfully" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}

public class UpdateUserStatusRequest
{
    public bool IsActive { get; set; }
}

