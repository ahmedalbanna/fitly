require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profiles');
const measurementRoutes = require('./routes/measurements');
const cardRoutes = require('./routes/cards');
const { shareRouter } = require('./routes/cards');
const conversionRoutes = require('./routes/conversions');
const subscriptionRoutes = require('./routes/subscriptions');
const bannerRoutes = require('./routes/banners');

const app = express();

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    const allowed = [
      /localhost/,
      /\.cloudspaces\.litng\.ai$/,
      /(^|\.)lightning\.ai$/,
    ];
    if (allowed.some((pattern) => pattern.test(origin))) {
      return callback(null, true);
    }
    return callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', app: 'FITLY API' }));

// Routes
app.use('/auth', authRoutes);
app.use('/profiles', profileRoutes);
app.use('/measurements', measurementRoutes);
app.use('/cards', cardRoutes);
app.use('/cards/share', shareRouter);
app.use('/conversions', conversionRoutes);
app.use('/subscriptions', subscriptionRoutes);
app.use('/banners', bannerRoutes);

// 404 handler
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`FITLY API running on port ${PORT}`);
});

module.exports = app;
