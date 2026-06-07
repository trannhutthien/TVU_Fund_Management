# 🎓 ACTOR 1: SINH VIÊN (Role 4)

> **Mô tả**: Sinh viên là người dùng chính của hệ thống, có nhu cầu xin hỗ trợ tài chính từ các quỹ.

---

## 📊 TỔNG QUAN

- **Role ID**: 4
- **Tên vai trò**: Sinh viên / Người dùng
- **Số lượng Use Cases**: 12
- **Quyền truy cập**: Hạn chế - chỉ xem và quản lý dữ liệu của chính mình

---

## 📋 DANH SÁCH USE CASES (12 Use Cases)

### **NHÓM A: XÁC THỰC & TÀI KHOẢN** (6 Use Cases)

---

### **UC01: Đăng ký tài khoản**

**Mô tả**: Sinh viên tạo tài khoản mới trong hệ thống

**Điều kiện tiên quyết**: Không có (công khai)

**Luồng chính**:
1. Sinh viên truy cập trang đăng ký
2. Chọn loại tài khoản: "Sinh viên"
3. Nhập thông tin:
   - Email (bắt buộc)
   - Mật khẩu (bắt buộc, tối thiểu 6 ký tự)
   - Họ tên (bắt buộc)
   - Mã số sinh viên (tùy chọn)
   - Số điện thoại (tùy chọn)
   - Khoa/Ngành (tùy chọn)
4. Hệ thống kiểm tra email đã tồn tại chưa
5. Hệ thống hash mật khẩu bằng bcrypt
6. Hệ thống tạo tài khoản với:
   - role_id = 4 (Sinh viên)
   - loai_tai_khoan = 'SINH_VIEN'
   - trang_thai = 'Hoat dong'
7. Hiển thị thông báo đăng ký thành công
8. Chuyển hướng đến trang đăng nhập

**Luồng thay thế**:
- **A1**: Email đã tồn tại → Hiển thị lỗi "Email đã được sử dụng"
- **A2**: Mật khẩu không hợp lệ → Hiển thị lỗi "Mật khẩu phải có ít nhất 6 ký tự"

**Kết quả**: Tài khoản sinh viên được tạo thành công

**API**: `POST /api/auth/register`

---

### **UC02: Đăng nhập**

**Mô tả**: Sinh viên đăng nhập vào hệ thống

**Điều kiện tiên quyết**: Đã có tài khoản (UC01)

**Luồng chính**:
1. Sinh viên truy cập trang đăng nhập
2. Nhập email và mật khẩu
3. Hệ thống kiểm tra email tồn tại
4. Hệ thống so sánh mật khẩu (bcrypt.compare)
5. Hệ thống kiểm tra trạng thái tài khoản (phải là 'Hoat dong')
6. Hệ thống tạo cặp token:
   - Access Token (15 phút)
   - Refresh Token (7 ngày)
7. Trả về thông tin user và cặp token
8. Frontend lưu token vào localStorage
9. Chuyển hướng đến Dashboard sinh viên

**Luồng thay thế**:
- **A1**: Email không tồn tại → Lỗi "Email không tồn tại"
- **A2**: Mật khẩu sai → Lỗi "Mật khẩu không chính xác"
- **A3**: Tài khoản bị khóa → Lỗi "Tài khoản đã bị khóa, vui lòng liên hệ quản trị viên"

**Kết quả**: Sinh viên đăng nhập thành công, nhận được access token

**API**: `POST /api/auth/login`

---

### **UC03: Đổi mật khẩu**

**Mô tả**: Sinh viên thay đổi mật khẩu của mình

**Điều kiện tiên quyết**: Đã đăng nhập (UC02)

**Quan hệ**: **<<extend>>** UC02

**Luồng chính**:
1. Sinh viên vào trang "Đổi mật khẩu"
2. Nhập:
   - Mật khẩu cũ
   - Mật khẩu mới
   - Xác nhận mật khẩu mới
3. Hệ thống kiểm tra mật khẩu cũ có đúng không
4. Hệ thống kiểm tra mật khẩu mới và xác nhận có khớp không
5. Hệ thống hash mật khẩu mới
6. Hệ thống cập nhật mật khẩu trong database
7. Hiển thị thông báo thành công

**Luồng thay thế**:
- **A1**: Mật khẩu cũ sai → Lỗi "Mật khẩu cũ không chính xác"
- **A2**: Mật khẩu mới không khớp → Lỗi "Mật khẩu xác nhận không khớp"
- **A3**: Mật khẩu mới quá ngắn → Lỗi "Mật khẩu phải có ít nhất 6 ký tự"

