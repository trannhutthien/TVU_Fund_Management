# Fix Logic Trạng Thái Khoản Tài Trợ

## Vấn đề

**Logic cũ (SAI)**:
- Nhà tài trợ tạo khoản tài trợ → Trạng thái = `Da duyet` ❌
- Kế toán duyệt → Trạng thái = `Da nhan` ❌

**Logic mới (ĐÚNG)**:
- Nhà tài trợ tạo khoản tài trợ → Trạng thái = `Cho duyet` ✅
- Kế toán duyệt → Trạng thái = `Da duyet` ✅
- Kế toán từ chối → Trạng thái = `Tu choi` ✅

## Các thay đổi đã thực hiện

### 1. Model: `backend/models/DonationModel.js`

#### A. Function `createStaffDonation`

**Thay đổi**:
- Thêm parameter `trangThai` với default = `'Da duyet'` (cho staff)
- Cho phép override `trangThai` khi gọi từ authenticated donor
- Chỉ tạo `pheduyet` records nếu có `nguoiDuyetId` (staff)

```javascript
const createStaffDonation = async ({ 
  nhaTaiTroId, 
  quyId, 
  soTien, 
  ghiChu, 
  hinhAnhMinhChung, 
  nguoiDuyetId, 
  trangThai = 'Da duyet' // ✅ Thêm parameter với default
}) => {
  // ...
  const [insertRes] = await connection.execute(
    `INSERT INTO khoantaitro (
       nha_tai_tro_id, quy_id, so_tien, trang_thai, ghi_chu, hinh_anh_minh_chung
     ) VALUES (?, ?, ?, ?, ?, ?)`,
    [nhaTaiTroId, quyId, soTien, trangThai, ghiChu || null, hinhAnhMinhChung || null]
  );
  
  // ✅ Chỉ tạo pheduyet nếu là staff
  if (nguoiDuyetId) {
    // Tạo pheduyet cấp 1 và 2
  }
  // ...
};
```

#### B. Function `approveDonation`

**Thay đổi**:
- Đổi trạng thái từ `'Cho duyet'` → `'Da duyet'` (thay vì `'Da nhan'`)
- Vẫn cộng tiền vào quỹ và tạo giao dịch
- Cập nhật stats trên `nhataitro` với điều kiện `trang_thai = 'Da duyet'`

```javascript
// ✅ Đổi từ 'Da nhan' → 'Da duyet'
const [updateResult] = await connection.execute(
  `UPDATE KhoanTaiTro
   SET trang_thai = 'Da duyet',
       ngay_cap_nhat = CURRENT_TIMESTAMP
   WHERE khoan_tai_tro_id = ?
   AND trang_thai = 'Cho duyet'`,
  [khoanTaiTroId]
);

// ✅ Stats tính theo 'Da duyet'
await connection.execute(
  `UPDATE nhataitro ntt
     SET tong_so_tien_da_tai_tro = (
            SELECT COALESCE(SUM(so_tien), 0) FROM khoantaitro
             WHERE nha_tai_tro_id = ntt.nha_tai_tro_id AND trang_thai = 'Da duyet'),
         // ... các cột khác
   WHERE ntt.nha_tai_tro_id = ?`,
  [donation.nha_tai_tro_id]
);
```

#### C. Function `rejectDonation`

**Thay đổi**:
- Chỉ cho phép từ chối khoản đang ở `'Cho duyet'` (không còn `'Da duyet'`)
- Cập nhật pheduyet với `cap_do_duyet = 1` (thay vì 2)

```javascript
// ✅ Chỉ từ chối 'Cho duyet'
const [result] = await connection.execute(
  `UPDATE KhoanTaiTro
   SET trang_thai = 'Tu choi',
       ngay_cap_nhat = CURRENT_TIMESTAMP
   WHERE khoan_tai_tro_id = ?
   AND trang_thai = 'Cho duyet'`,
  [khoanTaiTroId]
);
```

### 2. Controller: `backend/controllers/donationController.js`

#### A. Function `createAuthenticatedDonation`

**Thay đổi**:
- Truyền `trangThai: 'Cho duyet'` khi nhà tài trợ quyên góp
- Không truyền `nguoiDuyetId` (null) → Không tạo pheduyet

```javascript
const result = await DonationModel.createStaffDonation({
  nhaTaiTroId: donor.nha_tai_tro_id,
  quyId: quy_id,
  soTien: Number(so_tien),
  ghiChu: `Quyên góp từ ${donor.ho_ten || donor.ten_nha_tai_tro}`,
  hinhAnhMinhChung: hinh_anh_minh_chung,
  nguoiDuyetId: null,           // ✅ Null → Không tạo pheduyet
  trangThai: 'Cho duyet',       // ✅ Chờ duyệt
});
```

#### B. Function `approveDonation`

**Thay đổi**:
- Validation: Chỉ cho phép duyệt khoản đang ở `'Cho duyet'`
- Response: `trangThaiMoi: 'Da duyet'` (thay vì `'Da nhan'`)

```javascript
// ✅ Validation chặt chẽ hơn
if (donation.trang_thai === 'Da duyet') {
  return res.status(400).json({
    success: false,
    message: "Khoản tài trợ này đã được duyệt trước đó",
  });
}

if (donation.trang_thai !== 'Cho duyet') {
  return res.status(400).json({
    success: false,
    message: "Chỉ có thể duyệt khoản tài trợ đang ở trạng thái 'Chờ duyệt'",
  });
}

// ✅ Response với trạng thái mới
return res.status(200).json({
  success: true,
  message: "Duyệt khoản tài trợ thành công",
  donation: {
    // ...
    trangThaiCu: donation.trang_thai,
    trangThaiMoi: 'Da duyet', // ✅ Đổi từ 'Da nhan'
    // ...
  }
});
```

