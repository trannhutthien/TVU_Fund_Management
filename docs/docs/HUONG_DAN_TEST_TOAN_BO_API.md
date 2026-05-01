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

### ❌ **8.5. Từ chối đơn (bất kỳ cấp nào)**

**Endpoint:** `PUT /api/applications/:id/reject`

**Quyền:** Admin (1) hoặc Giáo vụ (3)

**Ví dụ:** `PUT /api/applications/10/reject`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json
```

---

#### **📋 MÔ TẢ LUỒNG HOẠT ĐỘNG - TỪ CHỐI ĐƠN:**

```
┌─────────────────────────────────────────────────────────────────┐
│  LUỒNG TỪ CHỐI ĐƠN XIN HỖ TRỢ (BẤT KỲ CẤP NÀO)                │
└─────────────────────────────────────────────────────────────────┘

1. Admin/Giáo vụ đăng nhập → Lấy token
                ↓
2. Gửi request PUT /api/applications/:id/reject
   - Truyền lý do từ chối (lyDoTuChoi) - BẮT BUỘC
   - Có thể truyền ghi chú (ghiChu) - TÙY CHỌN
                ↓
3. Hệ thống validate:
   ✓ Kiểm tra đơn tồn tại
   ✓ Kiểm tra lý do từ chối (bắt buộc, >= 10 ký tự)
   ✓ Không cho phép từ chối đơn đã giải ngân
   ✓ Không cho phép từ chối đơn đã bị từ chối
                ↓
4. Xử lý từ chối:
   ┌─────────────────────────────────────────────────────────┐
   │ 1. Lấy cấp độ duyệt hiện tại                            │
   │ 2. Cập nhật PheDuyet cấp hiện tại:                      │
   │    - ket_qua = 'Tu choi'                                │
   │    - nguoi_duyet_id = người từ chối                     │
   │    - ly_do_tu_choi = lý do                              │
   │    - ngay_duyet = thời gian hiện tại                    │
   │ 3. Cập nhật YeuCauHoTro:                                │
   │    - trang_thai = 'Tu choi'                             │
   │    - ly_do_tu_choi = lý do                              │
   │ 4. Commit transaction                                   │
   └─────────────────────────────────────────────────────────┘
                ↓
5. Trả về kết quả cho Admin/Giáo vụ
```

---

#### **Body:**
```json
{
  "lyDoTuChoi": "Hồ sơ không đầy đủ, thiếu giấy xác nhận thu nhập gia đình",
  "ghiChu": "Sinh viên cần bổ sung thêm giấy tờ chứng minh hoàn cảnh khó khăn"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Từ chối đơn xin hỗ trợ tại cấp 1 thành công",
  "data": {
    "requestId": 10,
    "tieuDe": "Xin hỗ trợ học phí học kỳ 1 năm 2026",
    "soTienYeuCau": 5000000,
    "capDuyet": 1,
    "trangThaiCu": "Cho duyet",
    "trangThaiMoi": "Tu choi",
    "lyDoTuChoi": "Hồ sơ không đầy đủ, thiếu giấy xác nhận thu nhập gia đình",
    "nguoiTuChoi": {
      "id": 3,
      "hoTen": "Trần Thị Giáo Vụ",
      "email": "giaovu@tvu.edu.vn"
    },
    "ngayTuChoi": "2026-05-01T10:30:00.000Z",
    "thongBao": "Đơn đã bị từ chối. Sinh viên sẽ nhận được thông báo qua email."
  }
}
```

---

#### **❌ CÁC TRƯỜNG HỢP LỖI - TỪ CHỐI ĐƠN**

**Lỗi 1: Thiếu lý do từ chối**
```json
{
  "success": false,
  "message": "Vui lòng cung cấp lý do từ chối"
}
```

**Lỗi 2: Lý do từ chối quá ngắn**
```json
{
  "success": false,
  "message": "Lý do từ chối phải có ít nhất 10 ký tự"
}
```

**Lỗi 3: Đơn không tồn tại**
```json
{
  "success": false,
  "message": "Không tìm thấy đơn xin hỗ trợ"
}
```

**Lỗi 4: Đơn đã giải ngân**
```json
{
  "success": false,
  "message": "Không thể từ chối đơn đã được giải ngân"
}
```

**Lỗi 5: Đơn đã bị từ chối**
```json
{
  "success": false,
  "message": "Đơn này đã bị từ chối trước đó"
}
```

---

### ✅ **8.6. Giáo vụ duyệt cấp 1**

**Endpoint:** `PUT /api/applications/:id/staff-approve`

**Quyền:** Chỉ Giáo vụ (role_id = 3)

**Ví dụ:** `PUT /api/applications/10/staff-approve`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json
```

