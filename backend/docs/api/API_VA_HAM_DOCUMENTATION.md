# TÀI LIỆU TỔNG HỢP BACKEND - TVU FUND MANAGEMENT

> Ngày tạo: 16/05/2026  
> Tổng số API: **31**  
> Tổng số hàm Controller: **27**  
> Tổng số hàm Model: **36**  
> Tổng số hàm Middleware: **4**  
> Tổng số hàm Utility: **3**

---

## I. TỔNG QUAN CẤU TRÚC THƯ MỤC

```
backend/
├── config/
│   └── db.js                    # Cấu hình kết nối MySQL
├── controllers/                 # Xử lý logic nghiệp vụ
│   ├── authController.js
│   ├── userController.js
│   ├── roleController.js
│   ├── donorController.js
│   ├── donationController.js
│   ├── transactionController.js
│   ├── fundController.js
│   ├── applicationController.js
│   └── statisticsController.js
├── models/                      # Tương tác với database
│   ├── NguoiDungModel.js
│   ├── UserModel.js
│   ├── RoleModel.js
│   ├── DonorModel.js
│   ├── DonationModel.js
│   ├── TransactionModel.js
│   ├── FundModel.js
│   ├── ApplicationModel.js
│   └── PheDuyetModel.js
├── routes/                      # Định nghĩa API endpoints
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── roleRoutes.js
│   ├── donorRoutes.js
│   ├── donationRoutes.js
│   ├── transactionRoutes.js
│   ├── fundRoutes.js
│   ├── applicationRoutes.js
│   └── statisticsRoutes.js
├── middleware/                   # Middleware xác thực và phân quyền
│   ├── authMiddleware.js
│   └── rolesMiddleware.js
├── utils/                       # Tiện ích
│   ├── hashPassword.js
│   ├── seedUser.js
│   ├── checkDatabaseSchema.js
│   ├── checkNguoiDungSchema.js
│   └── exportDatabaseSchema.js
├── server.js                    # File khởi động server
└── package.json
```

---

## II. DANH SÁCH API ENDPOINTS (31 API)

### 1. AUTH ROUTES - Xác thực người dùng (5 API)
**Base URL:** `/api/auth`  
**Route file:** `backend/routes/authRoutes.js`

| # | Method | Endpoint | Công dụng | Quyền truy cập |
|---|--------|----------|-----------|----------------|
| 1 | POST | `/api/auth/login` | Đăng nhập hệ thống, trả về access token và refresh token | Không cần token |
| 2 | POST | `/api/auth/refresh-token` | Làm mới access token khi hết hạn, sử dụng refresh token | Không cần access token |
| 3 | GET | `/api/auth/me` | Lấy thông tin người dùng hiện tại từ token | Cần access token |
| 4 | PUT | `/api/auth/update-password` | Đổi mật khẩu (cần nhập mật khẩu cũ và mật khẩu mới) | Cần access token |
| 5 | POST | `/api/auth/logout` | Đăng xuất (client tự xóa token) | Cần access token |

---

### 2. USER ROUTES - Quản lý người dùng (4 API)
**Base URL:** `/api/users`  
**Route file:** `backend/routes/userRoutes.js`

| # | Method | Endpoint | Công dụng | Quyền truy cập |
|---|--------|----------|-----------|----------------|
| 6 | GET | `/api/users` | Lấy danh sách tất cả người dùng trong hệ thống | Admin (1), Giáo vụ (3) |
| 7 | GET | `/api/users/:id` | Lấy thông tin chi tiết 1 người dùng theo ID | Admin (1), Giáo vụ (3) |
| 8 | POST | `/api/users` | Tạo người dùng mới trong hệ thống | Admin (1), Giáo vụ (3) |
| 9 | PUT | `/api/users/:id/status` | Cập nhật trạng thái người dùng (kích hoạt/khóa) | Admin (1) |

---

