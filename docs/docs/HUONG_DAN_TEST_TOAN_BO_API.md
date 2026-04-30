# 🧪 HƯỚNG DẪN TEST TOÀN BỘ API - HỆ THỐNG QUẢN LÝ QUỸ TVU

## 📋 MỤC LỤC

1. [Chuẩn bị](#chuẩn-bị)
2. [API Authentication (Đăng nhập)](#1-api-authentication-đăng-nhập)
3. [API Roles (Vai trò)](#2-api-roles-vai-trò)
4. [API Users (Người dùng)](#3-api-users-người-dùng)
5. [API Funds (Quỹ)](#4-api-funds-quỹ)
6. [API Donors (Nhà tài trợ)](#5-api-donors-nhà-tài-trợ)
7. [API Donations (Khoản tài trợ)](#6-api-donations-khoản-tài-trợ)
8. [API Transactions (Giao dịch)](#7-api-transactions-giao-dịch)
9. [API Applications (Đơn xin hỗ trợ)](#8-api-applications-đơn-xin-hỗ-trợ)
10. [Checklist Test](#checklist-test-đầy-đủ)

---

## 🔧 CHUẨN BỊ

### **1. Khởi động server**
```bash
cd backend
npm start
```

Đợi thấy:
```
Server chạy tại http://localhost:5001
✅ Kết nối MySQL thành công!
```

### **2. Tool test API**
Sử dụng một trong các tool sau:
- **Thunder Client** (Extension trong VS Code) - Khuyên dùng
- **Postman**
- **cURL** (Command line)

### **3. Base URL**
```
http://localhost:5001
```

### **4. Các Role trong hệ thống**
| Role ID | Tên | Quyền |
|---------|-----|-------|
| 1 | Admin | Toàn quyền |
| 2 | Kế toán | Duyệt/từ chối tài trợ, xem giao dịch |
| 3 | Giáo vụ | Quản lý user, quỹ, nhà tài trợ |
| 4 | Sinh viên | Xem thông tin cá nhân |
| 5 | Giảng viên | Xem thông tin cá nhân |

---

## 1. API AUTHENTICATION (Đăng nhập)

### 🔐 **1.1. Đăng nhập**

**Endpoint:** `POST /api/auth/login`

**Body:**
```json
{
  "email": "admin@tvu.edu.vn",
  "password": "admin123"
}
```

**Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "hoTen": "Nguyễn Văn Admin",
    "email": "admin@tvu.edu.vn",
    "roleId": 1,
    "tenVaiTro": "Admin"
  }
}
```

**👉 LƯU TOKEN NÀY LẠI** - Dùng cho tất cả các request sau!

---

### 🔄 **1.2. Refresh Token**

**Endpoint:** `POST /api/auth/refresh-token`

**Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "success": true,
  "token": "NEW_ACCESS_TOKEN",
  "refreshToken": "NEW_REFRESH_TOKEN"
}
```

---

### 👤 **1.3. Lấy thông tin user hiện tại**

**Endpoint:** `GET /api/auth/me`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "hoTen": "Nguyễn Văn Admin",
    "email": "admin@tvu.edu.vn",
    "roleId": 1,
    "tenVaiTro": "Admin"
  }
}
```

---

### 🔒 **1.4. Đổi mật khẩu**

**Endpoint:** `PUT /api/auth/update-password`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

**Body:**
```json
{
  "oldPassword": "admin123",
  "newPassword": "newpassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Đổi mật khẩu thành công"
}
```

---

### 🚪 **1.5. Đăng xuất**

**Endpoint:** `POST /api/auth/logout`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

**Response (200):**
```json
{
  "success": true,
  "message": "Đăng xuất thành công"
}
```

---

## 2. API ROLES (Vai trò)

**Quyền:** Admin (1) hoặc Giáo vụ (3)

### 📋 **2.1. Lấy danh sách vai trò**

**Endpoint:** `GET /api/roles`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "roleId": 1,
      "tenVaiTro": "Admin",
      "moTa": "Quản trị viên hệ thống"
    },
    {
      "roleId": 2,
      "tenVaiTro": "Ke toan",
      "moTa": "Kế toán"
    }
  ]
}
```

---

### 🔍 **2.2. Lấy thông tin 1 vai trò**

**Endpoint:** `GET /api/roles/:id`

**Ví dụ:** `GET /api/roles/1`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "roleId": 1,
    "tenVaiTro": "Admin",
    "moTa": "Quản trị viên hệ thống"
  }
}
```

---

### 👥 **2.3. Lấy danh sách user theo vai trò**

**Endpoint:** `GET /api/roles/:id/users`

**Ví dụ:** `GET /api/roles/1/users`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "userId": 1,
      "hoTen": "Nguyễn Văn Admin",
      "email": "admin@tvu.edu.vn",
      "roleId": 1
    }
  ]
}
```

---

## 3. API USERS (Người dùng)

**Quyền:** Admin (1) hoặc Giáo vụ (3)

### 📋 **3.1. Lấy danh sách người dùng**

**Endpoint:** `GET /api/users`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "userId": 1,
      "maSoDinhDanh": "ADMIN001",
      "hoTen": "Nguyễn Văn Admin",
      "email": "admin@tvu.edu.vn",
      "roleId": 1,
      "tenVaiTro": "Admin",
      "trangThai": "Hoat dong"
    }
  ]
}
```

---

### 🔍 **3.2. Lấy thông tin 1 người dùng**

**Endpoint:** `GET /api/users/:id`

**Ví dụ:** `GET /api/users/1`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "userId": 1,
    "maSoDinhDanh": "ADMIN001",
    "hoTen": "Nguyễn Văn Admin",
    "email": "admin@tvu.edu.vn",
    "roleId": 1,
    "tenVaiTro": "Admin",
    "khoaPhong": "Phòng Hành chính",
    "trangThai": "Hoat dong"
  }
}
```

---

### ➕ **3.3. Tạo người dùng mới**

**Endpoint:** `POST /api/users`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

**Body:**
```json
{
  "maSoDinhDanh": "KT001",
  "hoTen": "Trần Thị Kế Toán",
  "email": "ketoan@tvu.edu.vn",
  "matKhau": "ketoan123",
  "roleId": 2,
  "khoaPhong": "Phòng Tài chính"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Tạo người dùng thành công",
  "data": {
    "userId": 5,
    "hoTen": "Trần Thị Kế Toán",
    "email": "ketoan@tvu.edu.vn"
  }
}
```

---

### 🔄 **3.4. Cập nhật trạng thái người dùng**

**Endpoint:** `PUT /api/users/:id/status`

**Quyền:** Chỉ Admin (1)

**Ví dụ:** `PUT /api/users/5/status`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

**Body:**
```json
{
  "trangThai": "Khoa"
}
```

**Giá trị hợp lệ:** `Hoat dong`, `Khoa`, `Nghi viec`

**Response (200):**
```json
{
  "success": true,
  "message": "Cập nhật trạng thái thành công"
}
```

---

## 4. API FUNDS (Quỹ)

**Quyền:** Admin (1) hoặc Giáo vụ (3)

### 📋 **4.1. Lấy danh sách quỹ**

**Endpoint:** `GET /api/funds`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "quyId": 1,
      "tenQuy": "Quỹ Học Bổng 2024",
      "loaiQuy": "Hoc bong",
      "soDu": 25000000,
      "trangThai": "DANG_HOAT_DONG",
      "moTa": "Quỹ hỗ trợ học bổng sinh viên"
    }
  ]
}
```

---

### ➕ **4.2. Tạo quỹ mới**

**Endpoint:** `POST /api/funds`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

**Body:**
```json
{
  "tenQuy": "Quỹ Xây Dựng Cơ Sở Vật Chất",
  "loaiQuy": "Co so vat chat",
  "moTa": "Quỹ xây dựng và nâng cấp cơ sở vật chất"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Tạo quỹ thành công",
  "data": {
    "quyId": 2,
    "tenQuy": "Quỹ Xây Dựng Cơ Sở Vật Chất",
    "soDu": 0
  }
}
```

---

## 5. API DONORS (Nhà tài trợ)

**Quyền:** Admin (1) hoặc Giáo vụ (3)

### ➕ **5.1. Tạo nhà tài trợ**

**Endpoint:** `POST /api/donors`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

**Body:**
```json
{
  "tenNhaTaiTro": "Công ty ABC",
  "loai": "To chuc",
  "email": "contact@abc.com",
  "soDienThoai": "0281234567",
  "diaChi": "123 Đường ABC, TP.HCM"
}
```

**Loại hợp lệ:** `Ca nhan`, `To chuc`

**Response (201):**
```json
{
  "success": true,
  "message": "Tạo nhà tài trợ thành công",
  "data": {
    "nhaTaiTroId": 10,
    "tenNhaTaiTro": "Công ty ABC",
    "email": "contact@abc.com"
  }
}
```

---

## 6. API DONATIONS (Khoản tài trợ)

### 🌐 **6.1. Tạo khoản tài trợ công khai (KHÔNG CẦN TOKEN)**

**Endpoint:** `POST /api/donations/public`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "ten": "Nguyễn Văn A",
  "email": "nguyenvana@gmail.com",
  "soDienThoai": "0912345678",
  "soTien": 5000000,
  "quyId": 1,
  "ghiChu": "Ủng hộ học bổng sinh viên"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Đăng ký đóng góp thành công. Vui lòng chuyển khoản theo thông tin bên dưới.",
  "donation": {
    "khoanTaiTroId": 15,
    "nhaTaiTro": {
      "id": 8,
      "ten": "Nguyễn Văn A",
      "email": "nguyenvana@gmail.com"
    },
    "quy": {
      "id": 1,
      "tenQuy": "Quỹ Học Bổng 2024"
    },
    "soTien": 5000000,
    "trangThai": "Cho duyet"
  },
  "bankInfo": {
    "tenNganHang": "Ngân hàng TMCP Á Châu (ACB)",
    "soTaiKhoan": "123456789",
    "chuTaiKhoan": "Trường Đại học ABC",
    "noiDung": "DONATE 15 Nguyễn Văn A",
    "soTien": 5000000
  }
}
```

