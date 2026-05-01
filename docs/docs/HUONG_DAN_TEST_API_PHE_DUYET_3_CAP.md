# 🧪 HƯỚNG DẪN TEST API PHÊ DUYỆT 3 CẤP - HỆ THỐNG QUẢN LÝ QUỸ TVU

## 📋 TỔNG QUAN

Hệ thống phê duyệt đơn xin hỗ trợ theo **3 cấp độ**:

```
┌─────────────────────────────────────────────────────────────────┐
│              LUỒNG PHÊ DUYỆT 3 CẤP                              │
└─────────────────────────────────────────────────────────────────┘

1. Sinh viên nộp đơn
         ↓
   [Cho duyet] + Tạo 3 dòng phê duyệt (Cấp 1, 2, 3)
         ↓
2. Cấp 1 duyệt
         ↓
   [Dang xu ly] - Chờ cấp 2
         ↓
3. Cấp 2 duyệt
         ↓
   [Dang xu ly] - Chờ cấp 3
         ↓
4. Cấp 3 duyệt
         ↓
   ┌─────────────┴─────────────┐
   ▼                           ▼
[Đủ tiền]                 [Thiếu tiền]
   ↓                           ↓
[Da giai ngan]          [Cho giai ngan]
- Tạo giao dịch CHI     - Chờ có tiền
- Trừ tiền quỹ          - Ưu tiên đơn cũ nhất
```

---

## 🔧 CHUẨN BỊ

### **1. Chạy script cập nhật database**

```bash
cd backend
mysql -h localhost -P 3307 -u root tvu_fund_management < utils/updateYeuCauHoTroSchema.sql
```

Hoặc chạy trực tiếp trong MySQL:

```sql
-- Thêm trạng thái mới
ALTER TABLE `yeucauhotro` 
MODIFY COLUMN `trang_thai` ENUM(
  'Cho duyet',
  'Dang xu ly',
  'Da duyet',
  'Cho giai ngan',
  'Da giai ngan',
  'Tu choi'
) NOT NULL DEFAULT 'Cho duyet';

-- Thêm cột ngày giải ngân
ALTER TABLE `yeucauhotro` 
ADD COLUMN `ngay_giai_ngan` DATETIME DEFAULT NULL AFTER `ngay_duyet`;

-- Thêm cột người giải ngân
ALTER TABLE `yeucauhotro` 
ADD COLUMN `nguoi_giai_ngan_id` INT(11) DEFAULT NULL AFTER `nguoi_duyet_id`,
ADD CONSTRAINT `yeucauhotro_ibfk_4` 
  FOREIGN KEY (`nguoi_giai_ngan_id`) 
  REFERENCES `nguoidung` (`user_id`) 
  ON DELETE SET NULL 
  ON UPDATE CASCADE;
```

### **2. Khởi động server**

```bash
cd backend
npm start
```

---

## 📝 API MỚI

### **1. PUT /api/applications/:id/status - Phê duyệt đơn**

**Quyền:** Admin (1) hoặc Giáo vụ (3)

**Body:**
```json
{
  "hanhDong": "duyet",        // hoặc "tu_choi"
  "ghiChu": "Đồng ý hỗ trợ",  // Optional
  "lyDoTuChoi": "..."         // Bắt buộc nếu hanhDong = "tu_choi"
}
```

---

### **2. POST /api/applications/giai-ngan - Giải ngân các đơn chờ**

**Quyền:** Admin (1) hoặc Kế toán (2)

**Body:**
```json
{
  "quyId": 1
}
```

---

## 🎯 KỊCH BẢN TEST HOÀN CHỈNH

### **BƯỚC 1: Sinh viên nộp đơn**

```http
POST /api/applications
Headers: Authorization: Bearer TOKEN_SINH_VIEN

Body:
{
  "quyId": 1,
  "tieuDe": "Xin hỗ trợ học phí học kỳ 1 năm 2026",
  "moTa": "Em là sinh viên năm 3 khoa Công nghệ thông tin, mã số sinh viên 2021001234. Gia đình em gặp khó khăn về tài chính...",
  "soTienYeuCau": 5000000,
  "fileDinhKem": "https://example.com/minh-chung.pdf"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Nộp đơn xin hỗ trợ thành công. Đơn của bạn đang chờ xét duyệt.",
  "data": {
    "requestId": 10,
    "tieuDe": "Xin hỗ trợ học phí học kỳ 1 năm 2026",
    "soTienYeuCau": 5000000,
    "quy": {
      "id": 1,
      "tenQuy": "Quỹ Học Bổng 2024",
      "loaiQuy": "Hoc bong"
    },
    "trangThai": "Cho duyet",
    "ngayNop": "2026-04-30T10:00:00.000Z",
    "thongBao": "Bạn sẽ nhận được thông báo qua email khi đơn được xét duyệt"
  }
}
```

