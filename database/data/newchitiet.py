import re
import random
import os

# --- CẤU HÌNH HỆ THỐNG ---
# Tự động lấy đường dẫn thư mục chứa file code này
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def get_full_path(filename):
    """Hàm nối đường dẫn thư mục hiện tại với tên file"""
    return os.path.join(BASE_DIR, filename)

def extract_ids(filename, pattern):
    """Hàm đọc file an toàn và trích xuất danh sách ID"""
    full_path = get_full_path(filename)
    
    if not os.path.exists(full_path):
        print(f"[LỖI] Không tìm thấy file tại: {full_path}")
        return []

    content = ""
    # Thử đọc với UTF-8 trước, nếu lỗi thì thử UTF-16 (thường gặp ở file SQL Server)
    try:
        with open(full_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except UnicodeDecodeError:
        try:
            with open(full_path, 'r', encoding='utf-16') as f:
                content = f.read()
        except Exception as e:
            print(f"[LỖI] Không thể đọc file {filename}: {e}")
            return []
            
    ids = list(set(re.findall(pattern, content)))
    print(f"-> Đã tìm thấy {len(ids)} ID trong file {filename}")
    return ids

# --- CẤU HÌNH DỮ LIỆU RANDOM ---
lieu_luong_text = [
    "1 viên/lần", "2 viên/lần", "1 gói/lần", "5ml/lần", 
    "1/2 viên/lần", "10ml/lần", "1 viên/ngày", "2 viên/ngày",
    "3 lần/ngày", "Theo chỉ định bác sĩ"
]

cach_dung_text = [
    "Uống sau ăn", "Uống trước ăn", "Uống sau ăn 30p", 
    "Uống sáng - chiều", "Bôi ngoài da", "Nhỏ mắt", 
    "Uống lúc đói", "Pha với nước ấm", "Tiêm bắp", "Uống trực tiếp"
]

def generate_file(service_file, detail_file_out, proc_name, product_ids, mode='default'):
    """Hàm tạo file SQL chi tiết"""
    
    # 1. Lấy danh sách Mã Dịch Vụ
    service_ids = extract_ids(service_file, r"SDDV\d+")
    
    if not service_ids:
        print(f"[CẢNH BÁO] Bỏ qua {detail_file_out} vì không tìm thấy mã dịch vụ nào.")
        return

    print(f"Đang tạo dữ liệu cho {detail_file_out}...")
    
    lines = ["USE PETCAREDB", "GO", ""]
    
    for sddv in service_ids:
        # Chọn ngẫu nhiên 1 đến 10 chi tiết
        num_details = random.randint(1, 10)
        
        # Chọn danh sách sản phẩm không trùng lặp
        chosen_products = random.sample(product_ids, min(num_details, len(product_ids)))
        
        for sp in chosen_products:
            # Random giá trị INT (dùng cho Số lượng hoặc Liều lượng)
            val_int = random.randint(1, 10) 
            
            if mode == 'toathuoc':
                # Format: @SoLuong INT, @LieuLuong NVARCHAR, @CachDung NVARCHAR
                ll_txt = random.choice(lieu_luong_text)
                cd_txt = random.choice(cach_dung_text)
                line = f"EXEC {proc_name} '{sddv}', '{sp}', {val_int}, N'{ll_txt}', N'{cd_txt}'"
                
            elif mode == 'tiemphong':
                # Format: @LieuLuong INT, @MaDK = NULL
                line = f"EXEC {proc_name} '{sddv}', '{sp}', {val_int}, NULL"
                
            else: # mode == 'muahang'
                # Format: @SoLuong INT
                line = f"EXEC {proc_name} '{sddv}', '{sp}', {val_int}"
            
            lines.append(line)
            
    # Ghi file đầu ra
    out_path = get_full_path(detail_file_out)
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write("\n".join(lines))
    print(f"-> HOÀN TẤT: Đã ghi file {detail_file_out} ({len(lines)-3} dòng lệnh)\n")

# --- MAIN SCRIPT ---
if __name__ == "__main__":
    print(f"--- BẮT ĐẦU XỬ LÝ TẠI: {BASE_DIR} ---\n")

    files_input = {
        'kham_benh': '14_KHAMBENH.sql',
        'tiem_phong': '15_TIEMPHONG.sql',
        'mua_hang': '16_MUAHANG.sql',
        'sample_sp': '17_CHITIETTOATHUOC.sql'
    }

    # 1. Lấy danh sách Mã Sản Phẩm (SP) làm dữ liệu nguồn
    product_ids = extract_ids(files_input['sample_sp'], r"SP\d+")
    
    # Nếu không tìm thấy mã SP, tạo danh sách giả để code vẫn chạy được
    if not product_ids:
        print("[THÔNG BÁO] Không tìm thấy mã SP trong file mẫu, đang tạo mã giả lập...")
        product_ids = [f"SP{i:06d}" for i in range(1, 101)]

    # 2. Tạo Chi Tiết Toa Thuốc
    generate_file(
        files_input['kham_benh'], 
        '17_CHITIETTOATHUOC.sql', 
        'sp_ThemChiTietToaThuoc', 
        product_ids, 
        mode='toathuoc'
    )

    # 3. Tạo Chi Tiết Tiêm Phòng
    generate_file(
        files_input['tiem_phong'], 
        '18_CHITIETTIEMPHONG.sql', 
        'sp_ThemChiTietTiemPhong', 
        product_ids, 
        mode='tiemphong'
    )

    # 4. Tạo Chi Tiết Mua Hàng
    generate_file(
        files_input['mua_hang'], 
        '19_CHITIETMUAHANG.sql', 
        'sp_ThemChiTietMuaHang', 
        product_ids, 
        mode='muahang'
    )

    print("--- ĐÃ TẠO XONG TOÀN BỘ 3 FILE! ---")
    input("Nhấn Enter để thoát...")