---

### ✅ **6.2. Duyệt khoản tài trợ**

**Endpoint:** `PUT /api/donations/:id/approve`

**Quyền:** Admin (1) hoặc Kế toán (2)

**Ví dụ:** `PUT /api/donations/15/approve`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

**Response (200):**
```json
{
  "success": true,
  "message": "Duyệt khoản tài trợ thành công",
  "donation": {
    "khoanTaiTroId": 15,
    "nhaTaiTro": {
      "ten": "Nguyễn Văn A",
      "email": "nguyenvana@gmail.com"
    },
    "quy": {
      "tenQuy": "Quỹ Học Bổng 2024"
    },
    "soTien": 5000000,
    "trangThaiCu": "Cho duyet",
    "trangThaiMoi": "Da nhan",
    "ngayDuyet": "2026-04-27T10:30:00.000Z",
    "nguoiDuyet": 2
  }
}
```

**Lưu ý:** Khi duyệt sẽ:
- Cập nhật trạng thái khoản tài trợ → "Đã nhận"
- Cộng tiền vào quỹ
- Tạo giao dịch THU

---

### ❌ **6.3. Từ chối khoản tài trợ**

**Endpoint:** `PUT /api/donations/:id/reject`

**Quyền:** Admin (1) hoặc Kế toán (2)

