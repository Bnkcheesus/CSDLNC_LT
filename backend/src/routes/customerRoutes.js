import express from 'express';
import { getCustomerName, getCustomerDetails } from '../controllers/customerController.js';
import { authMiddleware } from '../../middleware/authMiddleware.js';

const router = express.Router();

router.get('/:maTK/name', authMiddleware, getCustomerName);
router.get('/:maTK', authMiddleware, getCustomerDetails);

export default router;