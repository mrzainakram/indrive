using InDrive.API.Models;

namespace InDrive.API.Services;

public interface IRatingService
{
    Task<RatingDto> CreateRatingAsync(Guid fromUserId, CreateRatingRequest request);
    Task<List<RatingDto>> GetRatingsForUserAsync(Guid userId);
    Task<RatingDto?> GetRatingForRideAsync(Guid rideId, Guid fromUserId);
}

