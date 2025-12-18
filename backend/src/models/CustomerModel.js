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
            ${typeFilter}
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

export const getCustomerExaminationDetailByID = async (maSDDV) => {
    try {
        const pool = await getPool();
        const query = `
            SELECT 
                KB.MaSDDV,
                HD.MaHD,
                HD.NgayLap,
                CN.TenCN,
                TC.TenTC,
                NV.HoTen AS TenBS,
                KB.TrieuChung,
                KB.ChuanDoan,
                KB.NgayTaiKham,
                SDV.TongTienDV
            FROM KHAMBENH KB
            JOIN SUDUNGDICHVU SDV ON KB.MaSDDV = SDV.MaSDDV
            JOIN HOADON HD ON SDV.MaHD = HD.MaHD
            JOIN CHINHANH CN ON HD.MaCN = CN.MaCN
            JOIN THUCUNG TC ON KB.MaTC = TC.MaTC
            JOIN NHANVIEN NV ON KB.MaBS = NV.MaTKNV
            WHERE KB.MaSDDV = @maSDDV
        `;

        const toaThuocQuery = `
            SELECT 
                SP.MaSP,
                SP.TenSP,
                CT.SoLuong,
                CT.LieuLuong,
                CT.CachDung
            FROM CHITIETTOATHUOC CT
            JOIN SANPHAM SP ON CT.MaSP = SP.MaSP
            WHERE CT.MaSDDV = @maSDDV
        `;

        const result = await pool.request()
            .input('maSDDV', maSDDV)
            .query(query);

        const toaThuocResult = await pool.request()
            .input("maSDDV", maSDDV)
            .query(toaThuocQuery);

        if (result.recordset.length === 0) return null;

        const detail = result.recordset[0];

        return {
            general: {
                MaSDDV: detail.MaSDDV,
                MaHD: detail.MaHD,
                NgayLap: detail.NgayLap,
                TenCN: detail.TenCN,
                TenTC: detail.TenTC,
                TenBS: detail.TenBS,
                TrieuChung: detail.TrieuChung,
                ChuanDoan: detail.ChuanDoan,
                NgayTaiKham: detail.NgayTaiKham,
                TongTien: detail.TongTienDV
            },
            toaThuoc: toaThuocResult.recordset || [],
        };
    } catch (err) {
        console.error('Error getting customer examination detail by ID:', err);
        throw err;
    }
};

export const getCustomerVaccinationDetailByID = async (maSDDV) => {
    try {
        const pool = await getPool();
        const query = `
            SELECT 
                TP.MaSDDV,
                HD.MaHD,
                HD.NgayLap,
                CN.TenCN,
                TC.TenTC,
                NV.HoTen AS TenBS,
                SDV.TongTienDV
            FROM TIEMPHONG TP
            JOIN SUDUNGDICHVU SDV ON TP.MaSDDV = SDV.MaSDDV
            JOIN HOADON HD ON SDV.MaHD = HD.MaHD
            JOIN CHINHANH CN ON HD.MaCN = CN.MaCN
            JOIN THUCUNG TC ON TP.MaTC = TC.MaTC
            JOIN NHANVIEN NV ON TP.MaBS = NV.MaTKNV
            WHERE TP.MaSDDV = @maSDDV
        `;

        const toaTiemQuery = `
            SELECT 
                SP.MaSP,
                SP.TenSP,
                CT.LieuLuong,
                DG.MaGoi
            FROM CHITIETTIEMPHONG CT
            JOIN SANPHAM SP ON CT.MaSP = SP.MaSP
            LEFT JOIN DANGKYGOITIEM DG ON CT.MaDK = DG.MaDK
            WHERE CT.MaSDDV = @maSDDV
        `;

        const result = await pool.request()
            .input('maSDDV', maSDDV)
            .query(query);

        const toaTiemResult = await pool.request()
            .input("maSDDV", maSDDV)
            .query(toaTiemQuery);

        if (result.recordset.length === 0) return null;

        const detail = result.recordset[0];

        return {
            general: {
                MaSDDV: detail.MaSDDV,
                MaHD: detail.MaHD,
                NgayLap: detail.NgayLap,
                TenCN: detail.TenCN,
                TenTC: detail.TenTC,
                TenBS: detail.TenBS,
                TongTien: detail.TongTienDV
            },
            toaTiem: toaTiemResult.recordset || [],
        };
    } catch (err) {
        console.error('Error getting customer vaccination detail by ID:', err);
        throw err;
    }
};