**Kết quả**: Mật khẩu được thay đổi thành công

**API**: `PUT /api/auth/update-password`

---

### **UC04: Xem thông tin cá nhân**

**Mô tả**: Sinh viên xem thông tin profile của mình

**Điều kiện tiên quyết**: Đã đăng nhập (UC02)

**Luồng chính**:
1. Sinh viên click vào "Thông tin cá nhân"
2. Hệ thống lấy thông tin từ token (user_id)
3. Hệ thống truy vấn database lấy thông tin:
   - Họ tên
   - Email
   - Mã số sinh viên
   - Khoa/Ngành
   - Số điện thoại
   - Địa chỉ
   - Avatar
   - Vai trò
4. Hiển thị thông tin trên màn hình

**Kết quả**: Hiển thị đầy đủ thông tin cá nhân

**API**: `GET /api/auth/me`

---

### **UC05: Cập nhật thông tin cá nhân**

**Mô tả**: Sinh viên sửa thông tin profile của mình

**Điều kiện tiên quyết**: Đã đăng nhập (UC02)

**Luồng chính**:
1. Sinh viên vào trang "Chỉnh sửa thông tin"
2. Sửa các thông tin:
   - Họ tên
   - Số điện thoại
   - Địa chỉ
   - Khoa/Ngành
   - Avatar (upload ảnh mới)
3. Click "Lưu thay đổi"
4. Hệ thống validate dữ liệu
5. Hệ thống cập nhật database
6. Hiển thị thông báo thành công

**Lưu ý**: Không thể sửa email, vai trò, trạng thái

**Kết quả**: Thông tin cá nhân được cập nhật

**API**: `PATCH /api/users/:id`

---

### **UC06: Đăng xuất**

**Mô tả**: Sinh viên đăng xuất khỏi hệ thống

**Điều kiện tiên quyết**: Đã đăng nhập (UC02)

**Luồng chính**:
1. Sinh viên click "Đăng xuất"
2. Frontend xóa token khỏi localStorage
3. Hệ thống gọi API logout (tùy chọn)
4. Chuyển hướng về trang chủ công khai

**Kết quả**: Sinh viên đăng xuất thành công

**API**: `POST /api/auth/logout`

---

### **NHÓM B: QUẢN LÝ QUỸ CÔNG KHAI** (2 Use Cases)

---

### **UC07: Xem danh sách quỹ công khai**

**Mô tả**: Sinh viên xem các quỹ đang hoạt động

**Điều kiện tiên quyết**: Không có (công khai, không cần đăng nhập)

**Luồng chính**:
1. Sinh viên truy cập trang "Danh sách quỹ"
2. Hệ thống lấy danh sách quỹ có:
   - trang_thai = 'Dang hoat dong'
   - Chưa hết hạn (ngay_ket_thuc >= ngày hiện tại)
3. Hiển thị thông tin mỗi quỹ:
   - Tên quỹ
   - Mô tả
   - Số tiền mục tiêu
   - Số dư hiện tại
   - Số tiền hỗ trợ tối đa/sinh viên
   - Điều kiện hỗ trợ
   - Ngày bắt đầu - Ngày kết thúc
   - Hình ảnh đại diện
4. Sinh viên có thể:
   - Filter theo loại quỹ
   - Tìm kiếm theo tên
   - Xem chi tiết từng quỹ

**Kết quả**: Hiển thị danh sách các quỹ đang hoạt động

**API**: `GET /api/funds/public`

---

### **UC08: Xem thông tin ngân hàng quỹ**

**Mô tả**: Sinh viên xem số tài khoản ngân hàng của quỹ (để chuyển khoản tài trợ)

**Điều kiện tiên quyết**: Đang xem chi tiết quỹ (UC07)

**Quan hệ**: **<<include>>** UC07

**Luồng chính**:
1. Sinh viên click "Xem thông tin chuyển khoản"
2. Hệ thống lấy thông tin tài khoản ngân hàng của quỹ:
   - Số tài khoản
   - Tên ngân hàng
   - Chi nhánh
   - Chủ tài khoản
3. Hiển thị thông tin để sinh viên có thể copy

**Kết quả**: Hiển thị thông tin ngân hàng quỹ

**API**: `GET /api/funds/:id/bank-accounts`

---

### **NHÓM C: QUẢN LÝ ĐƠN XIN HỖ TRỢ** (4 Use Cases)

---

### **UC09: Nộp đơn xin hỗ trợ**

**Mô tả**: Sinh viên tạo đơn xin hỗ trợ tài chính từ quỹ

