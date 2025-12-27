import express from 'express';
import {
    getCustomerDetails,
    updateCustomerDetails,
    getCustomerServiceHistory,
    getCustomerExaminationDetail,
    getCustomerVaccinationDetail,
    getCustomerPurchaseDetail,
    getServiceRating,
    saveServiceRating,
    getCustomerPets,
    getAllCustomerPets,
    getCustomerPetProfile,
    getCustomerPetHistory,
    getCustomerPackages,
    registerCustomerPackage,
    addAppointmentController,
    addAppointmentServiceController,
    getProductsController,
    addOrderController,
    addOrderDetailController
} from '../controllers/customerController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/profile', authMiddleware, getCustomerDetails);
router.put('/profile', authMiddleware, updateCustomerDetails);
router.get('/history', authMiddleware, getCustomerServiceHistory);
router.get('/khambenh/:maSDDV', authMiddleware, getCustomerExaminationDetail);
router.get('/tiemphong/:maSDDV', authMiddleware, getCustomerVaccinationDetail);
router.get('/muahang/:maSDDV', authMiddleware, getCustomerPurchaseDetail);
router.get('/rating/:maSDDV', authMiddleware, getServiceRating);
router.post('/rating/:maSDDV', authMiddleware, saveServiceRating);

router.get('/pets', authMiddleware, getCustomerPets);
router.get('/all-pets', authMiddleware, getAllCustomerPets);
router.get('/pets/:maTC', authMiddleware, getCustomerPetProfile);
router.get('/pets/:maTC/history', authMiddleware, getCustomerPetHistory);

router.get('/packages', authMiddleware, getCustomerPackages);
router.post('/packages/register', authMiddleware, registerCustomerPackage);

router.post('/appointment', authMiddleware, addAppointmentController);
router.post('/appointment/service', authMiddleware, addAppointmentServiceController);

router.get('/products', authMiddleware, getProductsController);
router.post('/order', authMiddleware, addOrderController);
router.post('/order/:maSDDV', authMiddleware, addOrderDetailController);

export default router;