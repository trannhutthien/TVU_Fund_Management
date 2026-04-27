# LUỒNG CHUYỂN TRẠNG THÁI KHOẢN TÀI TRỢ

## 📌 CÁC TRẠNG THÁI

```
┌─────────────────────────────────────────────────────────────┐
│ TRẠNG THÁI TRONG BẢNG KhoanTaiTro                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. "Cho duyet"   → Chờ Kế toán/Admin xác nhận            │
│  2. "Da nhan"     → Đã duyệt, tiền đã vào quỹ             │
│  3. "Tu choi"     → Bị từ chối                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 SƠ ĐỒ CHUYỂN TRẠNG THÁI

```
                    ┌──────────────┐
                    │              │
                    │  Cho duyet   │  ← Trạng thái ban đầu
                    │              │
                    └──────┬───────┘
                           │
                ┌──────────┴──────────┐
                │                     │
                │                     │
    PUT /approve│                     │PUT /reject
    (Duyệt)     │                     │(Từ chối)
                │                     │
                ↓                     ↓
        ┌──────────────┐      ┌──────────────┐
        │              │      │              │
        │  Da nhan     │      │  Tu choi     │
        │              │      │              │
        └──────────────┘      └──────────────┘
         ✅ Cộng tiền          ❌ Không cộng tiền
         ✅ Tạo giao dịch      ❌ Không tạo giao dịch