**Ví dụ:** `PUT /api/donations/16/reject`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

**Body:**
```json
{
  "lyDoTuChoi": "Thông tin chuyển khoản không khớp"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Từ chối khoản tài trợ thành công",
  "donation": {
    "khoanTaiTroId": 16,
    "trangThaiCu": "Cho duyet",
    "trangThaiMoi": "Tu choi",
    "lyDoTuChoi": "Thông tin chuyển khoản không khớp",
    "ngayTuChoi": "2026-04-27T11:00:00.000Z"
  }
}
```

---

## 7. API TRANSACTIONS (Giao dịch)

**Quyền:** Admin (1) hoặc Kế toán (2)

### 📋 **7.1. Lấy danh sách giao dịch**

**Endpoint:** `GET /api/transactions`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

**Query Parameters:**
| Tham số | Mô tả | Ví dụ |
|---------|-------|-------|
| `page` | Trang hiện tại | `?page=1` |
| `limit` | Số bản ghi/trang | `?limit=20` |
| `loai` | Lọc Thu/Chi | `?loai=Thu` |
| `quyId` | Lọc theo quỹ | `?quyId=1` |
| `trangThai` | Lọc theo trạng thái | `?trangThai=Thanh cong` |
| `tuNgay` | Từ ngày | `?tuNgay=2026-01-01` |
| `denNgay` | Đến ngày | `?denNgay=2026-04-27` |

**Ví dụ:**
```
GET /api/transactions?page=1&limit=20&loai=Thu&quyId=1
```

**Response (200):**
```json
{
  "success": true,
  "message": "Lấy danh sách giao dịch thành công",
  "data": [
    {
      "transactionId": 15,
      "loai": "Thu",
      "soTien": 5000000,
      "trangThai": "Thanh cong",
      "quy": {
        "id": 1,
        "tenQuy": "Quỹ Học Bổng 2024"
      },
      "khoanTaiTro": {
        "id": 15,
        "nhaTaiTro": {
          "ten": "Nguyễn Văn A",
          "email": "nguyenvana@gmail.com"
        }
      },
      "nguoiTao": {
        "id": 2,
        "hoTen": "Trần Thị Kế Toán",
        "email": "ketoan@tvu.edu.vn"
      },
      "ngayGiaoDich": "2026-04-27T10:30:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalRecords": 45,
    "limit": 20,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

### 🔍 **7.2. Xem chi tiết 1 giao dịch**

**Endpoint:** `GET /api/transactions/:id`

**Ví dụ:** `GET /api/transactions/15`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

**Response (200):**
```json
{
  "success": true,
  "message": "Lấy thông tin giao dịch thành công",
  "data": {
    "transactionId": 15,
    "loai": "Thu",
    "soTien": 5000000,
    "trangThai": "Thanh cong",
    "quy": {
      "id": 1,
      "tenQuy": "Quỹ Học Bổng 2024",
      "soDu": 30000000
    },
    "khoanTaiTro": {
      "id": 15,
      "soTien": 5000000,
      "trangThai": "Da nhan",
      "ngayTaiTro": "2026-04-27T08:00:00.000Z",
      "nhaTaiTro": {
        "id": 8,
        "ten": "Nguyễn Văn A",
        "email": "nguyenvana@gmail.com",
        "soDienThoai": "0912345678"
      }
    },
    "nguoiTao": {
      "id": 2,
      "hoTen": "Trần Thị Kế Toán",
      "email": "ketoan@tvu.edu.vn",
      "vaiTro": "Ke toan"
    },
    "minhChung": "https://example.com/proof.jpg",
    "ghiChu": "Duyệt khoản tài trợ #15",
    "ngayGiaoDich": "2026-04-27T10:30:00.000Z"
  }
}
```

---

## 🎯 LUỒNG TEST HOÀN CHỈNH

### **Kịch bản: Nhà tài trợ quyên góp và Admin duyệt**

#### **Bước 1: Nhà tài trợ tạo khoản quyên góp**
```
POST /api/donations/public
Body: {
  "ten": "Nguyễn Văn B",
  "email": "nguyenvanb@gmail.com",
  "soDienThoai": "0987654321",
  "soTien": 3000000,
  "quyId": 1
}
```
→ Nhận `khoanTaiTroId: 20`

---

#### **Bước 2: Admin đăng nhập**
```
POST /api/auth/login
Body: {
  "email": "admin@tvu.edu.vn",
  "password": "admin123"
}
```
→ Nhận `token`

---

#### **Bước 3: Admin duyệt khoản tài trợ**
```
PUT /api/donations/20/approve
Headers: Authorization: Bearer TOKEN
```
→ Tạo giao dịch THU, cộng tiền vào quỹ

---

#### **Bước 4: Kế toán xem lịch sử giao dịch**
```
GET /api/transactions?page=1&limit=20
Headers: Authorization: Bearer TOKEN
```
→ Thấy giao dịch vừa tạo với thông tin người duyệt

---

#### **Bước 5: Xem chi tiết giao dịch**
```
GET /api/transactions/21
Headers: Authorization: Bearer TOKEN
```
→ Thấy đầy đủ: ai duyệt, vào quỹ nào, lúc mấy giờ

---

## 8. API APPLICATIONS (Đơn xin hỗ trợ)

**Quyền:** Sinh viên (4) để nộp đơn, Admin/Giáo vụ (1,3) để xem tất cả

### 📝 **8.1. Sinh viên nộp đơn xin hỗ trợ**

**Endpoint:** `POST /api/applications`

**Quyền:** Sinh viên (4)

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json
```

