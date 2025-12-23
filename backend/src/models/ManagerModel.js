import { getPool } from '../config/db.js';

export const getRevenue = async (year) => {
    try {
        const pool = await getPool();
        const query = `
            EXEC sp_Tinh_Doanh_Thu_CT_theo_nam @year;
        `;
        const result = await pool.request()
            .input('year', year)
            .query(query);
        return result.recordset[0];
    } catch (err) {
        console.error('Error in getRevenue:', err);
        throw err;
    }
};

export const getMonthlyRevenue = async (year) => {
    try {
        const pool = await getPool();
        const query = `
            EXEC sp_Tinh_Doanh_Thu_CT_theo_tung_thang_trong_nam @year;
        `;
        const result = await pool.request()
            .input('year', year)
            .query(query);
        return result.recordset;
    } catch (err) {
        console.error('Error in getMonthlyRevenue:', err);
        throw err;
    }
};

export const getYears = async () => {
    try {
        const pool = await getPool();
        const query = `
            SELECT DISTINCT YEAR(NgayLap) AS Year
            FROM HOADON
            ORDER BY Year DESC;
        `;
        const result = await pool.request().query(query);
        return result.recordset.map(row => row.Year);
    } catch (err) {
        console.error('Error in getYears:', err);
        throw err;
    }
};