```

---

## 🎯 LUỒNG 1: DUYỆT KHOẢN TÀI TRỢ

### **API: PUT /api/donations/:id/approve**

### **Điều kiện:**
- ✅ Có token hợp lệ
- ✅ Quyền: Admin (1) hoặc Kế toán (2)
- ✅ Trạng thái hiện tại: "Cho duyet"

### **Các bước xử lý:**

```
┌─────────────────────────────────────────────────────────────┐
│ BƯỚC 1: Validate                                            │
├─────────────────────────────────────────────────────────────┤
│ ✓ Kiểm tra ID hợp lệ                                        │
│ ✓ Lấy thông tin khoản tài trợ từ database                  │
│ ✓ Kiểm tra khoản tài trợ có tồn tại không                  │
└─────────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────────┐
│ BƯỚC 2: Kiểm tra trạng thái                                 │
├─────────────────────────────────────────────────────────────┤
│ IF trang_thai === 'Da nhan'                                │
│ → Trả lỗi "Đã được duyệt trước đó"                         │
│                                                             │
│ IF trang_thai === 'Tu choi'                                │
│ → Trả lỗi "Không thể duyệt khoản đã từ chối"              │
│                                                             │
│ IF trang_thai !== 'Cho duyet'                              │
│ → Trả lỗi "Chỉ duyệt khoản đang chờ duyệt"                │
│                                                             │
│ ✅ Nếu trang_thai = 'Cho duyet' → Tiếp tục                │
└─────────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────────┐
│ BƯỚC 3: Thực hiện TRANSACTION                               │
├─────────────────────────────────────────────────────────────┤
│ BEGIN TRANSACTION                                           │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 3.1. Cập nhật trạng thái khoản tài trợ                 │ │
│ └─────────────────────────────────────────────────────────┘ │
│ UPDATE KhoanTaiTro                                          │
│ SET trang_thai = 'Da nhan',                                │
│     ngay_cap_nhat = CURRENT_TIMESTAMP                      │
│ WHERE khoan_tai_tro_id = :id                               │
│   AND trang_thai = 'Cho duyet'  ← Điều kiện quan trọng!   │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 3.2. Cộng tiền vào quỹ                                  │ │
│ └─────────────────────────────────────────────────────────┘ │
│ UPDATE Quy                                                  │
│ SET so_du = so_du + :so_tien,                              │
│     ngay_cap_nhat = CURRENT_TIMESTAMP                      │
│ WHERE quy_id = :quy_id                                      │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 3.3. Tạo giao dịch THU                                  │ │
│ └─────────────────────────────────────────────────────────┘ │
│ INSERT INTO GiaoDich (                                      │
│   quy_id, khoan_tai_tro_id, loai_giao_dich,               │
│   so_tien, trang_thai_giao_dich, ghi_chu                  │
│ ) VALUES (                                                  │
│   :quy_id, :khoan_tai_tro_id, 'Thu',                      │
│   :so_tien, 'Cho xu ly', 'Duyệt khoản tài trợ #:id'       │
│ )                                                           │
│                                                             │
│ COMMIT                                                      │
└─────────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────────┐
│ BƯỚC 4: Trả về kết quả                                      │
├─────────────────────────────────────────────────────────────┤
│ {                                                           │
│   "success": true,                                          │
│   "message": "Duyệt khoản tài trợ thành công",            │
│   "donation": {                                             │
│     "trangThaiCu": "Cho duyet",                            │
│     "trangThaiMoi": "Da nhan"                              │
│   }                                                         │
│ }                                                           │
└─────────────────────────────────────────────────────────────┘
```

### **Thay đổi database:**

| Bảng | Thay đổi |
|------|----------|
| **KhoanTaiTro** | `trang_thai`: "Cho duyet" → "Da nhan" |
| **Quy** | `so_du`: Cộng thêm số tiền |
| **GiaoDich** | INSERT record mới, loại "Thu" |

---

## 🎯 LUỒNG 2: TỪ CHỐI KHOẢN TÀI TRỢ

### **API: PUT /api/donations/:id/reject**

### **Điều kiện:**
- ✅ Có token hợp lệ
- ✅ Quyền: Admin (1) hoặc Kế toán (2)
- ✅ Trạng thái hiện tại: "Cho duyet"
- ✅ Phải có lý do từ chối

### **Các bước xử lý:**

```
┌─────────────────────────────────────────────────────────────┐
│ BƯỚC 1: Validate                                            │
├─────────────────────────────────────────────────────────────┤
│ ✓ Kiểm tra ID hợp lệ                                        │
│ ✓ Kiểm tra có nhập lý do từ chối không                     │
│ ✓ Lấy thông tin khoản tài trợ từ database                  │
│ ✓ Kiểm tra khoản tài trợ có tồn tại không                  │
└─────────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────────┐
│ BƯỚC 2: Kiểm tra trạng thái                                 │
├─────────────────────────────────────────────────────────────┤
│ IF trang_thai === 'Da nhan'                                │
│ → Trả lỗi "Không thể từ chối khoản đã duyệt"              │
│                                                             │
│ IF trang_thai === 'Tu choi'                                │
│ → Trả lỗi "Đã bị từ chối trước đó"                         │
│                                                             │
│ IF trang_thai !== 'Cho duyet'                              │
│ → Trả lỗi "Chỉ từ chối khoản đang chờ duyệt"              │
│                                                             │
│ ✅ Nếu trang_thai = 'Cho duyet' → Tiếp tục                │
└─────────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────────┐
│ BƯỚC 3: Cập nhật trạng thái (KHÔNG DÙNG TRANSACTION)       │
├─────────────────────────────────────────────────────────────┤
│ UPDATE KhoanTaiTro                                          │
│ SET trang_thai = 'Tu choi',                                │
│     ngay_cap_nhat = CURRENT_TIMESTAMP                      │
│ WHERE khoan_tai_tro_id = :id                               │
│   AND trang_thai = 'Cho duyet'  ← Điều kiện quan trọng!   │
│                                                             │
│ ❌ KHÔNG cộng tiền vào quỹ                                 │
│ ❌ KHÔNG tạo giao dịch                                      │
└─────────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────────┐
│ BƯỚC 4: Trả về kết quả                                      │
├─────────────────────────────────────────────────────────────┤
│ {                                                           │
│   "success": true,                                          │
│   "message": "Từ chối khoản tài trợ thành công",          │
│   "donation": {                                             │
│     "trangThaiCu": "Cho duyet",                            │
│     "trangThaiMoi": "Tu choi",                             │
│     "lyDoTuChoi": "Thông tin không chính xác"             │
│   }                                                         │
│ }                                                           │
└─────────────────────────────────────────────────────────────┘
```

### **Thay đổi database:**

| Bảng | Thay đổi |
|------|----------|
| **KhoanTaiTro** | `trang_thai`: "Cho duyet" → "Tu choi" |
| **Quy** | ❌ Không thay đổi |
| **GiaoDich** | ❌ Không tạo record |

---

## 📊 SO SÁNH 2 LUỒNG

| Tiêu chí | DUYỆT (approve) | TỪ CHỐI (reject) |
|----------|-----------------|------------------|
| **API** | PUT /donations/:id/approve | PUT /donations/:id/reject |
| **Quyền** | Admin, Kế toán | Admin, Kế toán |
| **Trạng thái đầu** | "Cho duyet" | "Cho duyet" |
| **Trạng thái cuối** | "Da nhan" | "Tu choi" |
| **Cộng tiền vào quỹ** | ✅ Có | ❌ Không |
| **Tạo giao dịch** | ✅ Có (loại "Thu") | ❌ Không |
| **Dùng transaction** | ✅ Có (3 thao tác) | ❌ Không (1 thao tác) |
| **Yêu cầu lý do** | ❌ Không | ✅ Có |

---

## 🔒 ĐIỀU KIỆN CHUYỂN TRẠNG THÁI

### **Điều kiện WHERE quan trọng:**

```sql
WHERE khoan_tai_tro_id = :id 
  AND trang_thai = 'Cho duyet'  ← Điều kiện này rất quan trọng!
