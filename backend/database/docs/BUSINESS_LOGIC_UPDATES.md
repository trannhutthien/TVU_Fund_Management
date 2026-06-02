# CẬP NHẬT LOGIC NGHIỆP VỤ

## Tổng quan
Tài liệu này mô tả các cập nhật về logic nghiệp vụ mà **KHÔNG thay đổi cấu trúc database**.
Các bảng vẫn giữ nguyên cấu trúc, chỉ có cách sử dụng và tính toán dữ liệu được cập nhật.

---

## 1. BẢNG QUỸ (quy) - Quản lý trạng thái quỹ

### Cấu trúc hiện tại (không thay đổi):
```sql
trang_thai ENUM('Dang hoat dong', 'Tam dung', 'Da dong') DEFAULT 'Dang hoat dong'
```

### Cập nhật logic nghiệp vụ:

#### 1.1. Trạng thái quỹ
- **Dang hoat dong**: Quỹ đang hoạt động bình thường
  - Hiển thị trên trang công khai
  - Cho phép sinh viên nộp đơn
  - Cho phép nhận tài trợ
  
- **Tam dung**: Quỹ tạm dừng hoạt động
  - Hiển thị trên trang công khai nhưng bị disable
  - Không cho phép sinh viên nộp đơn mới
  - Vẫn xử lý các đơn đã nộp trước đó
  - Admin/Cán bộ có thể kích hoạt lại
  
- **Da dong**: Quỹ đã đóng
  - **KHÔNG** hiển thị trên trang công khai
  - Không cho phép nộp đơn
  - Không cho phép thay đổi trạng thái (đóng vĩnh viễn)
  - Chỉ xem lịch sử

#### 1.2. API Endpoint mới
```javascript
PUT /api/funds/:id/status
Body: { status: 'Dang hoat dong' | 'Tam dung' | 'Da dong' }
```

#### 1.3. Validation
- Quỹ có trạng thái "Da dong" không thể thay đổi sang trạng thái khác
- Chỉ Admin (role 1) và Cán bộ (role 3) mới có quyền thay đổi trạng thái

#### 1.4. Query cập nhật
```sql
-- Lấy danh sách quỹ công khai (không bao gồm quỹ đã đóng)
SELECT * FROM quy 
WHERE trang_thai IN ('Dang hoat dong', 'Tam dung')
ORDER BY ngay_tao DESC;

-- Cập nhật trạng thái quỹ
UPDATE quy 
SET trang_thai = 'Tam dung' 
WHERE id = ? AND trang_thai != 'Da dong';

-- Đóng quỹ (không thể hoàn tác)
UPDATE quy 
SET trang_thai = 'Da dong' 
WHERE id = ? AND trang_thai != 'Da dong';
```

---

## 2. BẢNG QUỸ (quy) - Tính toán số dư thực tế

### Cấu trúc hiện tại (không thay đổi):
```sql
so_du DECIMAL(15,2) NOT NULL DEFAULT 0 COMMENT 'Số dư hiện tại'
```

### Cập nhật logic nghiệp vụ:

#### 2.1. Số dư thực tế (so_du_thuc_te)
Số dư thực tế = Số dư hiện tại - Tổng số tiền đơn đang chờ giải ngân

```sql
so_du_thuc_te = so_du - SUM(so_tien_de_nghi WHERE trang_thai = 'Cho giai ngan')
```

#### 2.2. Lý do cập nhật
- Số dư hiện tại (`so_du`) chỉ trừ đi khi đơn đã được giải ngân thực tế
- Nhưng các đơn đang "Cho giai ngan" đã được duyệt và sẽ được giải ngân
- Cần hiển thị số dư thực tế để Admin/Cán bộ biết còn bao nhiêu tiền khả dụng

#### 2.3. Query cập nhật
```sql
-- Lấy danh sách quỹ với số dư thực tế
SELECT 
  q.*,
  q.so_du - COALESCE(SUM(CASE 
    WHEN y.trang_thai = 'Cho giai ngan' 
    THEN y.so_tien_de_nghi 
    ELSE 0 
  END), 0) as so_du_thuc_te,
  COUNT(CASE 
    WHEN y.trang_thai IN ('Cho giai ngan', 'Da giai ngan') 
    THEN 1 
  END) as so_don_da_nop
FROM quy q
LEFT JOIN yeucauhotro y ON q.id = y.quy_id
WHERE q.trang_thai IN ('Dang hoat dong', 'Tam dung')
GROUP BY q.id
ORDER BY q.ngay_tao DESC;
```

#### 2.4. Hiển thị trên Frontend
- **FundCard**: Hiển thị `so_du_thuc_te` thay vì `so_du`
- **QuyDetailDrawer**: Hiển thị cả `so_du` và `so_du_thuc_te`
- **Admin Dashboard**: Sử dụng `so_du_thuc_te` để tính toán thống kê

---

## 3. BẢNG YÊU CẦU HỖ TRỢ (yeucauhotro) - Đếm số đơn đã nộp

