import mongoose from 'mongoose';
import { MemoryRoom } from '../store/inMemoryAdapter.js';

const roomSchema = new mongoose.Schema(
  {
    roomNumber: {
      type: String,
      required: [true, 'Room number is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    block: {
      type: String,
      required: [true, 'Block / Wing is required'],
      trim: true,
      enum: ['Block A', 'Block B', 'Block C', 'Block D', 'Main Wing'],
      default: 'Block A',
    },
    floor: {
      type: Number,
      required: [true, 'Floor number is required'],
      min: 0,
      max: 10,
      default: 1,
    },
    roomType: {
      type: String,
      required: [true, 'Room type is required'],
      enum: ['Single', 'Double', 'Triple', 'Dormitory'],
      default: 'Double',
    },
    capacity: {
      type: Number,
      required: [true, 'Room capacity is required'],
      min: 1,
      max: 8,
      default: 2,
    },
    occupiedBeds: {
      type: Number,
      default: 0,
      min: 0,
    },
    feePerSemester: {
      type: Number,
      required: [true, 'Fee amount is required'],
      min: 0,
      default: 25000,
    },
    amenities: {
      type: [String],
      default: ['High-speed Wi-Fi', 'Study Table', 'Attached Bathroom', 'Ceiling Fan'],
    },
    status: {
      type: String,
      enum: ['Available', 'Partially Occupied', 'Occupied', 'Maintenance'],
      default: 'Available',
    },
    description: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

roomSchema.virtual('availableBeds').get(function () {
  return Math.max(0, this.capacity - this.occupiedBeds);
});

roomSchema.pre('save', function (next) {
  if (this.status !== 'Maintenance') {
    if (this.occupiedBeds >= this.capacity) {
      this.status = 'Occupied';
    } else if (this.occupiedBeds > 0) {
      this.status = 'Partially Occupied';
    } else {
      this.status = 'Available';
    }
  }
  next();
});

const MongooseRoom = mongoose.models.Room || mongoose.model('Room', roomSchema);

export const Room = new Proxy(MongooseRoom, {
  get(target, prop) {
    if (mongoose.connection.readyState === 1) {
      return target[prop];
    }
    return MemoryRoom[prop] !== undefined ? MemoryRoom[prop] : target[prop];
  },
});

export default Room;