---

#### **📋 MÔ TẢ LUỒNG HOẠT ĐỘNG - GIÁO VỤ DUYỆT CẤP 1:**

```
┌─────────────────────────────────────────────────────────────────┐
│  LUỒNG PHÊ DUYỆT 3 CẤP - CẤP 1 (GIÁO VỤ)                       │
└─────────────────────────────────────────────────────────────────┘

GIAI ĐOẠN 1: KHỞI TẠO (Sinh viên nộp đơn)
┌─────────────────────────────────────────────────────────────────┐
│ API: POST /api/applications                                     │
│                                                                 │
│ Hành động của Hệ thống:                                         │
│ 1. Tạo 1 dòng trong YeuCauHoTro:                                │
│    - trang_thai = 'Cho duyet'                                   │
│                                                                 │
│ 2. Tự động tạo 3 dòng trong PheDuyet:                           │
│    - Dòng 1: cap_do_duyet = 1, ket_qua = 'Cho duyet'            │
│    - Dòng 2: cap_do_duyet = 2, ket_qua = 'Cho duyet'            │
│    - Dòng 3: cap_do_duyet = 3, ket_qua = 'Cho duyet'            │
│                                                                 │
│ Kết quả: Đơn xuất hiện trên màn hình của Giáo vụ               │
└─────────────────────────────────────────────────────────────────┘
                ↓
GIAI ĐOẠN 2: GIÁO VỤ DUYỆT CẤP 1
┌─────────────────────────────────────────────────────────────────┐
│ API: PUT /api/applications/:id/staff-approve                    │
│ Quyền: Chỉ Giáo vụ (role_id = 3)                                │
│                                                                 │
│ Điều kiện:                                                      │
│ ✓ Đơn phải ở trạng thái 'Cho duyet'                             │
│ ✓ Cấp độ duyệt hiện tại phải là cấp 1                           │
│                                                                 │
│ Hành động:                                                      │
│ 1. Cập nhật PheDuyet (dòng cấp 1):                              │
│    - ket_qua = 'Da duyet'                                       │
│    - nguoi_duyet_id = Giáo vụ hiện tại                          │
│    - ngay_duyet = thời gian hiện tại                            │
│                                                                 │
│ 2. Cập nhật YeuCauHoTro:                                        │
│    - trang_thai = 'Dang xu ly'                                  │
│                                                                 │
│ Kết quả: Đơn chuyển sang cấp 2, chờ cấp 2 duyệt tiếp           │
└─────────────────────────────────────────────────────────────────┘
                ↓
GIAI ĐOẠN 3: CẤP 2 DUYỆT (Chưa implement)
┌─────────────────────────────────────────────────────────────────┐
│ API: PUT /api/applications/:id/level2-approve (Chưa có)        │
│                                                                 │
│ Hành động tương tự cấp 1:                                       │
│ - Cập nhật PheDuyet cấp 2: ket_qua = 'Da duyet'                 │
│ - YeuCauHoTro vẫn giữ: trang_thai = 'Dang xu ly'                │
│                                                                 │
│ Kết quả: Đơn chuyển sang cấp 3, chờ cấp 3 duyệt cuối           │
└─────────────────────────────────────────────────────────────────┘
                ↓
GIAI ĐOẠN 4: CẤP 3 DUYỆT (Chưa implement)
┌─────────────────────────────────────────────────────────────────┐
│ API: PUT /api/applications/:id/level3-approve (Chưa có)        │
│                                                                 │
│ Hành động:                                                      │
│ 1. Cập nhật PheDuyet cấp 3: ket_qua = 'Da duyet'                │
│                                                                 │
│ 2. Kiểm tra số dư quỹ:                                          │
│    ┌─────────────────────────────────────────────────────┐     │
│    │ A. Quỹ ĐỦ TIỀN:                                     │     │
│    │    - trang_thai = 'Da giai ngan'                    │     │
│    │    - Tạo giao dịch CHI                              │     │
│    │    - Trừ tiền quỹ                                   │     │
│    └─────────────────────────────────────────────────────┘     │
│    ┌─────────────────────────────────────────────────────┐     │
│    │ B. Quỹ THIẾU TIỀN:                                  │     │
│    │    - trang_thai = 'Cho giai ngan'                   │     │
│    │    - Chờ quỹ có tiền để giải ngân                   │     │
│    └─────────────────────────────────────────────────────┘     │
│                                                                 │
│ Kết quả: Đơn hoàn tất hoặc chờ giải ngân                        │
└─────────────────────────────────────────────────────────────────┘
                ↓
GIAI ĐOẠN 5: GIẢI NGÂN CÁC ĐƠN CHỜ (Chưa implement)
┌─────────────────────────────────────────────────────────────────┐
│ API: POST /api/applications/disburse-pending (Chưa có)         │
│                                                                 │
│ Hành động:                                                      │
│ 1. Lấy danh sách đơn: trang_thai = 'Cho giai ngan'             │
│ 2. Sắp xếp theo ngay_tao ASC (cũ nhất trước)                    │
│ 3. Giải ngân lần lượt cho đến khi hết tiền quỹ:                 │
│    - Tạo giao dịch CHI                                          │
│    - Trừ tiền quỹ                                               │
│    - Cập nhật: trang_thai = 'Da giai ngan'                      │
│                                                                 │
│ Kết quả: Các đơn cũ nhất được ưu tiên giải ngân                 │
└─────────────────────────────────────────────────────────────────┘

LƯU Ý: TỪ CHỐI TẠI BẤT KỲ CẤP NÀO
┌─────────────────────────────────────────────────────────────────┐
│ API: PUT /api/applications/:id/reject                           │
│ Quyền: Admin (1) hoặc Giáo vụ (3)                               │
│                                                                 │
│ Hành động:                                                      │
│ - Cập nhật PheDuyet cấp hiện tại: ket_qua = 'Tu choi'           │
│ - Cập nhật YeuCauHoTro: trang_thai = 'Tu choi'                  │
│                                                                 │
│ Kết quả: Đơn kết thúc, không tiếp tục duyệt các cấp sau         │
└─────────────────────────────────────────────────────────────────┘
```

