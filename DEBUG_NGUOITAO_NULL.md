# Debug: Cột nguoitao_id bị NULL

## Đã thêm Debug Logs

### Frontend (`TaoQuyPage.jsx`)
Đã thêm console.log trước khi submit:
- In ra `user` object từ `useAuthStore`
- In ra `user?.id`
- In ra `payload` đầy đủ
- In ra `payload.nguoiTao`

### Backend (`fundController.js`)
Đã có console.log:
- In ra `req.body` đầy đủ
- In ra `nguoiTao` sau khi destructure
- In ra type của `nguoiTao`

## Các Bước Kiểm Tra

### Bước 1: Kiểm tra Frontend Console
1. Mở trang tạo quỹ
2. Mở DevTools Console (F12)
3. Điền form và nhấn "Tạo quỹ"
4. Xem console, tìm dòng:
   ```
   === DEBUG USER INFO ===
   Full user object: {id: 1, hoTen: "...", vaiTro: 1, ...}
   user?.id: 1
   ```

**❓ CÂU HỎI 1:** `user?.id` có giá trị hay là `undefined`?

- ✅ Nếu có giá trị (ví dụ: `1`, `2`, `3`...) → Frontend OK, chuyển sang Bước 2
- ❌ Nếu `undefined` → Vấn đề ở authStore, user chưa được lưu khi login

### Bước 2: Kiểm tra Payload Frontend
Tiếp tục xem console:
```
=== DEBUG PAYLOAD ===
Full payload: {...}
payload.nguoiTao: 1
```

**❓ CÂU HỎI 2:** `payload.nguoiTao` có giá trị hay là `null`?

- ✅ Nếu có giá trị → Payload đúng, chuyển sang Bước 3
- ❌ Nếu `null` → User không có ID, cần kiểm tra lại login flow

### Bước 3: Kiểm tra Backend Console
Xem terminal backend, tìm dòng:
```
=== CREATE FUND DEBUG ===
Full request body: {
  "tenQuy": "...",
  "nguoiTao": 1,
  ...
}

Extracted fields:
- nguoiTao: 1 type: number
```

**❓ CÂU HỎI 3:** Backend có nhận được `nguoiTao` không?

- ✅ Nếu có (ví dụ: `nguoiTao: 1 type: number`) → Backend nhận đúng, chuyển sang Bước 4
- ❌ Nếu `undefined` hoặc `null` → Request không gửi đúng, kiểm tra API service

### Bước 4: Kiểm tra Database
Sau khi tạo quỹ thành công, chạy query:
```sql
SELECT quy_id, tenquy, nguoitao_id, ngaytao 
FROM quy 
ORDER BY ngaytao DESC 
LIMIT 1;
```

**❓ CÂU HỎI 4:** Cột `nguoitao_id` có giá trị hay NULL?

- ✅ Nếu có giá trị → **XONG! Đã fix thành công**
- ❌ Nếu NULL → Vấn đề ở INSERT query, kiểm tra FundModel

## Các Trường Hợp Có Thể Xảy Ra

### Case 1: user?.id = undefined (Frontend)
**Nguyên nhân:** User object không có field `id` sau khi login

**Giải pháp:**
1. Kiểm tra response login có trả về `id` không
2. Kiểm tra authStore có lưu đúng user không
3. Có thể field là `userId` hoặc `nguoiDungId` thay vì `id`

**Fix:** Sửa dòng 242 trong `TaoQuyPage.jsx`:
```javascript
nguoiTao: user?.nguoiDungId || user?.userId || user?.id || null
```

### Case 2: Backend nhận nguoiTao = null
**Nguyên nhân:** Payload không gửi đúng hoặc bị middleware chặn

**Giải pháp:**
1. Kiểm tra network tab trong DevTools
2. Xem request body có `nguoiTao` không
3. Kiểm tra có middleware nào strip field không

### Case 3: Database vẫn NULL dù backend nhận đúng
**Nguyên nhân:** Tên cột trong INSERT query sai

**Giải pháp:**
Kiểm tra `FundModel.js` line 31, phải là:
```sql
INSERT INTO quy (
  ...,
  nguoitao_id,  -- ✅ Phải đúng tên cột này
  ...
)
```

Không phải:
```sql
nguoi_tao_id  -- ❌ Sai
nguoi_tao     -- ❌ Sai
```

## Kết Quả Mong Đợi

Sau khi fix, khi tạo quỹ:
1. Frontend console: `user?.id: 1`, `payload.nguoiTao: 1`
2. Backend console: `nguoiTao: 1 type: number`
3. Database: `nguoitao_id = 1` (không NULL)

## Báo Cáo Kết Quả

Sau khi chạy test, hãy cho tôi biết:
1. **Bước nào bị lỗi?** (1, 2, 3, hay 4)
2. **Giá trị thực tế là gì?** (copy log từ console)
3. **Có lỗi nào trong console không?**

Tôi sẽ fix dựa trên kết quả của bạn!
