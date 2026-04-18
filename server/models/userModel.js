/**
 * User Model - Database operations for users
 */
const bcrypt = require('bcrypt');
const { pool } = require('../db/index');

class UserModel {
    /**
     * Create a new user
     */
    static async create(userData) {
        const { full_name, email, phone, password, role = 'user', address = '' } = userData;
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const query = `
            INSERT INTO users (full_name, email, phone, address, password, role)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        
        const [result] = await pool.query(query, [full_name, email, phone, address, hashedPassword, role]);
        return result;
    }

    /**
     * Find user by email
     */
    static async findByEmail(email) {
        const query = 'SELECT * FROM users WHERE email = ?';
        const [[user]] = await pool.query(query, [email]);
        return user;
    }

    /**
     * Find user by ID
     */
    static async findById(id) {
        const query = 'SELECT id, full_name, email, phone, address, role, is_active, created_at FROM users WHERE id = ?';
        const [[user]] = await pool.query(query, [id]);
        return user;
    }

    /**
     * Verify password
     */
    static async verifyPassword(plainPassword, hashedPassword) {
        return bcrypt.compare(plainPassword, hashedPassword);
    }

    /**
     * Get user with password for login
     */
    static async findByEmailWithPassword(email) {
        const query = 'SELECT * FROM users WHERE email = ?';
        const [[user]] = await pool.query(query, [email]);
        return user;
    }

    /**
     * Update user profile
     */
    static async updateProfile(userId, userData) {
        const { full_name, phone, address } = userData;
        const query = `
            UPDATE users 
            SET full_name = ?, phone = ?, address = ?
            WHERE id = ?
        `;
        
        const [result] = await pool.query(query, [full_name, phone, address, userId]);
        return result;
    }

    /**
     * Get all users (admin)
     */
    static async getAll(limit = 50, offset = 0) {
        const query = `
            SELECT id, full_name, email, phone, role, is_active, created_at 
            FROM users 
            LIMIT ? OFFSET ?
        `;
        const [users] = await pool.query(query, [limit, offset]);
        return users;
    }

    /**
     * Get users count
     */
    static async getCount() {
        const query = 'SELECT COUNT(*) as count FROM users';
        const [[result]] = await pool.query(query);
        return result.count;
    }

    /**
     * Get workers count
     */
    static async getWorkerCount() {
        const query = 'SELECT COUNT(*) as count FROM worker_profiles';
        const [[result]] = await pool.query(query);
        return result.count;
    }

    /**
     * Deactivate user
     */
    static async deactivate(userId) {
        const query = 'UPDATE users SET is_active = false WHERE id = ?';
        const [result] = await pool.query(query, [userId]);
        return result;
    }
}

module.exports = UserModel;
