import express from 'express';
import {
    getSystemRevenueController,
    getYearsController
} from '../controllers/managerController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/revenue', authMiddleware, getSystemRevenueController);
router.get('/revenue/years', authMiddleware, getYearsController);


export default router;