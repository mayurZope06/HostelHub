import mongoose from 'mongoose';
import { MemoryNotice } from '../store/inMemoryAdapter.js';

const noticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Notice title is required'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Notice content is required'],
    },
    category: {
      type: String,
      enum: ['General', 'Rules & Regulations', 'Mess & Dining', 'Maintenance', 'Events', 'Urgent Alert'],
      default: 'General',
    },
    postedBy: {
      type: String,
      default: 'Hostel Administration',
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    targetAudience: {
      type: String,
      enum: ['All Students', 'Block A', 'Block B', 'Block C', 'Block D', 'Staff'],
      default: 'All Students',
    },
  },
  { timestamps: true }
);

const MongooseNotice = mongoose.models.Notice || mongoose.model('Notice', noticeSchema);

export const Notice = new Proxy(MongooseNotice, {
  get(target, prop) {
    if (mongoose.connection.readyState === 1) {
      return target[prop];
    }
    return MemoryNotice[prop] !== undefined ? MemoryNotice[prop] : target[prop];
  },
});

export default Notice;
