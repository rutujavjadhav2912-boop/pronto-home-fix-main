/**
 * Booking Model - Database operations for bookings
 */
const { pool } = require('../db/index');

class BookingModel {
    /**
     * Create a booking
     */
    static async create(bookingData) {
        const {
            user_id,
            worker_id,
            service_category,
            scheduled_date,
            scheduled_time,
            address,
            description = '',
            is_emergency = false,
            total_amount,
            payment_method,
            payment_status
        } = bookingData;

        const query = `
            INSERT INTO bookings (
                user_id, worker_id, service_category,
                scheduled_date, scheduled_time, address,
                description, is_emergency, total_amount,
                payment_method, payment_status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await pool.query(query, [
            user_id,
            worker_id,
            service_category,
            scheduled_date,
            scheduled_time,
            address,
            description,
            is_emergency,
            total_amount,
            payment_method || 'cash',
            payment_status || 'unpaid'
        ]);

        return result;
    }

    /**
     * Get booking by ID
     */
    static async getById(bookingId) {
        const query = `
            SELECT b.*, 
                   u.full_name as user_name, u.phone as user_phone, u.email as user_email,
                   wp.user_id AS worker_user_id, wp.hourly_rate, u2.full_name as worker_name, u2.phone as worker_phone
            FROM bookings b
            JOIN users u ON b.user_id = u.id
            JOIN worker_profiles wp ON b.worker_id = wp.id
            JOIN users u2 ON wp.user_id = u2.id
            WHERE b.id = ?
        `;

        const [[booking]] = await pool.query(query, [bookingId]);
        return booking;
    }

    static async findConflictingBooking(workerId, scheduledDate, scheduledTime) {
        const query = `
            SELECT 1 FROM bookings
            WHERE worker_id = ?
              AND scheduled_date = ?
              AND scheduled_time = ?
              AND status NOT IN ('cancelled', 'completed')
            LIMIT 1
        `;

        const [rows] = await pool.query(query, [workerId, scheduledDate, scheduledTime]);
        return rows.length > 0;
    }

    static async getBookedSlots(workerId, scheduledDate) {
        const query = `
            SELECT scheduled_time
            FROM bookings
            WHERE worker_id = ?
              AND scheduled_date = ?
              AND status NOT IN ('cancelled', 'completed')
        `;

        const [rows] = await pool.query(query, [workerId, scheduledDate]);
        return rows.map((row) => row.scheduled_time);
    }

    static async createRescheduleRequest(requestData) {
        const {
            booking_id,
            user_id,
            worker_id,
            requested_date,
            requested_time,
            reason
        } = requestData;

        const query = `
            INSERT INTO booking_reschedule_requests (
                booking_id, user_id, worker_id,
                requested_date, requested_time, reason,
                status, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, 'pending', CURRENT_TIMESTAMP)
        `;

        const [result] = await pool.query(query, [
            booking_id,
            user_id,
            worker_id,
            requested_date,
            requested_time,
            reason || ''
        ]);

        return result;
    }

    static async getRescheduleRequestByBooking(bookingId) {
        const query = `
            SELECT * FROM booking_reschedule_requests
            WHERE booking_id = ?
            ORDER BY created_at DESC
            LIMIT 1
        `;

        const [[request]] = await pool.query(query, [bookingId]);
        return request;
    }

    static async updateRescheduleRequest(requestId, updates) {
        const query = `
            UPDATE booking_reschedule_requests
            SET status = ?, response_note = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;
        const [result] = await pool.query(query, [
            updates.status,
            updates.response_note || null,
            requestId
        ]);
        return result;
    }

