# 📋 TÓM TẮT: API KẾ TOÁN DUYỆT CẤP 3 & GIẢI NGÂN

## 🎯 TỔNG QUAN

Đã hoàn thành việc implement API cho Kế toán duyệt đơn xin hỗ trợ ở **cấp 3 (cấp cuối cùng)** và **giải ngân tự động**. Đây là bước quan trọng nhất trong luồng phê duyệt 3 cấp, xử lý tiền tệ và sử dụng **Database Transaction** để đảm bảo an toàn.

**Tiến độ hiện tại:**
- ✅ **Cấp 1**: Giáo vụ duyệt (API `/staff-approve`)
- ✅ **Cấp 2**: Admin duyệt (API `/admin-approve`)
- ✅ **Cấp 3**: Kế toán duyệt & Giải ngân (API `/disburse`) - **MỚI**
- ✅ **Từ chối**: Admin/Giáo vụ từ chối tại bất kỳ cấp nào (API `/reject`)
- ⏳ **Giải ngân đơn chờ**: Giải ngân hàng loạt (Chưa implement)

---

## 📂 CÁC FILE ĐÃ THAY ĐỔI

### 1. **backend/routes/applicationRoutes.js**
**Thêm mới:**
- Route `POST /api/applications/:id/disburse` - Kế toán duyệt cấp 3 & giải ngân
- Import hàm `disburseApplication` từ controller

**Middleware:**
- `/disburse`: `protect`, `authorizeRoles(2)` - Chỉ Kế toán

---

### 2. **backend/controllers/applicationController.js**
**Thêm mới:**
- Import `TransactionModel` để tạo giao dịch CHI
- Hàm `disburseApplication` (~250 dòng)

#### **Chức năng:**
- Kế toán duyệt đơn xin hỗ trợ ở cấp 3 (cấp cuối cùng)
- Kiểm tra cấp 1 và cấp 2 đã duyệt
- Kiểm tra số dư quỹ và xử lý 2 trường hợp:
  - **Đủ tiền:** Giải ngân ngay (trừ tiền + tạo giao dịch)
  - **Thiếu tiền:** Chờ giải ngân (không trừ tiền)

#### **Luồng xử lý:**
1. Validate ID đơn
2. Kiểm tra đơn tồn tại
3. Kiểm tra trạng thái = `'Dang xu ly'` (đã qua cấp 1 và 2)
4. Kiểm tra cấp 1 đã duyệt
5. Kiểm tra cấp 2 đã duyệt
6. Kiểm tra cấp độ duyệt hiện tại = 3
7. Lấy số dư quỹ và số tiền yêu cầu
8. **Kiểm tra số dư quỹ:**
   - **A. Đủ tiền (so_du >= so_tien_yeu_cau):**
     * Trừ tiền quỹ: `UPDATE Quy SET so_du = so_du - so_tien`
     * Tạo giao dịch CHI: `INSERT INTO GiaoDich`
     * Cập nhật `PheDuyet` cấp 3: `ket_qua = 'Da duyet'`
     * Cập nhật `YeuCauHoTro`: `trang_thai = 'Da giai ngan'`
   - **B. Thiếu tiền (so_du < so_tien_yeu_cau):**
     * Cập nhật `PheDuyet` cấp 3: `ket_qua = 'Da duyet'`
     * Cập nhật `YeuCauHoTro`: `trang_thai = 'Cho giai ngan'`
9. Commit transaction
10. Trả về kết quả

**Sử dụng transaction:** ✅ Có (quan trọng để đảm bảo tính toàn vẹn dữ liệu tiền tệ)

---

### 3. **docs/docs/HUONG_DAN_TEST_TOAN_BO_API.md**
**Thêm mới:**
- Hướng dẫn test API `/disburse` (Section 8.8)
- Sơ đồ luồng duyệt cấp 3 và giải ngân chi tiết
- 2 trường hợp test: Đủ tiền và Thiếu tiền
- Cập nhật kịch bản test (Bước 9)
- Cập nhật checklist test

---

## 🔄 LUỒNG PHÊ DUYỆT 3 CẤP (HOÀN CHỈNH)

