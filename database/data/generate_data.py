import random
import os
from datetime import datetime, timedelta

# --- 1. CẤU HÌNH ---
NUM_CUSTOMERS = 20000
NUM_STAFF = 1000
NUM_TRANSACTIONS = 70000
NUM_PETS = 30000
NUM_BRANCHES = 10
NUM_PRODUCTS = 100

# Ngày bắt đầu tạo dữ liệu (01/01/2015)
START_DATE = datetime(2015, 1, 1)
END_DATE = datetime.now()

# --- 2. DỮ LIỆU MẪU ---
HOS = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Huỳnh", "Phan", "Vũ", "Võ", "Đặng", "Bùi", "Đỗ", "Hồ", "Ngô", "Dương", "Lý"]
LOTS = ["Thị", "Văn", "Minh", "Đức", "Thành", "Ngọc", "An", "Quốc", "Gia", "Hữu", "Xuân", "Thanh", "Mạnh", "Tuấn"]
TENS = ["Anh", "Bình", "Chi", "Dũng", "Em", "An", "Hạnh", "Khôi", "Linh", "My", "Nam", "Phúc", "Quang", "Sơn", "Thảo", "Uyên", "Vinh", "Yến", "Cường", "Trang"]

STREETS = ["Lê Lợi", "Nguyễn Huệ", "Cách Mạng Tháng 8", "Phan Chu Trinh", "Hai Bà Trưng", "Trần Hưng Đạo", "Lý Tự Trọng", "Điện Biên Phủ", "Nam Kỳ Khởi Nghĩa"]
WARDS = ["Phường 1", "Phường 2", "Phường Bến Thành", "Phường Đa Kao", "Phường Tân Định", "Phường 5", "Phường 7"]
DISTRICTS = ["Quận 1", "Quận 3", "Quận 5", "Quận 7", "Quận 10", "Quận Bình Thạnh", "Quận Phú Nhuận"]
CITIES = ["TP. Hồ Chí Minh", "Hà Nội", "Đà Nẵng", "Cần Thơ", "Hải Phòng"]

PET_NAMES = ["Lu", "Mina", "Kiki", "Bông", "Mực", "Milu", "Gấu", "Xuka", "Bốp", "Meo", "Tôm", "Jerry", "Mickey", "Đen", "Vàng"]
PET_TYPES = ["Chó", "Mèo", "Chim", "Thỏ", "Hamster"]

# Dữ liệu bình luận đánh giá
COMMENTS_POS = ["Dịch vụ rất tuyệt vời", "Bác sĩ tận tâm", "Sẽ quay lại lần sau", "Nhân viên nhiệt tình", "Cơ sở sạch sẽ", "Rất hài lòng", "Cảm ơn PetCare"]
COMMENTS_NEU = ["Tạm được", "Giá hơi cao", "Bình thường", "Chờ hơi lâu"]
COMMENTS_NEG = ["Thất vọng", "Thái độ nhân viên chưa tốt", "Không hài lòng"]

def get_name():
    return f"{random.choice(HOS)} {random.choice(LOTS)} {random.choice(TENS)}"

def get_address():
    return f"{random.randint(1, 999)} {random.choice(STREETS)}, {random.choice(WARDS)}, {random.choice(DISTRICTS)}, {random.choice(CITIES)}"

def get_random_date(start, end):
    """Sinh ngày ngẫu nhiên giữa start và end"""
    delta = end - start
    int_delta = (delta.days * 24 * 60 * 60) + delta.seconds
    random_second = random.randrange(int_delta)
    return (start + timedelta(seconds=random_second)).date()

def check_batch(f, count):
    if count % 50 == 0:
        f.write("GO\n")

# --- 3. KHỞI TẠO FILE ---
files_map = {
    "01_TAIKHOAN": None, "02_NHANVIEN": None, "03_KHACHHANG": None, "04_CHINHANH": None, 
    "05_LICHSULAMVIEC": None, "06_THUCUNG": None, "07_SANPHAM": None, "08_LOSANPHAM": None, 
    "09_GOITIEM": None, "10_CHITIETGOITIEM": None, "11_DANGKYGOITIEM": None, "12_HOADON": None, 
    "13_SUDUNGDICHVU": None, "14_KHAMBENH": None, "15_TIEMPHONG": None, "16_MUAHANG": None, 
    "17_CHITIETTOATHUOC": None, "18_CHITIETTIEMPHONG": None, "19_CHITIETMUAHANG": None, "20_DANHGIA": None
}

