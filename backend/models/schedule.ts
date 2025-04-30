import mongoose, { Schema, Document } from 'mongoose';

export interface ISchedule extends Document {
  scheduleNo: string;
  route: string[];
  truckNo: string;
  date: string;
  time: string;
  status: 'Waiting' | 'Start' | 'Completed';
}

const scheduleSchema: Schema = new Schema<ISchedule>({
  scheduleNo: { type: String, required: true, unique: true },
  route: { type: [String], required: true },
  truckNo: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  status: { type: String, enum: ['Waiting', 'Start', 'Completed'], default: 'Waiting' }
}, { timestamps: true });

export default mongoose.model<ISchedule>('Schedule', scheduleSchema);