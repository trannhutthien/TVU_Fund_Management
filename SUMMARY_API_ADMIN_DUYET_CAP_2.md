# 📋 TÓM TẮT: API ADMIN DUYỆT CẤP 2

## 🎯 TỔNG QUAN

Đã hoàn thành việc implement API cho Admin duyệt đơn xin hỗ trợ ở **cấp 2**. Đây là bước tiếp theo trong luồng phê duyệt 3 cấp.

**Tiến độ hiện tại:**
- ✅ **Cấp 1**: Giáo vụ duyệt (API `/staff-approve`)
- ✅ **Cấp 2**: Admin duyệt (API `/admin-approve`) - **MỚI**
- ✅ **Từ chối**: Admin/Giáo vụ từ chối tại bất kỳ cấp nào (API `/reject`)
- ⏳ **Cấp 3**: Kế toán duyệt (Chưa implement)

---

## 📂 CÁC FILE ĐÃ THAY ĐỔI

### 1. **backend/routes/applicationRoutes.js**
**Thêm mới:**
- Route `PUT /api/applications/:id/admin-approve` - Admin duyệt cấp 2
- Import hàm `adminApprove` từ controller

**Middleware:**
- `/admin-approve`: `protect`, `authorizeRoles(1)` - Chỉ Admin

---

### 2. **backend/controllers/applicationController.js**
**Thêm mới hàm `adminApprove`** (~150 dòng)

#### **Chức năng:**
- Admin duyệt đơn xin hỗ trợ ở cấp 2
- Chỉ duyệt được đơn đã qua cấp 1 (trạng thái `'Dang xu ly'`)
- Kiểm tra cấp 1 đã duyệt (`PheDuyet` cấp 1 phải là `'Da duyet'`)
- Chỉ duyệt được cấp 2 (không duyệt được cấp 1 hoặc 3)

#### **Luồng xử lý:**
1. Validate ID đơn
2. Kiểm tra đơn tồn tại
3. Kiểm tra trạng thái = `'Dang xu ly'` (đã qua cấp 1)
4. Kiểm tra cấp 1 đã duyệt
5. Kiểm tra cấp độ duyệt hiện tại = 2
6. Cập nhật `PheDuyet` cấp 2: `ket_qua = 'Da duyet'`, `nguoi_duyet_id`, `ngay_duyet`
7. **YeuCauHoTro vẫn giữ**: `trang_thai = 'Dang xu ly'` (không thay đổi)
8. Commit transaction

**Sử dụng transaction:** ✅ Có

**Điểm khác biệt với cấp 1:**
- Cấp 1: `'Cho duyet'` → `'Dang xu ly'` (thay đổi trạng thái)
- Cấp 2: `'Dang xu ly'` → `'Dang xu ly'` (giữ nguyên trạng thái)

---

### 3. **docs/docs/HUONG_DAN_TEST_TOAN_BO_API.md**
**Thêm mới:**
- Hướng dẫn test API `/admin-approve` (Section 8.7)
- Sơ đồ luồng duyệt cấp 2 chi tiết
- Cập nhật kịch bản test (Bước 8)
- Cập nhật checklist test

---

## 🔄 LUỒNG PHÊ DUYỆT 3 CẤP (CẬP NHẬT)

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
│  GIAI ĐOẠN 3: ADMIN DUYỆT CẤP 2 ✅ (MỚI IMPLEMENT)             │
├─────────────────────────────────────────────────────────────────┤
│ API: PUT /api/applications/:id/admin-approve                    │
│ Quyền: Chỉ Admin (role_id = 1)                                  │
│                                                                 │
│ Điều kiện:                                                      │
│ ✓ Trạng thái đơn: 'Dang xu ly'                                  │
│ ✓ PheDuyet cấp 1: ket_qua = 'Da duyet'                          │
│                                                                 │
│ Hành động:                                                      │
│ 1. Cập nhật PheDuyet cấp 2: ket_qua = 'Da duyet'                │
│ 2. YeuCauHoTro VẪN GIỮ: trang_thai = 'Dang xu ly'               │
│                                                                 │
│ Kết quả: Đơn chuyển sang cấp 3, xuất hiện trên màn hình Kế toán│
└─────────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────────┐
│  GIAI ĐOẠN 4: KẾ TOÁN DUYỆT CẤP 3 ⏳ (Chưa implement)          │
├─────────────────────────────────────────────────────────────────┤
│ API: PUT /api/applications/:id/accountant-approve (Chưa có)    │
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
│    A. Đủ tiền:                                                  │
│       - trang_thai = 'Da giai ngan'                             │
│       - Tạo giao dịch CHI                                       │
│       - Trừ tiền quỹ                                            │
│    B. Thiếu tiền:                                               │
│       - trang_thai = 'Cho giai ngan'                            │
│                                                                 │
│ Kết quả: Đơn hoàn tất hoặc chờ giải ngân                        │
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