### 3. ROLE ROUTES - Quản lý vai trò (4 API)
**Base URL:** `/api/roles`  
**Route file:** `backend/routes/roleRoutes.js`

| # | Method | Endpoint | Công dụng | Quyền truy cập |
|---|--------|----------|-----------|----------------|
| 10 | GET | `/api/roles` | Lấy danh sách tất cả vai trò trong hệ thống | Admin (1), Giáo vụ (3) |
| 11 | GET | `/api/roles/:id` | Lấy thông tin chi tiết 1 vai trò theo ID | Admin (1), Giáo vụ (3) |
| 12 | GET | `/api/roles/:id/users` | Lấy danh sách người dùng thuộc vai trò cụ thể | Admin (1), Giáo vụ (3) |
| 13 | PATCH | `/api/roles/:id` | Cập nhật thông tin vai trò (partial update) | Admin (1) |

---

### 4. FUND ROUTES - Quản lý quỹ (2 API)
**Base URL:** `/api/funds`  
**Route file:** `backend/routes/fundRoutes.js`

| # | Method | Endpoint | Công dụng | Quyền truy cập |
|---|--------|----------|-----------|----------------|
| 14 | GET | `/api/funds` | Lấy danh sách tất cả quỹ trong hệ thống | Admin (1), Giáo vụ (3) |
| 15 | POST | `/api/funds` | Tạo quỹ mới trong hệ thống | Admin (1), Giáo vụ (3) |

---

### 5. DONOR ROUTES - Nhà tài trợ (1 API)
**Base URL:** `/api/donors`  
**Route file:** `backend/routes/donorRoutes.js`

| # | Method | Endpoint | Công dụng | Quyền truy cập |
|---|--------|----------|-----------|----------------|
| 16 | GET | `/api/donors/wall` | Lấy danh sách nhà tài trợ cho DonorWall (phân tier Platinum/Gold) | Không cần token |

---

### 6. DONATION ROUTES - Khoản tài trợ (3 API)
**Base URL:** `/api/donations`  
**Route file:** `backend/routes/donationRoutes.js`

| # | Method | Endpoint | Công dụng | Quyền truy cập |
|---|--------|----------|-----------|----------------|
| 17 | POST | `/api/donations/public` | Quyên góp công khai (không cần đăng nhập, tự động tạo nhà tài trợ nếu email chưa tồn tại) | Không cần token |
| 18 | PUT | `/api/donations/:id/approve` | Duyệt khoản tài trợ (cập nhật trạng thái, cộng tiền vào quỹ, tạo giao dịch Thu) | Admin (1), Kế toán (2) |
| 19 | PUT | `/api/donations/:id/reject` | Từ chối khoản tài trợ (cập nhật trạng thái, không cộng tiền, không tạo giao dịch) | Admin (1), Kế toán (2) |

---

### 7. TRANSACTION ROUTES - Lịch sử dòng tiền (2 API)
**Base URL:** `/api/transactions`  
**Route file:** `backend/routes/transactionRoutes.js`

| # | Method | Endpoint | Công dụng | Quyền truy cập |
|---|--------|----------|-----------|----------------|
| 20 | GET | `/api/transactions` | Lấy danh sách tất cả giao dịch thu/chi (hỗ trợ filter, phân trang) | Admin (1), Kế toán (2) |
| 21 | GET | `/api/transactions/:id` | Xem chi tiết 1 giao dịch cụ thể | Admin (1), Kế toán (2) |

---

### 8. STATISTICS ROUTES - Thống kê (2 API)
**Base URL:** `/api/statistics`  
**Route file:** `backend/routes/statisticsRoutes.js`

| # | Method | Endpoint | Công dụng | Quyền truy cập |
|---|--------|----------|-----------|----------------|
| 22 | GET | `/api/statistics/public` | Lấy thống kê tổng quan cho Landing Page (số yêu cầu đã hỗ trợ, tổng tiền quỹ, số nhà tài trợ, số quỹ hoạt động) | Không cần token |
| 23 | GET | `/api/statistics/fund-breakdown` | Lấy phân bổ ngân sách theo loại quỹ (GROUP BY loai_quy, tính phần trăm) | Không cần token |

