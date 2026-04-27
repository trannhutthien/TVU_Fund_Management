# SCHEMA BẢNG GIAODICH - KIỂM TRA VÀ SỬ DỤNG

## 📋 SCHEMA CHÍNH THỨC

```sql
CREATE TABLE GiaoDich (
    giao_dich_id INT AUTO_INCREMENT PRIMARY KEY,
    quy_id INT NOT NULL,
    khoan_tai_tro_id INT NULL,        -- Nếu là giao dịch Thu từ nhà tài trợ
    request_id INT NULL,               -- Nếu là giao dịch Chi cho sinh viên
    loai_giao_dich NVARCHAR(50) NOT NULL,  -- 'Thu' hoặc 'Chi'
    so_tien DECIMAL(18, 2) NOT NULL,
    trang_thai_giao_dich NVARCHAR(50) DEFAULT 'Cho xu ly',
    minh_chung_chuyen_khoan VARCHAR(500) NULL,
    ghi_chu NVARCHAR(255) NULL,
    ngay_giao_dich DATETIME DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Ràng buộc logic
    CONSTRAINT chk_nguon_giao_dich CHECK (
        khoan_tai_tro_id IS NOT NULL OR request_id IS NOT NULL
    ),
    
    -- Foreign Keys
    FOREIGN KEY (quy_id) REFERENCES Quy(quy_id) 
        ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (khoan_tai_tro_id) REFERENCES KhoanTaiTro(khoan_tai_tro_id),
    FOREIGN KEY (request_id) REFERENCES YeuCauHoTro(request_id)
);
```

---

## ✅ CÁC CỘT TRONG BẢNG

| Tên Cột | Kiểu Dữ Liệu | Mô Tả | Bắt Buộc |
|---------|--------------|-------|----------|
| `giao_dich_id` | INT | ID giao dịch (Primary Key, Auto Increment) | ✅ |
| `quy_id` | INT | ID quỹ | ✅ |
| `khoan_tai_tro_id` | INT | ID khoản tài trợ (nếu là giao dịch Thu) | ❌ |
| `request_id` | INT | ID yêu cầu hỗ trợ (nếu là giao dịch Chi) | ❌ |
| `loai_giao_dich` | NVARCHAR(50) | Loại: 'Thu' hoặc 'Chi' | ✅ |
| `so_tien` | DECIMAL(18,2) | Số tiền giao dịch | ✅ |
| `trang_thai_giao_dich` | NVARCHAR(50) | Trạng thái (mặc định: 'Cho xu ly') | ❌ |
| `minh_chung_chuyen_khoan` | VARCHAR(500) | URL ảnh minh chứng | ❌ |
| `ghi_chu` | NVARCHAR(255) | Ghi chú | ❌ |
| `ngay_giao_dich` | DATETIME | Ngày tạo (tự động) | ✅ |
| `ngay_cap_nhat` | DATETIME | Ngày cập nhật (tự động) | ✅ |

---

## 🔍 LƯU Ý QUAN TRỌNG

### ⚠️ CÁC CỘT KHÔNG TỒN TẠI (KHÔNG DÙNG)
- ❌ `mo_ta` → Dùng `ghi_chu`
- ❌ `nguoi_thuc_hien_id` → Không có trong schema
- ❌ `id` → Dùng `giao_dich_id`

### ✅ RÀNG BUỘC LOGIC
- **Phải có ít nhất 1 trong 2:**
  - `khoan_tai_tro_id` (giao dịch Thu)
  - `request_id` (giao dịch Chi)

### 📌 GIÁ TRỊ MẶC ĐỊNH
- `trang_thai_giao_dich`: `'Cho xu ly'`
- `ngay_giao_dich`: `CURRENT_TIMESTAMP`
- `ngay_cap_nhat`: `CURRENT_TIMESTAMP ON UPDATE`

---

## 💻 CÁCH SỬ DỤNG TRONG CODE

### 1️⃣ INSERT Giao Dịch THU (từ nhà tài trợ)

```javascript
await connection.execute(
  `INSERT INTO GiaoDich (
    quy_id,
    khoan_tai_tro_id,
    loai_giao_dich,
    so_tien,
    trang_thai_giao_dich,
    ghi_chu
  ) VALUES (?, ?, ?, ?, ?, ?)`,
  [
    quyId,
    khoanTaiTroId,
    'Thu',
    soTien,
    'Cho xu ly',
    'Duyệt khoản tài trợ #123'
  ]
);
```

### 2️⃣ INSERT Giao Dịch CHI (cho sinh viên)

```javascript
await connection.execute(
  `INSERT INTO GiaoDich (
    quy_id,
    request_id,
    loai_giao_dich,
    so_tien,
    trang_thai_giao_dich,
    minh_chung_chuyen_khoan,
    ghi_chu
  ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
  [
    quyId,
    requestId,
    'Chi',
    soTien,
    'Cho xu ly',
    'https://example.com/proof.jpg',
    'Chi tiền học bổng cho sinh viên'
  ]
);
```

### 3️⃣ SELECT Giao Dịch

```javascript
const [rows] = await pool.query(
  `SELECT 
    gd.giao_dich_id,
    gd.quy_id,
    gd.khoan_tai_tro_id,
    gd.request_id,
    gd.loai_giao_dich,
    gd.so_tien,
    gd.trang_thai_giao_dich,
    gd.minh_chung_chuyen_khoan,
    gd.ghi_chu,
    gd.ngay_giao_dich,
    gd.ngay_cap_nhat,
    q.ten_quy
   FROM GiaoDich gd
   INNER JOIN Quy q ON gd.quy_id = q.quy_id
   WHERE gd.giao_dich_id = ?`,
  [giaoDichId]
);
```

---

## 🧪 KIỂM TRA DATABASE

```sql
-- Kiểm tra cấu trúc bảng
DESCRIBE GiaoDich;

-- Kiểm tra dữ liệu
SELECT * FROM GiaoDich ORDER BY ngay_giao_dich DESC LIMIT 10;

-- Kiểm tra giao dịch theo loại
SELECT loai_giao_dich, COUNT(*) as so_luong, SUM(so_tien) as tong_tien
FROM GiaoDich
GROUP BY loai_giao_dich;

-- Kiểm tra giao dịch theo trạng thái
SELECT trang_thai_giao_dich, COUNT(*) as so_luong
FROM GiaoDich
GROUP BY trang_thai_giao_dich;
```

---

## 📝 CHECKLIST KHI SỬ DỤNG

- [ ] Dùng `giao_dich_id` (không phải `id`)
- [ ] Dùng `ghi_chu` (không phải `mo_ta`)
- [ ] Dùng `trang_thai_giao_dich` (không phải `trang_thai`)
- [ ] Dùng `minh_chung_chuyen_khoan` (không phải `minh_chung`)
- [ ] Đảm bảo có `khoan_tai_tro_id` HOẶC `request_id`
- [ ] `loai_giao_dich` chỉ nhận 'Thu' hoặc 'Chi'
- [ ] `trang_thai_giao_dich` mặc định là 'Cho xu ly'

---

## 🔧 CÁC FILE ĐÃ CẬP NHẬT

1. ✅ `backend/models/TransactionModel.js` - Đã sửa tên cột
2. ✅ `backend/models/DonationModel.js` - Đã kiểm tra và cập nhật comment
3. ✅ Tất cả INSERT/SELECT đều dùng đúng tên cột theo schema

---

**Ngày cập nhật:** 2026-04-27  
**Người cập nhật:** Kiro AI Assistant
