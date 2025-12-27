import re
import random
import os
from datetime import datetime, timedelta

# --- CẤU HÌNH HỆ THỐNG ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def get_full_path(filename):
    return os.path.join(BASE_DIR, filename)

def read_file(path):
    """Đọc file với xử lý lỗi encoding"""
    if not os.path.exists(path):
        print(f"[BỎ QUA] Không tìm thấy file: {path}")
        return None
    try:
        with open(path, 'r', encoding='utf-8') as f:
            return f.read()
    except UnicodeDecodeError:
        try:
            with open(path, 'r', encoding='utf-16') as f:
                return f.read()
        except Exception:
            return None

def write_file(path, content):
    """Ghi đè nội dung vào file"""
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

# --- HÀM TẠO NGÀY NGẪU NHIÊN ---
def random_date(start_year, end_year):
    """Tạo ngày ngẫu nhiên giữa 2 năm"""
    start = datetime(start_year, 1, 1)
    end = datetime(end_year, 12, 31)
    delta = end - start
    random_days = random.randint(0, delta.days)
    return (start + timedelta(days=random_days)).strftime('%Y-%m-%d')

def random_date_from_date(base_date_str, min_days, max_days):
    """Tạo ngày mới dựa trên ngày gốc cộng thêm số ngày"""
    base = datetime.strptime(base_date_str, '%Y-%m-%d')
    days_add = random.randint(min_days, max_days)
    return (base + timedelta(days=days_add)).strftime('%Y-%m-%d')

# --- LOGIC XỬ LÝ TỪNG FILE ---

def process_nhanvien():
    filename = '02_NHANVIEN.sql'
    path = get_full_path(filename)
    content = read_file(path)
    if not content: return

    print(f"Đang xử lý {filename}...")
    
    # Pattern tìm 2 ngày liên tiếp: NgaySinh, NgayVaoLam
    # Ví dụ: ... '1995-01-01', '2015-01-01', ...
    pattern = r"'(\d{4}-\d{2}-\d{2})', '(\d{4}-\d{2}-\d{2})'"

    def replace_func(match):
        # Tạo ngày sinh ngẫu nhiên từ 1975 đến 2003 (tuổi từ 20-50)
        dob = random_date(1975, 2003)
        # Tạo ngày vào làm: Phải sau ngày sinh ít nhất 18 năm, và trong khoảng 2015-2024
        # Để đơn giản, ta random ngày vào làm trong khoảng 2015-2024 độc lập (vì 2015 > 2003 + 12, an toàn là > 18t)
        start_work = random_date(2015, 2024)
        return f"'{dob}', '{start_work}'"

    new_content = re.sub(pattern, replace_func, content)
    write_file(path, new_content)
    print(f"-> Đã cập nhật ngày sinh & ngày vào làm cho {filename}")

def process_losanpham():
    filename = '08_LOSANPHAM.sql'
    path = get_full_path(filename)
    content = read_file(path)
    if not content: return

    print(f"Đang xử lý {filename}...")

    # Pattern tìm 2 ngày liên tiếp: NSX, HSD
    # Ví dụ: ... '2015-01-01', '2030-01-01', ...
    pattern = r"'(\d{4}-\d{2}-\d{2})', '(\d{4}-\d{2}-\d{2})'"

    def replace_func(match):
        # Ngày sản xuất: Random từ 2020 đến 2023
        nsx = random_date(2020, 2023)
        # Hạn sử dụng: NSX + (365 ngày đến 1000 ngày)
        hsd = random_date_from_date(nsx, 365, 1095)
        return f"'{nsx}', '{hsd}'"

    new_content = re.sub(pattern, replace_func, content)
    write_file(path, new_content)
    print(f"-> Đã cập nhật NSX & HSD cho {filename}")

def process_lichsulamviec():
    filename = '05_LICHSULAMVIEC.sql'
    path = get_full_path(filename)
    content = read_file(path)
    if not content: return

    print(f"Đang xử lý {filename}...")

    # Pattern: Tìm ngày bắt đầu làm việc
    # Trong file này thường chỉ có 1 ngày xuất hiện dạng 'YYYY-MM-DD' trong câu lệnh EXEC
    # Regex tìm chuỗi ngày nằm trong dấu nháy đơn
    pattern = r"'(\d{4}-\d{2}-\d{2})'"

    def replace_func(match):
        # Ngày bắt đầu làm việc tại chi nhánh: Random 2015-2024
        d = random_date(2015, 2024)
        return f"'{d}'"

    new_content = re.sub(pattern, replace_func, content)
    write_file(path, new_content)
    print(f"-> Đã cập nhật ngày làm việc cho {filename}")

# --- MAIN ---
if __name__ == "__main__":
    print("--- BẮT ĐẦU CHỈNH SỬA DATE ---")
    
    # 02_NHANVIEN: Có ngày sinh, ngày vào làm
    process_nhanvien()
    
    # 08_LOSANPHAM: Có ngày SX, Hạn SD
    process_losanpham()
    
    # 05_LICHSULAMVIEC: Có ngày bắt đầu
    process_lichsulamviec()
    
    # Note: 03_KHACHHANG.sql thường không có ngày tháng trong insert (dựa trên snippet), 
    # nên không xử lý để tránh lỗi.

    print("\n--- HOÀN TẤT! CÁC FILE ĐÃ ĐƯỢC GHI ĐÈ ---")