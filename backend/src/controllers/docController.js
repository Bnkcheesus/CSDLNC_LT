import {
    getDocServiceHistory,
    getDocExaminationInfo,
    updateDocExaminationInfo,
    getToaThuoc,
    updateToaThuoc,
    getPetInfo,
    getMedicineByKeyword
} from '../models/DocModel.js';

export const getDocServiceHistoryController = async (req, res) => {
    try {
        const maTK = req.user.maTK;
        if (!maTK) {
            return res.status(400).json({ message: 'MaTKNV is required' });
        }

        const { type, page = 1, limit = 10 } = req.query;

        const history = await getDocServiceHistory(maTK, type, parseInt(page), parseInt(limit));
        return res.status(200).json({
            success: true,
            data: history
        });
    } catch (err) {
        console.error('Error in getDocServiceHistory controller:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const getDocExaminationInfoController = async (req, res) => {
    try {
        const { maSDDV } = req.params;
        if (!maSDDV) {
            return res.status(400).json({ message: 'MaSDDV is required' });
        }
        const serviceInfo = await getDocExaminationInfo(maSDDV);
        if (!serviceInfo) {
            return res.status(404).json({ message: 'Service info not found' });
        }
        return res.status(200).json({
            success: true,
            data: serviceInfo
        });
    } catch (err) {
        console.error('Error in getDocServiceInfo controller:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateDocExaminationInfoController = async (req, res) => {
    try {
        const { maSDDV } = req.params;
        const examinationData = req.body;
        if (!maSDDV) {
            return res.status(400).json({ message: 'MaSDDV is required' });
        }
        if (!examinationData || Object.keys(examinationData).length === 0) {
            return res.status(400).json({ message: 'Examination data is required' });
        }
        const result = await updateDocExaminationInfo(maSDDV, examinationData);
        return res.status(200).json({
            success: true,
            data: result
        });
    } catch (err) {
        console.error('Error in updateDocExaminationInfo controller:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const getToaThuocController = async (req, res) => {
    try {
        const { maSDDV } = req.params;
        if (!maSDDV) {
            return res.status(400).json({ message: 'MaSDDV is required' });
        }
        const toaThuoc = await getToaThuoc(maSDDV);
        return res.status(200).json({
            success: true,
            data: toaThuoc
        });
    } catch (err) {
        console.error('Error in getToaThuoc controller:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateToaThuocController = async (req, res) => {
    try {
        const { maSDDV } = req.params;
        const thuocData = req.body;
        if (!maSDDV) {
            return res.status(400).json({ message: 'MaSDDV is required' });
        }
        if (thuocData.length === 0) {
            return res.status(400).json({ message: 'Toa thuoc data is required' });
        }
        const result = await updateToaThuoc(maSDDV, thuocData);
        return res.status(200).json({
            success: true,
            message: result
        });
    } catch (err) {
        console.error('Error in updateToaThuoc controller:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const getPetInfoController = async (req, res) => {
    try {
        const { maTC } = req.params;
        if (!maTC) {
            return res.status(400).json({ message: 'MaTC is required' });
        }
        const petInfo = await getPetInfo(maTC);
        if (!petInfo) {
            return res.status(404).json({ message: 'Pet info not found' });
        }
        return res.status(200).json({
            success: true,
            data: petInfo
        });
    } catch (err) {
        console.error('Error in getPetInfo controller:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const getMedicineByKeywordController = async (req, res) => {
    try {
        const { search } = req.query;
        
        const medicines = await getMedicineByKeyword(search || '');
        return res.status(200).json({
            success: true,
            data: medicines
        });
    } catch (err) {
        console.error('Error in getMedicineByKeyword controller:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};