import express from 'express';
import {
    getStaffProfileController,
    updateStaffProfileController,
    getCustomersByKeywordController,
    addServiceInvoiceController,
    getServiceInvoiceHistoryController,
    addSDDVController,
    getServiceInvoiceInfoController,
    updateServiceInvoiceInfoController,
    getServiceInvoiceDetailController,
    getExaminationDetailController,
    getVaccinationDetailController,
    getPurchaseDetailController,
    addCustomerPetController
} from '../controllers/staffController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/profile', authMiddleware, getStaffProfileController);
router.put('/profile', authMiddleware, updateStaffProfileController);
router.get('/customers', authMiddleware, getCustomersByKeywordController);
router.post('/hddv', authMiddleware, addServiceInvoiceController);
router.get('/hddv', authMiddleware, getServiceInvoiceHistoryController);
router.post('/sddv', authMiddleware, addSDDVController);
router.get('/invoices/:maHD', authMiddleware, getServiceInvoiceInfoController);
router.put('/invoices/:maHD', authMiddleware, updateServiceInvoiceInfoController);
router.get('/invoices/:maHD/details', authMiddleware, getServiceInvoiceDetailController);
router.get('/khambenh/:maSDDV', authMiddleware, getExaminationDetailController);
router.get('/tiemphong/:maSDDV', authMiddleware, getVaccinationDetailController);
router.get('/muahang/:maSDDV', authMiddleware, getPurchaseDetailController);

router.post('/pets', authMiddleware, addCustomerPetController);

export default router;