```
┌─────────────────────────────────────────────────────────────────┐
│  GIAI ĐOẠN 1: KHỞI TẠO (Sinh viên nộp đơn) ✅                  │
├─────────────────────────────────────────────────────────────────┤
│ API: POST /api/applications                                     │
│                                                                 │
│ Hành động:                                                      │
│ 1. Tạo 1 dòng YeuCauHoTro: trang_thai = 'Cho duyet'            │
│ 2. Tạo 3 dòng PheDuyet (cấp 1, 2, 3): ket_qua = 'Cho duyet'    │
│                                                                 │
│ Kết quả: Đơn xuất hiện trên màn hình Giáo vụ                   │
└─────────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────────┐
│  GIAI ĐOẠN 2: GIÁO VỤ DUYỆT CẤP 1 ✅                           │
├─────────────────────────────────────────────────────────────────┤
│ API: PUT /api/applications/:id/staff-approve                    │
│ Quyền: Chỉ Giáo vụ (role_id = 3)                                │
│                                                                 │
│ Hành động:                                                      │
│ 1. Cập nhật PheDuyet cấp 1: ket_qua = 'Da duyet'                │
│ 2. Cập nhật YeuCauHoTro: trang_thai = 'Dang xu ly'              │
│                                                                 │
│ Kết quả: Đơn chuyển sang cấp 2, xuất hiện trên màn hình Admin  │
└─────────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────────┐
│  GIAI ĐOẠN 3: ADMIN DUYỆT CẤP 2 ✅                             │
├─────────────────────────────────────────────────────────────────┤
│ API: PUT /api/applications/:id/admin-approve                    │
│ Quyền: Chỉ Admin (role_id = 1)                                  │
│                                                                 │
│ Hành động:                                                      │
│ 1. Cập nhật PheDuyet cấp 2: ket_qua = 'Da duyet'                │
│ 2. YeuCauHoTro VẪN GIỮ: trang_thai = 'Dang xu ly'               │
│                                                                 │
│ Kết quả: Đơn chuyển sang cấp 3, xuất hiện trên màn hình Kế toán│
└─────────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────────┐
│  GIAI ĐOẠN 4: KẾ TOÁN DUYỆT CẤP 3 & GIẢI NGÂN ✅ (MỚI)         │
├─────────────────────────────────────────────────────────────────┤
│ API: POST /api/applications/:id/disburse                        │
│ Quyền: Chỉ Kế toán (role_id = 2)                                │
│                                                                 │
│ Điều kiện:                                                      │
│ ✓ Trạng thái đơn: 'Dang xu ly'                                  │
│ ✓ PheDuyet cấp 1: ket_qua = 'Da duyet'                          │
│ ✓ PheDuyet cấp 2: ket_qua = 'Da duyet'                          │
│                                                                 │
│ Hành động:                                                      │
│ 1. Cập nhật PheDuyet cấp 3: ket_qua = 'Da duyet'                │
│ 2. Kiểm tra số dư quỹ:                                          │
│                                                                 │
│    ┌─────────────────────────────────────────────────────┐     │
│    │ A. QUỸ ĐỦ TIỀN (so_du >= so_tien_yeu_cau)          │     │
│    ├─────────────────────────────────────────────────────┤     │
│    │ - Trừ tiền quỹ                                      │     │
│    │ - Tạo giao dịch CHI (loai='Chi', trang_thai=       │     │
│    │   'Thanh cong')                                     │     │
│    │ - trang_thai = 'Da giai ngan'                       │     │
│    │                                                     │     │
│    │ Kết quả: Đơn hoàn tất, tiền đã chuyển              │     │
│    └─────────────────────────────────────────────────────┘     │
│                                                                 │
│    ┌─────────────────────────────────────────────────────┐     │
│    │ B. QUỸ THIẾU TIỀN (so_du < so_tien_yeu_cau)        │     │
│    ├─────────────────────────────────────────────────────┤     │
│    │ - KHÔNG trừ tiền quỹ                                │     │
│    │ - KHÔNG tạo giao dịch                               │     │
│    │ - trang_thai = 'Cho giai ngan'                      │     │
│    │                                                     │     │
│    │ Kết quả: Đơn chờ giải ngân khi quỹ có tiền         │     │
│    └─────────────────────────────────────────────────────┘     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────────┐
│  GIAI ĐOẠN 5: GIẢI NGÂN ĐƠN CHỜ ⏳ (Chưa implement)            │
├─────────────────────────────────────────────────────────────────┤
│ API: POST /api/applications/disburse-pending (Chưa có)         │
│                                                                 │
│ Hành động:                                                      │
│ 1. Lấy danh sách: trang_thai = 'Cho giai ngan'                 │
│ 2. Sắp xếp theo ngay_tao ASC (cũ nhất trước)                    │
│ 3. Giải ngân lần lượt cho đến khi hết tiền quỹ                  │
│                                                                 │
│ Kết quả: Đơn cũ được ưu tiên giải ngân                          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  TỪ CHỐI TẠI BẤT KỲ CẤP NÀO ✅                                 │
├─────────────────────────────────────────────────────────────────┤
│ API: PUT /api/applications/:id/reject                           │
│ Quyền: Admin (1) hoặc Giáo vụ (3)                               │
│                                                                 │
│ Kết quả: Đơn kết thúc với trang_thai = 'Tu choi'                │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📝 CÁCH TEST

### **Test 1: Kế toán duyệt cấp 3 - Quỹ đủ tiền (Giải ngân ngay)**

```bash
# Bước 1-7: Giống như trước (Sinh viên nộp đơn → Giáo vụ duyệt cấp 1 → Admin duyệt cấp 2)

