const mysql = require('mysql2/promise');
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'service_website'
};

async function test() {
    const pool = mysql.createPool(dbConfig);
    try {
        const queries = [
            'SELECT COUNT(*) AS total_users FROM users',
            "SELECT COUNT(*) AS total_workers FROM worker_profiles WHERE verification_status = 'verified'",
            'SELECT COUNT(*) AS total_bookings FROM bookings',
            "SELECT COUNT(*) AS completed_bookings FROM bookings WHERE status = 'completed'",
            'SELECT COUNT(*) AS emergency_bookings FROM bookings WHERE is_emergency = TRUE',
            "SELECT IFNULL(SUM(amount), 0) AS revenue FROM payments WHERE status = 'completed'"
        ];

        const results = await Promise.all(queries.map((query) => pool.query(query)));
        console.log("Admin Stats Overview OK");
    } catch(e) {
        console.log("Admin Stats Overview FAILED", e);
    }

    try {
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
            LIMIT 100
        `;
        const [bookings] = await pool.query(query);
        console.log("Admin Bookings OK, length:", bookings.length);
    } catch(e) {
        console.log("Admin Bookings FAILED", e);
    }
    
    try {
        const query = `
            SELECT u.id, u.full_name, u.email, u.phone, u.role, u.is_active, u.created_at
            FROM users u
            ORDER BY u.created_at DESC
        `;
        const [users] = await pool.query(query);
        console.log("Admin Users OK, length:", users.length);
    } catch(e) {
        console.log("Admin Users FAILED", e);
    }
    
    try {
        const query = `
            SELECT wp.*, u.full_name, u.email, u.phone
            FROM worker_profiles wp
            JOIN users u ON wp.user_id = u.id
            WHERE wp.verification_status = 'pending'
            ORDER BY wp.created_at DESC
        `;
        const [pending] = await pool.query(query);
        console.log("Pending Workers OK, length:", pending.length);
    } catch(e) {
        console.log("Pending Workers FAILED", e);
    }

    process.exit();
}

test();