**Body:**
```json
{
  "quyId": 1,
  "tieuDe": "Xin hỗ trợ học phí học kỳ 1 năm 2026",
  "moTa": "Em là sinh viên năm 3 khoa Công nghệ thông tin, mã số sinh viên 2021001234. Gia đình em gặp khó khăn về tài chính do ảnh hưởng của dịch bệnh. Bố mẹ em đều mất việc làm. Em rất mong nhận được sự hỗ trợ từ nhà trường để có thể tiếp tục học tập.",
  "soTienYeuCau": 5000000,
  "fileDinhKem": "https://example.com/minh-chung/hoc-ba-2026.pdf"
}
```

**Lưu ý quan trọng:**
- ✅ `tieuDe`: 10-200 ký tự
- ✅ `moTa`: Tối thiểu 50 ký tự
- ✅ `soTienYeuCau`: > 0 và <= 50 triệu
- ✅ `fileDinhKem`: **BẮT BUỘC**, chỉ chấp nhận: `.pdf`, `.jpg`, `.jpeg`, `.png`

**Response (201):**
```json
{
  "success": true,
  "message": "Nộp đơn xin hỗ trợ thành công. Đơn của bạn đang chờ xét duyệt.",
  "data": {
    "requestId": 10,
    "tieuDe": "Xin hỗ trợ học phí học kỳ 1 năm 2026",
    "soTienYeuCau": 5000000,
    "quy": {
      "id": 1,
      "tenQuy": "Quỹ Học Bổng 2024",
      "loaiQuy": "Hoc bong"
    },
    "trangThai": "Cho duyet",
    "ngayNop": "2026-04-28T10:00:00.000Z",
    "thongBao": "Bạn sẽ nhận được thông báo qua email khi đơn được xét duyệt"
  }
}
```

---

### 📋 **8.2. Sinh viên xem đơn của mình**

**Endpoint:** `GET /api/applications/my`

**Quyền:** Sinh viên (4)

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

**Query Parameters:**
- `page`: Trang hiện tại (mặc định: 1)
- `limit`: Số bản ghi/trang (mặc định: 20)

**Ví dụ:**
```
GET /api/applications/my?page=1&limit=10
```

**Response (200):**
```json
{
  "success": true,
  "message": "Lấy danh sách đơn thành công",
  "data": [
    {
      "requestId": 10,
      "tieuDe": "Xin hỗ trợ học phí học kỳ 1 năm 2026",
      "soTienYeuCau": 5000000,
      "trangThai": "Cho duyet",
      "quy": {
        "id": 1,
        "tenQuy": "Quỹ Học Bổng 2024"
      },
      "ngayNop": "2026-04-28T10:00:00.000Z"
    },
    {
      "requestId": 8,
      "tieuDe": "Xin hỗ trợ mua laptop phục vụ học tập",
      "soTienYeuCau": 10000000,
      "trangThai": "Da duyet",
      "quy": {
        "id": 1,
        "tenQuy": "Quỹ Học Bổng 2024"
      },
      "ngayNop": "2026-04-15T08:30:00.000Z"
    }
  ]
}
```

---

### 🔍 **8.3. Xem chi tiết 1 đơn**

