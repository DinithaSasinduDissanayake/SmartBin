import mongoose, { Schema, Document } from 'mongoose';

export interface ITruck extends Document {
  truckId: string;
  status: string;
  tankCapacity: number;
  availability: string;
  fuel: number;
  condition: string;
  description: string;
  location: { lat: number; lng: number };
}

const TruckSchema: Schema = new Schema({
  truckId: { 
    type: String, 
    required: true, 
    unique: true,
    validate: {
      validator: (value: string) => value.length === 6,
      message: 'Truck ID must be exactly 6 characters',
    },
  },
  status: { type: String, default: 'Active' },
  tankCapacity: { type: Number, required: true },
  availability: { type: String, default: 'Available' },
  fuel: { type: Number, default: 0 },
  description: { type: String, required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  condition: { // Add this field
    type: String,
    enum: ['Good', 'Repair'],
    default: 'Good',
  },
});

export default mongoose.model<ITruck>('Truck', TruckSchema);