---

#### **Body (Tùy chọn):**
```json
{
  "ghiChu": "Đơn hợp lệ, chuyển lên cấp 2 xét duyệt"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Duyệt đơn xin hỗ trợ cấp 1 thành công",
  "data": {
    "requestId": 10,
    "tieuDe": "Xin hỗ trợ học phí học kỳ 1 năm 2026",
    "soTienYeuCau": 5000000,
    "capDuyet": 1,
    "trangThaiCu": "Cho duyet",
    "trangThaiMoi": "Dang xu ly",
    "nguoiDuyet": {
      "id": 3,
      "hoTen": "Trần Thị Giáo Vụ",
      "email": "giaovu@tvu.edu.vn",
      "vaiTro": "Giáo vụ"
    },
    "ngayDuyet": "2026-05-01T10:00:00.000Z",
    "thongBao": "Đơn đã được Giáo vụ duyệt cấp 1. Chờ cấp 2 duyệt tiếp."
  }
}
```

---

#### **❌ CÁC TRƯỜNG HỢP LỖI - GIÁO VỤ DUYỆT CẤP 1**

**Lỗi 1: ID đơn không hợp lệ**
```json
{
  "success": false,
  "message": "ID đơn không hợp lệ"
}
```

**Lỗi 2: Đơn không tồn tại**
```json
{
  "success": false,
  "message": "Không tìm thấy đơn xin hỗ trợ"
}
```

**Lỗi 3: Đơn không phải trạng thái "Cho duyet"**
```json
{
  "success": false,
  "message": "Không thể duyệt đơn ở trạng thái \"Dang xu ly\". Chỉ duyệt được đơn ở trạng thái \"Cho duyet\"."
}
```

**Lỗi 4: Đơn không phải cấp 1**
```json
{
  "success": false,
  "message": "Đơn này đang ở cấp 2. Giáo vụ chỉ duyệt được cấp 1."
}
```

**Lỗi 5: Không tìm thấy thông tin phê duyệt**
```json
{
  "success": false,
  "message": "Không tìm thấy thông tin phê duyệt hoặc đơn đã được duyệt hết"
}
```

**Lỗi 6: Role không phải Giáo vụ**
```json
{
  "success": false,
  "message": "Bạn không có quyền truy cập"
}
```

---

