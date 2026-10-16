import Fee from '../models/Fee.js';
import Student from '../models/Student.js';

// @desc    Get all fees with filters & search
// @route   GET /api/fees
// @access  Private
export const getFees = async (req, res, next) => {
  try {
    const { status, feeType, search, page = 1, limit = 50 } = req.query;

    const query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    if (feeType && feeType !== 'All') {
      query.feeType = feeType;
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // If logged in as student, only show their own fee records
    if (req.user?.role === 'student' && req.user.studentId) {
      query.student = req.user.studentId;
    }

    const total = await Fee.countDocuments(query);
    let fees = await Fee.find(query)
      .populate('student', 'firstName lastName registrationNumber email phone course department avatar')
      .populate('room', 'roomNumber block floor roomType')
      .sort('-createdAt')
      .skip(skip)
      .limit(limitNum);

    if (search) {
      const q = search.toLowerCase();
      fees = fees.filter((f) => {
        const student = f.student;
        return (
          f.invoiceNumber?.toLowerCase().includes(q) ||
          student?.firstName?.toLowerCase().includes(q) ||
          student?.lastName?.toLowerCase().includes(q) ||
          student?.registrationNumber?.toLowerCase().includes(q)
        );
      });
    }

    res.json({
      success: true,
      count: fees.length,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      currentPage: pageNum,
      fees,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single fee invoice by ID
// @route   GET /api/fees/:id
// @access  Private
export const getFeeById = async (req, res, next) => {
  try {
    const fee = await Fee.findById(req.params.id)
      .populate('student')
      .populate('room');

    if (!fee) {
      return res.status(404).json({ success: false, message: 'Fee record not found' });
    }

    // Security check: student can only view their own fee
    if (req.user.role === 'student' && req.user.studentId?.toString() !== fee.student._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this invoice' });
    }

    res.json({
      success: true,
      fee,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new fee invoice
// @route   POST /api/fees
// @access  Private (Admin)
export const createFee = async (req, res, next) => {
  try {
    const { studentId, title, feeType, amount, dueDate, remarks } = req.body;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    const fee = await Fee.create({
      invoiceNumber,
      student: student._id,
      room: student.currentRoom || null,
      title: title || 'Hostel Accommodation Fee',
      feeType: feeType || 'Hostel Rent',
      amount: Number(amount),
      paidAmount: 0,
      dueDate: dueDate || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      remarks: remarks || '',
      status: 'Pending',
    });

    const populatedFee = await Fee.findById(fee._id)
      .populate('student', 'firstName lastName registrationNumber email phone')
      .populate('room', 'roomNumber block');

    res.status(201).json({
      success: true,
      fee: populatedFee,
      message: `Invoice ${invoiceNumber} generated successfully`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Record payment for fee invoice
// @route   POST /api/fees/:id/pay
// @access  Private
export const recordPayment = async (req, res, next) => {
  try {
    const { amountPaid, paymentMethod, transactionReference, remarks } = req.body;

    const fee = await Fee.findById(req.params.id);
    if (!fee) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    const paymentNum = Number(amountPaid);
    if (isNaN(paymentNum) || paymentNum <= 0) {
      return res.status(400).json({ success: false, message: 'Please enter a valid payment amount' });
    }

    const newTotalPaid = (fee.paidAmount || 0) + paymentNum;
    if (newTotalPaid > fee.amount) {
      return res.status(400).json({
        success: false,
        message: `Amount exceeds remaining balance. Max payable is ${fee.amount - (fee.paidAmount || 0)}`,
      });
    }

    fee.paidAmount = newTotalPaid;
    fee.paymentMethod = paymentMethod || 'UPI / QR';
    fee.transactionReference = transactionReference || `TXN-${Date.now().toString().slice(-8)}`;
    fee.paidDate = new Date();
    if (remarks) fee.remarks = remarks;

    await fee.save();

    const populatedFee = await Fee.findById(fee._id)
      .populate('student')
      .populate('room');

    res.json({
      success: true,
      fee: populatedFee,
      message: `Payment of ₹${paymentNum.toLocaleString()} recorded successfully for Invoice ${fee.invoiceNumber}`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete fee invoice
// @route   DELETE /api/fees/:id
// @access  Private (Admin)
export const deleteFee = async (req, res, next) => {
  try {
    const fee = await Fee.findById(req.params.id);
    if (!fee) {
      return res.status(404).json({ success: false, message: 'Fee invoice not found' });
    }

    await Fee.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: `Invoice ${fee.invoiceNumber} deleted successfully`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get fee financial statistics
// @route   GET /api/fees/stats/summary
// @access  Private (Admin)
export const getFeeStats = async (req, res, next) => {
  try {
    const fees = await Fee.find();

    let totalInvoiced = 0;
    let totalCollected = 0;
    let totalPending = 0;
    let totalOverdue = 0;

    let paidCount = 0;
    let pendingCount = 0;
    let overdueCount = 0;
    let partialCount = 0;

    const methodStats = {};

    fees.forEach((f) => {
      totalInvoiced += f.amount || 0;
      totalCollected += f.paidAmount || 0;
      const balance = Math.max(0, (f.amount || 0) - (f.paidAmount || 0));

      if (f.status === 'Paid') {
        paidCount++;
      } else if (f.status === 'Partial') {
        partialCount++;
        totalPending += balance;
      } else if (f.status === 'Overdue') {
        overdueCount++;
        totalOverdue += balance;
      } else {
        pendingCount++;
        totalPending += balance;
      }

      if (f.paidAmount > 0 && f.paymentMethod) {
        methodStats[f.paymentMethod] = (methodStats[f.paymentMethod] || 0) + f.paidAmount;
      }
    });

    res.json({
      success: true,
      stats: {
        totalInvoiced,
        totalCollected,
        totalPending: totalPending + totalOverdue,
        totalOverdue,
        paidCount,
        pendingCount,
        overdueCount,
        partialCount,
        collectionRate: totalInvoiced > 0 ? ((totalCollected / totalInvoiced) * 100).toFixed(1) : 0,
        methodStats,
      },
    });
  } catch (error) {
    next(error);
  }
};