---

### 9. APPLICATION ROUTES - Đơn xin hỗ trợ (8 API)
**Base URL:** `/api/applications`  
**Route file:** `backend/routes/applicationRoutes.js`

| # | Method | Endpoint | Công dụng | Quyền truy cập |
|---|--------|----------|-----------|----------------|
| 24 | POST | `/api/applications` | Sinh viên nộp đơn xin hỗ trợ từ quỹ | Kế toán (2), Giáo vụ (3), Sinh viên (4) |
| 25 | GET | `/api/applications/my` | Sinh viên xem danh sách đơn đã nộp | Sinh viên (4) |
| 26 | GET | `/api/applications` | Admin/Giáo vụ xem tất cả đơn xin hỗ trợ (hỗ trợ filter, phân trang) | Admin (1), Giáo vụ (3) |
| 27 | GET | `/api/applications/:id` | Xem chi tiết 1 đơn (sinh viên chỉ xem được đơn của mình) | Admin (1), Giáo vụ (3), Sinh viên (4) |
| 28 | PUT | `/api/applications/:id/reject` | Từ chối đơn xin hỗ trợ tại bất kỳ cấp nào (bắt buộc có lý do) | Admin (1), Giáo vụ (3) |
| 29 | PUT | `/api/applications/:id/staff-approve` | Giáo vụ duyệt đơn cấp 1 (Chờ duyệt → Đang xử lý) | Giáo vụ (3) |
| 30 | PUT | `/api/applications/:id/admin-approve` | Admin duyệt đơn cấp 2 (vẫn giữ trạng thái Đang xử lý) | Admin (1) |
| 31 | POST | `/api/applications/:id/disburse` | Kế toán duyệt cấp 3 & giải ngân (trừ tiền quỹ, tạo giao dịch Chi) | Kế toán (2) |

---

## III. DANH SÁCH HÀM CONTROLLER (27 hàm)

### 1. authController.js (6 hàm)
**File:** `backend/controllers/authController.js`

| # | Tên hàm | Công dụng | Dòng |
|---|---------|-----------|------|
| 1 | `generateTokens(payload)` | (Helper) Tạo cặp access token và refresh token từ payload | 7 |
| 2 | `login(req, res)` | Xử lý đăng nhập: validate, kiểm tra mật khẩu, trả về cặp token | 23 |
| 3 | `getMe(req, res)` | Lấy thông tin người dùng hiện tại từ token | 95 |
| 4 | `refreshToken(req, res)` | Làm mới access token bằng refresh token, kiểm tra user còn tồn tại/khóa | 135 |
| 5 | `updatePassword(req, res)` | Đổi mật khẩu: validate, xác thực mật khẩu cũ, hash mật khẩu mới, cập nhật DB | 203 |
| 6 | `logout(req, res)` | Đăng xuất (JWT stateless, client tự xóa token) | 284 |

---

### 2. userController.js (4 hàm)
**File:** `backend/controllers/userController.js`

| # | Tên hàm | Công dụng | Dòng |
|---|---------|-----------|------|
| 7 | `createUser(req, res)` | Tạo người dùng mới: validate dữ liệu, hash mật khẩu, kiểm tra email trùng, tạo user | 8 |
| 8 | `getUsers(req, res)` | Lấy danh sách tất cả người dùng (JOIN với bảng vai trò) | 137 |
| 9 | `getUserById(req, res)` | Lấy thông tin chi tiết 1 người dùng theo ID (JOIN với bảng vai trò) | 175 |
| 10 | `updateUserStatus(req, res)` | Cập nhật trạng thái người dùng (HOAT_DONG/KHOA), không cho tự khóa tài khoản của mình | 232 |

---

### 3. roleController.js (4 hàm)
**File:** `backend/controllers/roleController.js`

