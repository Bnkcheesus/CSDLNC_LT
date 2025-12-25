import e from 'express';
import {
    getStaffProfile,
    updateStaffProfile,
    getDoctorsByBranch,
    getCustomersByKeyword,
    getPetsByCustomer,
    addServiceInvoice,
    getServiceInvoiceHistory,
    addSDDV,
    getServiceInvoiceInfo,
    updateServiceInvoiceInfo,
    getServiceInvoiceDetail,
    getExaminationDetail,
    getVaccinationDetail,
    getPurchaseDetail
} from '../models/StaffModel.js';

export const getStaffProfileController = async (req, res) => {
    try {
        const maTK = req.user.maTK;
        if (!maTK) {
            return res.status(400).json({ message: 'MaTKNV is required' });
        }

        const staffProfile = await getStaffProfile(maTK);
        if (!staffProfile) {
            return res.status(404).json({ message: 'Staff not found' });
        }
        return res.status(200).json({
            success: true,
            data: staffProfile
        });
    } catch (err) {
        console.error('Error in getStaffProfile controller:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateStaffProfileController = async (req, res) => {
    try {
        const maTK = req.user.maTK;
        if (!maTK) {
            return res.status(400).json({ message: 'MaTKNV is required' });
        }
        const updateData = req.body;

        const updateSuccess = await updateStaffProfile(maTK, updateData);
        if (!updateSuccess) {
            return res.status(500).json({ message: 'Failed to update staff profile' });
        }
        return res.status(200).json({
            success: true,
            message: 'Staff profile updated successfully'
        });
    } catch (err) {
        console.error('Error in updateStaffProfile controller:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const getDoctorsByBranchController = async (req, res) => {
    try {
        const { maCN } = req.params;
        if (!maCN) {
            return res.status(400).json({ message: 'MaCN is required' });
        }
        
        const doctors = await getDoctorsByBranch(maCN);
        return res.status(200).json({
            success: true,
            data: doctors
        });
    } catch (err) {
        console.error('Error in getDoctorsByBranch controller:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const getCustomersByKeywordController = async (req, res) => {
    try {
        const { search } = req.query;
        
        const customers = await getCustomersByKeyword(search);
        return res.status(200).json({
            success: true,
            data: customers
        });
    } catch (err) {
        console.error('Error in getCustomersByKeyword controller:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const getPetsByCustomerController = async (req, res) => {
    try {
        const { maTKKH } = req.params;
        if (!maTKKH) {
            return res.status(400).json({ message: 'MaTKKH is required' });
        }

        const pets = await getPetsByCustomer(maTKKH);
        return res.status(200).json({
            success: true,
            data: pets
        });
    } catch (err) {
        console.error('Error in getPetsByCustomer controller:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const addServiceInvoiceController = async (req, res) => {
    try {
        const invoiceData = req.body;
        if (!invoiceData || Object.keys(invoiceData).length === 0) {
            return res.status(400).json({ message: 'Invoice data is required' });
        }

        const maTKKH = invoiceData.MaTKKH;
        const maTKNV = invoiceData.MaTKNV;
        const maCN = invoiceData.MaCN;
        const result = await addServiceInvoice(maTKKH, maTKNV, maCN);
        return res.status(200).json({
            success: true,
            data: result
        });
    } catch (err) {
        console.error('Error in addServiceInvoice controller:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const getServiceInvoiceHistoryController = async (req, res) => {
    try {
        const maTK = req.user.maTK;
        if (!maTK) {
            return res.status(400).json({ message: 'MaTKNV is required' });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const type = req.query.type || "all";
        const branch = req.query.branch || null;
        const keyword = req.query.keyword != "" ? req.query.keyword : null;
        
        const history = await getServiceInvoiceHistory(maTK, keyword, branch, type, page, limit);
        return res.status(200).json({
            success: true,
            data: history
        });
    } catch (err) {
        console.error('Error in getServiceInvoiceHistory controller:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const addSDDVController = async (req, res) => {
    try {
        const sddvData = req.body;
        if (!sddvData || Object.keys(sddvData).length === 0) {
            return res.status(400).json({ message: 'SDDV data is required' });
        }

        const maHD = sddvData.MaHD;
        const loaiDV = sddvData.LoaiDV;
        const maBS = sddvData.MaBS;
        const maTC = sddvData.MaTC;
        await addSDDV(maHD, loaiDV, maBS, maTC);
        return res.status(200).json({
            success: true,
            message: 'SDDV added successfully'
        });
    } catch (err) {
        console.error('Error in addSDDV controller:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const getServiceInvoiceInfoController = async (req, res) => {
    try {
        const { maHD } = req.params;
        if (!maHD) {
            return res.status(400).json({ message: 'MaHD is required' });
        }
        const info = await getServiceInvoiceInfo(maHD);
        return res.status(200).json({
            success: true,
            data: info
        });
    } catch (err) {
        console.error('Error in getServiceInvoiceInfo controller:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateServiceInvoiceInfoController = async (req, res) => {
    try {
        const { maHD } = req.params;
        const { KhuyenMai, HinhThucThanhToan } = req.body;

        if (!maHD) {
            return res.status(400).json({ message: 'MaHD is required' });
        }

        const updatedInfo = await updateServiceInvoiceInfo(maHD, KhuyenMai, HinhThucThanhToan);
        return res.status(200).json({
            success: true,
            data: updatedInfo
        });
    } catch (err) {
        console.error('Error in updateServiceInvoiceInfo controller:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const getServiceInvoiceDetailController = async (req, res) => {
    try {
        const { maHD } = req.params;
        if (!maHD) {
            return res.status(400).json({ message: 'MaHD is required' });
        }
        const detail = await getServiceInvoiceDetail(maHD);
        return res.status(200).json({
            success: true,
            data: detail
        });
    } catch (err) {
        console.error('Error in getServiceInvoiceDetail controller:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const getExaminationDetailController = async (req, res) => {
    try {
        const { maSDDV } = req.params;
        if (!maSDDV) {
            return res.status(400).json({ message: 'MaSDDV is required' });
        }
        const detail = await getExaminationDetail(maSDDV);
        return res.status(200).json({
            success: true,
            data: detail
        });
    } catch (err) {
        console.error('Error in getExaminationDetail controller:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const getVaccinationDetailController = async (req, res) => {
    try {
        const { maSDDV } = req.params;
        if (!maSDDV) {
            return res.status(400).json({ message: 'MaSDDV is required' });
        }
        const detail = await getVaccinationDetail(maSDDV);
        return res.status(200).json({
            success: true,
            data: detail
        });
    } catch (err) {
        console.error('Error in getVaccinationDetail controller:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const getPurchaseDetailController = async (req, res) => {
    try {
        const { maSDDV } = req.params;
        if (!maSDDV) {
            return res.status(400).json({ message: 'MaSDDV is required' });
        }
        const detail = await getPurchaseDetail(maSDDV);
        return res.status(200).json({
            success: true,
            data: detail
        });
    } catch (err) {
        console.error('Error in getPurchaseDetail controller:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};