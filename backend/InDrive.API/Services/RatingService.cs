using System.Data;
using Dapper;
using InDrive.API.Models;

namespace InDrive.API.Services;

public class RatingService : IRatingService
{
    private readonly IDbConnection _db;
    private readonly IUserService _userService;

    public RatingService(IDbConnection db, IUserService userService)
    {
        _db = db;
        _userService = userService;
    }

    public async Task<RatingDto> CreateRatingAsync(Guid fromUserId, CreateRatingRequest request)
    {
        // Check if rating already exists
        var existingRating = await _db.QueryFirstOrDefaultAsync<Rating>(
            "SELECT * FROM ratings WHERE ride_id = @RideId AND from_user_id = @FromUserId",
            new { request.RideId, FromUserId = fromUserId }
        );

        if (existingRating != null)
        {
            throw new Exception("You have already rated this ride");
        }

        // Verify ride exists and user was part of it
        var ride = await _db.QueryFirstOrDefaultAsync<Ride>(
            "SELECT * FROM rides WHERE id = @RideId AND (rider_id = @UserId OR driver_id = @UserId)",
            new { request.RideId, UserId = fromUserId }
        );

        if (ride == null)
        {
            throw new Exception("Ride not found or you were not part of this ride");
        }

        if (ride.Status != "completed")
        {
            throw new Exception("Can only rate completed rides");
        }

        // Create rating
        var ratingId = await _db.QuerySingleAsync<Guid>(
            @"INSERT INTO ratings (ride_id, from_user_id, to_user_id, rating, comment)
              VALUES (@RideId, @FromUserId, @ToUserId, @Rating, @Comment)
              RETURNING id",
            new
            {
                request.RideId,
                FromUserId = fromUserId,
                request.ToUserId,
                Rating = request.Rating,
                request.Comment
            }
        );

        // Update user's average rating
        var avgRating = await _db.QueryFirstAsync<(decimal rating, int count)>(
            "SELECT AVG(rating)::decimal, COUNT(*)::int FROM ratings WHERE to_user_id = @UserId",
            new { UserId = request.ToUserId }
        );

        await _db.ExecuteAsync(
            "UPDATE users SET rating = @Rating, total_ratings = @TotalRatings WHERE id = @UserId",
            new { Rating = avgRating.rating, TotalRatings = avgRating.count, UserId = request.ToUserId }
        );

        var rating = await _db.QueryFirstAsync<Rating>(
            "SELECT * FROM ratings WHERE id = @Id",
            new { Id = ratingId }
        );

        return new RatingDto
        {
            Id = rating.Id,
            RideId = rating.RideId,
            FromUser = await _userService.GetUserByIdAsync(rating.FromUserId),
            ToUser = await _userService.GetUserByIdAsync(rating.ToUserId),
            RatingValue = rating.RatingValue,
            Comment = rating.Comment,
            CreatedAt = rating.CreatedAt
        };
    }

    public async Task<List<RatingDto>> GetRatingsForUserAsync(Guid userId)
    {
        var ratings = await _db.QueryAsync<Rating>(
            "SELECT * FROM ratings WHERE to_user_id = @UserId ORDER BY created_at DESC",
            new { UserId = userId }
        );

        var ratingDtos = new List<RatingDto>();
        foreach (var rating in ratings)
        {
            ratingDtos.Add(new RatingDto
            {
                Id = rating.Id,
                RideId = rating.RideId,
                FromUser = await _userService.GetUserByIdAsync(rating.FromUserId),
                ToUser = await _userService.GetUserByIdAsync(rating.ToUserId),
                RatingValue = rating.RatingValue,
                Comment = rating.Comment,
                CreatedAt = rating.CreatedAt
            });
        }

        return ratingDtos;
    }

    public async Task<RatingDto?> GetRatingForRideAsync(Guid rideId, Guid fromUserId)
    {
        var rating = await _db.QueryFirstOrDefaultAsync<Rating>(
            "SELECT * FROM ratings WHERE ride_id = @RideId AND from_user_id = @FromUserId",
            new { RideId = rideId, FromUserId = fromUserId }
        );

        if (rating == null) return null;

        return new RatingDto
        {
            Id = rating.Id,
            RideId = rating.RideId,
            FromUser = await _userService.GetUserByIdAsync(rating.FromUserId),
            ToUser = await _userService.GetUserByIdAsync(rating.ToUserId),
            RatingValue = rating.RatingValue,
            Comment = rating.Comment,
            CreatedAt = rating.CreatedAt
        };
    }
}