```

**Tại sao cần điều kiện `AND trang_thai = 'Cho duyet'`?**

1. **Tránh race condition:**
   - 2 Kế toán cùng duyệt 1 khoản tài trợ
   - Người thứ 2 sẽ không UPDATE được (affectedRows = 0)

2. **Đảm bảo tính nhất quán:**
   - Chỉ chuyển từ "Chờ duyệt" → "Đã nhận" hoặc "Từ chối"
   - Không thể chuyển từ "Đã nhận" → "Từ chối" hoặc ngược lại

3. **Kiểm tra kết quả:**
   ```javascript
   if (result.affectedRows === 0) {
     throw new Error('DONATION_NOT_FOUND_OR_ALREADY_PROCESSED');
   }
   ```

---

## 🎯 VÍ DỤ THỰC TẾ

### **Tình huống 1: Duyệt thành công**

```
1. Người dùng quyên góp 500,000 VNĐ
   → Tạo khoản tài trợ #10, trạng thái "Cho duyet"
   → Quỹ: 0 VNĐ

2. Người dùng chuyển khoản 500,000 VNĐ

3. Kế toán kiểm tra sao kê → Xác nhận đã nhận tiền

4. Kế toán bấm "Duyệt"
   → PUT /api/donations/10/approve
   → Trạng thái: "Cho duyet" → "Da nhan"
   → Quỹ: 0 + 500,000 = 500,000 VNĐ
   → Tạo giao dịch THU 500,000 VNĐ
```

### **Tình huống 2: Từ chối**

```
1. Người dùng quyên góp 500,000 VNĐ
   → Tạo khoản tài trợ #11, trạng thái "Cho duyet"
   → Quỹ: 500,000 VNĐ

2. Người dùng chuyển khoản SAI nội dung

3. Kế toán kiểm tra sao kê → Không tìm thấy giao dịch

4. Kế toán bấm "Từ chối"
   → PUT /api/donations/11/reject
   → Body: { "lyDoTuChoi": "Nội dung chuyển khoản không đúng" }
   → Trạng thái: "Cho duyet" → "Tu choi"
   → Quỹ: 500,000 VNĐ (không thay đổi)
   → Không tạo giao dịch
```

### **Tình huống 3: Race condition (2 người cùng duyệt)**

```
1. Khoản tài trợ #12, trạng thái "Cho duyet"

2. Kế toán A bấm "Duyệt" lúc 10:00:00
   → BEGIN TRANSACTION
   → UPDATE ... WHERE id = 12 AND trang_thai = 'Cho duyet'
   → affectedRows = 1 ✅
   → Cộng tiền vào quỹ
   → Tạo giao dịch
   → COMMIT lúc 10:00:01

3. Kế toán B bấm "Duyệt" lúc 10:00:00.5
   → BEGIN TRANSACTION
   → UPDATE ... WHERE id = 12 AND trang_thai = 'Cho duyet'
   → affectedRows = 0 ❌ (vì A đã đổi thành "Da nhan")
   → ROLLBACK
   → Trả lỗi "Khoản tài trợ đã được duyệt"
```

---

## 📝 LƯU Ý

1. **Không thể đảo ngược:**
   - "Da nhan" → KHÔNG THỂ → "Cho duyet"
   - "Tu choi" → KHÔNG THỂ → "Cho duyet"
   - Nếu cần sửa, phải tạo khoản tài trợ mới

2. **Lý do từ chối:**
   - Schema có thể không có cột `ly_do_tu_choi`
   - Hiện tại chưa lưu lý do vào database
   - Có thể thêm cột hoặc lưu vào `ghi_chu`

3. **Transaction:**
   - DUYỆT: Dùng transaction (3 thao tác)
   - TỪ CHỐI: Không dùng transaction (1 thao tác)

4. **Audit trail:**
   - Giao dịch THU ghi nhận ai duyệt, khi nào
   - Từ chối chưa có audit (có thể thêm bảng riêng)

---

## 🔧 FILES ĐÃ TẠO/CẬP NHẬT

1. ✅ `backend/controllers/donationController.js` - Thêm hàm `rejectDonation()`
2. ✅ `backend/models/DonationModel.js` - Thêm hàm `rejectDonation()`
3. ✅ `backend/routes/donationRoutes.js` - Thêm route `PUT /:id/reject`
4. ✅ `docs/LUONG_CHUYEN_TRANG_THAI_KHOAN_TAI_TRO.md` - File này
