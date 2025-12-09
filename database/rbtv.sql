USE PETCAREDB
GO

-- 1. Cập nhật Tổng Tiền Hóa Đơn (RBTV 2.1 & 2.11)
-- Cập nhật HOADON.TongTien bằng tổng SUDUNGDICHVU.TongTienDV trừ đi KhuyenMai. 
-- Đồng thời kiểm tra TongTien > 0.SQL
-- Cập nhật tổng tiền hóa đơn
CREATE OR ALTER PROCEDURE sp_CapNhatTongTienHD (@MaHD CHAR(8))
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @TongTienDichVu DECIMAL(19, 2);
    DECLARE @KhuyenMai DECIMAL(19, 2);
    DECLARE @TongTienMoi DECIMAL(19, 2);

    -- 1. Tính tổng tiền các dịch vụ
    SELECT @TongTienDichVu = ISNULL(SUM(TongTienDV), 0)
    FROM SUDUNGDICHVU
    WHERE MaHD = @MaHD;

    -- 2. Lấy khuyến mãi
    SELECT @KhuyenMai = ISNULL(KhuyenMai, 0)
    FROM HOADON
    WHERE MaHD = @MaHD;

    SET @TongTienMoi = @TongTienDichVu - @KhuyenMai;

    -- RBTV 2.11: Tổng tiền trong hóa đơn phải luôn lớn hơn 0
    IF @TongTienMoi < 0
    BEGIN
        -- Giả sử khuyến mãi không thể làm tổng tiền âm
        RAISERROR(N'Lỗi: Tổng tiền hóa đơn không được phép nhỏ hơn 0. (Tổng dịch vụ - Khuyến mãi < 0)', 16, 1);
        RETURN;
    END
    
    -- 3. Cập nhật TongTien
    UPDATE HOADON
    SET TongTien = @TongTienMoi
    WHERE MaHD = @MaHD;
END
GO

--2. Cập nhật Tổng Tiền Dịch Vụ Khám Bệnh (RBTV 2.2)
--Tính TongTienDV của dịch vụ khám bệnh dựa trên chi tiết toa thuốc
-- Cập nhật tổng tiền dịch vụ khám bệnh
CREATE OR ALTER PROCEDURE sp_CapNhatTongTienDVKhamBenh (@MaSDDV CHAR(10))
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @TongTienToaThuoc DECIMAL(19, 2);

    -- 1. Tính tổng tiền toa thuốc: SUM(SoLuong * Gia)
    SELECT @TongTienToaThuoc = ISNULL(SUM(C.SoLuong * S.Gia), 0)
    FROM CHITIETTOATHUOC C
    JOIN SANPHAM S ON C.MaSP = S.MaSP
    WHERE C.MaSDDV = @MaSDDV;

    -- 2. Cập nhật TongTienDV
    UPDATE SUDUNGDICHVU
    SET TongTienDV = @TongTienToaThuoc
    WHERE MaSDDV = @MaSDDV AND LoaiDV = 'KB';

    -- 3. Cập nhật lại hóa đơn liên quan (gọi RBTV 2.1)
    DECLARE @MaHD CHAR(8);
    SELECT @MaHD = MaHD FROM SUDUNGDICHVU WHERE MaSDDV = @MaSDDV;
    EXEC sp_CapNhatTongTienHD @MaHD;
END
GO

-- 3. Cập nhật Tổng Tiền Dịch Vụ Tiêm Phòng (RBTV 2.3)
-- Tính TongTienDV của tiêm phòng dựa trên vaccine đơn lẻ hoặc bằng 0 nếu đã đăng ký gói tiêm
-- Cập nhật tổng tiền dịch vụ tiêm phòng
CREATE OR ALTER PROCEDURE sp_CapNhatTongTienDVTiengPhong (@MaSDDV CHAR(10))
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @MaDK CHAR(8);
    DECLARE @TongTien DECIMAL(19, 2) = 0.00;

    -- 1. Kiểm tra có thuộc gói tiêm không
    SELECT @MaDK = MaDK
    FROM CHITIETTIEMPHONG
    WHERE MaSDDV = @MaSDDV;

    IF @MaDK IS NOT NULL -- Thuộc gói tiêm đã đăng ký
    BEGIN
        -- Tiêm phòng trong gói thường có giá 0 vì đã được trả trong GOITIEM.
        SET @TongTien = 0.00; 
    END
    ELSE -- Tiêm phòng đơn lẻ
    BEGIN
        -- Tính tổng tiền vaccine: SUM(LieuLuong * Gia)
        SELECT @TongTien = ISNULL(SUM(C.LieuLuong * S.Gia), 0)
        FROM CHITIETTIEMPHONG C
        JOIN SANPHAM S ON C.MaSP = S.MaSP
        WHERE C.MaSDDV = @MaSDDV;
    END

    -- 2. Cập nhật TongTienDV
    UPDATE SUDUNGDICHVU
    SET TongTienDV = @TongTien
    WHERE MaSDDV = @MaSDDV AND LoaiDV = 'TP';

    -- 3. Cập nhật lại hóa đơn liên quan
    DECLARE @MaHD CHAR(8);
    SELECT @MaHD = MaHD FROM SUDUNGDICHVU WHERE MaSDDV = @MaSDDV;
    EXEC sp_CapNhatTongTienHD @MaHD;
