import {
    getStaffProfile,
    getDoctorsByBranch,
    getCustomersByKeyword,
    getPetsByCustomer,
    addServiceInvoice,
    addSDDV
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