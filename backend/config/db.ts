import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const mongoURI = 'mongodb+srv://smartBin:Bin1234@pickuprequest.xo7vy.mongodb.net/?retryWrites=true&w=majority&appName=PickupRequest';
        await mongoose.connect(mongoURI);
        console.log('MongoDB connected');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }
};

export default connectDB;