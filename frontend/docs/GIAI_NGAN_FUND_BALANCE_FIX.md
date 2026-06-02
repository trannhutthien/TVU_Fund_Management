# Fix: Hiển thị số dư quỹ và enable button giải ngân

## Vấn đề
Trong trang **Giải ngân hồ sơ** (role Kế toán):
1. **Không hiển thị số dư quỹ**: Hiển thị "—" thay vì số tiền thực tế
2. **Button "Xác nhận giải ngân" bị disabled**: Không thể click được do `fundBalance: null`

## Root Cause
- Backend queries đã trả về `quy_so_du` nhưng có thể backend server chưa được restart
- Backend `disburseApplication` function thiếu extract `minhChungChuyenKhoan` từ `req.body`

## Các thay đổi đã thực hiện

### 1. Backend - ApplicationModel.js
✅ **Đã fix trước đó** - Thêm `q.so_du as quy_so_du` vào queries:
- `getAllApplications()`: Line ~160
- `getApplicationById()`: Line ~60

```sql
SELECT 
  ...
  q.ten_quy,
  q.loai_quy,
  q.so_du as quy_so_du  -- ✅ Đã thêm
FROM yeucauhotro yc
INNER JOIN quy q ON yc.quy_id = q.quy_id
```

### 2. Backend - applicationController.js
✅ **Fix mới** - Thêm `minhChungChuyenKhoan` vào destructuring:

**Trước:**
```javascript
const { ghiChu } = req.body;
```

**Sau:**
```javascript
const { ghiChu, minhChungChuyenKhoan } = req.body;
```

Điều này fix lỗi `ReferenceError: minhChungChuyenKhoan is not defined` khi giải ngân.

### 3. Frontend - GiaiNganPage.jsx
✅ **Cleanup** - Xóa debug logs:
- Removed console.log statements trong `handleOpenDetail`

### 4. Frontend - GiaiNganDetailDrawer/index.jsx
✅ **Cleanup** - Xóa debug logs:
- Removed console.log statements trước khi render buttons

## Data Flow

```
Backend Query (ApplicationModel)
  ↓
  SELECT q.so_du as quy_so_du
  ↓
Backend Controller (applicationController)
  ↓
  Response: { quy: { soDu: 50000000 } }
  ↓
Frontend API Call (applicationService.getById)
  ↓
Frontend Component (GiaiNganDetailDrawer)
  ↓
  const fundBalance = data?.quy?.soDu ?? data?.quy?.so_du ?? null
  ↓
  Display: formatCurrency(fundBalance)
  Button disabled: !bankAccount || !isEnough
```

## Cách test

### Bước 1: Restart Backend Server
**QUAN TRỌNG**: Backend server PHẢI được restart để apply changes!

```bash
cd backend
# Stop server nếu đang chạy (Ctrl+C)
# Start lại
npm start
# hoặc
node server.js
```

### Bước 2: Test hiển thị số dư quỹ

1. Đăng nhập với role **Kế toán** (role_id: 2)
2. Vào trang **Giải ngân hồ sơ**
3. Click vào một đơn ở tab **"Chờ giải ngân"**
4. Kiểm tra drawer bên phải:
   - ✅ Phần "Số tiền yêu cầu" phải hiển thị số tiền
   - ✅ Phần "Số dư hiện tại của quỹ" phải hiển thị số tiền (không phải "—")
   - ✅ Phần status phải hiển thị:
     - Nếu đủ tiền: "✓ Đủ điều kiện giải ngân — số dư còn lại sau: XXX đ"
     - Nếu thiếu tiền: "⚠ Quỹ không đủ số dư (thiếu XXX đ)"

### Bước 3: Test button "Xác nhận giải ngân"

**Case 1: Sinh viên có tài khoản ngân hàng + Quỹ đủ tiền**
- ✅ Button "Xác nhận giải ngân" phải **ENABLED** (màu xanh, có thể click)
- ✅ Click button → Modal upload minh chứng hiện ra
- ✅ Upload file → Click "Xác nhận" → Giải ngân thành công

