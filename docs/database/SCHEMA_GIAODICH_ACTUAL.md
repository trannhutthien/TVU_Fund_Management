# SCHEMA BẢNG GIAODICH - THỰC TẾ TRONG DATABASE

## 📋 SCHEMA THỰC TẾ (ĐÃ KIỂM TRA)

```sql
CREATE TABLE GiaoDich (
    transaction_id INT(11) AUTO_INCREMENT PRIMARY KEY,
    quy_id INT(11) NOT NULL,
    khoan_tai_tro_id INT(11) NULL,
    request_id INT(11) NULL,
    nguoi_tao_id INT(11) NULL,
    so_tien DECIMAL(18,2) NOT NULL,
    loai ENUM('Thu','Chi') NOT NULL,
    trang_thai ENUM('Cho xu ly','Thanh cong','That bai','Hoan tien') NOT NULL,
    minh_chung_chuyen_khoan VARCHAR(500) NULL,
    ghi_chu VARCHAR(255) NULL,
    ngay_giao_dich DATETIME NULL,
    ngay_cap_nhat DATETIME NULL,
    
    FOREIGN KEY (quy_id) REFERENCES Quy(quy_id),
    FOREIGN KEY (khoan_tai_tro_id) REFERENCES KhoanTaiTro(khoan_tai_tro_id),
    FOREIGN KEY (request_id) REFERENCES YeuCauHoTro(request_id)
);
```

---

## ✅ DANH SÁCH CỘT CHÍNH XÁC

| # | Tên Cột | Kiểu Dữ Liệu | Bắt Buộc | Mô Tả |
|---|---------|--------------|----------|-------|
| 1 | `transaction_id` | INT(11) | ✅ | ID giao dịch (Primary Key, Auto) |
| 2 | `quy_id` | INT(11) | ✅ | ID quỹ |
| 3 | `khoan_tai_tro_id` | INT(11) | ❌ | ID khoản tài trợ (nếu Thu) |
| 4 | `request_id` | INT(11) | ❌ | ID yêu cầu hỗ trợ (nếu Chi) |
| 5 | `nguoi_tao_id` | INT(11) | ❌ | ID người tạo giao dịch |
| 6 | `so_tien` | DECIMAL(18,2) | ✅ | Số tiền |
| 7 | `loai` | ENUM | ✅ | 'Thu' hoặc 'Chi' |
| 8 | `trang_thai` | ENUM | ✅ | Trạng thái giao dịch |
| 9 | `minh_chung_chuyen_khoan` | VARCHAR(500) | ❌ | URL ảnh minh chứng |
| 10 | `ghi_chu` | VARCHAR(255) | ❌ | Ghi chú |
| 11 | `ngay_giao_dich` | DATETIME | ❌ | Ngày giao dịch |
| 12 | `ngay_cap_nhat` | DATETIME | ❌ | Ngày cập nhật |

---

## ⚠️ SO SÁNH VỚI SCHEMA BẠN CUNG CẤP

| Schema Cung Cấp | Schema Thực Tế | Trạng Thái |
|-----------------|----------------|------------|
| `giao_dich_id` | `transaction_id` | ❌ KHÁC |
| `loai_giao_dich` | `loai` | ❌ KHÁC |
| `trang_thai_giao_dich` | `trang_thai` | ❌ KHÁC |
| `minh_chung_chuyen_khoan` | `minh_chung_chuyen_khoan` | ✅ GIỐNG |
| `ghi_chu` | `ghi_chu` | ✅ GIỐNG |
| `ngay_giao_dich` | `ngay_giao_dich` | ✅ GIỐNG |
| `ngay_cap_nhat` | `ngay_cap_nhat` | ✅ GIỐNG |
| ❌ KHÔNG CÓ | `nguoi_tao_id` | ➕ THÊM |

---

## 💻 CÁCH SỬ DỤNG ĐÚNG TRONG CODE

### 1️⃣ INSERT Giao Dịch THU

```javascript
await connection.execute(
  `INSERT INTO GiaoDich (
    quy_id,
    khoan_tai_tro_id,
    nguoi_tao_id,
    loai,
    so_tien,
    trang_thai,
    ghi_chu
  ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
  [
    quyId,
    khoanTaiTroId,
    nguoiTaoId,
    'Thu',
    soTien,
    'Cho xu ly',
    'Duyệt khoản tài trợ #123'
  ]
);
```

### 2️⃣ INSERT Giao Dịch CHI

```javascript
await connection.execute(
  `INSERT INTO GiaoDich (
    quy_id,
    request_id,
    nguoi_tao_id,
    loai,
    so_tien,
    trang_thai,
    minh_chung_chuyen_khoan,
    ghi_chu
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  [
    quyId,
    requestId,
    nguoiTaoId,
    'Chi',
    soTien,
    'Cho xu ly',
    'https://example.com/proof.jpg',
    'Chi tiền học bổng'
  ]
);
```

### 3️⃣ SELECT Giao Dịch

```javascript
const [rows] = await pool.query(
  `SELECT 
    gd.transaction_id,
    gd.quy_id,
    gd.khoan_tai_tro_id,
    gd.request_id,
    gd.nguoi_tao_id,
    gd.loai,
    gd.so_tien,
    gd.trang_thai,
    gd.minh_chung_chuyen_khoan,
    gd.ghi_chu,
    gd.ngay_giao_dich,
    gd.ngay_cap_nhat,
    q.ten_quy
   FROM GiaoDich gd
   INNER JOIN Quy q ON gd.quy_id = q.quy_id
   WHERE gd.transaction_id = ?`,
  [transactionId]
);
```

---

## 📝 CHECKLIST SỬ DỤNG

- [x] Dùng `transaction_id` (không phải `giao_dich_id`)
- [x] Dùng `loai` (không phải `loai_giao_dich`)
- [x] Dùng `trang_thai` (không phải `trang_thai_giao_dich`)
- [x] Dùng `minh_chung_chuyen_khoan` (đúng)
- [x] Dùng `ngay_giao_dich` (không phải `ngay_tao`)
- [x] Có thể dùng `nguoi_tao_id` (cột mới)
- [x] `loai` chỉ nhận: 'Thu' hoặc 'Chi'
- [x] `trang_thai` nhận: 'Cho xu ly', 'Thanh cong', 'That bai', 'Hoan tien'

---

## 🔧 CÁC FILE ĐÃ CẬP NHẬT

1. ✅ `backend/models/TransactionModel.js` - Đã sửa tất cả tên cột
2. ✅ `backend/models/DonationModel.js` - Đã sửa INSERT statement
3. ✅ `backend/utils/checkDatabaseSchema.js` - Script kiểm tra schema

---

**Ngày kiểm tra:** 2026-04-27  
**Nguồn:** Chạy `DESCRIBE GiaoDich` trên database thực tế