#### C. Function `rejectDonation`

**Thay đổi**:
- Validation: Chỉ cho phép từ chối khoản đang ở `'Cho duyet'`

```javascript
// ✅ Chỉ từ chối 'Cho duyet'
if (donation.trang_thai === 'Da duyet') {
  return res.status(400).json({
    success: false,
    message: "Không thể từ chối khoản tài trợ đã được duyệt",
  });
}

if (donation.trang_thai !== 'Cho duyet') {
  return res.status(400).json({
    success: false,
    message: "Chỉ có thể từ chối khoản tài trợ đang ở trạng thái 'Chờ duyệt'",
  });
}
```

## Luồng hoạt động mới

### Kịch bản 1: Nhà tài trợ quyên góp

```
1. POST /api/donations/authenticated
   Body: { quy_id, so_tien, hinh_anh_minh_chung }
   ↓
2. Tạo khoản tài trợ với:
   - trang_thai = 'Cho duyet' ✅
   - nguoi_duyet_id = null
   - KHÔNG tạo pheduyet records
   ↓
3. Response: 201 Created
   { trang_thai: 'Cho duyet' }
```

### Kịch bản 2: Kế toán duyệt

```
1. PUT /api/donations/:id/approve
   ↓
2. Kiểm tra trang_thai = 'Cho duyet'
   ↓
3. BEGIN TRANSACTION:
   - UPDATE trang_thai → 'Da duyet' ✅
   - Cộng tiền vào quỹ
   - Tạo giao dịch Thu
   - Cập nhật stats nhataitro
   ↓
4. Response: 200 OK
   { trangThaiMoi: 'Da duyet' }
```

### Kịch bản 3: Kế toán từ chối

```
1. PUT /api/donations/:id/reject
   Body: { lyDoTuChoi }
   ↓
2. Kiểm tra trang_thai = 'Cho duyet'
   ↓
3. BEGIN TRANSACTION:
   - UPDATE trang_thai → 'Tu choi'
   - KHÔNG cộng tiền vào quỹ
   - KHÔNG tạo giao dịch
   ↓
4. Response: 200 OK
   { trangThaiMoi: 'Tu choi' }
```

### Kịch bản 4: Cán bộ Quỹ ghi nhận (không đổi)

```
1. POST /api/donations (staff)
   Body: { nha_tai_tro_id, quy_id, so_tien, ... }
   ↓
2. Tạo khoản tài trợ với:
   - trang_thai = 'Da duyet' ✅ (default)
   - nguoi_duyet_id = staff_id
   - Tạo pheduyet cấp 1 (Da duyet) và cấp 2 (Cho duyet)
   ↓
3. Response: 201 Created
```

## State Machine

```
┌─────────────┐
│  Cho duyet  │ ← Nhà tài trợ tạo
└──────┬──────┘
       │
       ├─────────────────┐
       │                 │
       ▼                 ▼
┌─────────────┐   ┌─────────────┐
│  Da duyet   │   │  Tu choi    │
│ (Kế toán    │   │ (Kế toán    │
│  duyệt)     │   │  từ chối)   │
└─────────────┘   └─────────────┘
```

## Breaking Changes

⚠️ **Lưu ý**: Thay đổi này ảnh hưởng đến:

1. **Frontend**: Cần cập nhật UI để hiển thị đúng trạng thái
   - Badge màu cho `'Cho duyet'`, `'Da duyet'`, `'Tu choi'`
   - Filter theo trạng thái mới

2. **Database**: Dữ liệu cũ có thể có trạng thái `'Da nhan'`
   - Cần migration script để đổi `'Da nhan'` → `'Da duyet'`

3. **Stats**: Các query thống kê cần đổi từ `'Da nhan'` → `'Da duyet'`

## Migration Script (Optional)

Nếu database đã có dữ liệu với trạng thái `'Da nhan'`:

```sql
-- Đổi tất cả 'Da nhan' → 'Da duyet'
UPDATE khoantaitro 
SET trang_thai = 'Da duyet' 
WHERE trang_thai = 'Da nhan';

-- Verify
SELECT trang_thai, COUNT(*) 
FROM khoantaitro 
GROUP BY trang_thai;
```

## Testing Checklist

- [ ] Nhà tài trợ tạo khoản tài trợ → Trạng thái = `'Cho duyet'`
- [ ] Kế toán duyệt → Trạng thái = `'Da duyet'` + Cộng tiền vào quỹ
- [ ] Kế toán từ chối → Trạng thái = `'Tu choi'` + KHÔNG cộng tiền
- [ ] Không thể duyệt khoản đã duyệt
- [ ] Không thể từ chối khoản đã duyệt
- [ ] Stats `nhataitro` tính đúng với `'Da duyet'`
- [ ] Cán bộ Quỹ ghi nhận vẫn hoạt động bình thường

## Files Changed

- ✅ `backend/models/DonationModel.js`
  - `createStaffDonation()` - Thêm parameter `trangThai`
  - `approveDonation()` - Đổi `'Da nhan'` → `'Da duyet'`
  - `rejectDonation()` - Chỉ từ chối `'Cho duyet'`

- ✅ `backend/controllers/donationController.js`
  - `createAuthenticatedDonation()` - Truyền `trangThai: 'Cho duyet'`
  - `approveDonation()` - Validation + Response với `'Da duyet'`
  - `rejectDonation()` - Validation chặt chẽ hơn

## Restart Backend

⚠️ **QUAN TRỌNG**: Phải restart backend server để áp dụng thay đổi!

```bash
# Stop server
Ctrl + C

# Start lại
npm start
```
