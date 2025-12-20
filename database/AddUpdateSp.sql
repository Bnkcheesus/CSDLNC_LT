USE PETCAREDB
GO

-- 1. Cập nhật Tổng Tiền Hóa Đơn
CREATE OR ALTER PROCEDURE sp_CapNhatTongTienHD (@MaHD CHAR(8))
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @TongTienDichVu DECIMAL(19, 2);
    DECLARE @KhuyenMai DECIMAL(19, 2);
    DECLARE @TongTienMoi DECIMAL(19, 2);

    -- Tính tổng tiền các dịch vụ
    SELECT @TongTienDichVu = ISNULL(SUM(TongTienDV), 0)
    FROM SUDUNGDICHVU
    WHERE MaHD = @MaHD;

    -- Lấy khuyến mãi
    SELECT @KhuyenMai = ISNULL(KhuyenMai, 0)
    FROM HOADON
    WHERE MaHD = @MaHD;

    SET @TongTienMoi = @TongTienDichVu - @KhuyenMai;

    -- Tổng tiền trong hóa đơn phải luôn lớn hơn 0
    IF @TongTienMoi < 0
    BEGIN
        RAISERROR(N'Lỗi: Tổng tiền hóa đơn không được phép nhỏ hơn 0. (Tổng dịch vụ - Khuyến mãi < 0)', 16, 1);
        RETURN;
    END
    
    -- Cập nhật TongTien
    UPDATE HOADON
    SET TongTien = @TongTienMoi
    WHERE MaHD = @MaHD;
END
GO

--2. Cập nhật Tổng Tiền Dịch Vụ Khám Bệnh
CREATE OR ALTER PROCEDURE sp_CapNhatTongTienDVKhamBenh (@MaSDDV CHAR(10))
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @TongTienToaThuoc DECIMAL(19, 2);

    -- Tính tổng tiền toa thuốc: SUM(SoLuong * Gia)
    SELECT @TongTienToaThuoc = ISNULL(SUM(C.SoLuong * S.Gia), 0)
    FROM CHITIETTOATHUOC C
    JOIN SANPHAM S ON C.MaSP = S.MaSP
    WHERE C.MaSDDV = @MaSDDV;

    -- Cập nhật TongTienDV
    UPDATE SUDUNGDICHVU
    SET TongTienDV = @TongTienToaThuoc
    WHERE MaSDDV = @MaSDDV AND LoaiDV = 'KB';

    -- Cập nhật lại hóa đơn liên quan
    DECLARE @MaHD CHAR(8);
    SELECT @MaHD = MaHD FROM SUDUNGDICHVU WHERE MaSDDV = @MaSDDV;
    EXEC sp_CapNhatTongTienHD @MaHD;
END
GO

-- 3. Cập nhật Tổng Tiền Dịch Vụ Tiêm Phòng
CREATE OR ALTER PROCEDURE sp_CapNhatTongTienDVTiengPhong (@MaSDDV CHAR(10))
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @MaDK CHAR(8);
    DECLARE @TongTien DECIMAL(19, 2) = 0.00;

    -- Kiểm tra có thuộc gói tiêm không
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

    -- Cập nhật TongTienDV
    UPDATE SUDUNGDICHVU
    SET TongTienDV = @TongTien
    WHERE MaSDDV = @MaSDDV AND LoaiDV = 'TP';

    -- Cập nhật lại hóa đơn liên quan
    DECLARE @MaHD CHAR(8);
    SELECT @MaHD = MaHD FROM SUDUNGDICHVU WHERE MaSDDV = @MaSDDV;
    EXEC sp_CapNhatTongTienHD @MaHD;
END
GO

