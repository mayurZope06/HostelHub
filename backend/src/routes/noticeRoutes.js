import express from 'express';
import {
  getNotices,
  createNotice,
  updateNotice,
  deleteNotice,
} from '../controllers/noticeController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getNotices)
  .post(authorize('admin'), createNotice);

router.route('/:id')
  .put(authorize('admin'), updateNotice)
  .delete(authorize('admin'), deleteNotice);

export default router;
