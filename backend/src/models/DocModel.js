import { getPool } from '../config/db.js';

export const getDocServiceHistory = async (maTKNV, type, page, limit) => {
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
                HD.NgayLap AS NgaySuDung,
                SDV.LoaiDV,
                KH.MaTKKH,
                KH.HoTen,
                TC.MaTC,
                TC.TenTC
            FROM SUDUNGDICHVU SDV
            JOIN HOADON HD ON SDV.MaHD = HD.MaHD

            LEFT JOIN KHAMBENH KB ON KB.MaSDDV = SDV.MaSDDV
            LEFT JOIN TIEMPHONG TP ON TP.MaSDDV = SDV.MaSDDV
            LEFT JOIN THUCUNG TC ON TC.MaTC = COALESCE(KB.MaTC, TP.MaTC)
            LEFT JOIN KHACHHANG KH ON TC.MaTKKH = KH.MaTKKH

            WHERE
                (
                    EXISTS (
                        SELECT 1
                        FROM KHAMBENH
                        WHERE MaSDDV = SDV.MaSDDV
                        AND MaBS = @maTKNV
                    )
                    OR
                    EXISTS (
                        SELECT 1
                        FROM TIEMPHONG
                        WHERE MaSDDV = SDV.MaSDDV
                        AND MaBS = @maTKNV
                    )
                )
                ${typeFilter}
            ORDER BY NgaySuDung DESC
            OFFSET @offset ROWS
            FETCH NEXT @limit ROWS ONLY;

            SELECT COUNT(*) AS Total
            FROM SUDUNGDICHVU SDV
            WHERE
                (
                    EXISTS (
                        SELECT 1
                        FROM KHAMBENH
                        WHERE MaSDDV = SDV.MaSDDV
                        AND MaBS = @maTKNV
                    )
                    OR
                    EXISTS (
                        SELECT 1
                        FROM TIEMPHONG
                        WHERE MaSDDV = SDV.MaSDDV
                        AND MaBS = @maTKNV
                    )
                )
                ${typeFilter}
        `;

        const result = await pool.request()
            .input('maTKNV', maTKNV)
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

export const getDocExaminationInfo = async (maSDDV) => {
    try {
        const pool = await getPool();
        const query = `
            SELECT
                SDV.MaSDDV,
                HD.NgayLap,
                SDV.LoaiDV,
                CN.TenCN,

                KH.MaTKKH AS MaKH,
                KH.HoTen AS TenKH,

                TC.MaTC,
                TC.TenTC,

                BS.MaTKNV AS MaBS,
                BS.HoTen  AS TenBS,

                KB.TrieuChung,
                KB.ChuanDoan,
                KB.NgayTaiKham
            FROM SUDUNGDICHVU SDV
            JOIN HOADON HD
                ON SDV.MaHD = HD.MaHD
            JOIN CHINHANH CN
                ON HD.MaCN = CN.MaCN
            JOIN KHACHHANG KH
                ON HD.MaTKKH = KH.MaTKKH

            LEFT JOIN KHAMBENH KB
                ON SDV.MaSDDV = KB.MaSDDV

            LEFT JOIN THUCUNG TC
                ON TC.MaTC = KB.MaTC

            LEFT JOIN NHANVIEN BS
                ON BS.MaTKNV = KB.MaBS

            WHERE SDV.MaSDDV = @maSDDV;
        `;
        const result = await pool.request()
            .input('maSDDV', maSDDV)
            .query(query);

        return result.recordset[0];
    } catch (err) {
        console.error('Error getting examination info by ID:', err);
        throw err;
    }
};

export const updateDocExaminationInfo = async (maSDDV, examinationData) => {
    try {
        const pool = await getPool();
        const query = `
            UPDATE KHAMBENH
            SET TrieuChung = @TrieuChung,
                ChuanDoan = @ChuanDoan,
                NgayTaiKham = @NgayTaiKham
            WHERE MaSDDV = @maSDDV;
        `;
        await pool.request()
            .input('maSDDV', maSDDV)
            .input('TrieuChung', examinationData.TrieuChung)
            .input('ChuanDoan', examinationData.ChuanDoan)
            .input('NgayTaiKham', examinationData.NgayTaiKham || null)
            .query(query);
        return { message: 'Examination info updated successfully' };
    } catch (err) {
        console.error('Error updating examination info by ID:', err);
        throw err;
    }
};

export const getToaThuoc = async (maSDDV) => {
    try {
        const pool = await getPool();
        const query = `
            SELECT
                CT.MaSP AS MaThuoc,
                SP.TenSP AS TenThuoc,
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
        return result.recordset || [];
    } catch (err) {
        console.error('Error getting prescription by service ID:', err);
        throw err;
    }
};

