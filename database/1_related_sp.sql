USE PETCAREDB
GO

--1: Tra cứu lịch sử hoá đơn và SDDV của khách hàng, danh sách thú cưng của khách hàng, lịch sử khám và tiêm của thú cưng, danh sách gói tiêm của thú cưng

--1a: Tra cứu lịch sử hoá đơn của 1 khách hàng
CREATE OR ALTER PROCEDURE sp_TraCuuLichSuHoaDonKH
    @maTKKH CHAR(8),
    @maCN CHAR(5) = NULL
AS
BEGIN
    SELECT
        HD.MaHD,
        HD.NgayLap,
        HD.TongTien,
        HD.KhuyenMai,
        HD.HinhThucThanhToan,
        HD.MaCN,
        CN.TenCN,
        HD.MaTKKH,
        KH.HoTen,
        HD.MaTKNV,
        NV.HoTen
    FROM HOADON HD
        JOIN CHINHANH CN ON HD.MaCN = CN.MaCN
        JOIN KHACHHANG KH ON HD.MaTKKH = KH.MaTKKH
        JOIN NHANVIEN NV ON HD.MaTKNV = NV.MaTKNV
    WHERE
		HD.MaTKKH = @maTKKH
        AND (@maCN IS NULL OR HD.MaCN = @maCN)
    ORDER BY HD.NgayLap DESC;
END
GO

--1b: Tra cứu danh sách thú cưng của khách hàng
CREATE OR ALTER PROCEDURE sp_TraCuuDanhSachThuCungKH
    @maTKKH CHAR(8)
AS
BEGIN
    SELECT
        TC.MaTC,
        TC.TenTC,
        TC.Loai,
        TC.Giong,
        TC.MATKKH,
        KH.HoTen
    FROM THUCUNG TC
        JOIN KHACHHANG KH ON TC.MaTKKH = KH.MaTKKH
    WHERE TC.MaTKKH = @maTKKH
    ORDER BY TC.MaTC
END
GO

--1c: Tra cứu lịch sử SDDV của khách hàng
CREATE OR ALTER PROCEDURE sp_TraCuuLichSuSDDVKH
    @maTKKH CHAR(8),
    @maCN CHAR(5) = NULL
AS
BEGIN
    SELECT
        SDV.MaSDDV,
        SDV.LoaiDV,
        SDV.MaHD,
        HD.NgayLap AS NgaySuDung,
        CN.TenCN,
        TC.TenTC
    FROM SUDUNGDICHVU SDV
        JOIN HOADON HD ON SDV.MaHD = HD.MaHD
        JOIN CHINHANH CN ON HD.MaCN = CN.MaCN
        LEFT JOIN KHAMBENH KB ON KB.MaSDDV = SDV.MaSDDV
        LEFT JOIN TIEMPHONG TP ON TP.MaSDDV = SDV.MaSDDV
        LEFT JOIN THUCUNG TC ON TC.MaTC = COALESCE(KB.MaTC, TP.MaTC)
    WHERE
		HD.MaTKKH = @maTKKH
        AND (@maCN IS NULL OR HD.MaCN = @maCN)
    ORDER BY HD.NgayLap DESC;
END
GO

--1d: Tra cứu lịch sử khám và tiêm của thú cưng
CREATE OR ALTER PROCEDURE sp_TraCuuLichSuKhamTiemTC
    @maTC CHAR(8),
    @maCN CHAR(5) = NULL
AS
BEGIN
    SELECT
        SDV.MaSDDV,
        SDV.LoaiDV,
        HD.NgayLap AS NgaySuDung,
        CN.TenCN,
        NV.MaTKNV AS MaBS,
        NV.HoTen AS TenBS
    FROM SUDUNGDICHVU SDV
        JOIN HOADON HD ON SDV.MaHD = HD.MaHD
        JOIN CHINHANH CN ON HD.MaCN = CN.MaCN
        LEFT JOIN KHAMBENH KB ON KB.MaSDDV = SDV.MaSDDV
        LEFT JOIN TIEMPHONG TP ON TP.MaSDDV = SDV.MaSDDV
        JOIN NHANVIEN NV
        ON (SDV.LoaiDV = 'KB' AND KB.MaBS = NV.MaTKNV)
            OR (SDV.LoaiDV = 'TP' AND TP.MaBS = NV.MaTKNV)
    WHERE 
		(KB.MaTC = @maTC OR TP.MaTC = @maTC)
        AND (@maCN IS NULL OR HD.MaCN = @maCN)
    ORDER BY HD.NgayLap DESC;
