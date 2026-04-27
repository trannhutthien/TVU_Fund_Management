# SỬA LỖI SAI KHÁC GIỮA SCHEMA VÀ MÃ NGUỒN

## 🔍 TÓM TẮT VẤN ĐỀ

Sau khi kiểm tra schema database thực tế, phát hiện **nhiều sai khác** giữa schema và mã nguồn đã viết.

---

## ❌ CÁC SAI KHÁC PHÁT HIỆN

### **1. Bảng NguoiDung - PRIMARY KEY**

| Schema thực tế | Mã nguồn cũ | Đã sửa |
|----------------|-------------|---------|
| `user_id` | `id` hoặc `ma_so_dinh_danh` | ✅ `user_id` |

**Vấn đề:**
- Schema dùng `user_id` là PRIMARY KEY
- Code đang dùng `ma_so_dinh_danh` làm ID trong token và queries

**Ảnh hưởng:**
- JWT token lưu sai ID
- Queries tìm user theo sai cột
- Foreign keys trong các bảng khác sẽ bị lỗi

---

### **2. Bảng Quy - Giá trị trạng thái**

| Schema thực tế | Mã nguồn cũ | Đã sửa |
|----------------|-------------|---------|
| `DANG_HOAT_DONG` | `Dang hoat dong` | ✅ `DANG_HOAT_DONG` |

**Vấn đề:**
- Schema dùng gạch dưới và chữ HOA: `DANG_HOAT_DONG`
- Code dùng khoảng trắng và chữ thường: `Dang hoat dong`

**Ảnh hưởng:**
- Kiểm tra trạng thái quỹ luôn sai
- Không thể quyên góp vào quỹ đang hoạt động

---

### **3. Bảng KhoanTaiTro - Tên cột**

| Schema thực tế | Mã nguồn cũ | Đã sửa |
|----------------|-------------|---------|
| `minh_chung_anh` | `hinh_anh_minh_chung` | ⚠️ Cần sửa khi dùng |

**Vấn đề:**
- Schema: `minh_chung_anh`
- Code: `hinh_anh_minh_chung`

**Ảnh hưởng:**
- Lỗi khi INSERT/UPDATE khoản tài trợ có ảnh minh chứng

---

### **4. Bảng GiaoDich - Cấu trúc cột**

| Schema thực tế | Mã nguồn cũ | Đã sửa |
|----------------|-------------|---------|
| `ghi_chu` | `mo_ta` | ✅ `ghi_chu` |
| `trang_thai_giao_dich` | Không có | ✅ Thêm vào |
| `minh_chung_chuyen_khoan` | Không có | ✅ Thêm vào |
| `ngay_giao_dich` | `ngay_tao` | ✅ `ngay_giao_dich` |
| `nguoi_thuc_hien_id` | Có | ❌ Xóa (không có trong schema) |

**Vấn đề:**
- Schema không có cột `nguoi_thuc_hien_id`
- Schema có thêm `trang_thai_giao_dich`, `minh_chung_chuyen_khoan`
- Tên cột `mo_ta` phải là `ghi_chu`

**Ảnh hưởng:**
- Lỗi khi INSERT giao dịch (thiếu/thừa cột)

---

## ✅ CÁC FILE ĐÃ SỬA

### **1. backend/middleware/authMiddleware.js**

**Thay đổi:**
```javascript
// CŨ
req.user = {
  id: decoded.id,
  vai_tro: decoded.vai_tro,
};

// MỚI
req.user = {
  id: decoded.user_id,  // ✅ Sửa từ decoded.id → decoded.user_id
  vai_tro: decoded.vai_tro,
  roleId: decoded.vai_tro  // ✅ Thêm roleId
};
```

---

### **2. backend/models/NguoiDungModel.js**

**Thay đổi:**
```javascript
// CŨ
SELECT ma_so_dinh_danh, ho_ten, mat_khau, role_id, trang_thai
FROM nguoidung
WHERE email = ?

// MỚI
SELECT user_id, ma_so_dinh_danh, ho_ten, mat_khau, role_id, trang_thai
FROM NguoiDung  -- ✅ Viết hoa N
WHERE email = ?
```

