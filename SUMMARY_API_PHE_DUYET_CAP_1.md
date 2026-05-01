# 📋 TÓM TẮT: API PHÊ DUYỆT ĐƠN XIN HỖ TRỢ - CẤP 1 (GIÁO VỤ)

## 🎯 TỔNG QUAN

Đã hoàn thành việc xây dựng hệ thống phê duyệt đơn xin hỗ trợ theo mô hình **3 cấp duyệt**. Hiện tại đã implement:
- ✅ **Cấp 1**: Giáo vụ duyệt (API `/staff-approve`)
- ✅ **Từ chối**: Admin/Giáo vụ từ chối tại bất kỳ cấp nào (API `/reject`)
- ⏳ **Cấp 2, 3**: Chưa implement (sẽ làm sau)

---

## 📂 CÁC FILE ĐÃ THAY ĐỔI

### 1. **backend/routes/applicationRoutes.js**
**Thêm mới:**
- Route `PUT /api/applications/:id/reject` - Từ chối đơn (Admin/Giáo vụ)
- Route `PUT /api/applications/:id/staff-approve` - Giáo vụ duyệt cấp 1

**Middleware:**
- `/reject`: `protect`, `authorizeRoles(1, 3)` - Admin hoặc Giáo vụ
- `/staff-approve`: `protect`, `authorizeRoles(3)` - Chỉ Giáo vụ

---

### 2. **backend/controllers/applicationController.js**
**Thêm mới 2 hàm:**

#### **A. `rejectApplication` - Từ chối đơn**
**Chức năng:**
- Từ chối đơn xin hỗ trợ tại bất kỳ cấp nào
- Bắt buộc phải có lý do từ chối (≥ 10 ký tự)
- Không cho phép từ chối đơn đã giải ngân hoặc đã bị từ chối

**Luồng xử lý:**
1. Validate lý do từ chối
2. Kiểm tra đơn tồn tại và trạng thái hợp lệ
3. Lấy cấp độ duyệt hiện tại
4. Cập nhật `PheDuyet` cấp hiện tại: `ket_qua = 'Tu choi'`
5. Cập nhật `YeuCauHoTro`: `trang_thai = 'Tu choi'`, `ly_do_tu_choi`
6. Commit transaction

**Sử dụng transaction:** ✅ Có

---

#### **B. `staffApprove` - Giáo vụ duyệt cấp 1**
**Chức năng:**
- Giáo vụ duyệt đơn xin hỗ trợ ở cấp 1
- Chỉ duyệt được đơn ở trạng thái `'Cho duyet'`
- Chỉ duyệt được cấp 1 (không duyệt được cấp 2, 3)

**Luồng xử lý:**
1. Validate ID đơn
2. Kiểm tra đơn tồn tại
3. Kiểm tra trạng thái = `'Cho duyet'`
4. Kiểm tra cấp độ duyệt hiện tại = 1
5. Cập nhật `PheDuyet` cấp 1: `ket_qua = 'Da duyet'`, `nguoi_duyet_id`, `ngay_duyet`
6. Cập nhật `YeuCauHoTro`: `trang_thai = 'Dang xu ly'`
7. Commit transaction

**Sử dụng transaction:** ✅ Có

---

### 3. **backend/models/ApplicationModel.js**
**Không thay đổi** - Các hàm đã có sẵn:
- `createApplication` - Tạo đơn
- `getApplicationById` - Lấy thông tin đơn
- `updateApplicationStatus` - Cập nhật trạng thái
- `updateTuChoi` - Cập nhật từ chối

---

### 4. **backend/models/PheDuyetModel.js**
**Không thay đổi** - Các hàm đã có sẵn:
- `createPheDuyet` - Tạo 3 dòng phê duyệt khi tạo đơn
- `getPheDuyetByRequestId` - Lấy danh sách phê duyệt
- `updatePheDuyet` - Cập nhật kết quả phê duyệt
- `getCapDoDuyetHienTai` - Lấy cấp đang chờ duyệt
- `kiemTraDaDuyetDuCap` - Kiểm tra đã duyệt đủ 3 cấp
- `kiemTraCoCapNaoBiTuChoi` - Kiểm tra có cấp nào bị từ chối

---

