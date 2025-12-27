import re
import random
import os

# --- CẤU HÌNH HỆ THỐNG ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def get_full_path(filename):
    """Hàm nối đường dẫn tuyệt đối"""
    return os.path.join(BASE_DIR, filename)

def extract_ids(filename, pattern):
    """Hàm đọc file và lấy TẤT CẢ các ID duy nhất"""
    full_path = get_full_path(filename)
    
    if not os.path.exists(full_path):
        print(f"[LỖI] Không tìm thấy file nguồn: {filename}")
        return []

    content = ""
    # Thử đọc UTF-8 trước, nếu lỗi thì thử UTF-16
    try:
        with open(full_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except UnicodeDecodeError:
        try:
            with open(full_path, 'r', encoding='utf-16') as f:
                content = f.read()
        except Exception as e:
            print(f"[LỖI] Không đọc được file {filename}: {e}")
            return []
            
    # Dùng set để lọc trùng, sau đó chuyển về list để duyệt
    ids = list(set(re.findall(pattern, content)))
    ids.sort() # Sắp xếp để dễ kiểm soát
    print(f"-> Đã tìm thấy {len(ids)} mã dịch vụ trong {filename}")
    return ids

# --- DỮ LIỆU MẪU ---
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
    
    # 1. Lấy danh sách TOÀN BỘ Mã Dịch Vụ từ file nguồn
    service_ids = extract_ids(service_file, r"SDDV\d+")
    
    if not service_ids:
        print(f"[CẢNH BÁO] Không tìm thấy mã dịch vụ nào trong {service_file}. Bỏ qua.")
        return

    print(f"Đang tạo chi tiết cho {len(service_ids)} dịch vụ vào file {detail_file_out}...")
    
    lines = ["USE PETCAREDB", "GO", ""]
    
    count_details = 0
    
    # 2. Duyệt qua TỪNG mã dịch vụ (đảm bảo 'TẤT CẢ' đều có)
    for sddv in service_ids:
        
        # Yêu cầu: Mỗi SDDV có ít nhất 1, nhiều nhất 10 chi tiết
        num_details = random.randint(1, 10) 
        
        # Chọn danh sách sản phẩm ngẫu nhiên (không trùng lặp trong 1 hóa đơn)
        chosen_products = random.sample(product_ids, min(num_details, len(product_ids)))
        
        for sp in chosen_products:
            # Random số lượng/liều lượng (INT)
            val_int = random.randint(1, 10) 
            
            line = ""
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
            count_details += 1
            
    # 3. Ghi đè vào file gốc
    out_path = get_full_path(detail_file_out)
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write("\n".join(lines))
        
    print(f"-> HOÀN TẤT {detail_file_out}: Đã tạo {count_details} dòng chi tiết cho {len(service_ids)} dịch vụ.\n")

# --- MAIN SCRIPT ---
if __name__ == "__main__":
    print(f"--- BẮT ĐẦU XỬ LÝ ---")
    
    # Định nghĩa các cặp file Input -> Output
    files_input = {
        'kham_benh': '14_KHAMBENH.sql',
        'tiem_phong': '15_TIEMPHONG.sql',
        'mua_hang': '16_MUAHANG.sql',
        'sample_sp': '17_CHITIETTOATHUOC.sql' # Dùng file này chỉ để lấy danh sách mã SP
    }

    # Lấy danh sách Mã Sản Phẩm (SP) nạp vào bộ nhớ trước khi ghi đè
    print("Đang đọc danh sách sản phẩm...")
    product_ids = extract_ids(files_input['sample_sp'], r"SP\d+")
    
    if not product_ids:
        print("[THÔNG BÁO] Không tìm thấy mã SP, tạo mã giả lập SP000001-SP000100")
        product_ids = [f"SP{i:06d}" for i in range(1, 101)]

    # 1. Tạo Chi Tiết Toa Thuốc (Ghi đè file 17)
    generate_file(
        files_input['kham_benh'], 
        '17_CHITIETTOATHUOC.sql', 
        'sp_ThemChiTietToaThuoc', 
        product_ids, 
        mode='toathuoc'
    )

    # 2. Tạo Chi Tiết Tiêm Phòng (Ghi đè file 18)
    generate_file(
        files_input['tiem_phong'], 
        '18_CHITIETTIEMPHONG.sql', 
        'sp_ThemChiTietTiemPhong', 
        product_ids, 
        mode='tiemphong'
    )

    # 3. Tạo Chi Tiết Mua Hàng (Ghi đè file 19)
    generate_file(
        files_input['mua_hang'], 
        '19_CHITIETMUAHANG.sql', 
        'sp_ThemChiTietMuaHang', 
        product_ids, 
        mode='muahang'
    )

    print("--- ĐÃ CẬP NHẬT THÀNH CÔNG TẤT CẢ FILE ---")
    input("Nhấn Enter để thoát...")