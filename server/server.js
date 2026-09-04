const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB Database
connectDB();

// Enable CORS for frontend client calls
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Healthcheck Route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'NexusBlog Express API Server is healthy and running',
    timestamp: new Date().toISOString()
  });
});

// Mount API Routers
const authRoutes = require('./routes/authRoutes');
const blogRoutes = require('./routes/blogRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);

// Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ success: false, message: 'Internal Server Error', error: err.message });
});

// Start Server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 NexusBlog Express API Server running on port ${PORT}`);
  console.log(`👉 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`👉 Auth APIs: http://localhost:${PORT}/api/auth`);
  console.log(`👉 Blog APIs: http://localhost:${PORT}/api/blogs`);
  console.log(`=======================================================`);
});