| # | Tên hàm | Công dụng | Dòng |
|---|---------|-----------|------|
| 11 | `getRoles(req, res)` | Lấy danh sách tất cả vai trò trong hệ thống | 6 |
| 12 | `getRoleById(req, res)` | Lấy thông tin chi tiết 1 vai trò theo ID | 32 |
| 13 | `updateRole(req, res)` | Cập nhật vai trò (partial update: tên, mô tả, trạng thái) | 77 |
| 14 | `getUsersByRole(req, res)` | Lấy danh sách người dùng thuộc vai trò cụ thể | 165 |

---

### 4. donorController.js (1 hàm)
**File:** `backend/controllers/donorController.js`

| # | Tên hàm | Công dụng | Dòng |
|---|---------|-----------|------|
| 15 | `getDonorWall(req, res)` | Lấy danh sách nhà tài trợ cho DonorWallSection, phân tier Platinum (≥50 triệu) và Gold (<50 triệu) | 12 |

---

### 5. donationController.js (3 hàm)
**File:** `backend/controllers/donationController.js`

| # | Tên hàm | Công dụng | Dòng |
|---|---------|-----------|------|
| 16 | `createPublicDonation(req, res)` | Xử lý quyên góp công khai: validate, kiểm tra quỹ, tạo donation qua transaction, trả về thông tin ngân hàng | 36 |
| 17 | `approveDonation(req, res)` | Duyệt khoản tài trợ: kiểm tra trạng thái, gọi Model để cập nhật trạng thái, cộng tiền quỹ, tạo giao dịch Thu | 196 |
| 18 | `rejectDonation(req, res)` | Từ chối khoản tài trợ: kiểm tra trạng thái, cập nhật trạng thái Từ chối, không cộng tiền, không tạo giao dịch | 318 |

---

### 6. transactionController.js (2 hàm)
**File:** `backend/controllers/transactionController.js`

| # | Tên hàm | Công dụng | Dòng |
|---|---------|-----------|------|
| 19 | `getAllTransactions(req, res)` | Lấy danh sách giao dịch với filter (loại, quỹ, trạng thái, khoảng thời gian) và phân trang | 41 |
| 20 | `getTransactionById(req, res)` | Xem chi tiết 1 giao dịch cụ thể theo ID | 166 |

---

### 7. fundController.js (2 hàm)
**File:** `backend/controllers/fundController.js`

| # | Tên hàm | Công dụng | Dòng |
|---|---------|-----------|------|
| 21 | `createFund(req, res)` | Tạo quỹ mới: validate (tên, loại, số dư, trạng thái), kiểm tra tên trùng, tạo quỹ trong DB | 6 |
| 22 | `getFunds(req, res)` | Lấy danh sách tất cả quỹ trong hệ thống | 119 |

---

### 8. statisticsController.js (2 hàm)
**File:** `backend/controllers/statisticsController.js`

| # | Tên hàm | Công dụng | Dòng |
|---|---------|-----------|------|
| 23 | `getPublicStats(req, res)` | Lấy 4 số liệu thống kê cho Landing Page: số yêu cầu đã hỗ trợ, tổng tiền quỹ, số nhà tài trợ, số quỹ hoạt động | 12 |
| 24 | `getFundBreakdown(req, res)` | Lấy phân bổ ngân sách theo loại quỹ (GROUP BY loai_quy), tính phần trăm cho từng loại | 81 |

---

### 9. applicationController.js (8 hàm)
**File:** `backend/controllers/applicationController.js`

