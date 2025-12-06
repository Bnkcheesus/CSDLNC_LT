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

export const getUserRoleByID = async (maTK) => {
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('maTK', maTK)
            .query('SELECT LoaiTK FROM TAIKHOAN WHERE MaTK = @maTK');
        return result.recordset[0]?.LoaiTK || null;
    } catch (err) {
        console.error('Error getting user role by ID:', err);
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