/**
 * Notification Model - Database operations for notifications
 */
const { pool } = require('../db/index');

class NotificationModel {
    /**
     * Create a notification
     */
    static async create(notificationData) {
        const { user_id, worker_id = null, booking_id = null, type, message } = notificationData;
        const query = `
            INSERT INTO notifications (user_id, worker_id, booking_id, type, message)
            VALUES (?, ?, ?, ?, ?)
        `;

        const [result] = await pool.query(query, [user_id, worker_id, booking_id, type, message]);
        return result;
    }

    /**
     * Get notifications for a user
     */
    static async getByUserId(userId) {
        const query = `
            SELECT *
            FROM notifications
            WHERE user_id = ?
            ORDER BY created_at DESC
            LIMIT 50
        `;

        const [notifications] = await pool.query(query, [userId]);
        return notifications;
    }

    /**
     * Mark notification as read
     */
    static async markAsRead(notificationId, userId) {
        const query = `
            UPDATE notifications
            SET is_read = true
            WHERE id = ? AND user_id = ?
        `;

        const [result] = await pool.query(query, [notificationId, userId]);
        return result;
    }
}

module.exports = NotificationModel;
