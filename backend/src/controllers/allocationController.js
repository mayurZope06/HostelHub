import Allocation from '../models/Allocation.js';
import Room from '../models/Room.js';
import Student from '../models/Student.js';
import Fee from '../models/Fee.js';

// @desc    Get all room allocations
// @route   GET /api/allocations
// @access  Private
export const getAllocations = async (req, res, next) => {
  try {
    const { status, search, academicYear, page = 1, limit = 50 } = req.query;

    const query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    if (academicYear && academicYear !== 'All') {
      query.academicYear = academicYear;
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Allocation.countDocuments(query);
    let allocations = await Allocation.find(query)
      .populate('student', 'firstName lastName registrationNumber email phone course department avatar')
      .populate('room', 'roomNumber block floor roomType feePerSemester')
      .populate('allocatedBy', 'name email')
      .sort('-createdAt')
      .skip(skip)
      .limit(limitNum);

    // Apply student search in-memory if search parameter given
    if (search) {
      const q = search.toLowerCase();
      allocations = allocations.filter((a) => {
        const student = a.student;
        const room = a.room;
        return (
          student?.firstName?.toLowerCase().includes(q) ||
          student?.lastName?.toLowerCase().includes(q) ||
          student?.registrationNumber?.toLowerCase().includes(q) ||
          room?.roomNumber?.toLowerCase().includes(q)
        );
      });
    }

    res.json({
      success: true,
      count: allocations.length,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      currentPage: pageNum,
      allocations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Allocate room to student
// @route   POST /api/allocations
// @access  Private (Admin)
export const allocateRoom = async (req, res, next) => {
  try {
    const { studentId, roomId, academicYear, startDate, remarks, generateFeeInvoice } = req.body;

    // 1. Verify Student
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Check if student already has an active room allocation
    if (student.currentRoom) {
      const currentAssignedRoom = await Room.findById(student.currentRoom);
      return res.status(400).json({
        success: false,
        message: `Student already allocated to Room ${currentAssignedRoom?.roomNumber || 'Unknown'}. Please transfer or checkout first.`,
      });
    }

    // 2. Verify Room
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    if (room.status === 'Maintenance') {
      return res.status(400).json({ success: false, message: 'Room is currently under maintenance' });
    }

    if (room.occupiedBeds >= room.capacity) {
      return res.status(400).json({
        success: false,
        message: `Room ${room.roomNumber} is already full (Capacity: ${room.capacity})`,
      });
    }

    // Next bed number in room
    const nextBedNumber = room.occupiedBeds + 1;

    // 3. Create Allocation Record
    const allocation = await Allocation.create({
      student: student._id,
      room: room._id,
      bedNumber: nextBedNumber,
      academicYear: academicYear || '2025-2026',
      startDate: startDate || new Date(),
      remarks: remarks || '',
      monthlyFee: room.feePerSemester,
      allocatedBy: req.user?._id || null,
      status: 'Active',
    });

    // 4. Update Room occupied beds
    room.occupiedBeds += 1;
    await room.save();

    // 5. Update Student's current room
    student.currentRoom = room._id;
    student.allocationDate = allocation.startDate;
    student.status = 'Active';
    await student.save();

    // 6. Optionally generate fee invoice
    if (generateFeeInvoice) {
      const invoiceNum = `INV-${Date.now().toString().slice(-6)}`;
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 15); // Due in 15 days

      await Fee.create({
        invoiceNumber: invoiceNum,
        student: student._id,
        room: room._id,
        title: `Room ${room.roomNumber} Hostel Fee (${academicYear || '2025-2026'})`,
        feeType: 'Hostel Rent',
        amount: room.feePerSemester || 25000,
        paidAmount: 0,
        dueDate,
        status: 'Pending',
      });
    }

    const populatedAllocation = await Allocation.findById(allocation._id)
      .populate('student')
      .populate('room');

    res.status(201).json({
      success: true,
      allocation: populatedAllocation,
      message: `Room ${room.roomNumber} allocated to ${student.firstName} ${student.lastName} successfully`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Vacate room (Checkout student)
// @route   POST /api/allocations/:id/vacate
// @access  Private (Admin)
export const vacateRoom = async (req, res, next) => {
  try {
    const allocation = await Allocation.findById(req.params.id);

    if (!allocation) {
      return res.status(404).json({ success: false, message: 'Allocation record not found' });
    }

    if (allocation.status !== 'Active') {
      return res.status(400).json({ success: false, message: 'This allocation is already inactive/vacated' });
    }

    // Update Room
    const room = await Room.findById(allocation.room);
    if (room) {
      room.occupiedBeds = Math.max(0, room.occupiedBeds - 1);
      await room.save();
    }

    // Update Student
    const student = await Student.findById(allocation.student);
    if (student) {
      student.currentRoom = null;
      student.allocationDate = null;
      await student.save();
    }

    // Update Allocation
    allocation.status = 'Vacated';
    allocation.endDate = new Date();
    allocation.remarks = req.body.remarks
      ? `${allocation.remarks ? allocation.remarks + ' | ' : ''}Vacated: ${req.body.remarks}`
      : allocation.remarks;
    await allocation.save();

    res.json({
      success: true,
      allocation,
      message: `Student checked out and Room ${room?.roomNumber || ''} bed vacated successfully`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Transfer student to another room
// @route   POST /api/allocations/:id/transfer
// @access  Private (Admin)
export const transferRoom = async (req, res, next) => {
  try {
    const { newRoomId, remarks } = req.body;

    const oldAllocation = await Allocation.findById(req.params.id);
    if (!oldAllocation || oldAllocation.status !== 'Active') {
      return res.status(400).json({ success: false, message: 'No active allocation found to transfer' });
    }

    const newRoom = await Room.findById(newRoomId);
    if (!newRoom) {
      return res.status(404).json({ success: false, message: 'Target room not found' });
    }

    if (newRoom._id.toString() === oldAllocation.room.toString()) {
      return res.status(400).json({ success: false, message: 'Student is already in this room' });
    }

    if (newRoom.occupiedBeds >= newRoom.capacity) {
      return res.status(400).json({ success: false, message: `Target Room ${newRoom.roomNumber} is full` });
    }

    // 1. Release bed from old room
    const oldRoom = await Room.findById(oldAllocation.room);
    if (oldRoom) {
      oldRoom.occupiedBeds = Math.max(0, oldRoom.occupiedBeds - 1);
      await oldRoom.save();
    }

    // 2. Mark old allocation as Transferred
    oldAllocation.status = 'Transferred';
    oldAllocation.endDate = new Date();
    oldAllocation.remarks = `${oldAllocation.remarks || ''} Transferred to Room ${newRoom.roomNumber}`.trim();
    await oldAllocation.save();

    // 3. Increment new room beds
    newRoom.occupiedBeds += 1;
    await newRoom.save();

    // 4. Create new allocation
    const newAllocation = await Allocation.create({
      student: oldAllocation.student,
      room: newRoom._id,
      bedNumber: newRoom.occupiedBeds,
      academicYear: oldAllocation.academicYear,
      startDate: new Date(),
      monthlyFee: newRoom.feePerSemester,
      remarks: remarks || `Transferred from Room ${oldRoom?.roomNumber || 'old room'}`,
      allocatedBy: req.user?._id || null,
      status: 'Active',
    });

    // 5. Update Student
    await Student.findByIdAndUpdate(oldAllocation.student, {
      currentRoom: newRoom._id,
      allocationDate: new Date(),
    });

    const populatedNew = await Allocation.findById(newAllocation._id)
      .populate('student')
      .populate('room');

    res.json({
      success: true,
      allocation: populatedNew,
      message: `Student transferred from Room ${oldRoom?.roomNumber} to Room ${newRoom.roomNumber} successfully`,
    });
  } catch (error) {
    next(error);
  }
};
