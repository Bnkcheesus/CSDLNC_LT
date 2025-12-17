import express from 'express';
import {
    getStaffProfileController,
    getDoctorsByBranchController,
    getCustomersByKeywordController,
    getPetsByCustomerController,
    addServiceInvoiceController,
    getServiceInvoiceHistoryController,
    addSDDVController,
    getServiceInvoiceInfoController,
    getServiceInvoiceDetailController,
    getExaminationDetailController,
    getVaccinationDetailController,
    getPurchaseDetailController
} from '../controllers/staffController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/profile', authMiddleware, getStaffProfileController);
router.get('/doctors/:maCN', authMiddleware, getDoctorsByBranchController);
router.get('/customers', authMiddleware, getCustomersByKeywordController);
router.get('/pets/:maTKKH', authMiddleware, getPetsByCustomerController);
router.post('/hddv', authMiddleware, addServiceInvoiceController);
router.get('/hddv', authMiddleware, getServiceInvoiceHistoryController);
router.post('/sddv', authMiddleware, addSDDVController);
router.get('/invoices/:maHD', authMiddleware, getServiceInvoiceInfoController);
router.get('/invoices/:maHD/details', authMiddleware, getServiceInvoiceDetailController);
router.get('/khambenh/:maSDDV', authMiddleware, getExaminationDetailController);
router.get('/tiemphong/:maSDDV', authMiddleware, getVaccinationDetailController);
router.get('/muahang/:maSDDV', authMiddleware, getPurchaseDetailController);

export default router;