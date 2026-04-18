/**
 * Authorization Middleware
 * Provides role-based access control and security utilities
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key_change_in_production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh_secret_key';

// Enhanced JWT verification with better error handling
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({
            status: 'error',
            message: 'Access token required'
        });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                status: 'error',
                message: 'Token expired',
                code: 'TOKEN_EXPIRED'
            });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid token',
                code: 'INVALID_TOKEN'
            });
        } else {
            return res.status(401).json({
                status: 'error',
                message: 'Token verification failed'
            });
        }
    }
};

// Role-based authorization middleware
const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                status: 'error',
                message: 'Authentication required'
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                status: 'error',
                message: 'Insufficient permissions',
                required: allowedRoles,
                current: req.user.role
            });
        }

        next();
    };
};

// Specific role middlewares
const requireAdmin = requireRole(['admin']);
const requireWorker = requireRole(['worker', 'admin']);
const requireUser = requireRole(['user', 'worker', 'admin']);

// Resource ownership verification
const requireOwnership = (resourceType) => {
    return async (req, res, next) => {
        try {
            const resourceId = req.params.id || req.params.bookingId || req.params.workerId || req.params.reviewId || req.params.notificationId;

            if (!resourceId) {
                return next(); // Skip if no ID parameter
            }

            let isOwner = false;

            switch (resourceType) {
                case 'booking':
                    const BookingModel = require('../models/bookingModel');
                    const booking = await BookingModel.getById(resourceId);
                    isOwner = booking && booking.user_id === req.user.id;
                    break;

                case 'worker':
                    const WorkerModel = require('../models/workerModel');
                    const worker = await WorkerModel.getByUserId(req.user.id);
                    isOwner = worker && worker.id == resourceId;
                    break;

                case 'review':
                    const ReviewModel = require('../models/reviewModel');
                    const review = await ReviewModel.getById(resourceId);
                    isOwner = review && review.user_id === req.user.id;
                    break;

                case 'notification':
                    // Notifications belong to the authenticated user
                    isOwner = true; // Will be filtered by user_id in controller
                    break;

                default:
                    isOwner = true; // Allow by default for other resources
            }

            if (!isOwner) {
                return res.status(403).json({
                    status: 'error',
                    message: 'Access denied: You do not own this resource'
                });
            }

            next();
        } catch (error) {
            console.error('Ownership verification error:', error);
            res.status(500).json({
                status: 'error',
                message: 'Resource verification failed'
            });
        }
    };
};

// Rate limiting helper (basic implementation)
const rateLimitStore = new Map();

const rateLimit = (windowMs = 15 * 60 * 1000, maxRequests = 100) => {
    return (req, res, next) => {
        const key = req.ip;
        const now = Date.now();
        const windowStart = now - windowMs;

        if (!rateLimitStore.has(key)) {
            rateLimitStore.set(key, []);
        }

        const requests = rateLimitStore.get(key);
        // Remove old requests outside the window
        const validRequests = requests.filter(time => time > windowStart);

        if (validRequests.length >= maxRequests) {
            return res.status(429).json({
                status: 'error',
                message: 'Too many requests, please try again later'
            });
        }

        validRequests.push(now);
        rateLimitStore.set(key, validRequests);

        next();
    };
};

module.exports = {
    verifyToken,
    requireRole,
    requireAdmin,
    requireWorker,
    requireUser,
    requireOwnership,
    rateLimit
};