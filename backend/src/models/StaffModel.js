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

export const getServiceInvoiceHistory = async (maTKNV, keyword, branch, type, page, limit) => {
    try {
        const pool = await getPool();
        const offset = (page - 1) * limit;
        let typeFilter = '';
        if (type === 'all') {
            typeFilter = 'WHERE HD.MaCN = @branch AND HD.MaTKNV IS NOT NULL';
        }
        else if (type === 'only') {
            typeFilter = 'WHERE HD.MaTKNV = @maTKNV';
        }
        else if (type === 'appointments') {
            typeFilter = 'WHERE HD.MaTKNV IS NULL AND HD.MaCN = @branch';
        }
        let keywordFilter = '';
        if (keyword) {
            keywordFilter = ` AND (KH.MaTKKH LIKE '%' + @keyword + '%' OR KH.HoTen LIKE '%' + @keyword + '%')`;
            typeFilter += keywordFilter;
        }
        const result = await pool.request()
            .input('maTKNV', maTKNV)
            .input('limit', limit)
            .input('offset', offset)
            .input('branch', branch)
            .input('keyword', keyword)
            .query(`
                SELECT
                    HD.MaHD, HD.NgayLap,
                    KH.MaTKKH, KH.HoTen AS TenKH,
                    CN.MaCN, CN.TenCN,
                    HD.MaTKNV, NV.HoTen AS TenNV
                FROM HOADON HD
                JOIN KHACHHANG KH ON HD.MaTKKH = KH.MaTKKH
                JOIN CHINHANH CN ON HD.MaCN = CN.MaCN
                LEFT JOIN NHANVIEN NV ON HD.MaTKNV = NV.MaTKNV
                ${typeFilter}
                ORDER BY HD.NgayLap DESC
                OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY;

                SELECT COUNT(*) AS TotalCount
                FROM HOADON HD
                JOIN KHACHHANG KH ON HD.MaTKKH = KH.MaTKKH
                ${typeFilter};
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

export const updateServiceInvoiceInfo = async (maHD, MaTKNV, KhuyenMai, HinhThucThanhToan) => {
    try {
        const pool = await getPool();
        let query = '';
        if (!MaTKNV) {
            query = 'EXEC sp_CapNhatThongTinHoaDon @maHD, @KhuyenMai, @HinhThucThanhToan;';
        } else {
            query = 'EXEC sp_CapNhatNhanVienHoaDon @maHD, @MaTKNV;';
        }
        const result = await pool.request()
            .input('maHD', maHD)
            .input('MaTKNV', MaTKNV)
            .input('KhuyenMai', KhuyenMai)
            .input('HinhThucThanhToan', HinhThucThanhToan)
            .query(`${query}`);
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

export const addCustomerPet = async (petData) => {
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('maTKKH', petData.MaTKKH)
            .input('TenTC', petData.TenTC)
            .input('Loai', petData.Loai)
            .input('Giong', petData.Giong)
            .input('NgaySinh', petData.NgaySinh)
            .input('GioiTinh', petData.GioiTinh)
            .output('newMaTC')
            .query('EXEC sp_ThemThuCungKH @maTKKH, @TenTC, @Loai, @Giong, @NgaySinh, @GioiTinh, @newMaTC OUTPUT');
        return {
            MaTC: result.output.newMaTC
        };
    } catch (err) {
        console.error('Error adding customer pet:', err);
        throw err;
    }
};

export const addCustomer = async (customerData) => {
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('HoTen', customerData.HoTen)
            .input('SDT', customerData.SDT)
            .input('CCCD', customerData.CCCD)
            .output('newMaTKKH')
            .query('EXEC sp_ThemKhachHangMoi @HoTen, @SDT, @CCCD, @newMaTKKH OUTPUT');
        return {
            MaTKKH: result.output.newMaTKKH
        };
    } catch (err) {
        console.error('Error adding customer:', err);
        throw err;
    }
};