### 5. **docs/docs/HUONG_DAN_TEST_TOAN_BO_API.md**
**Thêm mới:**
- Hướng dẫn test API `/reject` (Section 8.5)
- Hướng dẫn test API `/staff-approve` (Section 8.6)
- Sơ đồ luồng phê duyệt 3 cấp chi tiết
- Kịch bản test hoàn chỉnh từ đầu đến cuối
- Cập nhật checklist test

---

## 🔄 LUỒNG PHÊ DUYỆT 3 CẤP

```
┌─────────────────────────────────────────────────────────────────┐
│  GIAI ĐOẠN 1: KHỞI TẠO (Sinh viên nộp đơn)                     │
├─────────────────────────────────────────────────────────────────┤
│ API: POST /api/applications                                     │
│                                                                 │
│ Hành động:                                                      │
│ 1. Tạo 1 dòng YeuCauHoTro: trang_thai = 'Cho duyet'            │
│ 2. Tạo 3 dòng PheDuyet:                                         │
│    - Cấp 1: ket_qua = 'Cho duyet'                               │
│    - Cấp 2: ket_qua = 'Cho duyet'                               │
│    - Cấp 3: ket_qua = 'Cho duyet'                               │
│                                                                 │
│ Kết quả: Đơn xuất hiện trên màn hình Giáo vụ                   │
└─────────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────────┐
│  GIAI ĐOẠN 2: GIÁO VỤ DUYỆT CẤP 1 ✅ (Đã implement)            │
├─────────────────────────────────────────────────────────────────┤
│ API: PUT /api/applications/:id/staff-approve                    │
│ Quyền: Chỉ Giáo vụ (role_id = 3)                                │
│                                                                 │
│ Hành động:                                                      │
│ 1. Cập nhật PheDuyet cấp 1: ket_qua = 'Da duyet'                │
│ 2. Cập nhật YeuCauHoTro: trang_thai = 'Dang xu ly'              │
│                                                                 │
│ Kết quả: Đơn chuyển sang cấp 2                                  │
└─────────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────────┐
│  GIAI ĐOẠN 3: CẤP 2 DUYỆT ⏳ (Chưa implement)                  │
├─────────────────────────────────────────────────────────────────┤
│ API: PUT /api/applications/:id/level2-approve (Chưa có)        │
│                                                                 │
│ Hành động:                                                      │
│ 1. Cập nhật PheDuyet cấp 2: ket_qua = 'Da duyet'                │
│ 2. YeuCauHoTro vẫn: trang_thai = 'Dang xu ly'                   │
│                                                                 │
│ Kết quả: Đơn chuyển sang cấp 3                                  │
└─────────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────────┐
│  GIAI ĐOẠN 4: CẤP 3 DUYỆT ⏳ (Chưa implement)                  │
├─────────────────────────────────────────────────────────────────┤
│ API: PUT /api/applications/:id/level3-approve (Chưa có)        │
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
│ 3. Giải ngân lần lượt:                                          │
│    - Tạo giao dịch CHI                                          │
│    - Trừ tiền quỹ                                               │
│    - Cập nhật: trang_thai = 'Da giai ngan'                      │
│                                                                 │
│ Kết quả: Đơn cũ được ưu tiên giải ngân                          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  TỪ CHỐI TẠI BẤT KỲ CẤP NÀO ✅ (Đã implement)                  │
├─────────────────────────────────────────────────────────────────┤
│ API: PUT /api/applications/:id/reject                           │
│ Quyền: Admin (1) hoặc Giáo vụ (3)                               │
│                                                                 │
│ Hành động:                                                      │
│ 1. Cập nhật PheDuyet cấp hiện tại: ket_qua = 'Tu choi'          │
│ 2. Cập nhật YeuCauHoTro: trang_thai = 'Tu choi'                 │
│                                                                 │
│ Kết quả: Đơn kết thúc, không duyệt tiếp                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔑 CÁC TRẠNG THÁI ĐƠN XIN HỖ TRỢ

| Trạng thái | Mô tả | Khi nào |
|------------|-------|---------|
| `Cho duyet` | Chờ duyệt | Mới tạo, chưa ai duyệt |
| `Dang xu ly` | Đang xử lý | Đã duyệt cấp 1 hoặc cấp 2, chưa duyệt hết 3 cấp |
| `Cho giai ngan` | Chờ giải ngân | Đã duyệt đủ 3 cấp nhưng quỹ thiếu tiền |
| `Da giai ngan` | Đã giải ngân | Đã duyệt đủ 3 cấp và đã chuyển tiền |
| `Tu choi` | Từ chối | Bị từ chối tại bất kỳ cấp nào |

---

## 🔑 CÁC TRẠNG THÁI PHÊ DUYỆT (Bảng `PheDuyet`)

| Trạng thái | Mô tả |
|------------|-------|
| `Cho duyet` | Chờ duyệt (mặc định khi tạo) |
| `Da duyet` | Đã duyệt |
| `Tu choi` | Từ chối |
| `Yeu cau bo sung` | Yêu cầu bổ sung (chưa sử dụng) |

---

## 📝 CÁCH TEST

### **Test 1: Giáo vụ duyệt cấp 1 thành công**

```bash
# Bước 1: Sinh viên đăng nhập
POST /api/auth/login
Body: {
  "email": "sinhvien@tvu.edu.vn",
  "password": "sinhvien123"
}
# → Nhận token_sinh_vien

