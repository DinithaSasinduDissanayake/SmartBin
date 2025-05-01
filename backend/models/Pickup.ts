import mongoose, { Schema, Document } from 'mongoose';

interface IPickup extends Document {
    binId: string;
    name: string;
    contactNumber: string;
    email: string;
    community: string;
    wasteType: string[];
    address: string;
    preferredDate: Date;
    serviceType: string;
    location: string;
    amount: number;
    status: string;
}

const PickupSchema: Schema = new Schema({
    binId: { type: String, unique: true },
    name: { type: String, required: true },
    contactNumber: { type: String, required: true },
    email: { type: String, required: true },
    community: { type: String, required: true, enum: ['Household', 'Industry'] },
    wasteType: { type: [String], required: true, enum: ['Organic', 'Plastic', 'Paper'] },
    address: { type: String, required: true },
    preferredDate: { type: Date, required: true },
    serviceType: { type: String, required: true, enum: ['urgent', 'regular'] },
    location: { type: String, required: true },
    amount: { type: Number, required: true },
    status: { type: String, default: 'Pending', enum: ['Pending', 'Scheduled', 'Completed', 'Cancelled'] },
}, { timestamps: true });

export default mongoose.model<IPickup>('Pickup', PickupSchema);