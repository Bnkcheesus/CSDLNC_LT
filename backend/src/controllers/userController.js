import {
    getUserNameByID,
    getBranches,
    getDoctorsByBranch,
    getPetsByCustomer,
    getPackages
} from "../models/UserModel.js";

export const getUserName = async (req, res) => {
    try {
        const maTK = req.user.maTK;
        if (!maTK) {
            return res.status(400).json({ message: 'MaTK is required' });
        }

        const userName = await getUserNameByID(maTK);
        if (!userName) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.status(200).json({
            success: true,
            hoTen: userName
        });
    } catch (err) {
        console.error('Error in getUserName controller:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const getBranchesController = async (req, res) => {
    try {
        const branches = await getBranches();
        return res.status(200).json({
            success: true,
            data: branches
        });
    } catch (err) {
        console.error('Error in getBranches controller:', err);
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

export const getPackagesController = async (req, res) => {
    try {
        const packages = await getPackages();
        return res.status(200).json({
            success: true,
            data: packages
        });
    } catch (err) {
        console.error('Error in getPackages controller:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};