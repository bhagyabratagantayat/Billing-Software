const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const xss = require('sanitize-html'); // We'll use this manually where needed or write custom middleware
const cookieParser = require('cookie-parser');

const app = express();

// Middleware
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(helmet());
app.use(morgan('dev'));

// General Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', apiLimiter);

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/receipts', require('./routes/receiptRoutes'));
app.use('/api/vouchers', require('./routes/voucherRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/trash', require('./routes/trashRoutes'));
app.use('/api/audit-logs', require('./routes/auditLogRoutes'));

// Test Route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Error handling middleware (to be enhanced)
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

module.exports = app;