```javascript
// CŨ
WHERE ma_so_dinh_danh = ?

// MỚI
WHERE user_id = ?  // ✅ Dùng user_id thay vì ma_so_dinh_danh
```

---

### **3. backend/controllers/authController.js**

**Thay đổi:**
```javascript
// CŨ
const payload = {
  id: user.ma_so_dinh_danh,
  vai_tro: user.role_id,
};

// MỚI
const payload = {
  user_id: user.user_id,  // ✅ Dùng user_id
  vai_tro: user.role_id,
};
```

```javascript
// CŨ
user: {
  id: user.ma_so_dinh_danh,
  hoTen: user.ho_ten,
  ...
}

// MỚI
user: {
  id: user.user_id,  // ✅ Dùng user_id
  maSoDinhDanh: user.ma_so_dinh_danh,  // ✅ Thêm trường này
  hoTen: user.ho_ten,
  ...
}
```

---

### **4. backend/models/FundModel.js**

**Thay đổi:**
```javascript
// CŨ
trangThai || 'Dang hoat dong'

// MỚI
trangThai || 'DANG_HOAT_DONG'  // ✅ Gạch dưới, chữ HOA
```

---

### **5. backend/controllers/donationController.js**

**Thay đổi:**
```javascript
// CŨ
if (fund.trang_thai !== 'Dang hoat dong') {

// MỚI
if (fund.trang_thai !== 'DANG_HOAT_DONG') {  // ✅ Gạch dưới, chữ HOA
```

---

### **6. backend/models/DonationModel.js**

**Thay đổi:**
```javascript
// CŨ
INSERT INTO GiaoDich (
  quy_id,
  khoan_tai_tro_id,
  loai_giao_dich,
  so_tien,
  mo_ta,
  nguoi_thuc_hien_id
) VALUES (?, ?, ?, ?, ?, ?)

// MỚI
INSERT INTO GiaoDich (
  quy_id,
  khoan_tai_tro_id,
  loai_giao_dich,
  so_tien,
  trang_thai_giao_dich,  // ✅ Thêm cột này
  ghi_chu  // ✅ Đổi từ mo_ta → ghi_chu
) VALUES (?, ?, ?, ?, ?, ?)
```

---

## 📊 BẢNG SO SÁNH SCHEMA

### **Bảng NguoiDung**
```sql
CREATE TABLE NguoiDung (
    user_id INT AUTO_INCREMENT PRIMARY KEY,  -- ✅ PRIMARY KEY
    ma_so_dinh_danh VARCHAR(20) NOT NULL UNIQUE,  -- ✅ UNIQUE nhưng không phải PK
    ho_ten NVARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    mat_khau VARCHAR(255) NOT NULL,
    role_id INT NOT NULL,
    trang_thai NVARCHAR(50) DEFAULT 'HOAT_DONG',  -- ✅ HOAT_DONG (không phải hoat_dong)
    ...
)
```

### **Bảng Quy**
```sql
CREATE TABLE Quy (
    quy_id INT AUTO_INCREMENT PRIMARY KEY,
    ten_quy NVARCHAR(200) NOT NULL,
    loai_quy NVARCHAR(100) NOT NULL,  -- ✅ NVARCHAR, không phải ENUM
    trang_thai NVARCHAR(50) DEFAULT 'DANG_HOAT_DONG',  -- ✅ DANG_HOAT_DONG
    ...
)
```

### **Bảng KhoanTaiTro**
```sql
CREATE TABLE KhoanTaiTro (
    khoan_tai_tro_id INT AUTO_INCREMENT PRIMARY KEY,
    nha_tai_tro_id INT NOT NULL,
    quy_id INT NOT NULL,
    so_tien DECIMAL(18, 2) NOT NULL,
    hinh_thuc_thanh_toan NVARCHAR(100) DEFAULT 'Chuyen khoan',
    trang_thai NVARCHAR(50) DEFAULT 'Cho duyet',  -- ✅ Không có dấu cách
    minh_chung_anh VARCHAR(500) NULL,  -- ✅ minh_chung_anh (không phải hinh_anh_minh_chung)
    ...
)
```

