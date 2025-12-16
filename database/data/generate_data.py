import os
import random
from datetime import datetime, timedelta
from faker import Faker

# --- CẤU HÌNH ĐỂ TẠO DỮ LIỆU LỚN VƯỢT 70K DÒNG ---
NUM_CUSTOMERS = 20000
NUM_STAFF = 1000
NUM_TRANSACTIONS = 70000
NUM_PETS = 30000
NUM_BRANCHES = 10
NUM_PRODUCTS = 100
NUM_VACCINE_PACKAGES = 50
START_DATE = datetime(2015, 1, 1)
END_DATE = datetime(2025, 12, 31)

# Khởi tạo Faker với locale Việt Nam
fake = Faker('vi_VN')

# --- Hàm hỗ trợ ĐÃ CHỈNH SỬA ---

def generate_id(prefix, index, length):
    """Tạo ID với độ dài cố định và số 0 đệm."""
    padding_len = length - len(prefix)
    return f"{prefix}{index:0{padding_len}d}"

def random_date_range(start, end):
    """Tạo ngày ngẫu nhiên trong khoảng."""
    return (start + timedelta(days=random.randint(0, (end - start).days))).strftime('%Y-%m-%d')

def create_insert_file(filename, data_list):
    """
    Ghi danh sách câu lệnh INSERT vào file.
    Đã thêm 'USE PETCAREDB GO' ở đầu file.
    """
    with open(filename, 'w', encoding='utf-8') as f:
        # ⚠️ THÊM CÂU LỆNH ĐẦU TIÊN
        f.write("USE PETCAREDB\nGO\n\n") 
        # ----------------------------
        f.write(f"-- ====================== {os.path.basename(filename).replace('.sql', '').upper()} - {len(data_list):,} ROWS ======================\n")
        f.write("\n".join(data_list))
    print(f"Generated {len(data_list):,} rows and saved to {filename}")

# --- Danh sách dữ liệu cố định/tạo trước ---
BRANCH_IDS = [generate_id('CN', i, 5) for i in range(1, NUM_BRANCHES + 1)]
PRODUCT_IDS = [generate_id('SP', i, 8) for i in range(1, NUM_PRODUCTS + 1)]
PACKAGE_IDS = [generate_id('G', i, 5) for i in range(1, NUM_VACCINE_PACKAGES + 1)]
STAFF_CHUCVU = ['QLCN', 'NVTT', 'NVBH', 'BSTY']
PET_TYPES = ['Chó', 'Mèo']
VACCINE_PRODUCTS = PRODUCT_IDS[:min(5, NUM_PRODUCTS)]

# --- Khởi tạo danh sách ID chính ---
staff_ids = []
customer_ids = []
pet_ids = []
taikhoan_inserts = []
nhanvien_inserts = []
khachhang_inserts = []
thucung_inserts = []

# --- 1. TAIKHOAN & NHANVIEN (Staff) ---
print("--- 1. Generating TAIKHOAN & NHANVIEN...")
for i in range(1, NUM_STAFF + 1):
    nv_id = generate_id('NV', i, 8)
    staff_ids.append(nv_id)
    taikhoan_inserts.append(f"INSERT INTO TAIKHOAN VALUES ('{nv_id}', '123', N'NV');\nGO")
    gender = random.choice(['Nam', 'Nữ'])
    chucvu = random.choice(STAFF_CHUCVU)
    luongcoban = random.randint(5000000, 25000000)
    ngaysinh = random_date_range(datetime(1980, 1, 1), datetime(2000, 1, 1))
    ngayvaolam = random_date_range(datetime(2020, 1, 1), datetime(2024, 1, 1))
    nhanvien_inserts.append(
        f"INSERT INTO NHANVIEN VALUES ('{nv_id}', N'{fake.name()}', N'{gender}', '{ngaysinh}', '{ngayvaolam}', '{chucvu}', {luongcoban}.00); \nGO"
    )

# --- 2. TAIKHOAN & KHACHHANG (Customers) ---
print("--- 2. Generating TAIKHOAN & KHACHHANG...")
for i in range(1, NUM_CUSTOMERS + 1):
    kh_id = generate_id('KH', i, 8)
    customer_ids.append(kh_id)
    taikhoan_inserts.append(f"INSERT INTO TAIKHOAN VALUES ('{kh_id}', '123', N'KH'); \nGO")
    gender = random.choice(['Nam', 'Nữ'])
    rank = random.choice(['CB', 'TT', 'VIP'])
    total_spend = random.randint(0, 50000000)
    loyalty_points = total_spend // 100000
    khachhang_inserts.append(
        f"INSERT INTO KHACHHANG VALUES ('{kh_id}', N'{fake.name()}', '{fake.phone_number().replace('+', '')[:10]}', '{fake.email()}', '{fake.unique.ssn()[:12]}', N'{gender}', '{random_date_range(datetime(1980, 1, 1), datetime(2005, 1, 1))}', {total_spend}.00, {loyalty_points}, '{rank}'); \nGO"
    )

