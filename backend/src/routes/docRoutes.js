import express from 'express';
import {
    getDocServiceHistoryController,
    getDocExaminationInfoController,
    updateDocExaminationInfoController,
    getToaThuocController,
    updateToaThuocController,
    getPetInfoController,
    getPetHistoryController,
    getMedicineByKeywordController
} from '../controllers/docController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/history', authMiddleware, getDocServiceHistoryController);
router.get('/khambenh/:maSDDV', authMiddleware, getDocExaminationInfoController);
router.put('/khambenh/:maSDDV', authMiddleware, updateDocExaminationInfoController);
router.get('/khambenh/:maSDDV/toathuoc', authMiddleware, getToaThuocController);
router.post('/khambenh/:maSDDV/toathuoc', authMiddleware, updateToaThuocController);
router.get('/pet/:maTC', authMiddleware, getPetInfoController);
router.get('/pet/:maTC/history', authMiddleware, getPetHistoryController);
router.get('/thuoc', authMiddleware, getMedicineByKeywordController);

export default router;