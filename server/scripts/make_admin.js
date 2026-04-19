const mysql = require('mysql2/promise');
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'service_website'
};

async function test() {
    const pool = mysql.createPool(dbConfig);
    const query = "UPDATE users SET role = 'admin' WHERE email IN ('kuberkunal099@gmail.com', 'admin@test.com')";
    const [result] = await pool.query(query);
    console.log("Updated users to admin:", result.affectedRows);
    process.exit();
}
test();