# Bước 8: Kế toán đăng nhập
POST /api/auth/login
Body: {"email": "ketoan@tvu.edu.vn", "password": "ketoan123"}
# → Nhận token_ketoan

# Bước 9: Kế toán xem danh sách đơn đang xử lý
GET /api/applications?trangThai=Dang xu ly
Headers: Authorization: Bearer token_ketoan
# → Thấy đơn của sinh viên (requestId: 10)

# Bước 10: Kiểm tra số dư quỹ
GET /api/funds/1
Headers: Authorization: Bearer token_ketoan
# → Giả sử: so_du = 30,000,000 VNĐ
# → Đơn yêu cầu: 5,000,000 VNĐ
# → Đủ tiền để giải ngân

# Bước 11: Kế toán duyệt cấp 3 và giải ngân
POST /api/applications/10/disburse
Headers: Authorization: Bearer token_ketoan
Body: {
  "ghiChu": "Đơn hợp lệ, giải ngân cho sinh viên"
}

# → Kết quả:
# - trang_thai: 'Dang xu ly' → 'Da giai ngan'
# - PheDuyet cấp 3: ket_qua = 'Da duyet', nguoi_duyet_id = 2
# - Quỹ: so_du = 30,000,000 → 25,000,000 (trừ 5,000,000)
# - Tạo giao dịch CHI: transaction_id = 25, loai = 'Chi', so_tien = 5,000,000
# - Đơn hoàn tất

# Bước 12: Kế toán xem giao dịch vừa tạo
GET /api/transactions/25
Headers: Authorization: Bearer token_ketoan
# → Thấy giao dịch CHI với đầy đủ thông tin
```

---

### **Test 2: Kế toán duyệt cấp 3 - Quỹ thiếu tiền (Chờ giải ngân)**

```bash
# Bước 1-10: Giống Test 1

# Bước 10: Kiểm tra số dư quỹ
GET /api/funds/1
Headers: Authorization: Bearer token_ketoan
# → Giả sử: so_du = 3,000,000 VNĐ
# → Đơn yêu cầu: 5,000,000 VNĐ
# → THIẾU 2,000,000 VNĐ

# Bước 11: Kế toán duyệt cấp 3
POST /api/applications/10/disburse
Headers: Authorization: Bearer token_ketoan
Body: {
  "ghiChu": "Đơn hợp lệ nhưng quỹ thiếu tiền"
}

