import { getPool } from '../config/db.js';

export const findAccountByID = async (maTK) => {
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('maTK', maTK)
            .query('SELECT MaTK, PassWord, LoaiTK FROM TAIKHOAN WHERE MaTK = @maTK');
        return result.recordset[0];
    } catch (err) {
        console.error('Error finding account by ID:', err);
        throw err;
    }
};

export const getUserNameByID = async (maTK) => {
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('maTK', maTK)
            .query(`
                SELECT HoTen FROM KHACHHANG WHERE MaTKKH = @maTK
                UNION
                SELECT HoTen FROM NHANVIEN WHERE MaTKNV = @maTK
            `);
        return result.recordset[0]?.HoTen || null;
    } catch (err) {
        console.error('Error getting user name by ID:', err);
        throw err;
    }
};

export const findStaffByID = async (maTK) => {
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('maTK', maTK)
            .query('SELECT MaTKNV, ChucVu FROM NHANVIEN WHERE MaTKNV = @maTK');
        return result.recordset[0];
    } catch (err) {
        console.error('Error finding staff by ID:', err);
        throw err;
    }
};

export const findCustomerByID = async (maTK) => {
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('maTK', maTK)
            .query('SELECT MaTKKH FROM KHACHHANG WHERE MaTKKH = @maTK');
        return result.recordset[0];
    } catch (err) {
        console.error('Error finding customer by ID:', err);
        throw err;
    }
};

export const getBranches = async () => {
    try {
        const pool = await getPool();
        const result = await pool.request()
            .query('SELECT * FROM CHINHANH');
        return result.recordset;
    } catch (err) {
        console.error('Error getting branches:', err);
        throw err;
    }
};

export const getDoctorsByBranch = async (maCN) => {
    try {
        const pool = await getPool();
        const query = `
            EXEC sp_TraCuuDanhSachBacSiTheoChiNhanh @maCN;
        `;
        const result = await pool.request()
            .input('maCN', maCN)
            .query(query);
        return result.recordset || [];
    } catch (err) {
        console.error('Error getting doctors by branch:', err);
        throw err;
    }
};

export const getPetsByCustomer = async (maTKKH) => {
    try {
        const pool = await getPool();
        const query = `
            EXEC sp_TraCuuDanhSachThuCungKH @maTKKH;
        `;
        const result = await pool.request()
            .input('maTKKH', maTKKH)
            .query(query);
        return result.recordset || [];
    } catch (err) {
        console.error('Error getting pets by customer:', err);
        throw err;
    }
};

export const getPackages = async () => {
    try {
        const pool = await getPool();
        const result = await pool.request()
            .query('SELECT * FROM GOITIEM');
        return result.recordset;
    } catch (err) {
        console.error('Error getting packages:', err);
        throw err;
    }
};