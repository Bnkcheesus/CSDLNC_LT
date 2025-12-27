USE PETCAREDB
GO

EXEC sp_TraCuuLichSuHoaDonKH 'KH001728'
GO

EXEC sp_TraCuuDanhSachThuCungKH 'KH001728'
GO





EXEC sp_Tim_Vac_Xin_Su_Dung_Nhieu_Nhat_Trong_Nam 2023
GO

EXEC sp_Tim_Thu_Cung_TP 12, 2023
GO

EXEC sp_Tim_Thu_Cung_KB 3, 2020
GO

EXEC sp_Tinh_Doanh_Thu_CT_theo_nam 2017
GO

EXEC sp_Tinh_Doanh_Thu_CT_theo_tung_thang_trong_nam 2022
GO

EXEC sp_Tinh_Doanh_Thu_Tung_CN_theo_nam 2022
GO

EXEC sp_Tim_KH_Khong_SDDV_3_Thang
GO


 