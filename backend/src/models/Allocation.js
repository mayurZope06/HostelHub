import mongoose from 'mongoose';
import { MemoryAllocation } from '../store/inMemoryAdapter.js';

const allocationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student is required for allocation'],
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: [true, 'Room is required for allocation'],
    },
    bedNumber: {
      type: Number,
      default: 1,
    },
    academicYear: {
      type: String,
      required: [true, 'Academic year is required (e.g. 2025-2026)'],
      default: '2025-2026',
    },
    startDate: {
      type: Date,
      required: [true, 'Allocation start date is required'],
      default: Date.now,
    },
    endDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['Active', 'Vacated', 'Transferred'],
      default: 'Active',
    },
    monthlyFee: {
      type: Number,
      default: 0,
    },
    remarks: {
      type: String,
      default: '',
    },
    allocatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

const MongooseAllocation = mongoose.models.Allocation || mongoose.model('Allocation', allocationSchema);

export const Allocation = new Proxy(MongooseAllocation, {
  get(target, prop) {
    if (mongoose.connection.readyState === 1) {
      return target[prop];
    }
    return MemoryAllocation[prop] !== undefined ? MemoryAllocation[prop] : target[prop];
  },
});

export default Allocation;
