import Notice from '../models/Notice.js';

// @desc    Get all notices
// @route   GET /api/notices
// @access  Private
export const getNotices = async (req, res, next) => {
  try {
    const { category, search } = req.query;

    const query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ];
    }

    const notices = await Notice.find(query).sort({ isPinned: -1, createdAt: -1 });

    res.json({
      success: true,
      count: notices.length,
      notices,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new notice
// @route   POST /api/notices
// @access  Private (Admin)
export const createNotice = async (req, res, next) => {
  try {
    const { title, content, category, isPinned, targetAudience } = req.body;

    const notice = await Notice.create({
      title,
      content,
      category: category || 'General',
      isPinned: isPinned || false,
      targetAudience: targetAudience || 'All Students',
      postedBy: req.user?.name || 'Hostel Administration',
    });

    res.status(201).json({
      success: true,
      notice,
      message: 'Notice broadcasted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update notice
// @route   PUT /api/notices/:id
// @access  Private (Admin)
export const updateNotice = async (req, res, next) => {
  try {
    const notice = await Notice.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!notice) {
      return res.status(404).json({ success: false, message: 'Notice not found' });
    }

    res.json({
      success: true,
      notice,
      message: 'Notice updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete notice
// @route   DELETE /api/notices/:id
// @access  Private (Admin)
export const deleteNotice = async (req, res, next) => {
  try {
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      return res.status(404).json({ success: false, message: 'Notice not found' });
    }

    await Notice.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Notice deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