**Case 2: Sinh viên CHƯA có tài khoản ngân hàng**
- ✅ Hiển thị warning: "⚠ Sinh viên chưa cập nhật tài khoản ngân hàng — không thể giải ngân"
- ✅ Button "Xác nhận giải ngân" phải **DISABLED** (màu xám)
- ✅ Hover vào button → Tooltip: "Sinh viên chưa có tài khoản ngân hàng"

**Case 3: Quỹ KHÔNG đủ tiền**
- ✅ Hiển thị warning: "⚠ Quỹ không đủ số dư (thiếu XXX đ)"
- ✅ Button "Xác nhận giải ngân" phải **DISABLED** (màu xám)
- ✅ Hover vào button → Tooltip: "Quỹ không đủ số dư"

### Bước 4: Test flow giải ngân hoàn chỉnh

1. Chọn một đơn có:
   - Trạng thái: "Cho giai ngan"
   - Sinh viên đã có tài khoản ngân hàng
   - Quỹ đủ số dư
2. Click "Xác nhận giải ngân"
3. Upload file minh chứng chuyển khoản (bắt buộc)
4. Nhập ghi chú (optional)
5. Click "Xác nhận"
6. Kiểm tra:
   - ✅ Toast success: "Đã giải ngân thành công cho [Tên sinh viên]"
   - ✅ Drawer đóng lại
   - ✅ Đơn biến mất khỏi tab "Chờ giải ngân"
   - ✅ Đơn xuất hiện ở tab "Đã xử lý" với trạng thái "Da giai ngan"
   - ✅ Số dư quỹ giảm đi đúng số tiền đã giải ngân

## Debugging

Nếu vẫn thấy `fundBalance: null` sau khi restart backend:

### 1. Check Backend Response
Mở DevTools → Network → Click vào đơn → Xem API call:
- Endpoint: `GET /api/applications/:id`
- Response phải có:
```json
{
  "data": {
    "quy": {
      "id": 2,
      "tenQuy": "Quy ho tro y te sinh vien",
      "soDu": 50000000  // ← Phải có field này!
    }
  }
}
```

### 2. Check Database
```sql
SELECT quy_id, ten_quy, so_du 
FROM quy 
WHERE quy_id = 2;
```

Nếu `so_du` là NULL trong database → Cần update:
```sql
UPDATE quy 
SET so_du = 50000000 
WHERE quy_id = 2;
```

### 3. Check Frontend Console
Không còn debug logs nữa. Nếu cần debug, tạm thời thêm lại:
```javascript
console.log('Fund balance:', data?.quy?.soDu);
console.log('Full quy object:', data?.quy);
```

## Luồng phê duyệt 3 cấp (Reminder)

1. **Sinh viên nộp đơn** → Trạng thái: `Cho duyet`
2. **Cán bộ duyệt cấp 1** → Trạng thái: `Dang xu ly`
3. **Admin duyệt cấp 2** → Trạng thái: `Cho giai ngan`
4. **Kế toán giải ngân cấp 3** → Trạng thái: `Da giai ngan`

## Files đã sửa

### Backend
- ✅ `backend/models/ApplicationModel.js` (đã fix trước đó)
- ✅ `backend/controllers/applicationController.js` (fix mới: thêm minhChungChuyenKhoan)

### Frontend
- ✅ `frontend/src/pages/Staff/KeToan/GiaiNganPage/GiaiNganPage.jsx` (cleanup logs)
- ✅ `frontend/src/pages/Staff/KeToan/GiaiNganPage/sections/GiaiNganDetailDrawer/index.jsx` (cleanup logs)

## Next Steps

1. ✅ **RESTART BACKEND SERVER** (quan trọng nhất!)
2. ✅ Test theo các bước ở trên
3. ✅ Nếu thành công → Xóa file doc này (hoặc giữ lại để tham khảo)
4. ✅ Nếu vẫn lỗi → Check debugging steps và báo lại

---

**Status**: ✅ Fixed - Chờ restart backend và test
**Date**: 2026-05-27
**Author**: Kiro AI Assistant
