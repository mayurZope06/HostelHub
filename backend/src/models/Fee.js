import mongoose from 'mongoose';
import { MemoryFee } from '../store/inMemoryAdapter.js';

const feeSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: [true, 'Invoice number is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student is required for fee record'],
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      default: null,
    },
    title: {
      type: String,
      required: [true, 'Fee title/description is required'],
      default: 'Semester Hostel & Amenities Fee',
    },
    feeType: {
      type: String,
      enum: ['Hostel Rent', 'Mess Fee', 'Security Deposit', 'Maintenance', 'Utility / Misc', 'Late Fine'],
      default: 'Hostel Rent',
    },
    amount: {
      type: Number,
      required: [true, 'Fee amount is required'],
      min: 0,
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    paidDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['Pending', 'Partial', 'Paid', 'Overdue'],
      default: 'Pending',
    },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'UPI / QR', 'Credit/Debit Card', 'Net Banking', 'Cheque / DD'],
      default: 'UPI / QR',
    },
    transactionReference: {
      type: String,
      default: '',
    },
    remarks: {
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

feeSchema.virtual('remainingBalance').get(function () {
  return Math.max(0, this.amount - (this.paidAmount || 0));
});

feeSchema.pre('save', function (next) {
  if (this.paidAmount >= this.amount) {
    this.status = 'Paid';
    if (!this.paidDate) this.paidDate = new Date();
  } else if (this.paidAmount > 0) {
    this.status = 'Partial';
  } else {
    if (this.dueDate && new Date(this.dueDate) < new Date()) {
      this.status = 'Overdue';
    } else {
      this.status = 'Pending';
    }
  }
  next();
});

const MongooseFee = mongoose.models.Fee || mongoose.model('Fee', feeSchema);

export const Fee = new Proxy(MongooseFee, {
  get(target, prop) {
    if (mongoose.connection.readyState === 1) {
      return target[prop];
    }
    return MemoryFee[prop] !== undefined ? MemoryFee[prop] : target[prop];
  },
});

export default Fee;