export const addThuoc = async (maSDDV, thuocData) => {
    try {
        const pool = await getPool();
        const query = `
            EXEC sp_ThemChiTietToaThuoc @maSDDV, @maSP, @SoLuong, @LieuLuong, @CachDung
        `;
        await pool.request()
            .input('maSDDV', maSDDV)
            .input('maSP', thuocData.MaThuoc)
            .input('SoLuong', thuocData.SoLuong)
            .input('LieuLuong', thuocData.LieuLuong)
            .input('CachDung', thuocData.CachDung)
            .query(query);
        return { message: 'Prescription item added successfully' };
    } catch (err) {
        console.error('Error adding prescription item by service ID:', err);
        throw err;
    }
};

export const deleteThuoc = async (maSDDV, maThuoc) => {
    try {
        const pool = await getPool();
        const query = `
            DELETE FROM CHITIETTOATHUOC
            WHERE MaSDDV = @maSDDV AND MaSP = @maSP;

            EXEC sp_CapNhatTongTienDVKhamBenh @maSDDV;
        `;
        await pool.request()
            .input('maSDDV', maSDDV)
            .input('maSP', maThuoc)
            .query(query);
        return { message: 'Prescription item deleted successfully' };
    } catch (err) {
        console.error('Error deleting prescription item by service ID:', err);
        throw err;
    }
};

export const updateToaThuoc = async (maSDDV, maThuoc, thuocData) => {
    try {
        const pool = await getPool();
        const query = `
            UPDATE CHITIETTOATHUOC
            SET SoLuong = @SoLuong,
                LieuLuong = @LieuLuong,
                CachDung = @CachDung
            WHERE MaSDDV = @maSDDV AND MaSP = @maSP;

            EXEC sp_CapNhatTongTienDVKhamBenh @maSDDV;
        `;
        await pool.request()
            .input('maSDDV', maSDDV)
            .input('maSP', maThuoc)
            .input('SoLuong', thuocData.SoLuong)
            .input('LieuLuong', thuocData.LieuLuong)
            .input('CachDung', thuocData.CachDung)
            .query(query);
        return { message: 'Prescription item updated successfully' };
    } catch (err) {
        console.error('Error updating prescription item by service ID:', err);
        throw err;
    }
};

export const getDocVaccinationInfo = async (maSDDV) => {
    try {
        const pool = await getPool();
        const query = `
            SELECT
                SDV.MaSDDV,
                HD.NgayLap,
                SDV.LoaiDV,
                CN.TenCN,

                KH.MaTKKH AS MaKH,
                KH.HoTen AS TenKH,

                TC.MaTC,
                TC.TenTC,

                BS.MaTKNV AS MaBS,
                BS.HoTen  AS TenBS
            FROM SUDUNGDICHVU SDV
            JOIN HOADON HD
                ON SDV.MaHD = HD.MaHD
            JOIN CHINHANH CN
                ON HD.MaCN = CN.MaCN
            JOIN KHACHHANG KH
                ON HD.MaTKKH = KH.MaTKKH

            LEFT JOIN TIEMPHONG TP
                ON SDV.MaSDDV = TP.MaSDDV

            LEFT JOIN THUCUNG TC
                ON TC.MaTC = TP.MaTC

            LEFT JOIN NHANVIEN BS
                ON BS.MaTKNV = TP.MaBS

            WHERE SDV.MaSDDV = @maSDDV;
        `;
        const result = await pool.request()
            .input('maSDDV', maSDDV)
            .query(query);

        return result.recordset[0];
    } catch (err) {
        console.error('Error getting vaccination info by ID:', err);
        throw err;
    }
};

export const getToaTiem = async (maSDDV) => {
    try {
        const pool = await getPool();
        const query = `
            SELECT
                CTTP.MaSP AS MaVaccine,
                SP.TenSP AS TenVaccine,
                CTTP.LieuLuong,
                CTTP.MaDK,
                GT.MaGoi,
                GT.TenGoi
            FROM CHITIETTIEMPHONG CTTP
            JOIN SANPHAM SP
                ON CTTP.MaSP = SP.MaSP
            LEFT JOIN DANGKYGOITIEM DK
                ON CTTP.MaDK = DK.MaDK
            LEFT JOIN GOITIEM GT
                ON DK.MaGoi = GT.MaGoi
            WHERE
                CTTP.MaSDDV = @maSDDV
        `;
        const result = await pool.request()
            .input('maSDDV', maSDDV)
            .query(query);
        return result.recordset || [];
    } catch (err) {
        console.error('Error getting toa tiem by service ID:', err);
        throw err;
    }
};

