import mongoose, { Schema, Document } from 'mongoose';

export interface IEquipment extends Document {
  equipmentId: string;
  type: string;
  description: string;
  location: {
    lat: number;
    lng: number;
  };
}

const EquipmentSchema: Schema = new Schema({
  equipmentId: { type: String, required: true, unique: true },
  type: {
    type: String,
    required: true,
    enum: ['Gloves', 'Boots', 'Safety Dress'], // Add new types
  },
  description: { type: String, required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
});

export default mongoose.model<IEquipment>('Equipment', EquipmentSchema);