# → Kết quả:
# - trang_thai: 'Dang xu ly' → 'Cho giai ngan'
# - PheDuyet cấp 3: ket_qua = 'Da duyet', nguoi_duyet_id = 2
# - Quỹ: so_du = 3,000,000 (KHÔNG THAY ĐỔI)
# - KHÔNG tạo giao dịch
# - Đơn chờ giải ngân

# Bước 12: Khi quỹ có thêm tiền (ví dụ: nhận tài trợ 10,000,000)
# → Gọi API giải ngân đơn chờ (sẽ implement sau)
POST /api/applications/disburse-pending
Headers: Authorization: Bearer token_ketoan
# → Hệ thống tự động giải ngân các đơn chờ theo thứ tự ngày tạo cũ nhất
```

---

### **Test 3: Lỗi - Kế toán duyệt đơn chưa qua cấp 1 hoặc cấp 2**

```bash
# Giả sử đơn mới tạo, chưa ai duyệt (trang_thai = 'Cho duyet')

POST /api/applications/10/disburse
Headers: Authorization: Bearer token_ketoan

# → Lỗi 400:
{
  "success": false,
  "message": "Không thể duyệt đơn ở trạng thái \"Cho duyet\". Kế toán chỉ duyệt được đơn ở trạng thái \"Dang xu ly\" (đã qua cấp 1 và 2)."
}
```

---

### **Test 4: Lỗi - Admin cố duyệt cấp 3 (chỉ Kế toán mới được)**

```bash
# Admin đăng nhập
POST /api/auth/login
Body: {"email": "admin@tvu.edu.vn", "password": "admin123"}
# → Nhận token_admin

# Admin cố duyệt cấp 3
POST /api/applications/10/disburse
Headers: Authorization: Bearer token_admin

# → Lỗi 403:
{
  "success": false,
  "message": "Bạn không có quyền truy cập"
}
```

---

## 🎯 NHỮNG GÌ ĐÃ THÊM VÀO MÃ NGUỒN

| Thành phần | Nội dung |
|------------|----------|
| **Routes** | 1 route mới: `/disburse` (POST) |
| **Controllers** | 1 hàm mới: `disburseApplication` (~250 dòng) |
| **Models** | Import `TransactionModel` để tạo giao dịch |
| **Validation** | Kiểm tra trạng thái đơn, cấp 1 và 2 đã duyệt, số dư quỹ |
| **Transaction** | Đảm bảo tính toàn vẹn dữ liệu tiền tệ (quan trọng!) |
| **Logic giải ngân** | 2 trường hợp: Đủ tiền và Thiếu tiền |
| **Documentation** | Hướng dẫn test chi tiết + sơ đồ luồng |
| **Error Handling** | 8 trường hợp lỗi khác nhau |

---

## 🔑 ĐIỂM KHÁC BIỆT GIỮA CÁC CẤP DUYỆT (HOÀN CHỈNH)

| Cấp | API | Quyền | Trạng thái đầu vào | Trạng thái đầu ra | Giải ngân | Ghi chú |
|-----|-----|-------|-------------------|-------------------|-----------|---------|
| **1** | `/staff-approve` | Giáo vụ (3) | `'Cho duyet'` | `'Dang xu ly'` | ❌ | Thay đổi trạng thái |
| **2** | `/admin-approve` | Admin (1) | `'Dang xu ly'` | `'Dang xu ly'` | ❌ | Giữ nguyên trạng thái |
| **3** | `/disburse` | Kế toán (2) | `'Dang xu ly'` | `'Da giai ngan'` hoặc `'Cho giai ngan'` | ✅ | Thay đổi + Giải ngân (nếu đủ tiền) |

---

## 💰 LOGIC GIẢI NGÂN CHI TIẾT

### **Trường hợp A: Quỹ đủ tiền**

```sql
BEGIN TRANSACTION;

-- 1. Trừ tiền quỹ
UPDATE Quy 
SET so_du = so_du - 5000000,
    ngay_cap_nhat = NOW()
WHERE quy_id = 1;

-- 2. Tạo giao dịch CHI
INSERT INTO GiaoDich (
  quy_id, request_id, nguoi_tao_id,
  loai, so_tien, trang_thai, ghi_chu
) VALUES (
  1, 10, 2,
  'Chi', 5000000, 'Thanh cong', 'Giải ngân đơn xin hỗ trợ #10'
);

