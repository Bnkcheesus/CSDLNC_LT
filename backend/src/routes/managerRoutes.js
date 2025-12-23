import express from 'express';
import {
    getSystemRevenueController,
    getRevenueByBranchesController,
    getYearsController,
    getSystemProductsRecordController,
    getProductsRecordOfBranchController
} from '../controllers/managerController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/revenue', authMiddleware, getSystemRevenueController);
router.get('/revenue/branches', authMiddleware, getRevenueByBranchesController);
router.get('/years', authMiddleware, getYearsController);
router.get('/products', authMiddleware, getSystemProductsRecordController);
router.get('/products/:maCN', authMiddleware, getProductsRecordOfBranchController);

export default router;