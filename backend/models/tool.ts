import mongoose, { Schema, Document } from 'mongoose';

// ITool interface define  
export interface ITool extends Document {
  toolId: string;
  type: string;
  status: string;
  description: string;
}

// Tool schema define 
const ToolSchema: Schema = new Schema({
  toolId: { type: String, required: true, unique: true },
  type: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['Available', 'In Use', 'Maintenance', 'Retired'],
    default: 'Available' 
  },
  description: { type: String, required: true },
});

export default mongoose.model<ITool>('Tool', ToolSchema);