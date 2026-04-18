/**
 * Notification Controller - Handles notification endpoints
 */
const NotificationModel = require('../models/notificationModel');

class NotificationController {
    static async getNotifications(req, res) {
        try {
            const userId = req.user.id;
            const notifications = await NotificationModel.getByUserId(userId);

            res.json({
                status: 'ok',
                data: notifications
            });
        } catch (error) {
            console.error('Get notifications error:', error);
            res.status(500).json({
                status: 'error',
                message: error.message || 'Failed to get notifications'
            });
        }
    }

    static async markAsRead(req, res) {
        try {
            const userId = req.user.id;
            const { notificationId } = req.params;

            await NotificationModel.markAsRead(notificationId, userId);

            res.json({
                status: 'ok',
                message: 'Notification marked as read'
            });
        } catch (error) {
            console.error('Mark notification read error:', error);
            res.status(500).json({
                status: 'error',
                message: error.message || 'Failed to update notification'
            });
        }
    }
}

module.exports = NotificationController;
