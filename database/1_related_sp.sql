USE PETCAREDB
GO

--1: Tra cứu lịch sử hoá đơn và SDDV của khách hàng + danh sách thú cưng của khách hàng + lịch sử khám và tiêm của thú cưng

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
    INSERT INTO CHITIETTOATHUOC
        (MaSP, MaSDDV, SoLuong, LieuLuong, CachDung)
    VALUES
        (@maSP, @maSDDV, @soLuong, @lieuLuong, @cachDung);

    DECLARE
		@donGia DECIMAL(19,2),
		@tienThuoc DECIMAL(19,2),
		@maHD CHAR(8)

    SELECT @donGia = Gia
    FROM SANPHAM
    WHERE MaSP = @maSP;

    SET @tienThuoc = @donGia * @soLuong;

    UPDATE SUDUNGDICHVU
	SET TongTienDV = TongTienDV + @tienThuoc
	WHERE MaSDDV = @maSDDV;

    SELECT @maHD = MaHD
    FROM SUDUNGDICHVU
    WHERE MaSDDV = @maSDDV;

    UPDATE HOADON
	SET TongTien = TongTien + @tienThuoc
	WHERE MaHD = @maHD;
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
    @LieuLuong INT,
    @maDK CHAR(8)
AS
BEGIN
    INSERT INTO CHITIETTIEMPHONG
        (MaSP, MaSDDV, LieuLuong, MaDK)
    VALUES
        (@maSP, @maSDDV, @LieuLuong, @maDK);

    DECLARE
		@donGia DECIMAL(19,2),
		@uuDai DECIMAL(4,2),
		@tienVaccine DECIMAL(19,2),
		@maHD CHAR(8)

    SELECT @donGia = Gia
    FROM SANPHAM
    WHERE MaSP = @maSP;

    IF (@maDK IS NULL)
	BEGIN
        SET @uuDai = 0.00;
    END
	ELSE
	BEGIN
        SELECT @uuDai = MucUuDai
        FROM GOITIEM GT
            JOIN DANGKYGOITIEM DK ON GT.MaGoi = DK.MaGoi
        WHERE DK.MaDK = @maDK;
    END

    SET @tienVaccine = @donGia * @lieuLuong * ((100 - @uuDai) / 100.0);

    UPDATE SUDUNGDICHVU
	SET TongTienDV = TongTienDV + @tienVaccine
	WHERE MaSDDV = @maSDDV;

    SELECT @maHD = MaHD
    FROM SUDUNGDICHVU
    WHERE MaSDDV = @maSDDV;

    UPDATE HOADON
	SET TongTien = TongTien + @tienVaccine
	WHERE MaHD = @maHD;
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
    @MaNV CHAR(8)
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

    DECLARE @newMaSDDV CHAR(10);
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
--CREATE OR ALTER PROCEDURE sp_ThemSDDV @maHD CHAR(8),
/*
EXEC sp_Tim_Thu_Cung @thang = 1, @nam = 2025;

EXEC sp_Tinh_Doanh_Thu_CN_theo_thang @tencn = N'Chi nhánh JohnHuyện', @thang = 1, @nam = 2025;

EXEC sp_Tinh_Doanh_Thu_CN_theo_nam @tencn = N'Chi nhánh JohnHuyện', @nam = 2025;

EXEC sp_Tinh_Doanh_Thu_CT_theo_thang @thang = 1, @nam = 2025;

EXEC sp_Tinh_Doanh_Thu_CT_theo_nam @nam = 2025;

EXEC sp_Tim_Khach_Hang_Khong_Su_Dung_Dich_Vu_3_Thang;
*/

