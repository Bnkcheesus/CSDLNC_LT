import {
    getInvoicesByKeyword,
    addSDDVMuaHang,
    addProduct,
    getProductsByKeyword
} from "../models/SalesModel.js";

export const getInvoicesByKeywordController = async (req, res) => {
    try {
        const { maCN } = req.params;
        const { search } = req.query;
        if (!maCN) {
            return res.status(400).json({ message: 'maCN is required' });
        }
        const invoices = await getInvoicesByKeyword(maCN, search || "");
        return res.status(200).json({
            success: true,
            data: invoices
        });
    } catch (err) {
        console.error('Error in getInvoicesByKeywordController:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const addSDDVMuaHangController = async (req, res) => {
    try {
        const sddvData = req.body;
        if (!sddvData) {
            return res.status(400).json({ message: 'SDDV data is required' });
        }

        const result = await addSDDVMuaHang(sddvData);
        return res.status(201).json({
            success: true,
            data: result
        });
    } catch (err) {
        console.error('Error in addSDDVMuaHangController:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const addProductController = async (req, res) => {
    try {
        const productData = req.body;
        if (!productData) {
            return res.status(400).json({ message: 'Product data is required' });
        }
        const result = await addProduct(productData);
        return res.status(201).json({
            success: true,
            data: result
        });
    } catch (err) {
        console.error('Error in addProductController:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const getProductsByKeywordController = async (req, res) => {
    try {
        const { search } = req.query;
        const products = await getProductsByKeyword(search || "");
        return res.status(200).json({
            success: true,
            data: products
        });
    } catch (err) {
        console.error('Error in getProductsByKeywordController:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};