# Bước 2: Sinh viên nộp đơn
POST /api/applications
Headers: Authorization: Bearer token_sinh_vien
Body: {
  "quyId": 1,
  "tieuDe": "Xin hỗ trợ học phí học kỳ 1 năm 2026",
  "moTa": "Em là sinh viên năm 3 khoa Công nghệ thông tin, mã số sinh viên 2021001234. Gia đình em gặp khó khăn về tài chính do ảnh hưởng của dịch bệnh...",
  "soTienYeuCau": 5000000,
  "fileDinhKem": "https://example.com/minh-chung.pdf"
}
# → Nhận requestId: 10, trang_thai: 'Cho duyet'

# Bước 3: Giáo vụ đăng nhập
POST /api/auth/login
Body: {
  "email": "giaovu@tvu.edu.vn",
  "password": "giaovu123"
}
# → Nhận token_giaovu

# Bước 4: Giáo vụ xem danh sách đơn chờ duyệt
GET /api/applications?trangThai=Cho duyet
Headers: Authorization: Bearer token_giaovu
# → Thấy đơn của sinh viên

# Bước 5: Giáo vụ duyệt cấp 1
PUT /api/applications/10/staff-approve
Headers: Authorization: Bearer token_giaovu
Body: {
  "ghiChu": "Đơn hợp lệ, chuyển lên cấp 2"
}
# → Kết quả:
# - trang_thai: 'Cho duyet' → 'Dang xu ly'
# - PheDuyet cấp 1: ket_qua = 'Da duyet'
# - Đơn chuyển sang cấp 2
```

---

### **Test 2: Giáo vụ từ chối đơn**

```bash
# Bước 1-4: Giống Test 1

# Bước 5: Giáo vụ từ chối đơn
PUT /api/applications/10/reject
Headers: Authorization: Bearer token_giaovu
Body: {
  "lyDoTuChoi": "Hồ sơ không đầy đủ, thiếu giấy xác nhận thu nhập gia đình",
  "ghiChu": "Sinh viên cần bổ sung thêm giấy tờ"
}
# → Kết quả:
# - trang_thai: 'Cho duyet' → 'Tu choi'
# - PheDuyet cấp 1: ket_qua = 'Tu choi'
# - Đơn kết thúc, không duyệt tiếp
```

---

### **Test 3: Lỗi - Giáo vụ duyệt đơn không phải cấp 1**

```bash
# Giả sử đơn đã duyệt cấp 1, đang ở cấp 2

PUT /api/applications/10/staff-approve
Headers: Authorization: Bearer token_giaovu

# → Lỗi 400:
{
  "success": false,
  "message": "Đơn này đang ở cấp 2. Giáo vụ chỉ duyệt được cấp 1."
}
```

---

### **Test 4: Lỗi - Giáo vụ duyệt đơn không phải trạng thái "Cho duyet"**

```bash
# Giả sử đơn đã chuyển sang "Dang xu ly"

PUT /api/applications/10/staff-approve
Headers: Authorization: Bearer token_giaovu