END
GO
--4. Cập nhật Tổng Tiền Dịch Vụ Mua Hàng (RBTV 2.4)
--Tính TongTienDV của mua hàng dựa trên chi tiết mua hàng
CREATE OR ALTER PROCEDURE sp_CapNhatTongTienDV_MuaHang (@MaSDDV CHAR(10))
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @TongTienMuaHang DECIMAL(19, 2);

    -- 1. Tính tổng tiền mua hàng: SUM(SoLuong * Gia)
    SELECT @TongTienMuaHang = ISNULL(SUM(C.SoLuong * S.Gia), 0)
    FROM CHITIETMUAHANG C
    JOIN SANPHAM S ON C.MaSP = S.MaSP
    WHERE C.MaSDDV = @MaSDDV;

    -- 2. Cập nhật TongTienDV
    UPDATE SUDUNGDICHVU
    SET TongTienDV = @TongTienMuaHang
    WHERE MaSDDV = @MaSDDV AND LoaiDV = 'MH';

    -- 3. Cập nhật lại hóa đơn liên quan
    DECLARE @MaHD CHAR(8);
    SELECT @MaHD = MaHD FROM SUDUNGDICHVU WHERE MaSDDV = @MaSDDV;
    EXEC sp_CapNhatTongTienHD @MaHD;
END
GO
-- 5. Kiểm tra Giá Gói Tiêm (RBTV 2.5)
-- Kiểm tra khi thêm/sửa GOITIEM xem TongTienGoi có nhỏ hơn tổng giá vaccine trong gói không.
-- Thêm/Sửa Gói Tiêm (kèm kiểm tra RBTV 2.5)
CREATE OR ALTER PROCEDURE sp_ThemSuaGoiTiem (
    @MaGoi CHAR(5),
    @TenGoi NVARCHAR(50),
    @ThoiHan NVARCHAR(20),
    @MucUuDai DECIMAL(4,2),
    @TongTienGoi DECIMAL(19,2)
    -- Giả định có các tham số cho việc thêm chi tiết gói
)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @TongGiaVaccine DECIMAL(19, 2);

    -- Tính tổng giá vaccine có trong gói (Giả định CHITIETGOITIEM đã được thêm)
    -- Nếu SP này dùng để thêm GOITIEM trước, RBTV này nên được kiểm tra sau khi thêm CHITIETGOITIEM
    -- Ta giả định gói đã có chi tiết
    SELECT @TongGiaVaccine = ISNULL(SUM(C.LieuLuong * S.Gia), 0)
    FROM CHITIETGOITIEM C
    JOIN SANPHAM S ON C.MaSP = S.MaSP
    WHERE C.MaGoi = @MaGoi;

    -- RBTV 2.5: Số tiền của gói tiêm phải bé hơn hoặc bằng tổng vaccine có trong gói tiêm đó
    IF @TongTienGoi > @TongGiaVaccine
    BEGIN
        RAISERROR(N'Lỗi RBTV 2.5: Tổng tiền gói phải bé hơn hoặc bằng tổng giá vaccine trong gói.', 16, 1)
        RETURN;
    END

    -- Cập nhật/Thêm GOITIEM
    IF EXISTS (SELECT 1 FROM GOITIEM WHERE MaGoi = @MaGoi)
    BEGIN
        UPDATE GOITIEM
        SET TenGoi = @TenGoi, ThoiHan = @ThoiHan, MucUuDai = @MucUuDai, TongTienGoi = @TongTienGoi
        WHERE MaGoi = @MaGoi;
    END
    ELSE
    BEGIN
        INSERT INTO GOITIEM (MaGoi, TenGoi, ThoiHan, MucUuDai, TongTienGoi)
        VALUES (@MaGoi, @TenGoi, @ThoiHan, @MucUuDai, @TongTienGoi);
    END