### 🎯 **KỊCH BẢN TEST HOÀN CHỈNH - PHÊ DUYỆT 3 CẤP**

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
  "moTa": "Em là sinh viên năm 3 khoa Công nghệ thông tin, mã số sinh viên 2021001234. Gia đình em gặp khó khăn về tài chính...",
  "soTienYeuCau": 5000000,
  "fileDinhKem": "https://example.com/minh-chung.pdf"
}
```
→ Nhận `requestId: 10`, trạng thái: `Cho duyet`
→ Hệ thống tự động tạo 3 dòng PheDuyet (cấp 1, 2, 3)

---

#### **Bước 3: Giáo vụ đăng nhập**
```
POST /api/auth/login
Body: {
  "email": "giaovu@tvu.edu.vn",
  "password": "giaovu123"
}
```
→ Nhận `token_giaovu`

---

#### **Bước 4: Giáo vụ xem danh sách đơn chờ duyệt**
```
GET /api/applications?trangThai=Cho duyet
Headers: Authorization: Bearer token_giaovu
```
→ Thấy đơn của sinh viên (requestId: 10)

---

#### **Bước 5: Giáo vụ xem chi tiết đơn**
```
GET /api/applications/10
Headers: Authorization: Bearer token_giaovu
```
→ Xem đầy đủ thông tin: tiêu đề, mô tả, file đính kèm, số tiền

---

#### **Bước 6A: Giáo vụ DUYỆT cấp 1**
```
PUT /api/applications/10/staff-approve
Headers: Authorization: Bearer token_giaovu
Body: {
  "ghiChu": "Đơn hợp lệ, chuyển lên cấp 2"
}
```
→ Trạng thái: `Cho duyet` → `Dang xu ly`
→ PheDuyet cấp 1: `ket_qua = 'Da duyet'`, `nguoi_duyet_id = 3`
→ Đơn chuyển sang cấp 2, chờ cấp 2 duyệt tiếp

---

#### **Bước 6B: HOẶC Giáo vụ TỪ CHỐI**
```
PUT /api/applications/10/reject
Headers: Authorization: Bearer token_giaovu
Body: {
  "lyDoTuChoi": "Hồ sơ không đầy đủ, thiếu giấy xác nhận thu nhập gia đình",
  "ghiChu": "Sinh viên cần bổ sung thêm giấy tờ"
}
```
→ Trạng thái: `Cho duyet` → `Tu choi`
→ PheDuyet cấp 1: `ket_qua = 'Tu choi'`, `ly_do_tu_choi = ...`
→ Đơn kết thúc, không tiếp tục duyệt

---

#### **Bước 7: Sinh viên xem lại đơn**
```
GET /api/applications/10
Headers: Authorization: Bearer token_sinh_vien
```
→ Thấy trạng thái: `Dang xu ly` (nếu duyệt) hoặc `Tu choi` (nếu từ chối)
→ Thấy người duyệt, ngày duyệt, lý do từ chối (nếu có)

---

#### **Bước 8: Admin duyệt cấp 2** ✅ (Mới implement)
```
PUT /api/applications/10/admin-approve
Headers: Authorization: Bearer token_admin
Body: {
  "ghiChu": "Đơn hợp lệ, chuyển lên Kế toán duyệt cấp 3"
}
```
→ PheDuyet cấp 2: `ket_qua = 'Da duyet'`, `nguoi_duyet_id = 1`
→ Trạng thái vẫn: `Dang xu ly`
→ Đơn chuyển sang cấp 3, xuất hiện trên màn hình Kế toán

---

#### **Bước 9: Kế toán duyệt cấp 3 và giải ngân** ✅ (Mới implement)
```
POST /api/applications/10/disburse
Headers: Authorization: Bearer token_ketoan
Body: {
  "ghiChu": "Đơn hợp lệ, giải ngân cho sinh viên"
}
```
→ PheDuyet cấp 3: `ket_qua = 'Da duyet'`, `nguoi_duyet_id = 2`
→ Kiểm tra số dư quỹ:
   - **Đủ tiền:** 
     * Trừ tiền quỹ
     * Tạo giao dịch CHI
     * trang_thai: `'Dang xu ly'` → `'Da giai ngan'`
   - **Thiếu tiền:**
     * trang_thai: `'Dang xu ly'` → `'Cho giai ngan'`
     * Chờ quỹ có tiền để giải ngân

---

#### **Bước 10: Giải ngân các đơn chờ (Chưa implement)**
```
POST /api/applications/disburse-pending
Headers: Authorization: Bearer token_admin
```
→ Giải ngân theo thứ tự ngày tạo cũ nhất
→ Tạo giao dịch CHI + trừ tiền quỹ
→ Cập nhật: `Cho giai ngan` → `Da giai ngan`

---

### ✅ **8.7. Admin duyệt cấp 2**

**Endpoint:** `PUT /api/applications/:id/admin-approve`

**Quyền:** Chỉ Admin (role_id = 1)

**Ví dụ:** `PUT /api/applications/10/admin-approve`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json
```