export const getCustomerPurchaseDetailByID = async (maSDDV) => {
    try {
        const pool = await getPool();
        const query = `
            SELECT 
                MH.MaSDDV,
                HD.MaHD,
                HD.NgayLap,
                CN.TenCN,
                NV.HoTen AS TenNV,
                SDV.TongTienDV
            FROM MUAHANG MH
            JOIN SUDUNGDICHVU SDV ON MH.MaSDDV = SDV.MaSDDV
            JOIN HOADON HD ON SDV.MaHD = HD.MaHD
            JOIN CHINHANH CN ON HD.MaCN = CN.MaCN
            JOIN NHANVIEN NV ON MH.MaNVBH = NV.MaTKNV
            WHERE MH.MaSDDV = @maSDDV
        `;

        const hoaDonMuaQuery = `
            SELECT 
                SP.MaSP,
                SP.TenSP,
                CT.SoLuong
            FROM CHITIETMUAHANG CT
            JOIN SANPHAM SP ON CT.MaSP = SP.MaSP
            WHERE CT.MaSDDV = @maSDDV
        `;

        const result = await pool.request()
            .input('maSDDV', maSDDV)
            .query(query);
        
        const hoaDonMuaResult = await pool.request()
            .input("maSDDV", maSDDV)
            .query(hoaDonMuaQuery);

        if (result.recordset.length === 0) return null;

        const detail = result.recordset[0];

        return {
            general: {
                MaSDDV: detail.MaSDDV,
                MaHD: detail.MaHD,
                NgayLap: detail.NgayLap,
                TenCN: detail.TenCN,
                TenTC: detail.TenTC,
                TenNV: detail.TenNV,
                TongTien: detail.TongTienDV
            },
            hoaDonMua: hoaDonMuaResult.recordset || [],
        };
    } catch (err) {
        console.error('Error getting customer purchase detail by ID:', err);
        throw err;
    }
};

export const getServiceRatingByID = async (maSDDV) => {
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('maSDDV', maSDDV)
            .query('SELECT * FROM DANHGIA WHERE MaSDDV = @maSDDV');
        return result.recordset[0] || null;
    } catch (err) {
        console.error('Error getting service rating by ID:', err);
        throw err;
    }
};

export const saveServiceRatingByID = async (maSDDV, rating) => {
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('maSDDV', maSDDV)
            .query("SELECT MaSDDV FROM DANHGIA WHERE MaSDDV = @maSDDV");

        if (result.recordset.length > 0) {
            throw new Error("Rating already exists for this service.");
        }

        await pool.request()
            .input('maSDDV', maSDDV)
            .input('diem', rating.diem)
            .input('thaiDoNhanVien', rating.thaiDoNhanVien)
            .input('mucDoHaiLong', rating.mucDoHaiLong)
            .input('binhLuan', rating.binhLuan)
            .query(`
                INSERT INTO DANHGIA (MaSDDV, Diem, ThaiDoNhanVien, MucDoHaiLong, BinhLuan)
                VALUES (@maSDDV, @diem, @thaiDoNhanVien, @mucDoHaiLong, @binhLuan)
            `);
        return true;
    } catch (err) {
        console.error('Error saving service rating:', err);
        throw err;
    }
};

