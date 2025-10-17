using System.Data;
using Dapper;
using InDrive.API.Models;

namespace InDrive.API.Services;

public class RideService : IRideService
{
    private readonly IDbConnection _db;
    private readonly IUserService _userService;
    private readonly IAiFareService _aiFareService;
    private readonly INotificationService _notificationService;

    public RideService(
        IDbConnection db,
        IUserService userService,
        IAiFareService aiFareService,
        INotificationService notificationService)
    {
        _db = db;
        _userService = userService;
        _aiFareService = aiFareService;
        _notificationService = notificationService;
    }

    public async Task<RideDto> CreateRideAsync(Guid riderId, CreateRideRequest request)
    {
        // Calculate distance
        var distance = CalculateDistance(
            (double)request.PickupLatitude, (double)request.PickupLongitude,
            (double)request.DropoffLatitude, (double)request.DropoffLongitude
        );

        // Get AI fare suggestion
        AiFareSuggestion? aiSuggestion = null;
        try
        {
            aiSuggestion = await _aiFareService.GetFareSuggestionAsync(distance);
        }
        catch (Exception)
        {
            // Continue without AI suggestion if service is unavailable
        }

        var rideId = await _db.QuerySingleAsync<Guid>(
            @"INSERT INTO rides (rider_id, pickup_latitude, pickup_longitude, pickup_address,
              dropoff_latitude, dropoff_longitude, dropoff_address, distance_km, rider_offered_fare,
              ai_suggested_fare_min, ai_suggested_fare_max, payment_method, rider_notes, status)
              VALUES (@RiderId, @PickupLatitude, @PickupLongitude, @PickupAddress,
              @DropoffLatitude, @DropoffLongitude, @DropoffAddress, @DistanceKm, @RiderOfferedFare,
              @AiSuggestedFareMin, @AiSuggestedFareMax, @PaymentMethod, @RiderNotes, 'requested')
              RETURNING id",
            new
            {
                RiderId = riderId,
                request.PickupLatitude,
                request.PickupLongitude,
                request.PickupAddress,
                request.DropoffLatitude,
                request.DropoffLongitude,
                request.DropoffAddress,
                DistanceKm = distance,
                request.RiderOfferedFare,
                AiSuggestedFareMin = aiSuggestion?.MinFare,
                AiSuggestedFareMax = aiSuggestion?.MaxFare,
                request.PaymentMethod,
                request.RiderNotes
            }
        );

        // Notify nearby drivers (simplified - in production, use geospatial queries)
        var drivers = await _db.QueryAsync<Guid>(
            "SELECT user_id FROM driver_details WHERE is_available = true"
        );

        foreach (var driverId in drivers)
        {
            await _notificationService.CreateNotificationAsync(
                driverId,
                "New Ride Request",
                $"A new ride request is available nearby for ${request.RiderOfferedFare}",
                "ride_request",
                rideId
            );
        }

