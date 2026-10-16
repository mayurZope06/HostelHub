import express from 'express';
import {
  getAllocations,
  allocateRoom,
  vacateRoom,
  transferRoom,
} from '../controllers/allocationController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getAllocations)
  .post(authorize('admin'), allocateRoom);

router.post('/:id/vacate', authorize('admin'), vacateRoom);
router.post('/:id/transfer', authorize('admin'), transferRoom);

export default router;