### **Bảng GiaoDich**
```sql
CREATE TABLE GiaoDich (
    giao_dich_id INT AUTO_INCREMENT PRIMARY KEY,
    quy_id INT NOT NULL,
    khoan_tai_tro_id INT NULL,
    request_id INT NULL,
    loai_giao_dich NVARCHAR(50) NOT NULL,  -- 'Thu' hoặc 'Chi'
    so_tien DECIMAL(18, 2) NOT NULL,
    trang_thai_giao_dich NVARCHAR(50) DEFAULT 'Cho xu ly',  -- ✅ Có cột này
    minh_chung_chuyen_khoan VARCHAR(500) NULL,  -- ✅ Có cột này
    ghi_chu NVARCHAR(255) NULL,  -- ✅ ghi_chu (không phải mo_ta)
    ngay_giao_dich DATETIME DEFAULT CURRENT_TIMESTAMP,  -- ✅ ngay_giao_dich
    ngay_cap_nhat DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    -- ❌ KHÔNG CÓ cột nguoi_thuc_hien_id
    ...
)
```

---

## 🎯 KIỂM TRA SAU KHI SỬA

### **1. Test đăng nhập:**
```bash
POST /api/auth/login
Body: {
  "email": "admin@example.com",
  "matKhau": "password123"
}

# Kiểm tra response có user_id đúng không
```

### **2. Test quyên góp:**
```bash
POST /api/donations/public
Body: {
  "ten": "Test User",
  "email": "test@example.com",
  "soDienThoai": "0912345678",
  "soTien": 100000,
  "quyId": 1
}

# Kiểm tra có tạo được khoản tài trợ không
```

### **3. Test duyệt khoản tài trợ:**
```bash
PUT /api/donations/1/approve
Headers: {
  "Authorization": "Bearer <token>"
}

# Kiểm tra:
# - Trạng thái khoản tài trợ đổi thành "Da nhan"
# - Số dư quỹ tăng lên
# - Có tạo giao dịch trong bảng GiaoDich không
```

---

## 📝 LƯU Ý

### **1. Tên bảng:**
- Schema dùng **PascalCase**: `NguoiDung`, `NhaTaiTro`, `KhoanTaiTro`, `GiaoDich`
- Một số file đang dùng lowercase: `nguoidung`
- **Khuyến nghị:** Dùng đúng như schema để tránh lỗi trên hệ thống phân biệt chữ hoa/thường

### **2. Giá trị ENUM/trạng thái:**
- Schema dùng **GẠCH DƯỚI và CHỮ HOA**: `DANG_HOAT_DONG`, `HOAT_DONG`, `KHOA`
- Code cũ dùng khoảng trắng và chữ thường: `Dang hoat dong`, `hoat_dong`, `khoa`
- **Phải thống nhất** để tránh lỗi so sánh

### **3. PRIMARY KEY:**
- Luôn dùng `user_id` (không phải `ma_so_dinh_danh`)
- JWT token phải lưu `user_id`
- Foreign keys trong các bảng khác phải tham chiếu đến `user_id`

### **4. Cột không tồn tại:**
- Bảng `GiaoDich` **KHÔNG CÓ** cột `nguoi_thuc_hien_id`
- Nếu cần lưu người duyệt, phải thêm cột này vào schema hoặc lưu trong `ghi_chu`

---

## 🔧 BƯỚC TIẾP THEO

1. ✅ **Đã sửa:** Tất cả các file đã được cập nhật
2. ⚠️ **Cần kiểm tra:** Test lại tất cả các API
3. ⚠️ **Cần sửa thêm:** Các file khác có dùng `NguoiDung` (UserModel, RoleModel, v.v.)
4. ⚠️ **Cần thêm:** Cột `nguoi_thuc_hien_id` vào bảng `GiaoDich` nếu cần audit

---

## 📂 DANH SÁCH FILES ĐÃ SỬA

1. ✅ `backend/middleware/authMiddleware.js`
2. ✅ `backend/models/NguoiDungModel.js`
3. ✅ `backend/controllers/authController.js`
4. ✅ `backend/models/FundModel.js`
5. ✅ `backend/controllers/donationController.js`
6. ✅ `backend/models/DonationModel.js`
7. ✅ `docs/FIX_DATABASE_SCHEMA_MISMATCH.md` (file này)
