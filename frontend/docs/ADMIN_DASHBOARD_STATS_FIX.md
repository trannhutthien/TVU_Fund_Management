# Fix: Admin Dashboard - Stats Cards

## Tổng quan
Sửa các card thống kê trong trang **Tổng quan Admin** (Admin Dashboard) để hiển thị đúng dữ liệu từ database.

## Các card đã fix

### 1. Card "Khoản tài trợ đã nhận" 
**Yêu cầu**: Đếm số khoản tài trợ từ bảng `khoantaitro` có trạng thái `Da nhan`

**Backend fix**:
- File: `backend/models/DonationModel.js`
- Function: `getDonationStatsForKeToan()`
- Thêm query:
```javascript
const [[{ tongKhoanTaiTro }]] = await pool.query(
  `SELECT COUNT(*) AS tongKhoanTaiTro FROM khoantaitro WHERE trang_thai = 'Da nhan'`
);
```

### 2. Card "Lượt giải ngân cho SV"
**Yêu cầu**: Đếm số đơn từ bảng `yeucauhotro` có trạng thái `Da giai ngan`

**Backend fix**:
- File: `backend/controllers/statisticsController.js`
- Function: `getKeToanSummary()`
- Thêm query:
```javascript
const [[tongGiaiNganRow]] = await pool.query(
  `SELECT COUNT(*) AS total
   FROM yeucauhotro
   WHERE trang_thai = 'Da giai ngan'`
);
```

### 3. Card "Nhân viên hệ thống"
**Yêu cầu**: Đếm số người dùng từ bảng `nguoidung` có `role_id` IN (1, 2, 3)

**Backend fix**:
- File: `backend/models/UserModel.js`
- Function: `getStats()`
- Thêm queries:
```javascript
// Tổng nhân viên (Admin + Kế toán + Cán bộ)
const [[{ nhanVien }]] = await pool.query(
  `SELECT COUNT(*) AS nhanVien FROM nguoidung WHERE role_id IN (1, 2, 3)`
);

// Chi tiết từng role
const [[{ admin }]] = await pool.query(
  `SELECT COUNT(*) AS admin FROM nguoidung WHERE role_id = 1`
);
const [[{ keToan }]] = await pool.query(
  `SELECT COUNT(*) AS keToan FROM nguoidung WHERE role_id = 2`
);
const [[{ canBo }]] = await pool.query(
  `SELECT COUNT(*) AS canBo FROM nguoidung WHERE role_id = 3`
);

// Người dùng mới trong tháng
const [[{ newThisMonth }]] = await pool.query(
  `SELECT COUNT(*) AS newThisMonth FROM nguoidung
   WHERE MONTH(created_at) = MONTH(CURRENT_DATE())
     AND YEAR(created_at) = YEAR(CURRENT_DATE())`
);
```

### 4. Card "Hồ sơ hỗ trợ"
**Yêu cầu**: Đếm số đơn từ bảng `yeucauhotro` theo từng trạng thái

**Backend fix**:
- File: `backend/controllers/statisticsController.js`
- Function: `getApplicationStats()` (MỚI)
- Endpoint: `GET /api/statistics/applications/stats`
- Queries:
```javascript
// Tổng số đơn
SELECT COUNT(*) AS tongDon FROM yeucauhotro

// Đơn chờ duyệt
SELECT COUNT(*) AS choDuyet FROM yeucauhotro WHERE trang_thai = 'Cho duyet'

// Đơn đang xử lý
SELECT COUNT(*) AS dangXuLy FROM yeucauhotro WHERE trang_thai = 'Dang xu ly'

// Đơn chờ giải ngân
SELECT COUNT(*) AS choGiaiNgan FROM yeucauhotro WHERE trang_thai = 'Cho giai ngan'

// Đơn đã hoàn thành
SELECT COUNT(*) AS daHoanThanh FROM yeucauhotro WHERE trang_thai = 'Da giai ngan'

// Đơn từ chối
SELECT COUNT(*) AS tuChoi FROM yeucauhotro WHERE trang_thai = 'Tu choi'
```

## Files đã sửa

### Backend

1. **backend/models/DonationModel.js**
   - Thêm field `tongKhoanTaiTro` vào `getDonationStatsForKeToan()`

2. **backend/models/UserModel.js**
   - Thêm fields: `nhanVien`, `admin`, `keToan`, `canBo`, `newThisMonth` vào `getStats()`

3. **backend/controllers/statisticsController.js**
   - Thêm field `tongGiaiNgan` vào `getKeToanSummary()`
   - Thêm function mới: `getApplicationStats()`

4. **backend/routes/statisticsRoutes.js**
   - Thêm route: `GET /api/statistics/applications/stats` (role 1 - Admin)