**Endpoint:** `GET /api/applications/:id`

**Quyền:** 
- Sinh viên (4): Chỉ xem được đơn của mình
- Admin/Giáo vụ (1,3): Xem được tất cả

**Ví dụ:** `GET /api/applications/10`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

**Response (200):**
```json
{
  "success": true,
  "message": "Lấy thông tin đơn thành công",
  "data": {
    "requestId": 10,
    "tieuDe": "Xin hỗ trợ học phí học kỳ 1 năm 2026",
    "moTa": "Em là sinh viên năm 3 khoa Công nghệ thông tin...",
    "soTienYeuCau": 5000000,
    "fileDinhKem": "https://example.com/minh-chung/hoc-ba-2026.pdf",
    "trangThai": "Cho duyet",
    "nguoiNop": {
      "id": 5,
      "hoTen": "Nguyễn Văn Sinh Viên",
      "email": "sinhvien@tvu.edu.vn",
      "maSoDinhDanh": "2021001234"
    },
    "quy": {
      "id": 1,
      "tenQuy": "Quỹ Học Bổng 2024",
      "loaiQuy": "Hoc bong"
    },
    "nguoiDuyet": null,
    "ngayDuyet": null,
    "lyDoTuChoi": null,
    "ngayNop": "2026-04-28T10:00:00.000Z",
    "ngayCapNhat": "2026-04-28T10:00:00.000Z"
  }
}
```

---

### 📊 **8.4. Admin/Giáo vụ xem tất cả đơn**

**Endpoint:** `GET /api/applications`

**Quyền:** Admin (1) hoặc Giáo vụ (3)

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

**Query Parameters:**
| Tham số | Mô tả | Ví dụ |
|---------|-------|-------|
| `page` | Trang hiện tại | `?page=1` |
| `limit` | Số bản ghi/trang | `?limit=20` |
| `trangThai` | Lọc theo trạng thái | `?trangThai=Cho duyet` |
| `quyId` | Lọc theo quỹ | `?quyId=1` |
| `userId` | Lọc theo sinh viên | `?userId=5` |

**Trạng thái hợp lệ:**
- `Cho duyet` - Chờ duyệt
- `Dang xu ly` - Đang xử lý
- `Da duyet` - Đã duyệt
- `Tu choi` - Từ chối

**Ví dụ:**
```
GET /api/applications?page=1&limit=20&trangThai=Cho duyet
```

**Response (200):**
```json
{
  "success": true,
  "message": "Lấy danh sách đơn thành công",
  "data": [
    {
      "requestId": 10,
      "tieuDe": "Xin hỗ trợ học phí học kỳ 1 năm 2026",
      "soTienYeuCau": 5000000,
      "trangThai": "Cho duyet",
      "nguoiNop": {
        "id": 5,
        "hoTen": "Nguyễn Văn Sinh Viên",
        "email": "sinhvien@tvu.edu.vn",
        "maSoDinhDanh": "2021001234"
      },
      "quy": {
        "id": 1,
        "tenQuy": "Quỹ Học Bổng 2024"
      },
      "ngayNop": "2026-04-28T10:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 2,
    "totalRecords": 25,
    "limit": 20
  }
}
```

---

### ❌ **CÁC TRƯỜNG HỢP LỖI**

#### **Lỗi 1: Thiếu file đính kèm**
```json
{
  "success": false,
  "message": "Vui lòng đính kèm file minh chứng (PDF, JPG, PNG)"
}
```

#### **Lỗi 2: File sai định dạng**
```json
{
  "success": false,
  "message": "File đính kèm chỉ chấp nhận định dạng: PDF, JPG, PNG"
}
```

#### **Lỗi 3: URL file không hợp lệ**
```json
{
  "success": false,
  "message": "URL file đính kèm không hợp lệ"
}
```

#### **Lỗi 4: Tiêu đề quá ngắn/dài**
```json
{
  "success": false,
  "message": "Tiêu đề phải từ 10 đến 200 ký tự"
}
```

#### **Lỗi 5: Mô tả quá ngắn**
```json
{
  "success": false,
  "message": "Mô tả phải có ít nhất 50 ký tự"
}
```

#### **Lỗi 6: Số tiền vượt quá giới hạn**
```json
{
  "success": false,
  "message": "Số tiền yêu cầu không được vượt quá 50 triệu đồng"
}
```

#### **Lỗi 7: Quỹ không đủ số dư**
```json
{
  "success": false,
  "message": "Quỹ không đủ số dư. Số dư hiện tại: 10,000,000 VNĐ"
}
```

#### **Lỗi 8: Sinh viên xem đơn của người khác**
```json
{
  "success": false,
  "message": "Bạn không có quyền xem đơn này"
}
```

---

### 🔄 **8.5. Admin/Giáo vụ chuyển trạng thái đơn**

**Endpoint:** `PUT /api/applications/:id/status`

**Quyền:** Admin (1) hoặc Giáo vụ (3)

