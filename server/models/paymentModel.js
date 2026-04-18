/**
 * Payment Model - Handles payment-related database operations
 */
const db = require('../db/index');

class PaymentModel {
    /**
     * Create a new payment record
     */
    static async create(paymentData) {
        const {
            booking_id,
            amount,
            currency = 'INR',
            payment_method,
            gateway,
            transaction_id,
            status = 'pending',
            customer_id,
            reference_id,
            error_message,
            metadata
        } = paymentData;

        const query = `
            INSERT INTO payments (
                booking_id, amount, currency, payment_method, gateway,
                transaction_id, status, customer_id, reference_id,
                error_message, metadata
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            booking_id, amount, currency, payment_method, gateway,
            transaction_id, status, customer_id, reference_id,
            error_message, JSON.stringify(metadata || {})
        ];

        try {
            const [result] = await db.execute(query, values);
            return {
                id: result.insertId,
                ...paymentData
            };
        } catch (error) {
            console.error('Error creating payment:', error);
            throw error;
        }
    }

    /**
     * Get payment by booking ID
     */
    static async getByBookingId(bookingId) {
        const query = 'SELECT * FROM payments WHERE booking_id = ?';
        try {
            const [rows] = await db.execute(query, [bookingId]);
            return rows[0] || null;
        } catch (error) {
            console.error('Error getting payment by booking ID:', error);
            throw error;
        }
    }

    /**
     * Get payment by ID
     */
    static async getById(paymentId) {
        const query = 'SELECT * FROM payments WHERE id = ?';
        try {
            const [rows] = await db.execute(query, [paymentId]);
            return rows[0] || null;
        } catch (error) {
            console.error('Error getting payment by ID:', error);
            throw error;
        }
    }

    /**
     * Update payment status
     */
    static async updateStatus(paymentId, status, transactionId = null, errorMessage = null) {
        const query = `
            UPDATE payments
            SET status = ?, transaction_id = COALESCE(?, transaction_id),
                error_message = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;

        try {
            const [result] = await db.execute(query, [status, transactionId, errorMessage, paymentId]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error updating payment status:', error);
            throw error;
        }
    }

    /**
     * Update payment by booking ID
     */
    static async updateByBookingId(bookingId, updateData) {
        const { status, transaction_id, error_message, metadata } = updateData;

        const query = `
            UPDATE payments
            SET status = ?, transaction_id = COALESCE(?, transaction_id),
                error_message = ?, metadata = ?, updated_at = CURRENT_TIMESTAMP
            WHERE booking_id = ?
        `;

        try {
            const [result] = await db.execute(query, [
                status, transaction_id, error_message,
                JSON.stringify(metadata || {}), bookingId
            ]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error updating payment by booking ID:', error);
            throw error;
        }
    }

    /**
     * Get payments by status
     */
    static async getByStatus(status, limit = 50, offset = 0) {
        const query = `
            SELECT p.*, b.service_category, b.total_amount,
                   u.full_name as user_name, u.email as user_email
            FROM payments p
            JOIN bookings b ON p.booking_id = b.id
            JOIN users u ON b.user_id = u.id
            WHERE p.status = ?
            ORDER BY p.created_at DESC
            LIMIT ? OFFSET ?
        `;

        try {
            const [rows] = await db.execute(query, [status, limit, offset]);
            return rows;
        } catch (error) {
            console.error('Error getting payments by status:', error);
            throw error;
        }
    }

    /**
     * Get payment statistics
     */
    static async getStatistics() {
        const query = `
            SELECT
                COUNT(*) as total_payments,
                SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as total_revenue,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_payments,
                SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed_payments,
                AVG(CASE WHEN status = 'completed' THEN amount ELSE NULL END) as avg_payment_amount
            FROM payments
        `;

        try {
            const [rows] = await db.execute(query);
            return rows[0];
        } catch (error) {
            console.error('Error getting payment statistics:', error);
            throw error;
        }
    }

    /**
     * Process refund
     */
    static async processRefund(paymentId, refundAmount, reason) {
        const query = `
            UPDATE payments
            SET status = 'refunded',
                metadata = JSON_SET(COALESCE(metadata, '{}'), '$.refund_amount', ?),
                metadata = JSON_SET(COALESCE(metadata, '{}'), '$.refund_reason', ?),
                metadata = JSON_SET(COALESCE(metadata, '{}'), '$.refunded_at', ?),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ? AND status = 'completed'
        `;

        try {
            const [result] = await db.execute(query, [
                refundAmount, reason, new Date().toISOString(), paymentId
            ]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error processing refund:', error);
            throw error;
        }
    }

    /**
     * Get payments for admin dashboard
     */
    static async getForAdmin(limit = 50, offset = 0) {
        const query = `
            SELECT
                p.*,
                b.service_category,
                b.scheduled_date,
                u.full_name as user_name,
                u.email as user_email,
                w.user_id as worker_user_id,
                wu.full_name as worker_name
            FROM payments p
            JOIN bookings b ON p.booking_id = b.id
            JOIN users u ON b.user_id = u.id
            JOIN worker_profiles w ON b.worker_id = w.id
            JOIN users wu ON w.user_id = wu.id
            ORDER BY p.created_at DESC
            LIMIT ? OFFSET ?
        `;

        try {
            const [rows] = await db.execute(query, [limit, offset]);
            return rows;
        } catch (error) {
            console.error('Error getting payments for admin:', error);
            throw error;
        }
    }
}

module.exports = PaymentModel;