USE PETCAREDB

GO
CREATE OR ALTER PROCEDURE sp_Tim_Thu_Cung
	@thang int,
	@nam int
as
begin
	select DISTINCT THUCUNG.MaTC, THUCUNG.TenTC from THUCUNG
	JOIN TIEMPHONG ON TIEMPHONG.MaTC = THUCUNG.TenTC
	JOIN SUDUNGDICHVU ON SUDUNGDICHVU.MaSDDV = TIEMPHONG.MaSDDV
	JOIN HOADON ON HOADON.MaHD = SUDUNGDICHVU.MaHD
	WHERE YEAR(NgayLap) = @nam AND MONTH(NgayLap) = @thang
end

go
Create or alter procedure sp_Tinh_Doanh_Thu_CN_theo_thang
	@tencn nvarchar(50),
	@thang int,
	@nam int
as
begin
	SELECT SUM(TongTien) FROM HOADON
	JOIN CHINHANH ON CHINHANH.MaCN = HOADON.MaCN
	WHERE MONTH(NgayLap) = @thang AND YEAR(NgayLap) = @nam AND CHINHANH.TenCN = @tencn
end
go
Create or alter procedure sp_Tinh_Doanh_Thu_CN_theo_nam
	@tencn nvarchar(50),
	@nam int
as
begin
	SELECT SUM(TongTien) FROM HOADON
	JOIN CHINHANH ON CHINHANH.MaCN = HOADON.MaCN
	WHERE YEAR(NgayLap) = @nam AND CHINHANH.TenCN = @tencn
end
go
Create or alter procedure sp_Tinh_Doanh_Thu_CT_theo_thang
	@thang int,
	@nam int
as
begin
	SELECT SUM(TongTien) FROM HOADON
	WHERE MONTH(NgayLap) = @thang AND YEAR(NgayLap) = @nam
end
go
Create or alter procedure sp_Tinh_Doanh_Thu_CT_theo_nam
	@nam int
as
begin
	SELECT SUM(TongTien) FROM HOADON
	WHERE YEAR(NgayLap) = @nam
end
go
GO
CREATE OR ALTER PROCEDURE sp_ThemHoaDon
    @maTKNV CHAR(8),
    @maTKKH CHAR(8)
AS
BEGIN
	IF (NOT EXISTS (SELECT KHACHHANG.MaTKKH FROM KHACHHANG WHERE MaTKKH = @maTKKH))
		RETURN
	IF (NOT EXISTS (SELECT NHANVIEN.MaTKNV FROM NHANVIEN WHERE MaTKNV = @maTKNV))
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
    WHERE MaTKNV = @maTKNV AND NgayKetThuc IS NULL AND NgayBatDau = @latestStartCurrent;

    INSERT INTO HOADON (MaHD, NgayLap, TongTien, KhuyenMai, HinhThucThanhToan, MaCN, MaTKKH, MaTKNV)
    VALUES (@newMaHD, GETDATE(), 0, 0, NULL, @maCN, @maTKKH, @maTKNV)

    PRINT N'Thêm hóa đơn thành công. Mã hoá đơn = ' + @newMaHD;
END
GO
--CREATE OR ALTER PROCEDURE sp_ThemSDDV @maHD CHAR(8),