**✅ Hệ thống tự động tạo 3 dòng phê duyệt trong bảng `PheDuyet`:**
- Cấp 1: `ket_qua = 'Cho duyet'`
- Cấp 2: `ket_qua = 'Cho duyet'`
- Cấp 3: `ket_qua = 'Cho duyet'`

---

### **BƯỚC 2: Admin đăng nhập**

```http
POST /api/auth/login

Body:
{
  "email": "admin@tvu.edu.vn",
  "password": "admin123"
}
```

→ Nhận `TOKEN_ADMIN`

---

### **BƯỚC 3: Cấp 1 duyệt đơn**

```http
PUT /api/applications/10/status
Headers: Authorization: Bearer TOKEN_ADMIN

Body:
{
  "hanhDong": "duyet",
  "ghiChu": "Hồ sơ đầy đủ, đồng ý chuyển cấp 2"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Duyệt đơn xin hỗ trợ tại cấp 1 thành công",
  "data": {
    "requestId": 10,
    "tieuDe": "Xin hỗ trợ học phí học kỳ 1 năm 2026",
    "capDuyet": 1,
    "trangThaiCu": "Cho duyet",
    "trangThaiMoi": "Dang xu ly",
    "nguoiDuyet": {
      "id": 1,
      "hoTen": "Nguyễn Văn Admin",
      "email": "admin@tvu.edu.vn"
    },
    "ngayDuyet": "2026-04-30T10:30:00.000Z",
    "thongBao": "Đơn đã được duyệt cấp 1/3. Chờ cấp 2 duyệt."
  }
}
```

**✅ Hệ thống cập nhật:**
- Bảng `PheDuyet`: Cấp 1 → `ket_qua = 'Da duyet'`, `nguoi_duyet_id = 1`
- Bảng `YeuCauHoTro`: `trang_thai = 'Dang xu ly'`

---

### **BƯỚC 4: Cấp 2 duyệt đơn**

```http
PUT /api/applications/10/status
Headers: Authorization: Bearer TOKEN_ADMIN

Body:
{
  "hanhDong": "duyet",
  "ghiChu": "Xác nhận thông tin chính xác, chuyển cấp 3"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Duyệt đơn xin hỗ trợ tại cấp 2 thành công",
  "data": {
    "requestId": 10,
    "tieuDe": "Xin hỗ trợ học phí học kỳ 1 năm 2026",
    "capDuyet": 2,
    "trangThaiCu": "Dang xu ly",
    "trangThaiMoi": "Dang xu ly",
    "nguoiDuyet": {
      "id": 1,
      "hoTen": "Nguyễn Văn Admin",
      "email": "admin@tvu.edu.vn"
    },
    "ngayDuyet": "2026-04-30T11:00:00.000Z",
    "thongBao": "Đơn đã được duyệt cấp 2/3. Chờ cấp 3 duyệt."
  }
}
```

**✅ Hệ thống cập nhật:**
- Bảng `PheDuyet`: Cấp 2 → `ket_qua = 'Da duyet'`, `nguoi_duyet_id = 1`
- Bảng `YeuCauHoTro`: `trang_thai = 'Dang xu ly'` (vẫn giữ nguyên)

---

### **BƯỚC 5A: Cấp 3 duyệt đơn (Quỹ ĐỦ TIỀN)**

```http
PUT /api/applications/10/status
Headers: Authorization: Bearer TOKEN_ADMIN

Body:
{
  "hanhDong": "duyet",
  "ghiChu": "Phê duyệt cuối cùng, đồng ý giải ngân"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Duyệt và giải ngân đơn xin hỗ trợ thành công",
  "data": {
    "requestId": 10,
    "tieuDe": "Xin hỗ trợ học phí học kỳ 1 năm 2026",
    "soTienYeuCau": 5000000,
    "capDuyet": 3,
    "trangThaiCu": "Dang xu ly",
    "trangThaiMoi": "Da giai ngan",
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
    "ngayDuyet": "2026-04-30T11:30:00.000Z",
    "ngayGiaiNgan": "2026-04-30T11:30:00.000Z",
    "thongBao": "Đơn đã được duyệt đủ 3 cấp và giải ngân thành công"
  }
}
```

