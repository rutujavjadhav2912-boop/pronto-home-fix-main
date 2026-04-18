/**
 * Database Configuration & Utilities
 */
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'service_website',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Initialize all database tables
const initializeTables = async () => {
    const connection = await pool.getConnection();
    
    try {
        // Users table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                full_name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                phone VARCHAR(20),
                address TEXT,
                password VARCHAR(255) NOT NULL,
                role ENUM('admin', 'worker', 'user') DEFAULT 'user',
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // Worker profiles table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS worker_profiles (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL UNIQUE,
                service_category VARCHAR(50) NOT NULL,
                experience_years INT DEFAULT 0,
                hourly_rate DECIMAL(10, 2),
                service_area TEXT,
                id_proof_url VARCHAR(500),
                verification_status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
                is_available BOOLEAN DEFAULT true,
                rating DECIMAL(3, 2) DEFAULT 0,
                total_jobs INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        // Bookings table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS bookings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                worker_id INT NOT NULL,
                service_category VARCHAR(50) NOT NULL,
                scheduled_date DATE NOT NULL,
                scheduled_time TIME NOT NULL,
                address TEXT NOT NULL,
                description TEXT,
                status ENUM('pending', 'accepted', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
                is_emergency BOOLEAN DEFAULT false,
                total_amount DECIMAL(10, 2),
                payment_method VARCHAR(50) DEFAULT 'cash',
                payment_status ENUM('unpaid', 'pending', 'paid', 'failed') DEFAULT 'unpaid',
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (worker_id) REFERENCES worker_profiles(id) ON DELETE CASCADE
            )
        `);

        // Reviews table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS reviews (
                id INT AUTO_INCREMENT PRIMARY KEY,
                booking_id INT NOT NULL UNIQUE,
                user_id INT NOT NULL,
                worker_id INT NOT NULL,
                rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
                comment TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (worker_id) REFERENCES worker_profiles(id) ON DELETE CASCADE
            )
        `);

        // Notifications table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS notifications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                worker_id INT DEFAULT NULL,
                booking_id INT DEFAULT NULL,
                type ENUM('booking_confirmation', 'booking_update', 'payment', 'review', 'system') DEFAULT 'system',
                message TEXT NOT NULL,
                is_read BOOLEAN DEFAULT false,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (worker_id) REFERENCES worker_profiles(id) ON DELETE SET NULL,
                FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL
            )
        `);

        console.log('✅ All database tables initialized successfully');
    } catch (error) {
        console.error('❌ Error initializing database tables:', error);
        throw error;
    } finally {
        connection.release();
    }
};

module.exports = {
    pool,
    initializeTables
};