5. **backend/controllers/applicationController.js**
   - Fix: Thêm `minhChungChuyenKhoan` vào destructuring trong `disburseApplication()`

### Frontend

1. **frontend/src/pages/Staff/Admin/AdminDashboard/index.jsx**
   - Gọi API mới: `/statistics/applications/stats`
   - Map data đúng cho các cards
   - Fix duplicate variable `summary` → đổi thành `keToanData`

## API Endpoints

### Mới
- `GET /api/statistics/applications/stats` (Admin only)
  - Response:
  ```json
  {
    "success": true,
    "data": {
      "tongDon": 100,
      "choDuyet": 10,
      "dangXuLy": 20,
      "choGiaiNgan": 15,
      "daHoanThanh": 50,
      "tuChoi": 5
    }
  }
  ```

### Đã sửa
- `GET /api/donations/stats`
  - Thêm field: `tongKhoanTaiTro`

- `GET /api/statistics/ketoan/summary`
  - Thêm field: `tongGiaiNgan`

- `GET /api/users/stats`
  - Thêm fields: `nhanVien`, `admin`, `keToan`, `canBo`, `newThisMonth`

## Cách test

### Bước 1: Restart Backend Server
```bash
cd backend
# Stop server (Ctrl+C)
npm start
```

### Bước 2: Test từng card

#### Card "Khoản tài trợ đã nhận"
1. Đăng nhập với role Admin (role_id: 1)
2. Vào trang **Tổng quan** (`/admin/dashboard`)
3. Kiểm tra card "Khoản tài trợ đã nhận" trong section "Sức khỏe tài chính"
4. Số hiển thị phải = số lượng record trong DB:
```sql
SELECT COUNT(*) FROM khoantaitro WHERE trang_thai = 'Da nhan';
```

#### Card "Lượt giải ngân cho SV"
1. Kiểm tra card "Lượt giải ngân cho SV" trong section "Sức khỏe tài chính"
2. Số hiển thị phải = số lượng record trong DB:
```sql
SELECT COUNT(*) FROM yeucauhotro WHERE trang_thai = 'Da giai ngan';
```

#### Card "Nhân viên hệ thống"
1. Kiểm tra card trong section "Người dùng hệ thống"
2. Số hiển thị phải = số lượng record trong DB:
```sql
SELECT COUNT(*) FROM nguoidung WHERE role_id IN (1, 2, 3);
```

#### Card "Hồ sơ hỗ trợ"
1. Kiểm tra card trong section "Hoạt động nghiệp vụ"
2. Kiểm tra từng item:
   - **Đang xử lý**: `SELECT COUNT(*) FROM yeucauhotro WHERE trang_thai = 'Dang xu ly';`
   - **Chờ giải ngân**: `SELECT COUNT(*) FROM yeucauhotro WHERE trang_thai = 'Cho giai ngan';`
   - **Đã hoàn thành**: `SELECT COUNT(*) FROM yeucauhotro WHERE trang_thai = 'Da giai ngan';`
   - **Từ chối**: `SELECT COUNT(*) FROM yeucauhotro WHERE trang_thai = 'Tu choi';`
3. Kiểm tra progress bar và tỷ lệ thành công

### Bước 3: Test API trực tiếp

Dùng Postman hoặc curl:

```bash
# Test application stats
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/statistics/applications/stats

# Test donation stats
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/donations/stats

# Test user stats
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/users/stats

# Test ketoan summary
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/statistics/ketoan/summary
```

## Trạng thái đơn xin hỗ trợ

Để tham khảo:
- `Cho duyet`: Chờ Cán bộ duyệt cấp 1
- `Dang xu ly`: Đã qua cấp 1, chờ Admin duyệt cấp 2
- `Cho giai ngan`: Đã qua cấp 2, chờ Kế toán giải ngân cấp 3
- `Da giai ngan`: Đã giải ngân thành công
- `Tu choi`: Bị từ chối ở bất kỳ cấp nào

## Trạng thái khoản tài trợ

Để tham khảo:
- `Cho duyet`: Chờ Cán bộ duyệt
- `Da duyet`: Cán bộ đã duyệt, chờ Kế toán xác nhận
- `Da nhan`: Kế toán đã xác nhận, tiền đã vào quỹ
- `Tu choi`: Bị từ chối

## Role mapping

- Role 1: Admin
- Role 2: Kế toán
- Role 3: Cán bộ / Giáo vụ
- Role 4: Người dùng (Sinh viên / Nhà tài trợ)

---

**Status**: ✅ Fixed - Chờ restart backend và test
**Date**: 2026-05-27
**Author**: Kiro AI Assistant