**Điều kiện tiên quyết**: Đã đăng nhập (UC02)

**Quan hệ**: **<<include>>** UC07 (phải xem quỹ trước)

**Luồng chính**:
1. Sinh viên vào trang "Nộp đơn xin hỗ trợ"
2. Chọn quỹ từ dropdown (danh sách quỹ đang hoạt động)
3. Nhập thông tin:
   - Lý do xin hỗ trợ (bắt buộc, textarea)
   - Số tiền đề nghị (bắt buộc)
   - Tài liệu đính kèm (tùy chọn, upload file PDF/JPG)
4. Click "Nộp đơn"
5. Hệ thống validate:
   - Quỹ phải tồn tại và đang hoạt động
   - Số tiền <= số tiền hỗ trợ tối đa của quỹ
   - Quỹ còn đủ số dư
6. Hệ thống tạo đơn với:
   - nguoi_dung_id = sinh viên hiện tại
   - quy_id = quỹ đã chọn
   - trang_thai = 'Cho duyet cap 1'
   - ngay_nop = NOW()
7. Hệ thống tạo 3 bản ghi trong bảng `pheduyet`:
   - Cấp 1: Chờ Cán bộ duyệt
   - Cấp 2: Chờ Cán bộ duyệt
   - Cấp 3: Chờ Kế toán duyệt
8. Hiển thị thông báo thành công
9. Chuyển đến trang "Đơn của tôi"

**Luồng thay thế**:
- **A1**: Quỹ không hoạt động → Lỗi "Quỹ hiện không nhận đơn"
- **A2**: Số tiền vượt quá giới hạn → Lỗi "Số tiền vượt quá giới hạn hỗ trợ"
- **A3**: Quỹ không đủ tiền → Lỗi "Quỹ hiện không đủ số dư"

**Kết quả**: Đơn xin hỗ trợ được tạo và chờ duyệt cấp 1

**API**: `POST /api/applications`

---

### **UC10: Xem danh sách đơn đã nộp**

**Mô tả**: Sinh viên xem tất cả đơn đã nộp của mình

**Điều kiện tiên quyết**: Đã đăng nhập (UC02)

**Luồng chính**:
1. Sinh viên vào trang "Đơn của tôi"
2. Hệ thống lấy danh sách đơn:
   - WHERE nguoi_dung_id = sinh viên hiện tại
   - ORDER BY ngay_nop DESC
3. Hiển thị danh sách với thông tin:
   - Mã đơn
   - Tên quỹ
   - Số tiền đề nghị
   - Trạng thái (Badge màu sắc):
     - 🟡 Chờ duyệt cấp 1
     - 🟡 Chờ duyệt cấp 2
     - 🟡 Chờ duyệt cấp 3
     - 🟢 Chờ giải ngân
     - 🟢 Đã giải ngân
     - 🔴 Từ chối
   - Ngày nộp
   - Action: "Xem chi tiết"
4. Hỗ trợ:
   - Phân trang (10 đơn/trang)
   - Filter theo trạng thái
   - Tìm kiếm theo quỹ

**Kết quả**: Hiển thị danh sách tất cả đơn của sinh viên

**API**: `GET /api/applications/my-applications`

---

### **UC11: Xem chi tiết đơn & trạng thái phê duyệt**

**Mô tả**: Sinh viên xem thông tin chi tiết 1 đơn và lịch sử phê duyệt 3 cấp

**Điều kiện tiên quyết**: Đang xem danh sách đơn (UC10)

**Luồng chính**:
1. Sinh viên click "Xem chi tiết" trên 1 đơn
2. Hệ thống kiểm tra quyền:
   - Chỉ cho xem nếu đơn thuộc về sinh viên này
3. Hệ thống lấy thông tin:
   - **Thông tin đơn**:
     - Mã đơn
     - Quỹ
     - Lý do
     - Số tiền đề nghị
     - Tài liệu đính kèm
     - Trạng thái hiện tại
     - Ngày nộp
   - **Lịch sử phê duyệt** (3 cấp):
     - Cấp 1: Người duyệt, ngày duyệt, kết quả, ghi chú
     - Cấp 2: Người duyệt, ngày duyệt, kết quả, ghi chú
     - Cấp 3: Người duyệt (Kế toán), ngày duyệt, kết quả, ghi chú
4. Hiển thị dạng Timeline/Stepper:
   - ✅ Cấp 1: Đã duyệt (20/05/2026)
   - ✅ Cấp 2: Đã duyệt (22/05/2026)
   - 🕐 Cấp 3: Đang chờ duyệt

