const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');

const { notFound, errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const listingRoutes = require('./routes/listingRoutes');
const swapRoutes = require('./routes/swapRoutes');
const chatRoutes = require('./routes/chatRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const reportRoutes = require('./routes/reportRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// --- Health check FIRST — before CORS/helmet so Render pings never 500 ---
app.get('/', (req, res) => res.json({ success: true, status: 'ok' }));
app.head('/', (req, res) => res.sendStatus(200));
app.get('/api/health', (req, res) => res.json({ success: true, status: 'ok', time: new Date().toISOString() }));

// --- CORS ---
// Support multiple allowed origins: comma-separate them in CLIENT_URL env var.
// Example: CLIENT_URL=http://localhost:5173,https://thread-trade.vercel.app
const rawOrigins = (process.env.CLIENT_URL || 'http://localhost:5173').split(',');
const allowedOrigins = rawOrigins.map((o) => o.trim().replace(/\/$/, '')).filter(Boolean);

app.use(
  cors({
    origin: (incomingOrigin, callback) => {
      // No origin = server-to-server / curl / Render health check → allow
      if (!incomingOrigin) return callback(null, false);
      // Sanitise the incoming origin (strip trailing slash) before comparing
      const sanitised = (incomingOrigin || '').trim().replace(/\/$/, '');
      if (allowedOrigins.includes(sanitised)) return callback(null, true);
      // Unknown origin: block but don't crash — return false (no CORS header)
      return callback(null, false);
    },
    credentials: true, // required so the httpOnly refresh-token cookie is sent
  })
);

// --- Security & parsing middleware ---
app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(mongoSanitize()); // strips $ and . from user input, blocks NoSQL injection
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// General API-wide rate limit (auth routes have their own stricter limiter)
app.use(
  '/api',
  rateLimit({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: Number(process.env.RATE_LIMIT_MAX) || 200,
  })
);

// --- Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/swaps', swapRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
