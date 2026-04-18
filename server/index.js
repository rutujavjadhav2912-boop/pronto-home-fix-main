const dotenv = require('dotenv');

dotenv.config(); // load .env values before any other module

const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const { initializeTables } = require('./db/index');
const apiRoutes = require('./routes/api');
const { initSocket } = require('./services/socketService');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
    crossOriginEmbedderPolicy: false
}));

// CORS configuration
const corsOptions = {
    origin: process.env.NODE_ENV === 'production'
        ? ['https://yourdomain.com'] // Replace with your production domain
        : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:8080', 'http://localhost:8081', 'http://localhost:8082'], // Vite dev server
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`${timestamp} - ${req.method} ${req.path} - IP: ${req.ip}`);
    next();
});

// Trust proxy for accurate IP logging
app.set('trust proxy', 1);

// Routes
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime()
    });
});

// API documentation endpoint (placeholder)
app.get('/api-docs', (req, res) => {
    res.json({
        message: 'API Documentation',
        endpoints: {
            auth: ['POST /api/register', 'POST /api/login', 'POST /api/logout'],
            users: ['GET /api/profile', 'PUT /api/profile', 'GET /api/users', 'GET /api/stats'],
            workers: ['POST /api/worker/profile', 'GET /api/worker/profile', 'GET /api/workers/*'],
            bookings: ['POST /api/bookings', 'GET /api/bookings/*', 'PUT /api/bookings/*'],
            payments: ['POST /api/payments/pay'],
            notifications: ['GET /api/notifications', 'PUT /api/notifications/*'],
            reviews: ['POST /api/reviews', 'GET /api/reviews/*', 'PUT /api/reviews/*']
        }
    });
});

// Global error handling middleware
app.use((err, req, res, next) => {
    console.error('Global error:', err);

    // Don't leak error details in production
    const isDevelopment = process.env.NODE_ENV !== 'production';

    res.status(err.status || 500).json({
        status: 'error',
        message: isDevelopment ? err.message : 'Internal server error',
        ...(isDevelopment && { stack: err.stack })
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        status: 'error',
        message: 'Endpoint not found',
        path: req.path,
        method: req.method
    });
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    process.exit(0);
});

// Initialize database and start server
const server = http.createServer(app);

initSocket(server);

server.listen(PORT, async () => {
    try {
        await initializeTables();
        console.log(`✅ Server is running on port ${PORT}`);
        console.log(`📍 API URL: http://localhost:${PORT}`);
        console.log(`📍 Health Check: http://localhost:${PORT}/health`);
        console.log(`📍 API Docs: http://localhost:${PORT}/api-docs`);
        console.log(`🔒 Security: Helmet enabled, CORS configured`);
        console.log(`🔌 Socket.io enabled`);
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
});

