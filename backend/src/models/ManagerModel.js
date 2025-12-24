import e from 'express';
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

export const getStaffRecordOfBranch = async (type, page, limit, order, maCN) => {
    try {
        const pool = await getPool();
        const offset = (page - 1) * limit;
        let typeFilter = '';
        if (type != 'all') {
            typeFilter = 'AND NV.ChucVu = @type';
        }
        const query = `
            WITH NV_CN AS (
                SELECT DISTINCT NV.MaTKNV, NV.HoTen, NV.ChucVu
                FROM NHANVIEN NV
                JOIN LICHSULAMVIEC L ON NV.MaTKNV = L.MaTKNV
                WHERE L.MaCN = @maCN 
                AND NV.ChucVu <> 'QLCN'
                AND (L.NgayKetThuc IS NULL OR L.NgayKetThuc > GETDATE())
                ${typeFilter}
            ),
            NV_NGHIEPVU AS (
                -- Khám bệnh
                SELECT KB.MaBS AS MaTKNV, KB.MaSDDV FROM KHAMBENH KB
                UNION ALL
                -- Tiêm phòng
                SELECT TP.MaBS, TP.MaSDDV FROM TIEMPHONG TP
                UNION ALL
                -- Mua hàng
                SELECT MH.MaNVBH, MH.MaSDDV FROM MUAHANG MH
                UNION ALL
                -- Hoá đơn
                SELECT HD.MaTKNV, HD.MaHD FROM HOADON HD
                WHERE HD.MaCN = @maCN
            )
            
            SELECT
                    NV.MaTKNV,
                    NV.HoTen,
                    NV.ChucVu,
                    COUNT(DISTINCT NVNV.MaSDDV) AS SoLuotXuLyNghiepVu,
                    ROUND(AVG(CAST(DG.Diem AS FLOAT)), 2) AS DiemDanhGiaTB
            INTO #DATA
            FROM NV_CN NV
            LEFT JOIN NV_NGHIEPVU NVNV ON NV.MaTKNV = NVNV.MaTKNV
            LEFT JOIN DANHGIA DG ON NVNV.MaSDDV = DG.MaSDDV
            GROUP BY NV.MaTKNV, NV.HoTen, NV.ChucVu;

            SELECT *
            FROM #DATA
            ORDER BY
                CASE WHEN @order = 'asc'  THEN DiemDanhGiaTB END ASC,
                CASE WHEN @order = 'desc' THEN DiemDanhGiaTB END DESC,
                SoLuotXuLyNghiepVu DESC
            OFFSET @offset ROWS
            FETCH NEXT @limit ROWS ONLY;

            SELECT COUNT(*) AS TotalRows
            FROM #DATA;
        `;
        const result = await pool.request()
            .input('type', type)
            .input('offset', offset)
            .input('limit', limit)
            .input('order', order)
            .input('maCN', maCN)
            .query(query);
            return {
            rows: result.recordsets[0],
            total: result.recordsets[1][0].TotalRows,
            totalPages: Math.ceil(result.recordsets[1][0].TotalRows / limit),
            currentPage: page
        };
    } catch (err) {
        console.error('Error in getStaffRecordOfBranch:', err);
        throw err;
    }
};