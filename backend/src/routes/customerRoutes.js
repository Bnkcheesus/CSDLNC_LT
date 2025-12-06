import express from 'express';
import { getCustomerName, getCustomerDetails, updateCustomerDetails } from '../controllers/customerController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/:maTK/name', authMiddleware, getCustomerName);
router.get('/:maTK', authMiddleware, getCustomerDetails);
router.put('/:maTK', authMiddleware, updateCustomerDetails);

export default router;