export const getCustomerPetsByID = async (maTKKH, page, limit) => {
    try {
        const pool = await getPool();
        const offset = (page - 1) * limit;

        const query = `
            SELECT 
                TC.MaTC,
                TC.TenTC,
                TC.Loai,
                TC.Giong
            FROM THUCUNG TC
            WHERE TC.MaTKKH = @maTKKH
            ORDER BY TC.MaTC
            OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY;

            SELECT COUNT(*) AS Total
            FROM THUCUNG TC
            WHERE TC.MaTKKH = @maTKKH;
        `;

        const result = await pool.request()
            .input('maTKKH', maTKKH)
            .input('offset', offset)
            .input('limit', limit)
            .query(query);
        
        const pets = result.recordsets[0];
        const total = result.recordsets[1][0].Total;

        return {
            rows: pets,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page
        };
    } catch (err) {
        console.error('Error getting customer pets by ID:', err);
        throw err;
    }
};

export const getCustomerPetProfileByID = async (maTC) => {
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('maTC', maTC)
            .query('SELECT * FROM THUCUNG WHERE MaTC = @maTC');
        return result.recordset[0] || null;
    } catch (err) {
        console.error('Error getting customer pet profile by ID:', err);
        throw err;
    }
};

export const getCustomerPetHistoryByID = async (maTC, type, page, limit) => {
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
                NV.HoTen AS TenBS
            FROM SUDUNGDICHVU SDV
            JOIN HOADON HD ON SDV.MaHD = HD.MaHD
            JOIN CHINHANH CN ON HD.MaCN = CN.MaCN
            LEFT JOIN KHAMBENH KB ON KB.MaSDDV = SDV.MaSDDV
            LEFT JOIN TIEMPHONG TP ON TP.MaSDDV = SDV.MaSDDV
            JOIN NHANVIEN NV ON 
                (SDV.LoaiDV = 'KB' AND KB.MaBS = NV.MaTKNV) OR 
                (SDV.LoaiDV = 'TP' AND TP.MaBS = NV.MaTKNV)
            WHERE 
                (KB.MaTC = @maTC OR TP.MaTC = @maTC)
                ${typeFilter}
            ORDER BY HD.NgayLap DESC
            OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY;

            SELECT COUNT(*) AS Total
            FROM SUDUNGDICHVU SDV
            JOIN HOADON HD ON SDV.MaHD = HD.MaHD
            LEFT JOIN KHAMBENH KB ON KB.MaSDDV = SDV.MaSDDV
            LEFT JOIN TIEMPHONG TP ON TP.MaSDDV = SDV.MaSDDV
            WHERE 
                (KB.MaTC = @maTC OR TP.MaTC = @maTC)
                ${type !== "all" ? "AND SDV.LoaiDV = @type" : ""}
        `;

        const result = await pool.request()
            .input('maTC', maTC)
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
        console.error('Error getting customer pet history by ID:', err);
        throw err;
    }
};

export const getCustomerPackagesByID = async (maTKKH, page, limit) => {
    try {
        const pool = await getPool();
        const offset = (page - 1) * limit;
        const query = `
        SELECT 
            DK.MaDK,
            DK.NgayDK,
            G.TenGoi,
            TC.TenTC
        FROM DANGKYGOITIEM DK
        INNER JOIN GOITIEM G ON DK.MaGoi = G.MaGoi
        INNER JOIN THUCUNG TC ON DK.MaTC = TC.MaTC
        INNER JOIN KHACHHANG KH ON TC.MaTKKH = KH.MaTKKH
        WHERE KH.MaTKKH = @MaTKKH
        ORDER BY DK.NgayDK DESC
        OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY;

        SELECT COUNT(*) AS Total
        FROM DANGKYGOITIEM DK
        INNER JOIN THUCUNG TC ON DK.MaTC = TC.MaTC
        INNER JOIN KHACHHANG KH ON TC.MaTKKH = KH.MaTKKH
        WHERE KH.MaTKKH = @MaTKKH;
        `;

        const result = await pool.request()
            .input('MaTKKH', maTKKH)
            .input('offset', offset)
            .input('limit', limit)
            .query(query);
        
        const packages = result.recordsets[0];
        const total = result.recordsets[1][0].Total;

        return {
            rows: packages,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page
        };
    } catch (err) {
        console.error('Error getting customer packages by ID:', err);
        throw err;
    }
};