-- 4. Cập nhật Tổng Tiền Dịch Vụ Mua Hàng
CREATE OR ALTER PROCEDURE sp_CapNhatTongTienDV_MuaHang (@MaSDDV CHAR(10))
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @TongTienMuaHang DECIMAL(19, 2);

    -- Tính tổng tiền mua hàng: SUM(SoLuong * Gia)
    SELECT @TongTienMuaHang = ISNULL(SUM(C.SoLuong * S.Gia), 0)
    FROM CHITIETMUAHANG C
    JOIN SANPHAM S ON C.MaSP = S.MaSP
    WHERE C.MaSDDV = @MaSDDV;

    -- Cập nhật TongTienDV
    UPDATE SUDUNGDICHVU
    SET TongTienDV = @TongTienMuaHang
    WHERE MaSDDV = @MaSDDV AND LoaiDV = 'MH';

    -- Cập nhật lại hóa đơn liên quan
    DECLARE @MaHD CHAR(8);
    SELECT @MaHD = MaHD FROM SUDUNGDICHVU WHERE MaSDDV = @MaSDDV;
    EXEC sp_CapNhatTongTienHD @MaHD;
END
GO

-- 5. Kiểm tra Giá Gói Tiêm
CREATE OR ALTER PROCEDURE sp_ThemSuaGoiTiem (
    @MaGoi CHAR(5),
    @TenGoi NVARCHAR(50),
    @ThoiHan NVARCHAR(20),
    @MucUuDai DECIMAL(4,2),
    @TongTienGoi DECIMAL(19,2)
)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @TongGiaVaccine DECIMAL(19, 2);

    -- Kiểm tra CHITIETGOITIEM đã được thêm chưa
    IF NOT EXISTS (SELECT 1 FROM CHITIETGOITIEM WHERE MaGoi = @MaGoi)
    BEGIN
        RAISERROR(N'Lỗi: Gói tiêm phải có ít nhất một chi tiết gói tiêm.', 16, 1)
        RETURN;
    END

    -- Tính tổng giá vaccine có trong gói
    SELECT @TongGiaVaccine = ISNULL(SUM(C.LieuLuong * S.Gia), 0)
    FROM CHITIETGOITIEM C
    JOIN SANPHAM S ON C.MaSP = S.MaSP
    WHERE C.MaGoi = @MaGoi;

    -- Số tiền của gói tiêm phải bé hơn hoặc bằng tổng vaccine có trong gói tiêm đó
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

-- 6. Kiểm tra Lịch Sử Làm Việc
CREATE OR ALTER PROCEDURE sp_ThemLichSuLamViec (
    @MaTKNV CHAR(8),
    @MaCN CHAR(5),
    @NgayBatDau DATE,
    @NgayKetThuc DATE
)
AS
BEGIN
    SET NOCOUNT ON;

    -- Ngày kết thúc không được nhỏ hơn ngày bắt đầu
    IF @NgayKetThuc IS NOT NULL AND @NgayKetThuc < @NgayBatDau
    BEGIN
        RAISERROR(N'Lỗi RBTV 2.15: Ngày kết thúc không được nhỏ hơn ngày bắt đầu.', 16, 1);
        RETURN;
    END

    -- Nhân viên chỉ làm việc tại một chi nhánh tại một thời điểm
    IF EXISTS (
        SELECT 1
        FROM LICHSULAMVIEC
        WHERE MaTKNV = @MaTKNV
          AND MaCN <> @MaCN
          AND NgayBatDau <= @NgayKetThuc 
          AND (NgayKetThuc IS NULL OR NgayKetThuc >= @NgayBatDau)
    )
    BEGIN
        RAISERROR(N'Lỗi: Nhân viên đang có lịch sử làm việc trùng lặp thời gian ở chi nhánh khác.', 16, 1);
        RETURN;
    END

    -- Thêm dữ liệu
    INSERT INTO LICHSULAMVIEC (MaTKNV, MaCN, NgayBatDau, NgayKetThuc)
    VALUES (@MaTKNV, @MaCN, @NgayBatDau, @NgayKetThuc);
END
GO

