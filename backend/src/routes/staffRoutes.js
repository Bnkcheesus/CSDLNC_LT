import express from 'express';
import {
    getStaffProfileController,
    getDoctorsByBranchController,
    getCustomersByKeywordController,
    getPetsByCustomerController,
    addServiceInvoiceController,
    addSDDVController
} from '../controllers/staffController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/profile', authMiddleware, getStaffProfileController);
router.get('/doctors/:maCN', authMiddleware, getDoctorsByBranchController);
router.get('/customers', authMiddleware, getCustomersByKeywordController);
router.get('/pets/:maTKKH', authMiddleware, getPetsByCustomerController);
router.post('/hddv', authMiddleware, addServiceInvoiceController);
router.post('/sddv', authMiddleware, addSDDVController);

export default router;