---

#### **📋 MÔ TẢ LUỒNG HOẠT ĐỘNG - ADMIN DUYỆT CẤP 2:**

```
┌─────────────────────────────────────────────────────────────────┐
│  LUỒNG PHÊ DUYỆT 3 CẤP - CẤP 2 (ADMIN)                         │
└─────────────────────────────────────────────────────────────────┘

ĐIỀU KIỆN ĐẦU VÀO:
┌─────────────────────────────────────────────────────────────────┐
│ ✓ Đơn đã được Giáo vụ duyệt cấp 1                               │
│ ✓ Trạng thái đơn: 'Dang xu ly'                                  │
│ ✓ PheDuyet cấp 1: ket_qua = 'Da duyet'                          │
│ ✓ PheDuyet cấp 2: ket_qua = 'Cho duyet' (đang chờ)              │
└─────────────────────────────────────────────────────────────────┘
                        ↓
1. Admin đăng nhập → Lấy token
                        ↓
2. Gửi request PUT /api/applications/:id/admin-approve
   - Có thể truyền ghi chú (ghiChu) - TÙY CHỌN
                        ↓
3. Hệ thống validate:
   ✓ Kiểm tra đơn tồn tại
   ✓ Kiểm tra trạng thái = 'Dang xu ly' (đã qua cấp 1)
   ✓ Kiểm tra cấp 1 đã duyệt (PheDuyet cấp 1 = 'Da duyet')
   ✓ Kiểm tra cấp độ duyệt hiện tại phải là cấp 2
                        ↓
4. Xử lý duyệt cấp 2:
   ┌─────────────────────────────────────────────────────────┐
   │ 1. Cập nhật PheDuyet cấp 2:                             │
   │    - ket_qua = 'Da duyet'                               │
   │    - nguoi_duyet_id = Admin hiện tại                    │
   │    - ngay_duyet = thời gian hiện tại                    │
   │    - ghi_chu = ghi chú (nếu có)                         │
   │                                                         │
   │ 2. YeuCauHoTro VẪN GIỮ:                                 │
   │    - trang_thai = 'Dang xu ly'                          │
   │    (Chỉ thay đổi khi duyệt cấp 3)                       │
   │                                                         │
   │ 3. Commit transaction                                   │
   └─────────────────────────────────────────────────────────┘
                        ↓
5. Trả về kết quả cho Admin
                        ↓
6. Đơn xuất hiện trên màn hình Kế toán để duyệt cấp 3
```

---

#### **Body (Tùy chọn):**
```json
{
  "ghiChu": "Đơn hợp lệ, chuyển lên Kế toán duyệt cấp 3"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Duyệt đơn xin hỗ trợ cấp 2 thành công",
  "data": {
    "requestId": 10,
    "tieuDe": "Xin hỗ trợ học phí học kỳ 1 năm 2026",
    "soTienYeuCau": 5000000,
    "capDuyet": 2,
    "trangThai": "Dang xu ly",
    "nguoiDuyet": {
      "id": 1,
      "hoTen": "Nguyễn Văn Admin",
      "email": "admin@tvu.edu.vn",
      "vaiTro": "Admin"
    },
    "ngayDuyet": "2026-05-01T11:00:00.000Z",
    "thongBao": "Đơn đã được Admin duyệt cấp 2. Đơn bây giờ xuất hiện trên màn hình Kế toán để duyệt cấp 3."
  }
}
```

---

#### **❌ CÁC TRƯỜNG HỢP LỖI - ADMIN DUYỆT CẤP 2**

**Lỗi 1: ID đơn không hợp lệ**
```json
{
  "success": false,
  "message": "ID đơn không hợp lệ"
}
```

**Lỗi 2: Đơn không tồn tại**
```json
{
  "success": false,
  "message": "Không tìm thấy đơn xin hỗ trợ"
}
```

**Lỗi 3: Đơn không phải trạng thái "Dang xu ly"**
```json
{
  "success": false,
  "message": "Không thể duyệt đơn ở trạng thái \"Cho duyet\". Admin chỉ duyệt được đơn ở trạng thái \"Dang xu ly\" (đã qua cấp 1)."
}
```

**Lỗi 4: Cấp 1 chưa duyệt**
```json
{
  "success": false,
  "message": "Cấp 1 chưa duyệt. Admin chỉ duyệt được sau khi Giáo vụ duyệt cấp 1."
}
```

