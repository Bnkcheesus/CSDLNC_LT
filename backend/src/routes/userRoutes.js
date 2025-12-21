import express from 'express';
import { getUserName } from '../controllers/userController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/name', authMiddleware, getUserName);

export default router;