END
GO
-- 6. Kiểm tra Lịch Sử Làm Việc (RBTV 2.6 & 2.15)
-- Kiểm tra khi thêm/sửa LICHSULAMVIEC.SQL
-- Thêm Lịch Sử Làm Việc (kèm kiểm tra RBTV 2.6 và 2.15)
CREATE OR ALTER PROCEDURE sp_ThemLichSuLamViec (
    @MaTKNV CHAR(8),
    @MaCN CHAR(5),
    @NgayBatDau DATE,
    @NgayKetThuc DATE
)
AS
BEGIN
    SET NOCOUNT ON;

    -- RBTV 2.15: Ngày kết thúc không được nhỏ hơn ngày bắt đầu
    IF @NgayKetThuc IS NOT NULL AND @NgayKetThuc < @NgayBatDau
    BEGIN
        RAISERROR(N'Lỗi RBTV 2.15: Ngày kết thúc không được nhỏ hơn ngày bắt đầu.', 16, 1);
        RETURN;
    END

    -- RBTV 2.6: Nhân viên chỉ làm việc tại một chi nhánh tại một thời điểm
    -- Kiểm tra xem có bất kỳ khoảng thời gian nào trùng lặp với chi nhánh khác không
    IF EXISTS (
        SELECT 1
        FROM LICHSULAMVIEC
        WHERE MaTKNV = @MaTKNV
          AND MaCN <> @MaCN
          -- Kiểm tra sự trùng lặp: NgayBatDau mới nằm trong khoảng cũ HOẶC NgayKetThuc mới nằm trong khoảng cũ 
          -- HOẶC Khoảng mới chứa hoàn toàn khoảng cũ
          AND NgayBatDau <= @NgayKetThuc 
          AND (NgayKetThuc IS NULL OR NgayKetThuc >= @NgayBatDau)
    )
    BEGIN
        RAISERROR(N'Lỗi RBTV 2.6: Nhân viên đang có lịch sử làm việc trùng lặp thời gian ở chi nhánh khác.', 16, 1);
        RETURN;
    END

    -- Thêm dữ liệu
    INSERT INTO LICHSULAMVIEC (MaTKNV, MaCN, NgayBatDau, NgayKetThuc)
    VALUES (@MaTKNV, @MaCN, @NgayBatDau, @NgayKetThuc);
END
GO
-- 7. Kiểm tra Chức Vụ khi Thao Tác (RBTV 2.7, 2.8, 2.9)
-- RBTV 2.7: Chỉ có bác sĩ thú ý mới có thể khám bệnh
-- Thêm Khám Bệnh (kèm kiểm tra RBTV 2.7)
CREATE OR ALTER PROCEDURE sp_ThemKhamBenh_RBTV2_7 (
    @MaSDDV CHAR(10),
    @MaTC CHAR(8),
    @MaBS CHAR(8), -- Nhân viên thực hiện khám bệnh
    @TrieuChung NVARCHAR(100),
    @ChuanDoan NVARCHAR(100),
    @NgayTaiKham DATE
)
AS
BEGIN
    SET NOCOUNT ON;

    -- RBTV 2.7: Chỉ có BSTY mới được khám bệnh
    IF (SELECT ChucVu FROM NHANVIEN WHERE MaTKNV = @MaBS) <> 'BSTY'
    BEGIN
        RAISERROR(N'Lỗi RBTV 2.7: Nhân viên có mã %s không phải là Bác sĩ thú y.', 16, 1, @MaBS);
        RETURN;
    END

    -- Thêm vào KHAMBENH
    INSERT INTO KHAMBENH (MaSDDV, TrieuChung, ChuanDoan, NgayTaiKham, MaTC, MaBS)
    VALUES (@MaSDDV, @TrieuChung, @ChuanDoan, @NgayTaiKham, @MaTC, @MaBS);
