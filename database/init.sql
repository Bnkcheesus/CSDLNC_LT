CREATE DATABASE PETCAREDB
GO

USE PETCAREDB
GO

CREATE TABLE TAIKHOAN (
	MaTK		CHAR(8)			PRIMARY KEY,
	Password	NVARCHAR(100),
	LoaiTK		NVARCHAR(4)		CHECK (LoaiTK IN ('NV', 'KH'))
)

CREATE TABLE NHANVIEN (
	MaTKNV			CHAR(8)			PRIMARY KEY,
	HoTen			NVARCHAR(100),
	GioiTinh		NVARCHAR(3)		CHECK (GioiTinh IN (N'Nam', N'Nữ')),
	NgaySinh		DATE,
	NgayVaoLam		DATE,
	ChucVu			VARCHAR(4)		CHECK (ChucVu IN ('QLCN', 'NVTT', 'NVBH', 'BSTY')),
	LuongCoBan		DECIMAL(19,2),
	FOREIGN KEY (MaTKNV) REFERENCES TAIKHOAN(MaTK)
)

CREATE TABLE KHACHHANG (
	MaTKKH			CHAR(8)			PRIMARY KEY,
	HoTen			NVARCHAR(100),
	SDT				CHAR(10),
	Email			NVARCHAR(100),
	CCCD			CHAR(12),
	GioiTinh		NVARCHAR(3)		CHECK (GioiTinh IN (N'Nam', N'Nữ')),
	NgaySinh		DATE,
	TongChiTieuNam	DECIMAL(19,2)	DEFAULT 0.00,
	DiemTichLuy		INT				DEFAULT 0,
	LoaiThanhVien	VARCHAR(3)		DEFAULT 'CB'	CHECK (LoaiThanhVien IN ('CB', 'TT', 'VIP')),
	FOREIGN KEY (MaTKKH) REFERENCES TAIKHOAN(MaTK)
)

CREATE TABLE THUCUNG (
	MaTC				CHAR(8)			PRIMARY KEY,
	TenTC				NVARCHAR(50),
	Loai				NVARCHAR(50),
	Giong				NVARCHAR(50),
	NgaySinh			DATE,
	GioiTinh			NVARCHAR(3),
	TinhTrangSucKhoe	NVARCHAR(50),
	MATKKH				CHAR(8)			FOREIGN KEY REFERENCES KHACHHANG(MaTKKH)
)

CREATE TABLE CHINHANH (
	MaCN			CHAR(5)			PRIMARY KEY,
	TenCN			NVARCHAR(50),
	DiaChi			NVARCHAR(100),
	SDT				CHAR(10),
	ThoiGianMoCua	TIME,
	ThoiGianDongCua	TIME
)

CREATE TABLE LICHSULAMVIEC (
	MaTKNV			CHAR(8),
	MaCN			CHAR(5),
	NgayBatDau		DATE,
	NgayKetThuc		DATE
	PRIMARY KEY (MaTKNV, MaCN, NgayBatDau),
	FOREIGN KEY (MaTKNV) REFERENCES NHANVIEN(MaTKNV),
	FOREIGN KEY (MaCN) REFERENCES CHINHANH(MaCN)
)

CREATE TABLE HOADON (
	MaHD				CHAR(8)			PRIMARY KEY,
	NgayLap				DATE			DEFAULT GETDATE(),
	TongTien			DECIMAL(19,2)	DEFAULT 0,
	KhuyenMai			DECIMAL(19,2)	DEFAULT 0.00,
	HinhThucThanhToan	CHAR(2)			CHECK (HinhThucThanhToan IN ('TM', 'CK')),
	MaCN				CHAR(5)			FOREIGN KEY REFERENCES CHINHANH(MaCN),
	MaTKKH				CHAR(8)			FOREIGN KEY REFERENCES KHACHHANG(MaTKKH),
	MaTKNV				CHAR(8)			FOREIGN KEY REFERENCES NHANVIEN(MaTKNV)
)