END
GO

--1e: Tra cứu danh sách gói tiêm đã đăng ký cho thú cưng
CREATE OR ALTER PROCEDURE sp_TraCuuDKGoiTiemThuCung
	@maTC CHAR(8)
AS
BEGIN
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
END
GO


--2: Bác sĩ tra cứu lịch sử khám và tiêm của mình + lấy thông tin khám bệnh, tiêm phòng + cập nhật chi tiết toa thuốc, chi tiết tiêm phòng.
--   Nhân viên tạo hoá đơn, thêm dịch vụ vào hoá đơn.

--2a: Bác sĩ tra cứu lịch sử khám/tiêm của mình
CREATE OR ALTER PROCEDURE sp_TraCuuLichSuKhamTiemBS
    @maTKNV CHAR(8)
AS
BEGIN
    SELECT
        SDV.MaSDDV,
        HD.NgayLap AS NgaySuDung,
        SDV.LoaiDV,
        KH.MaTKKH,
        KH.HoTen,
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
    ORDER BY NgaySuDung DESC;
END
GO

--2b: Tra cứu toa thuốc của một lần khám bệnh
CREATE OR ALTER PROCEDURE sp_TraCuuToaThuoc
    @maSDDV CHAR(10)
AS
BEGIN
    SELECT
        CT.MaSP AS MaThuoc,
        SP.TenSP AS TenThuoc,
        CT.SoLuong,
        CT.LieuLuong,
        CT.CachDung,
        (SP.Gia * CT.SoLuong) AS Gia
    FROM CHITIETTOATHUOC CT
    JOIN SANPHAM SP ON CT.MaSP = SP.MaSP
    WHERE CT.MaSDDV = @maSDDV
END
GO

--2c: Thêm thuốc vào toa thuốc
CREATE OR ALTER PROCEDURE sp_ThemThuocToaThuoc
    @maSP CHAR(8),
    @maSDDV	CHAR(10),
    @soLuong INT,
    @lieuLuong NVARCHAR(50),
    @cachDung NVARCHAR(50)
AS
BEGIN
    EXEC sp_ThemChiTietToaThuoc @maSDDV, @maSP, @soLuong, @lieuLuong, @cachDung;
END
GO

--2d: Tra cứu toa tiêm của một lần tiêm phòng
CREATE OR ALTER PROCEDURE sp_TraCuuToaTiem
    @maSDDV CHAR(10)
AS
BEGIN
    SELECT
        CT.MaSP AS MaVaccine,
        SP.TenSP AS TenVaccine,
        CT.LieuLuong,
        CT.MaDK,
        GT.MaGoi,
        GT.TenGoi,
        CASE 
            WHEN CT.MaDK IS NULL THEN 
                SP.Gia * CT.LieuLuong
            ELSE
                SP.Gia * CT.LieuLuong * ((100 - GT.MucUuDai) / 100.0)
        END AS Gia
    FROM CHITIETTIEMPHONG CT
    JOIN SANPHAM SP
		ON CT.MaSP = SP.MaSP
    LEFT JOIN DANGKYGOITIEM DK
		ON CT.MaDK = DK.MaDK
    LEFT JOIN GOITIEM GT
		ON DK.MaGoi = GT.MaGoi
    WHERE
        CT.MaSDDV = @maSDDV;
END
GO

--2e: Thêm vaccine vào toa tiêm
CREATE OR ALTER PROCEDURE sp_ThemVaccineToaTiem
    @maSP CHAR(8),
    @maSDDV CHAR(10),
    @lieuLuong INT,
    @maDK CHAR(8)
AS
BEGIN
    EXEC sp_ThemChiTietTiemPhong @maSDDV, @maSP, @lieuLuong, @maDK;
END
GO

--2f: Tạo hoá đơn mới
CREATE OR ALTER PROCEDURE sp_ThemHoaDonMoi
    @maTKNV CHAR(8),
    @maTKKH CHAR(8),
    @maCN CHAR(5),
    @newMaHD CHAR(8) OUTPUT
