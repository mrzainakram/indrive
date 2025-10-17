using InDrive.API.Models;

namespace InDrive.API.Services;

public interface IRideService
{
    Task<RideDto> CreateRideAsync(Guid riderId, CreateRideRequest request);
    Task<RideDto> GetRideByIdAsync(Guid rideId);
    Task<List<RideDto>> GetRidesForRiderAsync(Guid riderId, string? status = null);
    Task<List<RideDto>> GetRidesForDriverAsync(Guid driverId, string? status = null);
    Task<List<RideDto>> GetAvailableRidesAsync(Guid driverId);
    Task<RideOffer> CreateOfferAsync(Guid driverId, CreateOfferRequest request);
    Task<RideDto> AcceptOfferAsync(Guid riderId, Guid offerId);
    Task<RideDto> UpdateRideStatusAsync(Guid rideId, string status, Guid userId, string? cancellationReason = null);
    Task<List<RideDto>> GetAllRidesAsync(int page = 1, int pageSize = 50);
}