### Cấu trúc hiện tại (không thay đổi):
```sql
trang_thai ENUM(
  'Cho duyet cap 1', 'Da duyet cap 1', 'Tu choi cap 1',
  'Cho duyet cap 2', 'Da duyet cap 2', 'Tu choi cap 2',
  'Cho duyet cap 3', 'Da duyet cap 3', 'Tu choi cap 3',
  'Cho giai ngan', 'Da giai ngan', 'Tu choi'
)
```

### Cập nhật logic nghiệp vụ:

#### 3.1. Đếm số đơn đã nộp (so_don_da_nop)
Trước đây chỉ đếm đơn "Da giai ngan", bây giờ đếm cả "Cho giai ngan"

```sql
so_don_da_nop = COUNT(WHERE trang_thai IN ('Cho giai ngan', 'Da giai ngan'))
```

#### 3.2. Lý do cập nhật
- Đơn "Cho giai ngan" đã được duyệt 3 cấp, chỉ chờ kế toán giải ngân
- Cần tính vào số đơn đã được duyệt để hiển thị chính xác

#### 3.3. Query cập nhật
```sql
-- Đếm số đơn đã được duyệt (bao gồm cả chờ giải ngân)
SELECT 
  quy_id,
  COUNT(*) as so_don_da_nop
FROM yeucauhotro
WHERE trang_thai IN ('Cho giai ngan', 'Da giai ngan')
GROUP BY quy_id;
```

---

## 4. BẢNG KHOẢN TÀI TRỢ (khoantaitro) - Tính tổng tiền đã nhận

### Cấu trúc hiện tại (không thay đổi):
```sql
trang_thai ENUM('Cho xac nhan', 'Da nhan', 'Tu choi')
```

### Cập nhật logic nghiệp vụ:

#### 4.1. Tổng tiền đã nhận thực tế
Chỉ tính các khoản tài trợ có trạng thái "Da nhan"

```sql
tong_tien_da_nhan = SUM(so_tien WHERE trang_thai = 'Da nhan')
```

#### 4.2. Hiển thị trên Frontend
- **ImpactStatsSection**: Hiển thị tổng tiền thực tế đã nhận từ nhà tài trợ
- **Admin Dashboard**: Thống kê dựa trên tiền đã nhận thực tế

#### 4.3. Query cập nhật
```sql
-- Tính tổng tiền đã nhận thực tế
SELECT 
  SUM(so_tien) as tong_tien_da_nhan
FROM khoantaitro
WHERE trang_thai = 'Da nhan';

-- Tính tổng tiền đã nhận theo quỹ
SELECT 
  quy_id,
  SUM(so_tien) as tong_tien_da_nhan
FROM khoantaitro
WHERE trang_thai = 'Da nhan'
GROUP BY quy_id;
```

---

## 5. BẢNG NHÀ TÀI TRỢ (nhataitro) - Tự động tạo từ người dùng

### Cấu trúc hiện tại (không thay đổi):
```sql
nguoi_dung_id INT NULL COMMENT 'ID người dùng (nếu có)'
```

### Cập nhật logic nghiệp vụ:

#### 5.1. Tự động tạo nhà tài trợ
Khi người dùng tạo khoản tài trợ lần đầu, tự động tạo record trong bảng `nhataitro`

```javascript
// Logic trong donationController.js
if (!donor) {
  // Tự động tạo nhà tài trợ từ thông tin người dùng
  donor = await DonorModel.create({
    ten_nha_tai_tro: user.ho_ten,
    loai_nha_tai_tro: 'Ca nhan',
    email: user.email,
    so_dien_thoai: user.so_dien_thoai,
    nguoi_dung_id: user.id,
    trang_thai: 'Hoat dong'
  });
}
```

#### 5.2. Lý do cập nhật
- Người dùng không cần tạo profile nhà tài trợ trước khi tài trợ
- Hệ thống tự động tạo và liên kết với tài khoản người dùng
- Giảm bước thao tác, tăng trải nghiệm người dùng

---

## Tổng kết

### Các bảng có cập nhật logic (KHÔNG thay đổi cấu trúc):
1. ✅ **quy** - Quản lý trạng thái quỹ (Tam dung, Da dong)
2. ✅ **quy** - Tính toán số dư thực tế
3. ✅ **yeucauhotro** - Đếm số đơn đã nộp (bao gồm Cho giai ngan)
4. ✅ **khoantaitro** - Tính tổng tiền đã nhận thực tế
5. ✅ **nhataitro** - Tự động tạo từ người dùng

### Các bảng có thay đổi cấu trúc:
- **KHÔNG CÓ** - Tất cả các bảng giữ nguyên cấu trúc

### Bảng mới tạo:
1. ✅ **sinh_vien_noi_bat** - Quản lý sinh viên nổi bật (xem file NEW_TABLES.sql)

---

**Ngày cập nhật**: 28/05/2026  
**Người thực hiện**: Kiro AI Assistant