AS
BEGIN
    IF (NOT EXISTS (SELECT KHACHHANG.MaTKKH
    FROM KHACHHANG
    WHERE MaTKKH = @maTKKH))
		RETURN
    IF (NOT EXISTS (SELECT NHANVIEN.MaTKNV
    FROM NHANVIEN
    WHERE MaTKNV = @maTKNV))
		RETURN
    DECLARE @maxMaHD CHAR(8);
    DECLARE @num INT;

    SELECT @maxMaHD = MAX(MaHD)
    FROM HOADON;

    IF (@maxMaHD IS NULL)
        SET @newMaHD = 'HD000001';
    ELSE
    BEGIN
        SET @num = CAST(SUBSTRING(@maxMaHD, 3, 6) AS INT) + 1;
        SET @newMaHD = 'HD' + RIGHT('000000' + CAST(@num AS VARCHAR(6)), 6);
    END

    INSERT INTO HOADON
        (MaHD, NgayLap, TongTien, KhuyenMai, HinhThucThanhToan, MaCN, MaTKKH, MaTKNV)
    VALUES
        (@newMaHD, GETDATE(), 0, 0, NULL, @maCN, @maTKKH, @maTKNV)
END
GO

--2g: Thêm dịch vụ vào hoá đơn
CREATE OR ALTER PROCEDURE sp_ThemSDDVMoi
    @maHD CHAR(8),
    @Loai CHAR(2),
    @MaThuCung CHAR(8) = NULL,
    @MaNV CHAR(8),
	@newMaSDDV CHAR(10) = NULL OUTPUT
AS
BEGIN
    IF (@maHD NOT IN (SELECT MaHD
    FROM HOADON))
        RETURN;

    IF (@MaNV NOT IN (SELECT MaTKNV
    FROM NHANVIEN))
        RETURN;

    IF (@MaThuCung IS NOT NULL AND @MaThuCung NOT IN (SELECT MaTC
        FROM THUCUNG))
        RETURN;

    IF (@Loai NOT IN ('KB', 'TP', 'MH'))
        RETURN;

    DECLARE @maxMaSDDV CHAR(10);
    DECLARE @num INT;

    SELECT @maxMaSDDV = MAX(MaSDDV)
    FROM SUDUNGDICHVU;

    IF (@maxMaSDDV IS NULL)
        SET @newMaSDDV = 'SDDV000001';
    ELSE
    BEGIN
        SET @num = CAST(SUBSTRING(@maxMaSDDV, 5, 6) AS INT) + 1;
        SET @newMaSDDV = 'SDDV' + RIGHT('000000' + CAST(@num AS VARCHAR(6)), 6);
    END

    INSERT INTO SUDUNGDICHVU
    VALUES
        (@newMaSDDV, @Loai, 0, @maHD);

    IF (@Loai = 'KB')
        EXEC sp_ThemKhamBenh @newMaSDDV, @MaThuCung, @MaNV, NULL, NULL, NULL;

    IF (@Loai = 'TP')
        EXEC sp_ThemTiemPhong @newMaSDDV, @MaThuCung, @MaNV;

    IF (@Loai = 'MH')
        EXEC sp_ThemMuaHang @newMaSDDV, @MaNV;
END
GO

--2h: Tra cứu chi tiết mua hàng
CREATE OR ALTER PROCEDURE sp_TraCuuChiTietMuaHang
	@maSDDV CHAR(10)
AS
BEGIN
    SELECT
        CT.MaSP,
        SP.TenSP,
        CT.SoLuong,
        (SP.Gia * CT.SoLuong) AS Gia
    FROM CHITIETMUAHANG CT
        JOIN SANPHAM SP ON CT.MaSP = SP.MaSP
    WHERE CT.MaSDDV = @maSDDV;
END
GO


--3a: Truy vấn sản phẩm tồn kho của chi nhánh bất kì
CREATE OR ALTER PROCEDURE sp_Truy_Van_Ton_Kho
	@tensp NVARCHAR(50),
	@tencn NVARCHAR(50)
AS
BEGIN
	SELECT MaLo, SoLuongTonKho, NgaySanXuat, HanSuDung 
	FROM LOSANPHAM
	JOIN CHINHANH ON CHINHANH.MaCN = LOSANPHAM.MaCN
	JOIN SANPHAM ON LOSANPHAM.MaSP = SANPHAM.MaSP
	WHERE TenSP = @tensp AND TenCN = @tenCN 
END
GO
--3b: Truy vấn sản phẩm của chi nhánh bất kì sắp hết hạn (ĐK sắp hết hạn: Sau 60 ngày tính từ ngày gần nhất)
CREATE OR ALTER PROCEDURE sp_Truy_Van_Ton_Kho_Sap_Het_Han
	@tensp NVARCHAR(50),
	@tencn NVARCHAR(50)
