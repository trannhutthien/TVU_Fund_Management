# 💰 ACTOR 2: NHÀ TÀI TRỢ (Public/User)

> **Mô tả**: Nhà tài trợ là cá nhân/tổ chức muốn đóng góp tiền vào các quỹ để hỗ trợ sinh viên. Có thể tài trợ công khai (không cần đăng nhập) hoặc tài trợ qua tài khoản đã đăng nhập.

---

## 📊 TỔNG QUAN

- **Role ID**: Public (không cần đăng nhập) hoặc Role 4 (User đã đăng nhập)
- **Loại tài khoản**: `loai_tai_khoan = 'NHA_TAI_TRO'`
- **Số lượng Use Cases**: 15
- **Quyền truy cập**: Public + quản lý khoản tài trợ của mình

---

## 📋 DANH SÁCH USE CASES (15 Use Cases)

### **NHÓM A: XÁC THỰC & TÀI KHOẢN** (6 Use Cases)

---

### **UC01: Đăng ký tài khoản**

**Mô tả**: Nhà tài trợ tạo tài khoản để quản lý các khoản tài trợ

**Điều kiện tiên quyết**: Không có (công khai)

**Luồng chính**:
1. Nhà tài trợ truy cập trang đăng ký
2. Chọn loại tài khoản: **"Nhà tài trợ"**
3. Nhập thông tin:
   - Email (bắt buộc)
   - Mật khẩu (bắt buộc)
   - Họ tên / Tên tổ chức (bắt buộc)
   - Số điện thoại (tùy chọn)
   - Địa chỉ (tùy chọn)
4. Hệ thống tạo tài khoản với:
   - role_id = 4 (User)
   - loai_tai_khoan = 'NHA_TAI_TRO'
5. **Hệ thống Tự ĐỘNG tạo bản ghi trong bảng `nhataitro`**:
   - nguoi_dung_id = user_id vừa tạo
   - ten_nha_tai_tro = họ tên từ đăng ký
   - loai_nha_tai_tro = 'Ca nhan' (mặc định)
   - email = email từ đăng ký
   - trang_thai = 'Hoat dong'
6. Hiển thị thông báo đăng ký thành công
7. Chuyển hướng đến trang đăng nhập

**Điểm khác biệt với Sinh viên**:
- Hệ thống tự động tạo hồ sơ nhà tài trợ
- Giao diện sau đăng nhập hiển thị chức năng tài trợ

**Kết quả**: Tài khoản nhà tài trợ + hồ sơ nhà tài trợ được tạo

**API**: `POST /api/auth/register`

---

### **UC02: Đăng nhập**

**Mô tả**: Nhà tài trợ đăng nhập để quản lý khoản tài trợ

**Điều kiện tiên quyết**: Đã có tài khoản (UC01)

**Luồng chính**:
1. Nhà tài trợ đăng nhập bằng email và mật khẩu
2. Hệ thống kiểm tra:
   - Email tồn tại
   - Mật khẩu đúng
   - Trạng thái 'Hoat dong'
3. Hệ thống tạo cặp token (Access + Refresh)
4. Frontend kiểm tra `loai_tai_khoan`:
   - Nếu = 'NHA_TAI_TRO' → Chuyển đến Dashboard nhà tài trợ
   - Nếu = 'SINH_VIEN' → Chuyển đến Dashboard sinh viên
5. Dashboard nhà tài trợ hiển thị:
   - Tổng số tiền đã tài trợ
   - Số khoản tài trợ
   - Trạng thái các khoản (Chờ duyệt/Đã nhận/Từ chối)
   - Form tạo khoản tài trợ mới

**Kết quả**: Đăng nhập thành công, vào Dashboard nhà tài trợ

**API**: `POST /api/auth/login`

---

### **UC03-UC06**: Giống Sinh viên
- UC03: Đổi mật khẩu
- UC04: Xem thông tin cá nhân
- UC05: Cập nhật thông tin cá nhân
- UC06: Đăng xuất

*(Chi tiết tương tự Actor 1 - Sinh viên)*

---

### **NHÓM B: XEM THÔNG TIN QUỸ CÔNG KHAI** (2 Use Cases)