CREATE TABLE SUDUNGDICHVU (
	MaSDDV		CHAR(10)		PRIMARY KEY,
	LoaiDV		CHAR(2)			CHECK (LoaiDV IN ('KB', 'TP', 'MH')),
	TongTienDV	DECIMAL(19,2)	DEFAULT 0.00,
	MaHD		CHAR(8)			FOREIGN KEY REFERENCES HOADON(MaHD)
)

CREATE TABLE DANHGIA (
	MaSDDV			CHAR(10)		PRIMARY KEY,
	Diem			INT				CHECK (Diem BETWEEN 1 AND 5),
	ThaiDoNhanVien	INT				CHECK (ThaiDoNhanVien BETWEEN 1 AND 5),
	MucDoHaiLong	INT				CHECK (MucDoHaiLong BETWEEN 1 AND 5),
	BinhLuan		NVARCHAR(100),
	FOREIGN KEY (MaSDDV) REFERENCES SUDUNGDICHVU(MaSDDV)
)

CREATE TABLE KHAMBENH (
	MaSDDV		CHAR(10)		PRIMARY KEY,
	TrieuChung	NVARCHAR(100),
	CHuanDoan	NVARCHAR(100),
	NgayTaiKham	DATE,
	MaTC		CHAR(8)			FOREIGN KEY REFERENCES THUCUNG(MaTC),
	MaBS		CHAR(8)			FOREIGN KEY REFERENCES NHANVIEN(MaTKNV),
	FOREIGN KEY (MaSDDV) REFERENCES SUDUNGDICHVU(MaSDDV)
)

CREATE TABLE TIEMPHONG (
	MaSDDV	CHAR(10)	PRIMARY KEY,
	MaTC	CHAR(8)		FOREIGN KEY REFERENCES THUCUNG(MaTC),
	MaBS	CHAR(8)		FOREIGN KEY REFERENCES NHANVIEN(MaTKNV),
	FOREIGN KEY (MaSDDV) REFERENCES SUDUNGDICHVU(MaSDDV)
)

CREATE TABLE SANPHAM (
	MaSP	CHAR(8)			PRIMARY KEY,
	TenSP	NVARCHAR(50),
	LoaiSP	NVARCHAR(7)		CHECK (LoaiSP IN (N'Thuốc', N'Vaccine', N'Bán lẻ')),
	Gia		DECIMAL(19,2)
)

CREATE TABLE LOSANPHAM (
	MaLo			CHAR(8)		PRIMARY KEY,
	SoLuongDat		INT,
	SoLuongTonKho	INT,
	NgaySanXuat		DATE,
	HanSuDung		DATE,
	MaSP			CHAR(8)		FOREIGN KEY REFERENCES SANPHAM(MaSP),
	MaCN			CHAR(5)		FOREIGN KEY REFERENCES CHINHANH(MaCN)
)

CREATE TABLE MUAHANG (
	MaSDDV	CHAR(10)	PRIMARY KEY,
	MaNVBH	CHAR(8)		FOREIGN KEY REFERENCES NHANVIEN(MaTKNV),
	FOREIGN KEY (MaSDDV) REFERENCES SUDUNGDICHVU(MaSDDV)
)

CREATE TABLE CHITIETTOATHUOC (
	MaSP		CHAR(8),
	MaSDDV		CHAR(10),
	SoLuong		INT,
	LieuLuong	NVARCHAR(50),
	CachDung	NVARCHAR(50),
	PRIMARY KEY (MaSP, MaSDDV),
	FOREIGN KEY (MaSP) REFERENCES SANPHAM(MaSP),
	FOREIGN KEY (MaSDDV) REFERENCES KHAMBENH(MaSDDV)
)

CREATE TABLE CHITIETMUAHHANG (
	MaSP		CHAR(8),
	MaSDDV		CHAR(10),
	SoLuong		INT,
	PRIMARY KEY (MaSP, MaSDDV),
	FOREIGN KEY (MaSP) REFERENCES SANPHAM(MaSP),
	FOREIGN KEY (MaSDDV) REFERENCES SUDUNGDICHVU(MaSDDV),
)

