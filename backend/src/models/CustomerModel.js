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

export const getCustomerServiceHistoryByID = async (maTKKH, type, page, limit) => {
    try {
        const pool = await getPool();
        const offset = (page - 1) * limit;

        let typeFilter = '';
        if (type != 'all') {
            typeFilter = 'AND SDV.LoaiDV = @type';
        }
        const query = `
            SELECT 
                SDV.MaSDDV, 
                SDV.LoaiDV,
                HD.NgayLap AS NgaySuDung,
                CN.TenCN,
                TC.TenTC
            FROM SUDUNGDICHVU SDV
            JOIN HOADON HD ON SDV.MaHD = HD.MaHD
            JOIN CHINHANH CN ON HD.MaCN = CN.MaCN
            LEFT JOIN KHAMBENH KB ON KB.MaSDDV = SDV.MaSDDV
            LEFT JOIN TIEMPHONG TP ON TP.MaSDDV = SDV.MaSDDV
            LEFT JOIN THUCUNG TC ON TC.MaTC = COALESCE(KB.MaTC, TP.MaTC)
            WHERE HD.MaTKKH = @maTK
            ${typeFilter}
            ORDER BY HD.NgayLap DESC
            OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY;

            SELECT COUNT(*) AS Total
            FROM SUDUNGDICHVU SDV
            JOIN HOADON HD ON SDV.MaHD = HD.MaHD
            WHERE HD.MaTKKH = @maTK
            ${type !== "all" ? "AND SDV.LoaiDV = @type" : ""}
        `;

        const result = await pool.request()
            .input('maTK', maTKKH)
            .input('type', type)
            .input('offset', offset)
            .input('limit', limit)
            .query(query);

        const history = result.recordsets[0];
        const total = result.recordsets[1][0].Total;

        return {
            rows: history,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page
        };
    } catch (err) {
        console.error('Error getting customer service history by ID:', err);
        throw err;
    }
};

export const getCustomerServiceHistoryDetailByID = async (maSDDV) => {
    try {
        const pool = await getPool();
        const query = `
            SELECT 
                SDV.MaSDDV,
                SDV.LoaiDV,
                SDV.TongTienDV,
                HD.NgayLap,
                CN.TenCN,
                NV.TenNV AS NhanVien,
                TC.TenTC,
                KB.TrieuChung,
                KB.CHuanDoan,
                KB.NgayTaiKham
            FROM SUDUNGDICHVU SDV
            JOIN HOADON HD ON SDV.MaHD = HD.MaHD
            JOIN CHINHANH CN ON HD.MaCN = CN.MaCN
            LEFT JOIN NHANVIEN NV ON NV.MaTKNV = HD.MaTKNV
            LEFT JOIN KHAMBENH KB ON KB.MaSDDV = SDV.MaSDDV
            LEFT JOIN TIEMPHONG TP ON TP.MaSDDV = SDV.MaSDDV
            LEFT JOIN THUCUNG TC ON TC.MaTC = COALESCE(KB.MaTC, TP.MaTC)
            WHERE SDV.MaSDDV = @maSDDV
        `;

        const result = await pool.request()
            .input('maSDDV', maSDDV)
            .query(query);

        return result.recordset[0] || null;
    } catch (err) {
        console.error('Error getting customer service history detail by ID:', err);
        throw err;
    }
};