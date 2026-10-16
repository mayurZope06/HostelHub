import mongoose from 'mongoose';
import { MemoryComplaint } from '../store/inMemoryAdapter.js';

const complaintSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student is required'],
    },
    title: {
      type: String,
      required: [true, 'Complaint title is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Electrical', 'Plumbing', 'Internet / Wi-Fi', 'Furniture', 'Cleaning & Housekeeping', 'Mess / Food', 'Security', 'Other'],
      default: 'Electrical',
    },
    roomNumber: {
      type: String,
      required: [true, 'Room number is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Resolved', 'Rejected'],
      default: 'Pending',
    },
    resolutionNotes: {
      type: String,
      default: '',
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const MongooseComplaint = mongoose.models.Complaint || mongoose.model('Complaint', complaintSchema);

export const Complaint = new Proxy(MongooseComplaint, {
  get(target, prop) {
    if (mongoose.connection.readyState === 1) {
      return target[prop];
    }
    return MemoryComplaint[prop] !== undefined ? MemoryComplaint[prop] : target[prop];
  },
});

export default Complaint;