AS
BEGIN
	SELECT MaLo, SoLuongTonKho, NgaySanXuat, HanSuDung 
	FROM LOSANPHAM
	JOIN CHINHANH ON CHINHANH.MaCN = LOSANPHAM.MaCN
	JOIN SANPHAM ON LOSANPHAM.MaSP = SANPHAM.MaSP
	WHERE TenSP = @tensp AND TenCN = @tenCN AND HanSuDung > NgaySanXuat AND HanSuDung <= DATEADD(day, 60, GETDATE())
END
GO
--4: Thống kê vắc xin sử dụng nhiều nhất trong năm:
CREATE OR ALTER PROCEDURE sp_Tim_Vac_Xin_Su_Dung_Nhieu_Nhat_Trong_Nam
    @Nam INT
AS
BEGIN
    SELECT 
        sp.TenSP,
        COUNT(*) AS SoLanSuDung
    FROM HOADON hd
    JOIN SUDUNGDICHVU sddv ON sddv.MaHD = hd.MaHD
    JOIN TIEMPHONG tp ON tp.MaSDDV = sddv.MaSDDV
    JOIN CHITIETTIEMPHONG cttp ON cttp.MaSDDV = tp.MaSDDV
    JOIN SANPHAM sp ON sp.MaSP = cttp.MaSP
    WHERE sp.LoaiSP = N'Vaccine'
      AND YEAR(hd.NgayLap) = @Nam
    GROUP BY sp.TenSP
    HAVING COUNT(*) >= ALL(
            SELECT COUNT(*) AS SoLan
            FROM HOADON hd2
            JOIN SUDUNGDICHVU sddv2 ON sddv2.MaHD = hd2.MaHD
            JOIN TIEMPHONG tp2 ON tp2.MaSDDV = sddv2.MaSDDV
            JOIN CHITIETTIEMPHONG cttp2 ON cttp2.MaSDDV = tp2.MaSDDV
            JOIN SANPHAM sp2 ON sp2.MaSP = cttp2.MaSP
            WHERE sp2.LoaiSP = N'Vaccine'
              AND YEAR(hd2.NgayLap) = @Nam
            GROUP BY sp2.TenSP
        ) 
END
GO
GO
--5: Kịch bản Tìm thú cưng có sử dụng dịch vụ trong tháng năm
CREATE OR ALTER PROCEDURE sp_Tim_Thu_Cung
    @thang INT,
    @nam INT
AS
BEGIN
    SELECT DISTINCT THUCUNG.MaTC, THUCUNG.TenTC
    FROM THUCUNG
        JOIN TIEMPHONG ON TIEMPHONG.MaTC = THUCUNG.TenTC
        JOIN SUDUNGDICHVU ON SUDUNGDICHVU.MASDDV = TIEMPHONG.MASDDV
        JOIN HOADON ON HOADON.MaHD = SUDUNGDICHVU.MaHD
    WHERE YEAR(NgayLap) = @nam AND MONTH(NgayLap) = @thang
END
GO



-- 6 Kịch bản Tìm doanh thu theo chi nhánh/công ty theo tháng/năm
CREATE OR ALTER PROCEDURE sp_Tinh_Doanh_Thu_CN_theo_thang
    @tencn NVARCHAR(50),
    @thang INT,
    @nam INT
AS
BEGIN
    SELECT SUM(TongTien)
    FROM HOADON
        JOIN CHINHANH ON CHINHANH.MaCN = HOADON.MaCN
    WHERE MONTH(NgayLap) = @thang AND YEAR(NgayLap) = @nam AND CHINHANH.TenCN = @tencn
END
GO


CREATE OR ALTER PROCEDURE sp_Tinh_Doanh_Thu_CN_theo_nam
    @tencn NVARCHAR(50),
    @nam INT
AS
BEGIN
    SELECT SUM(TongTien)
    FROM HOADON
        JOIN CHINHANH ON CHINHANH.MaCN = HOADON.MaCN
    WHERE YEAR(NgayLap) = @nam AND CHINHANH.TenCN = @tencn
END
GO


CREATE OR ALTER PROCEDURE sp_Tinh_Doanh_Thu_CT_theo_thang
    @thang INT,
    @nam INT
AS
BEGIN
    SELECT SUM(TongTien)
    FROM HOADON
    WHERE MONTH(NgayLap) = @thang AND YEAR(NgayLap) = @nam
END
GO


