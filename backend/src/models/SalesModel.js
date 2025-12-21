import { getPool } from "../config/db.js";

export const getInvoicesByKeyword = async (maCN, keyword) => {
    try {
        const pool = await getPool();
        const query = `
            SELECT
                HD.MaHD,
                HD.NgayLap,
                HD.MaTKKH,
                KH.HoTen AS TenKH
            FROM HOADON HD
            JOIN KHACHHANG KH ON HD.MaTKKH = KH.MaTKKH
            WHERE HD.MaCN = @maCN AND
            (MaHD LIKE '%' + @keyword + '%' OR KH.HoTen LIKE '%' + @keyword + '%')
            ORDER BY HD.NgayLap DESC;
        `;
        const result = await pool.request()
            .input('maCN', maCN)
            .input('keyword', keyword)
            .query(query);
        return result.recordset;
    } catch (err) {
        console.error('Error in getInvoicesByKeyword:', err);
        throw err;
    }
};

export const addSDDVMuaHang = async (sddvData) => {
    try {
        const pool = await getPool();
        const query = `
            EXEC sp_ThemSDDVMoi @maHD, 'MH', NULL, @MaNV, @newMaSDDV OUTPUT;
        `;
        const result = await pool.request()
            .input('maHD', sddvData.MaHD)
            .input('MaNV', sddvData.MaNVBH)
            .output('newMaSDDV')
            .query(query);
        return {
            MaSDDV: result.output.newMaSDDV
        } 
    } catch (err) {
        console.error('Error in addSDDVMuaHang:', err);
        throw err;
    }
};

export const addProduct = async (productData) => {
    try {
        const pool = await getPool();
        const query = `
            EXEC sp_ThemChiTietMuaHang @MaSDDV, @MaSP, @SoLuong;
        `;
        await pool.request()
            .input('MaSDDV', productData.MaSDDV)
            .input('MaSP', productData.MaSP)
            .input('SoLuong', productData.SoLuong)
            .query(query);
        return { message: 'Product added successfully' };
    } catch (err) {
        console.error('Error in addProduct:', err);
        throw err;
    }
};

export const getProductsByKeyword = async (keyword) => {
    try {
        const pool = await getPool();
        const query = `
            SELECT
                MaSP,
                TenSP
            FROM SANPHAM
            WHERE (LoaiSP = N'Thuốc' OR LoaiSP = N'Bán lẻ') AND
            (TenSP LIKE '%' + @keyword + '%' OR MaSP LIKE '%' + @keyword + '%');
        `;
        const result = await pool.request()
            .input('keyword', keyword)
            .query(query);
        return result.recordset;
    } catch (err) {
        console.error('Error in getProductsByKeyword:', err);
        throw err;
    }
};