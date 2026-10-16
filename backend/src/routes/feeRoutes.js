import express from 'express';
import {
  getFees,
  getFeeById,
  createFee,
  recordPayment,
  deleteFee,
  getFeeStats,
} from '../controllers/feeController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/stats/summary', authorize('admin'), getFeeStats);

router.route('/')
  .get(getFees)
  .post(authorize('admin'), createFee);

router.route('/:id')
  .get(getFeeById)
  .delete(authorize('admin'), deleteFee);

router.post('/:id/pay', recordPayment);

export default router;