**Lỗi 5: Đơn không phải cấp 2**
```json
{
  "success": false,
  "message": "Đơn này đang ở cấp 3. Admin chỉ duyệt được cấp 2."
}
```

**Lỗi 6: Không tìm thấy thông tin phê duyệt**
```json
{
  "success": false,
  "message": "Không tìm thấy thông tin phê duyệt hoặc đơn đã được duyệt hết"
}
```

**Lỗi 7: Role không phải Admin**
```json
{
  "success": false,
  "message": "Bạn không có quyền truy cập"
}
```

---

### ✅ **8.8. Kế toán duyệt cấp 3 và giải ngân**

**Endpoint:** `POST /api/applications/:id/disburse`

**Quyền:** Chỉ Kế toán (role_id = 2)

**Ví dụ:** `POST /api/applications/10/disburse`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json
```

---

#### **📋 MÔ TẢ LUỒNG HOẠT ĐỘNG - KẾ TOÁN DUYỆT CẤP 3 & GIẢI NGÂN:**

```
┌─────────────────────────────────────────────────────────────────┐
│  LUỒNG PHÊ DUYỆT 3 CẤP - CẤP 3 (KẾ TOÁN) & GIẢI NGÂN          │
└─────────────────────────────────────────────────────────────────┘

ĐIỀU KIỆN ĐẦU VÀO:
┌─────────────────────────────────────────────────────────────────┐
│ ✓ Đơn đã được Giáo vụ duyệt cấp 1                               │
│ ✓ Đơn đã được Admin duyệt cấp 2                                 │
│ ✓ Trạng thái đơn: 'Dang xu ly'                                  │
│ ✓ PheDuyet cấp 1: ket_qua = 'Da duyet'                          │
│ ✓ PheDuyet cấp 2: ket_qua = 'Da duyet'                          │
│ ✓ PheDuyet cấp 3: ket_qua = 'Cho duyet' (đang chờ)              │
└─────────────────────────────────────────────────────────────────┘
                        ↓
1. Kế toán đăng nhập → Lấy token
                        ↓
2. Gửi request POST /api/applications/:id/disburse
   - Có thể truyền ghi chú (ghiChu) - TÙY CHỌN
                        ↓
3. Hệ thống validate:
   ✓ Kiểm tra đơn tồn tại
   ✓ Kiểm tra trạng thái = 'Dang xu ly' (đã qua cấp 1 và 2)
   ✓ Kiểm tra cấp 1 đã duyệt (PheDuyet cấp 1 = 'Da duyet')
   ✓ Kiểm tra cấp 2 đã duyệt (PheDuyet cấp 2 = 'Da duyet')
   ✓ Kiểm tra cấp độ duyệt hiện tại phải là cấp 3
                        ↓
4. Lấy thông tin quỹ và số tiền yêu cầu
   - Số dư quỹ hiện tại
   - Số tiền sinh viên yêu cầu
                        ↓
5. Kiểm tra số dư quỹ và xử lý:

   ┌─────────────────────────────────────────────────────────┐
   │ TRƯỜNG HỢP A: QUỸ ĐỦ TIỀN (so_du >= so_tien_yeu_cau)   │
   ├─────────────────────────────────────────────────────────┤
   │ BEGIN TRANSACTION;                                      │
   │                                                         │
   │ A1. Trừ tiền quỹ:                                       │
   │     UPDATE Quy                                          │
   │     SET so_du = so_du - so_tien_yeu_cau                 │
   │     WHERE quy_id = ?                                    │
   │                                                         │
   │ A2. Tạo giao dịch CHI:                                  │
   │     INSERT INTO GiaoDich (                              │
   │       quy_id, request_id, nguoi_tao_id,                 │
   │       loai = 'Chi',                                     │
   │       so_tien = so_tien_yeu_cau,                        │
   │       trang_thai = 'Thanh cong'                         │
   │     )                                                   │
   │                                                         │
   │ A3. Cập nhật PheDuyet cấp 3:                            │
   │     ket_qua = 'Da duyet'                                │
   │     nguoi_duyet_id = Kế toán                            │
   │     ngay_duyet = NOW()                                  │
   │                                                         │
   │ A4. Cập nhật YeuCauHoTro:                               │
   │     trang_thai = 'Da giai ngan'                         │
   │                                                         │
   │ COMMIT TRANSACTION;                                     │
   │                                                         │
   │ Kết quả: Đơn hoàn tất, tiền đã chuyển cho sinh viên    │
   └─────────────────────────────────────────────────────────┘

   ┌─────────────────────────────────────────────────────────┐
   │ TRƯỜNG HỢP B: QUỸ THIẾU TIỀN (so_du < so_tien_yeu_cau) │
   ├─────────────────────────────────────────────────────────┤
   │ BEGIN TRANSACTION;                                      │
   │                                                         │
   │ B1. KHÔNG trừ tiền quỹ                                  │
   │ B2. KHÔNG tạo giao dịch                                 │
   │                                                         │
   │ B3. Cập nhật PheDuyet cấp 3:                            │
   │     ket_qua = 'Da duyet'                                │
   │     nguoi_duyet_id = Kế toán                            │
   │     ngay_duyet = NOW()                                  │
   │                                                         │
   │ B4. Cập nhật YeuCauHoTro:                               │
   │     trang_thai = 'Cho giai ngan'                        │
   │                                                         │
   │ COMMIT TRANSACTION;                                     │
   │                                                         │
   │ Kết quả: Đơn chờ giải ngân khi quỹ có đủ tiền          │
   └─────────────────────────────────────────────────────────┘

                        ↓