END
GO
-- RBTV 2.8 & 2.9: Chỉ có NVTT tạo hóa đơn & Chỉ có NVBH mua hàng
-- Thêm Hóa Đơn (kèm kiểm tra RBTV 2.8)
CREATE OR ALTER PROCEDURE sp_ThemHoaDon_RBTV2_8 (
    @MaHD CHAR(8),
    @MaCN CHAR(5),
    @MaTKKH CHAR(8),
    @MaTKNV CHAR(8), -- Nhân viên lập hóa đơn (phải là NVTT)
    @HinhThucThanhToan CHAR(2)
)
AS
BEGIN
    SET NOCOUNT ON;

    -- RBTV 2.8: Chỉ có NVTT (Nhân viên Tiếp Tân) mới có thể tạo ra hóa đơn
    IF (SELECT ChucVu FROM NHANVIEN WHERE MaTKNV = @MaTKNV) <> 'NVTT'
    BEGIN
        RAISERROR(N'Lỗi RBTV 2.8: Nhân viên có mã %s không phải là Nhân viên Tiếp Tân để tạo hóa đơn.', 16, 1, @MaTKNV);
        RETURN;
    END

    -- Thêm Hóa Đơn
    INSERT INTO HOADON (MaHD, MaCN, MaTKKH, MaTKNV, HinhThucThanhToan)
    VALUES (@MaHD, @MaCN, @MaTKKH, @MaTKNV, @HinhThucThanhToan);
END
GO

-- Thêm dịch vụ Mua Hàng (kèm kiểm tra RBTV 2.9)
CREATE OR ALTER PROCEDURE sp_ThemMuaHang_RBTV2_9 (
    @MaSDDV CHAR(10),
    @MaNVBH CHAR(8) -- Nhân viên thực hiện mua hàng (phải là NVBH)
)
AS
BEGIN
    SET NOCOUNT ON;

    -- RBTV 2.9: Chỉ có NVBH (Nhân viên Bán Hàng) mới có thể thực hiện mua hàng
    IF (SELECT ChucVu FROM NHANVIEN WHERE MaTKNV = @MaNVBH) <> 'NVBH'
    BEGIN
        RAISERROR(N'Lỗi RBTV 2.9: Nhân viên có mã %s không phải là Nhân viên Bán Hàng.', 16, 1, @MaNVBH);
        RETURN;
    END

    -- Thêm vào MUAHANG
    INSERT INTO MUAHANG (MaSDDV, MaNVBH)
    VALUES (@MaSDDV, @MaNVBH);
END
GO

--8. Kiểm tra Đăng Ký Gói Tiêm (RBTV 2.16)
--Kiểm tra khi thêm/sửa DANGKYGOITIEM
CREATE OR ALTER PROCEDURE sp_ThemDangKyGoiTiem_RBTV2_16 (
    @MaDK CHAR(8),
    @NgayBatDau DATE,
    @MaGoi CHAR(5),
    @MaTC CHAR(8)
)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @NgayDK DATE = GETDATE(); -- Ngày đăng ký mặc định là ngày hiện tại

    -- RBTV 2.16: Ngày bắt đầu không được nhỏ hơn ngày đăng ký
    IF @NgayBatDau < @NgayDK
    BEGIN
        RAISERROR(N'Lỗi RBTV 2.16: Ngày bắt đầu không được nhỏ hơn ngày đăng ký.', 16, 1);
        RETURN;
    END

    -- Thêm dữ liệu
    INSERT INTO DANGKYGOITIEM (MaDK, NgayDK, NgayBatDau, MaGoi, MaTC)
    VALUES (@MaDK, @NgayDK, @NgayBatDau, @MaGoi, @MaTC);
END
GO

-- 9. Cập nhật Tổng Chi Tiêu Năm (RBTV 2.18)
-- Cập nhật KHACHHANG.TongChiTieuNam dựa trên các hóa đơn đã lập trong năm hiện tại.SQL
-- Cập nhật Tổng Chi Tiêu Năm của Khách hàng
CREATE OR ALTER PROCEDURE sp_CapNhatTongChiTieuNam (@MaTKKH CHAR(8), @Nam INT = NULL)
AS
BEGIN
    SET NOCOUNT ON;

    IF @Nam IS NULL
    BEGIN
        SET @Nam = YEAR(GETDATE());
    END

    DECLARE @TongChiTieu DECIMAL(19, 2);

    -- 1. Tính tổng chi tiêu của khách hàng trong năm
    SELECT @TongChiTieu = ISNULL(SUM(TongTien), 0)
    FROM HOADON
    WHERE MaTKKH = @MaTKKH
      AND YEAR(NgayLap) = @Nam;

    -- 2. Cập nhật Tổng Chi Tiêu Năm
    UPDATE KHACHHANG
    SET TongChiTieuNam = @TongChiTieu
    WHERE MaTKKH = @MaTKKH;
END
GO