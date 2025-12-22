import { getPool } from "../config/db.js";

export const getStaffProfile = async (maTKNV) => {
    try {
        const pool = await getPool();
        const query = `
            EXEC sp_TraCuuThongTinNhanVien @maTKNV;
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

export const updateStaffProfile = async (maTKNV, profileData) => {
    try {
        const pool = await getPool();
        const query = `
            UPDATE NHANVIEN
            SET
                HoTen = @HoTen,
                GioiTinh = @GioiTinh,
                NgaySinh = @NgaySinh
            WHERE MaTKNV = @maTKNV;
        `;
        const result = await pool.request()
            .input('maTKNV', maTKNV)
            .input('HoTen', profileData.name)
            .input('GioiTinh', profileData.gender)
            .input('NgaySinh', profileData.dob)
            .query(query);
        return result.rowsAffected[0] > 0;
    } catch (err) {
        console.error('Error updating staff profile:', err);
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

export const addServiceInvoice = async (maTKKH, maTKNV, maCN) => {
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('maTKKH', maTKKH)
            .input('maTKNV', maTKNV)
            .input('maCN', maCN)
            .output('newMaHD')
            .query('EXEC sp_ThemHoaDonMoi @maTKNV, @maTKKH, @maCN, @newMaHD OUTPUT');
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
                    HD.MaHD, HD.NgayLap,
                    KH.MaTKKH, KH.HoTen AS TenKH,
                    CN.MaCN, CN.TenCN
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
            .query('EXEC sp_ThemSDDVMoi @maHD, @loaiDV, @maTC, @maBS');
        return result.rowsAffected[0] > 0;
    } catch (err) {
        console.error('Error adding SDDV:', err);
        throw err;
    }
};

export const getServiceInvoiceInfo = async (maHD) => {
    try {
        const pool = await getPool();
        const query = `
            EXEC sp_TraCuuThongTinHoaDon @maHD;
        `;
            
        const result = await pool.request()
            .input('maHD', maHD)
            .query(query);
        return result.recordset[0] || null;
    } catch (err) {
        console.error('Error getting service invoice info:', err);
        throw err;
    }
};

export const updateServiceInvoiceInfo = async (maHD, KhuyenMai, HinhThucThanhToan) => {
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('maHD', maHD)
            .input('KhuyenMai', KhuyenMai)
            .input('HinhThucThanhToan', HinhThucThanhToan)
            .query(`EXEC sp_CapNhatThongTinHoaDon @maHD, @KhuyenMai, @HinhThucThanhToan;`);
        return result.rowsAffected[0] > 0;
    } catch (err) {
        console.error('Error updating service invoice info:', err);
        throw err;
    }
};

export const getServiceInvoiceDetail = async (maHD) => {
    try {
        const pool = await getPool();
        const query = `
            EXEC sp_TraCuuDichVuHoaDon @maHD;
        `;
        const result = await pool.request()
            .input('maHD', maHD)
            .query(query);
        return result.recordset || [];
    } catch (err) {
        console.error('Error getting service invoice detail:', err);
        throw err;
    }
};

export const getExaminationDetail = async (maSDDV) => {
    try {
        const pool = await getPool();
        const query = `
            EXEC sp_TraCuuToaThuoc @maSDDV;
        `;
        const result = await pool.request()
            .input('maSDDV', maSDDV)
            .query(query);
        return result.recordset || [];
    } catch (err) {
        console.error('Error getting examination detail:', err);
        throw err;
    }
};

export const getVaccinationDetail = async (maSDDV) => {
    try {
        const pool = await getPool();
        const query = `
            EXEC sp_TraCuuToaTiem @maSDDV;
        `;
        const result = await pool.request()
            .input('maSDDV', maSDDV)
            .query(query);
        return result.recordset || [];
    } catch (err) {
        console.error('Error getting vaccination detail:', err);
        throw err;
    }
};

export const getPurchaseDetail = async (maSDDV) => {
    try {
        const pool = await getPool();
        const query = `
            EXEC sp_TraCuuChiTietMuaHang @maSDDV;
        `;
        const result = await pool.request()
            .input('maSDDV', maSDDV)
            .query(query);
        return result.recordset || [];
    } catch (err) {
        console.error('Error getting purchase detail:', err);
        throw err;
    }
};