| # | Tên hàm | Công dụng | Dòng |
|---|---------|-----------|------|
| 25 | `createApplication(req, res)` | Sinh viên nộp đơn xin hỗ trợ: validate dữ liệu, kiểm tra quỹ, tạo đơn, tạo 3 dòng phê duyệt | 24 |
| 26 | `getMyApplications(req, res)` | Sinh viên xem danh sách đơn đã nộp (hỗ trợ phân trang) | 193 |
| 27 | `getApplicationById(req, res)` | Xem chi tiết 1 đơn (sinh viên chỉ xem được đơn của mình, admin/giáo vụ xem tất cả) | 240 |
| 28 | `getAllApplications(req, res)` | Admin/Giáo vụ xem tất cả đơn với filter (trạng thái, quỹ, user) và phân trang | 317 |
| 29 | `rejectApplication(req, res)` | Từ chối đơn: sử dụng transaction, cập nhật PheDuyệt cấp hiện tại, cập nhật trạng thái đơn | 396 |
| 30 | `staffApprove(req, res)` | Giáo vụ duyệt cấp 1: sử dụng transaction, kiểm tra trạng thái Chờ duyệt, cập nhật PheDuyệt cấp 1, đổi trạng thái Đang xử lý | 579 |
| 31 | `adminApprove(req, res)` | Admin duyệt cấp 2: sử dụng transaction, kiểm tra cấp 1 đã duyệt, cập nhật PheDuyệt cấp 2, vẫn giữ trạng thái Đang xử lý | 727 |
| 32 | `disburseApplication(req, res)` | Kế toán duyệt cấp 3 & giải ngân: sử dụng transaction, kiểm tra cấp 1+2 đã duyệt, nếu đủ tiền thì trừ quỹ+ tạo giao dịch Chi, nếu thiếu thì chờ giải ngân | 898 |

---

## IV. DANH SÁCH HÀM MODEL (36 hàm)

### 1. NguoiDungModel.js (4 hàm)
**File:** `backend/models/NguoiDungModel.js`

| # | Tên hàm | Công dụng | Dòng |
|---|---------|-----------|------|
| 1 | `getUserForLogin(email)` | Tìm người dùng theo email để đăng nhập (lấy cả mật khẩu để so sánh) | 9 |
| 2 | `getUserForProfile(userId)` | Lấy thông tin người dùng theo user_id (không lấy mật khẩu) | 22 |
| 3 | `getUserPassword(userId)` | Lấy mật khẩu hiện tại để verify old password khi đổi mật khẩu | 35 |
| 4 | `updatePassword(userId, hashedPassword)` | Cập nhật mật khẩu người dùng trong DB | 44 |

---

### 2. UserModel.js (6 hàm)
**File:** `backend/models/UserModel.js`

| # | Tên hàm | Công dụng | Dòng |
|---|---------|-----------|------|
| 5 | `checkEmailExists(email)` | Kiểm tra email đã tồn tại trong bảng nguoidung chưa | 4 |
| 6 | `createUser(userData)` | Tạo người dùng mới trong bảng nguoidung | 13 |
| 7 | `getUserById(userId)` | Lấy thông tin user theo ID (sau khi tạo) | 43 |
| 8 | `getUserByIdWithRole(userId)` | Lấy thông tin chi tiết user theo ID (JOIN với bảng vaitro) | 56 |
| 9 | `getAllUsers()` | Lấy danh sách tất cả người dùng (JOIN với bảng vaitro) | 83 |
| 10 | `updateUserStatus(userId, trangThai)` | Cập nhật trạng thái người dùng | 107 |

---

### 3. RoleModel.js (4 hàm)
**File:** `backend/models/RoleModel.js`

| # | Tên hàm | Công dụng | Dòng |
|---|---------|-----------|------|
| 11 | `getAllRoles()` | Lấy danh sách tất cả vai trò | 4 |
| 12 | `getRoleById(roleId)` | Lấy thông tin chi tiết 1 vai trò theo ID | 14 |
| 13 | `updateRole(roleId, data)` | Cập nhật vai trò (dynamic query, chỉ update các field được gửi) | 26 |
| 14 | `getUsersByRoleId(roleId)` | Lấy danh sách người dùng theo vai trò | 63 |

---

### 4. DonorModel.js (4 hàm)
**File:** `backend/models/DonorModel.js`

