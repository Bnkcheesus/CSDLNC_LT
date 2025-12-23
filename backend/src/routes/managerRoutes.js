import express from 'express';
import {
    getSystemRevenueController,
    getRevenueByBranchesController,
    getYearsController
} from '../controllers/managerController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/revenue', authMiddleware, getSystemRevenueController);
router.get('/revenue/branches', authMiddleware, getRevenueByBranchesController);
router.get('/revenue/years', authMiddleware, getYearsController);

export default router;