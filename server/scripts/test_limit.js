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
        const query = `
            SELECT wp.*, u.full_name, u.email, u.phone
            FROM worker_profiles wp
            JOIN users u ON wp.user_id = u.id
            WHERE wp.verification_status = 'pending'
            LIMIT ?
        `;
        const limit = 50;
        const [pending] = await pool.query(query, [limit]);
        console.log("Pending Workers OK, length:", pending.length);
    } catch(e) {
        console.log("Pending Workers FAILED", e);
    }
    
    try {
        const query2 = `
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
        const limit2 = 100;
        const [bookings] = await pool.query(query2, [limit2]);
        console.log("Admin Bookings OK, length:", bookings.length);
    } catch(e) {
        console.log("Admin Bookings FAILED", e);
    }
    process.exit();
}

test();
