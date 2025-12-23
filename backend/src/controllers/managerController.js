import {
    getRevenue,
    getMonthlyRevenue,
    getRevenueByBranches,
    getYears,
    getSystemProductsRecord,
    getProductsRecordOfBranch
} from "../models/ManagerModel.js";

export const getSystemRevenueController = async (req, res) => {
    try {
        const { year } = req.query;
        if (!year) {
            return res.status(400).json({ message: 'Year is required' });
        }
        const yearRevenue = await getRevenue(year);
        const monthlyRevenue = await getMonthlyRevenue(year);
        return res.status(200).json({
            success: true,
            data: {
                yearRevenue: yearRevenue,
                monthlyRevenue: monthlyRevenue
            }
        });
    } catch (err) {
        console.error('Error in getSystemRevenueController:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const getRevenueByBranchesController = async (req, res) => {
    try {
        const { year } = req.query;
        if (!year) {
            return res.status(400).json({ message: 'Year is required' });
        }
        const yearRevenue = await getRevenue(year);
        const revenueByBranches = await getRevenueByBranches(year);
        return res.status(200).json({
            success: true,
            data: {
                yearRevenue: yearRevenue,
                branchRevenue: revenueByBranches
            }
        });
    } catch (err) {
        console.error('Error in getRevenueByBranchesController:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const getYearsController = async (req, res) => {
    try {
        const years = await getYears();
        return res.status(200).json({
            success: true,
            data: years
        });
    } catch (err) {
        console.error('Error in getYearsController:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const getSystemProductsRecordController = async (req, res) => {
    try {
        const { year } = req.query;
        if (!year) {
            return res.status(400).json({ message: 'Year is required' });
        }
        const productsRecord = await getSystemProductsRecord(year);
        return res.status(200).json({
            success: true,
            data: {
                thuocData: productsRecord.thuocData,
                vaccineData: productsRecord.vaccineData,
                banleData: productsRecord.banleData,
                total: productsRecord.total
            } 
        });
    } catch (err) {
        console.error('Error in getSystemProductsRecordController:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const getProductsRecordOfBranchController = async (req, res) => {
    try {
        const { maCN } = req.params;
        const { year } = req.query;
        if (!maCN) {
            return res.status(400).json({ message: 'MaCN is required' });
        }
        if (!year) {
            return res.status(400).json({ message: 'Year is required' });
        }
        const productsRecord = await getProductsRecordOfBranch(year, maCN);
        return res.status(200).json({
            success: true,
            data: {
                thuocData: productsRecord.thuocData,
                vaccineData: productsRecord.vaccineData,
                banleData: productsRecord.banleData,
                total: productsRecord.total
            } 
        });
    } catch (err) {
        console.error('Error in getProductsRecordOfBranchController:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};