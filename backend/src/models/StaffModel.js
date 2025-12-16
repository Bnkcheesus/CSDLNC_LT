import { getPool } from "../config/db.js";

export const getStaffProfile = async (maTKNV) => {
    try {
        const pool = await getPool();
        const query = `
            SELECT TOP 1 NV.MaTKNV, NV.HoTen, NV.GioiTinh, NV.NgaySinh, NV.ChucVu, CN.MaCN, CN.TenCN
            FROM NHANVIEN NV
            JOIN LICHSULAMVIEC L ON NV.MaTKNV = L.MaTKNV
            JOIN CHINHANH CN ON CN.MaCN = L.MaCN
            WHERE NV.MaTKNV = @maTKNV
            ORDER BY L.NgayBatDau DESC
        `;
        const result = await pool.request()
            .input('maTKNV', maTKNV)
            .query(query);
        return result.recordset[0] || null;
    } catch (err) {
        console.error('Error getting staff profile:', err);
        throw err;
    }
};

export const getDoctorsByBranch = async (maCN) => {
    try {
        const pool = await getPool();
        const query = `
            SELECT NV.MaTKNV, NV.HoTen
            FROM NHANVIEN NV
            JOIN LICHSULAMVIEC L ON NV.MaTKNV = L.MaTKNV
            WHERE L.MaCN = @maCN AND NV.ChucVu = 'BSTY'
            AND L.NgayBatDau = (
                SELECT MAX(NgayBatDau)
                FROM LICHSULAMVIEC
                WHERE MaTKNV = NV.MaTKNV
            )
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

export const getCustomersByKeyword = async (keyword) => {
    try {
        const pool = await getPool();
        const query = `
            SELECT MaTKKH, HoTen
            FROM KHACHHANG
            WHERE HoTen LIKE '%' + @keyword + '%' OR MaTKKH LIKE '%' + @keyword + '%'
        `;
        const result = await pool.request()
            .input('keyword', keyword || '')
            .query(query);
        return result.recordset || [];
    } catch (err) {
        console.error('Error getting customers by keyword:', err);
        throw err;
    }
};

export const getPetsByCustomer = async (maTKKH) => {
    try {
        const pool = await getPool();
        const query = `
            SELECT MaTC, TenTC, Loai
            FROM THUCUNG
            WHERE MaTKKH = @maTKKH
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

export const addServiceInvoice = async (maTKKH, maTKNV, maCN) => {
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('maTKKH', maTKKH)
            .input('maTKNV', maTKNV)
            .input('maCN', maCN)
            .output('newMaHD')
            .query('EXEC sp_ThemHoaDon @maTKNV, @maTKKH, @maCN, @newMaHD OUTPUT');
        return {
            MaHD: result.output.newMaHD
        }
    } catch (err) {
        console.error('Error adding service invoice:', err);
        throw err;
    }
};

export const getServiceInvoiceHistory = async (maTKNV, page, limit) => {
    try {
        const pool = await getPool();
        const offset = (page - 1) * limit;
        const result = await pool.request()
            .input('maTKNV', maTKNV)
            .input('limit', limit)
            .input('offset', offset)
            .query(`
                SELECT
                    HD.MaHD,
                    HD.NgayLap,
                    HD.MaTKKH,
                    KH.HoTen AS TenKH,
                    CN.TenCN
                FROM HOADON HD
                JOIN KHACHHANG KH ON HD.MaTKKH = KH.MaTKKH
                JOIN CHINHANH CN ON HD.MaCN = CN.MaCN
                WHERE HD.MaTKNV = @maTKNV
                ORDER BY HD.NgayLap DESC
                OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY;

                SELECT COUNT(*) AS TotalCount
                FROM HOADON
                WHERE MaTKNV = @maTKNV;
            `);

        const invoices = result.recordsets[0];
        const totalCount = result.recordsets[1][0].TotalCount;
        const totalPages = Math.ceil(totalCount / limit);
        return {
            rows: invoices,
            total: totalCount,
            totalPages: totalPages,
            currentPage: page
        };
    } catch (err) {
        console.error('Error getting service invoice history:', err);
        throw err;
    }
};


export const addSDDV = async (maHD, loaiDV, maBS, maTC) => {
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('maHD', maHD)
            .input('loaiDV', loaiDV)
            .input('maBS', maBS)
            .input('maTC', maTC)
            .query('EXEC sp_ThemSDDV @maHD, @loaiDV, @maTC, @maBS');
        return result.rowsAffected[0] > 0;
    } catch (err) {
        console.error('Error adding SDDV:', err);
        throw err;
    }
};