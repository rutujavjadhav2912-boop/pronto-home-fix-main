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
            SELECT id, full_name, email, phone, role, is_active, created_at 
            FROM users 
            LIMIT ? OFFSET ?
        `;
        const limit = 50;
        const offset = 0;
        const [users] = await pool.query(query, [limit, offset]);
        console.log("Admin Users OK, length:", users.length);
    } catch(e) {
        console.log("Admin Users FAILED", e);
    }
    process.exit();
}

test();