    static async updateBookingSchedule(bookingId, updates) {
        const query = `
            UPDATE bookings
            SET scheduled_date = ?, scheduled_time = ?, rescheduled_from = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;
        const [result] = await pool.query(query, [
            updates.scheduled_date,
            updates.scheduled_time,
            updates.rescheduled_from || null,
            bookingId
        ]);
        return result;
    }

    static async getUpcomingBookings(userId, limit = 20) {
        const query = `
            SELECT b.*,
                   wp.user_id as worker_user_id, wp.hourly_rate, wp.rating,
                   u.full_name as worker_name, u.phone as worker_phone
            FROM bookings b
            JOIN worker_profiles wp ON b.worker_id = wp.id
            JOIN users u ON wp.user_id = u.id
            WHERE b.user_id = ?
              AND b.status IN ('pending', 'accepted', 'in_progress')
            ORDER BY b.scheduled_date ASC, b.scheduled_time ASC
            LIMIT ?
        `;

        const [bookings] = await pool.query(query, [userId, limit]);
        return bookings;
    }

    /**
     * Get user bookings
     */
    static async getUserBookings(userId, limit = 50) {
        const query = `
            SELECT b.*, 
                   wp.user_id as worker_user_id, wp.hourly_rate, wp.rating,
                   u.full_name as worker_name, u.phone as worker_phone
            FROM bookings b
            JOIN worker_profiles wp ON b.worker_id = wp.id
            JOIN users u ON wp.user_id = u.id
            WHERE b.user_id = ?
            ORDER BY b.created_at DESC
            LIMIT ?
        `;

        const [bookings] = await pool.query(query, [userId, limit]);
        return bookings;
    }

    /**
     * Get worker bookings
     */
    static async getWorkerBookings(workerId, limit = 50) {
        const query = `
            SELECT b.*,
                   u.full_name as user_name, u.phone as user_phone, u.email as user_email
            FROM bookings b
            JOIN users u ON b.user_id = u.id
            WHERE b.worker_id = ?
            ORDER BY b.scheduled_date ASC, b.scheduled_time ASC
            LIMIT ?
        `;

        const [bookings] = await pool.query(query, [workerId, limit]);
        return bookings;
    }

    /**
     * Update booking status
     */
    static async updateStatus(bookingId, status) {
        const query = 'UPDATE bookings SET status = ? WHERE id = ?';
        const [result] = await pool.query(query, [status, bookingId]);
        return result;
    }

    /**
     * Cancel booking
     */
    static async cancel(bookingId, reason = '') {
        let query = 'UPDATE bookings SET status = ?, notes = ? WHERE id = ?';
        const [result] = await pool.query(query, ['cancelled', reason, bookingId]);
        return result;
    }

    /**
     * Mark booking payment as paid
     */
    static async markPaymentPaid(bookingId, paymentMethod = 'card') {
        const query = `
            UPDATE bookings
            SET payment_status = 'paid', payment_method = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;
        const [result] = await pool.query(query, [paymentMethod, bookingId]);
        return result;
    }

    /**
     * Get pending bookings (for workers)
     */
    static async getPending(workerId) {
        const query = `
            SELECT b.*,
                   u.full_name as user_name, u.phone as user_phone, u.address as user_address
            FROM bookings b
            JOIN users u ON b.user_id = u.id
            WHERE b.worker_id = ? AND b.status = 'pending'
            ORDER BY b.created_at DESC
        `;

        const [bookings] = await pool.query(query, [workerId]);
        return bookings;
    }

    /**
     * Get active bookings
     */
    static async getActive(workerId) {
        const query = `
            SELECT b.*,
                   u.full_name as user_name, u.phone as user_phone
            FROM bookings b
            JOIN users u ON b.user_id = u.id
            WHERE b.worker_id = ? AND b.status IN ('accepted', 'in_progress')
            ORDER BY b.scheduled_date ASC
        `;

        const [bookings] = await pool.query(query, [workerId]);
        return bookings;
    }

    /**
     * Get completed bookings
     */
    static async getCompleted(workerId) {
        const query = `
            SELECT b.*,
                   u.full_name as user_name, u.phone as user_phone
            FROM bookings b
            JOIN users u ON b.user_id = u.id
            WHERE b.worker_id = ? AND b.status = 'completed'
            ORDER BY b.created_at DESC
            LIMIT 50
        `;

        const [bookings] = await pool.query(query, [workerId]);
        return bookings;
    }

    /**
     * Get all bookings (admin)
     */
    static async getAll(limit = 100) {
        const query = `
            SELECT b.*,
                   u.full_name as user_name, u.email as user_email,
                   wp.user_id as worker_user_id,
                   u2.full_name as worker_name
            FROM bookings b
            JOIN users u ON b.user_id = u.id
            JOIN worker_profiles wp ON b.worker_id = wp.id
            JOIN users u2 ON wp.user_id = u2.id
            ORDER BY b.created_at DESC
            LIMIT ?
        `;

        const [bookings] = await pool.query(query, [limit]);
        return bookings;
    }

    /**
     * Get bookings count
     */
    static async getCount() {
        const query = 'SELECT COUNT(*) as count FROM bookings';
        const [[result]] = await pool.query(query);
        return result.count;
    }

    /**
     * Get emergency bookings
     */
    static async getEmergency() {
        const query = `
            SELECT b.*,
                   u.full_name as user_name, u.phone as user_phone,
                   u2.full_name as worker_name
            FROM bookings b
            JOIN users u ON b.user_id = u.id
            JOIN worker_profiles wp ON b.worker_id = wp.id
            JOIN users u2 ON wp.user_id = u2.id
            WHERE b.is_emergency = true AND b.status = 'pending'
            ORDER BY b.created_at DESC
        `;

        const [bookings] = await pool.query(query);
        return bookings;
    }
}

module.exports = BookingModel;
