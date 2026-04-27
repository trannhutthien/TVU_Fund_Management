# LUỒNG DUYỆT KHOẢN TÀI TRỢ

## 📌 TỔNG QUAN

API `PUT /api/donations/:id/approve` là API **QUAN TRỌNG NHẤT** trong hệ thống quản lý tài trợ.

### **Vai trò:**
- Kế toán hoặc Admin xác nhận đã nhận tiền từ nhà tài trợ
- Cập nhật trạng thái khoản tài trợ
- Cộng tiền vào quỹ
- Ghi nhận giao dịch

---

## 🔐 YÊU CẦU

- ✅ **Token hợp lệ**: Phải đăng nhập
- ✅ **Quyền**: Chỉ Admin (role_id = 1) hoặc Kế toán (role_id = 2)
- ✅ **Trạng thái khoản tài trợ**: Phải là "Chờ duyệt"

---

## 🔄 LUỒNG HOẠT ĐỘNG CHI TIẾT

### **BƯỚC 1: Người dùng quyên góp (API Public)**

```
POST /api/donations/public
Body: {
  "ten": "Nguyễn Văn A",
  "email": "nguyenvana@gmail.com",
  "soDienThoai": "0912345678",
  "soTien": 500000,
  "quyId": 1,
  "ghiChu": "Ủng hộ học bổng"
}
```

**Kết quả:**
- Tạo/Dùng lại nhà tài trợ trong bảng `NhaTaiTro`
- Tạo khoản tài trợ trong bảng `KhoanTaiTro` với:
  - `trang_thai = "Chờ duyệt"`
  - `so_tien = 500000`
  - `quy_id = 1`
- Trả về thông tin ngân hàng để người dùng chuyển khoản

**Trạng thái database:**
```sql
-- Bảng KhoanTaiTro
khoan_tai_tro_id | nha_tai_tro_id | quy_id | so_tien | trang_thai
1                | 5              | 1      | 500000  | Chờ duyệt

-- Bảng Quy (CHƯA THAY ĐỔI)
quy_id | ten_quy              | so_du
1      | Quỹ học bổng         | 1000000
```

---

### **BƯỚC 2: Người dùng chuyển khoản**

Người dùng chuyển khoản theo thông tin:
- Ngân hàng: ACB
- Số tài khoản: 123456789
- Nội dung: `DONATE 1 Nguyễn Văn A`
- Số tiền: 500,000 VNĐ

---

### **BƯỚC 3: Kế toán/Admin kiểm tra và duyệt**

