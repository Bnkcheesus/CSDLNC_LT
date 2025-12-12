USE PETCAREDB
GO

--1 Kịch bản: Tra cứu thông tin khách hàng + thú cưng + lịch sử dịch vụ
CREATE OR ALTER PROCEDURE sp_Tim_Thu_Cung
	@thang INT,
	@nam INT
AS
BEGIN
	SELECT DISTINCT THUCUNG.MaTC, THUCUNG.TenTC FROM THUCUNG
	JOIN TIEMPHONG ON TIEMPHONG.MaTC = THUCUNG.TenTC
	JOIN SUDUNGDICHVU ON SUDUNGDICHVU.MASDDV = TIEMPHONG.MASDDV
	JOIN HOADON ON HOADON.MaHD = SUDUNGDICHVU.MaHD
	WHERE YEAR(NgayLap) = @nam AND MONTH(NgayLap) = @thang
END
GO

--2 Kịch bản: Tạo hóa đơn & cập nhật tổng tiền theo dịch vụ
CREATE OR ALTER PROCEDURE sp_Tinh_Doanh_Thu_CN_theo_thang
	@tencn NVARCHAR(50),
	@thang INT,
	@nam INT
AS
BEGIN
	SELECT SUM(TongTien) FROM HOADON
	JOIN CHINHANH ON CHINHANH.MaCN = HOADON.MaCN
	WHERE MONTH(NgayLap) = @thang AND YEAR(NgayLap) = @nam AND CHINHANH.TenCN = @tencn
END
GO

--3 Kịch bản: Quản lý tồn kho & truy vấn lượng tồn theo chi nhánh
CREATE OR ALTER PROCEDURE sp_Tinh_Doanh_Thu_CN_theo_nam
	@tencn NVARCHAR(50),
	@nam INT
AS
BEGIN
	SELECT SUM(TongTien) FROM HOADON
	JOIN CHINHANH ON CHINHANH.MaCN = HOADON.MaCN
	WHERE YEAR(NgayLap) = @nam AND CHINHANH.TenCN = @tencn
END
GO

--4 Kịch bản: Thống kê vaccine được sử dụng nhiều nhất trong năm
CREATE OR ALTER PROCEDURE sp_Tinh_Doanh_Thu_CT_theo_thang
	@thang INT,
	@nam INT
AS
BEGIN
	SELECT SUM(TongTien) FROM HOADON
	WHERE MONTH(NgayLap) = @thang AND YEAR(NgayLap) = @nam
END
GO

--5 Kịch bản: Tìm thú cưng có lịch tiêm trong tháng
CREATE OR ALTER PROCEDURE sp_Tinh_Doanh_Thu_CT_theo_nam
	@nam INT
AS
BEGIN
	SELECT SUM(TongTien) FROM HOADON
	WHERE YEAR(NgayLap) = @nam
END
GO

--6 Kịch bản: Tính doanh thu chi nhánh / toàn công ty
CREATE OR ALTER PROCEDURE sp_Tinh_Doanh_Thu_CT_theo_thang
	@thang INT,
	@nam INT
AS
BEGIN
	SELECT SUM(TongTien) FROM HOADON
	WHERE MONTH(NgayLap) = @thang AND YEAR(NgayLap) = @nam
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
		SELECT * FROM HOADON HD1
		JOIN SUDUNGDICHVU SDDV ON HD1.MaHD = SDDV.MaHD
		WHERE HD1.MaTKKH = KH.MaTKKH AND HD1.NgayLap >= DATEADD(MONTH, -3, GETDATE())
	)
END
GO