### **Test 1: Admin duyệt cấp 2 thành công**

```bash
# Bước 1: Sinh viên đăng nhập và nộp đơn
POST /api/auth/login
Body: {"email": "sinhvien@tvu.edu.vn", "password": "sinhvien123"}
# → Nhận token_sinh_vien

POST /api/applications
Headers: Authorization: Bearer token_sinh_vien
Body: {
  "quyId": 1,
  "tieuDe": "Xin hỗ trợ học phí học kỳ 1 năm 2026",
  "moTa": "Em là sinh viên năm 3 khoa Công nghệ thông tin...",
  "soTienYeuCau": 5000000,
  "fileDinhKem": "https://example.com/minh-chung.pdf"
}
# → Nhận requestId: 10, trang_thai: 'Cho duyet'

# Bước 2: Giáo vụ đăng nhập và duyệt cấp 1
POST /api/auth/login
Body: {"email": "giaovu@tvu.edu.vn", "password": "giaovu123"}
# → Nhận token_giaovu

PUT /api/applications/10/staff-approve
Headers: Authorization: Bearer token_giaovu
Body: {"ghiChu": "Đơn hợp lệ"}
# → trang_thai: 'Cho duyet' → 'Dang xu ly'
# → PheDuyet cấp 1: ket_qua = 'Da duyet'

# Bước 3: Admin đăng nhập
POST /api/auth/login
Body: {"email": "admin@tvu.edu.vn", "password": "admin123"}
# → Nhận token_admin

# Bước 4: Admin xem danh sách đơn đang xử lý
GET /api/applications?trangThai=Dang xu ly
Headers: Authorization: Bearer token_admin
# → Thấy đơn của sinh viên (requestId: 10)

# Bước 5: Admin duyệt cấp 2
PUT /api/applications/10/admin-approve
Headers: Authorization: Bearer token_admin
Body: {
  "ghiChu": "Đơn hợp lệ, chuyển lên Kế toán duyệt cấp 3"
}

# → Kết quả:
# - trang_thai: VẪN 'Dang xu ly' (không thay đổi)
# - PheDuyet cấp 2: ket_qua = 'Da duyet', nguoi_duyet_id = 1
# - Đơn chuyển sang cấp 3, xuất hiện trên màn hình Kế toán
```

---

### **Test 2: Lỗi - Admin duyệt đơn chưa qua cấp 1**

```bash
# Giả sử đơn mới tạo, chưa ai duyệt (trang_thai = 'Cho duyet')

PUT /api/applications/10/admin-approve
Headers: Authorization: Bearer token_admin

# → Lỗi 400:
{
  "success": false,
  "message": "Không thể duyệt đơn ở trạng thái \"Cho duyet\". Admin chỉ duyệt được đơn ở trạng thái \"Dang xu ly\" (đã qua cấp 1)."
}
```

---

### **Test 3: Lỗi - Admin duyệt đơn cấp 1 chưa duyệt**

```bash
# Giả sử đơn ở trạng thái 'Dang xu ly' nhưng cấp 1 chưa duyệt
# (Trường hợp này không nên xảy ra trong thực tế)

PUT /api/applications/10/admin-approve
Headers: Authorization: Bearer token_admin

# → Lỗi 400:
{
  "success": false,
  "message": "Cấp 1 chưa duyệt. Admin chỉ duyệt được sau khi Giáo vụ duyệt cấp 1."
}
```

---

### **Test 4: Lỗi - Admin duyệt đơn không phải cấp 2**

```bash
# Giả sử đơn đã duyệt cấp 2, đang ở cấp 3

PUT /api/applications/10/admin-approve
Headers: Authorization: Bearer token_admin

# → Lỗi 400:
{
  "success": false,
  "message": "Đơn này đang ở cấp 3. Admin chỉ duyệt được cấp 2."
}
```

---

### **Test 5: Lỗi - Giáo vụ cố duyệt cấp 2 (chỉ Admin mới được)**

