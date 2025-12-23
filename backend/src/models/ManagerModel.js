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

export const getRevenueByBranches = async (year) => {
    try {
        const pool = await getPool();
        const query = `
            EXEC sp_Tinh_Doanh_Thu_Tung_CN_theo_nam @year;
        `;
        const result = await pool.request()
            .input('year', year)
            .query(query);
        return result.recordset;
    } catch (err) {
        console.error('Error in getRevenueByBranches:', err);
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

export const getSystemProductsRecord = async (year) => {
    try {
        const pool = await getPool();
        const thuocResult = await pool.request()
            .input('year', year)
            .query('EXEC sp_ThongKeTop10Thuoc_theo_nam @year;');
        const vaccineResult = await pool.request()
            .input('year', year)
            .query('EXEC sp_ThongKeTop10Vaccine_theo_nam @year;');
        const banleResult = await pool.request()
            .input('year', year)
            .query('EXEC sp_ThongKeTop10SPBanLe_theo_nam @year;');
        const total = await pool.request()
            .input('year', year)
            .query('EXEC sp_ThongKeSoLuongTungLoaiSP_theo_nam @year;');
        return {
            thuocData: thuocResult.recordset,
            vaccineData: vaccineResult.recordset,
            banleData: banleResult.recordset,
            total: total.recordset
        };
    } catch (err) {
        console.error('Error in getSystemProductsRecord:', err);
        throw err;
    }
};

export const getProductsRecordOfBranch = async (year, maCN) => {
    try {
        const pool = await getPool();
        const thuocResult = await pool.request()
            .input('year', year)
            .input('maCN', maCN)
            .query('EXEC sp_ThongKeTop10Thuoc_theo_nam_va_maCN @year, @maCN;');
        const vaccineResult = await pool.request()
            .input('year', year)
            .input('maCN', maCN)
            .query('EXEC sp_ThongKeTop10Vaccine_theo_nam_va_maCN @year, @maCN;');
        const banleResult = await pool.request()
            .input('year', year)
            .input('maCN', maCN)
            .query('EXEC sp_ThongKeTop10SPBanLe_theo_nam_va_maCN @year, @maCN;');
        const total = await pool.request()
            .input('year', year)
            .input('maCN', maCN)
            .query('EXEC sp_ThongKeSoLuongTungLoaiSP_theo_nam_va_maCN @year, @maCN;');
        return {
            thuocData: thuocResult.recordset,
            vaccineData: vaccineResult.recordset,
            banleData: banleResult.recordset,
            total: total.recordset
        };
    } catch (err) {
        console.error('Error in getProductsRecordOfBranch:', err);
        throw err;
    }
};