# --- 3. THUCUNG (Pets) ---
print("--- 3. Generating THUCUNG...")
for i in range(1, NUM_PETS + 1):
    tc_id = generate_id('TC', i, 8)
    pet_ids.append(tc_id)
    # FIX: Sử dụng toán tử modulo (%) để lặp lại danh sách customer_ids
    owner_id = customer_ids[(i-1) % NUM_CUSTOMERS] 
    pet_type = random.choice(PET_TYPES)
    breed = fake.word().capitalize()
    health_status = random.choice(['Khỏe mạnh', 'Sổ mũi', 'Sốt nhẹ', 'Đang điều trị'])
    pet_gender = random.choice(['Đực', 'Cái'])
    thucung_inserts.append(
        f"INSERT INTO THUCUNG VALUES ('{tc_id}', N'{fake.first_name()}', N'{pet_type}', N'{breed}', '{random_date_range(datetime(2018, 1, 1), datetime(2024, 1, 1))}', N'{pet_gender}', N'{health_status}', '{owner_id}'); \nGO"
    )

# --- 4. CHINHANH (Branches) ---
print("--- 4. Generating CHINHANH...")
chinhanh_inserts = []
for i in range(1, NUM_BRANCHES + 1):
    cn_id = generate_id('CN', i, 5)
    chinhanh_inserts.append(
        f"INSERT INTO CHINHANH VALUES ('{cn_id}', N'Chi nhánh {fake.city()}', N'{fake.address()}', '{fake.phone_number().replace('+', '')[:10]}', '08:00:00', '21:00:00'); \nGO"
    )

# --- 5. LICHSULAMVIEC ---
print("--- 5. Generating LICHSULAMVIEC...")
lichsulamviec_inserts = []
for nv_id in staff_ids:
    assigned_branches = random.sample(BRANCH_IDS, random.randint(1, min(3, NUM_BRANCHES)))
    for cn_id in assigned_branches:
        start_date = random_date_range(datetime(2020, 1, 1), datetime(2023, 1, 1))
        end_date = 'NULL' if random.random() < 0.8 else f"'{random_date_range(datetime(2023, 1, 2), datetime(2024, 12, 31))}'"
        lichsulamviec_inserts.append(
            f"INSERT INTO LICHSULAMVIEC VALUES ('{nv_id}', '{cn_id}', '{start_date}', {end_date}); \nGO"
        )

# --- 6. SANPHAM (Products) ---
print("--- 6. Generating SANPHAM...")
sanpham_inserts = []
product_types = ['Thuốc', 'Vaccine', 'Bán lẻ']
for i in range(1, NUM_PRODUCTS + 1):
    sp_id = generate_id('SP', i, 8)
    sp_type = random.choice(product_types)
    gia = random.randint(30000, 500000)
    sanpham_inserts.append(
        f"INSERT INTO SANPHAM VALUES ('{sp_id}', N'{fake.word().capitalize()} ({sp_type})', N'{sp_type}', {gia}.00); \nGO"
    )

# --- 7. LOSANPHAM (Product Batches) ---
print("--- 7. Generating LOSANPHAM...")
losanpham_inserts = []
for cn_id in BRANCH_IDS:
    for i, sp_id in enumerate(PRODUCT_IDS):
        lo_id = generate_id('LO', len(losanpham_inserts) + 1, 8)
        qty_in = random.randint(50, 500)
        qty_remain = random.randint(10, qty_in)
        date_in = random_date_range(datetime(2023, 1, 1), datetime(2024, 1, 1))
        date_exp = random_date_range(datetime(2025, 1, 1), datetime(2026, 1, 1))
        losanpham_inserts.append(
            f"INSERT INTO LOSANPHAM VALUES ('{lo_id}', {qty_in}, {qty_remain}, '{date_in}', '{date_exp}', '{sp_id}', '{cn_id}'); \nGO"
        )