---

### **UC07: Xem danh sách quỹ công khai**

**Mô tả**: Nhà tài trợ xem các quỹ để quyết định tài trợ

**Điều kiện tiên quyết**: Không có (công khai)

**Luồng chính**:
1. Nhà tài trợ truy cập trang "Danh sách quỹ"
2. Hệ thống hiển thị các quỹ đang hoạt động với:
   - Tên quỹ
   - Mô tả
   - Số tiền mục tiêu
   - Số dư hiện tại
   - Số tiền đã nhận
   - Tiến độ (Progress bar)
   - Số sinh viên đã được hỗ trợ
3. Nhà tài trợ có thể:
   - Xem chi tiết từng quỹ
   - Xem thống kê tác động (Impact)
   - Click "Tài trợ ngay" để chuyển đến form tài trợ

**Kết quả**: Hiển thị danh sách quỹ với đầy đủ thông tin

**API**: `GET /api/funds/public`

---

### **UC08: Xem thông tin ngân hàng quỹ**

**Mô tả**: Nhà tài trợ xem STK để chuyển khoản

**Điều kiện tiên quyết**: Đang xem chi tiết quỹ (UC07)

**Quan hệ**: **<<include>>** UC07

**Luồng chính**:
1. Nhà tài trợ click "Xem thông tin chuyển khoản"
2. Hệ thống hiển thị:
   - Số tài khoản
   - Tên ngân hàng
   - Chi nhánh
   - Chủ tài khoản
   - Nội dung chuyển khoản gợi ý: "Tai tro quy [Ten quy] - [Ten nha tai tro]"
3. Nhà tài trợ có thể copy thông tin

**Kết quả**: Xem được thông tin để chuyển khoản

**API**: `GET /api/funds/:id/bank-accounts`

---

### **NHÓM C: TÀI TRỢ** (3 Use Cases)

---

### **UC13: Tạo khoản tài trợ công khai (Không cần đăng nhập)**

**Mô tả**: Người dùng bất kỳ có thể tài trợ mà không cần tài khoản

**Điều kiện tiên quyết**: Không có (công khai)

**Quan hệ**: **<<include>>** UC07

**Luồng chính**:
1. Người dùng vào trang quỹ, click "Tài trợ ngay"
2. Điền form tài trợ công khai:
   - **Thông tin cá nhân**:
     - Tên nhà tài trợ (bắt buộc)
     - Email (bắt buộc)
     - Số điện thoại (bắt buộc)
     - Địa chỉ (tùy chọn)
   - **Thông tin tài trợ**:
     - Quỹ (đã chọn sẵn)
     - Số tiền (bắt buộc)
     - Hình thức: Chuyển khoản / Tiền mặt
     - Chứng từ (upload ảnh chuyển khoản)
     - Ghi chú (tùy chọn)
3. Click "Xác nhận tài trợ"
4. **Hệ thống xử lý (trong 1 transaction)**:
   - Kiểm tra email trong bảng `nhataitro`
   - **Nếu email CHƯA TỒN TẠI**:
     - Tạo bản ghi mới trong `nhataitro`:
       - ten_nha_tai_tro = tên từ form
       - email = email từ form
       - loai_nha_tai_tro = 'Ca nhan'
       - trang_thai = 'Hoat dong'
   - **Nếu email ĐÃ TỒN TẠI**:
     - Dùng lại nhà tài trợ cũ
   - Tạo khoản tài trợ trong bảng `khoantaitro`:
     - nha_tai_tro_id = ID vừa tạo/tìm thấy
     - quy_id = quỹ được chọn
     - so_tien = số tiền tài trợ
     - trang_thai = 'Cho xac nhan'
     - ngay_tai_tro = CURDATE()
5. Commit transaction
6. Hiển thị thông báo thành công:
   - "Cảm ơn bạn đã tài trợ!"
   - "Khoản tài trợ của bạn đang được xác nhận bởi Kế toán"
   - Hiển thị mã khoản tài trợ để tra cứu
7. Gửi email xác nhận (tùy chọn)