        return await GetRideByIdAsync(rideId);
    }

    public async Task<RideDto> GetRideByIdAsync(Guid rideId)
    {
        var ride = await _db.QueryFirstOrDefaultAsync<Ride>(
            "SELECT * FROM rides WHERE id = @RideId",
            new { RideId = rideId }
        );

        if (ride == null)
        {
            throw new Exception("Ride not found");
        }

        var rideDto = new RideDto
        {
            Id = ride.Id,
            Rider = await _userService.GetUserByIdAsync(ride.RiderId),
            Driver = ride.DriverId.HasValue ? await _userService.GetUserByIdAsync(ride.DriverId.Value) : null,
            PickupLatitude = ride.PickupLatitude,
            PickupLongitude = ride.PickupLongitude,
            PickupAddress = ride.PickupAddress,
            DropoffLatitude = ride.DropoffLatitude,
            DropoffLongitude = ride.DropoffLongitude,
            DropoffAddress = ride.DropoffAddress,
            DistanceKm = ride.DistanceKm,
            DurationMinutes = ride.DurationMinutes,
            RiderOfferedFare = ride.RiderOfferedFare,
            DriverCounterFare = ride.DriverCounterFare,
            FinalFare = ride.FinalFare,
            AiSuggestedFareMin = ride.AiSuggestedFareMin,
            AiSuggestedFareMax = ride.AiSuggestedFareMax,
            Status = ride.Status,
            PaymentMethod = ride.PaymentMethod,
            PaymentStatus = ride.PaymentStatus,
            RiderNotes = ride.RiderNotes,
            DriverNotes = ride.DriverNotes,
            RequestedAt = ride.RequestedAt,
            AcceptedAt = ride.AcceptedAt,
            StartedAt = ride.StartedAt,
            CompletedAt = ride.CompletedAt
        };

        // Get offers
        var offers = await _db.QueryAsync<RideOffer>(
            "SELECT * FROM ride_offers WHERE ride_id = @RideId ORDER BY created_at DESC",
            new { RideId = rideId }
        );

        foreach (var offer in offers)
        {
            offer.Driver = await _userService.GetUserByIdAsync(offer.DriverId);
        }

        rideDto.Offers = offers.ToList();

        return rideDto;
    }

    public async Task<List<RideDto>> GetRidesForRiderAsync(Guid riderId, string? status = null)
    {
        var sql = "SELECT * FROM rides WHERE rider_id = @RiderId";
        if (!string.IsNullOrEmpty(status))
        {
            sql += " AND status = @Status";
        }
        sql += " ORDER BY created_at DESC";

        var rides = await _db.QueryAsync<Ride>(sql, new { RiderId = riderId, Status = status });
        var rideDtos = new List<RideDto>();

        foreach (var ride in rides)
        {
            rideDtos.Add(await GetRideByIdAsync(ride.Id));
        }

        return rideDtos;
    }

    public async Task<List<RideDto>> GetRidesForDriverAsync(Guid driverId, string? status = null)
    {
        var sql = "SELECT * FROM rides WHERE driver_id = @DriverId";
        if (!string.IsNullOrEmpty(status))
        {
            sql += " AND status = @Status";
        }
        sql += " ORDER BY created_at DESC";

        var rides = await _db.QueryAsync<Ride>(sql, new { DriverId = driverId, Status = status });
        var rideDtos = new List<RideDto>();

        foreach (var ride in rides)
        {
            rideDtos.Add(await GetRideByIdAsync(ride.Id));
        }

        return rideDtos;
    }

    public async Task<List<RideDto>> GetAvailableRidesAsync(Guid driverId)
    {
        // Get rides that don't have driver assigned yet and driver hasn't offered for
        var rides = await _db.QueryAsync<Ride>(
            @"SELECT r.* FROM rides r
              WHERE r.status = 'requested' 
              AND r.driver_id IS NULL
              AND NOT EXISTS (
                  SELECT 1 FROM ride_offers ro 
                  WHERE ro.ride_id = r.id AND ro.driver_id = @DriverId
              )
              ORDER BY r.created_at DESC
              LIMIT 20",
            new { DriverId = driverId }
        );

        var rideDtos = new List<RideDto>();
        foreach (var ride in rides)
        {
            rideDtos.Add(await GetRideByIdAsync(ride.Id));
        }

        return rideDtos;
    }

    public async Task<RideOffer> CreateOfferAsync(Guid driverId, CreateOfferRequest request)
    {
        // Check if ride exists and is available
        var ride = await _db.QueryFirstOrDefaultAsync<Ride>(
            "SELECT * FROM rides WHERE id = @RideId AND status = 'requested'",
            new { request.RideId }
        );

        if (ride == null)
        {
            throw new Exception("Ride not found or not available");
        }

        var offerId = await _db.QuerySingleAsync<Guid>(
            @"INSERT INTO ride_offers (ride_id, driver_id, offered_fare, estimated_arrival_minutes, message)
              VALUES (@RideId, @DriverId, @OfferedFare, @EstimatedArrivalMinutes, @Message)
              RETURNING id",
            new
            {
                request.RideId,
                DriverId = driverId,
                request.OfferedFare,
                request.EstimatedArrivalMinutes,
                request.Message
            }
        );

        // Update ride status to 'offered' if first offer
        await _db.ExecuteAsync(
            "UPDATE rides SET status = 'offered' WHERE id = @RideId AND status = 'requested'",
            new { request.RideId }
        );

        // Notify rider
        await _notificationService.CreateNotificationAsync(
            ride.RiderId,
            "New Offer Received",
            $"A driver has offered ${request.OfferedFare} for your ride",
            "ride_offer",
            request.RideId
        );

        var offer = await _db.QueryFirstAsync<RideOffer>(
            "SELECT * FROM ride_offers WHERE id = @Id",
            new { Id = offerId }
        );

        offer.Driver = await _userService.GetUserByIdAsync(driverId);

        return offer;
    }

    public async Task<RideDto> AcceptOfferAsync(Guid riderId, Guid offerId)
    {
        var offer = await _db.QueryFirstOrDefaultAsync<RideOffer>(
            "SELECT * FROM ride_offers WHERE id = @OfferId",
            new { OfferId = offerId }
        );

        if (offer == null)
        {
            throw new Exception("Offer not found");
        }

        var ride = await _db.QueryFirstOrDefaultAsync<Ride>(
            "SELECT * FROM rides WHERE id = @RideId AND rider_id = @RiderId",
            new { offer.RideId, RiderId = riderId }
        );

        if (ride == null)
        {
            throw new Exception("Ride not found or unauthorized");
        }

        // Update ride with accepted offer
        await _db.ExecuteAsync(
            @"UPDATE rides 
              SET driver_id = @DriverId, final_fare = @FinalFare, status = 'accepted', accepted_at = @AcceptedAt
              WHERE id = @RideId",
            new
            {
                DriverId = offer.DriverId,
                FinalFare = offer.OfferedFare,
                AcceptedAt = DateTime.UtcNow,
                offer.RideId
            }
        );

        // Update offer status
        await _db.ExecuteAsync(
            "UPDATE ride_offers SET status = 'accepted' WHERE id = @OfferId",
            new { OfferId = offerId }
        );

        // Reject other offers
        await _db.ExecuteAsync(
            "UPDATE ride_offers SET status = 'rejected' WHERE ride_id = @RideId AND id != @OfferId",
            new { offer.RideId, OfferId = offerId }
        );

        // Notify driver
        await _notificationService.CreateNotificationAsync(
            offer.DriverId,
            "Offer Accepted",
            "Your offer has been accepted! Please head to pickup location",
            "offer_accepted",
            offer.RideId
        );

        return await GetRideByIdAsync(offer.RideId);
    }

    public async Task<RideDto> UpdateRideStatusAsync(Guid rideId, string status, Guid userId, string? cancellationReason = null)
    {
        var ride = await _db.QueryFirstOrDefaultAsync<Ride>(
            "SELECT * FROM rides WHERE id = @RideId",
            new { RideId = rideId }
        );

        if (ride == null)
        {
            throw new Exception("Ride not found");
        }

        var updateSql = "UPDATE rides SET status = @Status";
        var parameters = new DynamicParameters();
        parameters.Add("RideId", rideId);
        parameters.Add("Status", status);

        if (status == "started")
        {
            updateSql += ", started_at = @StartedAt";
            parameters.Add("StartedAt", DateTime.UtcNow);
        }
        else if (status == "completed")
        {
            updateSql += ", completed_at = @CompletedAt, payment_status = 'completed'";
            parameters.Add("CompletedAt", DateTime.UtcNow);
        }
        else if (status == "cancelled")
        {
            updateSql += ", cancelled_at = @CancelledAt, cancelled_by = @CancelledBy, cancellation_reason = @CancellationReason";
            parameters.Add("CancelledAt", DateTime.UtcNow);
            parameters.Add("CancelledBy", userId);
            parameters.Add("CancellationReason", cancellationReason);
        }

        updateSql += " WHERE id = @RideId";

        await _db.ExecuteAsync(updateSql, parameters);

        // Send notification
        var notifyUserId = userId == ride.RiderId ? ride.DriverId : ride.RiderId;
        if (notifyUserId.HasValue)
        {
            await _notificationService.CreateNotificationAsync(
                notifyUserId.Value,
                $"Ride {status}",
                $"Your ride has been {status}",
                $"ride_{status}",
                rideId
            );
        }

        return await GetRideByIdAsync(rideId);
    }

    public async Task<List<RideDto>> GetAllRidesAsync(int page = 1, int pageSize = 50)
    {
        var offset = (page - 1) * pageSize;
        var rides = await _db.QueryAsync<Ride>(
            "SELECT * FROM rides ORDER BY created_at DESC LIMIT @PageSize OFFSET @Offset",
            new { PageSize = pageSize, Offset = offset }
        );

        var rideDtos = new List<RideDto>();
        foreach (var ride in rides)
        {
            rideDtos.Add(await GetRideByIdAsync(ride.Id));
        }

        return rideDtos;
    }

    private double CalculateDistance(double lat1, double lon1, double lat2, double lon2)
    {
        const double R = 6371; // Earth's radius in kilometers
        var dLat = ToRadians(lat2 - lat1);
        var dLon = ToRadians(lon2 - lon1);

        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(ToRadians(lat1)) * Math.Cos(ToRadians(lat2)) *
                Math.Sin(dLon / 2) * Math.Sin(dLon / 2);

        var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
        return R * c;
    }

    private double ToRadians(double degrees) => degrees * Math.PI / 180;
}