| # | Tên hàm | Công dụng | Dòng |
|---|---------|-----------|------|
| 15 | `checkUserIdExists(userId)` | Kiểm tra user_id đã tồn tại trong bảng NhaTaiTro chưa | 13 |
| 16 | `createDonor(donorData)` | Tạo nhà tài trợ mới trong bảng NhaTaiTro (cho API Admin) | 32 |
| 17 | `getDonorById(nhaTaiTroId)` | Lấy thông tin chi tiết nhà tài trợ theo ID (JOIN với nguoidung) | 59 |
| 18 | `getAllDonors()` | Lấy danh sách tất cả nhà tài trợ (JOIN với nguoidung) | 85 |

---

### 5. DonationModel.js (4 hàm)
**File:** `backend/models/DonationModel.js`

| # | Tên hàm | Công dụng | Dòng |
|---|---------|-----------|------|
| 19 | `createPublicDonation(donationData)` | Tạo donation public với DATABASE TRANSACTION: kiểm tra email, tạo/dùng lại nhà tài trợ, tạo khoản tài trợ trạng thái Chờ duyệt | 28 |
| 20 | `getDonationById(khoanTaiTroId)` | Lấy thông tin chi tiết khoản tài trợ theo ID (JOIN với NhaTaiTro và Quy) | 145 |
| 21 | `approveDonation(khoanTaiTroId, nguoiDuyetId)` | Duyệt khoản tài trợ với TRANSACTION: cập nhật trạng thái, cộng tiền quỹ, tạo giao dịch Thu | 194 |
| 22 | `rejectDonation(khoanTaiTroId, lyDoTuChoi)` | Từ chối khoản tài trợ: cập nhật trạng thái Từ chối (không dùng transaction, không cộng tiền) | 315 |

---

### 6. TransactionModel.js (6 hàm)
**File:** `backend/models/TransactionModel.js`

| # | Tên hàm | Công dụng | Dòng |
|---|---------|-----------|------|
| 23 | `createTransaction(transactionData, connection)` | Tạo giao dịch mới trong bảng GiaoDich (hỗ trợ truyền connection cho transaction) | 11 |
| 24 | `getTransactionById(transactionId)` | Lấy thông tin giao dịch theo ID (JOIN với Quy) | 60 |
| 25 | `getTransactionsByFund(quyId, limit, offset)` | Lấy danh sách giao dịch theo quỹ (hỗ trợ phân trang) | 90 |
| 26 | `getTransactionsByDonation(khoanTaiTroId)` | Lấy giao dịch theo khoản tài trợ | 118 |
| 27 | `getAllTransactions(filters, limit, offset)` | Lấy tất cả giao dịch với filters (loại, quỹ, trạng thái, khoảng thời gian) và phân trang, JOIN với nhiều bảng | 146 |
| 28 | `getTransactionByIdDetailed(transactionId)` | Lấy chi tiết 1 giao dịch với đầy đủ thông tin (JOIN 6 bảng) | 290 |

---

### 7. FundModel.js (4 hàm)
**File:** `backend/models/FundModel.js`

| # | Tên hàm | Công dụng | Dòng |
|---|---------|-----------|------|
| 29 | `checkFundNameExists(tenQuy)` | Kiểm tra tên quỹ đã tồn tại chưa | 4 |
| 30 | `createFund(fundData)` | Tạo quỹ mới trong bảng Quy | 13 |
| 31 | `getFundById(quyId)` | Lấy thông tin quỹ theo ID | 43 |
| 32 | `getAllFunds()` | Lấy danh sách tất cả quỹ | 63 |

---

### 8. ApplicationModel.js (6 hàm)
**File:** `backend/models/ApplicationModel.js`