**Kết quả**: Hiển thị đầy đủ thông tin đơn và tiến trình phê duyệt

**API**: `GET /api/applications/:id`

---

### **UC12: Xem lịch sử nhận hỗ trợ**

**Mô tả**: Sinh viên xem tổng hợp các khoản đã nhận

**Điều kiện tiên quyết**: Đã đăng nhập (UC02)

**Luồng chính**:
1. Sinh viên vào trang "Lịch sử nhận hỗ trợ"
2. Hệ thống tính toán:
   - Tổng số đơn đã được duyệt
   - Tổng số tiền đã nhận
   - Số lần nhận hỗ trợ
3. Hệ thống lấy danh sách các đơn:
   - WHERE nguoi_dung_id = sinh viên
   - AND trang_thai = 'Da giai ngan'
   - ORDER BY ngay_nop DESC
4. Hiển thị:
   - **Tổng quan** (Cards):
     - Tổng số tiền nhận: 10,000,000 VNĐ
     - Số lần nhận hỗ trợ: 3 lần
   - **Danh sách chi tiết**:
     - Quỹ
     - Số tiền
     - Ngày giải ngân
     - Hình thức (Tiền mặt/Chuyển khoản)

**Kết quả**: Hiển thị lịch sử nhận hỗ trợ đầy đủ

**API**: `GET /api/applications/my-applications?trangThai=Da giai ngan`

---

## 📊 BẢNG TÓM TẮT USE CASES

| # | Use Case | API Endpoint | Method | Quyền |
|---|----------|--------------|--------|-------|
| UC01 | Đăng ký tài khoản | `/api/auth/register` | POST | Public |
| UC02 | Đăng nhập | `/api/auth/login` | POST | Public |
| UC03 | Đổi mật khẩu | `/api/auth/update-password` | PUT | Role 4 |
| UC04 | Xem thông tin cá nhân | `/api/auth/me` | GET | Role 4 |
| UC05 | Cập nhật thông tin | `/api/users/:id` | PATCH | Role 4 |
| UC06 | Đăng xuất | `/api/auth/logout` | POST | Role 4 |
| UC07 | Xem danh sách quỹ | `/api/funds/public` | GET | Public |
| UC08 | Xem thông tin ngân hàng | `/api/funds/:id/bank-accounts` | GET | Public |
| UC09 | Nộp đơn xin hỗ trợ | `/api/applications` | POST | Role 4 |
| UC10 | Xem danh sách đơn | `/api/applications/my-applications` | GET | Role 4 |
| UC11 | Xem chi tiết đơn | `/api/applications/:id` | GET | Role 4 |
| UC12 | Xem lịch sử nhận hỗ trợ | `/api/applications/my-applications` | GET | Role 4 |

---

## 🎯 LUỒNG SỬ DỤNG ĐIỂN HÌNH

### **Kịch bản 1: Sinh viên lần đầu sử dụng**
```
UC01 (Đăng ký) 
  → UC02 (Đăng nhập) 
  → UC07 (Xem quỹ) 
  → UC09 (Nộp đơn) 
  → UC10 (Xem danh sách đơn)
  → UC11 (Xem chi tiết & theo dõi trạng thái)
```

### **Kịch bản 2: Sinh viên quay lại kiểm tra**
```
UC02 (Đăng nhập) 
  → UC10 (Xem danh sách đơn)
  → UC11 (Xem chi tiết đơn)
```

### **Kịch bản 3: Sinh viên cập nhật thông tin**
```
UC02 (Đăng nhập) 
  → UC04 (Xem thông tin)
  → UC05 (Cập nhật thông tin)
  → UC03 (Đổi mật khẩu - tùy chọn)
```

---

## 🔒 GIỚI HẠN & QUYỀN TRUY CẬP

### **Được phép**:
✅ Xem và nộp đơn xin hỗ trợ  
✅ Xem các quỹ công khai  
✅ Xem và quản lý đơn của chính mình  
✅ Cập nhật thông tin cá nhân  
✅ Đổi mật khẩu  

### **Không được phép**:
❌ Xem đơn của sinh viên khác  
❌ Phê duyệt đơn  
❌ Tạo/sửa/xóa quỹ  
❌ Xem danh sách người dùng  
❌ Quản lý nhà tài trợ  
❌ Xem lịch sử giao dịch hệ thống  
❌ Thay đổi vai trò  

---

**Tổng cộng**: Sinh viên có **12 Use Cases** tập trung vào việc xem thông tin công khai, quản lý tài khoản cá nhân và nộp/theo dõi đơn xin hỗ trợ của mình.
