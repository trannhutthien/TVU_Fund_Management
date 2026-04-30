# LUỒNG HOẠT ĐỘNG: CHUYỂN TRẠNG THÁI ĐƠN XIN HỖ TRỢ

## API: PUT /api/applications/:id/status

**Quyền:** Admin (role_id = 1) hoặc Giáo vụ (role_id = 3)

---

## 📋 SƠ ĐỒ TỔNG QUAN

```
┌─────────────────────────────────────────────────────────────────────┐
│                    LUỒNG CHUYỂN TRẠNG THÁI ĐƠN                      │
└─────────────────────────────────────────────────────────────────────┘

                        ┌──────────────────┐
                        │  Admin/Giáo vụ   │
                        │   đăng nhập      │
                        └────────┬─────────┘
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │ PUT /applications/:id/ │
                    │       status           │
                    │                        │
                    │ Body:                  │
                    │ - trangThai            │
                    │ - lyDoTuChoi (nếu cần)│
                    └────────┬───────────────┘
                             │
                             ▼
                ┌────────────────────────────┐
                │   VALIDATE DỮ LIỆU         │
                │                            │
                │ ✓ ID đơn hợp lệ?          │
                │ ✓ Trạng thái hợp lệ?      │
                │ ✓ Đơn tồn tại?            │
                │ ✓ Có thể chuyển không?    │
                └────────┬───────────────────┘
                         │
                         ▼
        ┌────────────────┴────────────────┐
        │                                  │
        ▼                                  ▼
┌───────────────┐                  ┌──────────────┐
│  Cho duyet    │                  │  Dang xu ly  │
│  (Chờ duyệt)  │                  │ (Đang xử lý) │
└───────┬───────┘                  └──────┬───────┘
        │                                  │
        │                                  │
        ▼                                  ▼
┌───────────────┐                  ┌──────────────┐
│  Da duyet     │                  │  Tu choi     │
│  (Đã duyệt)   │                  │  (Từ chối)   │
└───────────────┘                  └──────────────┘
```

---

## 🔄 CÁC TRẠNG THÁI HỢP LỆ

| Trạng thái | Giá trị DB | Mô tả |
|------------|-----------|-------|
| Chờ duyệt | `Cho duyet` | Đơn mới nộp, chưa xử lý |
| Đang xử lý | `Dang xu ly` | Đang kiểm tra hồ sơ |
| Đã duyệt | `Da duyet` | Đã phê duyệt, giải ngân |
| Từ chối | `Tu choi` | Không đủ điều kiện |

---

## 📊 LUỒNG CHI TIẾT THEO TRẠNG THÁI

### 1️⃣ DUYỆT ĐƠN (Da duyet)

```
┌─────────────────────────────────────────────────────────────┐
│                    LUỒNG DUYỆT ĐƠN                          │
└─────────────────────────────────────────────────────────────┘

1. Admin/Giáo vụ gửi request:
   PUT /api/applications/10/status
   Body: { "trangThai": "Da duyet" }
                    ↓
2. Kiểm tra đơn tồn tại
   - Lấy thông tin đơn từ DB
   - Kiểm tra trạng thái hiện tại
                    ↓
3. Validate trạng thái hiện tại
   ✓ Nếu "Cho duyet" hoặc "Dang xu ly" → OK
   ✗ Nếu "Da duyet" → Lỗi: Đã duyệt rồi
   ✗ Nếu "Tu choi" → Lỗi: Đã từ chối rồi
                    ↓
4. Kiểm tra số dư quỹ
   - Lấy thông tin quỹ
   - So sánh: so_du >= so_tien_yeu_cau
   ✗ Nếu không đủ → Lỗi: Quỹ không đủ số dư
                    ↓
5. BẮT ĐẦU TRANSACTION
                    ↓
6. Tạo giao dịch CHI
   INSERT INTO GiaoDich:
   - quy_id: ID quỹ
   - request_id: ID đơn
   - nguoi_tao_id: ID người duyệt
   - loai: 'Chi'
   - so_tien: Số tiền yêu cầu
   - trang_thai: 'Thanh cong'
   - ghi_chu: "Duyệt đơn xin hỗ trợ #10"
                    ↓
7. Trừ tiền quỹ
   UPDATE Quy
   SET so_du = so_du - so_tien_yeu_cau
   WHERE quy_id = ?
                    ↓
8. Cập nhật trạng thái đơn
   UPDATE YeuCauHoTro
   SET trang_thai = 'Da duyet',
       nguoi_duyet_id = ?,
       ngay_duyet = NOW()
   WHERE request_id = ?
                    ↓
9. COMMIT TRANSACTION
                    ↓
10. Trả về kết quả:
    - Thông tin đơn
    - Người duyệt
    - Số dư quỹ cũ/mới
    - Thông báo: "Giao dịch CHI đã được tạo"
```

