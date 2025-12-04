# PetCareX – Hệ thống chăm sóc thú cưng

PetCareX là hệ thống quản lý dịch vụ chăm sóc thú cưng dành cho **khách hàng**, **nhân viên** và **quản lý**. Hệ thống hỗ trợ khám bệnh, tiêm phòng cho thú cưng, và mua hàng.

---

## 🚀 Công nghệ sử dụng

* **Frontend:** React + Vite + TailwindCSS
* **Backend:** Node.js + Express
* **Database:** Microsoft SQL Server

---

## 🛠️ Cài đặt dự án

### 1️⃣ Clone repository

```
git clone https://github.com/mattykng/petcarex.git
cd petcarex
```

### 2️⃣ Khởi tạo cơ sở dữ liệu SQL Server (nếu máy chưa có database)

1. Mở **SQL Server Management Studio (SSMS)**
2. Mở file: `database/init.sql`


3. Chạy toàn bộ script để tạo database **PETCAREDB**, các bảng và dữ liệu mẫu

### 3️⃣ Tạo file `.env` (backend)
Trong thư mục `backend/`, tạo file `.env` với nội dung

```
DB_SERVER=localhost
DB_PORT=1433
DB_USER=sa
DB_PASSWORD=your_password
DB_NAME=PETCAREDB
PORT=5000
JWT_SECRET=your_jwt_secret_key
```
Thay `your_password` bằng mật khẩu SQL Server thực tế trên máy

### 4️⃣ Cài đặt Backend

```
cd backend
npm install
```

### 5️⃣ Cài đặt Frontend

```
cd frontend
npm install
```

---

## ▶️ Chạy dự án

### 1️⃣ Chạy backend

```
cd backend
npm run dev
```
Backend mặc định:
http://localhost:5000


### 2️⃣ Chạy frontend

```
cd frontend
npm run dev
```

Frontend mặc định:
http://localhost:5173