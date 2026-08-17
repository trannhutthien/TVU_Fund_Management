# Luồng Duyệt Đề Xuất Chương Trình 3 Cấp

## 📋 Tổng Quan

Luồng duyệt mới cho đề xuất chương trình tài trợ, đảm bảo kiểm soát chặt chẽ và minh bạch tài chính.

### Luồng Cũ (1 Bước)
```
Admin duyệt → Tạo hoạt động ngay
```

### Luồng Mới (3 Bước)
```
1. Cán bộ duyệt nội dung
   ↓
2. Kế toán xác nhận tiền + Cộng vào Quỹ Thành Phần
   ↓
3. Admin duyệt tạo hoạt động (Auto-tạo Quỹ Cấp 3)
```

---

## 🔄 Chi Tiết Luồng

### **Bước 1: Cán Bộ Duyệt Nội Dung**

**Vai trò**: Cán bộ (vaitro = 3)

**Công việc**:
- Kiểm tra thông tin đề xuất hợp lệ
- Xem xét tính khả thi
- **Cho phép sửa Quỹ Thành Phần** nếu nhà tài trợ chọn sai

**API**:
```http
POST /api/donations/propose-program/:id/approve-by-canbo
Authorization: Bearer <token>
Content-Type: application/json

{
  "ghiChu": "Đã xem xét, đề xuất hợp lệ",
  "quyThanhPhanId": 5  // Optional: Sửa quỹ nếu nhà tài trợ chọn sai
}
```

**Response**:
```json
{
  "success": true,
  "message": "Đã duyệt đề xuất thành công. Chuyển sang bước xác nhận tiền bởi kế toán.",
  "data": {
    "success": true,
    "proposalId": 123
  }
}
```

**Từ chối**:
```http
POST /api/donations/propose-program/:id/reject-by-canbo

{
  "lyDoTuChoi": "Thông tin không đầy đủ",
  "ghiChu": "Cần bổ sung hồ sơ minh chứng"
}
```

**Trạng thái sau bước 1**:
- ✅ Duyệt: `trangthai = 'Can bo da duyet'`
- ❌ Từ chối: `trangthai = 'Tu choi'`

---

### **Bước 2: Kế Toán Xác Nhận Tiền**

**Vai trò**: Kế toán (vaitro = 2)

**Công việc**:
- Xác nhận đã nhận tiền thực tế từ nhà tài trợ
- **Cộng tiền vào Quỹ Thành Phần (Cấp 2)**
- Tạo bản ghi giao dịch (audit trail)

**API**:
```http
POST /api/donations/propose-program/:id/confirm-money
Authorization: Bearer <token>
Content-Type: application/json

{
  "soTienThucTe": 50000000  // Optional: Số tiền thực tế nếu khác với đề xuất
}
```

**Response**:
```json
{
  "success": true,
  "message": "Đã xác nhận tiền và cộng 50,000,000 đ vào Quỹ Thành Phần. Chuyển sang bước duyệt tạo hoạt động bởi admin.",
  "data": {
    "success": true,
    "proposalId": 123,
    "soTienDaCong": 50000000,
    "quyThanhPhanId": 5
  }
}
```

**Database Changes**:
```sql
-- 1. Cộng tiền vào Quỹ Thành Phần
UPDATE quy 
SET sodu = sodu + 50000000 
WHERE quy_id = 5;

-- 2. Tạo giao dịch
INSERT INTO giaodich (quy_id, loaigiaodich, sotien, mota, ...)
VALUES (5, 'Tai tro', 50000000, 'Nhận tiền tài trợ...', ...);

-- 3. Cập nhật đề xuất
UPDATE dexuatchuongtrinh 
SET trangthai = 'Da nhan tien',
    ketoan_xacnhan_id = 2,
    ngay_ketoan_xacnhan = NOW(),
    so_tien_thuc_te = 50000000
WHERE dexuatchuongtrinh_id = 123;
```

**Trạng thái sau bước 2**: `trangthai = 'Da nhan tien'`

---

### **Bước 3: Admin Tạo Hoạt Động**

**Vai trò**: Admin (vaitro = 1)