| # | Tên hàm | Công dụng | Dòng |
|---|---------|-----------|------|
| 33 | `createApplication(applicationData)` | Tạo đơn xin hỗ trợ mới với trạng thái Chờ duyệt | 11 |
| 34 | `getApplicationById(requestId)` | Lấy thông tin chi tiết 1 đơn (JOIN với NguoiDung và Quy) | 56 |
| 35 | `getApplicationsByUser(userId, limit, offset)` | Lấy danh sách đơn của 1 sinh viên (hỗ trợ phân trang) | 90 |
| 36 | `getAllApplications(filters, limit, offset)` | Lấy tất cả đơn với filters (trạng thái, quỹ, user) và phân trang | 115 |
| 37 | `updateApplicationStatus(requestId, trangThai, connection)` | Cập nhật trạng thái đơn (hỗ trợ truyền connection cho transaction) | 189 |
| 38 | `updateTuChoi(requestId, lyDoTuChoi, connection)` | Cập nhật trạng thái Từ chối và lưu lý do từ chối | 207 |

---

### 9. PheDuyetModel.js (6 hàm)
**File:** `backend/models/PheDuyetModel.js`

| # | Tên hàm | Công dụng | Dòng |
|---|---------|-----------|------|
| 39 | `createPheDuyet(requestId, connection)` | Tạo 3 dòng phê duyệt (cấp 1, 2, 3) khi tạo đơn mới, trạng thái Chờ duyệt | 11 |
| 40 | `getPheDuyetByRequestId(requestId)` | Lấy danh sách phê duyệt của 1 đơn (JOIN với NguoiDung và VaiTro) | 38 |
| 41 | `updatePheDuyet(requestId, capDoDuyet, nguoiDuyetId, ketQua, ghiChu, lyDoTuChoi, connection)` | Cập nhật kết quả phê duyệt của 1 cấp (duyệt/từ chối) | 69 |
| 42 | `getCapDoDuyetHienTai(requestId)` | Lấy cấp độ duyệt hiện tại (cấp đang chờ duyệt, sắp xếp ASC) | 91 |
| 43 | `kiemTraDaDuyetDuCap(requestId)` | Kiểm tra đã duyệt đủ 3 cấp chưa | 108 |
| 44 | `kiemTraCoCapNaoBiTuChoi(requestId)` | Kiểm tra có cấp nào bị từ chối không | 123 |

---

## V. DANH SÁCH HÀM MIDDLEWARE (4 hàm)

### 1. authMiddleware.js (2 hàm)
**File:** `backend/middleware/authMiddleware.js`

| # | Tên hàm | Công dụng | Dòng |
|---|---------|-----------|------|
| 1 | `protect(req, res, next)` | Kiểm tra JWT token trong header Authorization, giải mã và gán thông tin user vào req.user | 4 |
| 2 | `requireRole(...roles)` | Kiểm tra vai trò của người dùng có nằm trong danh sách được phép không | 40 |

---

### 2. rolesMiddleware.js (2 hàm)
**File:** `backend/middleware/rolesMiddleware.js`

| # | Tên hàm | Công dụng | Dòng |
|---|---------|-----------|------|
| 3 | `authorizeRoles(...allowedRoleIds)` | Kiểm tra role_id của user có nằm trong danh sách được phép không | 3 |
| 4 | `isAdmin(id)` | Kiểm tra user có phải Admin không (so sánh với id truyền vào, mặc định = 1) | 34 |

---

## VI. DANH SÁCH HÀM UTILITY (3 hàm)

### 1. hashPassword.js (1 hàm)
**File:** `backend/utils/hashPassword.js`

| # | Tên hàm | Công dụng | Dòng |
|---|---------|-----------|------|
| 1 | `hashPassword(password)` | Hash mật khẩu bằng bcrypt (script đơn giản để test) | 4 |

---

### 2. seedUser.js (1 hàm)
**File:** `backend/utils/seedUser.js`

| # | Tên hàm | Công dụng | Dòng |
|---|---------|-----------|------|
| 2 | `migratePasswords()` | Chuyển đổi tất cả mật khẩu chưa hash sang hash bcrypt (migration script) | 7 |