# --- 8. GOITIEM (Packages) & CHITIETGOITIEM ---
print("--- 8. Generating GOITIEM & CHITIETGOITIEM...")
goitiem_inserts = []
chitietgoitiem_inserts = []
for i in range(1, NUM_VACCINE_PACKAGES + 1):
    gt_id = generate_id('G', i, 5)
    duration = random.choice(['6 tháng', '1 năm', '2 năm'])
    discount = random.choice([5.00, 10.00, 15.00])
    price = random.randint(500000, 2000000)
    goitiem_inserts.append(
        f"INSERT INTO GOITIEM VALUES ('{gt_id}', N'Gói Vaccine {i} {fake.color_name()}', N'{duration}', {discount}, {price}.00); \nGO"
    )
    
    num_shots = random.randint(1, 4)
    for j in range(1, num_shots + 1):
        sp_id = random.choice(VACCINE_PRODUCTS)
        time_point = f"Tháng {j * 2}"
        chitietgoitiem_inserts.append(
            f"INSERT INTO CHITIETGOITIEM VALUES ('{sp_id}', '{gt_id}', N'{time_point}', 1); \nGO"
        )

# --- 9. Dữ liệu Giao dịch ---
print("--- 9. Generating Transaction Data (HOADON, SUDDV, etc.)...")
hoadon_inserts = []
suddv_inserts = []
danhgia_inserts = []
khambenh_inserts = []
tiemphong_inserts = []
muahang_inserts = []
chitiettoathuoc_inserts = []
chitietmuahang_inserts = []
dangkygoitiem_inserts = []
chitettiemphong_inserts = []

# Tăng cường ngẫu nhiên hóa để phủ đều 70k khách hàng/thú cưng
transaction_kh_ids = customer_ids
transaction_tc_ids = pet_ids
sddv_counter = 0
dk_counter = 0

for i in range(1, NUM_TRANSACTIONS + 1):
    hd_id = generate_id('HD', i, 8)
    # Lấy KH và TC theo chu kỳ để đảm bảo tất cả KH và TC được sử dụng
    ma_kh = transaction_kh_ids[(i - 1) % NUM_CUSTOMERS]
    ma_tc = transaction_tc_ids[(i - 1) % NUM_PETS]
    ma_nv = random.choice(staff_ids)
    ma_cn = random.choice(BRANCH_IDS)
    payment_method = random.choice(['TM', 'CK'])
    
    # HOADON
    total_amount = random.randint(100000, 5000000) // 1000 * 1000
    hoadon_inserts.append(
        f"INSERT INTO HOADON VALUES ('{hd_id}', '{random_date_range(START_DATE, END_DATE)}', {total_amount}.00, 0.00, '{payment_method}', '{ma_cn}', '{ma_kh}', '{ma_nv}'); \nGO"
    )

    # SUDUNGDICHVU & Chi tiết
    num_services = random.randint(2, 5) 
    services_pool = ['KB'] * 5 + ['TP'] * 5 + ['MH'] * 5 
    services_used = random.sample(services_pool, min(num_services, 3))
    
    for service_type in services_used:
        sddv_counter += 1
        sddv_id = generate_id('SDDV', sddv_counter, 10)
        service_price = random.randint(50000, 2000000) // 1000 * 1000
        suddv_inserts.append(
            f"INSERT INTO SUDUNGDICHVU VALUES ('{sddv_id}', '{service_type}', {service_price}.00, '{hd_id}'); \nGO"
        )
        
        # DANHGIA (60% chance of a review)
        if random.random() < 0.6:
            score = random.randint(3, 5)
            content = 'Rất hài lòng' if score == 5 else ('Ổn' if score == 4 else 'Bình thường')
            danhgia_inserts.append(
                f"INSERT INTO DANHGIA VALUES ('{sddv_id}', {score}, {score}, {score}, N'{content}'); \nGO"
            )

        # Service-Specific Tables
        if service_type == 'KB': # KHAMBENH
            ma_bs = random.choice(staff_ids)
            khambenh_inserts.append(
                f"INSERT INTO KHAMBENH VALUES ('{sddv_id}', N'{fake.sentence(nb_words=5)}', N'{fake.sentence(nb_words=4)}', '{random_date_range(datetime.now(), datetime(2026, 1, 1))}', '{ma_tc}', '{ma_bs}'); \nGO"
            )
            
            # CHITIETTOATHUOC (Tăng xác suất và số lượng item)
            if random.random() < 0.85: # 85% chance of a prescription
                num_meds = random.randint(2, 4) # 2-4 items per prescription
                med_products = random.sample(PRODUCT_IDS, num_meds) 
                for med_sp in med_products:
                    chitiettoathuoc_inserts.append(
                        f"INSERT INTO CHITIETTOATHUOC VALUES ('{med_sp}', '{sddv_id}', {random.randint(1, 10)}, N'1 viên/ngày', N'Uống sau ăn'); \nGO"
                    )

        elif service_type == 'TP': # TIEMPHONG
            ma_bs = random.choice(staff_ids)
            tiemphong_inserts.append(
                f"INSERT INTO TIEMPHONG VALUES ('{sddv_id}', '{ma_tc}', '{ma_bs}'); \nGO"
            )

            # DANGKYGOITIEM & CHITIETTIEMPHONG
            ma_dk_ref = 'NULL'
            if random.random() < 0.5: # 50% chance of registering a new package 
                dk_counter += 1
                dkgt_id = generate_id('DK', dk_counter, 8)
                ma_gt = random.choice(PACKAGE_IDS)
                ma_dk_ref = f"'{dkgt_id}'"
                
                dangkygoitiem_inserts.append(
                    f"INSERT INTO DANGKYGOITIEM VALUES ('{dkgt_id}', GETDATE(), '{random_date_range(datetime.now() + timedelta(days=365), datetime(2027, 1, 1))}', '{ma_gt}', '{ma_tc}'); \nGO"
                )
            
            # Assume one vaccine shot is given
            if VACCINE_PRODUCTS:
                vaccine_sp = random.choice(VACCINE_PRODUCTS)
                chitettiemphong_inserts.append(
                    f"INSERT INTO CHITIETTIEMPHONG VALUES ('{vaccine_sp}', '{sddv_id}', 1, {ma_dk_ref}); \nGO"
                )

        elif service_type == 'MH': # MUAHANG
            ma_nvbh = random.choice(staff_ids)
            muahang_inserts.append(
                f"INSERT INTO MUAHANG VALUES ('{sddv_id}', '{ma_nvbh}'); \nGO"
            )
            
            # CHITIETMUAHANG (Tăng số lượng item/mua hàng)
            num_items = random.randint(3, 6)
            for k in range(num_items):
                item_sp = random.choice(PRODUCT_IDS)
                chitietmuahang_inserts.append(
                    f"INSERT INTO CHITIETMUAHANG VALUES ('{item_sp}', '{sddv_id}', {random.randint(1, 5)}); \nGO")

