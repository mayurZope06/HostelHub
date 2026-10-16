import Room from '../models/Room.js';
import Student from '../models/Student.js';
import Allocation from '../models/Allocation.js';

// @desc    Get all rooms with search & filters
// @route   GET /api/rooms
// @access  Private
export const getRooms = async (req, res, next) => {
  try {
    const { block, roomType, status, search, floor, page = 1, limit = 50 } = req.query;

    const query = {};

    if (search) {
      query.roomNumber = { $regex: search, $options: 'i' };
    }

    if (block && block !== 'All') {
      query.block = block;
    }

    if (roomType && roomType !== 'All') {
      query.roomType = roomType;
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (floor !== undefined && floor !== '' && floor !== 'All') {
      query.floor = parseInt(floor, 10);
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Room.countDocuments(query);
    const rooms = await Room.find(query).sort('roomNumber').skip(skip).limit(limitNum);

    // Get current occupants for each room
    const roomIds = rooms.map((r) => r._id);
    const activeAllocations = await Allocation.find({
      room: { $in: roomIds },
      status: 'Active',
    }).populate('student', 'firstName lastName registrationNumber course phone email avatar');

    // Attach occupants to room objects
    const roomsWithOccupants = rooms.map((room) => {
      const roomObj = room.toObject({ virtuals: true });
      roomObj.occupants = activeAllocations
        .filter((alloc) => alloc.room.toString() === room._id.toString())
        .map((alloc) => ({
          allocationId: alloc._id,
          student: alloc.student,
          bedNumber: alloc.bedNumber,
          startDate: alloc.startDate,
        }));
      return roomObj;
    });

    res.json({
      success: true,
      count: roomsWithOccupants.length,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      currentPage: pageNum,
      rooms: roomsWithOccupants,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single room by ID
// @route   GET /api/rooms/:id
// @access  Private
export const getRoomById = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    const allocations = await Allocation.find({ room: room._id })
      .populate('student', 'firstName lastName registrationNumber phone email course')
      .sort('-createdAt');

    const currentOccupants = allocations.filter((a) => a.status === 'Active');

    res.json({
      success: true,
      room: room.toObject({ virtuals: true }),
      currentOccupants,
      allocationHistory: allocations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new room
// @route   POST /api/rooms
// @access  Private (Admin)
export const createRoom = async (req, res, next) => {
  try {
    const { roomNumber } = req.body;

    const existingRoom = await Room.findOne({ roomNumber: roomNumber.toUpperCase() });
    if (existingRoom) {
      return res.status(400).json({ success: false, message: `Room ${roomNumber} already exists` });
    }

    const room = await Room.create({
      ...req.body,
      roomNumber: roomNumber.toUpperCase(),
      occupiedBeds: 0,
    });

    res.status(201).json({
      success: true,
      room,
      message: 'Room created successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update room details
// @route   PUT /api/rooms/:id
// @access  Private (Admin)
export const updateRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    if (req.body.roomNumber && req.body.roomNumber.toUpperCase() !== room.roomNumber) {
      const duplicate = await Room.findOne({ roomNumber: req.body.roomNumber.toUpperCase() });
      if (duplicate) {
        return res.status(400).json({ success: false, message: `Room ${req.body.roomNumber} already exists` });
      }
    }

    // If new capacity is lower than current occupied beds, reject
    if (req.body.capacity && req.body.capacity < room.occupiedBeds) {
      return res.status(400).json({
        success: false,
        message: `Capacity cannot be lower than currently occupied beds (${room.occupiedBeds})`,
      });
    }

    const updatedRoom = await Room.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        roomNumber: req.body.roomNumber ? req.body.roomNumber.toUpperCase() : room.roomNumber,
      },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      room: updatedRoom,
      message: 'Room updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete room
// @route   DELETE /api/rooms/:id
// @access  Private (Admin)
export const deleteRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    if (room.occupiedBeds > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete room with active occupants (${room.occupiedBeds} beds currently assigned)`,
      });
    }

    await Room.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Room deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get room statistics summary
// @route   GET /api/rooms/stats/summary
// @access  Private
export const getRoomStats = async (req, res, next) => {
  try {
    const rooms = await Room.find();

    const totalRooms = rooms.length;
    let totalCapacity = 0;
    let totalOccupiedBeds = 0;

    const blockDistribution = {};
    const typeDistribution = {};

    rooms.forEach((r) => {
      totalCapacity += r.capacity;
      totalOccupiedBeds += r.occupiedBeds;

      blockDistribution[r.block] = (blockDistribution[r.block] || 0) + 1;
      typeDistribution[r.roomType] = (typeDistribution[r.roomType] || 0) + 1;
    });

    const vacantBeds = Math.max(0, totalCapacity - totalOccupiedBeds);
    const occupancyRate = totalCapacity > 0 ? ((totalOccupiedBeds / totalCapacity) * 100).toFixed(1) : 0;

    res.json({
      success: true,
      stats: {
        totalRooms,
        totalCapacity,
        totalOccupiedBeds,
        vacantBeds,
        occupancyRate: Number(occupancyRate),
        blockDistribution,
        typeDistribution,
      },
    });
  } catch (error) {
    next(error);
  }
};
