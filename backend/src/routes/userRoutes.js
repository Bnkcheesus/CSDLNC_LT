import express from 'express';
import {
    changeUserPasswordController,
    getUserName,
    getBranchesController,
    getDoctorsByBranchController,
    getPetsByCustomerController,
    getPackagesController,
    getPackageDetailController
} from '../controllers/userController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.put('/password', authMiddleware, changeUserPasswordController);
router.get('/name', authMiddleware, getUserName);
router.get('/branches', authMiddleware, getBranchesController);
router.get('/doctors/:maCN', authMiddleware, getDoctorsByBranchController);
router.get('/pets/:maTKKH', authMiddleware, getPetsByCustomerController);
router.get('/packages', authMiddleware, getPackagesController);
router.get('/packages/:maGoi', authMiddleware, getPackageDetailController);

export default router;