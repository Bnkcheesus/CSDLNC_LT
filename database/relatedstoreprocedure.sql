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