---

### 3. db.js (1 hàm)
**File:** `backend/config/db.js`

| # | Tên hàm | Công dụng | Dòng |
|---|---------|-----------|------|
| 3 | `testConnection()` | Kiểm tra kết nối MySQL khi server khởi động | 21 |

---

## VII. BẢNG PHÂN QUYỀN HỆ THỐNG

| Role ID | Tên vai trò | Mô tả |
|---------|-------------|-------|
| 1 | Admin | Quản trị hệ thống, duyệt đơn cấp 2, quản lý người dùng |
| 2 | Kế toán | Duyệt khoản tài trợ, duyệt đơn cấp 3 & giải ngân, xem giao dịch |
| 3 | Giáo vụ | Quản lý người dùng, quỹ, duyệt đơn cấp 1 |
| 4 | Sinh viên | Nộp đơn xin hỗ trợ, xem đơn của mình |

---

## VIII. LUỒNG DUYỆT ĐƠN XIN HỖ TRỢ (3 CẤP)

```
Sinh viên nộp đơn (Chờ duyệt)
        │
        ▼
Giáo vụ duyệt cấp 1 (Chờ duyệt → Đang xử lý)
        │
        ▼
Admin duyệt cấp 2 (Đang xử lý → Đang xử lý)
        │
        ▼
Kế toán duyệt cấp 3 & giải ngân
        │
        ├── Đủ tiền: Đang xử lý → Đã giải ngân (trừ quỹ, tạo giao dịch Chi)
        │
        └── Thiếu tiền: Đang xử lý → Chờ giải ngân
```

---

## IX. LUỒNG QUYÊN GÓP CÔNG KHAI

```
Người dùng quyên góp (không cần đăng nhập)
        │
        ▼
Validate dữ liệu (tên, email, SĐT, số tiền, quỹ)
        │
        ▼
Kiểm tra quỹ tồn tại và đang hoạt động
        │
        ▼
BEGIN TRANSACTION
  ├── Kiểm tra email trong NhaTaiTro
  │     ├── Đã tồn tại → Dùng lại nhà tài trợ cũ
  │     └── Chưa tồn tại → Tạo nhà tài trợ mới
  └── Tạo khoản tài trợ (trạng thái: Chờ duyệt)
COMMIT
        │
        ▼
Trả về thông tin donation + thông tin ngân hàng
```

---

## X. CÁC TRẠNG THÁI CHÍNH

### Trạng thái đơn xin hỗ trợ (YeuCauHoTro)
- `Cho duyet` - Vừa nộp, chờ Giáo vụ duyệt
- `Dang xu ly` - Đã qua cấp 1, đang chờ Admin duyệt
- `Tu choi` - Bị từ chối tại bất kỳ cấp nào
- `Cho giai ngan` - Đã duyệt đủ 3 cấp nhưng quỹ thiếu tiền
- `Da giai ngan` - Đã duyệt đủ 3 cấp và đã giải ngân

### Trạng thái khoản tài trợ (KhoanTaiTro)
- `Cho duyet` - Chờ Kế toán/Admin xác nhận đã nhận tiền
- `Da nhan` - Đã duyệt, tiền đã cộng vào quỹ
- `Tu choi` - Bị từ chối

### Trạng thái giao dịch (GiaoDich)
- `Cho xu ly` - Giao dịch mới tạo
- `Thanh cong` - Giao dịch hoàn thành
- `That bai` - Giao dịch thất bại
- `Hoan tien` - Giao dịch hoàn tiền

### Trạng thái quỹ (Quy)
- `Dang hoat dong` - Đang nhận đóng góp và đơn xin hỗ trợ
- `Tam dung` - Tạm dừng hoạt động
- `Da dong` - Đã đóng quỹ

### Trạng thái người dùng (NguoiDung)
- `HOAT_DONG` - Tài khoản bình thường
- `KHOA` - Tài khoản bị khóa
