import {
    getCustomerDetailsByID,
    updateCustomerDetailsByID,
    getCustomerServiceHistoryByID,
    getCustomerExaminationDetailByID,
    getCustomerVaccinationDetailByID,
    getCustomerPurchaseDetailByID,
    getServiceRatingByID,
    saveServiceRatingByID,
    getCustomerPetsByID,
    getCustomerPetProfileByID,
    getCustomerPetHistoryByID,
    getCustomerPackagesByID,
    addAppointment,
    addAppointmentService,
    getProducts,
    addOrder,
    addOrderDetail
} from "../models/CustomerModel.js";

export const getCustomerDetails = async (req, res) => {
    try {
        const maTK = req.user.maTK;
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
        const maTK = req.user.maTK;
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
        const maTK = req.user.maTK;
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

export const getCustomerPurchaseDetail = async (req, res) => {
    try {
        const { maSDDV } = req.params;
        if (!maSDDV) {
            return res.status(400).json({ message: 'MaSDDV is required' });
        }

        const purchaseDetail = await getCustomerPurchaseDetailByID(maSDDV);
        if (!purchaseDetail) {
            return res.status(404).json({ message: 'Purchase detail not found' });
        }
        return res.status(200).json({
            success: true,
            data: purchaseDetail
        });
    } catch (err) {
        console.error('Error in getCustomerPurchaseDetail controller:', err);
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

export const getCustomerPets = async (req, res) => {
    try {
        const maTK = req.user.maTK;
        if (!maTK) {
            return res.status(400).json({ message: 'MaTKKH is required' });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const pets = await getCustomerPetsByID(maTK, page, limit);
        return res.status(200).json({
            success: true,
            data: pets
        });
    } catch (err) {
        console.error('Error in getCustomerPets controller:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const getCustomerPetProfile = async (req, res) => {
    try {
        const { maTC } = req.params;
        if (!maTC) {
            return res.status(400).json({ message: 'MaTC is required' });
        }

        const petProfile = await getCustomerPetProfileByID(maTC);
        if (!petProfile) {
            return res.status(404).json({ message: 'Pet profile not found' });
        }
        return res.status(200).json({
            success: true,
            data: petProfile
        });
    } catch (err) {
        console.error('Error in getCustomerPetProfile controller:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const getCustomerPetHistory = async (req, res) => {
    try {
        const { maTC } = req.params;
        if (!maTC) {
            return res.status(400).json({ message: 'MaTC is required' });
        }
        const type = req.query.type || 'all';
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const petHistory = await getCustomerPetHistoryByID(maTC, type, page, limit);
        return res.status(200).json({
            success: true,
            data: petHistory
        });
    } catch (err) {
        console.error('Error in getCustomerPetHistory controller:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const getCustomerPackages = async (req, res) => {
    try {
        const maTK = req.user.maTK;
        if (!maTK) {
            return res.status(400).json({ message: 'MaTKKH is required' });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const packages = await getCustomerPackagesByID(maTK, page, limit);
        return res.status(200).json({
            success: true,
            data: packages
        });
    } catch (err) {
        console.error('Error in getCustomerPackages controller:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const addAppointmentController = async (req, res) => {
    try {
        const maTK = req.user.maTK;
        if (!maTK) {
            return res.status(400).json({ message: 'MaTKKH is required' });
        }
        const appointmentData = req.body;

        const result = await addAppointment(maTK, appointmentData);
        return res.status(200).json({
            success: true,
            data: result
        });
    } catch (err) {
        console.error('Error in addAppointmentController:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const addAppointmentServiceController = async (req, res) => {
    try {
        const maTK = req.user.maTK;
        if (!maTK) {
            return res.status(400).json({ message: 'MaTKKH is required' });
        }
        const serviceData = req.body;

        await addAppointmentService(serviceData);
        return res.status(200).json({
            success: true,
            message: 'Service added to appointment successfully'
        });
    } catch (err) {
        console.error('Error in addAppointmentServiceController:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }  
};

export const getProductsController = async (req, res) => {
    try {
        const keyword = req.query.keyword || null;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const products = await getProducts(keyword, page, limit);
        return res.status(200).json({
            success: true,
            data: products
        });
    } catch (err) {
        console.error('Error in getProductsController:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const addOrderController = async (req, res) => {
    try {
        const maTK = req.user.maTK;
        if (!maTK) {
            return res.status(400).json({ message: 'MaTKKH is required' });
        }
        const orderData = req.body;

        const result = await addOrder(maTK, orderData);
        return res.status(200).json({
            success: true,
            data: result
        });
    } catch (err) {
        console.error('Error in addOrderController:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const addOrderDetailController = async (req, res) => {
    try {
        const { maSDDV } = req.params;
        if (!maSDDV) {
            return res.status(400).json({ message: 'MaSDDV is required' });
        }
        const orderDetailData = req.body;

        await addOrderDetail(maSDDV, orderDetailData);
        return res.status(200).json({
            success: true,
            message: 'Order detail added successfully'
        });
    } catch (err) {
        console.error('Error in addOrderDetailController:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};