**Ví dụ:** `PUT /api/applications/10/status`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json
```

---

#### **📋 MÔ TẢ LUỒNG HOẠT ĐỘNG:**

```
┌─────────────────────────────────────────────────────────────────┐
│  LUỒNG CHUYỂN TRẠNG THÁI ĐƠN XIN HỖ TRỢ                        │
└─────────────────────────────────────────────────────────────────┘

1. Admin/Giáo vụ đăng nhập → Lấy token
                ↓
2. Gửi request PUT /api/applications/:id/status
   - Truyền trạng thái mới (trangThai)
   - Nếu từ chối: Truyền lý do (lyDoTuChoi)
                ↓
3. Hệ thống validate:
   ✓ Kiểm tra đơn tồn tại
   ✓ Kiểm tra trạng thái hiện tại
   ✓ Không cho phép sửa đơn đã duyệt/từ chối
                ↓
4. Xử lý theo trạng thái:
   
   ┌─────────────────────────────────────────────────────────┐
   │ A. DUYỆT ĐƠN (Da duyet)                                 │
   ├─────────────────────────────────────────────────────────┤
   │ 1. Kiểm tra số dư quỹ                                   │
   │ 2. Tạo giao dịch CHI                                    │
   │ 3. Trừ tiền quỹ                                         │
   │ 4. Cập nhật trạng thái đơn + người duyệt + ngày duyệt  │
   │ 5. Commit transaction                                   │
   └─────────────────────────────────────────────────────────┘
   
   ┌─────────────────────────────────────────────────────────┐
   │ B. TỪ CHỐI ĐƠN (Tu choi)                               │
   ├─────────────────────────────────────────────────────────┤
   │ 1. Validate lý do từ chối (bắt buộc)                   │
   │ 2. Cập nhật trạng thái + lý do + người duyệt           │
   │ 3. Commit transaction                                   │
   └─────────────────────────────────────────────────────────┘
   
   ┌─────────────────────────────────────────────────────────┐
   │ C. CHUYỂN SANG "ĐANG XỬ LÝ" (Dang xu ly)               │
   ├─────────────────────────────────────────────────────────┤
   │ 1. Cập nhật trạng thái                                  │
   │ 2. Commit transaction                                   │
   └─────────────────────────────────────────────────────────┘
                ↓
