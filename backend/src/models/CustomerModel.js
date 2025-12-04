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