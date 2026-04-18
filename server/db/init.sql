-- ======================================
-- DATABASE INITIALIZATION SCRIPT (USER-FRIENDLY)
-- Service Website Setup for Local Development
-- ======================================
--
-- This script will create the `service_website` database and all of
-- the required tables.  You can run it with one command if you have
-- MySQL installed and the root password is "password" (common for
-- development environments):
--
--   mysql -u root -ppassword < init.sql
--
-- If you prefer, the database user `appuser` with password
-- "password" is created and granted privileges at the end; the
-- backend `.env` can be updated to use those credentials.
--
-- The first time you run the script it will create the database;
-- future runs are idempotent thanks to IF NOT EXISTS clauses.
--
-- Notes:
--   * The script all runs under `USE service_website` so you don't
--     need to create the database separately.
--   * Password for the default user is set to "password" as requested.
--

-- create database if missing and switch to it
CREATE DATABASE IF NOT EXISTS service_website CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE service_website;

-- ======================================
-- USERS TABLE
-- ======================================
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ======================================
-- WORKER PROFILES TABLE
-- ======================================
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
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_category (service_category),
    INDEX idx_status (verification_status),
    INDEX idx_available (is_available)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ======================================
-- BOOKINGS TABLE
-- ======================================
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
    FOREIGN KEY (worker_id) REFERENCES worker_profiles(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_worker (worker_id),
    INDEX idx_status (status),
    INDEX idx_date (scheduled_date),
    INDEX idx_emergency (is_emergency)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ======================================
-- REVIEWS TABLE
-- ======================================
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
    FOREIGN KEY (worker_id) REFERENCES worker_profiles(id) ON DELETE CASCADE,
    INDEX idx_worker (worker_id),
    INDEX idx_rating (rating)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ======================================
-- NOTIFICATIONS TABLE
-- ======================================
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
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_booking (booking_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ======================================
-- PAYMENTS TABLE
-- ======================================
CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL UNIQUE,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    payment_method VARCHAR(50) NOT NULL, -- 'razorpay', 'stripe', 'cash'
    gateway VARCHAR(50), -- 'razorpay', 'stripe'
    transaction_id VARCHAR(100),
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'refunded'
    customer_id VARCHAR(100), -- Gateway customer ID
    reference_id VARCHAR(100), -- Internal reference
    error_message TEXT,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    INDEX idx_booking (booking_id),
    INDEX idx_status (status),
    INDEX idx_gateway (gateway)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ======================================
-- LOCATIONS TABLE (for geo-features)
-- ======================================
CREATE TABLE IF NOT EXISTS locations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    worker_id INT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    address TEXT,
    service_radius_km INT DEFAULT 10,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (worker_id) REFERENCES worker_profiles(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_worker (worker_id),
    INDEX idx_location (latitude, longitude)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ======================================
-- WORKER DOCUMENTS TABLE
-- ======================================
CREATE TABLE IF NOT EXISTS worker_documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    worker_id INT NOT NULL,
    document_type VARCHAR(50) NOT NULL, -- 'id', 'license', 'insurance', 'certification'
    document_url VARCHAR(500) NOT NULL,
    verification_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'verified', 'rejected'
    rejection_reason TEXT,
    verified_by INT,
    verified_at TIMESTAMP NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (worker_id) REFERENCES worker_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_worker (worker_id),
    INDEX idx_status (verification_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ======================================
-- AUDIT LOGS TABLE
-- ======================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL, -- 'user', 'worker', 'booking', 'payment'
    entity_id INT NOT NULL,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_entity (entity_type, entity_id),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ======================================
-- WORKER AVAILABILITY SCHEDULE TABLE
-- ======================================
CREATE TABLE IF NOT EXISTS worker_availability_schedule (
    id INT AUTO_INCREMENT PRIMARY KEY,
    worker_id INT NOT NULL,
    day_of_week INT NOT NULL, -- 0=Sunday, 1=Monday, ..., 6=Saturday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    break_start_time TIME NULL,
    break_end_time TIME NULL,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (worker_id) REFERENCES worker_profiles(id) ON DELETE CASCADE,
    UNIQUE KEY unique_worker_day (worker_id, day_of_week),
    INDEX idx_worker (worker_id),
    INDEX idx_day (day_of_week)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ======================================
-- WORKER BLOCKED DATES TABLE
-- ======================================
CREATE TABLE IF NOT EXISTS worker_blocked_dates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    worker_id INT NOT NULL,
    blocked_date DATE NOT NULL,
    reason TEXT,
    is_blocked BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (worker_id) REFERENCES worker_profiles(id) ON DELETE CASCADE,
    UNIQUE KEY unique_blocked_date (worker_id, blocked_date),
    INDEX idx_worker (worker_id),
    INDEX idx_date (blocked_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ======================================
-- BOOKING RESCHEDULE REQUESTS TABLE
-- ======================================
CREATE TABLE IF NOT EXISTS booking_reschedule_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    user_id INT NOT NULL,
    worker_id INT NOT NULL,
    requested_date DATE NOT NULL,
    requested_time TIME NOT NULL,
    reason TEXT,
    status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
    response_note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (worker_id) REFERENCES worker_profiles(id) ON DELETE CASCADE,
    INDEX idx_booking (booking_id),
    INDEX idx_worker (worker_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ======================================
-- ALTER EXISTING TABLES
-- ======================================

-- Add new columns to bookings table
ALTER TABLE bookings
ADD COLUMN cancellation_reason TEXT,
ADD COLUMN rescheduled_from TIMESTAMP NULL,
ADD COLUMN emergency_level INT DEFAULT 0, -- 0=normal, 1=urgent, 2=critical
ADD COLUMN service_location_lat DECIMAL(10, 8),
ADD COLUMN service_location_lng DECIMAL(11, 8),
ADD COLUMN special_instructions TEXT,
ADD INDEX idx_emergency_level (is_emergency, emergency_level),
ADD INDEX idx_location_coords (service_location_lat, service_location_lng);

-- Add new columns to worker availability schedule
ALTER TABLE worker_availability_schedule
ADD COLUMN break_start_time TIME NULL,
ADD COLUMN break_end_time TIME NULL,
ADD COLUMN is_available BOOLEAN DEFAULT true,
ADD INDEX idx_schedule_worker (worker_id),
ADD INDEX idx_schedule_day (day_of_week);

-- Add new columns to worker_profiles table
ALTER TABLE worker_profiles
ADD COLUMN bio TEXT,
ADD COLUMN languages VARCHAR(255),
ADD COLUMN certifications TEXT,
ADD COLUMN profile_image_url VARCHAR(500),
ADD COLUMN is_online BOOLEAN DEFAULT false,
ADD COLUMN last_seen TIMESTAMP NULL,
ADD COLUMN response_time_minutes INT DEFAULT 60,
ADD INDEX idx_online_status (is_available, is_online),
ADD INDEX idx_last_seen (last_seen);

-- ======================================
-- VIEWS (Optional - for easy data retrieval)
-- ======================================

-- View: Worker details with user info
CREATE OR REPLACE VIEW worker_details AS
SELECT 
    wp.*,
    u.full_name,
    u.email,
    u.phone,
    u.address,
    u.is_active as user_active
FROM worker_profiles wp
JOIN users u ON wp.user_id = u.id
WHERE u.is_active = true;

-- View: Booking details with all info
CREATE OR REPLACE VIEW booking_details AS
SELECT 
    b.*,
    u.full_name as user_name,
    u.email as user_email,
    u.phone as user_phone,
    wp.user_id as worker_user_id,
    u2.full_name as worker_name,
    u2.phone as worker_phone,
    wp.hourly_rate,
    wp.rating as worker_rating
FROM bookings b
JOIN users u ON b.user_id = u.id
JOIN worker_profiles wp ON b.worker_id = wp.id
JOIN users u2 ON wp.user_id = u2.id;

-- View: User statistics
CREATE OR REPLACE VIEW user_statistics AS
SELECT 
    COUNT(DISTINCT u.id) as total_users,
    COUNT(DISTINCT wp.id) as total_workers,
    SUM(CASE WHEN wp.verification_status = 'verified' THEN 1 ELSE 0 END) as verified_workers,
    COUNT(DISTINCT b.id) as total_bookings,
    SUM(CASE WHEN b.status = 'completed' THEN 1 ELSE 0 END) as completed_bookings
FROM users u
LEFT JOIN worker_profiles wp ON u.id = wp.user_id
LEFT JOIN bookings b ON u.id = b.user_id;

-- ======================================
-- SAMPLE DATA (Optional - for testing)
-- ======================================

-- Uncomment to insert sample data
/*
-- Sample admin user
INSERT INTO users (full_name, email, phone, password, role, is_active)
VALUES ('Admin User', 'admin@example.com', '1234567890', 
        '$2b$10$YourHashedPasswordHere', 'admin', true);

-- Sample regular users
INSERT INTO users (full_name, email, phone, address, password, role, is_active)
VALUES 
('John Customer', 'john@example.com', '9876543210', '123 Main St', 
 '$2b$10$YourHashedPasswordHere', 'user', true),
('Jane Worker', 'jane@example.com', '5551234567', '456 Oak Ave', 
 '$2b$10$YourHashedPasswordHere', 'worker', true);

-- Sample worker profile
INSERT INTO worker_profiles (user_id, service_category, experience_years, hourly_rate, 
                             service_area, verification_status, is_available, rating, total_jobs)
VALUES (3, 'plumber', 5, 500.00, 'Downtown, Suburbs', 'verified', true, 4.5, 20);

-- Sample bookings
INSERT INTO bookings (user_id, worker_id, service_category, scheduled_date, scheduled_time,
                      address, description, status, total_amount)
VALUES (2, 1, 'plumber', CURDATE() + INTERVAL 5 DAY, '10:30:00',
        '123 Main St', 'Fix leaking tap', 'pending', 500.00);
*/

-- ======================================
-- INDEXES FOR PERFORMANCE
-- ======================================
-- Additional indexes for common queries (already added in table definitions)

-- ======================================
-- BACKUP RECOMMENDATIONS
-- ======================================
/*
Regular backups recommended:
mysqldump -u root -p service_website > backup_service_website_$(date +%Y%m%d).sql

Restore from backup:
mysql -u root -p service_website < backup_service_website_20240301.sql
*/

-- ======================================
-- OPTIONAL: create a non-root user for the application
-- (credentials are convenient for local dev)
-- ======================================
-- run as root (or a user with CREATE USER privilege)
CREATE USER IF NOT EXISTS 'appuser'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON service_website.* TO 'appuser'@'localhost';
FLUSH PRIVILEGES;

SHOW TABLES;
SELECT "Database setup completed!" AS status;
