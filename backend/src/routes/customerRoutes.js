import express from 'express';
import {
    getCustomerName,
    getCustomerDetails,
    updateCustomerDetails,
    getCustomerServiceHistory,
    getCustomerServiceHistoryDetail
} from '../controllers/customerController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/:maTK/name', authMiddleware, getCustomerName);
router.get('/:maTK', authMiddleware, getCustomerDetails);
router.put('/:maTK', authMiddleware, updateCustomerDetails);
router.get('/:maTK/history', authMiddleware, getCustomerServiceHistory);
router.get('/history/:maSDDV', authMiddleware, getCustomerServiceHistoryDetail);

export default router;