CREATE TABLE GOITIEM (
	MaGoi		CHAR(5)		PRIMARY KEY,
	TenGoi		NVARCHAR(50),
	ThoiHan		NVARCHAR(20),
	MucUuDai	DECIMAL(4,2),
	TongTienGoi	DECIMAL(19,2)
)

CREATE TABLE CHITIETGOITIEM (
	MaSP		CHAR(8),
	MaGoi		CHAR(5),
	ThoiGian	NVARCHAR(20),
	LieuLuong	INT,
	PRIMARY KEY (MaSP, MaGoi, ThoiGian),
	FOREIGN KEY (MaSP) REFERENCES SANPHAM(MaSP),
	FOREIGN KEY (MaGoi) REFERENCES GOITIEM(MaGoi)
)

CREATE TABLE DANGKYGOITIEM (
	MaDK		CHAR(8)		PRIMARY KEY,
	NgayDK		DATE		DEFAULT GETDATE(),
	NgayBatDau	DATE,
	MaGoi		CHAR(5)		FOREIGN KEY REFERENCES GOITIEM(MaGoi),
	MaTC		CHAR(8)		FOREIGN KEY REFERENCES THUCUNG(MaTC)
)

CREATE TABLE CHITIETTIEMPHONG (
	MaSP		CHAR(8),
	MaSDDV		CHAR(10),
	LieuLuong	INT,
	MaDK		CHAR(8)		FOREIGN KEY REFERENCES DANGKYGOITIEM(MaDK) NULL,
	PRIMARY KEY (MaSP, MaSDDV),
	FOREIGN KEY (MaSP) REFERENCES SANPHAM(MaSP),
	FOREIGN KEY (MaSDDV) REFERENCES SUDUNGDICHVU(MaSDDV)
)

GO

------------------------------------------------------------
-- TAIKHOAN
------------------------------------------------------------
INSERT INTO TAIKHOAN VALUES
('TK000001', '123', N'NV'),
('TK000002', '123', N'NV'),
('TK000003', '123', N'NV'),
('TK100001', '123', N'KH'),
('TK100002', '123', N'KH');

------------------------------------------------------------
-- NHANVIEN
------------------------------------------------------------
INSERT INTO NHANVIEN VALUES
('TK000001', N'Nguyễn Văn A', N'Nam', '1990-05-10', '2020-01-01', 'QLCN', 15000000),
('TK000002', N'Trần Thị B', N'Nữ', '1995-03-12', '2021-06-15', 'BSTY', 12000000),
('TK000003', N'Lê Văn C', N'Nam', '1998-10-20', '2022-02-10', 'NVBH', 8000000);

------------------------------------------------------------
-- KHACHHANG
------------------------------------------------------------
INSERT INTO KHACHHANG VALUES
('TK100001', N'Phạm Minh D', '0912345678', 'd@gmail.com', '012345678912', N'Nam', '1999-09-09', 2000000, 20, 'TT'),
('TK100002', N'Hoàng Thị E', '0987654321', 'e@gmail.com', '098765432112', N'Nữ', '2000-02-20', 500000, 5, 'CB');

------------------------------------------------------------
-- THUCUNG
------------------------------------------------------------
INSERT INTO THUCUNG VALUES
('TC000001', N'Bông', N'Chó', N'Poodle', '2021-01-01', N'Đực', N'Khỏe mạnh', 'TK100001'),
('TC000002', N'Miu', N'Mèo', N'Anh lông ngắn', '2020-09-12', N'Cái', N'Viêm nhẹ', 'TK100002');

------------------------------------------------------------
-- CHINHANH
------------------------------------------------------------
INSERT INTO CHINHANH VALUES
('CN001', N'Chi nhánh Quận 1', N'123 Lê Lợi, Q1', '0281234567', '08:00', '21:00'),
('CN002', N'Chi nhánh Quận 7', N'45 Nguyễn Thị Thập, Q7', '0287654321', '08:00', '21:00');

------------------------------------------------------------
-- LICHSULAMVIEC
------------------------------------------------------------
INSERT INTO LICHSULAMVIEC VALUES
('TK000001', 'CN001', '2020-01-01', NULL),
('TK000002', 'CN001', '2021-06-15', NULL),
('TK000003', 'CN002', '2022-02-10', NULL);

