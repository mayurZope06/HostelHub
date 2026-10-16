import express from 'express';
import {
  getRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
  getRoomStats,
} from '../controllers/roomController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/stats/summary', getRoomStats);

router.route('/')
  .get(getRooms)
  .post(authorize('admin'), createRoom);

router.route('/:id')
  .get(getRoomById)
  .put(authorize('admin'), updateRoom)
  .delete(authorize('admin'), deleteRoom);

export default router;
