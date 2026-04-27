# SO SÁNH 2 API TẠO NHÀ TÀI TRỢ

## 📌 TỔNG QUAN

Hệ thống có **2 API** để tạo nhà tài trợ, mỗi API phục vụ mục đích khác nhau:

1. **API Admin/Giáo vụ**: `POST /api/donors` - Tạo nhà tài trợ thủ công
2. **API Public**: `POST /api/donations/public` - Người dùng quyên góp

---

## 🔐 API 1: POST /api/donors (CHO ADMIN/GIÁO VỤ)

### **Đặc điểm:**
- ✅ **YÊU CẦU TOKEN**: Phải đăng nhập
- ✅ **YÊU CẦU QUYỀN**: Chỉ Admin (role_id = 1) hoặc Giáo vụ (role_id = 3)
- ✅ **CHỈ TẠO NHÀ TÀI TRỢ**: Không tạo khoản tài trợ
- ✅ **KHÔNG CHO PHÉP TRÙNG**: Email và SĐT phải unique

### **Mục đích:**
- Nhân viên tạo nhà tài trợ **TRƯỚC** (VD: đối tác, doanh nghiệp)
- Quản lý danh sách nhà tài trợ trong hệ thống

### **Luồng hoạt động:**
```
1. Kiểm tra token hợp lệ (middleware protect)
2. Kiểm tra quyền Admin/Giáo vụ (middleware authorizeRoles)
3. Validate dữ liệu đầu vào
4. Kiểm tra email và SĐT đã tồn tại chưa
   └─ Nếu TỒN TẠI → Trả lỗi 409 (Conflict)
5. INSERT vào bảng NhaTaiTro
6. Trả về thông tin nhà tài trợ vừa tạo
```

### **Request:**
```json
POST /api/donors
Headers: {
  "Authorization": "Bearer <access_token>"
}
Body: {
  "tenNhaTaiTro": "Công ty ABC",
  "loai": "Doanh nghiep",
  "email": "contact@abc.com",
  "soDienThoai": "0901234567",
  "diaChi": "123 Đường ABC, TP.HCM"
}
```

### **Response:**
```json
{
  "success": true,
  "message": "Tạo nhà tài trợ thành công",
  "donor": {
    "nhaTaiTroId": 5,
    "tenNhaTaiTro": "Công ty ABC",
    "loai": "Doanh nghiep",
    "email": "contact@abc.com",
    "soDienThoai": "0901234567",
    "diaChi": "123 Đường ABC, TP.HCM",
    "createdAt": "2026-04-27T10:30:00.000Z"
  }
}
```

### **Files liên quan:**
- `backend/routes/donorRoutes.js`
- `backend/controllers/donorController.js`
- `backend/models/DonorModel.js`

---

## 🌐 API 2: POST /api/donations/public (PUBLIC API)

### **Đặc điểm:**
- ❌ **KHÔNG CẦN TOKEN**: Ai cũng có thể truy cập
- ✅ **TỰ ĐỘNG TẠO NHÀ TÀI TRỢ**: Nếu email chưa tồn tại
- ✅ **DÙNG LẠI NHÀ TÀI TRỢ CŨ**: Nếu email đã tồn tại
- ✅ **TẠO KHOẢN TÀI TRỢ**: Với trạng thái "Chờ duyệt"
- ✅ **TRẢ VỀ THÔNG TIN NGÂN HÀNG**: Để người dùng chuyển khoản
- ✅ **SỬ DỤNG TRANSACTION**: Đảm bảo tính toàn vẹn dữ liệu

### **Mục đích:**
- Người dùng bên ngoài (không cần đăng nhập) muốn quyên góp **NGAY**
- Tự động xử lý nhà tài trợ (tạo mới hoặc dùng lại)

### **Luồng hoạt động (SỬ DỤNG TRANSACTION):**
```
1. Validate dữ liệu đầu vào
2. Kiểm tra quỹ có tồn tại và đang hoạt động không
3. BEGIN TRANSACTION
   ├─ Kiểm tra email trong bảng NhaTaiTro
   ├─ Nếu CHƯA TỒN TẠI:
   │  └─ INSERT vào NhaTaiTro (tạo nhà tài trợ mới)
   ├─ Nếu ĐÃ TỒN TẠI:
   │  └─ Lấy nha_tai_tro_id hiện có (dùng lại)
   ├─ INSERT vào KhoanTaiTro với:
   │  ├─ nha_tai_tro_id (mới hoặc cũ)
   │  ├─ quy_id
   │  ├─ so_tien
   │  ├─ trang_thai = "Chờ duyệt"
   │  └─ ghi_chu
   └─ COMMIT
4. Trả về thông tin donation + thông tin ngân hàng
```

### **Request:**
```json
POST /api/donations/public
Headers: {
  // KHÔNG CẦN Authorization header
}
Body: {
  "ten": "Nguyễn Văn A",
  "email": "nguyenvana@gmail.com",
  "soDienThoai": "0912345678",
  "soTien": 500000,
  "quyId": 1,
  "ghiChu": "Ủng hộ học bổng sinh viên"
}
```

