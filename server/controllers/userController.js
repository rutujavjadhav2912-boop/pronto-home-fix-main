/**
 * User Controller - Handles user-related API logic
 */
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');
const WorkerModel = require('../models/workerModel');

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key_change_in_production';

class UserController {
    /**
     * Register a new user
     */
    static async register(req, res) {
        try {
            const { full_name, email, phone, password, role = 'user', address = '' } = req.body;

            // Validation
            if (!full_name || !email || !password) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Missing required fields: full_name, email, password'
                });
            }

            if (password.length < 6) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Password must be at least 6 characters'
                });
            }

            // Check if user exists
            const existingUser = await UserModel.findByEmail(email);
            if (existingUser) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Email already registered'
                });
            }

            // Create user
            const result = await UserModel.create({
                full_name,
                email,
                phone: phone || null,
                address: address || null,
                password,
                role
            });

            res.status(201).json({
                status: 'ok',
                message: 'User registered successfully',
                userId: result.insertId
            });
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({
                status: 'error',
                message: error.message || 'Registration failed'
            });
        }
    }

    /**
     * Login user
     */
    static async login(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Email and password required'
                });
            }

            // Find user
            const user = await UserModel.findByEmailWithPassword(email);
            if (!user) {
                return res.status(401).json({
                    status: 'error',
                    message: 'Invalid email or password'
                });
            }

            // Verify password
            const isMatch = await UserModel.verifyPassword(password, user.password);
            if (!isMatch) {
                return res.status(401).json({
                    status: 'error',
                    message: 'Invalid email or password'
                });
            }

            // Create JWT token
            const token = jwt.sign(
                { id: user.id, email: user.email, role: user.role },
                JWT_SECRET,
                { expiresIn: '7d' }
            );

            res.json({
                status: 'ok',
                message: 'Logged in successfully',
                token,
                user: {
                    id: user.id,
                    full_name: user.full_name,
                    email: user.email,
                    phone: user.phone,
                    role: user.role
                }
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                status: 'error',
                message: error.message || 'Login failed'
            });
        }
    }

    /**
     * Get user profile
     */
    static async getProfile(req, res) {
        try {
            const userId = req.user.id;
            const user = await UserModel.findById(userId);

            if (!user) {
                return res.status(404).json({
                    status: 'error',
                    message: 'User not found'
                });
            }

            res.json({
                status: 'ok',
                user
            });
        } catch (error) {
            console.error('Get profile error:', error);
            res.status(500).json({
                status: 'error',
                message: error.message || 'Failed to get profile'
            });
        }
    }

    /**
     * Update user profile
     */
    static async updateProfile(req, res) {
        try {
            const userId = req.user.id;
            const { full_name, phone, address } = req.body;

            const result = await UserModel.updateProfile(userId, {
                full_name: full_name || '',
                phone: phone || null,
                address: address || null
            });

            res.json({
                status: 'ok',
                message: 'Profile updated successfully'
            });
        } catch (error) {
            console.error('Update profile error:', error);
            res.status(500).json({
                status: 'error',
                message: error.message || 'Failed to update profile'
            });
        }
    }

    /**
     * Get all users (admin only)
     */
    static async getAllUsers(req, res) {
        try {
            if (req.user.role !== 'admin') {
                return res.status(403).json({
                    status: 'error',
                    message: 'Access denied'
                });
            }

            const limit = parseInt(req.query.limit) || 50;
            const offset = parseInt(req.query.offset) || 0;

            const users = await UserModel.getAll(limit, offset);
            const count = await UserModel.getCount();

            res.json({
                status: 'ok',
                data: users,
                pagination: {
                    total: count,
                    limit,
                    offset
                }
            });
        } catch (error) {
            console.error('Get users error:', error);
            res.status(500).json({
                status: 'error',
                message: error.message || 'Failed to get users'
            });
        }
    }

    /**
     * Get application statistics
     */
    static async getStats(req, res) {
        try {
            const totalUsers = await UserModel.getCount();
            const totalWorkers = await UserModel.getWorkerCount();

            res.json({
                status: 'ok',
                data: {
                    totalUsers,
                    totalWorkers
                }
            });
        } catch (error) {
            console.error('Get stats error:', error);
            res.status(500).json({
                status: 'error',
                message: error.message || 'Failed to get statistics'
            });
        }
    }

    /**
     * Logout user (client-side token removal, server-side we just acknowledge)
     */
    static async logout(req, res) {
        try {
            // In a stateless JWT system, logout is primarily client-side
            // Server-side we can optionally implement token blacklisting
            // For now, we just acknowledge the logout

            res.json({
                status: 'ok',
                message: 'Logged out successfully'
            });
        } catch (error) {
            console.error('Logout error:', error);
            res.status(500).json({
                status: 'error',
                message: 'Logout failed'
            });
        }
    }
}

module.exports = UserController;
