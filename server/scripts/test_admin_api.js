const http = require('http');
const mysql = require('mysql2/promise');

async function testApi() {
    // We need to know the admin email. Let's query the DB for the admin user.
    const dbConfig = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'password',
        database: process.env.DB_NAME || 'service_website'
    };
    const pool = mysql.createPool(dbConfig);
    const [[admin]] = await pool.query("SELECT * FROM users WHERE role = 'admin' LIMIT 1");
    if (!admin) {
        console.log("No admin found");
        process.exit();
    }
    
    // Create a mock token for the admin since we don't know their plaintext password
    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key_change_in_production';
    const token = jwt.sign(
        { id: admin.id, email: admin.email, role: admin.role },
        JWT_SECRET,
        { expiresIn: '7d' }
    );

    console.log("Admin email:", admin.email);

    const endpoints = ['/api/admin/stats', '/api/users', '/api/bookings', '/api/worker/pending'];
    for (const ep of endpoints) {
        const res = await new Promise(resolve => {
            const req = http.request({
                hostname: 'localhost',
                port: 5000,
                path: ep,
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            }, (r) => {
                let data = '';
                r.on('data', chunk => data += chunk);
                r.on('end', () => resolve({ status: r.statusCode, data }));
            });
            req.end();
        });
        console.log(ep, res.status, res.data.substring(0, 100));
    }
    process.exit();
}

testApi();