-- 7. Thêm Khám Bệnh
CREATE OR ALTER PROCEDURE sp_ThemKhamBenh (
    @MaSDDV CHAR(10),
    @MaTC CHAR(8),
    @MaBS CHAR(8),
    @TrieuChung NVARCHAR(100),
    @ChuanDoan NVARCHAR(100),
    @NgayTaiKham DATE
)
AS
BEGIN
    SET NOCOUNT ON;

    -- Chỉ có BSTY mới được khám bệnh
    IF (SELECT ChucVu FROM NHANVIEN WHERE MaTKNV = @MaBS) <> 'BSTY'
    BEGIN
        RAISERROR(N'Lỗi RBTV 2.7: Nhân viên có mã %s không phải là Bác sĩ thú y.', 16, 1, @MaBS);
        RETURN;
    END

    -- Kiểm tra MaSDDV có thuộc hóa đơn nào không
    DECLARE @MaHD CHAR(8);
    SELECT @MaHD = MaHD FROM SUDUNGDICHVU WHERE MaSDDV = @MaSDDV;
    IF @MaHD IS NULL
    BEGIN
        RAISERROR(N'Lỗi: Dịch vụ không thuộc hóa đơn nào.', 16, 1);
        RETURN;
    END

    -- Kiểm tra hóa đơn có thuộc khách hàng không
    DECLARE @MaTKKH CHAR(8);
    SELECT @MaTKKH = MaTKKH FROM HOADON WHERE MaHD = @MaHD;
    IF @MaTKKH IS NULL
    BEGIN
        RAISERROR(N'Lỗi: Hóa đơn không thuộc khách hàng nào.', 16, 1);
        RETURN;
    END

    -- Kiểm tra thú cưng có thuộc khách hàng không
    DECLARE @MaThuCung CHAR(10);
    SELECT @MaThuCung = MaThuCung FROM SUDUNGDICHVU WHERE MaSDDV = @MaSDDV;
    IF @MaThuCung IS NULL
    BEGIN
        RAISERROR(N'Lỗi: Dịch vụ không thuộc thú cưng nào.', 16, 1);
        RETURN;
    END

    -- Kiểm tra thú cưng có thuộc khách hàng trong hóa đơn không
    DECLARE @MaKhachHang CHAR(8);
    SELECT @MaKhachHang = MaTKKH FROM THUCUNG WHERE MaThuCung = @MaThuCung;
    IF @MaKhachHang IS NULL
    BEGIN
        RAISERROR(N'Lỗi: Thú cưng không thuộc khách hàng nào.', 16, 1);
        RETURN;
    END

    -- So sánh khách hàng của thú cưng và khách hàng của hóa đơn
    IF @MaKhachHang <> @MaTKKH
    BEGIN
        RAISERROR(N'Lỗi: Thú cưng không thuộc khách hàng của hóa đơn.', 16, 1);
        RETURN;
    END

    -- Kiểm tra nhân viên có đang làm việc tại chi nhánh trên hoá đơn
    DECLARE @MaCN CHAR(5);
    SELECT @MaCN = MaCN FROM HOADON WHERE MaHD = @MaHD;
    IF NOT EXISTS (
        SELECT 1
        FROM LICHSULAMVIEC
        WHERE MaTKNV = @MaBS
          AND MaCN = @MaCN
          AND (NgayKetThuc IS NULL OR NgayKetThuc >= GETDATE())
    )
    BEGIN
        RAISERROR(N'Lỗi: Nhân viên %s không làm việc tại chi nhánh %s.', 16, 1, @MaBS, @MaCN);
        RETURN;
    END
    
    -- Thêm vào KHAMBENH
    INSERT INTO KHAMBENH (MaSDDV, TrieuChung, ChuanDoan, NgayTaiKham, MaTC, MaBS)
    VALUES (@MaSDDV, @TrieuChung, @ChuanDoan, @NgayTaiKham, @MaTC, @MaBS);
