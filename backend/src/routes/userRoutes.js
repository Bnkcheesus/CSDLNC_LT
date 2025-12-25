import express from 'express';
import {
    getUserName,
    getBranchesController,
    getDoctorsByBranchController,
    getPetsByCustomerController
} from '../controllers/userController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/name', authMiddleware, getUserName);
router.get('/branches', authMiddleware, getBranchesController);
router.get('/doctors/:maCN', authMiddleware, getDoctorsByBranchController);
router.get('/pets/:maTKKH', authMiddleware, getPetsByCustomerController);

export default router;