**✅ Hệ thống thực hiện:**
1. Cập nhật `PheDuyet`: Cấp 3 → `ket_qua = 'Da duyet'`
2. Tạo giao dịch CHI trong bảng `GiaoDich`
3. Trừ tiền quỹ: `Quy.so_du = so_du - 5000000`
4. Cập nhật `YeuCauHoTro`: `trang_thai = 'Da giai ngan'`, `ngay_giai_ngan = NOW()`

---

### **BƯỚC 5B: Cấp 3 duyệt đơn (Quỹ THIẾU TIỀN)**

**Giả sử quỹ chỉ còn 3 triệu, đơn yêu cầu 5 triệu**

```http
PUT /api/applications/11/status
Headers: Authorization: Bearer TOKEN_ADMIN

Body:
{
  "hanhDong": "duyet",
  "ghiChu": "Phê duyệt cuối cùng, chờ giải ngân"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Duyệt đơn xin hỗ trợ thành công. Đơn đang chờ giải ngân.",
  "data": {
    "requestId": 11,
    "tieuDe": "Xin hỗ trợ mua laptop phục vụ học tập",
    "soTienYeuCau": 5000000,
    "capDuyet": 3,
    "trangThaiCu": "Dang xu ly",
    "trangThaiMoi": "Cho giai ngan",
    "nguoiDuyet": {
      "id": 1,
      "hoTen": "Nguyễn Văn Admin",
      "email": "admin@tvu.edu.vn"
    },
    "quy": {
      "id": 1,
      "tenQuy": "Quỹ Học Bổng 2024",
      "soDuHienTai": 3000000,
      "soTienThieu": 2000000
    },
    "ngayDuyet": "2026-04-30T12:00:00.000Z",
    "thongBao": "Đơn đã được duyệt đủ 3 cấp nhưng quỹ chưa đủ số dư. Đơn sẽ được giải ngân khi có tiền."
  }
}
```

**✅ Hệ thống cập nhật:**
- Bảng `PheDuyet`: Cấp 3 → `ket_qua = 'Da duyet'`
- Bảng `YeuCauHoTro`: `trang_thai = 'Cho giai ngan'`
- **KHÔNG tạo giao dịch, KHÔNG trừ tiền quỹ**

---

### **BƯỚC 6: Từ chối đơn (tại bất kỳ cấp nào)**

```http
PUT /api/applications/12/status
Headers: Authorization: Bearer TOKEN_ADMIN

Body:
{
  "hanhDong": "tu_choi",
  "lyDoTuChoi": "Hồ sơ không đầy đủ, thiếu giấy xác nhận thu nhập gia đình",
  "ghiChu": "Yêu cầu bổ sung hồ sơ"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Từ chối đơn xin hỗ trợ tại cấp 1 thành công",
  "data": {
    "requestId": 12,
    "tieuDe": "Xin hỗ trợ chi phí sinh hoạt",
    "capDuyet": 1,
    "trangThaiCu": "Cho duyet",
    "trangThaiMoi": "Tu choi",
    "lyDoTuChoi": "Hồ sơ không đầy đủ, thiếu giấy xác nhận thu nhập gia đình",
    "nguoiDuyet": {
      "id": 1,
      "hoTen": "Nguyễn Văn Admin",
      "email": "admin@tvu.edu.vn"
    },
    "ngayDuyet": "2026-04-30T12:30:00.000Z"
  }
}
```

**✅ Hệ thống cập nhật:**
- Bảng `PheDuyet`: Cấp hiện tại → `ket_qua = 'Tu choi'`, `ly_do_tu_choi = "..."`
- Bảng `YeuCauHoTro`: `trang_thai = 'Tu choi'`, `ly_do_tu_choi = "..."`

---

### **BƯỚC 7: Giải ngân các đơn chờ (khi có tiền)**

**Giả sử có 2 đơn chờ giải ngân:**
- Đơn #11: 5 triệu (ngày tạo: 2026-04-20)
- Đơn #13: 3 triệu (ngày tạo: 2026-04-25)

**Quỹ hiện có: 10 triệu**

