import { getPool } from "../config/db.js";

export const getCustomerNameByID = async (maTKKH) => {
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('maTKKH', maTKKH)
            .query('SELECT HoTen FROM KHACHHANG WHERE MaTKKH = @maTKKH');
        return result.recordset[0]?.HoTen || null;
    } catch (err) {
        console.error('Error getting customer name by ID:', err);
        throw err;
    }
};

export const getCustomerDetailsByID = async (maTKKH) => {
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('maTKKH', maTKKH)
            .query('SELECT * FROM KHACHHANG WHERE MaTKKH = @maTKKH');
        return result.recordset[0] || null;
    } catch (err) {
        console.error('Error getting customer details by ID:', err);
        throw err;
    }
};

export const updateCustomerDetailsByID = async (maTKKH, details) => {
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('maTKKH', maTKKH)
            .input('HoTen', details.name)
            .input('SDT', details.phone)
            .input('Email', details.email)
            .input('CCCD', details.cccd)
            .input('GioiTinh', details.gender)
            .input('NgaySinh', details.dob)
            .query(`
                UPDATE KHACHHANG
                SET HoTen = @HoTen,
                    SDT = @SDT,
                    Email = @Email,
                    CCCD = @CCCD,
                    GioiTinh = @GioiTinh,
                    NgaySinh = @NgaySinh
                WHERE MaTKKH = @maTKKH
            `);
        return result.rowsAffected[0] > 0;
    } catch (err) {
        console.error('Error updating customer details by ID:', err);
        throw err;
    }
};