import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Student from '../models/Student.js';

// Helper to generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_hostel_jwt_key_2026_xyz', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public (or Admin creating users)
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, studentRegistrationNumber } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists',
      });
    }

    let linkedStudentId = null;
    if (role === 'student' && studentRegistrationNumber) {
      const student = await Student.findOne({ registrationNumber: studentRegistrationNumber.toUpperCase() });
      if (student) {
        linkedStudentId = student._id;
      }
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'student',
      phone: phone || '',
      studentId: linkedStudentId,
    });

    if (linkedStudentId) {
      await Student.findByIdAndUpdate(linkedStudentId, { userAccount: user._id });
    }

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        studentId: user.studentId,
      },
      message: 'User registered successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
    }

    // Check for user (include password field which has select: false)
    const user = await User.findOne({ email }).select('+password').populate('studentId');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact the hostel administrator.',
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        studentId: user.studentId ? user.studentId._id : null,
        student: user.studentId || null,
      },
      message: 'Logged in successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'studentId',
      populate: { path: 'currentRoom' },
    });

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (req.body.name) user.name = req.body.name;
    if (req.body.phone) user.phone = req.body.phone;
    if (req.body.avatar) user.avatar = req.body.avatar;

    if (req.body.password && req.body.newPassword) {
      const isMatch = await user.comparePassword(req.body.password);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Current password is incorrect' });
      }
      user.password = req.body.newPassword;
    }

    await user.save();

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
      },
      message: 'Profile updated successfully',
    });
  } catch (error) {
    next(error);
  }
};