**Luồng thay thế**:
- **A1**: Email đã tồn tại → Tự động liên kết với nhà tài trợ cũ
- **A2**: Upload chứng từ thất bại → Vẫn tạo khoản tài trợ, yêu cầu gửi chứng từ sau

**Kết quả**: 
- Khoản tài trợ được tạo với trạng thái "Chờ xác nhận"
- Nhà tài trợ được tạo tự động (nếu email chưa tồn tại)

**API**: `POST /api/donations/public`

---

### **UC14: Tạo khoản tài trợ (Đã đăng nhập)**

**Mô tả**: Nhà tài trợ đã có tài khoản tài trợ qua Dashboard

**Điều kiện tiên quyết**: Đã đăng nhập (UC02) và loai_tai_khoan = 'NHA_TAI_TRO'

**Quan hệ**: **<<include>>** UC07

**Luồng chính**:
1. Nhà tài trợ đăng nhập
2. Vào Dashboard → Click "Tài trợ mới"
3. Điền form:
   - Chọn quỹ (dropdown)
   - Số tiền (bắt buộc)
   - Hình thức: Chuyển khoản / Tiền mặt
   - Upload chứng từ
   - Ghi chú
4. Click "Xác nhận"
5. Hệ thống tạo khoản tài trợ:
   - nha_tai_tro_id = Đã có từ khi đăng ký
   - trang_thai = 'Cho xac nhan'
6. Hiển thị thông báo thành công
7. Khoản tài trợ xuất hiện trong "Lịch sử tài trợ"

**Lợi ích so với tài trợ công khai**:
- Không cần nhập lại thông tin cá nhân
- Xem được lịch sử tài trợ
- Nhận thông báo khi khoản tài trợ được duyệt

**Kết quả**: Khoản tài trợ được tạo và liên kết với tài khoản

**API**: `POST /api/donations/authenticated`

---

### **UC15: Xem lịch sử tài trợ**

**Mô tả**: Nhà tài trợ xem các khoản đã tài trợ và trạng thái

**Điều kiện tiên quyết**: Đã đăng nhập (UC02)

**Luồng chính**:
1. Nhà tài trợ vào trang "Lịch sử tài trợ"
2. Hệ thống lấy danh sách khoản tài trợ:
   - WHERE nha_tai_tro_id = ID nhà tài trợ hiện tại
   - ORDER BY ngay_tai_tro DESC
3. Hiển thị:
   - **Tổng quan** (Cards):
     - Tổng số tiền đã tài trợ: 50,000,000 VNĐ
     - Số khoản tài trợ: 5 lần
     - Số quỹ đã hỗ trợ: 3 quỹ
   - **Danh sách chi tiết**:
     - Mã khoản tài trợ
     - Quỹ
     - Số tiền
     - Hình thức
     - Ngày tài trợ
     - Trạng thái (Badge):
       - 🟡 Chờ xác nhận (màu vàng)
       - 🟢 Đã nhận (màu xanh)
       - 🔴 Từ chối (màu đỏ)
     - Ghi chú từ Kế toán (nếu có)
4. Hỗ trợ:
   - Filter theo trạng thái
   - Filter theo quỹ
   - Tìm kiếm theo mã khoản tài trợ

**Kết quả**: Hiển thị đầy đủ lịch sử tài trợ

**API**: 
- `GET /api/donations` (với filter nha_tai_tro_id)
- Hoặc endpoint riêng: `GET /api/donations/my-donations`

---

### **NHÓM D: XEM THÔNG TIN TƯỜNG NHÀ TÀI TRỢ** (4 Use Cases)

---

### **UC16: Xem Donor Wall (Tường vinh danh)**

**Mô tả**: Xem danh sách nhà tài trợ được vinh danh công khai

**Điều kiện tiên quyết**: Không có (công khai)

**Luồng chính**:
1. Người dùng truy cập Landing Page
2. Scroll đến phần "Donor Wall" (Tường vinh danh)
3. Hệ thống hiển thị nhà tài trợ theo tier:
   - **Platinum Tier** (≥ 50,000,000 VNĐ):
     - Logo/Avatar lớn
     - Tên nhà tài trợ
     - Tổng số tiền đã tài trợ
     - Số lần tài trợ
   - **Gold Tier** (< 50,000,000 VNĐ):
     - Logo/Avatar nhỏ hơn
     - Tên nhà tài trợ
     - Tổng số tiền
