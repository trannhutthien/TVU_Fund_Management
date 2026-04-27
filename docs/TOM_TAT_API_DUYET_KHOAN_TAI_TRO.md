# TÓM TẮT API DUYỆT KHOẢN TÀI TRỢ

## 🎯 API: PUT /api/donations/:id/approve

### **Mục đích:**
Kế toán/Admin duyệt khoản tài trợ sau khi xác nhận đã nhận tiền

### **Yêu cầu:**
- ✅ Token hợp lệ
- ✅ Quyền: Admin (role_id = 1) hoặc Kế toán (role_id = 2)
- ✅ Trạng thái khoản tài trợ: "Chờ duyệt"

---

## 📋 LUỒNG HOẠT ĐỘNG (3 BƯỚC TRONG TRANSACTION)

```
BEGIN TRANSACTION
├─ 1. Cập nhật trang_thai: "Chờ duyệt" → "Đã nhận"
├─ 2. Cộng so_tien vào so_du của Quy
└─ 3. Tạo GiaoDich với loai_giao_dich = "Thu"
COMMIT
```

---

## 📂 FILES ĐÃ THÊM/CẬP NHẬT

### **1. Routes**
✅ **`backend/routes/donationRoutes.js`**
```javascript
router.put("/:id/approve", protect, authorizeRoles(1, 2), approveDonation);
```

### **2. Controllers**
✅ **`backend/controllers/donationController.js`**
- Thêm hàm `approveDonation()`
- Validate: ID, tồn tại, trạng thái
- Gọi Model để xử lý transaction

### **3. Models**
✅ **`backend/models/DonationModel.js`**
- Thêm hàm `getDonationById()`: Lấy thông tin khoản tài trợ
- Thêm hàm `approveDonation()`: Xử lý duyệt với transaction

✅ **`backend/models/TransactionModel.js`** (MỚI)
- Hàm `createTransaction()`: Tạo giao dịch

### **4. Database**
✅ **`docs/database/create_giaodich_table.sql`** (MỚI)
- Script tạo bảng `GiaoDich`

---

## 🔄 VÍ DỤ THỰC TẾ

### **Request:**
```http
PUT /api/donations/1/approve
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **Response:**
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
    "nguoiDuyet": 2
  }
}
```

---

## 📊 THAY ĐỔI DATABASE

### **Bảng KhoanTaiTro:**
```sql
-- TRƯỚC
trang_thai = "Cho duyet"

-- SAU
trang_thai = "Da nhan"
ngay_cap_nhat = CURRENT_TIMESTAMP
```

### **Bảng Quy:**
```sql
-- TRƯỚC
so_du = 1000000

-- SAU
so_du = 1500000  (cộng thêm 500000)
ngay_cap_nhat = CURRENT_TIMESTAMP
```

### **Bảng GiaoDich:**
```sql
-- THÊM MỚI
INSERT INTO GiaoDich (
  quy_id = 1,
  khoan_tai_tro_id = 1,
  loai_giao_dich = "Thu",
  so_tien = 500000,
  mo_ta = "Duyệt khoản tài trợ #1",
  nguoi_thuc_hien_id = 2
)
```

---

## ❓ GIẢI ĐÁP CÂU HỎI

### **Q: Tại sao nhà tài trợ chưa được thêm vào bảng người dùng?**
**A:** ĐÚNG RỒI! Đây là thiết kế đúng:
- Bảng `NhaTaiTro` ≠ Bảng `nguoidung`
- Nhà tài trợ chỉ là người quyên góp (có thể là người ngoài)
- Người dùng là người có tài khoản trong hệ thống
- Muốn nhà tài trợ có tài khoản → Admin phải tạo thủ công

### **Q: Khi nào nhà tài trợ được cộng tiền vào quỹ?**
**A:** Khi Kế toán/Admin gọi API `PUT /api/donations/:id/approve`
- Trước khi duyệt: Trạng thái = "Chờ duyệt", quỹ chưa được cộng tiền
- Sau khi duyệt: Trạng thái = "Đã nhận", quỹ được cộng tiền

---

## 🔒 BẢO MẬT

- ✅ Middleware `protect`: Kiểm tra JWT token
- ✅ Middleware `authorizeRoles(1, 2)`: Chỉ Admin và Kế toán
- ✅ Transaction: Đảm bảo tính toàn vẹn dữ liệu
- ✅ Rollback: Nếu có lỗi, không lưu gì vào database

---

## 📖 TÀI LIỆU CHI TIẾT

Xem file `docs/LUONG_DUYET_KHOAN_TAI_TRO.md` để hiểu rõ hơn về:
- Luồng hoạt động chi tiết từng bước
- Ví dụ SQL queries
- Test cases
- Xử lý lỗi