for name in files_map:
    files_map[name] = open(f"{name}.sql", "w", encoding="utf-8")
    files_map[name].write("USE PETCAREDB\nGO\n\n")

try:
    print("Đang tạo dữ liệu cơ bản...")

    # --- TAIKHOAN, NHANVIEN ---
    staff_data = [] 
    staff_ids = [f"NV{i:06d}" for i in range(1, NUM_STAFF + 1)]
    for i, tk_id in enumerate(staff_ids):
        role = random.choices(['NVTT', 'BSTY', 'NVBH', 'QLCN'], weights=[30, 40, 20, 10], k=1)[0]
        staff_data.append({'id': tk_id, 'role': role})
        files_map["01_TAIKHOAN"].write(f"INSERT INTO TAIKHOAN VALUES ('{tk_id}', '123456', 'NV')\n")
        files_map["02_NHANVIEN"].write(f"INSERT INTO NHANVIEN VALUES ('{tk_id}', N'{get_name()}', N'{random.choice(['Nam', 'Nữ'])}', '1995-01-01', '2015-01-01', '{role}', {random.randint(8, 20)*1000000})\n")
        check_batch(files_map["01_TAIKHOAN"], i+1)
        check_batch(files_map["02_NHANVIEN"], i+1)

    # --- KHACHHANG ---
    customer_ids = []
    for i in range(1, NUM_CUSTOMERS + 1):
        tk_id = f"KH{i:06d}"
        customer_ids.append(tk_id)
        files_map["01_TAIKHOAN"].write(f"INSERT INTO TAIKHOAN VALUES ('{tk_id}', '123456', 'KH')\n")
        files_map["03_KHACHHANG"].write(f"INSERT INTO KHACHHANG (MaTKKH, HoTen, SDT, GioiTinh, LoaiThanhVien) VALUES ('{tk_id}', N'{get_name()}', '090{random.randint(1000000,9999999)}', N'{random.choice(['Nam', 'Nữ'])}', 'CB')\n")
        check_batch(files_map["03_KHACHHANG"], i)

    # --- CHINHANH ---
    cn_ids = [f"CN{i:03d}" for i in range(1, NUM_BRANCHES + 1)]
    for idx, cn_id in enumerate(cn_ids):
        files_map["04_CHINHANH"].write(f"INSERT INTO CHINHANH VALUES ('{cn_id}', N'Chi nhánh {idx+1}', N'{get_address()}', '0283{random.randint(100000, 999999)}', '08:00', '22:00')\n")
    files_map["04_CHINHANH"].write("GO\n")

    # --- PHÂN BỔ NHÂN VIÊN ---
    branch_staff_map = {cn: {'NVTT': [], 'BSTY': [], 'NVBH': []} for cn in cn_ids}
    assigned_ids = set()
    
    # Chia đều tối thiểu
    for cn in cn_ids:
        for role_needed in ['NVTT', 'BSTY', 'NVBH']:
            candidate = next((s for s in staff_data if s['role'] == role_needed and s['id'] not in assigned_ids), None)
            if candidate:
                assigned_ids.add(candidate['id'])
                branch_staff_map[cn][role_needed].append(candidate['id'])
                files_map["05_LICHSULAMVIEC"].write(f"EXEC sp_ThemLichSuLamViec '{candidate['id']}', '{cn}', '2015-01-01', NULL\n")

    # Assign nốt số còn lại
    for s in staff_data:
        if s['id'] not in assigned_ids:
            cn = random.choice(cn_ids)
            if s['role'] in branch_staff_map[cn]:
                branch_staff_map[cn][s['role']].append(s['id'])
            files_map["05_LICHSULAMVIEC"].write(f"EXEC sp_ThemLichSuLamViec '{s['id']}', '{cn}', '2015-01-01', NULL\n")
            check_batch(files_map["05_LICHSULAMVIEC"], 1)
    files_map["05_LICHSULAMVIEC"].write("GO\n")

    # --- THUCUNG ---
    kh_pet_map = {kh: [] for kh in customer_ids}
    for i in range(1, NUM_PETS + 1):
        tc_id = f"TC{i:06d}"
        kh_id = random.choice(customer_ids)
        kh_pet_map[kh_id].append(tc_id)
        loai = random.choice(PET_TYPES)
        files_map["06_THUCUNG"].write(f"INSERT INTO THUCUNG (MaTC, TenTC, Loai, Giong, MATKKH) VALUES ('{tc_id}', N'{random.choice(PET_NAMES)}', N'{loai}', N'Giong {i}', '{kh_id}')\n")
        check_batch(files_map["06_THUCUNG"], i)

    # --- SANPHAM ---
    sp_ids = {'Thuốc': [], 'Vaccine': [], 'Bán lẻ': []}
    for i in range(1, NUM_PRODUCTS + 1):
        sp_id = f"SP{i:06d}"
        loai = random.choice(['Thuốc', 'Vaccine', 'Bán lẻ'])
        sp_ids[loai].append(sp_id)
        files_map["07_SANPHAM"].write(f"INSERT INTO SANPHAM VALUES ('{sp_id}', N'SP {i}', N'{loai}', {random.randint(50,500)*1000})\n")
        for cn_id in cn_ids:
            files_map["08_LOSANPHAM"].write(f"INSERT INTO LOSANPHAM VALUES ('L{i}{cn_id}', 1000, 1000, '2015-01-01', '2030-01-01', '{sp_id}', '{cn_id}')\n")
        check_batch(files_map["07_SANPHAM"], i)

    # --- GOITIEM ---
    if not sp_ids['Vaccine']: sp_ids['Vaccine'].append('SP000001')
    for i in range(1, 21):
        ma_goi = f"GT{i:03d}"
        files_map["10_CHITIETGOITIEM"].write(f"INSERT INTO CHITIETGOITIEM VALUES ('{sp_ids['Vaccine'][0]}', '{ma_goi}', N'Mũi 1', 1)\n")
        files_map["09_GOITIEM"].write(f"EXEC sp_ThemGoiTiem '{ma_goi}', N'Gói {i}', N'12T', 10, 500000\n")
        files_map["09_GOITIEM"].write("GO\n"); files_map["10_CHITIETGOITIEM"].write("GO\n")

    # --- DANGKYGOITIEM ---
    for i in range(1, 101):
        kh = random.choice(customer_ids)
        if kh_pet_map[kh]:
            # Tạo ngày đăng ký ngẫu nhiên trong quá khứ
            dk_date = get_random_date(START_DATE, END_DATE)
            start_date = dk_date + timedelta(days=random.randint(1, 30)) # Ngày bắt đầu sau ngày đk
            
            ma_tc = kh_pet_map[kh][0]
            ma_goi = f"GT{random.randint(1, 20):03d}"

            files_map["11_DANGKYGOITIEM"].write(f"EXEC sp_DangKyGoiTiem '{ma_tc}', '{ma_goi}', '{start_date}'\n")
            # Quan trọng: Cập nhật lại NgayDK về quá khứ vì SP mặc định lấy GETDATE()
            files_map["11_DANGKYGOITIEM"].write(f"UPDATE DANGKYGOITIEM SET NgayDK = '{dk_date}' WHERE MaTC = '{ma_tc}' AND MaGoi = '{ma_goi}' AND NgayBatDau = '{start_date}'\n")
            
            check_batch(files_map["11_DANGKYGOITIEM"], i)

    # ==========================================
    # LOGIC GIAO DỊCH (2015 -> Nay)
    # ==========================================
    print(f"Đang tạo {NUM_TRANSACTIONS} giao dịch từ năm 2015 đến nay...")
    
    for i in range(1, NUM_TRANSACTIONS + 1):
        ma_hd = f"HD{i:06d}"
        ma_sddv = f"SDDV{i:06d}"
        loai_dv = random.choice(['KB', 'TP', 'MH'])
        
        # Tạo ngày giao dịch ngẫu nhiên
        tx_date = get_random_date(START_DATE, END_DATE)

        # 1. Chọn Chi Nhánh & NVTT
        cn_selected = random.choice(cn_ids)
        nvtt_list = branch_staff_map[cn_selected]['NVTT']
        if not nvtt_list: continue
        nvtt_selected = random.choice(nvtt_list)
        
        # 2. Chọn KH & Pet
        kh_selected = None
        pet_selected = None
        
        if loai_dv in ['KB', 'TP']:
            for _ in range(10): 
                k = random.choice(customer_ids)
                if kh_pet_map[k]:
                    kh_selected = k
                    pet_selected = random.choice(kh_pet_map[k])
                    break
            if not kh_selected: continue
        else:
            kh_selected = random.choice(customer_ids)

        # 3. Insert HD & SDDV
        files_map["12_HOADON"].write(f"EXEC sp_ThemHoaDon '{ma_hd}', '{cn_selected}', '{kh_selected}', '{nvtt_selected}', 'TM'\n")
        # Quan trọng: Update ngày lập hóa đơn về quá khứ ngay sau khi tạo
        files_map["12_HOADON"].write(f"UPDATE HOADON SET NgayLap = '{tx_date}' WHERE MaHD = '{ma_hd}'\n")
        
        files_map["13_SUDUNGDICHVU"].write(f"INSERT INTO SUDUNGDICHVU (MaSDDV, LoaiDV, TongTienDV, MaHD) VALUES ('{ma_sddv}', '{loai_dv}', 0, '{ma_hd}')\n")

        # 4. Insert Chi Tiết
        if loai_dv == 'KB':
            bsty_list = branch_staff_map[cn_selected]['BSTY']
            if bsty_list and pet_selected:
                ma_bs = random.choice(bsty_list)
                # Truyền ngày khám bệnh = ngày giao dịch
                files_map["14_KHAMBENH"].write(f"EXEC sp_ThemKhamBenh '{ma_sddv}', '{pet_selected}', '{ma_bs}', N'Triệu chứng nhẹ', N'Theo dõi', '{tx_date}'\n")
                if sp_ids['Thuốc']:
                    files_map["17_CHITIETTOATHUOC"].write(f"EXEC sp_ThemChiTietToaThuoc '{ma_sddv}', '{random.choice(sp_ids['Thuốc'])}', 1\n")

        elif loai_dv == 'TP':
            bsty_list = branch_staff_map[cn_selected]['BSTY']
            if bsty_list and pet_selected:
                ma_bs = random.choice(bsty_list)
                # TP ko có tham số ngày trong SP, ngày tiêm sẽ theo ngày hóa đơn (đã update ở trên)
                files_map["15_TIEMPHONG"].write(f"EXEC sp_ThemTiemPhong '{ma_sddv}', '{pet_selected}', '{ma_bs}'\n")
                
                if sp_ids['Vaccine']:
                    files_map["18_CHITIETTIEMPHONG"].write(f"EXEC sp_ThemChiTietTiemPhong '{ma_sddv}', '{random.choice(sp_ids['Vaccine'])}', 1, NULL\n")

        elif loai_dv == 'MH':
            nvbh_list = branch_staff_map[cn_selected]['NVBH']
            if nvbh_list:
                ma_nvbh = random.choice(nvbh_list)
                files_map["16_MUAHANG"].write(f"EXEC sp_ThemMuaHang '{ma_sddv}', '{ma_nvbh}'\n")
                buyable = sp_ids['Bán lẻ'] + sp_ids['Thuốc']
                if buyable:
                    files_map["19_CHITIETMUAHANG"].write(f"EXEC sp_ThemChiTietMuaHang '{ma_sddv}', '{random.choice(buyable)}', 1\n")

        # 5. TẠO ĐÁNH GIÁ
        if random.random() < 0.4:
            diem = random.choices([5, 4, 3, 2, 1], weights=[50, 25, 15, 5, 5], k=1)[0]
            if diem >= 4: cmt = random.choice(COMMENTS_POS)
            elif diem == 3: cmt = random.choice(COMMENTS_NEU)
            else: cmt = random.choice(COMMENTS_NEG)
            tdnv = max(1, min(5, diem + random.randint(-1, 1)))
            mdhl = max(1, min(5, diem + random.randint(-1, 1)))
            files_map["20_DANHGIA"].write(f"INSERT INTO DANHGIA VALUES ('{ma_sddv}', {diem}, {tdnv}, {mdhl}, N'{cmt}')\n")

        # Batch control
        if i % 50 == 0:
            for k in ["12_HOADON", "13_SUDUNGDICHVU", "14_KHAMBENH", "15_TIEMPHONG", "16_MUAHANG", 
                      "17_CHITIETTOATHUOC", "18_CHITIETTIEMPHONG", "19_CHITIETMUAHANG", "20_DANHGIA"]:
                check_batch(files_map[k], i)

    print("Hoàn tất! Các file SQL đã được tạo với dữ liệu từ 2015 đến nay.")

finally:
    for f in files_map.values():
        if f: f.close()