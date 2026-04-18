/**
 * Worker Model - Database operations for worker profiles
 */
const { pool } = require('../db/index');

class WorkerModel {
    /**
     * Create worker profile
     */
    static async create(workerData) {
        const {
            user_id,
            service_category,
            experience_years = 0,
            hourly_rate,
            service_area,
            id_proof_url
        } = workerData;

        const query = `
            INSERT INTO worker_profiles (
                user_id, service_category, experience_years, 
                hourly_rate, service_area, id_proof_url
            )
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        const [result] = await pool.query(query, [
            user_id,
            service_category,
            experience_years,
            hourly_rate,
            service_area,
            id_proof_url
        ]);

        return result;
    }

    /**
     * Get worker by user ID
     */
    static async getByUserId(userId) {
        const query = `
            SELECT wp.*, u.full_name, u.email, u.phone
            FROM worker_profiles wp
            JOIN users u ON wp.user_id = u.id
            WHERE wp.user_id = ?
        `;

        const [[worker]] = await pool.query(query, [userId]);
        return worker;
    }

    /**
     * Get worker by ID
     */
    static async getById(workerId) {
        const query = `
            SELECT wp.*, u.full_name, u.email, u.phone, u.address
            FROM worker_profiles wp
            JOIN users u ON wp.user_id = u.id
            WHERE wp.id = ?
        `;

        const [[worker]] = await pool.query(query, [workerId]);
        return worker;
    }

    /**
     * Get all workers by category
     */
    static async getByCategory(category, limit = 50) {
        const query = `
            SELECT wp.*, u.full_name, u.email, u.phone
            FROM worker_profiles wp
            JOIN users u ON wp.user_id = u.id
            WHERE wp.service_category = ? 
            AND wp.verification_status = 'verified'
            AND wp.is_available = true
            ORDER BY wp.rating DESC
            LIMIT ?
        `;

        const [workers] = await pool.query(query, [category, limit]);
        return workers;
    }

    /**
     * Get all verified workers
     */
    static async getAllVerified(limit = 100) {
        const query = `
            SELECT wp.*, u.full_name, u.email, u.phone
            FROM worker_profiles wp
            JOIN users u ON wp.user_id = u.id
            WHERE wp.verification_status = 'verified'
            ORDER BY wp.rating DESC
            LIMIT ?
        `;

        const [workers] = await pool.query(query, [limit]);
        return workers;
    }

    /**
     * Get pending verification workers
     */
    static async getPending(limit = 50) {
        const query = `
            SELECT wp.*, u.full_name, u.email, u.phone
            FROM worker_profiles wp
            JOIN users u ON wp.user_id = u.id
            WHERE wp.verification_status = 'pending'
            LIMIT ?
        `;

        const [workers] = await pool.query(query, [limit]);
        return workers;
    }

    /**
     * Update worker verification status
     */
    static async updateVerificationStatus(workerId, status) {
        const query = 'UPDATE worker_profiles SET verification_status = ? WHERE id = ?';
        const [result] = await pool.query(query, [status, workerId]);
        return result;
    }

    /**
     * Update worker availability
     */
    static async updateAvailability(workerId, isAvailable) {
        const query = 'UPDATE worker_profiles SET is_available = ? WHERE id = ?';
        const [result] = await pool.query(query, [isAvailable, workerId]);
        return result;
    }

    /**
     * Update worker rating
     */
    static async updateRating(workerId) {
        const query = `
            UPDATE worker_profiles wp
            SET rating = (
                SELECT IFNULL(AVG(r.rating), 0)
                FROM reviews r
                WHERE r.worker_id = ?
            ),
            total_jobs = (
                SELECT COUNT(*)
                FROM bookings
                WHERE worker_id = ? AND status = 'completed'
            )
            WHERE id = ?
        `;

        const [result] = await pool.query(query, [workerId, workerId, workerId]);
        return result;
    }

    /**
     * Find the highest rated available worker for a category
     */
    static async findAvailableByCategory(category) {
        const query = `
            SELECT wp.*
            FROM worker_profiles wp
            JOIN users u ON wp.user_id = u.id
            WHERE wp.verification_status = 'verified'
              AND wp.is_available = true
              AND (
                wp.service_category = ?
                OR wp.service_category LIKE CONCAT('%', ?, '%')
                OR wp.service_area LIKE CONCAT('%', ?, '%')
              )
            ORDER BY wp.rating DESC, wp.total_jobs DESC
            LIMIT 1
        `;

        const [[worker]] = await pool.query(query, [category, category, category]);
        if (worker) {
            return worker;
        }

        const fallbackQuery = `
            SELECT wp.*
            FROM worker_profiles wp
            JOIN users u ON wp.user_id = u.id
            WHERE wp.verification_status = 'verified'
              AND wp.is_available = true
            ORDER BY wp.rating DESC, wp.total_jobs DESC
            LIMIT 1
        `;

        const [[fallbackWorker]] = await pool.query(fallbackQuery);
        if (fallbackWorker) {
            return fallbackWorker;
        }

        const finalFallbackQuery = `
            SELECT wp.*
            FROM worker_profiles wp
            JOIN users u ON wp.user_id = u.id
            LIMIT 1
        `;
        const [[anyWorker]] = await pool.query(finalFallbackQuery);
        return anyWorker;
    }

    /**
     * Search workers by filters
     */
    static async search(filters = {}) {
        let query = `
            SELECT wp.*, u.full_name, u.email, u.phone
            FROM worker_profiles wp
            JOIN users u ON wp.user_id = u.id
            WHERE wp.verification_status = 'verified'
        `;

        const params = [];

        if (filters.category) {
            query += ' AND wp.service_category = ?';
            params.push(filters.category);
        }

        if (filters.minRating) {
            query += ' AND wp.rating >= ?';
            params.push(filters.minRating);
        }

        if (filters.available !== undefined) {
            query += ' AND wp.is_available = ?';
            params.push(filters.available);
        }

        query += ' ORDER BY wp.rating DESC LIMIT 50';

        const [workers] = await pool.query(query, params);
        return workers;
    }
}

module.exports = WorkerModel;