4. Click vào nhà tài trợ để xem:
   - Thông tin chi tiết
   - Lịch sử tài trợ (công khai)
   - Quỹ đã hỗ trợ

**Kết quả**: Hiển thị danh sách nhà tài trợ theo tier

**API**: `GET /api/donors/wall`

---

### **UC17-UC19**: Các Use Case xem thông tin thống kê
- UC17: Xem thống kê tác động (Impact Stats)
- UC18: Xem số sinh viên được hỗ trợ
- UC19: Xem phân bổ ngân sách theo quỹ

*(Các API thống kê công khai)*

---

## 📊 BẢNG TÓM TẮT USE CASES

| # | Use Case | API Endpoint | Method | Quyền |
|---|----------|--------------|--------|-------|
| UC01 | Đăng ký tài khoản NTT | `/api/auth/register` | POST | Public |
| UC02 | Đăng nhập | `/api/auth/login` | POST | Public |
| UC03 | Đổi mật khẩu | `/api/auth/update-password` | PUT | User |
| UC04 | Xem thông tin cá nhân | `/api/auth/me` | GET | User |
| UC05 | Cập nhật thông tin | `/api/users/:id` | PATCH | User |
| UC06 | Đăng xuất | `/api/auth/logout` | POST | User |
| UC07 | Xem danh sách quỹ | `/api/funds/public` | GET | Public |
| UC08 | Xem STK ngân hàng | `/api/funds/:id/bank-accounts` | GET | Public |
| UC13 | Tài trợ công khai | `/api/donations/public` | POST | Public |
| UC14 | Tài trợ (đã đăng nhập) | `/api/donations/authenticated` | POST | User |
| UC15 | Xem lịch sử tài trợ | `/api/donations` | GET | User |
| UC16 | Xem Donor Wall | `/api/donors/wall` | GET | Public |
| UC17 | Xem Impact Stats | `/api/statistics/impact` | GET | Public |
| UC18 | Xem thống kê sinh viên | `/api/statistics/public` | GET | Public |
| UC19 | Xem phân bổ ngân sách | `/api/statistics/fund-breakdown` | GET | Public |

---

## 🎯 LUỒNG SỬ DỤNG ĐIỂN HÌNH

### **Kịch bản 1: Tài trợ nhanh (không đăng ký)**
```
UC07 (Xem quỹ) 
  → UC08 (Xem STK) 
  → UC13 (Tài trợ công khai) 
  → Hoàn tất
```

### **Kịch bản 2: Nhà tài trợ thường xuyên**
```
UC01 (Đăng ký tài khoản NTT)
  → UC02 (Đăng nhập)
  → UC07 (Xem quỹ)
  → UC14 (Tài trợ qua tài khoản)
  → UC15 (Xem lịch sử)
```

### **Kịch bản 3: Xem trước khi tài trợ**
```
UC07 (Xem quỹ)
  → UC16 (Xem Donor Wall)
  → UC17 (Xem Impact Stats)
  → UC13/UC14 (Quyết định tài trợ)
```

---

## 🔒 GIỚI HẠN & QUYỀN TRUY CẬP

### **Được phép**:
✅ Tài trợ công khai hoặc qua tài khoản  
✅ Xem tất cả thông tin công khai (quỹ, thống kê, Donor Wall)  
✅ Xem lịch sử tài trợ của chính mình  
✅ Cập nhật thông tin cá nhân  

### **Không được phép**:
❌ Xem lịch sử tài trợ của nhà tài trợ khác  
❌ Tự duyệt khoản tài trợ của mình  
❌ Xem danh sách sinh viên  
❌ Xem chi tiết đơn xin hỗ trợ  
❌ Quản lý quỹ  

---

**Tổng cộng**: Nhà tài trợ có **15 Use Cases** tập trung vào việc tài trợ và theo dõi các khoản đã tài trợ, với khả năng tài trợ linh hoạt (có hoặc không cần tài khoản).
