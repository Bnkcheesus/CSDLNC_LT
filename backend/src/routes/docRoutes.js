import express from 'express';
import {
    getDocServiceHistoryController,
    getDocExaminationInfoController,
    updateDocExaminationInfoController,
    getToaThuocController,
    updateToaThuocController,
    addThuocController,
    deleteThuocController,
    getDocVaccinationInfoController,
    getToaTiemController,
    updateToaTiemController,
    addVaccineController,
    deleteVaccineController,
    getPetInfoController,
    updatePetHealthController,
    getPetHistoryController,
    getPetPackagesController,
    getMedicineByKeywordController,
    getVaccineByKeywordController
} from '../controllers/docController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/history', authMiddleware, getDocServiceHistoryController);

router.get('/khambenh/:maSDDV', authMiddleware, getDocExaminationInfoController);
router.put('/khambenh/:maSDDV', authMiddleware, updateDocExaminationInfoController);
router.get('/khambenh/:maSDDV/toathuoc', authMiddleware, getToaThuocController);
router.post('/khambenh/:maSDDV/toathuoc', authMiddleware, addThuocController);
router.delete('/khambenh/:maSDDV/toathuoc/:maThuoc', authMiddleware, deleteThuocController);
router.put('/khambenh/:maSDDV/toathuoc/:maThuoc', authMiddleware, updateToaThuocController);

router.get('/tiemphong/:maSDDV', authMiddleware, getDocVaccinationInfoController);
router.get('/tiemphong/:maSDDV/toatiem', authMiddleware, getToaTiemController);
router.post('/tiemphong/:maSDDV/toatiem', authMiddleware, addVaccineController);
router.delete('/tiemphong/:maSDDV/toatiem/:maVaccine', authMiddleware, deleteVaccineController);
router.put('/tiemphong/:maSDDV/toatiem/:maVaccine', authMiddleware, updateToaTiemController);

router.get('/pet/:maTC', authMiddleware, getPetInfoController);
router.put('/pet/:maTC', authMiddleware, updatePetHealthController);
router.get('/pet/:maTC/history', authMiddleware, getPetHistoryController);
router.get('/pet/:maTC/goitiem', authMiddleware, getPetPackagesController);

router.get('/thuoc', authMiddleware, getMedicineByKeywordController);
router.get('/vaccine', authMiddleware, getVaccineByKeywordController);

export default router;