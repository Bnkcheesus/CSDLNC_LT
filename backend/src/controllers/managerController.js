import {
    getRevenue,
    getMonthlyRevenue,
    getYears
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