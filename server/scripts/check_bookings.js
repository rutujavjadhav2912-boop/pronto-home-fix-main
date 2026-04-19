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
            SELECT b.*,
                   u.full_name as user_name, u.email as user_email,
                   wp.user_id as worker_user_id,
                   u2.full_name as worker_name, u2.role as worker_role
            FROM bookings b
            JOIN users u ON b.user_id = u.id
            JOIN worker_profiles wp ON b.worker_id = wp.id
            JOIN users u2 ON wp.user_id = u2.id
            ORDER BY b.created_at DESC
        `;
        const [bookings] = await pool.query(query);
        console.log("Bookings:", bookings.map(b => ({
            id: b.id,
            category: b.service_category,
            status: b.status,
            user_name: b.user_name,
            worker_name: b.worker_name,
            worker_user_id: b.worker_user_id,
            worker_role: b.worker_role
        })));
    } catch(e) {
        console.log("Admin Bookings FAILED", e);
    }
    process.exit();
}

test();
