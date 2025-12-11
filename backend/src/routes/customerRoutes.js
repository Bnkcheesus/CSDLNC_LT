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
    saveServiceRating,
    getCustomerPets,
    getCustomerPetProfile,
    getCustomerPetHistory,
    getCustomerPackages
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

router.get('/:maTK/pets', authMiddleware, getCustomerPets);
router.get('/pets/:maTC', authMiddleware, getCustomerPetProfile);
router.get('/pets/:maTC/history', authMiddleware, getCustomerPetHistory);

router.get('/:maTK/packages', authMiddleware, getCustomerPackages);

export default router;