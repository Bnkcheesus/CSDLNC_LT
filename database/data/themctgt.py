import re
import random
import os

# --- CẤU HÌNH HỆ THỐNG ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def get_full_path(filename):
    return os.path.join(BASE_DIR, filename)

def read_file(filename):
    """Đọc file an toàn với nhiều encoding"""
    path = get_full_path(filename)
    if not os.path.exists(path):
        print(f"[LỖI] Không tìm thấy file: {filename}")
        return ""
    try:
        with open(path, 'r', encoding='utf-8') as f:
            return f.read()
    except UnicodeDecodeError:
        try:
            with open(path, 'r', encoding='utf-16') as f:
                return f.read()
        except Exception:
            return ""

# --- HÀM TRÍCH XUẤT DỮ LIỆU ---
def extract_vaccine_ids(content):
    """Lấy danh sách Mã SP là Vaccine"""
    # Regex tìm dòng insert có chứa 'Vaccine'
    # Mẫu: INSERT INTO SANPHAM VALUES ('SPxxxxxx', ..., N'Vaccine', ...)
    pattern = r"INSERT INTO SANPHAM VALUES \('([^']+)',[^)]+N'Vaccine'"
    ids = list(set(re.findall(pattern, content)))
    print(f"-> Tìm thấy {len(ids)} loại Vaccine.")
    return ids

def extract_goitiem_ids(content):
    """Lấy danh sách Mã Gói Tiêm"""
    # Mẫu: EXEC sp_ThemGoiTiem 'GTxxxx', ...
    pattern = r"EXEC sp_ThemGoiTiem '([^']+)'"
    ids = list(set(re.findall(pattern, content)))
    ids.sort()
    print(f"-> Tìm thấy {len(ids)} Gói tiêm.")
    return ids

# --- HÀM TẠO FILE CHI TIẾT ---
def generate_chitiet_goitiem():
    file_sp = '07_SANPHAM.sql'
    file_gt = '09_GOITIEM.sql'
    file_out = '10_CHITIETGOITIEM.sql'

    print(f"--- ĐANG XỬ LÝ DỮ LIỆU ---")
    
    # 1. Đọc dữ liệu nguồn
    content_sp = read_file(file_sp)
    content_gt = read_file(file_gt)
    
    if not content_sp or not content_gt:
        print("Không đủ dữ liệu đầu vào.")
        return

    vaccine_ids = extract_vaccine_ids(content_sp)
    goitiem_ids = extract_goitiem_ids(content_gt)

    if not vaccine_ids:
        print("[CẢNH BÁO] Không tìm thấy Vaccine nào. Đang dùng mã giả SP000001-SP000010.")
        vaccine_ids = [f"SP{i:06d}" for i in range(1, 11)]

    # 2. Tạo nội dung Insert
    lines = ["USE PETCAREDB", "GO", ""]
    count = 0
    batch_counter = 0

    mui_descriptions = [
        "Mũi 1", "Mũi 2", "Mũi 3", 
        "Nhắc lại năm 1", "Nhắc lại năm 2", 
        "Liều bổ sung", "Tiêm phòng dại"
    ]

    for ma_gt in goitiem_ids:
        # Mỗi gói có từ 2 đến 5 chi tiết (vaccine)
        num_items = random.randint(2, 5)
        chosen_vaccines = random.sample(vaccine_ids, min(num_items, len(vaccine_ids)))

        for i, ma_sp in enumerate(chosen_vaccines):
            # Chọn tên mũi tiêm ngẫu nhiên hoặc theo thứ tự
            # Ở đây ta chọn ngẫu nhiên tên mũi cho đa dạng
            ten_mui = random.choice(mui_descriptions)
            
            # Số lượng thường là 1 cho gói tiêm
            so_luong = 1 

            # Format dựa trên snippet: VALUES ('MaSP', 'MaGT', N'TenMui', SoLuong)
            line = f"EXEC sp_ThemChiTietGoiTiem '{ma_sp}', '{ma_gt}', N'{ten_mui}', {so_luong}"
            
            lines.append(line)
            count += 1
            batch_counter += 1

            # Thêm GO mỗi 100 dòng
            if batch_counter >= 100:
                lines.append("GO")
                batch_counter = 0

    # 3. Ghi ra file
    out_path = get_full_path(file_out)
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write("\n".join(lines))
        
    print(f"\n-> HOÀN TẤT: Đã tạo {count} dòng chi tiết vào file {file_out}.")

# --- MAIN ---
if __name__ == "__main__":
    generate_chitiet_goitiem()