export const addVaccine = async (maSDDV, tiemData) => {
    try {
        const pool = await getPool();
        const query = `
            EXEC sp_ThemChiTietTiemPhong @maSDDV, @maSP, @LieuLuong, @maDK
        `;
        console.log(tiemData);
        await pool.request()
            .input('maSDDV', maSDDV)
            .input('maSP', tiemData.MaVaccine)
            .input('LieuLuong', tiemData.LieuLuong)
            .input('maDK', tiemData.MaDK || null)
            .query(query);
        return { message: 'Toa tiem item added successfully' };
    } catch (err) {
        console.error('Error adding toa tiem item by service ID:', err);
        throw err;
    }
};

export const deleteVaccine = async (maSDDV, maVaccine) => {
    try {
        const pool = await getPool();
        const query = `
            DELETE FROM CHITIETTIEMPHONG
            WHERE MaSDDV = @maSDDV AND MaSP = @maSP;

            EXEC sp_CapNhatTongTienDVTiemPhong @maSDDV;
        `;
        await pool.request()
            .input('maSDDV', maSDDV)
            .input('maSP', maVaccine)
            .query(query);
        return { message: 'Toa tiem item deleted successfully' };
    } catch (err) {
        console.error('Error deleting toa tiem item by service ID:', err);
        throw err;
    }
};

export const updateToaTiem = async (maSDDV, maVaccine, tiemData) => {
    try {
        const pool = await getPool();
        const query = `
            UPDATE CHITIETTIEMPHONG
            SET LieuLuong = @LieuLuong
            WHERE MaSDDV = @maSDDV AND MaSP = @maSP;

            EXEC sp_CapNhatTongTienDVTiemPhong @maSDDV;
        `;
        await pool.request()
            .input('maSDDV', maSDDV)
            .input('maSP', maVaccine)
            .input('LieuLuong', tiemData.LieuLuong)
            .query(query);
        return { message: 'Toa tiem item updated successfully' };
    } catch (err) {
        console.error('Error updating toa tiem item by service ID:', err);
        throw err;
    }
};

export const getPetInfo = async (maTC) => {
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('maTC', maTC)
            .query('SELECT * FROM THUCUNG WHERE MaTC = @maTC');
        return result.recordset[0] || null;
    } catch (err) {
        console.error('Error getting pet info by ID:', err);
        throw err;
    }
};

export const updatePetHealth = async (maTC, healthData) => {
    try {
        const pool = await getPool();
        const query = `
            UPDATE THUCUNG
            SET TinhTrangSucKhoe = @TinhTrangSucKhoe
            WHERE MaTC = @maTC;
        `;
        await pool.request()
            .input('maTC', maTC)
            .input('TinhTrangSucKhoe', healthData.TinhTrangSucKhoe)
            .query(query);
        return { message: 'Pet health status updated successfully' };
    } catch (err) {
        console.error('Error updating pet health status by ID:', err);
        throw err;
    }
};

export const getPetHistory = async (maTC, type, page, limit) => {
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
        console.error('Error getting pet history by ID:', err);
        throw err;
    }
};

export const getPetPackages = async (maTC) => {
    try {
        const pool = await getPool();
        const query = `
            SELECT
                DK.MaDK,
                DK.NgayDK,
                DK.NgayBatDau,
                DK.MaGoi,
                GT.TenGoi,
                GT.ThoiHan,
                GT.MucUuDai,
                GT.TongTienGoi
            FROM DANGKYGOITIEM DK
            JOIN GOITIEM GT
                ON DK.MaGoi = GT.MaGoi
            WHERE
                DK.MaTC = @maTC
            ORDER BY
                DK.NgayDK DESC;
        `;
        const result = await pool.request()
            .input('maTC', maTC)
            .query(query);
        return result.recordset || [];
    } catch (err) {
        console.error('Error getting pet packages by pet ID:', err);
        throw err;
    }
};

export const getMedicineByKeyword = async (keyword) => {
    try {
        const pool = await getPool();
        const query = `
            SELECT
                MaSP AS MaThuoc,
                TenSP AS TenThuoc
            FROM SANPHAM
            WHERE LoaiSP = N'Thuốc' AND
            (TenSP LIKE '%' + @keyword + '%' OR MaSP LIKE '%' + @keyword + '%')
        `;
        const result = await pool.request()
            .input('keyword', keyword)
            .query(query);
        return result.recordset;
    } catch (err) {
        console.error('Error getting medicines by keyword:', err);
        throw err;
    }
};

export const getVaccineByKeyword = async (keyword) => {
    try {
        const pool = await getPool();
        const query = `
            SELECT
                MaSP AS MaVaccine,
                TenSP AS TenVaccine
            FROM SANPHAM
            WHERE LoaiSP = N'Vaccine' AND
            (TenSP LIKE '%' + @keyword + '%' OR MaSP LIKE '%' + @keyword + '%')
        `;
        const result = await pool.request()
            .input('keyword', keyword)
            .query(query);
        return result.recordset;
    } catch (err) {
        console.error('Error getting vaccines by keyword:', err);
        throw err;
    }
};