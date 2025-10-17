using System.Data;
using Dapper;
using InDrive.API.Models;

namespace InDrive.API.Services;

public class NotificationService : INotificationService
{
    private readonly IDbConnection _db;

    public NotificationService(IDbConnection db)
    {
        _db = db;
    }

    public async Task<Notification> CreateNotificationAsync(Guid userId, string title, string message, string type, Guid? relatedId = null)
    {
        var notificationId = await _db.QuerySingleAsync<Guid>(
            @"INSERT INTO notifications (user_id, title, message, type, related_id)
              VALUES (@UserId, @Title, @Message, @Type, @RelatedId)
              RETURNING id",
            new { UserId = userId, Title = title, Message = message, Type = type, RelatedId = relatedId }
        );

        return await _db.QueryFirstAsync<Notification>(
            "SELECT * FROM notifications WHERE id = @Id",
            new { Id = notificationId }
        );
    }

    public async Task<List<Notification>> GetNotificationsAsync(Guid userId, bool unreadOnly = false)
    {
        var sql = "SELECT * FROM notifications WHERE user_id = @UserId";
        if (unreadOnly)
        {
            sql += " AND is_read = false";
        }
        sql += " ORDER BY created_at DESC LIMIT 50";

        var notifications = await _db.QueryAsync<Notification>(sql, new { UserId = userId });
        return notifications.ToList();
    }

    public async Task MarkAsReadAsync(Guid notificationId, Guid userId)
    {
        await _db.ExecuteAsync(
            "UPDATE notifications SET is_read = true WHERE id = @NotificationId AND user_id = @UserId",
            new { NotificationId = notificationId, UserId = userId }
        );
    }

    public async Task MarkAllAsReadAsync(Guid userId)
    {
        await _db.ExecuteAsync(
            "UPDATE notifications SET is_read = true WHERE user_id = @UserId",
            new { UserId = userId }
        );
    }
}