END
GO

-- 8. Thêm Tiêm Phòng
CREATE OR ALTER PROCEDURE sp_ThemTiemPhong (
    @MaSDDV CHAR(10),
    @MaTC CHAR(8),
    @MaBS CHAR(8),
    @NgayTiem DATE,
    @MaDK CHAR(8) = NULL
)
AS
BEGIN
    SET NOCOUNT ON;

    -- Chỉ có BSTY mới được tiêm phòng
    IF (SELECT ChucVu FROM NHANVIEN WHERE MaTKNV = @MaBS) <> 'BSTY'
    BEGIN
        RAISERROR(N'Lỗi RBTV 2.7: Nhân viên có mã %s không phải là Bác sĩ thú y.', 16, 1, @MaBS);
        RETURN;
    END

    -- Kiểm tra MaSDDV có thuộc hóa đơn nào không
    DECLARE @MaHD CHAR(8);
    SELECT @MaHD = MaHD FROM SUDUNGDICHVU WHERE MaSDDV = @MaSDDV;
    IF @MaHD IS NULL
    BEGIN
        RAISERROR(N'Lỗi: Dịch vụ không thuộc hóa đơn nào.', 16, 1);
        RETURN;
    END

    -- Kiểm tra hóa đơn có thuộc khách hàng không
    DECLARE @MaTKKH CHAR(8);
    SELECT @MaTKKH = MaTKKH FROM HOADON WHERE MaHD = @MaHD;
    IF @MaTKKH IS NULL
    BEGIN
        RAISERROR(N'Lỗi: Hóa đơn không thuộc khách hàng nào.', 16, 1);
        RETURN;
    END

    -- Kiểm tra thú cưng có thuộc khách hàng trong hóa đơn không
    DECLARE @MaThuCung CHAR(10);
    SELECT @MaThuCung = MaThuCung FROM SUDUNGDICHVU WHERE MaSDDV = @MaSDDV;
    IF @MaThuCung IS NULL
    BEGIN
        RAISERROR(N'Lỗi: Dịch vụ không thuộc thú cưng nào.', 16, 1);
        RETURN;
    END

    -- Kiểm tra thú cưng có thuộc khách hàng của hóa đơn không
    DECLARE @MaKhachHang CHAR(8);
    SELECT @MaKhachHang = MaTKKH FROM THUCUNG WHERE MaThuCung = @MaThuCung;
    IF @MaKhachHang IS NULL
    BEGIN
        RAISERROR(N'Lỗi: Thú cưng không thuộc khách hàng nào.', 16, 1);
        RETURN;
    END

    -- So sánh khách hàng của thú cưng và khách hàng của hóa đơn
    IF @MaKhachHang <> @MaTKKH
    BEGIN
        RAISERROR(N'Lỗi: Thú cưng không thuộc khách hàng của hóa đơn.', 16, 1);
        RETURN;
    END

    -- Kiểm tra nhân viên có đang làm việc tại chi nhánh trên hoá đơn
    DECLARE @MaCN CHAR(5);
    SELECT @MaCN = MaCN FROM HOADON WHERE MaHD = @MaHD;
    IF NOT EXISTS (
        SELECT 1
        FROM LICHSULAMVIEC
        WHERE MaTKNV = @MaBS
          AND MaCN = @MaCN
          AND (NgayKetThuc IS NULL OR NgayKetThuc >= GETDATE())
    )
    BEGIN
        RAISERROR(N'Lỗi: Nhân viên %s không làm việc tại chi nhánh %s.', 16, 1, @MaBS, @MaCN);
        RETURN;
    END

    -- Thêm vào TIEMPHONG
    INSERT INTO TIEMPHONG (MaSDDV, MaTC, MaBS, NgayTiem, MaDK)
    VALUES (@MaSDDV, @MaTC, @MaBS, @NgayTiem, @MaDK);
