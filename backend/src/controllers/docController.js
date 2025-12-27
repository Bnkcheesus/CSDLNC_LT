import {
    getDocServiceHistory,
    getDocAppointmentHistory,
    getDocExaminationInfo,
    updateDocExaminationInfo,
    getToaThuoc,
    addThuoc,
    deleteThuoc,
    updateToaThuoc,
    getDocVaccinationInfo,
    getToaTiem,
    addVaccine,
    deleteVaccine,
    updateToaTiem,
    getPetInfo,
    updatePetHealth,
    getPetHistory,
    getPetPackages,
    getMedicineByKeyword,
    getVaccineByKeyword
} from '../models/DocModel.js';

export const getDocServiceHistoryController = async (req, res) => {
    try {
        const maTK = req.user.maTK;
        if (!maTK) {
            return res.status(400).json({ message: 'MaTKNV is required' });
        }

        const { type, page = 1, limit = 10 } = req.query;

        if (type === "app") {
            const result = await getDocAppointmentHistory(maTK, parseInt(page), parseInt(limit));
            return res.status(200).json({
                success: true,
                data: result
            });
        }

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

export const addThuocController = async (req, res) => {
    try {
        const { maSDDV } = req.params;
        const thuocData = req.body;
        if (!maSDDV) {
            return res.status(400).json({ message: 'MaSDDV is required' });
        }
        if (thuocData.length === 0) {
            return res.status(400).json({ message: 'Toa thuoc data is required' });
        }
        const result = await addThuoc(maSDDV, thuocData);
        return res.status(200).json({
            success: true,
            message: result
        });
    } catch (err) {
        console.error('Error in addThuoc controller:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const deleteThuocController = async (req, res) => {
    try {
        const { maSDDV, maThuoc } = req.params;
        if (!maSDDV || !maThuoc) {
            return res.status(400).json({ message: 'MaSDDV and MaThuoc are required' });
        }
        const result = await deleteThuoc(maSDDV, maThuoc);
        return res.status(200).json({
            success: true,
            message: result
        });
    } catch (err) {
        console.error('Error in deleteThuoc controller:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateToaThuocController = async (req, res) => {
    try {
        const { maSDDV, maThuoc } = req.params;
        const thuocData = req.body;
        if (!maSDDV || !maThuoc) {
            return res.status(400).json({ message: 'MaSDDV and MaThuoc are required' });
        }
        if (!thuocData || Object.keys(thuocData).length === 0) {
            return res.status(400).json({ message: 'Thuoc data is required' });
        }
        const result = await updateToaThuoc(maSDDV, maThuoc, thuocData);
        return res.status(200).json({
            success: true,
            message: result
        });
    } catch (err) {
        console.error('Error in updateToaThuoc controller:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const getDocVaccinationInfoController = async (req, res) => {
    try {
        const { maSDDV } = req.params;
        if (!maSDDV) {
            return res.status(400).json({ message: 'MaSDDV is required' });
        }
        const serviceInfo = await getDocVaccinationInfo(maSDDV);
        if (!serviceInfo) {
            return res.status(404).json({ message: 'Service info not found' });
        }
        return res.status(200).json({
            success: true,
            data: serviceInfo
        });
    } catch (err) {
        console.error('Error in getDocVaccinationInfo controller:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const getToaTiemController = async (req, res) => {
    try {
        const { maSDDV } = req.params;
        if (!maSDDV) {
            return res.status(400).json({ message: 'MaSDDV is required' });
        }
        const toaTiem = await getToaTiem(maSDDV);
        return res.status(200).json({
            success: true,
            data: toaTiem
        });
    } catch (err) {
        console.error('Error in getToaTiem controller:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const addVaccineController = async (req, res) => {
    try {
        const { maSDDV } = req.params;
        const tiemData = req.body;
        if (!maSDDV) {
            return res.status(400).json({ message: 'MaSDDV is required' });
        }
        if (tiemData.length === 0) {
            return res.status(400).json({ message: 'Toa tiem data is required' });
        }
        const result = await addVaccine(maSDDV, tiemData);
        return res.status(200).json({
            success: true,
            message: result
        });
    } catch (err) {
        console.error('Error in updateToaTiem controller:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const deleteVaccineController = async (req, res) => {
    try {
        const { maSDDV, maVaccine } = req.params;
        if (!maSDDV || !maVaccine) {
            return res.status(400).json({ message: 'MaSDDV and MaVaccine are required' });
        }
        const result = await deleteVaccine(maSDDV, maVaccine);
        return res.status(200).json({
            success: true,
            message: result
        });
    } catch (err) {
        console.error('Error in deleteVaccine controller:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateToaTiemController = async (req, res) => {
    try {
        const { maSDDV, maVaccine } = req.params;
        const tiemData = req.body;
        if (!maSDDV || !maVaccine) {
            return res.status(400).json({ message: 'MaSDDV and MaVaccine are required' });
        }
        if (!tiemData || Object.keys(tiemData).length === 0) {
            return res.status(400).json({ message: 'Vaccine data is required' });
        }
        const result = await updateToaTiem(maSDDV, maVaccine, tiemData);
        return res.status(200).json({
            success: true,
            message: result
        });
    } catch (err) {
        console.error('Error in updateToaTiem controller:', err);
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

export const updatePetHealthController = async (req, res) => {
    try {
        const { maTC } = req.params;
        const { TinhTrangSucKhoe } = req.body;
        if (!maTC) {
            return res.status(400).json({ message: 'MaTC is required' });
        }
        const result = await updatePetHealth(maTC, TinhTrangSucKhoe);
        return res.status(200).json({
            success: true,
            message: result
        });
    } catch (err) {
        console.error('Error in updatePetHealth controller:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const getPetHistoryController = async (req, res) => {
    try {
        const { maTC } = req.params;
        if (!maTC) {
            return res.status(400).json({ message: 'MaTC is required' });
        }
        const type = req.query.type || 'all';
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const history = await getPetHistory(maTC, type, page, limit);
        return res.status(200).json({
            success: true,
            data: history
        });
    } catch (err) {
        console.error('Error in getPetHistory controller:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const getPetPackagesController = async (req, res) => {
    try {
        const { maTC } = req.params;
        if (!maTC) {
            return res.status(400).json({ message: 'MaTC is required' });
        }
        const packages = await getPetPackages(maTC);
        return res.status(200).json({
            success: true,
            data: packages
        });
    } catch (err) {
        console.error('Error in getPetPackages controller:', err);
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

export const getVaccineByKeywordController = async (req, res) => {
    try {
        const { search } = req.query;
        
        const vaccines = await getVaccineByKeyword(search || '');
        return res.status(200).json({
            success: true,
            data: vaccines
        });
    } catch (err) {
        console.error('Error in getVaccineByKeyword controller:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};