```bash
# Giáo vụ đăng nhập
POST /api/auth/login
Body: {"email": "giaovu@tvu.edu.vn", "password": "giaovu123"}
# → Nhận token_giaovu

# Giáo vụ cố duyệt cấp 2
PUT /api/applications/10/admin-approve
Headers: Authorization: Bearer token_giaovu

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
| **Routes** | 1 route mới: `/admin-approve` |
| **Controllers** | 1 hàm mới: `adminApprove` (~150 dòng) |
| **Validation** | Kiểm tra trạng thái đơn, cấp 1 đã duyệt, cấp độ duyệt |
| **Transaction** | Đảm bảo tính toàn vẹn dữ liệu |
| **Documentation** | Hướng dẫn test chi tiết + sơ đồ luồng |
| **Error Handling** | Xử lý đầy đủ các trường hợp lỗi |

---

## 🔑 ĐIỂM KHÁC BIỆT GIỮA CÁC CẤP DUYỆT

| Cấp | API | Quyền | Trạng thái đầu vào | Trạng thái đầu ra | Ghi chú |
|-----|-----|-------|-------------------|-------------------|---------|
| **1** | `/staff-approve` | Giáo vụ (3) | `'Cho duyet'` | `'Dang xu ly'` | Thay đổi trạng thái đơn |
| **2** | `/admin-approve` | Admin (1) | `'Dang xu ly'` | `'Dang xu ly'` | **Giữ nguyên** trạng thái đơn |
| **3** | `/accountant-approve` | Kế toán (2) | `'Dang xu ly'` | `'Da giai ngan'` hoặc `'Cho giai ngan'` | Thay đổi trạng thái đơn + Giải ngân |

---

## 🚀 ROADMAP TIẾP THEO

### **1. API Kế toán duyệt cấp 3** (Ưu tiên cao)
- **Endpoint:** `PUT /api/applications/:id/accountant-approve`
- **Quyền:** Kế toán (role_id = 2)
- **Chức năng:**
  - Duyệt cấp 3 (cấp cuối cùng)
  - Kiểm tra cấp 1 và cấp 2 đã duyệt
  - Kiểm tra số dư quỹ:
    - Đủ tiền → `'Da giai ngan'` (tạo giao dịch CHI + trừ tiền)
    - Thiếu tiền → `'Cho giai ngan'`

### **2. API Giải Ngân Đơn Chờ**
- **Endpoint:** `POST /api/applications/disburse-pending`
- **Quyền:** Admin (1) hoặc Kế toán (2)
- **Chức năng:**
  - Lấy danh sách đơn `'Cho giai ngan'`
  - Sắp xếp theo `ngay_tao` ASC (cũ nhất trước)
  - Giải ngân lần lượt cho đến khi hết tiền quỹ

### **3. API Xem Lịch Sử Phê Duyệt**
- **Endpoint:** `GET /api/applications/:id/approval-history`
- **Quyền:** Admin (1), Giáo vụ (3), Kế toán (2), Sinh viên (4) - chỉ xem đơn của mình
- **Chức năng:**
  - Xem chi tiết 3 cấp duyệt
  - Ai duyệt, lúc nào, kết quả gì, ghi chú gì

---

## 📊 THỐNG KÊ MÃ NGUỒN

| File | Số dòng thêm | Chức năng |
|------|--------------|-----------|
| `applicationRoutes.js` | ~20 dòng | 1 route mới + comments |
| `applicationController.js` | ~150 dòng | 1 hàm mới: `adminApprove` |
| `ApplicationModel.js` | 0 dòng | Không thay đổi |
| `PheDuyetModel.js` | 0 dòng | Không thay đổi |
| `HUONG_DAN_TEST_TOAN_BO_API.md` | ~200 dòng | Hướng dẫn test chi tiết |

**Tổng cộng:** ~370 dòng code + documentation

---

## ✅ CHECKLIST HOÀN THÀNH

- [x] API tạo đơn xin hỗ trợ (POST `/api/applications`)
- [x] Tự động tạo 3 dòng phê duyệt khi tạo đơn
- [x] API từ chối đơn (PUT `/api/applications/:id/reject`)
- [x] API Giáo vụ duyệt cấp 1 (PUT `/api/applications/:id/staff-approve`)
- [x] API Admin duyệt cấp 2 (PUT `/api/applications/:id/admin-approve`) - **MỚI**
- [x] Validation đầy đủ cho tất cả API
- [x] Sử dụng transaction để đảm bảo tính toàn vẹn
- [x] Hướng dẫn test chi tiết
- [x] Sơ đồ luồng hoạt động
- [ ] API Kế toán duyệt cấp 3 (Chưa làm)
- [ ] API giải ngân đơn chờ (Chưa làm)
- [ ] API xem lịch sử phê duyệt (Chưa làm)

---

**Ngày hoàn thành:** 2026-05-01  
**Người thực hiện:** Kiro AI Assistant  
**Phiên bản:** 1.0