**Ví dụ Request:**
```json
PUT /api/applications/10/status
Headers: Authorization: Bearer TOKEN

Body:
{
  "trangThai": "Da duyet"
}
```

**Ví dụ Response:**
```json
{
  "success": true,
  "message": "Duyệt đơn xin hỗ trợ thành công",
  "data": {
    "requestId": 10,
    "tieuDe": "Xin hỗ trợ học phí học kỳ 1 năm 2026",
    "soTienYeuCau": 5000000,
    "trangThaiCu": "Cho duyet",
    "trangThaiMoi": "Da duyet",
    "nguoiDuyet": {
      "id": 1,
      "hoTen": "Nguyễn Văn Admin",
      "email": "admin@tvu.edu.vn"
    },
    "quy": {
      "id": 1,
      "tenQuy": "Quỹ Học Bổng 2024",
      "soDuCu": 30000000,
      "soDuMoi": 25000000
    },
    "ngayDuyet": "2026-04-30T10:30:00.000Z",
    "thongBao": "Giao dịch CHI đã được tạo và số dư quỹ đã được cập nhật"
  }
}
```

---

### 2️⃣ TỪ CHỐI ĐƠN (Tu choi)

```
┌─────────────────────────────────────────────────────────────┐
│                   LUỒNG TỪ CHỐI ĐƠN                         │
└─────────────────────────────────────────────────────────────┘

1. Admin/Giáo vụ gửi request:
   PUT /api/applications/10/status
   Body: {
     "trangThai": "Tu choi",
     "lyDoTuChoi": "Hồ sơ không đầy đủ"
   }
                    ↓
2. Validate lý do từ chối
   ✗ Nếu không có lyDoTuChoi → Lỗi: Bắt buộc phải có lý do
                    ↓
3. Kiểm tra đơn tồn tại
   - Lấy thông tin đơn từ DB
   - Kiểm tra trạng thái hiện tại
                    ↓
4. Validate trạng thái hiện tại
   ✓ Nếu "Cho duyet" hoặc "Dang xu ly" → OK
   ✗ Nếu "Da duyet" → Lỗi: Đã duyệt rồi
   ✗ Nếu "Tu choi" → Lỗi: Đã từ chối rồi
                    ↓
5. BẮT ĐẦU TRANSACTION
                    ↓
6. Cập nhật trạng thái đơn
   UPDATE YeuCauHoTro
   SET trang_thai = 'Tu choi',
       nguoi_duyet_id = ?,
       ngay_duyet = NOW(),
       ly_do_tu_choi = ?
   WHERE request_id = ?
                    ↓
7. COMMIT TRANSACTION
                    ↓
8. Trả về kết quả:
   - Thông tin đơn
   - Người duyệt
   - Lý do từ chối
   
   ⚠️ LƯU Ý: KHÔNG tạo giao dịch, KHÔNG trừ tiền quỹ
```

**Ví dụ Request:**
```json
PUT /api/applications/10/status
Headers: Authorization: Bearer TOKEN

Body:
{
  "trangThai": "Tu choi",
  "lyDoTuChoi": "Hồ sơ không đầy đủ, thiếu giấy xác nhận thu nhập gia đình"
}
```

**Ví dụ Response:**
```json
{
  "success": true,
  "message": "Từ chối đơn xin hỗ trợ thành công",
  "data": {
    "requestId": 10,
    "tieuDe": "Xin hỗ trợ học phí học kỳ 1 năm 2026",
    "trangThaiCu": "Cho duyet",
    "trangThaiMoi": "Tu choi",
    "lyDoTuChoi": "Hồ sơ không đầy đủ, thiếu giấy xác nhận thu nhập gia đình",
    "nguoiDuyet": {
      "id": 1,
      "hoTen": "Nguyễn Văn Admin",
      "email": "admin@tvu.edu.vn"
    },
    "ngayDuyet": "2026-04-30T10:35:00.000Z"
  }
}
```

---

### 3️⃣ CHUYỂN SANG "ĐANG XỬ LÝ" (Dang xu ly)

