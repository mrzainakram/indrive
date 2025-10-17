namespace InDrive.API.Models;

public class Rating
{
    public Guid Id { get; set; }
    public Guid RideId { get; set; }
    public Guid FromUserId { get; set; }
    public Guid ToUserId { get; set; }
    public int RatingValue { get; set; }
    public string? Comment { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class RatingDto
{
    public Guid Id { get; set; }
    public Guid RideId { get; set; }
    public UserDto? FromUser { get; set; }
    public UserDto? ToUser { get; set; }
    public int RatingValue { get; set; }
    public string? Comment { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateRatingRequest
{
    public Guid RideId { get; set; }
    public Guid ToUserId { get; set; }
    public int Rating { get; set; }
    public string? Comment { get; set; }
}

public class Notification
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public Guid? RelatedId { get; set; }
    public bool IsRead { get; set; } = false;
    public DateTime CreatedAt { get; set; }
}

