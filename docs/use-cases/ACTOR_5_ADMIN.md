# 👑 ACTOR 5: ADMIN (Role 1)

## 📊 TỔNG QUAN
- **Role ID**: 1
- **Số lượng Use Cases**: 25+
- **Quyền hạn**: **TOÀN QUYỀN** - Có thể thực hiện hầu hết chức năng của tất cả các role khác

---

## 📋 DANH SÁCH USE CASES (25+)

### **NHÓM 1: XÁC THỰC & TÀI KHOẢN** (6 Use Cases)
- **UC01**: Đăng ký tài khoản
- **UC02**: Đăng nhập
- **UC03**: Đổi mật khẩu
- **UC04**: Xem thông tin cá nhân
- **UC05**: Cập nhật thông tin cá nhân
- **UC06**: Đăng xuất

### **NHÓM 2: QUẢN LÝ QUỸ** (3 Use Cases)
- **UC16**: Quản lý quỹ (Tạo, sửa, xóa)
- **UC17**: Thay đổi trạng thái quỹ (Đang hoạt động / Tạm dừng / Đã đóng)
- **UC38**: Quản lý loại quỹ (Đào tạo, Nghiên cứu, CTXH, Hợp tác quốc tế)

### **NHÓM 3: QUẢN LÝ ĐƠN XIN HỖ TRỢ** (2 Use Cases)
- **UC18**: Xem danh sách tất cả đơn xin hỗ trợ
- **UC11**: Xem chi tiết đơn & lịch sử phê duyệt

### **NHÓM 4: QUẢN LÝ NHÀ TÀI TRỢ** (3 Use Cases)
- **UC21**: Quản lý nhà tài trợ (Xem, thêm, sửa, xóa)
- **UC22**: Quản lý sinh viên nổi bật (Nội dung Landing Page)
- **UC23**: Ghi nhận khoản tài trợ offline

### **NHÓM 5: XÁC NHẬN TÀI TRỢ** (2 Use Cases)
- **UC24**: Xem danh sách khoản tài trợ
- **UC25**: Xác nhận khoản tài trợ (Duyệt/Từ chối)

### **NHÓM 6: QUẢN LÝ GIAO DỊCH & BÁO CÁO** (5 Use Cases)
- **UC27**: Xem lịch sử giao dịch
- **UC29**: Xem thống kê tài chính (Dashboard kế toán)
- **UC30**: Xuất báo cáo tài chính (Word/Excel)
- **UC31**: Xem giao dịch bất thường
- **UC32**: Xuất Excel giao dịch

### **NHÓM 7: QUẢN LÝ NGƯỜI DÙNG** (4 Use Cases)
- **UC33**: Quản lý người dùng (CRUD, khóa/mở khóa)
- **UC34**: Quản lý vai trò (Xem, sửa vai trò)
- **UC39**: Xem thống kê người dùng (Tăng trưởng, phân bổ theo role)
- **UC41**: Cấp quyền người dùng (Assign role)

### **NHÓM 8: HỆ THỐNG** (4 Use Cases)
- **UC35**: Xem thống kê tổng quan (Dashboard chung)
- **UC36**: Xem nhật ký hệ thống (Lịch sử hoạt động của tất cả người dùng)
- **UC37**: Cài đặt hệ thống (Cấu hình quyền truy cập trang, settings)
- **UC42**: Xuất nhật ký (Export system logs)

### **NHÓM 9: QUẢN LÝ TÀI KHOẢN NGÂN HÀNG** (2 Use Cases)
- **UC43**: Quản lý tài khoản ngân hàng quỹ (Xem, thêm, sửa, xóa STK)
- **UC44**: Xem tài khoản ngân hàng người dùng (Khi xét duyệt hồ sơ)

---

## 📊 BẢNG API ENDPOINTS QUAN TRỌNG

| # | Use Case | API Endpoint | Method | Đặc quyền Admin |
|---|----------|--------------|--------|-----------------|
| UC16 | Quản lý quỹ | `/api/funds` | POST, PUT, DELETE | ✓ |
| UC21 | Quản lý nhà tài trợ | `/api/donors` | GET, POST, PUT, DELETE | ✓ |
| UC22 | Sinh viên nổi bật | `/api/student-showcase` | POST, PUT, DELETE | ✓ |
| UC25 | Xác nhận tài trợ | `/api/donations/:id/approve` | PUT | ✓ |
| UC27 | Lịch sử giao dịch | `/api/transactions` | GET | ✓ |
| UC30 | Xuất báo cáo | `/api/bao-cao/xuat` | POST | ✓ |
| UC33 | Quản lý người dùng | `/api/users` | GET, POST, PATCH, DELETE | ✓ |
| UC34 | Quản lý vai trò | `/api/roles` | GET, PATCH | ✓ |
| UC36 | Nhật ký hệ thống | `/api/system/nhat-ky` | GET | **CHỈ ADMIN** |
| UC37 | Cài đặt hệ thống | `/api/system/settings` | GET, PATCH | **CHỈ ADMIN** |
| UC38 | Quản lý loại quỹ | `/api/fund-types` | POST, PUT, DELETE | ✓ |
| UC41 | Cấp quyền user | `/api/users/:id/role` | PUT | **CHỈ ADMIN** |
| UC42 | Xuất nhật ký | `/api/system/nhat-ky/export` | GET | **CHỈ ADMIN** |
| UC43 | Quản lý TK ngân hàng | `/api/bank-accounts` | POST, PUT, DELETE | ✓ |

