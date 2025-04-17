// In src/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();
const path = require('path');
const fs = require('fs');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const subscriptionPlanRoutes = require('./routes/subscriptionPlanRoutes');
const documentRoutes = require('./routes/documentRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const performanceRoutes = require('./routes/performanceRoutes');
const financialRoutes = require('./routes/financialRoutes'); // Import financial routes
const userSubscriptionRoutes = require('./routes/userSubscriptionRoutes'); // Import user subscription routes

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/subscription-plans', subscriptionPlanRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/financials', financialRoutes); // Use financial routes
app.use('/api/user-subscriptions', userSubscriptionRoutes); // Mount user subscription routes

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'SmartBin API is running' });
});

// Ensure you have this directory for uploads
const uploadDir = path.join(__dirname, '../uploads/documents');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Make the uploads directory accessible
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI;
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));