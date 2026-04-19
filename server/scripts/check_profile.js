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
            SELECT * FROM worker_profiles WHERE user_id = 6
        `;
        const [profiles] = await pool.query(query);
        console.log("Worker Profiles for user 6:", profiles);
    } catch(e) {
        console.log("FAILED", e);
    }
    process.exit();
}

test();
