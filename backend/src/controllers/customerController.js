import { 
    getCustomerNameByID,
    getCustomerDetailsByID,
    updateCustomerDetailsByID,
    getCustomerServiceHistoryByID,
    getCustomerExaminationDetailByID,
    getCustomerVaccinationDetailByID,
    getServiceRatingByID,
    saveServiceRatingByID
} from "../models/CustomerModel.js";

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

export const updateCustomerDetails = async (req, res) => {
    try {
        const { maTK } = req.params;
        if (!maTK) {
            return res.status(400).json({ message: 'MaTKKH is required' });
        }

        const updateSuccess = await updateCustomerDetailsByID(maTK, req.body);
        if (!updateSuccess) {
            return res.status(500).json({ message: 'Failed to update customer details' });
        }
        return res.status(200).json({
            success: true,
            message: 'Customer details updated successfully'
        });
    } catch (err) {
        console.error('Error in updateCustomerDetails controller:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const getCustomerServiceHistory = async (req, res) => {
    try {
        const { maTK } = req.params;
        if (!maTK) {
            return res.status(400).json({ message: 'MaTKKH is required' });
        }
        const type = req.query.type || 'all';
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const history = await getCustomerServiceHistoryByID(maTK, type, page, limit);
        return res.status(200).json({
            success: true,
            data: history
        });
    } catch (err) {
        console.error('Error in getCustomerServiceHistory controller:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const getCustomerExaminationDetail = async (req, res) => {
    try {
        const { maSDDV } = req.params;
        if (!maSDDV) {
            return res.status(400).json({ message: 'MaSDDV is required' });
        }

        const examinationDetail = await getCustomerExaminationDetailByID(maSDDV);
        if (!examinationDetail) {
            return res.status(404).json({ message: 'Examination detail not found' });
        }
        return res.status(200).json({
            success: true,
            data: examinationDetail
        });
    } catch (err) {
        console.error('Error in getCustomerExaminationDetail controller:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const getCustomerVaccinationDetail = async (req, res) => {
    try {
        const { maSDDV } = req.params;
        if (!maSDDV) {
            return res.status(400).json({ message: 'MaSDDV is required' });
        }

        const vaccinationDetail = await getCustomerVaccinationDetailByID(maSDDV);
        if (!vaccinationDetail) {
            return res.status(404).json({ message: 'Vaccination detail not found' });
        }
        return res.status(200).json({
            success: true,
            data: vaccinationDetail
        });
    } catch (err) {
        console.error('Error in getCustomerVaccinationDetail controller:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const getServiceRating = async (req, res) => {
    try {
        const { maSDDV } = req.params;
        if (!maSDDV) {
            return res.status(400).json({ message: 'MaSDDV is required' });
        }

        const rating = await getServiceRatingByID(maSDDV);
        return res.status(200).json({
            success: true,
            data: rating
        });
    } catch (err) {
        console.error('Error in getServiceRating controller:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const saveServiceRating = async (req, res) => {
    try {
        const { maSDDV } = req.params;
        if (!maSDDV) {
            return res.status(400).json({ message: 'MaSDDV is required' });
        }
        
        const rating = req.body;

        await saveServiceRatingByID(maSDDV, rating);
        return res.status(200).json({
            success: true,
            message: 'Rating saved successfully'
        });
    } catch (err) {
        console.error('Error in saveServiceRating controller:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};