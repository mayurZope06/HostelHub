import Student from '../models/Student.js';
import Room from '../models/Room.js';
import Allocation from '../models/Allocation.js';
import Fee from '../models/Fee.js';
import Complaint from '../models/Complaint.js';
import User from '../models/User.js';

// @desc    Get all students with search & filter
// @route   GET /api/students
// @access  Private
export const getStudents = async (req, res, next) => {
  try {
    const { search, course, status, roomStatus, page = 1, limit = 50, sort = '-createdAt' } = req.query;

    const query = {};

    // Search query across name, email, registrationNumber
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { registrationNumber: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    if (course && course !== 'All') {
      query.course = course;
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (roomStatus === 'Allocated') {
      query.currentRoom = { $ne: null };
    } else if (roomStatus === 'Unallocated') {
      query.currentRoom = null;
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Student.countDocuments(query);
    const students = await Student.find(query)
      .populate('currentRoom', 'roomNumber block floor roomType')
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      count: students.length,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      currentPage: pageNum,
      students,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single student details with allocations & fee records
// @route   GET /api/students/:id
// @access  Private
export const getStudentById = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id).populate('currentRoom');

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Get allocations history
    const allocations = await Allocation.find({ student: student._id }).populate('room').sort('-createdAt');

    // Get fee records
    const fees = await Fee.find({ student: student._id }).populate('room').sort('-createdAt');

    // Get student complaints
    const complaints = await Complaint.find({ student: student._id }).sort('-createdAt');

    res.json({
      success: true,
      student,
      allocations,
      fees,
      complaints,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new student
// @route   POST /api/students
// @access  Private (Admin)
export const createStudent = async (req, res, next) => {
  try {
    const { registrationNumber, email } = req.body;

    const existingReg = await Student.findOne({ registrationNumber: registrationNumber.toUpperCase() });
    if (existingReg) {
      return res.status(400).json({ success: false, message: 'Registration number already in use' });
    }

    const existingEmail = await Student.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ success: false, message: 'Email already registered for another student' });
    }

    const student = await Student.create({
      ...req.body,
      registrationNumber: registrationNumber.toUpperCase(),
    });

    // Optionally auto-create user account for student login
    if (req.body.createLoginAccount) {
      const defaultPassword = req.body.defaultPassword || 'Hostel@123';
      const userExists = await User.findOne({ email: student.email });
      if (!userExists) {
        const user = await User.create({
          name: `${student.firstName} ${student.lastName}`,
          email: student.email,
          password: defaultPassword,
          role: 'student',
          phone: student.phone,
          studentId: student._id,
        });
        student.userAccount = user._id;
        await student.save();
      }
    }

    res.status(201).json({
      success: true,
      student,
      message: 'Student registered successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update student details
// @route   PUT /api/students/:id
// @access  Private (Admin)
export const updateStudent = async (req, res, next) => {
  try {
    let student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Check if updating email or regNumber to something that belongs to someone else
    if (req.body.registrationNumber && req.body.registrationNumber.toUpperCase() !== student.registrationNumber) {
      const dupReg = await Student.findOne({ registrationNumber: req.body.registrationNumber.toUpperCase() });
      if (dupReg) {
        return res.status(400).json({ success: false, message: 'Registration number already in use' });
      }
    }

    student = await Student.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        registrationNumber: req.body.registrationNumber ? req.body.registrationNumber.toUpperCase() : student.registrationNumber,
      },
      { new: true, runValidators: true }
    ).populate('currentRoom');

    res.json({
      success: true,
      student,
      message: 'Student record updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete student record
// @route   DELETE /api/students/:id
// @access  Private (Admin)
export const deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // If currently allocated a room, release the bed
    if (student.currentRoom) {
      const room = await Room.findById(student.currentRoom);
      if (room) {
        room.occupiedBeds = Math.max(0, room.occupiedBeds - 1);
        await room.save();
      }

      // Mark allocation as vacated
      await Allocation.updateMany(
        { student: student._id, status: 'Active' },
        { status: 'Vacated', endDate: new Date(), remarks: 'Student profile deleted' }
      );
    }

    // Delete linked user if any
    if (student.userAccount) {
      await User.findByIdAndDelete(student.userAccount);
    }

    await Student.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Student and related associations removed successfully',
    });
  } catch (error) {
    next(error);
  }
};
