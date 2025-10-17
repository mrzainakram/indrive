using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using InDrive.API.Models;
using InDrive.API.Services;
using System.Security.Claims;

namespace InDrive.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class RatingsController : ControllerBase
{
    private readonly IRatingService _ratingService;

    public RatingsController(IRatingService ratingService)
    {
        _ratingService = ratingService;
    }

    [HttpPost]
    public async Task<ActionResult<RatingDto>> CreateRating([FromBody] CreateRatingRequest request)
    {
        try
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var rating = await _ratingService.CreateRatingAsync(userId, request);
            return Ok(rating);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("user/{userId}")]
    public async Task<ActionResult<List<RatingDto>>> GetRatingsForUser(Guid userId)
    {
        try
        {
            var ratings = await _ratingService.GetRatingsForUserAsync(userId);
            return Ok(ratings);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("ride/{rideId}")]
    public async Task<ActionResult<RatingDto>> GetRatingForRide(Guid rideId)
    {
        try
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var rating = await _ratingService.GetRatingForRideAsync(rideId, userId);
            
            if (rating == null)
            {
                return NotFound(new { message = "Rating not found" });
            }

            return Ok(rating);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}

