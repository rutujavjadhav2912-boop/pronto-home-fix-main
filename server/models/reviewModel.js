/**
 * Review Model - Database operations for reviews and ratings
 */
const { pool } = require('../db/index');

class ReviewModel {
    /**
     * Create a review
     */
    static async create(reviewData) {
        const { booking_id, user_id, worker_id, rating, comment = '' } = reviewData;

        const query = `
            INSERT INTO reviews (booking_id, user_id, worker_id, rating, comment)
            VALUES (?, ?, ?, ?, ?)
        `;

        const [result] = await pool.query(query, [
            booking_id,
            user_id,
            worker_id,
            rating,
            comment
        ]);

        return result;
    }

    /**
     * Get review by booking ID
     */
    static async getByBookingId(bookingId) {
        const query = `
            SELECT r.*, u.full_name as reviewer_name
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            WHERE r.booking_id = ?
        `;

        const [[review]] = await pool.query(query, [bookingId]);
        return review;
    }

    /**
     * Get review by its primary key (id)
     */
    static async getById(reviewId) {
        const query = `
            SELECT r.*, u.full_name as reviewer_name
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            WHERE r.id = ?
        `;

        const [[review]] = await pool.query(query, [reviewId]);
        return review;
    }

    /**
     * Get worker reviews
     */
    static async getWorkerReviews(workerId, limit = 50) {
        const query = `
            SELECT r.*, 
                   u.full_name as user_name,
                   b.service_category
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            JOIN bookings b ON r.booking_id = b.id
            WHERE r.worker_id = ?
            ORDER BY r.created_at DESC
            LIMIT ?
        `;

        const [reviews] = await pool.query(query, [workerId, limit]);
        return reviews;
    }

    /**
     * Get average rating for worker
     */
    static async getAverageRating(workerId) {
        const query = `
            SELECT AVG(rating) as average_rating, COUNT(*) as total_reviews
            FROM reviews
            WHERE worker_id = ?
        `;

        const [[result]] = await pool.query(query, [workerId]);
        return result;
    }

    /**
     * Check if review exists
     */
    static async exists(bookingId) {
        const query = 'SELECT id FROM reviews WHERE booking_id = ?';
        const [[result]] = await pool.query(query, [bookingId]);
        return !!result;
    }

    /**
     * Update review
     */
    static async update(reviewId, reviewData) {
        const { rating, comment } = reviewData;
        const query = 'UPDATE reviews SET rating = ?, comment = ? WHERE id = ?';
        const [result] = await pool.query(query, [rating, comment, reviewId]);
        return result;
    }

    /**
     * Delete review
     */
    static async delete(reviewId) {
        const query = 'DELETE FROM reviews WHERE id = ?';
        const [result] = await pool.query(query, [reviewId]);
        return result;
    }
}

module.exports = ReviewModel;
