import mongoose, { Schema, Document } from 'mongoose';

export interface ISchedule extends Document {
  scheduleNo: string;
  route: string[];
  truckNo: string;
  date: string;
  time: string;
  status: string;
}

const ScheduleSchema: Schema = new Schema({
  scheduleNo: { type: String, required: true, unique: true },
  route: { type: [String], required: true },
  truckNo: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  status: {
    type: String,
    required: true,
    enum: ['Scheduled', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Scheduled',
  },
});

export default mongoose.model<ISchedule>('Schedule', ScheduleSchema);