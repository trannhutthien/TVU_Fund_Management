# Fix Admin Approval Flow - Phê duyệt 3 cấp

## Luồng phê duyệt đúng

```
Sinh viên nộp đơn
       ↓
  [Cho duyet]
       ↓
Cán bộ duyệt (Cấp 1)
       ↓
  [Dang xu ly]
       ↓
Admin duyệt (Cấp 2)
       ↓
[Cho giai ngan]
       ↓
Kế toán giải ngân (Cấp 3)
       ↓
[Da giai ngan]
```

## Vấn đề
1. Admin không thể duyệt đơn vì xem sai trạng thái
2. Admin duyệt xong không chuyển trạng thái thành "Cho giai ngan"
3. Kế toán xem cả "Dang xu ly" và "Cho giai ngan" (sai)

## Giải pháp

### 1. Backend - Admin duyệt chuyển trạng thái thành "Cho giai ngan"

**File**: `backend/controllers/applicationController.js`

**Function**: `adminApprove`

```javascript
// BƯỚC 7: CẬP NHẬT TRẠNG THÁI ĐƠN THÀNH "Cho giai ngan"
await connection.query(
  `UPDATE yeucauhotro 
   SET trang_thai = 'Cho giai ngan', 
       ngay_cap_nhat = NOW() 
   WHERE request_id = ?`,
  [id]
);
```

### 2. Frontend - Admin xem đơn "Dang xu ly"

**File**: `frontend/src/pages/Staff/CanBo/XetDuyetPage/XetDuyetPage.jsx`

```jsx
const trangThaiParam = useMemo(() => {
  if (activeTab === 'pending') {
    // Admin: Xem đơn "Dang xu ly" (đã qua cấp 1)
    // Cán bộ: Xem đơn "Cho duyet" (chưa qua cấp 1)
    return isAdmin ? 'Dang xu ly' : 'Cho duyet';
  }
  return filterResult || PROCESSED_STATUSES;
}, [activeTab, filterResult, isAdmin]);
```

### 3. Frontend - Admin dùng endpoint `/admin-approve`

**File**: `frontend/src/pages/Staff/CanBo/XetDuyetPage/XetDuyetDetail/XetDuyetDetail.jsx`

```jsx
if (isAdmin) {
  endpoint = `/applications/${request_id}/admin-approve`;
  successMessage = 'Đã chuyển hồ sơ lên Kế toán giải ngân';
  redirectPath = '/admin/xet-duyet';
}
```

### 4. Frontend - Kế toán chỉ xem đơn "Cho giai ngan"

**File**: `frontend/src/pages/Staff/KeToan/GiaiNganPage/GiaiNganPage.jsx`

```jsx
const trangThai =
  activeTab === 'cho_giai_ngan'
    ? 'Cho giai ngan'  // Chỉ lấy đơn đã qua Admin
    : 'Da giai ngan,Tu choi';
```

## Bảng trạng thái và quyền

| Role | Xem trạng thái | Endpoint duyệt | Chuyển thành |
|------|---------------|----------------|--------------|
| Cán bộ (3) | `Cho duyet` | `/staff-approve` | `Dang xu ly` |
| Admin (1) | `Dang xu ly` | `/admin-approve` | `Cho giai ngan` |
| Kế toán (2) | `Cho giai ngan` | `/disburse` | `Da giai ngan` |

## Testing

### Test 1: Cán bộ duyệt cấp 1
1. Login Cán bộ (role 3)
2. Vào `/can-bo/xet-duyet`
3. Thấy đơn "Cho duyet"
4. Duyệt → Chuyển thành "Dang xu ly"

### Test 2: Admin duyệt cấp 2
1. Login Admin (role 1)
2. Vào `/admin/xet-duyet`
3. Thấy đơn "Dang xu ly"
4. Duyệt → Chuyển thành "Cho giai ngan"

### Test 3: Kế toán giải ngân cấp 3
1. Login Kế toán (role 2)
2. Vào `/ke-toan/giai-ngan`
3. Thấy đơn "Cho giai ngan"
4. Giải ngân → Chuyển thành "Da giai ngan"

## Files Changed

1. ✅ `backend/controllers/applicationController.js` - adminApprove chuyển trạng thái
2. ✅ `frontend/src/pages/Staff/CanBo/XetDuyetPage/XetDuyetPage.jsx` - Admin xem "Dang xu ly"
3. ✅ `frontend/src/pages/Staff/CanBo/XetDuyetPage/XetDuyetDetail/XetDuyetDetail.jsx` - Endpoint theo role
4. ✅ `frontend/src/pages/Staff/KeToan/GiaiNganPage/GiaiNganPage.jsx` - Kế toán xem "Cho giai ngan"