6. Trả về kết quả cho Kế toán
```

---

#### **Body (Tùy chọn):**
```json
{
  "ghiChu": "Đơn hợp lệ, giải ngân cho sinh viên"
}
```

---

#### **Response (200) - TRƯỜNG HỢP A: ĐỦ TIỀN GIẢI NGÂN:**
```json
{
  "success": true,
  "message": "Duyệt đơn xin hỗ trợ cấp 3 và giải ngân thành công",
  "data": {
    "requestId": 10,
    "tieuDe": "Xin hỗ trợ học phí học kỳ 1 năm 2026",
    "soTienYeuCau": 5000000,
    "capDuyet": 3,
    "trangThaiCu": "Dang xu ly",
    "trangThaiMoi": "Da giai ngan",
    "isDisbursed": true,
    "quy": {
      "id": 1,
      "tenQuy": "Quỹ Học Bổng 2024",
      "soDuCu": 30000000,
      "soDuMoi": 25000000
    },
    "giaoDich": {
      "transactionId": 25,
      "loai": "Chi",
      "soTien": 5000000,
      "trangThai": "Thanh cong"
    },
    "nguoiDuyet": {
      "id": 2,
      "hoTen": "Trần Thị Kế Toán",
      "email": "ketoan@tvu.edu.vn",
      "vaiTro": "Ke toan"
    },
    "ngayDuyet": "2026-05-01T12:00:00.000Z",
    "thongBao": "Đơn đã được duyệt đủ 3 cấp và giải ngân thành công. Giao dịch CHI đã được tạo và số dư quỹ đã được cập nhật."
  }
}
```

---

#### **Response (200) - TRƯỜNG HỢP B: THIẾU TIỀN, CHỜ GIẢI NGÂN:**
```json
{
  "success": true,
  "message": "Duyệt đơn xin hỗ trợ cấp 3 thành công. Đơn chờ giải ngân khi quỹ có đủ tiền.",
  "data": {
    "requestId": 10,
    "tieuDe": "Xin hỗ trợ học phí học kỳ 1 năm 2026",
    "soTienYeuCau": 5000000,
    "capDuyet": 3,
    "trangThaiCu": "Dang xu ly",
    "trangThaiMoi": "Cho giai ngan",
    "isDisbursed": false,
    "quy": {
      "id": 1,
      "tenQuy": "Quỹ Học Bổng 2024",
      "soDuCu": 3000000,
      "soDuMoi": 3000000
    },
    "giaoDich": null,
    "nguoiDuyet": {
      "id": 2,
      "hoTen": "Trần Thị Kế Toán",
      "email": "ketoan@tvu.edu.vn",
      "vaiTro": "Ke toan"
    },
    "ngayDuyet": "2026-05-01T12:00:00.000Z",
    "thongBao": "Đơn đã được duyệt đủ 3 cấp nhưng quỹ thiếu 2,000,000 VNĐ. Đơn sẽ được giải ngân tự động khi quỹ có đủ tiền."
  }
}
```

---

#### **❌ CÁC TRƯỜNG HỢP LỖI - KẾ TOÁN DUYỆT CẤP 3**

**Lỗi 1: ID đơn không hợp lệ**
```json
{
  "success": false,
  "message": "ID đơn không hợp lệ"
}
```

**Lỗi 2: Đơn không tồn tại**
```json
{
  "success": false,
  "message": "Không tìm thấy đơn xin hỗ trợ"
}
```

**Lỗi 3: Đơn không phải trạng thái "Dang xu ly"**
```json
{
  "success": false,
  "message": "Không thể duyệt đơn ở trạng thái \"Cho duyet\". Kế toán chỉ duyệt được đơn ở trạng thái \"Dang xu ly\" (đã qua cấp 1 và 2)."
}
```

**Lỗi 4: Cấp 1 chưa duyệt**
```json
{
  "success": false,
  "message": "Cấp 1 chưa duyệt. Kế toán chỉ duyệt được sau khi Giáo vụ duyệt cấp 1."
}
```

**Lỗi 5: Cấp 2 chưa duyệt**
```json
{
  "success": false,
  "message": "Cấp 2 chưa duyệt. Kế toán chỉ duyệt được sau khi Admin duyệt cấp 2."
}
```

**Lỗi 6: Đơn không phải cấp 3**
```json
{
  "success": false,
  "message": "Đơn này đang ở cấp 1. Kế toán chỉ duyệt được cấp 3."
}
```

**Lỗi 7: Không tìm thấy quỹ**
```json
{
  "success": false,
  "message": "Không tìm thấy quỹ"
}
```

**Lỗi 8: Role không phải Kế toán**
```json
{
  "success": false,
  "message": "Bạn không có quyền truy cập"
}
```

---

### 🔄 **8.9. Admin/Giáo vụ chuyển trạng thái đơn (API CŨ - ĐÃ XÓA)**

**Lưu ý:** API `PUT /api/applications/:id/status` đã bị xóa và thay thế bằng:
- `PUT /api/applications/:id/staff-approve` - Giáo vụ duyệt cấp 1
- `PUT /api/applications/:id/reject` - Từ chối đơn (bất kỳ cấp nào)
- Các API duyệt cấp 2, 3 sẽ được implement sau

---

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
- [ ] Admin/Giáo vụ từ chối đơn (bất kỳ cấp nào) → API /reject
- [ ] Test từ chối không có lý do → 400
- [ ] Test từ chối đơn đã giải ngân → 400
- [ ] Test từ chối đơn đã bị từ chối → 400
- [ ] Giáo vụ duyệt cấp 1 → API /staff-approve
- [ ] Test Giáo vụ duyệt cấp 1 thành công → Chuyển sang "Dang xu ly"
- [ ] Test Giáo vụ duyệt đơn không phải cấp 1 → 400
- [ ] Test Giáo vụ duyệt đơn không phải trạng thái "Cho duyet" → 400
- [ ] Test role khác (Admin, Sinh viên) duyệt cấp 1 → 403
- [ ] Admin duyệt cấp 2 → API /admin-approve
- [ ] Test Admin duyệt cấp 2 thành công → Vẫn "Dang xu ly", chuyển sang cấp 3
- [ ] Test Admin duyệt đơn chưa qua cấp 1 → 400
- [ ] Test Admin duyệt đơn không phải cấp 2 → 400
- [ ] Test Admin duyệt đơn không phải trạng thái "Dang xu ly" → 400
- [ ] Test role khác (Giáo vụ, Sinh viên) duyệt cấp 2 → 403
- [ ] Kế toán duyệt cấp 3 và giải ngân → API /disburse
- [ ] Test Kế toán duyệt cấp 3 - Quỹ đủ tiền → "Da giai ngan" + Tạo giao dịch CHI
- [ ] Test Kế toán duyệt cấp 3 - Quỹ thiếu tiền → "Cho giai ngan" + Không tạo giao dịch
- [ ] Test Kế toán duyệt đơn chưa qua cấp 1 hoặc cấp 2 → 400
- [ ] Test Kế toán duyệt đơn không phải cấp 3 → 400
- [ ] Test role khác (Admin, Sinh viên) duyệt cấp 3 → 403

---

## 📝 GHI CHÚ

### **Các trạng thái**

**Khoản tài trợ:**
- `Cho duyet` - Chờ duyệt
- `Da nhan` - Đã nhận
- `Tu choi` - Từ chối

**Đơn xin hỗ trợ:**
- `Cho duyet` - Chờ duyệt (mới tạo, chưa ai duyệt)
- `Dang xu ly` - Đang xử lý (đã duyệt cấp 1 hoặc cấp 2, chưa duyệt hết 3 cấp)
- `Cho giai ngan` - Chờ giải ngân (đã duyệt đủ 3 cấp nhưng quỹ thiếu tiền)
- `Da giai ngan` - Đã giải ngân (đã duyệt đủ 3 cấp và đã chuyển tiền)
- `Tu choi` - Từ chối (bị từ chối tại bất kỳ cấp nào)

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