---

## 🎯 TRÁCH NHIỆM CHÍNH

### **Quản trị hệ thống**
✅ **Quản lý toàn bộ người dùng** - CRUD, khóa/mở khóa, cấp quyền  
✅ **Quản lý vai trò** - Sửa quyền hạn của từng role  
✅ **Xem nhật ký hệ thống** - Theo dõi mọi hoạt động trong hệ thống  
✅ **Cài đặt hệ thống** - Cấu hình quyền truy cập, settings toàn hệ thống  

### **Quản lý nghiệp vụ**
✅ **Quản lý quỹ** - Tạo, sửa, xóa, thay đổi trạng thái quỹ  
✅ **Quản lý nhà tài trợ** - Thêm, sửa, xóa nhà tài trợ  
✅ **Xác nhận tài trợ** - Duyệt/từ chối khoản tài trợ (như Kế toán)  
✅ **Xem tất cả đơn** - Theo dõi tất cả đơn xin hỗ trợ  
✅ **Quản lý giao dịch** - Xem tất cả giao dịch THU/CHI  

### **Báo cáo & Thống kê**
✅ **Dashboard tổng quan** - Tất cả số liệu hệ thống  
✅ **Xuất báo cáo** - Word/Excel về tất cả các loại  
✅ **Thống kê người dùng** - Tăng trưởng, phân bổ theo role  
✅ **Thống kê tài chính** - Dòng tiền, thu chi, sức khỏe quỹ  

### **Quyền đặc biệt (CHỈ ADMIN)**
🔒 **Xem nhật ký hệ thống** - Tracking tất cả hoạt động  
🔒 **Cài đặt hệ thống** - Config toàn hệ thống  
🔒 **Cấp quyền người dùng** - Thay đổi role của user  
🔒 **Xuất nhật ký** - Export system logs  

---

## 🔐 SO SÁNH QUYỀN HẠN

| Chức năng | Cán bộ | Kế toán | Admin |
|-----------|--------|---------|-------|
| Quản lý quỹ | ✓ | ✗ | ✓ |
| Phê duyệt cấp 1, 2 | ✓ | ✗ | ✓ (có thể) |
| Phê duyệt cấp 3 & Giải ngân | ✗ | ✓ | ✓ (có thể) |
| Xác nhận tài trợ | ✗ | ✓ | ✓ |
| Quản lý người dùng | ✓ (hạn chế) | ✗ | ✓ (toàn quyền) |
| Xem nhật ký hệ thống | ✗ | ✗ | ✓ (chỉ Admin) |
| Cài đặt hệ thống | ✗ | ✗ | ✓ (chỉ Admin) |
| Xuất báo cáo | ✗ | ✓ | ✓ |
| Quản lý vai trò | ✗ | ✗ | ✓ |

---

## 🚀 LUỒNG CÔNG VIỆC ADMIN

### **Luồng 1: Quản trị người dùng**
```
1. Xem danh sách người dùng (UC33)
2. Xem thống kê (UC39): Tăng trưởng, phân bổ role
3. Thao tác:
   - Tạo tài khoản mới (staff, cán bộ)
   - Khóa/mở khóa tài khoản
   - Cấp quyền (thay đổi role)
   - Xem lịch sử hoạt động
```

### **Luồng 2: Giám sát hệ thống**
```
1. Xem Dashboard tổng quan (UC35)
2. Xem nhật ký hệ thống (UC36)
   - Filter theo: người dùng, hành động, thời gian
   - Phát hiện hoạt động bất thường
3. Xem giao dịch bất thường (UC31)
4. Xuất báo cáo (UC30) hoặc nhật ký (UC42)
```

### **Luồng 3: Cấu hình hệ thống**
```
1. Vào trang Cài đặt (UC37)
2. Cấu hình:
   - Quyền truy cập trang (page permissions)
   - System settings
   - Email notifications
   - File upload settings
3. Lưu cấu hình
```

### **Luồng 4: Quản lý quỹ & tài trợ**
```
1. Quản lý loại quỹ (UC38)
2. Tạo/sửa quỹ (UC16)
3. Xem khoản tài trợ (UC24)
4. Xác nhận tài trợ (UC25) - nếu Kế toán bận
5. Xem lịch sử giao dịch (UC27)
```

---

## ⚠️ LƯU Ý ĐẶC BIỆT

### **Quyền Admin không nên lạm dụng**
- Admin CÓ THỂ thực hiện nhiều chức năng, nhưng KHÔNG NÊN can thiệp vào:
  - Phê duyệt đơn cấp 1, 2 (để Cán bộ làm)
  - Giải ngân (để Kế toán làm)
  - Trừ khi có tình huống đặc biệt

### **Phân quyền rõ ràng**
- Admin tập trung vào: Quản trị, giám sát, cấu hình
- Cán bộ: Phê duyệt đơn, quản lý quỹ
- Kế toán: Xác nhận tài trợ, giải ngân, báo cáo tài chính

---

**Tổng cộng**: Admin có **25+ Use Cases** với quyền hạn cao nhất, đồng thời có các quyền đặc biệt chỉ Admin mới có (nhật ký hệ thống, cài đặt, cấp quyền).
