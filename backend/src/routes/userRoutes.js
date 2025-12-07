import express from 'express';
import { getUserName, getUserRole } from '../controllers/userController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/:maTK/name', authMiddleware, getUserName);
router.get('/:maTK/role', authMiddleware, getUserRole);

export default router;