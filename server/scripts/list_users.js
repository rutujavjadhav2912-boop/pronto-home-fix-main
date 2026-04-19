const mysql = require('mysql2/promise');
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'service_website'
};

async function test() {
    const pool = mysql.createPool(dbConfig);
    const [users] = await pool.query("SELECT id, email, role, full_name FROM users");
    console.log(users);
    process.exit();
}
test();
