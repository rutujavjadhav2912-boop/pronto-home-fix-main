const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const ROOT_USER = process.env.DB_ROOT_USER || 'root';
const ROOT_PASSWORD = process.env.DB_ROOT_PASSWORD || process.env.DB_PASSWORD || 'password';
const HOST = process.env.DB_HOST || 'localhost';

async function fixDb() {
    try {
        const connection = await mysql.createConnection({
            host: HOST,
            user: ROOT_USER,
            password: ROOT_PASSWORD,
            database: 'service_website'
        });

        console.log("Adding payment_method and payment_status to bookings...");
        try {
            await connection.query(`
                ALTER TABLE bookings
                ADD COLUMN payment_method VARCHAR(50) DEFAULT 'cash',
                ADD COLUMN payment_status ENUM('unpaid', 'pending', 'paid', 'failed') DEFAULT 'unpaid';
            `);
            console.log("Columns added successfully");
        } catch (e) {
            console.log("Might already exist:", e.message);
        }

        await connection.end();
        console.log("Done");
    } catch (e) {
        console.error(e);
    }
}

fixDb();
