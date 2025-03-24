const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();
const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');

const app = express();

// Global rate limiter
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

// Security middleware
app.use(helmet());
app.use(limiter);

// Allowed origins
const allowedOrigins = [
    'http://localhost:3000',  // React CRA
    'http://localhost:5173',  // Vite
    'http://127.0.0.1:5173',  // Sometimes Vite uses this
];

// CORS Middleware with improved security
app.use(cors({
    origin: function(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser middleware with size limits
app.use(express.json({ limit: '10kb' }));
app.use(bodyParser.json({ limit: '10kb' }));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        error: {
            message: err.message || 'Internal server error',
            code: err.code || 'INTERNAL_ERROR'
        }
    });
});

// Connect to MongoDB with improved options
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    autoIndex: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

// Routes
const stockRoutes = require('./routes/stock');
const reservationRoutes = require('./routes/reservation');
const authRoutes = require('./routes/auth');
const paymentsRouter = require('./routes/payments');

// Apply routes
app.use('/api/stock', stockRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/auth', authRoutes);
app.use('/api/payments', paymentsRouter);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