### **Response:**
```json
{
  "success": true,
  "message": "Đăng ký đóng góp thành công. Vui lòng chuyển khoản theo thông tin bên dưới.",
  "donation": {
    "khoanTaiTroId": 10,
    "nhaTaiTro": {
      "id": 8,
      "ten": "Nguyễn Văn A",
      "email": "nguyenvana@gmail.com",
      "soDienThoai": "0912345678"
    },
    "quy": {
      "id": 1,
      "tenQuy": "Quỹ học bổng sinh viên"
    },
    "soTien": 500000,
    "ghiChu": "Ủng hộ học bổng sinh viên",
    "trangThai": "Cho duyet",
    "ngayTaiTro": "2026-04-27T10:45:00.000Z"
  },
  "bankInfo": {
    "tenNganHang": "Ngân hàng TMCP Á Châu (ACB)",
    "soTaiKhoan": "123456789",
    "chuTaiKhoan": "Trường Đại học ABC",
    "noiDung": "DONATE 10 Nguyễn Văn A",
    "soTien": 500000,
    "ghiChu": "Vui lòng chuyển khoản đúng nội dung để hệ thống tự động xác nhận"
  }
}
```

### **Files liên quan:**
- `backend/routes/donationRoutes.js`
- `backend/controllers/donationController.js`
- `backend/models/DonationModel.js`

---

## 📊 BẢNG SO SÁNH

| Tiêu chí | POST /api/donors | POST /api/donations/public |
|----------|------------------|----------------------------|
| **Yêu cầu Token** | ✅ Có (Admin/Giáo vụ) | ❌ Không |
| **Ai sử dụng** | Nhân viên nội bộ | Người dùng bên ngoài |
| **Tạo nhà tài trợ** | ✅ Có | ✅ Có (tự động) |
| **Tạo khoản tài trợ** | ❌ Không | ✅ Có |
| **Xử lý email trùng** | ❌ Báo lỗi | ✅ Dùng lại nhà tài trợ cũ |
| **Sử dụng Transaction** | ❌ Không | ✅ Có |
| **Trả về thông tin ngân hàng** | ❌ Không | ✅ Có |

---

## 🎯 KHI NÀO DÙNG API NÀO?

### **Dùng POST /api/donors khi:**
- Bạn là Admin/Giáo vụ
- Muốn tạo nhà tài trợ **TRƯỚC** (VD: đối tác, doanh nghiệp)
- Chưa có khoản tài trợ cụ thể
- Muốn quản lý danh sách nhà tài trợ

### **Dùng POST /api/donations/public khi:**
- Người dùng bên ngoài muốn quyên góp **NGAY**
- Không cần đăng nhập
- Muốn tạo cả nhà tài trợ và khoản tài trợ cùng lúc
- Cần thông tin ngân hàng để chuyển khoản

---

## 💡 VÍ DỤ THỰC TẾ

### **Tình huống 1: Công ty ABC muốn tài trợ**
1. Admin đăng nhập vào hệ thống
2. Gọi `POST /api/donors` để tạo nhà tài trợ "Công ty ABC"
3. Sau đó, khi công ty chuyển khoản, Admin tạo khoản tài trợ riêng

### **Tình huống 2: Sinh viên Nguyễn Văn A muốn quyên góp**
1. Sinh viên truy cập trang web (không cần đăng nhập)
2. Điền form quyên góp
3. Gọi `POST /api/donations/public`
4. Hệ thống:
   - Tự động tạo nhà tài trợ "Nguyễn Văn A" (nếu chưa có)
   - Tạo khoản tài trợ với trạng thái "Chờ duyệt"
   - Trả về thông tin ngân hàng
5. Sinh viên chuyển khoản theo thông tin
6. Admin xác nhận và đổi trạng thái thành "Đã nhận"

---

## 🔒 BẢO MẬT

### **API Admin (POST /api/donors):**
- Middleware `protect`: Kiểm tra JWT token
- Middleware `authorizeRoles(1, 3)`: Kiểm tra quyền
- Chỉ Admin và Giáo vụ mới truy cập được

### **API Public (POST /api/donations/public):**
- Không có middleware bảo mật
- Ai cũng có thể truy cập
- Nhưng khoản tài trợ phải được Admin duyệt

---

## 📝 GHI CHÚ

1. **Transaction trong API Public:**
   - Đảm bảo tính toàn vẹn dữ liệu
   - Nếu tạo nhà tài trợ thành công nhưng tạo khoản tài trợ thất bại → Rollback
   - Nếu cả 2 thành công → Commit

2. **Xử lý email trùng:**
   - API Admin: Không cho phép tạo nhà tài trợ trùng email
   - API Public: Dùng lại nhà tài trợ cũ nếu email đã tồn tại

3. **Trạng thái khoản tài trợ:**
   - Mặc định: "Chờ duyệt"
   - Sau khi Admin xác nhận đã nhận tiền: "Đã nhận"
   - Nếu từ chối: "Từ chối"

---

## 📂 CẤU TRÚC FILE

```
backend/
├── routes/
│   ├── donorRoutes.js          # Route cho API Admin
│   └── donationRoutes.js       # Route cho API Public
├── controllers/
│   ├── donorController.js      # Logic cho API Admin
│   └── donationController.js   # Logic cho API Public
└── models/
    ├── DonorModel.js           # Model cho nhà tài trợ (Admin)
    └── DonationModel.js        # Model cho donation (Public, có transaction)
```
