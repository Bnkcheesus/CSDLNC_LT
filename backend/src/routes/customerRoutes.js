import express from 'express';
import { getCustomerName } from '../controllers/customerController.js';
import { authMiddleware } from '../../middleware/authMiddleware.js';

const router = express.Router();

router.get('/:maTK/name', authMiddleware, getCustomerName);

export default router;