5. Trả về kết quả cho Admin/Giáo vụ
```

---

#### **CASE 1: Duyệt đơn (Da duyet)**

**Body:**
```json
{
  "trangThai": "Da duyet"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Duyệt đơn xin hỗ trợ thành công",
  "data": {
    "requestId": 10,
    "tieuDe": "Xin hỗ trợ học phí học kỳ 1 năm 2026",
    "soTienYeuCau": 5000000,
    "trangThaiCu": "Cho duyet",
    "trangThaiMoi": "Da duyet",
    "nguoiDuyet": {
      "id": 1,
      "hoTen": "Nguyễn Văn Admin",
      "email": "admin@tvu.edu.vn"
    },
    "quy": {
      "id": 1,
      "tenQuy": "Quỹ Học Bổng 2024",
      "soDuCu": 30000000,
      "soDuMoi": 25000000
    },
    "ngayDuyet": "2026-04-30T10:30:00.000Z",
    "thongBao": "Giao dịch CHI đã được tạo và số dư quỹ đã được cập nhật"
  }
}
```

**Lưu ý:** Khi duyệt sẽ:
- ✅ Tạo giao dịch CHI
- ✅ Trừ tiền quỹ
- ✅ Cập nhật người duyệt + ngày duyệt

---

#### **CASE 2: Từ chối đơn (Tu choi)**

**Body:**
```json
{
  "trangThai": "Tu choi",
  "lyDoTuChoi": "Hồ sơ không đầy đủ, thiếu giấy xác nhận thu nhập gia đình"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Từ chối đơn xin hỗ trợ thành công",
  "data": {
    "requestId": 10,
    "tieuDe": "Xin hỗ trợ học phí học kỳ 1 năm 2026",
    "trangThaiCu": "Cho duyet",
    "trangThaiMoi": "Tu choi",
    "lyDoTuChoi": "Hồ sơ không đầy đủ, thiếu giấy xác nhận thu nhập gia đình",
    "nguoiDuyet": {
      "id": 1,
      "hoTen": "Nguyễn Văn Admin",
      "email": "admin@tvu.edu.vn"
    },
    "ngayDuyet": "2026-04-30T10:35:00.000Z"
  }
}
```

**Lưu ý:** Khi từ chối:
- ✅ Bắt buộc phải có lý do
- ✅ Không tạo giao dịch
- ✅ Không trừ tiền quỹ

---

#### **CASE 3: Chuyển sang "Đang xử lý" (Dang xu ly)**

**Body:**
```json
{
  "trangThai": "Dang xu ly"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Chuyển đơn sang trạng thái 'Đang xử lý' thành công",
  "data": {
    "requestId": 10,
    "tieuDe": "Xin hỗ trợ học phí học kỳ 1 năm 2026",
    "trangThaiCu": "Cho duyet",
    "trangThaiMoi": "Dang xu ly",
    "ngayCapNhat": "2026-04-30T10:40:00.000Z"
  }
}
```

---

#### **❌ CÁC TRƯỜNG HỢP LỖI - CHUYỂN TRẠNG THÁI**

**Lỗi 1: Thiếu trạng thái**
```json
{
  "success": false,
  "message": "Vui lòng cung cấp trạng thái mới"
}
```

**Lỗi 2: Trạng thái không hợp lệ**
```json
{
  "success": false,
  "message": "Trạng thái không hợp lệ. Chỉ chấp nhận: Cho duyet, Dang xu ly, Da duyet, Tu choi"
}
```

**Lỗi 3: Từ chối nhưng không có lý do**
```json
{
  "success": false,
  "message": "Vui lòng cung cấp lý do từ chối"
}
```

**Lỗi 4: Đơn không tồn tại**
```json
{
  "success": false,
  "message": "Không tìm thấy đơn xin hỗ trợ"
}
```

**Lỗi 5: Đơn đã được duyệt**
```json
{
  "success": false,
  "message": "Không thể thay đổi trạng thái đơn đã được duyệt"
}
```

**Lỗi 6: Đơn đã bị từ chối**
```json
{
  "success": false,
  "message": "Không thể thay đổi trạng thái đơn đã bị từ chối"
}
```

**Lỗi 7: Trạng thái trùng**
```json
{
  "success": false,
  "message": "Đơn đang ở trạng thái \"Cho duyet\""
}
```

**Lỗi 8: Quỹ không đủ số dư (khi duyệt)**
```json
{
  "success": false,
  "message": "Quỹ không đủ số dư. Số dư hiện tại: 3,000,000 VNĐ, Số tiền yêu cầu: 5,000,000 VNĐ"
}
```

**Lỗi 9: Không có quyền (Kế toán, Sinh viên)**
```json
{
  "success": false,
  "message": "Bạn không có quyền truy cập"
}
```

---

### 🎯 **KỊCH BẢN TEST HOÀN CHỈNH - ĐƠN XIN HỖ TRỢ**

#### **Bước 1: Sinh viên đăng nhập**
```
POST /api/auth/login
Body: {
  "email": "sinhvien@tvu.edu.vn",
  "password": "sinhvien123"
}
```
→ Nhận `token_sinh_vien`

---

#### **Bước 2: Sinh viên nộp đơn**
```
POST /api/applications
Headers: Authorization: Bearer token_sinh_vien
Body: {
  "quyId": 1,
  "tieuDe": "Xin hỗ trợ học phí học kỳ 1 năm 2026",
  "moTa": "Em là sinh viên năm 3 khoa Công nghệ thông tin...",
  "soTienYeuCau": 5000000,
  "fileDinhKem": "https://example.com/minh-chung.pdf"
}
```
→ Nhận `requestId: 10`, trạng thái: `Cho duyet`

---

#### **Bước 3: Sinh viên xem đơn của mình**
```
GET /api/applications/my
Headers: Authorization: Bearer token_sinh_vien
```
→ Thấy đơn vừa nộp

---

#### **Bước 4: Admin đăng nhập**
```
POST /api/auth/login
Body: {
  "email": "admin@tvu.edu.vn",
  "password": "admin123"
}
```
→ Nhận `token_admin`

---

#### **Bước 5: Admin xem tất cả đơn chờ duyệt**
```
GET /api/applications?trangThai=Cho duyet
Headers: Authorization: Bearer token_admin
```
→ Thấy đơn của sinh viên

---

#### **Bước 6: Admin chuyển đơn sang "Đang xử lý"**
```
PUT /api/applications/10/status
Headers: Authorization: Bearer token_admin
Body: {
  "trangThai": "Dang xu ly"
}
```
→ Trạng thái: `Cho duyet` → `Dang xu ly`

---

#### **Bước 7: Admin duyệt đơn**
```
PUT /api/applications/10/status
Headers: Authorization: Bearer token_admin
Body: {
  "trangThai": "Da duyet"
}
```
→ Tạo giao dịch CHI, trừ tiền quỹ

---

#### **Bước 8: Kế toán xem giao dịch**
```
GET /api/transactions?loai=Chi
Headers: Authorization: Bearer token_ke_toan
```
→ Thấy giao dịch CHI vừa tạo

---

#### **Bước 9: Sinh viên xem lại đơn**
```
GET /api/applications/10
Headers: Authorization: Bearer token_sinh_vien
```
→ Thấy trạng thái: `Da duyet`, người duyệt, ngày duyệt

---

## ✅ CHECKLIST TEST ĐẦY ĐỦ

### **Authentication**
- [ ] Đăng nhập thành công
- [ ] Đăng nhập sai email/password → 401
- [ ] Refresh token
- [ ] Lấy thông tin user hiện tại
- [ ] Đổi mật khẩu
- [ ] Đăng xuất

### **Roles**
- [ ] Lấy danh sách vai trò
- [ ] Lấy thông tin 1 vai trò
- [ ] Lấy danh sách user theo vai trò
- [ ] Test không có token → 401
- [ ] Test role không đủ quyền → 403

### **Users**
- [ ] Lấy danh sách người dùng
- [ ] Lấy thông tin 1 người dùng
- [ ] Tạo người dùng mới
- [ ] Cập nhật trạng thái (chỉ Admin)
- [ ] Test role Giáo vụ không thể update status → 403

### **Funds**
- [ ] Lấy danh sách quỹ
- [ ] Tạo quỹ mới
- [ ] Test role không đủ quyền → 403

### **Donors**
- [ ] Tạo nhà tài trợ
- [ ] Test email trùng → 400
- [ ] Test role không đủ quyền → 403

### **Donations**
- [ ] Tạo khoản tài trợ công khai (không cần token)
- [ ] Duyệt khoản tài trợ (Admin/Kế toán)
- [ ] Từ chối khoản tài trợ (Admin/Kế toán)
- [ ] Test duyệt khoản đã duyệt → 400
- [ ] Test từ chối khoản đã duyệt → 400
- [ ] Test role không đủ quyền → 403

### **Transactions**
- [ ] Lấy danh sách giao dịch
- [ ] Lọc theo loại (Thu/Chi)
- [ ] Lọc theo quỹ
- [ ] Lọc theo trạng thái
- [ ] Lọc theo khoảng thời gian
- [ ] Test phân trang
- [ ] Xem chi tiết 1 giao dịch
- [ ] Test ID không tồn tại → 404
- [ ] Test role không đủ quyền → 403

### **Applications (Đơn xin hỗ trợ)**
- [ ] Sinh viên nộp đơn thành công
- [ ] Test thiếu file đính kèm → 400
- [ ] Test file sai định dạng (.doc, .txt) → 400
- [ ] Test file đúng định dạng (.pdf, .jpg, .png) → 201
- [ ] Test URL file không hợp lệ → 400
- [ ] Test tiêu đề quá ngắn (< 10 ký tự) → 400
- [ ] Test tiêu đề quá dài (> 200 ký tự) → 400
- [ ] Test mô tả quá ngắn (< 50 ký tự) → 400
- [ ] Test số tiền = 0 → 400
- [ ] Test số tiền > 50 triệu → 400
- [ ] Test quỹ không đủ số dư → 400
- [ ] Sinh viên xem đơn của mình
- [ ] Sinh viên xem chi tiết đơn của mình
- [ ] Sinh viên xem đơn của người khác → 403
- [ ] Admin/Giáo vụ xem tất cả đơn
- [ ] Lọc đơn theo trạng thái
- [ ] Lọc đơn theo quỹ
- [ ] Test role không đủ quyền (Kế toán) → 403
- [ ] Admin/Giáo vụ chuyển đơn sang "Đang xử lý"
- [ ] Admin/Giáo vụ duyệt đơn → Tạo giao dịch CHI + Trừ tiền quỹ
- [ ] Admin/Giáo vụ từ chối đơn (có lý do)
- [ ] Test từ chối không có lý do → 400
- [ ] Test duyệt đơn đã duyệt → 400
- [ ] Test sửa đơn đã từ chối → 400
- [ ] Test trạng thái không hợp lệ → 400
- [ ] Test quỹ không đủ số dư khi duyệt → 400
- [ ] Test role không đủ quyền chuyển trạng thái (Sinh viên, Kế toán) → 403

---

## 📝 GHI CHÚ

### **Các trạng thái**

**Khoản tài trợ:**
- `Cho duyet` - Chờ duyệt
- `Da nhan` - Đã nhận
- `Tu choi` - Từ chối

**Đơn xin hỗ trợ:**
- `Cho duyet` - Chờ duyệt
- `Dang xu ly` - Đang xử lý
- `Da duyet` - Đã duyệt
- `Tu choi` - Từ chối

**Giao dịch:**
- `Cho xu ly` - Chờ xử lý
- `Thanh cong` - Thành công
- `That bai` - Thất bại
- `Hoan tien` - Hoàn tiền

**User:**
- `Hoat dong` - Hoạt động
- `Khoa` - Khóa
- `Nghi viec` - Nghỉ việc

**Quỹ:**
- `DANG_HOAT_DONG` - Đang hoạt động
- `TAM_DUNG` - Tạm dừng
- `DONG` - Đóng

---

## 🐛 XỬ LÝ LỖI THƯỜNG GẶP

### **Lỗi 401 - Unauthorized**
- Kiểm tra token có đúng không
- Token có hết hạn không (dùng refresh token)
- Header Authorization có đúng format: `Bearer TOKEN`

### **Lỗi 403 - Forbidden**
- Kiểm tra role có đủ quyền không
- Đăng nhập bằng tài khoản có quyền phù hợp

### **Lỗi 404 - Not Found**
- Kiểm tra ID có tồn tại không
- Kiểm tra URL có đúng không

### **Lỗi 500 - Server Error**
- Xem log trong terminal server
- Kiểm tra database có chạy không
- Kiểm tra dữ liệu gửi lên có đúng format không

---

**Ngày tạo:** 2026-04-27  
**Phiên bản:** 1.0  
**Người tạo:** Kiro AI Assistant