# --- Ghi dữ liệu ra file ---
# Đã sắp xếp lại theo thứ tự tối ưu để tạo file, giúp bạn dễ dàng sử dụng
# lại list file_order trong script Python chạy SQL.

print("\n--- Saving Data Files ---")
# 1. Bảng Cốt lõi & Tham chiếu
create_insert_file('./1-taikhoan.sql', taikhoan_inserts)
create_insert_file('./2-chinhanh.sql', chinhanh_inserts)
create_insert_file('./3-nhanvien.sql', nhanvien_inserts)
create_insert_file('./4-khachhang.sql', khachhang_inserts)
create_insert_file('./5-sanpham.sql', sanpham_inserts)
create_insert_file('./6-goitiem.sql', goitiem_inserts)

# 2. Bảng Liên kết Cơ bản
create_insert_file('./7-thucung.sql', thucung_inserts)
create_insert_file('./8-lichsulamviec.sql', lichsulamviec_inserts)
create_insert_file('./9-losanpham.sql', losanpham_inserts)
create_insert_file('./10-chitietgoitiem.sql', chitietgoitiem_inserts)

# 3. Bảng Giao dịch Cấp 1
create_insert_file('./11-hoadon.sql', hoadon_inserts)

# 4. Bảng Giao dịch Cấp 2
create_insert_file('./12-suddv.sql', suddv_inserts)

# 5. Bảng Chi tiết Dịch vụ
create_insert_file('./13-khambenh.sql', khambenh_inserts)
create_insert_file('./14-tiemphong.sql', tiemphong_inserts)
create_insert_file('./15-muahang.sql', muahang_inserts)

# 6. Bảng Đăng ký Gói tiêm
create_insert_file('./16-dangkygoitiem.sql', dangkygoitiem_inserts)

# 7. Bảng Chi tiết Giao dịch & Đánh giá
create_insert_file('./17-chitiettoathuoc.sql', chitiettoathuoc_inserts)
create_insert_file('./18-chitietmuahang.sql', chitietmuahang_inserts)
create_insert_file('./19-chitettiemphong.sql', chitettiemphong_inserts)
create_insert_file('./20-danhgia.sql', danhgia_inserts)


print("\n--- HOÀN TẤT TẠO DỮ LIỆU ---")
print("Các bảng giao dịch đã được tăng cường để vượt 70,000 dòng.")
print("Vui lòng đảm bảo bạn đã tạo thư mục 'data' cùng cấp với file script này!")