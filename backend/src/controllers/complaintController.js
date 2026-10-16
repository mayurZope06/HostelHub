import Complaint from '../models/Complaint.js';
import Student from '../models/Student.js';

// @desc    Get all complaints
// @route   GET /api/complaints
// @access  Private
export const getComplaints = async (req, res, next) => {
  try {
    const { status, category, priority, page = 1, limit = 50 } = req.query;

    const query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (priority && priority !== 'All') {
      query.priority = priority;
    }

    // If logged in student, only show complaints filed by them
    if (req.user.role === 'student' && req.user.studentId) {
      query.student = req.user.studentId;
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Complaint.countDocuments(query);
    const complaints = await Complaint.find(query)
      .populate('student', 'firstName lastName registrationNumber email phone currentRoom')
      .sort('-createdAt')
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      count: complaints.length,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      currentPage: pageNum,
      complaints,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    File a new complaint
// @route   POST /api/complaints
// @access  Private
export const createComplaint = async (req, res, next) => {
  try {
    const { title, category, roomNumber, description, priority, studentId } = req.body;

    let targetStudentId = studentId;

    if (req.user.role === 'student') {
      if (!req.user.studentId) {
        return res.status(400).json({ success: false, message: 'No student profile linked to this account' });
      }
      targetStudentId = req.user.studentId;
    }

    const student = await Student.findById(targetStudentId).populate('currentRoom');
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const complaint = await Complaint.create({
      student: student._id,
      title,
      category: category || 'Electrical',
      roomNumber: roomNumber || student.currentRoom?.roomNumber || 'N/A',
      description,
      priority: priority || 'Medium',
      status: 'Pending',
    });

    const populatedComplaint = await Complaint.findById(complaint._id).populate('student');

    res.status(201).json({
      success: true,
      complaint: populatedComplaint,
      message: 'Complaint submitted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update complaint status & resolution
// @route   PUT /api/complaints/:id
// @access  Private (Admin)
export const updateComplaint = async (req, res, next) => {
  try {
    const { status, resolutionNotes, priority } = req.body;

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    if (status) complaint.status = status;
    if (resolutionNotes) complaint.resolutionNotes = resolutionNotes;
    if (priority) complaint.priority = priority;

    if (status === 'Resolved' && !complaint.resolvedAt) {
      complaint.resolvedAt = new Date();
    }

    await complaint.save();

    const updated = await Complaint.findById(complaint._id).populate('student');

    res.json({
      success: true,
      complaint: updated,
      message: `Complaint updated to status: ${complaint.status}`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete complaint
// @route   DELETE /api/complaints/:id
// @access  Private (Admin)
export const deleteComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    await Complaint.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Complaint deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
