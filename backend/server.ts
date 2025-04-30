import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import resourceRoutes from './routes/resourceRoutes';
import scheduleRoutes from './routes/scheduleRoutes';
import equipmentRoutes from './routes/equipmentRoutes';
import toolRoutes from './routes/toolRoutes';

const app = express();


dotenv.config();

// Middleware setup
app.use(cors()); 
app.use(express.json()); 

// MongoDB connection setup
const connectDB = async () => {
  try {
    
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGO_URI is not defined in .env file');
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully'); // Connection success log
  } catch (err) {
    console.error('MongoDB connection error:', err); // Connection fail error log
    process.exit(1); 
  }
};

// MongoDB connect
connectDB();

// API routes setup
app.use('/api', resourceRoutes); // Resource routes
app.use('/api', scheduleRoutes); // Schedule routes
app.use('/api', equipmentRoutes); // Equipment routes
app.use('/api', toolRoutes); // Tool routes

// Server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`); // Server start  log
});