-- 3. Cập nhật PheDuyet cấp 3
UPDATE PheDuyet
SET ket_qua = 'Da duyet',
    nguoi_duyet_id = 2,
    ngay_duyet = NOW()
WHERE request_id = 10 AND cap_do_duyet = 3;

-- 4. Cập nhật YeuCauHoTro
UPDATE YeuCauHoTro
SET trang_thai = 'Da giai ngan',
    ngay_cap_nhat = NOW()
WHERE request_id = 10;

COMMIT;
```

### **Trường hợp B: Quỹ thiếu tiền**

```sql
BEGIN TRANSACTION;

-- 1. KHÔNG trừ tiền quỹ
-- 2. KHÔNG tạo giao dịch

-- 3. Cập nhật PheDuyet cấp 3
UPDATE PheDuyet
SET ket_qua = 'Da duyet',
    nguoi_duyet_id = 2,
    ngay_duyet = NOW()
WHERE request_id = 10 AND cap_do_duyet = 3;

-- 4. Cập nhật YeuCauHoTro
UPDATE YeuCauHoTro
SET trang_thai = 'Cho giai ngan',
    ngay_cap_nhat = NOW()
WHERE request_id = 10;

COMMIT;
```

---

## 🚀 ROADMAP TIẾP THEO

**Bước tiếp theo (Ưu tiên cao):**
1. **API Giải ngân đơn chờ** - `POST /api/applications/disburse-pending`
   - Quyền: Admin (1) hoặc Kế toán (2)
   - Lấy danh sách đơn `'Cho giai ngan'`
   - Sắp xếp theo `ngay_tao` ASC (cũ nhất trước)
   - Giải ngân lần lượt cho đến khi hết tiền quỹ
   - Tạo giao dịch CHI + Trừ tiền + Cập nhật trạng thái

2. **API Xem lịch sử phê duyệt** - `GET /api/applications/:id/approval-history`
   - Xem chi tiết 3 cấp duyệt
   - Ai duyệt, lúc nào, kết quả gì, ghi chú gì

---

## 📊 THỐNG KÊ MÃ NGUỒN

| File | Số dòng thêm | Chức năng |
|------|--------------|-----------|
| `applicationRoutes.js` | ~30 dòng | 1 route mới + comments |
| `applicationController.js` | ~250 dòng | 1 hàm mới: `disburseApplication` |
| `ApplicationModel.js` | 0 dòng | Không thay đổi |
| `PheDuyetModel.js` | 0 dòng | Không thay đổi |
| `TransactionModel.js` | 0 dòng | Sử dụng hàm có sẵn |
| `HUONG_DAN_TEST_TOAN_BO_API.md` | ~300 dòng | Hướng dẫn test chi tiết |

**Tổng cộng:** ~580 dòng code + documentation

---

## ✅ CHECKLIST HOÀN THÀNH

- [x] API tạo đơn xin hỗ trợ (POST `/api/applications`)
- [x] Tự động tạo 3 dòng phê duyệt khi tạo đơn
- [x] API từ chối đơn (PUT `/api/applications/:id/reject`)
- [x] API Giáo vụ duyệt cấp 1 (PUT `/api/applications/:id/staff-approve`)
- [x] API Admin duyệt cấp 2 (PUT `/api/applications/:id/admin-approve`)
- [x] API Kế toán duyệt cấp 3 & Giải ngân (POST `/api/applications/:id/disburse`) - **MỚI**
- [x] Logic giải ngân tự động khi đủ tiền
- [x] Logic chờ giải ngân khi thiếu tiền
- [x] Validation đầy đủ cho tất cả API
- [x] Sử dụng transaction để đảm bảo tính toàn vẹn
- [x] Hướng dẫn test chi tiết
- [x] Sơ đồ luồng hoạt động
- [ ] API giải ngân đơn chờ (Chưa làm)
- [ ] API xem lịch sử phê duyệt (Chưa làm)

---

**Ngày hoàn thành:** 2026-05-01  
**Người thực hiện:** Kiro AI Assistant  
**Phiên bản:** 1.0