```
┌─────────────────────────────────────────────────────────────┐
│              LUỒNG CHUYỂN SANG "ĐANG XỬ LÝ"                 │
└─────────────────────────────────────────────────────────────┘

1. Admin/Giáo vụ gửi request:
   PUT /api/applications/10/status
   Body: { "trangThai": "Dang xu ly" }
                    ↓
2. Kiểm tra đơn tồn tại
                    ↓
3. Validate trạng thái hiện tại
   ✓ Nếu "Cho duyet" → OK
   ✗ Nếu "Da duyet" hoặc "Tu choi" → Lỗi
                    ↓
4. BẮT ĐẦU TRANSACTION
                    ↓
5. Cập nhật trạng thái
   UPDATE YeuCauHoTro
   SET trang_thai = 'Dang xu ly',
       ngay_cap_nhat = NOW()
   WHERE request_id = ?
                    ↓
6. COMMIT TRANSACTION
                    ↓
7. Trả về kết quả
   
   ⚠️ LƯU Ý: Chỉ cập nhật trạng thái, không có thao tác khác
```

**Ví dụ Request:**
```json
PUT /api/applications/10/status
Headers: Authorization: Bearer TOKEN

Body:
{
  "trangThai": "Dang xu ly"
}
```

**Ví dụ Response:**
```json
{
  "success": true,
  "message": "Chuyển đơn sang trạng thái 'Đang xử lý' thành công",
  "data": {
    "requestId": 10,
    "tieuDe": "Xin hỗ trợ học phí học kỳ 1 năm 2026",
    "trangThaiCu": "Cho duyet",
    "trangThaiMoi": "Dang xu ly",
    "ngayCapNhat": "2026-04-30T10:40:00.000Z"
  }
}
```

---

## 🚫 CÁC TRƯỜNG HỢP LỖI

### Lỗi 1: Trạng thái không hợp lệ
```json
{
  "success": false,
  "message": "Trạng thái không hợp lệ. Chỉ chấp nhận: Cho duyet, Dang xu ly, Da duyet, Tu choi"
}
```

### Lỗi 2: Đơn không tồn tại
```json
{
  "success": false,
  "message": "Không tìm thấy đơn xin hỗ trợ"
}
```

### Lỗi 3: Đơn đã được duyệt
```json
{
  "success": false,
  "message": "Không thể thay đổi trạng thái đơn đã được duyệt"
}
```

### Lỗi 4: Đơn đã bị từ chối
```json
{
  "success": false,
  "message": "Không thể thay đổi trạng thái đơn đã bị từ chối"
}
```

### Lỗi 5: Quỹ không đủ số dư
```json
{
  "success": false,
  "message": "Quỹ không đủ số dư. Số dư hiện tại: 3,000,000 VNĐ, Số tiền yêu cầu: 5,000,000 VNĐ"
}
```

### Lỗi 6: Từ chối không có lý do
```json
{
  "success": false,
  "message": "Vui lòng cung cấp lý do từ chối"
}
```

### Lỗi 7: Không có quyền
```json
{
  "success": false,
  "message": "Bạn không có quyền truy cập"
}
```

---

## 🔐 PHÂN QUYỀN

| Role | Quyền |
|------|-------|
| Admin (1) | ✅ Chuyển trạng thái |
| Kế toán (2) | ❌ Không có quyền |
| Giáo vụ (3) | ✅ Chuyển trạng thái |
| Sinh viên (4) | ❌ Không có quyền |
| Giảng viên (5) | ❌ Không có quyền |

---

## 📝 GHI CHÚ QUAN TRỌNG

### ✅ Khi duyệt đơn (Da duyet):
1. **Tạo giao dịch CHI** trong bảng `GiaoDich`
2. **Trừ tiền quỹ** trong bảng `Quy`
3. **Cập nhật người duyệt** và **ngày duyệt**
4. Sử dụng **transaction** để đảm bảo tính toàn vẹn dữ liệu

### ❌ Khi từ chối đơn (Tu choi):
1. **KHÔNG tạo giao dịch**
2. **KHÔNG trừ tiền quỹ**
3. **Bắt buộc có lý do từ chối**
4. Cập nhật người duyệt và ngày duyệt

### 🔄 Quy tắc chuyển trạng thái:
- ✅ `Cho duyet` → `Dang xu ly` → `Da duyet`
- ✅ `Cho duyet` → `Tu choi`
- ✅ `Dang xu ly` → `Da duyet`
- ✅ `Dang xu ly` → `Tu choi`
- ❌ `Da duyet` → Không thể chuyển
- ❌ `Tu choi` → Không thể chuyển

---

**Ngày tạo:** 2026-04-30  
**Phiên bản:** 1.0  
**Người tạo:** Kiro AI Assistant
