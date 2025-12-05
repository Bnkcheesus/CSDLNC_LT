import { getCustomerNameByID, getCustomerDetailsByID } from "../models/CustomerModel.js";

export const getCustomerName = async (req, res) => {
    try {
        const { maTK } = req.params;
        if (!maTK) {
            return res.status(400).json({ message: 'MaTKKH is required' });
        }

        const customerName = await getCustomerNameByID(maTK);
        if (!customerName) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        return res.status(200).json({
            success: true,
            hoTen: customerName
        });
    } catch (err) {
        console.error('Error in getCustomerName controller:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const getCustomerDetails = async (req, res) => {
    try {
        const { maTK } = req.params;
        if (!maTK) {
            return res.status(400).json({ message: 'MaTKKH is required' });
        }

        const customerDetails = await getCustomerDetailsByID(maTK);
        if (!customerDetails) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        return res.status(200).json({
            success: true,
            data: customerDetails
        });
    } catch (err) {
        console.error('Error in getCustomerDetails controller:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};