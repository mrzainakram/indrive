using InDrive.API.Models;

namespace InDrive.API.Services;

public interface INotificationService
{
    Task<Notification> CreateNotificationAsync(Guid userId, string title, string message, string type, Guid? relatedId = null);
    Task<List<Notification>> GetNotificationsAsync(Guid userId, bool unreadOnly = false);
    Task MarkAsReadAsync(Guid notificationId, Guid userId);
    Task MarkAllAsReadAsync(Guid userId);
}

