import mongoose from 'mongoose';
import { MemoryStudent } from '../store/inMemoryAdapter.js';

const studentSchema = new mongoose.Schema(
  {
    registrationNumber: {
      type: String,
      required: [true, 'Registration number is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    gender: {
      type: String,
      required: [true, 'Gender is required'],
      enum: ['Male', 'Female', 'Other'],
    },
    dateOfBirth: {
      type: Date,
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      default: 'O+',
    },
    course: {
      type: String,
      required: [true, 'Course is required'],
      trim: true,
    },
    department: {
      type: String,
      default: 'Computer Science & Engineering',
    },
    yearOfStudy: {
      type: Number,
      min: 1,
      max: 5,
      default: 1,
    },
    address: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      postalCode: { type: String, default: '' },
    },
    emergencyContact: {
      name: { type: String, default: '' },
      relation: { type: String, default: 'Parent' },
      phone: { type: String, default: '' },
    },
    guardian: {
      name: { type: String, default: '' },
      relation: { type: String, default: 'Father' },
      phone: { type: String, default: '' },
      email: { type: String, default: '' },
    },
    currentRoom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      default: null,
    },
    allocationDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['Active', 'Vacated', 'Suspended'],
      default: 'Active',
    },
    avatar: {
      type: String,
      default: '',
    },
    userAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

studentSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

const MongooseStudent = mongoose.models.Student || mongoose.model('Student', studentSchema);

export const Student = new Proxy(MongooseStudent, {
  get(target, prop) {
    if (mongoose.connection.readyState === 1) {
      return target[prop];
    }
    return MemoryStudent[prop] !== undefined ? MemoryStudent[prop] : target[prop];
  },
});

export default Student;
