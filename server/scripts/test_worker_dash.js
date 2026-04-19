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
        const query1 = `
            SELECT r.*, 
                   u.full_name as user_name,
                   b.service_category
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            JOIN bookings b ON r.booking_id = b.id
            WHERE r.worker_id = 1
            ORDER BY r.created_at DESC
            LIMIT 50
        `;
        const [reviews] = await pool.query(query1);
        console.log("Reviews OK", reviews.length);
    } catch(e) {
        console.log("Reviews FAILED", e);
    }

    try {
        const query2 = `
            SELECT *
            FROM worker_availability_schedule
            WHERE worker_id = 1
            AND is_available = TRUE
            ORDER BY day_of_week ASC, start_time ASC
        `;
        const [schedule] = await pool.query(query2);
        console.log("Schedule OK", schedule.length);
    } catch(e) {
        console.log("Schedule FAILED", e);
    }

    try {
        const query3 = `
            SELECT *
            FROM worker_blocked_dates
            WHERE worker_id = 1
            ORDER BY blocked_date ASC
        `;
        const [blocked] = await pool.query(query3);
        console.log("Blocked OK", blocked.length);
    } catch(e) {
        console.log("Blocked FAILED", e);
    }
    process.exit();
}

test();