#### **3.1. Kế toán đăng nhập và lấy token**
```
POST /api/auth/login
Body: {
  "maSoDinhDanh": "KT001",
  "matKhau": "password123"
}

Response: {
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### **3.2. Kế toán gọi API duyệt khoản tài trợ**
```
PUT /api/donations/1/approve
Headers: {
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### **BƯỚC 4: Hệ thống xử lý (DATABASE TRANSACTION)**

#### **4.1. Validate**
- ✅ Kiểm tra token hợp lệ
- ✅ Kiểm tra quyền (Admin hoặc Kế toán)
- ✅ Kiểm tra khoản tài trợ tồn tại
- ✅ Kiểm tra trạng thái = "Chờ duyệt"

#### **4.2. BEGIN TRANSACTION**

```sql
START TRANSACTION;
```

#### **4.3. Cập nhật trạng thái khoản tài trợ**
```sql
UPDATE KhoanTaiTro 
SET trang_thai = 'Da nhan',
    ngay_cap_nhat = CURRENT_TIMESTAMP
WHERE khoan_tai_tro_id = 1 
AND trang_thai = 'Cho duyet';
```

**Kết quả:**
```sql
-- Bảng KhoanTaiTro (SAU KHI CẬP NHẬT)
khoan_tai_tro_id | nha_tai_tro_id | quy_id | so_tien | trang_thai | ngay_cap_nhat
1                | 5              | 1      | 500000  | Đã nhận    | 2026-04-27 11:00:00
```

#### **4.4. Cộng tiền vào quỹ**
```sql
UPDATE Quy 
SET so_du = so_du + 500000,
    ngay_cap_nhat = CURRENT_TIMESTAMP
WHERE quy_id = 1;
```

**Kết quả:**
```sql
-- Bảng Quy (SAU KHI CẬP NHẬT)
quy_id | ten_quy              | so_du   | ngay_cap_nhat
1      | Quỹ học bổng         | 1500000 | 2026-04-27 11:00:00
                                ↑
                        (1000000 + 500000)
```

#### **4.5. Tạo giao dịch THU**
```sql
INSERT INTO GiaoDich (
  quy_id,
  khoan_tai_tro_id,
  loai_giao_dich,
  so_tien,
  mo_ta,
  nguoi_thuc_hien_id
) VALUES (
  1,
  1,
  'Thu',
  500000,
  'Duyệt khoản tài trợ #1',
  2  -- ID của Kế toán
);
```

**Kết quả:**
```sql
-- Bảng GiaoDich (MỚI TẠO)
giao_dich_id | quy_id | khoan_tai_tro_id | loai_giao_dich | so_tien | mo_ta                    | nguoi_thuc_hien_id | ngay_tao
1            | 1      | 1                | Thu            | 500000  | Duyệt khoản tài trợ #1   | 2                  | 2026-04-27 11:00:00
```

#### **4.6. COMMIT TRANSACTION**
```sql
COMMIT;
```

---

### **BƯỚC 5: Trả về kết quả**

```json
{
  "success": true,
  "message": "Duyệt khoản tài trợ thành công",
  "donation": {
    "khoanTaiTroId": 1,
    "nhaTaiTro": {
      "id": 5,
      "ten": "Nguyễn Văn A",
      "email": "nguyenvana@gmail.com",
      "soDienThoai": "0912345678"
    },
    "quy": {
      "id": 1,
      "tenQuy": "Quỹ học bổng",
      "loaiQuy": "Hoc bong"
    },
    "soTien": 500000,
    "trangThaiCu": "Cho duyet",
    "trangThaiMoi": "Da nhan",
    "ngayTaiTro": "2026-04-27T10:00:00.000Z",
    "ngayDuyet": "2026-04-27T11:00:00.000Z",
    "nguoiDuyet": 2,
    "ghiChu": "Ủng hộ học bổng"
  }
}
```

---

## 📊 TỔNG KẾT THAY ĐỔI DATABASE

### **Trước khi duyệt:**
```
┌─────────────────────────────────────────────────────────────┐
│ KhoanTaiTro                                                 │
├─────────────────────────────────────────────────────────────┤
│ ID: 1 | Số tiền: 500,000 | Trạng thái: Chờ duyệt          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Quy                                                         │
├─────────────────────────────────────────────────────────────┤
│ ID: 1 | Tên: Quỹ học bổng | Số dư: 1,000,000              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ GiaoDich                                                    │
├─────────────────────────────────────────────────────────────┤
│ (Chưa có giao dịch nào)                                    │
└─────────────────────────────────────────────────────────────┘
```

### **Sau khi duyệt:**
```
┌─────────────────────────────────────────────────────────────┐
│ KhoanTaiTro                                                 │
├─────────────────────────────────────────────────────────────┤
│ ID: 1 | Số tiền: 500,000 | Trạng thái: Đã nhận ✅         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Quy                                                         │
├─────────────────────────────────────────────────────────────┤
│ ID: 1 | Tên: Quỹ học bổng | Số dư: 1,500,000 ⬆️           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ GiaoDich                                                    │
├─────────────────────────────────────────────────────────────┤
│ ID: 1 | Loại: Thu | Số tiền: 500,000 | Quỹ: 1 ✅          │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔒 XỬ LÝ LỖI

### **Lỗi 1: Khoản tài trợ không tồn tại**
```json
{
  "success": false,
  "message": "Không tìm thấy khoản tài trợ"
}
```

### **Lỗi 2: Khoản tài trợ đã được duyệt**
```json
{
  "success": false,
  "message": "Khoản tài trợ này đã được duyệt trước đó"
}
```

### **Lỗi 3: Khoản tài trợ đã bị từ chối**
```json
{
  "success": false,
  "message": "Không thể duyệt khoản tài trợ đã bị từ chối"
}
```

### **Lỗi 4: Không có quyền**
```json
{
  "success": false,
  "message": "Bạn không có quyền thực hiện hành động này"
}
```

### **Lỗi 5: Lỗi transaction**
- Nếu bất kỳ bước nào trong transaction thất bại
- Hệ thống tự động **ROLLBACK**
- Không có thay đổi nào được lưu vào database

---

## 💡 TẠI SAO DÙNG TRANSACTION?

### **Tình huống 1: Không dùng transaction**
```
1. Cập nhật trạng thái khoản tài trợ → ✅ Thành công
2. Cộng tiền vào quỹ → ✅ Thành công
3. Tạo giao dịch → ❌ LỖI (database crash)

KẾT QUẢ:
- Khoản tài trợ đã đổi trạng thái "Đã nhận"
- Quỹ đã được cộng tiền
- NHƯNG không có giao dịch nào được ghi nhận
→ MẤT DỮ LIỆU, KHÔNG AUDIT ĐƯỢC
```

### **Tình huống 2: Dùng transaction**
```
BEGIN TRANSACTION
1. Cập nhật trạng thái khoản tài trợ → ✅ Thành công
2. Cộng tiền vào quỹ → ✅ Thành công
3. Tạo giao dịch → ❌ LỖI (database crash)
ROLLBACK

KẾT QUẢ:
- TẤT CẢ thay đổi bị hủy bỏ
- Database trở về trạng thái ban đầu
- Kế toán có thể thử lại
→ ĐẢM BẢO TÍNH TOÀN VẸN DỮ LIỆU
```

---

## 📂 FILES ĐÃ TẠO/CẬP NHẬT

### **1. Routes**
- ✅ `backend/routes/donationRoutes.js`
  - Thêm route `PUT /:id/approve`
  - Middleware: `protect`, `authorizeRoles(1, 2)`

### **2. Controllers**
- ✅ `backend/controllers/donationController.js`
  - Thêm hàm `approveDonation()`
  - Validate và xử lý logic

### **3. Models**
- ✅ `backend/models/DonationModel.js`
  - Thêm hàm `getDonationById()`
  - Thêm hàm `approveDonation()` với transaction
- ✅ `backend/models/TransactionModel.js` (MỚI)
  - Hàm `createTransaction()` để tạo giao dịch

### **4. Database**
- ✅ `docs/database/create_giaodich_table.sql` (MỚI)
  - Script tạo bảng `GiaoDich`

### **5. Documentation**
- ✅ `docs/LUONG_DUYET_KHOAN_TAI_TRO.md` (File này)

---

## 🎯 KIỂM TRA API

### **Test Case 1: Duyệt thành công**
```bash
# 1. Đăng nhập với tài khoản Kế toán
POST /api/auth/login
Body: {"maSoDinhDanh": "KT001", "matKhau": "password"}

# 2. Duyệt khoản tài trợ
PUT /api/donations/1/approve
Headers: {"Authorization": "Bearer <token>"}

# Kết quả mong đợi: 200 OK
```

### **Test Case 2: Duyệt khoản đã duyệt**
```bash
# Duyệt lại khoản tài trợ đã duyệt
PUT /api/donations/1/approve

# Kết quả mong đợi: 400 Bad Request
# Message: "Khoản tài trợ này đã được duyệt trước đó"
```

### **Test Case 3: Không có quyền**
```bash
# Đăng nhập với tài khoản Sinh viên
POST /api/auth/login
Body: {"maSoDinhDanh": "SV001", "matKhau": "password"}

# Duyệt khoản tài trợ
PUT /api/donations/1/approve

# Kết quả mong đợi: 403 Forbidden
```

---

## 📝 GHI CHÚ

1. **Nhà tài trợ KHÔNG TỰ ĐỘNG trở thành người dùng:**
   - Bảng `NhaTaiTro` ≠ Bảng `nguoidung`
   - Nhà tài trợ chỉ là người quyên góp
   - Muốn có tài khoản → Admin phải tạo thủ công

2. **Trạng thái khoản tài trợ:**
   - `Cho duyet`: Chờ Kế toán/Admin xác nhận
   - `Da nhan`: Đã nhận tiền và cộng vào quỹ
   - `Tu choi`: Bị từ chối (có thể do thông tin sai, chuyển khoản sai...)

3. **Giao dịch THU vs CHI:**
   - `Thu`: Nhận tiền từ nhà tài trợ (API này)
   - `Chi`: Chi tiền cho học bổng, chương trình (API khác)

4. **Audit Trail:**
   - Mọi giao dịch đều được ghi nhận trong bảng `GiaoDich`
   - Có thể truy vết ai duyệt, khi nào, số tiền bao nhiêu
