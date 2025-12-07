import express from 'express';
import {
    getCustomerName,
    getCustomerDetails,
    updateCustomerDetails,
    getCustomerServiceHistory,
    getCustomerExaminationDetail,
    getCustomerVaccinationDetail,
    getCustomerPurchaseDetail,
    getServiceRating,
    saveServiceRating
} from '../controllers/customerController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/:maTK/name', authMiddleware, getCustomerName);
router.get('/:maTK', authMiddleware, getCustomerDetails);
router.put('/:maTK', authMiddleware, updateCustomerDetails);
router.get('/:maTK/history', authMiddleware, getCustomerServiceHistory);
router.get('/khambenh/:maSDDV', authMiddleware, getCustomerExaminationDetail);
router.get('/tiemphong/:maSDDV', authMiddleware, getCustomerVaccinationDetail);
router.get('/muahang/:maSDDV', authMiddleware, getCustomerPurchaseDetail);
router.get('/rating/:maSDDV', authMiddleware, getServiceRating);
router.post('/rating/:maSDDV', authMiddleware, saveServiceRating);

export default router;