**Công việc**:
- Kiểm tra ngân sách Quỹ Thành Phần đủ không
- **Tạo Quỹ Cấp 3 (Hoạt động/Chương Trình)**
- **Trích tiền từ Quỹ Thành Phần → Quỹ Cấp 3**
- Tạo bản ghi phân bổ ngân sách

**API**:
```http
POST /api/donations/propose-program/:id/create-activity
Authorization: Bearer <token>
Content-Type: application/json

{
  "ghiChu": "Đã kiểm tra, tạo hoạt động"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Đã tạo hoạt động/chương trình thành công! ID hoạt động: 456",
  "data": {
    "success": true,
    "proposalId": 123,
    "activityId": 456,
    "phanBoId": 789,
    "soTienPhanBo": 50000000
  }
}
```

**Database Changes**:
```sql
-- 1. Tạo Quỹ Cấp 3 (Hoạt động)
INSERT INTO quy (
  tenquy, loaiquy_id, sodu, quy_cha_id, capdo, ...
) VALUES (
  'Học bổng A', 1, 0, 5, 3, ...
);
-- → quy_id = 456

-- 2. Trừ tiền từ Quỹ Thành Phần (Cấp 2)
UPDATE quy 
SET sodu = sodu - 50000000 
WHERE quy_id = 5;

-- 3. Cộng tiền vào Quỹ Hoạt Động (Cấp 3)
UPDATE quy 
SET sodu = sodu + 50000000 
WHERE quy_id = 456;

-- 4. Tạo bản ghi phân bổ
INSERT INTO phanbongansach (
  quy_nguon_id, quy_dich_id, sotien, trangthai, ...
) VALUES (5, 456, 50000000, 'Da duyet', ...);

-- 5. Cập nhật đề xuất
UPDATE dexuatchuongtrinh 
SET trangthai = 'Da tao hoat dong',
    admin_duyet_id = 1,
    ngay_admin_duyet = NOW(),
    quyketqua_id = 456
WHERE dexuatchuongtrinh_id = 123;
```

**Trạng thái sau bước 3**: `trangthai = 'Da tao hoat dong'`

---

## 📊 Trạng Thái Đề Xuất

| Trạng thái | Mô tả | Bước tiếp theo |
|-----------|-------|----------------|
| `Cho duyet` | Mới tạo, chờ cán bộ duyệt | Cán bộ duyệt/từ chối |
| `Can bo da duyet` | Cán bộ đã duyệt | Kế toán xác nhận tiền |
| `Tu choi` | Cán bộ từ chối | Kết thúc |
| `Da nhan tien` | Kế toán đã xác nhận tiền | Admin tạo hoạt động |
| `Da tao hoat dong` | Hoàn tất, đã tạo hoạt động | Kết thúc (Success) |

---

## 🎯 Luồng Tiền

```
Nhà Tài Trợ
    ↓ (Chuyển khoản)
💰 Tiền thực tế
    ↓ (Bước 2: Kế toán xác nhận)
🏦 Quỹ Thành Phần (Cấp 2)
    ↓ (Bước 3: Admin tạo hoạt động)
📋 Hoạt Động/Chương Trình (Cấp 3)
```

**Ví dụ**:
```
1. Nhà tài trợ chuyển: 50,000,000 đ
2. Kế toán xác nhận → Cộng 50tr vào "Quỹ Học Bổng" (Cấp 2)
   Trước: Quỹ Học Bổng = 100tr
   Sau:  Quỹ Học Bổng = 150tr
   
3. Admin tạo hoạt động → Trích 50tr từ "Quỹ Học Bổng" → "Học Bổng A" (Cấp 3)
   Quỹ Học Bổng (Cấp 2): 150tr - 50tr = 100tr
   Học Bổng A (Cấp 3):    0 + 50tr = 50tr
```

---

## 🔐 Phân Quyền

| Vai trò | Quyền hạn |
|---------|-----------|
| **Cán bộ (3)** | Duyệt/Từ chối nội dung, Sửa quỹ thành phần |
| **Kế toán (2)** | Xác nhận tiền, Cộng vào quỹ thành phần |
| **Admin (1)** | Tạo hoạt động, Quản lý toàn bộ |
| **Nhà tài trợ (4)** | Xem trạng thái đề xuất của mình |
| **Ban kiểm soát (5)** | Xem trạng thái, Giám sát |