------------------------------------------------------------
-- HOADON
------------------------------------------------------------
INSERT INTO HOADON VALUES
('HD000001', GETDATE(), 300000, 0, 'TM', 'CN001', 'TK100001', 'TK000002'),
('HD000002', GETDATE(), 150000, 0, 'CK', 'CN002', 'TK100002', 'TK000003');

------------------------------------------------------------
-- SUDUNGDICHVU
------------------------------------------------------------
INSERT INTO SUDUNGDICHVU VALUES
('SDDV000001', 'KB', 200000, 'HD000001'),
('SDDV000002', 'TP', 100000, 'HD000002'),
('SDDV000003', 'MH', 150000, 'HD000002');

------------------------------------------------------------
-- DANHGIA
------------------------------------------------------------
INSERT INTO DANHGIA VALUES
('SDDV000001', 5, 5, 5, N'Rất hài lòng'),
('SDDV000002', 4, 4, 4, N'Ổn'),
('SDDV000003', 3, 3, 3, N'Bình thường');

------------------------------------------------------------
-- KHAMBENH
------------------------------------------------------------
INSERT INTO KHAMBENH VALUES
('SDDV000001', N'Ho nhẹ', N'Viêm họng', '2025-01-10', 'TC000001', 'TK000002');

------------------------------------------------------------
-- TIEMPHONG
------------------------------------------------------------
INSERT INTO TIEMPHONG VALUES
('SDDV000002', 'TC000002', 'TK000002');

------------------------------------------------------------
-- SANPHAM
------------------------------------------------------------
INSERT INTO SANPHAM VALUES
('SP000001', N'Thuốc cảm chó mèo', N'Thuốc', 50000),
('SP000002', N'Vaccine dại', N'Vaccine', 120000),
('SP000003', N'Hạt thức ăn', N'Bán lẻ', 80000);

------------------------------------------------------------
-- LOSANPHAM
------------------------------------------------------------
INSERT INTO LOSANPHAM VALUES
('LO000001', 50, 40, '2024-01-01', '2026-01-01', 'SP000001', 'CN001'),
('LO000002', 100, 90, '2024-02-01', '2026-02-01', 'SP000002', 'CN001'),
('LO000003', 80, 75, '2024-03-01', '2025-03-01', 'SP000003', 'CN002');

------------------------------------------------------------
-- MUAHANG
------------------------------------------------------------
INSERT INTO MUAHANG VALUES
('SDDV000003', 'TK000003');

------------------------------------------------------------
-- CHITIETTOATHUOC
------------------------------------------------------------
INSERT INTO CHITIETTOATHUOC VALUES
('SP000001', 'SDDV000001', 2, N'1 viên/ngày', N'Uống sau ăn');

------------------------------------------------------------
-- CHITIETMUAHHANG
------------------------------------------------------------
INSERT INTO CHITIETMUAHHANG VALUES
('SP000003', 'SDDV000003', 1);

------------------------------------------------------------
-- GOITIEM
------------------------------------------------------------
INSERT INTO GOITIEM VALUES
('G0001', N'Gói Vaccine cơ bản', N'6 tháng', 0.10, 500000),
('G0002', N'Gói Vaccine nâng cao', N'1 năm', 0.15, 900000);

------------------------------------------------------------
-- CHITIETGOITIEM
------------------------------------------------------------
INSERT INTO CHITIETGOITIEM VALUES
('SP000002', 'G0001', N'Tháng 1', 1),
('SP000002', 'G0001', N'Tháng 6', 1),
('SP000002', 'G0002', N'Tháng 1', 1);

------------------------------------------------------------
-- DANGKYGOITIEM
------------------------------------------------------------
INSERT INTO DANGKYGOITIEM VALUES
('DK000001', GETDATE(), '2025-01-01', 'G0001', 'TC000001');

------------------------------------------------------------
-- CHITIETTIEMPHONG
------------------------------------------------------------
INSERT INTO CHITIETTIEMPHONG VALUES
('SP000002', 'SDDV000002', 1, 'DK000001');