import express from 'express';
import {
    getInvoicesByKeywordController,
    addSDDVMuaHangController,
    addProductController,
    getProductsByKeywordController
} from '../controllers/salesController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/invoices/:maCN', authMiddleware, getInvoicesByKeywordController);
router.post('/sddv', authMiddleware, addSDDVMuaHangController);
router.post('/hdmh', authMiddleware, addProductController);
router.get('/products', authMiddleware, getProductsByKeywordController);

export default router;