CREATE OR ALTER PROCEDURE sp_Tinh_Doanh_Thu_CT_theo_nam
    @nam INT
AS
BEGIN
    SELECT SUM(TongTien)
    FROM HOADON
    WHERE YEAR(NgayLap) = @nam
END
SELECT SUM(TongTien)
FROM HOADON
WHERE YEAR(NgayLap) = @nam
GO

--7 Tra cứu khách hàng ko có sử dụng dịch vụ trong vòng 3 tháng
CREATE OR ALTER PROCEDURE sp_Tim_Khach_Hang_Khong_Su_Dung_Dich_Vu_3_Thang
AS
BEGIN
    SELECT DISTINCT KH.MaTKKH, KH.HoTen
    FROM KHACHHANG KH
    WHERE NOT EXISTS 
	(
		SELECT *
    FROM HOADON HD1
        JOIN SUDUNGDICHVU SDDV ON HD1.MaHD = SDDV.MaHD
    WHERE HD1.MaTKKH = KH.MaTKKH AND HD1.NgayLap >= DATEADD(MONTH, -3, GETDATE())
	)
END
GO


-------Các sp khác: ----------

--Tra cứu thông tin hoá đơn
CREATE OR ALTER PROCEDURE sp_TraCuuThongTinHoaDon
	@maHD CHAR(8)
AS
BEGIN
	SELECT
		HD.MaHD,
		HD.NgayLap,
		CN.MaCN,
		CN.TenCN,
		HD.MaTKNV,
		HD.MaTKKH,
		HD.TongTien,
		HD.KhuyenMai,
		HD.HinhThucThanhToan
	FROM HOADON HD
	JOIN CHINHANH CN ON HD.MaCN = CN.MaCN
	WHERE HD.MaHD = @maHD;
END
GO

--Tra cứu danh sách dịch vụ trong hoá đơn
CREATE OR ALTER PROCEDURE sp_TraCuuDichVuHoaDon
	@maHD CHAR(8)
AS
BEGIN
	SELECT 
        SDV.MaSDDV, 
        SDV.LoaiDV,
        NV.HoTen AS TenNV,
        SDV.TongTienDV
    FROM SUDUNGDICHVU SDV
    JOIN HOADON HD ON SDV.MaHD = HD.MaHD
    LEFT JOIN KHAMBENH KB ON KB.MaSDDV = SDV.MaSDDV
    LEFT JOIN TIEMPHONG TP ON TP.MaSDDV = SDV.MaSDDV
    LEFT JOIN MUAHANG MH ON MH.MaSDDV = SDV.MaSDDV
    JOIN NHANVIEN NV ON 
        (SDV.LoaiDV = 'KB' AND KB.MaBS = NV.MaTKNV) OR 
        (SDV.LoaiDV = 'TP' AND TP.MaBS = NV.MaTKNV) OR
        (SDV.LoaiDV = 'MH' AND MH.MaNVBH = NV.MaTKNV)
    WHERE HD.MaHD = @maHD;
END
GO

--Tra cứu danh sách bác sĩ đang làm việc tại chi nhánh
CREATE OR ALTER PROCEDURE sp_TraCuuDanhSachBacSiTheoChiNhanh
	@maCN CHAR(5)
AS
BEGIN
	SELECT NV.MaTKNV, NV.HoTen
    FROM NHANVIEN NV
    JOIN LICHSULAMVIEC L ON NV.MaTKNV = L.MaTKNV
    WHERE L.MaCN = @maCN AND NV.ChucVu = 'BSTY'
    AND (L.NgayKetThuc IS NULL OR L.NgayKetThuc > GETDATE());
END
GO

--Tra cứu thông tin nhân viên kèm chi nhánh làm việc hiện tại
CREATE OR ALTER PROCEDURE sp_TraCuuThongTinNhanVien
	@maTKNV CHAR(8)
AS
BEGIN
	SELECT TOP 1 NV.MaTKNV, NV.HoTen, NV.GioiTinh, NV.NgaySinh, NV.ChucVu, NV.NgayVaoLam, CN.MaCN, CN.TenCN
	FROM NHANVIEN NV
	JOIN LICHSULAMVIEC L ON NV.MaTKNV = L.MaTKNV
	JOIN CHINHANH CN ON CN.MaCN = L.MaCN
	WHERE NV.MaTKNV = @maTKNV
	AND (L.NgayKetThuc IS NULL OR L.NgayKetThuc > GETDATE());
END