# → Lỗi 400:
{
  "success": false,
  "message": "Không thể duyệt đơn ở trạng thái \"Dang xu ly\". Chỉ duyệt được đơn ở trạng thái \"Cho duyet\"."
}
```

---

### **Test 5: Lỗi - Admin cố duyệt cấp 1 (chỉ Giáo vụ mới được)**

```bash
# Admin đăng nhập
POST /api/auth/login
Body: {
  "email": "admin@tvu.edu.vn",
  "password": "admin123"
}
# → Nhận token_admin

# Admin cố duyệt cấp 1
PUT /api/applications/10/staff-approve
Headers: Authorization: Bearer token_admin

# → Lỗi 403:
{
  "success": false,
  "message": "Bạn không có quyền truy cập"
}
```

---

## 🚀 NHỮNG GÌ CẦN LÀM TIẾP THEO

### **1. API Duyệt Cấp 2**
- Endpoint: `PUT /api/applications/:id/level2-approve`
- Quyền: Admin (1) hoặc role khác (tùy yêu cầu)
- Chức năng: Tương tự cấp 1, nhưng duyệt cấp 2

### **2. API Duyệt Cấp 3**
- Endpoint: `PUT /api/applications/:id/level3-approve`
- Quyền: Admin (1) hoặc role khác (tùy yêu cầu)
- Chức năng:
  - Duyệt cấp 3
  - Kiểm tra số dư quỹ
  - Nếu đủ tiền: Tạo giao dịch CHI + Trừ tiền → `'Da giai ngan'`
  - Nếu thiếu tiền: → `'Cho giai ngan'`

### **3. API Giải Ngân Đơn Chờ**
- Endpoint: `POST /api/applications/disburse-pending`
- Quyền: Admin (1) hoặc Kế toán (2)
- Chức năng:
  - Lấy danh sách đơn `'Cho giai ngan'`
  - Sắp xếp theo `ngay_tao` ASC (cũ nhất trước)
  - Giải ngân lần lượt cho đến khi hết tiền quỹ
  - Tạo giao dịch CHI + Trừ tiền → `'Da giai ngan'`

### **4. API Xem Lịch Sử Phê Duyệt**
- Endpoint: `GET /api/applications/:id/approval-history`
- Quyền: Admin (1), Giáo vụ (3), Sinh viên (4) - chỉ xem đơn của mình
- Chức năng:
  - Xem chi tiết 3 cấp duyệt
  - Ai duyệt, lúc nào, kết quả gì, ghi chú gì

---

## 📊 THỐNG KÊ MÃ NGUỒN

| File | Số dòng thêm | Chức năng |
|------|--------------|-----------|
| `applicationRoutes.js` | ~30 dòng | 2 routes mới + comments |
| `applicationController.js` | ~200 dòng | 2 hàm mới: `rejectApplication`, `staffApprove` |
| `ApplicationModel.js` | 0 dòng | Không thay đổi |
| `PheDuyetModel.js` | 0 dòng | Không thay đổi |
| `HUONG_DAN_TEST_TOAN_BO_API.md` | ~500 dòng | Hướng dẫn test chi tiết |

**Tổng cộng:** ~730 dòng code + documentation

---

## ✅ CHECKLIST HOÀN THÀNH

- [x] API tạo đơn xin hỗ trợ (POST `/api/applications`)
- [x] Tự động tạo 3 dòng phê duyệt khi tạo đơn
- [x] API từ chối đơn (PUT `/api/applications/:id/reject`)
- [x] API Giáo vụ duyệt cấp 1 (PUT `/api/applications/:id/staff-approve`)
- [x] Validation đầy đủ cho cả 2 API
- [x] Sử dụng transaction để đảm bảo tính toàn vẹn
- [x] Hướng dẫn test chi tiết
- [x] Sơ đồ luồng hoạt động
- [ ] API duyệt cấp 2 (Chưa làm)
- [ ] API duyệt cấp 3 (Chưa làm)
- [ ] API giải ngân đơn chờ (Chưa làm)
- [ ] API xem lịch sử phê duyệt (Chưa làm)

---

**Ngày hoàn thành:** 2026-05-01  
**Người thực hiện:** Kiro AI Assistant  
**Phiên bản:** 1.0
