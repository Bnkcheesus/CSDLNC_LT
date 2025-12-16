USE PETCAREDB
GO



--5: Kịch bản Tìm thú cưng có sử dụng dịch vụ trong năm
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

-- Thêm hóa đơn mới
GO
CREATE OR ALTER PROCEDURE sp_ThemHoaDon
    @maTKNV CHAR(8),
    @maTKKH CHAR(8)
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
    DECLARE @newMaHD CHAR(8);
    DECLARE @maxMaHD CHAR(8);
    DECLARE @num INT;
    DECLARE @maCN CHAR(5);


    SELECT @maxMaHD = MAX(MaHD)
    FROM HOADON;

    IF (@maxMaHD IS NULL)
        SET @newMaHD = 'HD000001';
    ELSE
    BEGIN
        SET @num = CAST(SUBSTRING(@maxMaHD, 3, 6) AS INT) + 1;
        SET @newMaHD = 'HD' + RIGHT('000000' + CAST(@num AS VARCHAR(6)), 6);
    END

    DECLARE @latestStartCurrent DATE;

    SELECT @latestStartCurrent = MAX(NgayBatDau)
    FROM LICHSULAMVIEC
    WHERE MaTKNV = @maTKNV AND (NgayKetThuc IS NULL OR NgayKetThuc > GETDATE())

    IF (@latestStartCurrent IS NULL)
		RETURN;

    SELECT @maCN = MaCN
    FROM LICHSULAMVIEC
    WHERE MaTKNV = @maTKNV AND (NgayKetThuc IS NULL OR NgayKetThuc > GETDATE()) AND NgayBatDau = @latestStartCurrent;

    INSERT INTO HOADON
        (MaHD, NgayLap, TongTien, KhuyenMai, HinhThucThanhToan, MaCN, MaTKKH, MaTKNV)
    VALUES
        (@newMaHD, GETDATE(), 0, 0, NULL, @maCN, @maTKKH, @maTKNV)

    PRINT N'Thêm hóa đơn thành công. Mã hoá đơn = ' + @newMaHD;
END
GO

CREATE OR ALTER PROCEDURE sp_ThemSDDV
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
        INSERT INTO KHAMBENH
    VALUES
        (@newMaSDDV, NULL, NULL, NULL, @MaThuCung, @MaNV);

    IF (@Loai = 'TP')
        INSERT INTO TIEMPHONG
    VALUES
        (@newMaSDDV, @MaThuCung, @MaNV);

    IF (@Loai = 'MH')
        INSERT INTO MUAHANG
    VALUES
        (@newMaSDDV, @MaNV);

    PRINT N'Thêm sử dụng dịch vụ thành công. Mã SDDV = ' + @newMaSDDV;
END
GO
CREATE OR ALTER PROCEDURE sp_DangKyGoiTiem
    @MaThuCung CHAR(8),
    @MaGoi CHAR(5),
    @NgayBatDau DATE
AS
BEGIN
    IF (@MaThuCung NOT IN (SELECT THUCUNG.MaTC
    FROM THUCUNG))
		RETURN
    IF (@MaGoi NOT IN (SELECT GOITIEM.MaGoi
    FROM GOITIEM))
		RETURN
    IF (@NgayBatDau < CAST(GETDATE() AS DATE))
		RETURN
    DECLARE @newMaDK CHAR(8);
    DECLARE @maxMaDK CHAR(8);
    DECLARE @num INT;

    SELECT @maxMaDK = MAX(MaDK)
    FROM DANGKYGOITIEM;

    IF (@maxMaDK IS NULL)
        SET @newMaDK = 'DK000001';
    ELSE
    BEGIN
        SET @num = CAST(SUBSTRING(@maxMaDK, 3, 6) AS INT) + 1;
        SET @newMaDK = 'DK' + RIGHT('000000' + CAST(@num AS VARCHAR(6)), 6);
    END

    INSERT DANGKYGOITIEM
    VALUES
        (@newMaDK, GETDATE(), @NgayBatDau, @MaGoi, @MaThuCung)
    PRINT  N'Thêm đăng ký thành công. Mã DK = ' + @newMaDK;
END
GO
--CREATE OR ALTER PROCEDURE sp_ThemSDDV @maHD CHAR(8),

EXEC sp_Tim_Thu_Cung @thang = 1, @nam = 2025;

EXEC sp_Tinh_Doanh_Thu_CN_theo_thang @tencn = N'Chi nhánh JohnHuyện', @thang = 1, @nam = 2025;

EXEC sp_Tinh_Doanh_Thu_CN_theo_nam @tencn = N'Chi nhánh JohnHuyện', @nam = 2025;

EXEC sp_Tinh_Doanh_Thu_CT_theo_thang @thang = 1, @nam = 2025;

EXEC sp_Tinh_Doanh_Thu_CT_theo_nam @nam = 2025;

EXEC sp_Tim_Khach_Hang_Khong_Su_Dung_Dich_Vu_3_Thang;





