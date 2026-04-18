const { pool } = require('../db/index');

class AnalyticsModel {
    static async getOverview() {
        const queries = [
            'SELECT COUNT(*) AS total_users FROM users',
            "SELECT COUNT(*) AS total_workers FROM worker_profiles WHERE verification_status = 'verified'",
            'SELECT COUNT(*) AS total_bookings FROM bookings',
            "SELECT COUNT(*) AS completed_bookings FROM bookings WHERE status = 'completed'",
            'SELECT COUNT(*) AS emergency_bookings FROM bookings WHERE is_emergency = TRUE',
            "SELECT IFNULL(SUM(amount), 0) AS revenue FROM payments WHERE status = 'completed'"
        ];

        const results = await Promise.all(queries.map((query) => pool.query(query)));
        return {
            totalUsers: results[0][0][0].total_users,
            totalWorkers: results[1][0][0].total_workers,
            totalBookings: results[2][0][0].total_bookings,
            completedBookings: results[3][0][0].completed_bookings,
            emergencyBookings: results[4][0][0].emergency_bookings,
            revenue: Number(results[5][0][0].revenue || 0)
        };
    }

    static async getTopRatedWorkers(limit = 5) {
        const query = `
            SELECT wp.id, u.full_name, wp.service_category, wp.rating, wp.total_jobs,
                   wp.hourly_rate, wp.verification_status
            FROM worker_profiles wp
            JOIN users u ON wp.user_id = u.id
            WHERE wp.verification_status = 'verified'
            ORDER BY wp.rating DESC, wp.total_jobs DESC
            LIMIT ?
        `;
        const [rows] = await pool.query(query, [limit]);
        return rows;
    }

    static async getRevenueByDateRange(startDate, endDate) {
        const query = `
            SELECT DATE(p.created_at) AS date,
                   IFNULL(SUM(p.amount), 0) AS revenue,
                   COUNT(p.id) AS payment_count
            FROM payments p
            WHERE p.status = 'completed'
              AND DATE(p.created_at) BETWEEN ? AND ?
            GROUP BY DATE(p.created_at)
            ORDER BY DATE(p.created_at) ASC
        `;

        const [rows] = await pool.query(query, [startDate, endDate]);
        return rows;
    }
}

module.exports = AnalyticsModel;
