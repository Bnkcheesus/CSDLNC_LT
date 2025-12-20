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

    -- Thông báo thành công
    PRINT(N'Tổng tiền hóa đơn đã được cập nhật thành công. Mã HD = ' + @MaHD);
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
    
    -- Thông báo thành công
    PRINT(N'Tổng tiền dịch vụ khám bệnh đã được cập nhật thành công. Mã SDDV = ' + @MaSDDV);
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
        -- Tiêm phòng trong gói thường có giá 0 vì đã được trả trong GOITIEM
        SET @TongTien = 0.00; 
    END
    ELSE -- Tiêm phòng đơn lẻ
    BEGIN
        -- Tính tổng tiền vaccine
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
            
    -- Thông báo thành công
    PRINT(N'Tổng tiền dịch vụ tiêm phòng đã được cập nhật thành công. Mã SDDV = ' + @MaSDDV);
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

    -- Thong báo thành công
    PRINT(N'Tổng tiền dịch vụ mua hàng đã được cập nhật thành công. Mã SDDV = ' + @MaSDDV);
END
GO

-- 5. Thêm Gói Tiêm
CREATE OR ALTER PROCEDURE sp_ThemGoiTiem (
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

    -- Cập nhật/Thêm GOITIEM
    IF EXISTS (SELECT 1 FROM GOITIEM WHERE MaGoi = @MaGoi)
    BEGIN
        UPDATE GOITIEM
        SET TenGoi = @TenGoi, ThoiHan = @ThoiHan, MucUuDai = @MucUuDai, TongTienGoi = @TongTienGoi
        WHERE MaGoi = @MaGoi;
        PRINT(N'Cập nhật gói tiêm thành công. Mã Gói = ' + @MaGoi);
    END
    ELSE
    BEGIN
        INSERT INTO GOITIEM (MaGoi, TenGoi, ThoiHan, MucUuDai, TongTienGoi)
        VALUES (@MaGoi, @TenGoi, @ThoiHan, @MucUuDai, @TongTienGoi);
        PRINT(N'Thêm gói tiêm thành công. Mã Gói = ' + @MaGoi);
    END
END
GO

-- 6. Thêm Lịch Sử Làm Việc
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
        RAISERROR(N'Lỗi: Ngày kết thúc không được nhỏ hơn ngày bắt đầu.', 16, 1);
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

    -- Thông báo thành công
    PRINT(N'Thêm lịch sử làm việc thành công. Mã TKNV = ' + @MaTKNV + ', Mã CN = ' + @MaCN);
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

    -- Kiểm tra thú cưng có thuộc khách hàng trong hóa đơn không
    DECLARE @MaKhachHang CHAR(8);
    SELECT @MaKhachHang = MaTKKH FROM THUCUNG WHERE MaTC = @MaTC;
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
    PRINT(N'Thêm khám bệnh thành công. Mã SDDV = ' + @MaSDDV);
END
GO

-- 8. Thêm Tiêm Phòng
CREATE OR ALTER PROCEDURE sp_ThemTiemPhong (
    @MaSDDV CHAR(10),
    @MaTC CHAR(8),
    @MaBS CHAR(8)
)
AS
BEGIN
    SET NOCOUNT ON;

    -- Chỉ có BSTY mới được tiêm phòng
    IF (SELECT ChucVu FROM NHANVIEN WHERE MaTKNV = @MaBS) <> 'BSTY'
    BEGIN
        RAISERROR(N'Lỗi: Nhân viên có mã %s không phải là Bác sĩ thú y.', 16, 1, @MaBS);
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

    -- Kiểm tra thú cưng có thuộc khách hàng của hóa đơn không
    DECLARE @MaKhachHang CHAR(8);
    SELECT @MaKhachHang = MaTKKH FROM THUCUNG WHERE MaTC = @MaTC;
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
    INSERT INTO TIEMPHONG (MaSDDV, MaTC, MaBS) VALUES (@MaSDDV, @MaTC, @MaBS)
    PRINT(N'Thêm tiêm phòng thành công. Mã SDDV = ' + @MaSDDV);
END
GO

-- 9. Thêm Hóa Đơn
CREATE OR ALTER PROCEDURE sp_ThemHoaDon (
    @MaHD CHAR(8),
    @MaCN CHAR(5),
    @MaTKKH CHAR(8),
    @MaTKNV CHAR(8),
    @HinhThucThanhToan CHAR(2)
)
AS
BEGIN
    SET NOCOUNT ON;

    -- RBTV: Chỉ có NVTT (Nhân viên Tiếp Tân) mới có thể tạo ra hóa đơn
    IF (SELECT ChucVu FROM NHANVIEN WHERE MaTKNV = @MaTKNV) <> 'NVTT'
    BEGIN
        RAISERROR(N'Lỗi RBTV 2.8: Nhân viên có mã %s không phải là Nhân viên Tiếp Tân để tạo hóa đơn.', 16, 1, @MaTKNV);
        RETURN;
    END

    -- Thêm Hóa Đơn
    INSERT INTO HOADON (MaHD, MaCN, MaTKKH, MaTKNV, HinhThucThanhToan)
    VALUES (@MaHD, @MaCN, @MaTKKH, @MaTKNV, @HinhThucThanhToan);
    PRINT(N'Thêm hóa đơn thành công. Mã HD = ' + @MaHD);
END
GO

-- 10. Thêm Mua Hàng
CREATE OR ALTER PROCEDURE sp_ThemMuaHang(
    @MaSDDV CHAR(10),
    @MaNVBH CHAR(8)
)
AS
BEGIN
    SET NOCOUNT ON;

    -- Chỉ có NVBH (Nhân viên Bán Hàng) mới có thể thực hiện mua hàng
    IF (SELECT ChucVu FROM NHANVIEN WHERE MaTKNV = @MaNVBH) <> 'NVBH'
    BEGIN
        RAISERROR(N'Lỗi: Nhân viên có mã %s không phải là Nhân viên Bán Hàng.', 16, 1, @MaNVBH);
        RETURN;
    END

    -- Kiểm tra MaSDDV có thuộc hóa đơn nào không
    DECLARE @MaHD CHAR(8);
    SELECT @MaHD = MaHD FROM SUDUNGDICHVU WHERE MaSDDV = @MaSDDV;

    -- Nếu không có hóa đơn, thông báo lỗi
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
    PRINT(N'Thêm dịch vụ mua hàng thành công. Mã SDDV = ' + @MaSDDV);
END
GO

-- 11. Thêm Chi Tiết Toa Thuốc
CREATE OR ALTER PROCEDURE sp_ThemChiTietToaThuoc (
    @MaSDDV CHAR(10),
    @MaSP CHAR(8),
    @SoLuong INT
)
AS
BEGIN
    SET NOCOUNT ON;

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

    -- Cập nhật lại tổng tiền dịch vụ khám bệnh
    DECLARE @TongTienToaThuoc DECIMAL(19, 2);
    SELECT @TongTienToaThuoc = ISNULL(SUM(C.SoLuong * S.Gia), 0)
    FROM CHITIETTOATHUOC C
    JOIN SANPHAM S ON C.MaSP = S.MaSP
    WHERE C.MaSDDV = @MaSDDV;
    UPDATE SUDUNGDICHVU
    SET TongTienDV = @TongTienToaThuoc
    WHERE MaSDDV = @MaSDDV AND LoaiDV = 'KB';

    -- Cập nhật lại tổng tiền trong hóa đơn
    DECLARE @MaHD CHAR(8);
    SELECT @MaHD = MaHD FROM SUDUNGDICHVU WHERE MaSDDV = @MaSDDV;
    EXEC sp_CapNhatTongTienHD @MaHD;

    PRINT(N'Thêm chi tiết toa thuốc thành công. Mã SDDV = ' + @MaSDDV + ', Mã SP = ' + @MaSP);
END
GO

-- 12. Thêm Chi Tiết Tiêm Phòng
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

    -- Cập nhật lại tổng tiền dịch vụ tiêm phòng
    DECLARE @TongTienTiemPhong DECIMAL(19, 2);
    SELECT @TongTienTiemPhong = ISNULL(SUM(C.LieuLuong * S.Gia), 0)
    FROM CHITIETTIEMPHONG C
    JOIN SANPHAM S ON C.MaSP = S.MaSP
    WHERE C.MaSDDV = @MaSDDV;
    UPDATE SUDUNGDICHVU
    SET TongTienDV = @TongTienTiemPhong
    WHERE MaSDDV = @MaSDDV AND LoaiDV = 'TP';

    -- Cập nhật lại tổng tiền trong hóa đơn
    DECLARE @MaHD CHAR(8);
    SELECT @MaHD = MaHD FROM SUDUNGDICHVU WHERE MaSDDV = @MaSDDV;
    EXEC sp_CapNhatTongTienHD @MaHD;

    -- Thông báo thành công
    PRINT(N'Thêm chi tiết tiêm phòng thành công. Mã SDDV = ' + @MaSDDV + ', Mã SP = ' + @MaSP);
END
GO

-- 13. Thêm Chi Tiết Mua Hàng
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

    -- Cập nhật lại tổng tiền dịch vụ mua hàng
    DECLARE @TongTienMuaHang DECIMAL(19, 2);
    SELECT @TongTienMuaHang = ISNULL(SUM(C.SoLuong * S.Gia), 0)
    FROM CHITIETMUAHANG C
    JOIN SANPHAM S ON C.MaSP = S.MaSP
    WHERE C.MaSDDV = @MaSDDV;
    UPDATE SUDUNGDICHVU
    SET TongTienDV = @TongTienMuaHang
    WHERE MaSDDV = @MaSDDV AND LoaiDV = 'MH';

    -- Cập nhật lại tổng tiền trong hóa đơn
    DECLARE @MaHD CHAR(8);
    SELECT @MaHD = MaHD FROM SUDUNGDICHVU WHERE MaSDDV = @MaSDDV;
    EXEC sp_CapNhatTongTienHD @MaHD;

    -- Thông báo thành công
    PRINT(N'Thêm chi tiết mua hàng thành công. Mã SDDV = ' + @MaSDDV + ', Mã SP = ' + @MaSP);
END
GO

-- 14. Cập nhật Tổng Chi Tiêu Năm
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
    -- Thông báo thành công
    PRINT(N'Tổng chi tiêu năm của khách hàng đã được cập nhật thành công. Mã TK = ' + @MaTKKH + ', Năm = ' + CAST(@Nam AS NVARCHAR(4)));
END
GO

-- 15. Đăng Ký Gói Tiêm
CREATE OR ALTER PROCEDURE sp_DangKyGoiTiem(
    @MaTC CHAR(8),
    @MaGoi CHAR(5),
    @NgayBatDau DATE
)
AS
BEGIN
    SET NOCOUNT ON;

    -- Kiểm tra dữ liệu đầu vào
    IF (@MaTC NOT IN (SELECT THUCUNG.MaTC FROM THUCUNG))
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

    INSERT DANGKYGOITIEM VALUES (@newMaDK, GETDATE(), @NgayBatDau, @MaGoi, @MaTC)
    PRINT(N'Đăng ký gói tiêm thành công. Mã ĐK = ' + @newMaDK + ', Mã Gói = ' + @MaGoi + ', Mã TC = ' + @MaTC);
END
GO