END
GO

-- 9. Thêm Hóa Đơn
CREATE OR ALTER PROCEDURE sp_ThemHoaDon (
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

-- 10. Thêm dịch vụ Mua Hàng (kèm kiểm tra RBTV 2.9)
CREATE OR ALTER PROCEDURE sp_ThemMuaHang(
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

    -- Kiểm tra MaSDDV có thuộc hóa đơn nào không
    DECLARE @MaHD CHAR(8);
    SELECT @MaHD = MaHD FROM SUDUNGDICHVU WHERE MaSDDV = @MaSDDV;

    IF @MaHD IS NULL
    BEGIN
        RAISERROR(N'Lỗi: Dịch vụ không thuộc hóa đơn nào.', 16, 1);
        RETURN;
    END

    DECLARE @MaTKKH CHAR(8);
    SELECT @MaTKKH = MaTKKH FROM HOADON WHERE MaHD = @MaHD;
    IF @MaTKKH IS NULL
    BEGIN
        RAISERROR(N'Lỗi: Hóa đơn không thuộc khách hàng nào.', 16, 1);
        RETURN;
    END

    -- Kiểm tra nhân viên có đang làm việc tại chi nhánh trên hoá đơn
    DECLARE @MaCN CHAR(5);
    SELECT @MaCN = MaCN FROM HOADON WHERE MaHD = @MaHD;
    IF NOT EXISTS (
        SELECT 1
        FROM LICHSULAMVIEC
        WHERE MaTKNV = @MaNVBH
          AND MaCN = @MaCN
          AND (NgayKetThuc IS NULL OR NgayKetThuc >= GETDATE())
    )
    BEGIN
        RAISERROR(N'Lỗi: Nhân viên %s không làm việc tại chi nhánh %s.', 16, 1, @MaNVBH, @MaCN);
        RETURN;
    END

    -- Thêm vào MUAHANG
    INSERT INTO MUAHANG (MaSDDV, MaNVBH)
    VALUES (@MaSDDV, @MaNVBH);
END
GO

-- 11. Thêm Đăng Ký Gói Tiêm (RBTV 2.16)
CREATE OR ALTER PROCEDURE sp_ThemDangKyGoiTiem (
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

-- 12. Thêm Chi Tiết Toa Thuốc (RBTV 2.10)
CREATE OR ALTER PROCEDURE sp_ThemChiTietToaThuoc (
    @MaSDDV CHAR(10),
    @MaSP CHAR(8),
    @SoLuong INT
)
AS
BEGIN
    SET NOCOUNT ON;

    -- Số lượng thuốc trong toa không được vượt quá số lượng tồn kho
    DECLARE @SoLuongTon INT;
    SELECT @SoLuongTon = SoLuongTon FROM SANPHAM WHERE MaSP = @MaSP;

    IF @SoLuong > @SoLuongTon
    BEGIN
        RAISERROR(N'Lỗi: Số lượng thuốc trong toa (%d) vượt quá số lượng tồn kho (%d).', 16, 1, @SoLuong, @SoLuongTon);
        RETURN;
    END

    -- Chỉ được thêm sản phẩm là thuốc
    DECLARE @LoaiSP NVARCHAR(20);
    SELECT @LoaiSP = LoaiSP FROM SANPHAM WHERE MaSP = @MaSP;
    IF @LoaiSP <> N'Thuốc'
    BEGIN
        RAISERROR(N'Lỗi: Sản phẩm có mã %s không phải là thuốc.', 16, 1, @MaSP);
        RETURN;
    END

    -- Thêm vào CHITIETTOATHUOC
    INSERT INTO CHITIETTOATHUOC (MaSP, MaSDDV, SoLuong)
    VALUES (@MaSP, @MaSDDV, @SoLuong);
END
GO

-- 13. Thêm Chi Tiết Tiêm Phòng
CREATE OR ALTER PROCEDURE sp_ThemChiTietTiemPhong (
    @MaSDDV CHAR(10),
    @MaSP CHAR(8),
    @LieuLuong INT,
    @MaDK CHAR(8) = NULL
)
AS
BEGIN
    SET NOCOUNT ON;

    -- Chỉ được thêm sản phẩm là vaccine
    DECLARE @LoaiSP NVARCHAR(20);
    SELECT @LoaiSP = LoaiSP FROM SANPHAM WHERE MaSP = @MaSP;
    IF @LoaiSP <> N'Vaccine'
    BEGIN
        RAISERROR(N'Lỗi: Sản phẩm có mã %s không phải là vaccine.', 16, 1, @MaSP);
        RETURN;
    END

    -- Thêm vào CHITIETTIEMPHONG
    INSERT INTO CHITIETTIEMPHONG (MaSP, MaSDDV, LieuLuong, MaDK)
    VALUES (@MaSP, @MaSDDV, @LieuLuong, @MaDK);
END
GO

-- 14. Thêm Chi Tiết Mua Hàng
CREATE OR ALTER PROCEDURE sp_ThemChiTietMuaHang (
    @MaSDDV CHAR(10),
    @MaSP CHAR(8),
    @SoLuong INT
)
AS
BEGIN
    SET NOCOUNT ON;

    -- Chỉ được thêm sản phẩm là thuốc hoặc bán lẻ
    DECLARE @LoaiSP NVARCHAR(20);
    SELECT @LoaiSP = LoaiSP FROM SANPHAM WHERE MaSP = @MaSP;
    IF @LoaiSP NOT IN (N'Thuốc', N'Bán lẻ')
    BEGIN
        RAISERROR(N'Lỗi: Sản phẩm có mã %s không phải là thuốc hoặc bán lẻ.', 16, 1, @MaSP);
        RETURN;
    END

    -- Thêm vào CHITIETMUAHANG
    INSERT INTO CHITIETMUAHANG (MaSP, MaSDDV, SoLuong)
    VALUES (@MaSP, @MaSDDV, @SoLuong);
END
GO

-- 15. Cập nhật Tổng Chi Tiêu Năm
CREATE OR ALTER PROCEDURE sp_CapNhatTongChiTieuNam (@MaTKKH CHAR(8), @Nam INT = NULL)
AS
BEGIN
    SET NOCOUNT ON;

    IF @Nam IS NULL
    BEGIN
        SET @Nam = YEAR(GETDATE());
    END

    DECLARE @TongChiTieu DECIMAL(19, 2);

    -- Tính tổng chi tiêu của khách hàng trong năm
    SELECT @TongChiTieu = ISNULL(SUM(TongTien), 0)
    FROM HOADON
    WHERE MaTKKH = @MaTKKH
      AND YEAR(NgayLap) = @Nam;

    -- Cập nhật Tổng Chi Tiêu Năm
    UPDATE KHACHHANG
    SET TongChiTieuNam = @TongChiTieu
    WHERE MaTKKH = @MaTKKH;
END
GO

-- 16. Đăng Ký Gói Tiêm
CREATE OR ALTER PROCEDURE sp_DangKyGoiTiem(
    @MaThuCung CHAR(8),
    @MaGoi CHAR(5),
    @NgayBatDau DATE
)
AS
BEGIN
    SET NOCOUNT ON;

    -- Kiểm tra dữ liệu đầu vào
    IF (@MaThuCung NOT IN (SELECT THUCUNG.MaTC FROM THUCUNG))
        RETURN
    IF (@MaGoi NOT IN (SELECT GOITIEM.MaGoi FROM GOITIEM))
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

    INSERT DANGKYGOITIEM VALUES (@newMaDK, GETDATE(), @NgayBatDau, @MaGoi, @MaThuCung)
    PRINT  N'Thêm đăng ký thành công. Mã DK = ' + @newMaDK;
END
GO