```http
POST /api/applications/giai-ngan
Headers: Authorization: Bearer TOKEN_KE_TOAN

Body:
{
  "quyId": 1
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Giải ngân thành công 2 đơn",
  "data": {
    "quy": {
      "id": 1,
      "tenQuy": "Quỹ Học Bổng 2024",
      "soDuCu": 10000000,
      "soDuMoi": 2000000
    },
    "donDaGiaiNgan": [
      {
        "requestId": 11,
        "tieuDe": "Xin hỗ trợ mua laptop phục vụ học tập",
        "soTien": 5000000,
        "nguoiNop": {
          "hoTen": "Nguyễn Văn B",
          "email": "nguyenvanb@tvu.edu.vn"
        },
        "ngayTao": "2026-04-20T08:00:00.000Z"
      },
      {
        "requestId": 13,
        "tieuDe": "Xin hỗ trợ chi phí ăn ở",
        "soTien": 3000000,
        "nguoiNop": {
          "hoTen": "Trần Thị C",
          "email": "tranthic@tvu.edu.vn"
        },
        "ngayTao": "2026-04-25T09:00:00.000Z"
      }
    ],
    "donChuaGiaiNgan": [],
    "thongKe": {
      "tongSoDon": 2,
      "soDonDaGiaiNgan": 2,
      "soDonChuaGiaiNgan": 0
    }
  }
}
```

**✅ Hệ thống thực hiện (theo thứ tự ngày tạo cũ nhất):**
1. Giải ngân đơn #11 (ngày tạo cũ hơn)
2. Giải ngân đơn #13
3. Tạo 2 giao dịch CHI
4. Trừ tiền quỹ: 10 triệu → 2 triệu

---

## 🚫 CÁC TRƯỜNG HỢP LỖI

### **Lỗi 1: Thiếu hành động**
```json
{
  "success": false,
  "message": "Vui lòng cung cấp hành động (duyet hoặc tu_choi)"
}
```

### **Lỗi 2: Hành động không hợp lệ**
```json
{
  "success": false,
  "message": "Hành động không hợp lệ. Chỉ chấp nhận: duyet, tu_choi"
}
```

### **Lỗi 3: Từ chối không có lý do**
```json
{
  "success": false,
  "message": "Vui lòng cung cấp lý do từ chối"
}
```

### **Lỗi 4: Đơn đã giải ngân**
```json
{
  "success": false,
  "message": "Không thể thay đổi trạng thái đơn đã được giải ngân"
}
```

### **Lỗi 5: Đơn đã từ chối**
```json
{
  "success": false,
  "message": "Không thể thay đổi trạng thái đơn đã bị từ chối"
}
```

### **Lỗi 6: Đơn đã duyệt đủ 3 cấp**
```json
{
  "success": false,
  "message": "Đơn này đã được duyệt đủ 3 cấp hoặc đã bị từ chối"
}
```

---

## ✅ CHECKLIST TEST

### **Tạo đơn**
- [ ] Sinh viên nộp đơn thành công
- [ ] Hệ thống tự động tạo 3 dòng phê duyệt
- [ ] Trạng thái ban đầu: `Cho duyet`

### **Phê duyệt cấp 1**
- [ ] Duyệt cấp 1 thành công
- [ ] Trạng thái chuyển sang: `Dang xu ly`
- [ ] Cấp 2 vẫn chờ duyệt

### **Phê duyệt cấp 2**
- [ ] Duyệt cấp 2 thành công
- [ ] Trạng thái vẫn: `Dang xu ly`
- [ ] Cấp 3 vẫn chờ duyệt

### **Phê duyệt cấp 3 - Đủ tiền**
- [ ] Duyệt cấp 3 thành công
- [ ] Trạng thái: `Da giai ngan`
- [ ] Tạo giao dịch CHI
- [ ] Trừ tiền quỹ

### **Phê duyệt cấp 3 - Thiếu tiền**
- [ ] Duyệt cấp 3 thành công
- [ ] Trạng thái: `Cho giai ngan`
- [ ] KHÔNG tạo giao dịch
- [ ] KHÔNG trừ tiền quỹ

### **Từ chối đơn**
- [ ] Từ chối tại cấp 1
- [ ] Từ chối tại cấp 2
- [ ] Từ chối tại cấp 3
- [ ] Bắt buộc có lý do từ chối

### **Giải ngân đơn chờ**
- [ ] Giải ngân theo thứ tự ngày tạo cũ nhất
- [ ] Tạo giao dịch CHI cho từng đơn
- [ ] Trừ tiền quỹ đúng
- [ ] Bỏ qua đơn không đủ tiền

### **Lỗi**
- [ ] Test thiếu hành động → 400
- [ ] Test hành động không hợp lệ → 400
- [ ] Test từ chối không có lý do → 400
- [ ] Test duyệt đơn đã giải ngân → 400
- [ ] Test duyệt đơn đã từ chối → 400
- [ ] Test role không đủ quyền → 403

---

**Ngày tạo:** 2026-04-30  
**Phiên bản:** 2.0  
**Người tạo:** Kiro AI Assistant
