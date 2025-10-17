namespace InDrive.API.Models;

public class Ride
{
    public Guid Id { get; set; }
    public Guid RiderId { get; set; }
    public Guid? DriverId { get; set; }
    public decimal PickupLatitude { get; set; }
    public decimal PickupLongitude { get; set; }
    public string PickupAddress { get; set; } = string.Empty;
    public decimal DropoffLatitude { get; set; }
    public decimal DropoffLongitude { get; set; }
    public string DropoffAddress { get; set; } = string.Empty;
    public decimal? DistanceKm { get; set; }
    public int? DurationMinutes { get; set; }
    public decimal RiderOfferedFare { get; set; }
    public decimal? DriverCounterFare { get; set; }
    public decimal? FinalFare { get; set; }
    public decimal? AiSuggestedFareMin { get; set; }
    public decimal? AiSuggestedFareMax { get; set; }
    public string Status { get; set; } = "requested";
    public string PaymentMethod { get; set; } = "cash";
    public string PaymentStatus { get; set; } = "pending";
    public string? RiderNotes { get; set; }
    public string? DriverNotes { get; set; }
    public string? CancellationReason { get; set; }
    public Guid? CancelledBy { get; set; }
    public DateTime RequestedAt { get; set; }
    public DateTime? AcceptedAt { get; set; }
    public DateTime? StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public DateTime? CancelledAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class RideDto
{
    public Guid Id { get; set; }
    public UserDto? Rider { get; set; }
    public UserDto? Driver { get; set; }
    public decimal PickupLatitude { get; set; }
    public decimal PickupLongitude { get; set; }
    public string PickupAddress { get; set; } = string.Empty;
    public decimal DropoffLatitude { get; set; }
    public decimal DropoffLongitude { get; set; }
    public string DropoffAddress { get; set; } = string.Empty;
    public decimal? DistanceKm { get; set; }
    public int? DurationMinutes { get; set; }
    public decimal RiderOfferedFare { get; set; }
    public decimal? DriverCounterFare { get; set; }
    public decimal? FinalFare { get; set; }
    public decimal? AiSuggestedFareMin { get; set; }
    public decimal? AiSuggestedFareMax { get; set; }
    public string Status { get; set; } = string.Empty;
    public string PaymentMethod { get; set; } = string.Empty;
    public string PaymentStatus { get; set; } = string.Empty;
    public string? RiderNotes { get; set; }
    public string? DriverNotes { get; set; }
    public List<RideOffer> Offers { get; set; } = new();
    public DateTime RequestedAt { get; set; }
    public DateTime? AcceptedAt { get; set; }
    public DateTime? StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
}

public class RideOffer
{
    public Guid Id { get; set; }
    public Guid RideId { get; set; }
    public Guid DriverId { get; set; }
    public decimal OfferedFare { get; set; }
    public int? EstimatedArrivalMinutes { get; set; }
    public string Status { get; set; } = "pending";
    public string? Message { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public UserDto? Driver { get; set; }
}

public class CreateRideRequest
{
    public decimal PickupLatitude { get; set; }
    public decimal PickupLongitude { get; set; }
    public string PickupAddress { get; set; } = string.Empty;
    public decimal DropoffLatitude { get; set; }
    public decimal DropoffLongitude { get; set; }
    public string DropoffAddress { get; set; } = string.Empty;
    public decimal RiderOfferedFare { get; set; }
    public string PaymentMethod { get; set; } = "cash";
    public string? RiderNotes { get; set; }
}

public class CreateOfferRequest
{
    public Guid RideId { get; set; }
    public decimal OfferedFare { get; set; }
    public int? EstimatedArrivalMinutes { get; set; }
    public string? Message { get; set; }
}

public class UpdateRideStatusRequest
{
    public string Status { get; set; } = string.Empty;
    public string? CancellationReason { get; set; }
}

public class AiFareSuggestion
{
    public decimal MinFare { get; set; }
    public decimal MaxFare { get; set; }
    public decimal AverageFare { get; set; }
    public string Message { get; set; } = string.Empty;
}