---

## 🧪 Test Cases

### Test Case 1: Happy Path (Luồng thành công)
```bash
# 1. Cán bộ duyệt
curl -X POST http://localhost:5001/api/donations/propose-program/123/approve-by-canbo \
  -H "Authorization: Bearer <canbo_token>" \
  -H "Content-Type: application/json" \
  -d '{"ghiChu": "OK"}'

# 2. Kế toán xác nhận
curl -X POST http://localhost:5001/api/donations/propose-program/123/confirm-money \
  -H "Authorization: Bearer <ketoan_token>" \
  -H "Content-Type: application/json" \
  -d '{"soTienThucTe": 50000000}'

# 3. Admin tạo hoạt động
curl -X POST http://localhost:5001/api/donations/propose-program/123/create-activity \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"ghiChu": "Done"}'
```

### Test Case 2: Cán bộ từ chối
```bash
curl -X POST http://localhost:5001/api/donations/propose-program/123/reject-by-canbo \
  -H "Authorization: Bearer <canbo_token>" \
  -H "Content-Type: application/json" \
  -d '{"lyDoTuChoi": "Không đủ thông tin", "ghiChu": "Cần bổ sung"}'
```

### Test Case 3: Ngân sách không đủ
```bash
# Nếu Quỹ Thành Phần chỉ còn 30tr nhưng đề xuất cần 50tr
# → Admin tạo hoạt động sẽ fail với lỗi:
# "Ngân sách Quỹ Thành Phần không đủ để tạo hoạt động"
```

---

## 📝 Migration

Chạy migration để thêm các cột mới:

```bash
node backend/database/migrations/add_proposal_approval_workflow.mjs
```

**Các cột được thêm**:
- `canbo_duyet_id`, `ngay_canbo_duyet`, `ghi_chu_canbo`
- `ketoan_xacnhan_id`, `ngay_ketoan_xacnhan`, `so_tien_thuc_te`
- `admin_duyet_id`, `ngay_admin_duyet`, `ghi_chu_admin`

---

## 🚀 Deployment

1. **Chạy migration**:
```bash
node backend/database/migrations/add_proposal_approval_workflow.mjs
```

2. **Restart server**:
```bash
npm run dev
```

3. **Test API** với Postman/Insomnia

4. **Deploy lên production**

---

## 📌 Lưu Ý

### ✅ Backward Compatibility
- API cũ vẫn hoạt động: `/propose-program/:id/approve`, `/propose-program/:id/reject`
- Database schema tương thích ngược
- Không ảnh hưởng đến dữ liệu cũ

### ⚠️ Quan Trọng
- **Luồng tiền**: Tiền PHẢI vào Quỹ Thành Phần trước, rồi mới trích ra tạo hoạt động
- **Kiểm tra ngân sách**: Admin tạo hoạt động phải kiểm tra đủ tiền trong Quỹ Thành Phần
- **Audit trail**: Mọi thao tác đều được ghi log (canbo_duyet_id, ketoan_xacnhan_id, admin_duyet_id)

### 🔔 Notification (Tương lai)
- Cán bộ duyệt → Notify Kế toán
- Kế toán xác nhận → Notify Admin
- Admin tạo hoạt động → Notify Nhà tài trợ

---

## 🐛 Troubleshooting

### Lỗi: "PROPOSAL_NOT_APPROVED_BY_CANBO"
**Nguyên nhân**: Kế toán xác nhận tiền nhưng cán bộ chưa duyệt  
**Giải pháp**: Phải duyệt bởi cán bộ trước

### Lỗi: "INSUFFICIENT_PARENT_FUND_BALANCE"
**Nguyên nhân**: Quỹ Thành Phần không đủ tiền  
**Giải pháp**: Đợi có thêm tài trợ hoặc giảm số tiền đề xuất

### Lỗi: "FUND_MUST_BE_LEVEL_2"
**Nguyên nhân**: Quỹ được chọn không phải cấp 2  
**Giải pháp**: Cán bộ sửa lại `quyThanhPhanId` ở bước 1

---

**Tác giả**: TVU Fund Management Team  
**Ngày cập nhật**: 2024-12-19  
**Version**: 1.0.0
