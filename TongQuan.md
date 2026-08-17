# TỔNG QUAN HỆ THỐNG QUẢN LÝ QUỸ PHÁT TRIỂN TRƯỜNG ĐẠI HỌC TRÀ VINH

---

## 1. GIỚI THIỆU CHUNG

Hệ thống Quản lý Quỹ Phát triển Đại học Trà Vinh (TVU Fund Management) là một ứng dụng web toàn diện được thiết kế để quản lý hoạt động tài chính của quỹ phát triển trường Đại học Trà Vinh. Hệ thống ra đời nhằm mục tiêu hiện đại hóa quy trình quản lý quỹ, giúp minh bạch hóa các khoản thu-chi, đảm bảo tính pháp lý theo Điều lệ quỹ phát triển, đồng thời tạo cơ chế giám sát độc lập thông qua Ban Kiểm soát.

**Lĩnh vực hoạt động:** Quản lý tài chính — Giáo dục Đại học — Từ thiện học bổng

**Đối tượng sử dụng:**
- Quản trị viên hệ thống (Admin) — toàn quyền quản lý
- Kế toán — quản lý giải ngân, đối soát giao dịch, báo cáo tài chính
- Cán bộ Quỹ — duyệt đơn cấp 1, quản lý quỹ và nhà tài trợ
- Sinh viên/Nhà tài trợ — nộp đơn đề nghị hỗ trợ, tài trợ quỹ
- Ban Kiểm soát — giám sát độc lập mọi hoạt động tài chính (xem-only)

**Phạm vi quản lý:**
- Quản lý các quỹ con: học bổng, y tế, môi trường, thi đua, phát triển, và nhiều loại quỹ khác
- Tiếp nhận và xử lý đơn đề nghị hỗ trợ sinh viên qua quy trình duyệt 3 cấp
- Quản lý nhà tài trợ, khoản tài trợ, và lịch sử đóng góp
- Giải ngân theo đợt, quyết toán, đối soát giao dịch
- Báo cáo tài chính theo năm tài chính theo đúng Điều 17.2 và Điều 18 của Điều lệ quỹ
- Quản lý vị trí tổ chức: Hội đồng Quỹ, Ban Điều hành, Ban Kiểm soát, Văn phòng thường trực

### 1.1 Vấn Đề Hệ Thống Giải Quyết

| Vấn Đề | Giải Pháp |
|--------|-----------|
| Quản lý quỹ thủ công, khó theo dõi số dư | Dashboard hiển thị số dư real-time, tính toán tự động |
| Quy trình phê duyệt không minh bạch | Luồng phê duyệt 3 cấp với lịch sử đầy đủ |
| Nhà tài trợ không biết tiền được sử dụng như thế nào | Trang công khai hiển thị thống kê, danh sách nhà tài trợ, chi tiết quỹ và sinh viên đã được hỗ trợ |
| Sinh viên không biết quỹ nào đang mở | Landing page và trang danh sách quỹ hiển thị các quỹ đang hoạt động |
| Tạo báo cáo mất nhiều thời gian | Xuất báo cáo tự động (Word, Excel) với template |
| Landing Page cần nội dung đúng, dễ quản trị | Admin/Cán bộ quản lý tin tức, sinh viên nổi bật, cảm nhận sinh viên và bảng vinh danh nhà tài trợ |
| Thông tin liên hệ/tài khoản nhận tài trợ thay đổi theo thực tế | Tab Cài đặt hệ thống cập nhật tên website, footer, email, hotline, địa chỉ và tài khoản ngân hàng mặc định |
| Cần truy vấn người tác động dữ liệu | Nhật ký hệ thống ghi hành động, đối tượng, dữ liệu cũ/mới, IP và thời gian |

---

## 2. CÔNG NGHỆ SỬ DỤNG

### 2.1 Tổng Quan Stack Công Nghệ

Dự án được xây dựng theo kiến trúc client-server tiêu chuẩn với 3 lớp (3-tier architecture):

| Lớp | Công Nghệ | Phiên Bản | Lý Do Lựa Chọn |
|-----|----------|----------|----------------|
| **Frontend** | React | 18.x | Thư viện UI phổ biến nhất, component-based, ecosystem lớn |
| **Build Tool** | Vite | 6.x | nhanh hơn Webpack 10-100x, HMR tức thì, ES modules native |
| **Routing** | React Router | 7.x | Standard routing cho React SPA, nested routes, lazy loading |
| **State Management** | Zustand | 5.x | Nhẹ (~1KB), API đơn giản, không cần boilerplate |
| **UI Library** | Ant Design | 5.x | Component phong phú, hỗ trợ tiếng Việt, responsive |
| **Form Management** | React Hook Form + Yup | 7.x / 1.x | Form validation hiệu suất cao, schema-based |
| **Server State** | @tanstack/react-query | 5.x | Cache, refetch, optimistic updates cho API calls |
| **Notifications** | react-toastify | 11.x | Toast notification nhẹ, tùy biến cao |
| **Sanitization** | DOMPurify | 3.x | Sanitize HTML content chống XSS |
| **Backend** | Node.js + Express | 18.x / 5.x | Non-blocking I/O, JavaScript đồng nhất full-stack, ecosystem npm lớn |
| **ORM/Query** | MySQL2 (promise) | 3.x | Native queries cho performance, hỗ trợ async/await |
| **Database** | MySQL | 8.x (InnoDB) | ACID compliance, relational integrity, phổ biến trong giáo dục |
| **Auth** | JWT (jsonwebtoken) | 9.x | Stateless, scalable, tiêu chuẩn REST API |
| **File Upload** | Multer | 2.x | Xử lý multipart/form-data, storage linh hoạt |
| **Report Export** | Docxtemplater + ExcelJS | — | Tạo báo cáo DOCX và XLSX từ template |
| **Charts** | Recharts | 3.x | Thư viện chart React declarative, nhẹ và tùy biến cao |

### 2.2 Chi Tiết Frontend

**Cấu trúc thư mục:**
```
frontend/src/
├── components/         # 26 nhóm component (common, layout)
│   ├── common/         # 26 component tái sử dụng
│   │   ├── ApplicationStatusStepper/   # Hiển thị tiến trình duyệt đơn
│   │   ├── Card/                       # FundCard, FeatureCard, StatCard
│   │   ├── ChucVuCard/                 # Card vị trí tổ chức
│   │   ├── DisbursementTimeline/       # Timeline giải ngân
│   │   ├── FundBankInfo/               # Thông tin tài khoản quỹ
│   │   ├── LoanType/                   # Panel mô tả & so sánh loại hình hỗ trợ
│   │   ├── StatusBadge/                # Badge trạng thái tùy chỉnh
│   │   ├── Table/                      # Bảng tùy chỉnh
│   │   ├── YearFilter/                 # Lọc theo năm tài chính
│   │   └── ...                         # Các component khác
│   └── layout/         # Header, Sidebar, Footer, Layouts
├── pages/              # Các trang theo vai trò
│   ├── Public/         # Trang công khai (LandingPage, FundsPage, DonorsPage...)
│   ├── Guest/          # Form khách (GuestApplicationForm, GuestDonationForm)
│   ├── Staff/          # Trang quản trị
│   │   ├── Admin/      # AdminDashboard, UserManagementPage...
│   │   ├── KeToan/     # KeToanDashboard, KeToanGiaiNganPage...
│   │   └── CanBo/      # CanBoDashboard, CanBoQuyListPage...
│   └── User/           # Trang người dùng (Dashboard, ProfilePage)
├── services/           # 25 service files (API calls)
├── context/            # AuthContext.jsx, NotificationContext.jsx
├── hooks/              # usePermission.js, useAuth.js (custom hooks)
├── constants/          # roles.js, applicationStatus.js, loaiHoTro.js, loaiHoTroInfo.js...
├── stores/             # Zustand stores (auth, navigation)
└── App.jsx             # Route configuration chính
```

**Đặc điểm kỹ thuật Frontend:**
- Lazy loading routes để giảm initial bundle size
- Code splitting theo vai trò (Admin/KeToan/CanBo/User)
- Component SCSS modules cho styling (không dùng CSS-in-JS để tránh runtime overhead)
- Zustand store duy nhất cho auth state, không cần Context Provider phức tạp
- Axios interceptor tự động refresh JWT token khi hết hạn
- CAPTCHA verification cho người dùng chưa đăng nhập

### 2.3 Chi Tiết Backend

**Cấu trúc thư mục:**
```
backend/
├── config/
│   ├── db.js                    # MySQL connection pool (connectionLimit: 10)
│   ├── system_settings.json     # Cài đặt hệ thống (tên trường, lãi suất tham chiếu...)
│   └── page_permissions.json    # Phân quyền trang theo vai trò (30 trang)
├── middleware/
│   ├── authMiddleware.js        # JWT verification + maintenance mode check
│   ├── rolesMiddleware.js       # Role-based access control (hardcoded IDs)
│   ├── auditLogMiddleware.js    # Auto-log mọi POST/PUT/PATCH/DELETE
│   └── rateLimiter.js           # In-memory IP-based rate limiting
├── models/                      # 21 model files
│   ├── auth/                    # UserModel.js, NguoiDungModel.js
│   ├── funds/                   # FundModel.js, BankAccountModel.js, PhanBoNganSachModel.js...
│   ├── donations/               # DonationModel.js, DonorModel.js
│   ├── applications/            # ApplicationModel.js, PheDuyetModel.js, NghiemThuModel.js...
│   ├── transactions/            # TransactionModel.js
│   ├── reports/                 # DuToanModel.js
│   ├── finance/                 # CongNoModel.js
│   ├── common/                  # ThongBaoModel.js
│   ├── system/                  # ChucVuModel.js
│   ├── news/                    # NewsModel.js
│   ├── showcase/                # StudentShowcaseModel.js
│   ├── testimonials/            # DanhGiaModel.js
│   └── guest/                   # GuestModel.js
├── controllers/                 # 24 controller files
├── routes/                      # 27 route files
├── services/                    # emailService.js, laiPhatService.js
├── server.js                    # Entry point, mount tất cả routes + cron jobs
└── uploads/                     # File storage (PDF, images)
```

**Đặc điểm kỹ thuật Backend:**
- ES Modules (`import`/`export`) throughout — không dùng CommonJS
- MySQL transactions cho các thao tác đa bảng (INSERT + UPDATE cùng lúc)
- Row-level locking (`SELECT ... FOR UPDATE`) cho các giao dịch tài chính quan trọng
- Audit logging tự động: mọi POST/PUT/PATCH/DELETE đều được ghi lại IP, user, old/new values
- Rate limiting theo IP cho các endpoint public (guest submissions)
- JWT refresh token rotation cho bảo mật session

### 2.4 Database

**Tên database:** `tvu_fund_management`
**Engine:** InnoDB (hỗ trợ transactions, foreign keys)
**Charset:** utf8mb4 (hỗ trợ tiếng Việt đầy đủ)
**Số lượng bảng:** 27 bảng
**Kết nối:** localhost:3306 (local) hoặc Aiven Cloud (production)

**27 Bảng Chính:**

| # | Bảng | Mô Tả |
|---|------|-------|
| 1 | `vaitro` | 5 vai trò: Admin, KeToan, CanBoQuy, SinhVien, BanKiemSoat |
| 2 | `donvihoc` | Đơn vị học: khoa, ngành, lớp |
| 3 | `taikhoannganhang` | Tài khoản ngân hàng (trường + cá nhân) |
| 4 | `nguoidung` | Trung tâm người dùng — hub cho mọi mối quan hệ |
| 5 | `loaiquy` | 9 loại quỹ: Phát triển, Học bổng, Nghiên cứu, Vay vốn, Khởi nghiệp, Phong trào, Xã hội, CSVC, Đào tạo |
| 6 | `quy` | Quỹ tài chính — self-referential (quỹ cha → quỹ con) |
| 7 | `nhataitro` | Nhà tài trợ: cá nhân, tổ chức, doanh nghiệp, đối tác |
| 8 | `khoantaitro` | Khoản tài trợ từ nhà tài trợ vào quỹ |
| 9 | `yeucauhotro` | Đơn đề nghị hỗ trợ — heart of business process |
| 10 | `pheduyet` | Lượt duyệt 3 cấp cho mỗi đơn |
| 11 | `giaodich` | Giao dịch Thu/Chi/Thu hồi nợ |
| 12 | `phanbongansach` | Phân bổ ngân sách nội bộ (quỹ cha → quỹ con) |
| 13 | `dotgiaingan` | Đợt giải ngân theo quỹ |
| 14 | `dutoanhangnam` | Ngân sách hoạt động hàng năm |
| 15 | `nghiemthu` | Nghiệm thu dự án (tiến độ + cuối cùng) |
| 16 | `dieukhoanthuhoi` | Điều khoản thu hồi (cho tài trợ có thu hồi) |
| 17 | `hopdongvayvon` | Hợp đồng vay vốn |
| 18 | `lichtrano` | Lịch trả nợ (cho vay) |
| 19 | `nhatkyhethong` | Nhật ký audit trail toàn hệ thống |
| 20 | `sinhviennoibat` | Sinh viên nổi bật |
| 21 | `tintuc` | Tin tức & sự kiện |
| 22 | `danhgia` | Cảm nhận sinh viên (đang corrupt) |
| 23 | `chucvuquy` | Vị trí tổ chức quỹ |
| 24 | `guest_tracking` | Tracking đơn khách (thay thế 2 bảng cũ, minimal info) |
| 25 | `thong_bao` | Thong bao trong he thong (bell notification) |
| 26 | `chitiet_dutoan` | Chi tiet khoan chi cua de xuat du toan |
| 27 | `dexuatchuongtrinh` | Đề xuất chương trình mới từ nhà tài trợ (3-cấp duyệt) |

---

## 3. KIẾN TRÚC HỆ THỐNG

### 3.1 Sơ Đồ Kiến Trúc

```
┌─────────────────────────────────────────────────────────┐
│                      FRONTEND (React)                    │
│  Vite + React Router v7 + Zustand + Ant Design          │
│  Cổng: 5173 (dev)                                       │
│  26 component groups, 25 services, 4 dashboards         │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTP/REST API (JSON)
                        │ JWT Bearer Token Auth
┌───────────────────────▼─────────────────────────────────┐
│                   BACKEND (Node.js/Express)              │
│  REST API + JWT Auth + MySQL2 + Multer + Docxtemplater  │
│  Cổng: 5001                                            │
│  28 route files, 24 controllers, 21 models              │
│  Auto audit logging + Rate limiting + Cron jobs         │
└───────────────────────┬─────────────────────────────────┘
                        │ MySQL2 Promise Pool
                        │ connectionLimit: 10
┌───────────────────────▼─────────────────────────────────┐
│               DATABASE (MySQL InnoDB)                    │
│  tvu_fund_management — 26 bảng, charset utf8mb4        │
│  Localhost:3306 hoặc Aiven Cloud                        │
│  ACID transactions, row-level locking                   │
└─────────────────────────────────────────────────────────┘
```

### 3.2 Cấu Trúc Route API

Hệ thống có 28 prefix route chính, mỗi prefix xử lý một nhóm nghiệp vụ:

| Prefix | Mô Tả | Số Endpoint |
|--------|-------|------------|
| `/api/auth` | Xác thực (đăng nhập, đăng ký, JWT) | 9 |
| `/api/users` | Quản lý người dùng | 9 |
| `/api/roles` | Quản lý vai trò | 4 |
| `/api/funds` | Quản lý quỹ | 8 |
| `/api/funds/allocate` | Phân bổ ngân sách | 6 |
| `/api/donations` | Quản lý khoản tài trợ | 10 |
| `/api/donors` | Quản lý nhà tài trợ | 7 |
| `/api/transactions` | Quản lý giao dịch | 12 |
| `/api/applications` | Quản lý đơn đề nghị | 10 |
| `/api/pheduyet` | Lịch sử phê duyệt | 4 |
| `/api/nghiem-thu` | Nghiệm thu | 6 |
| `/api/statistics` | Thống kê, báo cáo | 16 |
| `/api/bao-cao` | Xuất báo cáo DOCX/XLSX | 1 |
| `/api/disbursement-rounds` | Đợt giải ngân | 4 |
| `/api/du-toan` | Ngân sách hoạt động (2-cap duyet) | 6 |
| `/api/bank-accounts` | Tài khoản ngân hàng | 9 |
| `/api/upload` | Tải file lên | 8 |
| `/api/news` | Tin tức | 11 |
| `/api/student-showcase` | Sinh viên nổi bật | 7 |
| `/api/danhgia` | Cảm nhận sinh viên | 6 |
| `/api/chuc-vu` | Vị trí tổ chức | 7 |
| `/api/vaitro` | Danh sách vai trò | 2 |
| `/api/nguoidung` | Danh sách người dùng | 1 |
| `/api/nhat-ky` | Nhật ký hệ thống | 4 |
| `/api/system/settings` | Cài đặt hệ thống | 5 |
| `/api/thong-bao` | Thông báo trong hệ thống | 5 |
| `/api/guest` | Khách (chưa đăng nhập) | 5 |
| `/api/cong-no` | Công nợ (cho vay) | 9 |
| `/api/lich-tra-no` | Lịch trả nợ | 3 |
| `/api/thu-hoi` | Thu hồi vốn (tài trợ có thu hồi) | 8 |

---

## 4. HỆ THỐNG VAI TRÒ

### 4.1 5 Vai Trò

Hệ thống sử dụng 5 vai trò (role) với quyền hạn phân tầng rõ ràng:

| ID | Mã Vai Trò | Tên Hiển Thị | Mô Tả Chi Tiết |
|----|-----------|-------------|----------------|
| 1 | `admin` | Quản trị viên | Toàn quyền hệ thống. Duyệt cấp 2, quản lý người dùng, phân quyền, cài đặt hệ thống. Có thể tạo/sửa/xóa quỹ, phân bổ ngân sách, xác nhận tài trợ, quản lý nhân sự. |
| 2 | `ketoan` | Kế toán | Quản lý tài chính. Giải ngân (duyệt cấp 3), đối soát giao dịch, xuất báo cáo, xem thống kê. Có thể duyệt khoản tài trợ nhưng không quản lý người dùng. |
| 3 | `canboquy` | Cán bộ Quỹ | Duyệt cấp 1, tạo quỹ, quản lý nhà tài trợ, ghi nhận khoản tài trợ, tạo đợt giải ngân, nghiệm thu. Vai trò trung gian giữa Admin và người dùng thường. |
| 4 | `sinhvien` | Sinh viên/Nhà tài trợ | Nộp đơn đề nghị hỗ trợ, xem trạng thái đơn, tài trợ quỹ, xem lịch sử giao dịch cá nhân. Quyền hạn hạn chế — chỉ thao tác trên dữ liệu của mình. |
| 5 | `bankiemsoat` | Ban Kiểm soát | Giám sát độc lập theo Điều 8 Điều lệ. **Chỉ được phép đọc (GET)** trên mọi endpoint. Không có quyền tạo/sửa/xóa bất kỳ dữ liệu nào. Xem tất cả: quỹ, đơn, giao dịch, phê duyệt, thống kê, nhật ký. |

### 4.2 Nguyên Tắc Phân Quyền

- **Quyền đọc (GET):** Ban Kiểm soát được phép xem tất cả dữ liệu để giám sát
- **Quyền ghi (POST/PUT/DELETE):** Giới hạn cho Admin, Kế toán, Cán bộ Quỹ tùy endpoint
- **Phân quyền cứng (hardcoded):** Vai trò được hardcode trong `rolesMiddleware.js`, không phải dynamic từ DB
- **Frontend permission:** `usePermission.js` + `page_permissions.json` lọc menu và UI theo vai trò

---

## 5. QUY TRÌNH NGHIỆP VỤ CHI TIẾT

### 5.1 Quy Trình Đề Nghị Hỗ Trợ (3-Cấp Duyệt)

#### Mô Tả Tổng Quan

Đây là quy trình cốt lõi nhất của hệ thống. Khi một sinh viên cần được hỗ trợ tài chính (học bổng, trợ cấp, vay vốn), sinh viên sẽ nộp đơn đề nghị hỗ trợ vào một trong các quỹ có sẵn. Đơn đó sẽ đi qua quy trình duyệt 3 cấp để đảm bảo tính pháp lý và minh bạch:

1. **Cấp 1 — Cán bộ Quỹ:** Kiểm tra tính hợp lệ ban đầu, xác nhận sinh viên thuộc đối tượng được hỗ trợ
2. **Cấp 2 — Quản trị viên:** Duyệt mức độ phù hợp, kiểm tra điều kiện tài chính đặc biệt (đối với tài trợ có thu hồi)
3. **Cấp 3 — Kế toán:** Kiểm tra số dư quỹ, thực hiện giải ngân nếu đủ điều kiện

Quy trình này đảm bảo rằng mỗi đồng tiền hỗ trợ đều được kiểm soát chặt chẽ từ khi đề nghị đến khi giải ngân, tạo nên một chuỗi trách nhiệm rõ ràng.

#### Bước 1: Nộp Đơn Đề Nghị

**Cách 1 — Đã đăng nhập (Sinh viên):**

Sinh viên đăng nhập vào hệ thống, truy cập trang tạo đơn (`/apply`), điền đầy đủ thông tin:
- **Chọn quỹ:** Chọn quỹ đích từ danh sách các quỹ đang hoạt động (không thể chọn quỹ cha `Tap trung - Be chung`)
- **Tiêu đề đơn:** 10-200 ký tự, mô tả ngắn gọn mục đích
- **Mô tả chi tiết:** Tối thiểu 50 ký tự, giải thích rõ lý do cần hỗ trợ
- **Số tiền đề nghị:** Phải lớn hơn 0 và không vượt quá số tiền hỗ trợ tối đa của quỹ (`sotienhotrotoida`, nếu có cấu hình)
- **Loại hỗ trợ:** Chọn 1 trong 3 loại (xem Section 5.1.7)
- **File đính kèm:** Giấy tờ chứng minh (chấp nhận PDF, JPG, PNG)

Hệ thống sẽ kiểm tra tự động: quỹ tồn tại và đang hoạt động, số dư quỹ đủ để chi trả. Nếu hợp lệ, đơn sẽ được lưu vào hệ thống với trạng thái `Cho duyet cap 1`.

**Cách 2 — Khách (chưa đăng nhập):**

Đối với người chưa có tài khoản, hệ thống cung cấp quy trình OTP verification:
1. Khách điền thông tin qua form tại `/apply` (bao gồm: họ tên, email, tiêu đề, mô tả, số tiền, quỹ, loai ho tro)
2. Hệ thống lưu toàn bộ dữ liệu form vào JWT token (`otpToken`) và tạo minimal record trong bảng `guest_tracking` (chỉ lưu: uuid, tên, email, loại, quỹ, số tiền, OTP hash)
3. Khách nhập mã OTP nhận được qua email
4. Hệ thống tự động: (a) tạo tài khoản người dùng với mật khẩu tạm thời, (b) tạo đơn đề nghị chính thức (lấy toàn bộ dữ liệu từ `otpToken`), (c) cập nhật `guest_tracking.trangthai = 'DA_CHUYEN'`, (d) trả về UUID để theo dõi
5. Khách có thể theo dõi trạng thái đơn bằng UUID mà không cần đăng nhập

> **Lưu ý:** Dữ liệu form được lưu trong JWT token (stateless), không lưu đầy đủ vào database. `guest_tracking` chỉ lưu minimal info để track trạng thái. Nếu khách truy cập lại trên cùng 1 thiết bị, hệ thống tự detect `otpToken` từ localStorage.

#### Bước 2: Phân Đợt Giải Ngân

Ngay sau khi đơn được nộp, hệ thống tự động gán đơn vào đợt giải ngân (`dotgiaingan`) phù hợp dựa trên ngày nộp đơn. Nếu quỹ chưa có đợt giải ngân nào, hệ thống sẽ tự tạo đợt mặc định với `thutu=1`. Mỗi quỹ có thể có nhiều đợt giải ngân, mỗi đợt tương ứng với một khoảng thời gian cụ thể.

#### Bước 3: Duyệt Cấp 1 — Cán Bộ Quỹ

Cán bộ Quỹ (role 3) sẽ xem danh sách các đơn chờ duyệt tại trang `/can-bo/xet-duyet`. Tại đây, cán bộ có thể xem chi tiết đơn, kiểm tra tính hợp lệ của thông tin, và thực hiện một trong hai hành động:

- **Duyệt:** Cập nhật `pheduyet` cấp 1 thành `Da duyet`, chuyển trạng thái đơn sang `Cho duyet cap 2`
- **Từ chối:** Nhập lý do từ chối (tối thiểu 10 ký tự), cập nhật `pheduyet` cấp 1 thành `Tu choi`, trạng thái đơn sang `Tu choi cap 1`

Lưu ý: Cán bộ Quỹ chỉ có thể duyệt các đơn đang ở trạng thái `Cho duyet cap 1` và phải là người có `capduyet = 1` trong bản ghi `pheduyet`.

#### Bước 4: Duyệt Cấp 2 — Quản Trị Viên

Quản trị viên (role 1) xem danh sách đơn chờ duyệt tại `/admin/xet-duyet`. Tại bước này, nếu đơn thuộc loại **Tài trợ có thu hồi**, quản trị viên phải nhập thêm 3 thông tin bắt buộc:
- **Mức thu hồi:** Số tiền phải thu hồi (> 0), không vượt quá 30% tổng kinh phí dự án
- **Thời hạn hoàn trả:** Số tháng
- **Số quyết định hợp đồng:** Mã quyết định

> **Lưu ý:** Tài trợ thu hồi **không tính lãi** theo Điều lệ. Lãi suất chỉ áp dụng cho khoản vay (xem bước duyệt "Cho vay" ở trên).

Hệ thống tự động kiểm tra ràng buộc: mức thu hồi không được vượt quá **30% tổng kinh phí dự án**. Nếu hợp lệ, hệ thống sẽ tạo bản ghi `dieukhoanthuhoi` (1:1 với `yeucauhotro`).

Đối với các loại hỗ trợ khác (Tài trợ không hoàn lại, Cho vay), quản trị viên chỉ cần duyệt mà không cần nhập thêm thông tin.

#### Bước 5: Duyệt Cấp 3 và Giải Ngân

Kế toán (role 2) là người cuối cùng trong chuỗi duyệt. Tại trang `/ke-toan/giai-ngan`, kế toán sẽ thấy danh sách các đơn đã duyệt cấp 1 và 2, chờ giải ngân.

Khi kế toán nhấn "Giải ngân", hệ thống sẽ kiểm tra số dư quỹ:
- **Nếu đủ số dư:** Trừ tiền quỹ, tạo giao dịch `Chi` trong `giaodich`, trạng thái đơn chuyển sang `Da giai ngan`
- **Nếu thiếu số dư:** Trạng thái đơn chuyển sang `Cho giai ngan` — đơn sẽ được tự động giải ngân khi quỹ nhận được tiền (qua tài trợ hoặc phân bổ)

Đây là bước quan trọng nhất trong quy trình tài chính — mọi giao dịch giải ngân đều phải có đủ chứng từ và phê duyệt từ cả 3 cấp.

#### Bước 6: Nghiệm Thu (Đối Với Khoản Vay và Tài Trợ Có Thu Hồi)

Đối với các đơn thuộc loại "Cho vay" hoặc "Tài trợ có thu hồi", sau khi giải ngân cần thực hiện nghiệm thu để kiểm tra việc sử dụng vốn. **Khoản vay áp dụng cơ chế 2 giai đoạn giải ngân:**

**Flow 2 giai đoạn giải ngân (khoản vay):**

1. **Sau duyệt cấp 3:** Trạng thái chuyển sang `Cho giai ngan dot 1`
2. **Giải ngân đợt 1 (50%):** Kế toán giải ngân 50% số tiền vay → `Da giai ngan dot 1`. Lãi suất tính từ ngày giải ngân dot 1.
3. **Nghiệm thu đợt 1:** Cán bộ Quỹ tạo nghiệm thu, có tối đa 3 lần (tiến độ + cuối cùng). Cần **ít nhất 2/3 lần "Nghiệm thu cuối cùng" đạt** để chuyển sang giải ngân dot 2.
   - Nếu đạt → `Da nghiem thu dot 1` → `Cho giai ngan dot 2`
   - Nếu 3 lần nghiệm thu cuối cùng đều không đạt → `Nghiem thu khong dat` → `Dang thu hoi no` (tự động tạo điều khoản thu hồi)
4. **Giải ngân đợt 2 (50%):** Kế toán giải ngân 50% còn lại → `Da giai ngan dot 2`
5. **Nghiệm thu đợt 2:** Chỉ cần **1 lần "Nghiệm thu cuối cùng" đạt** → `Da nghiem thu` → `Hoan thanh`

> **Thu hồi vốn:** Khi nghiệm thu không đạt (3 lần cuối cùng đều không đạt), hệ thống tự động:
> - Chuyển trạng thái sang `Dang thu hoi no`
> - Tạo điều khoản thu hồi (`dieukhoanthuhoi`) với: số tiền thu hồi = số tiền đã giải ngân, thời hạn 3 tháng, lãi suất 0%
> - Gửi email thông báo cho sinh viên

> **Lãi suất:** Được tính từ ngày giải ngân dot 1 (ngày bắt đầu), không phải theo từng giai đoạn.

**Tài trợ có thu hồi:** Giải ngân 1 lần, nghiệm thu 1 lần (nếu `laidetac = 1` hoặc `loaihotro = 'Tai tro co thu hoi'`).

#### Flow Diagram

```
    Sinh viên/Khách nộp đơn
            │
            ▼
    ┌──────────────────┐
    │   Bước 1:         │
    │   Nộp đơn         │ → Kiểm tra quỹ, số dư, file đính kèm
    └────────┬─────────┘
             │
             ▼
    ┌──────────────────┐
    │   Bước 2:         │
    │   Phân đợt GN     │ → Tự động gán dotgiaingan
    └────────┬─────────┘
             │
             ▼
    ┌──────────────────┐
    │   Bước 3:         │
    │   Duyệt Cấp 1    │ ← Cán bộ Quỹ (role 3)
    │   Kiểm tra HL     │   Từ chối → "Tu choi cap 1"
    └────────┬─────────┘
             │ Duyệt
             ▼
    ┌──────────────────┐
    │   Bước 4:         │
    │   Duyệt Cấp 2    │ ← Quản trị viên (role 1)
    │   Kiểm tra TC     │   Nếu "Tai tro co thu hoi":
    │                   │   → Nhập mức LS, thời hạn
    │                   │   → Tạo dieukhoanthuhoi
    │                   │   Từ chối → "Tu choi cap 2"
    └────────┬─────────┘
             │ Duyệt
             ▼
    ┌──────────────────┐
    │   Bước 5:         │
    │   Duyệt Cấp 3    │ ← Kế toán (role 2)
    │   & Giải ngân     │   Đủ số dư → Trừ quỹ + tạo GD Chi
    │                   │   Thiếu → "Cho giai ngan"
    └────────┬─────────┘
             │
             ▼
    ┌──────────────────┐
    │   Bước 6:         │
    │   Nghiệm thu      │ ← Cán bộ Quỹ tạo (nếu yêu cầu)
    │   (nếu có)        │   Đạt / Đạt có điều chỉnh / Không đạt
    └──────────────────┘
```

#### Trạng Thái Đơn (StateMachine)

| Trạng Thái | Ý Nghĩa | Ai Thao Tác |
|------------|---------|------------|
| `Cho duyet cap 1` | Mới nộp, chờ Cán bộ Quỹ duyệt | — |
| `Da duyet cap 1` | Đã duyệt cấp 1, chờ chuyển cấp 2 | Cán bộ Quỹ |
| `Cho duyet cap 2` | Chờ Quản trị viên duyệt | — |
| `Da duyet cap 2` | Đã duyệt cấp 2, chờ chuyển cấp 3 | Quản trị viên |
| `Cho duyet cap 3` | Chờ Kế toán duyệt | — |
| `Da duyet cap 3` | Đã duyệt cấp 3, chờ giải ngân | Kế toán |
| `Cho giai ngan` | Đã duyệt, quỹ thiếu tiền, chờ bổ sung | Kế toán |
| `Cho giai ngan dot 1` | Chờ giải ngân đợt 1 (50%) — khoản vay | — |
| `Da giai ngan dot 1` | Đã giải ngân đợt 1, chờ nghiệm thu | Kế toán |
| `Cho nghiem thu dot 1` | Đã giải ngân dot 1, chờ nghiệm thu | — |
| `Da nghiem thu dot 1` | Đã nghiệm thu dot 1 đạt, chờ giải ngân dot 2 | Cán bộ Quỹ |
| `Cho giai ngan dot 2` | Chờ giải ngân đợt 2 (50%) — khoản vay | — |
| `Da giai ngan` | Đã giải ngân thành công (tài trợ) | Kế toán |
| `Cho nghiem thu` | Đã giải ngân, chờ nghiệm thu (tài trợ) | — |
| `Da nghiem thu` | Đã nghiệm thu, hoàn tất | Cán bộ Quỹ |
| `Hoan thanh` | Hoàn tất (đã nghiệm thu dot 2) | Kế toán |
| `Dang thu hoi no` | Đang thu hồi vốn (nghiem thu khong dat) | Hệ thống |
| `Tu choi cap 1/2/3` | Bị từ chối tại cấp N | Cấp N |
| `Nghiem thu khong dat` | Nghiệm thu không đạt (3 lần cuối cùng) | Cán bộ Quỹ |

#### 3 Loại Hình Hỗ Trợ

| Loại | Mã | Đặc Điểm | Nghiem Thu |
|------|-----|---------|------------|
| **Tài trợ không hoàn lại** | `Tai tro khong hoan lai` | Không cần thu hồi, giải ngân xong là hoàn tất. Phù hợp cho học bổng, trợ cấp khó khăn. | Chỉ cần nếu đơn là đề tài/dự án (cờ `laidetac = 1`) |
| **Tài trợ có thu hồi** | `Tai tro co thu hoi` | Cần tạo `dieukhoanthuhoi` với mức thu hồi (≤ 30% kinh phí), thời hạn hoàn trả. Không tính lãi theo Điều lệ. Phù hợp cho quỹ quay vòng. | Cần nghiệm thu sau giải ngân |
| **Cho vay** | `Cho vay` | Tạo `hopdongvayvon` + `lichtrano`, có lịch trả nợ cụ thể. | Luôn cần nghiệm thu sau giải ngân |

> **Quy tắc bật nghiệm thu (`canghiemthu`):**
> - Đơn là đề tài/dự án nghiên cứu (`laidetac = 1`) → **luôn** cần nghiệm thu, bất kể loại hình
> - `loaihotro = 'Cho vay'` → **luôn** cần nghiệm thu
> - Các trường hợp khác → không cần nghiệm thu

---

### 5.2 Quy Trình Tài Trợ (Donation)

#### Mô Tả Tổng Quan

Quy trình tài trợ là cơ chế để các nhà tài trợ (cá nhân, tổ chức, doanh nghiệp) đóng góp vào các quỹ của trường. Quy trình này đảm bảo rằng mọi khoản tài trợ đều được ghi nhận đầy đủ, xác minh nguồn gốc, và phân bổ đúng vào quỹ đích. Hệ thống hỗ trợ 3 cách tiếp nhận: tài trợ công khai (khách), tài trợ qua tài khoản đã đăng nhập, và cán bộ ghi nhận trực tiếp.

Khi một khoản tài trợ được duyệt, hệ thống sẽ tự động cộng tiền vào số dư quỹ và tạo giao dịch `Thu` trong sổ cái. Điều này đảm bảo rằng số dư quỹ luôn phản ánh đúng thực tế và mọi biến động đều có dấu vết.

#### Bước 1: Tiếp Nhận Khoản Tài Trợ

**Cách 1 — Khách công khai (chưa đăng nhập):**

Nhà tài trợ truy cập trang tài trợ công khai, điền thông tin: họ tên, email, số điện thoại, số tiền, chọn quỹ. Hệ thống sẽ:
1. Kiểm tra email trùng lặp trong `nguoidung`
2. Tạo hoặc liên kết bản ghi `nhataitro`
3. Tạo `khoantaitro` với trạng thái `Cho duyet`
4. Lưu thông tin chuyển khoản nếu có

**Cách 2 — Đã đăng nhập (role 4):**

Nhà tài trợ đã có tài khoản có thể tài trợ trực tiếp qua `/apply` với 3 hình thức thanh toán:
- **Chuyển khoản:** Hiển thị thông tin tài khoản ngân hàng trường
- **Trực tuyến (VNPay):** Tích hợp cổng thanh toán (chưa triển khai)
- **Tiền mặt:** Hiển thị địa chỉ văn phòng

**Cách 3 — Cán bộ ghi nhận:**

Cán bộ Quỹ hoặc Admin có thể ghi nhận khoản tài trợ từ nhà tài trợ đã có trong hệ thống hoặc tạo mới, qua `POST /api/donations`.

#### Bước 2: Duyệt Khoản Tài Trợ

Kế toán hoặc Admin sẽ xem danh sách khoản tài trợ chờ duyệt, kiểm tra tính hợp lệ của chứng từ (hình ảnh chuyển khoản), và duyệt. Khi duyệt:
- `khoantaitro.trangthai` chuyển sang `Da duyet`
- `quy.sodu` được cộng thêm số tiền tài trợ
- Một giao dịch `Thu` mới được tạo trong `giaodich`

#### Bước 3: Xác Nhận

Sau khi duyệt, Admin có thể thực hiện bước xác nhận cuối cùng (`confirm`), chuyển trạng thái sang `Da nhan`. Bước này xác nhận rằng khoản tài trợ đã thực sự đến tài khoản trường.

#### Flow Diagram

```
    Nhà tài trợ gửi khoản tài trợ
            │
            ▼
    ┌──────────────────┐
    │  "Cho duyet"     │ ← Chờ kế toán/admin duyệt
    └────────┬─────────┘
             │ Duyệt
             ▼
    ┌──────────────────┐
    │  "Da duyet"      │ → Cộng tiền quỹ + tạo GD Thu
    └────────┬─────────┘
             │ Xác nhận
             ▼
    ┌──────────────────┐
    │  "Da nhan"       │ → Hoàn tất
    └──────────────────┘
```

---

### 5.3 Quy Trình Trích Lập Ngân Sách (Budget Allocation)

#### Mô Tả Tổng Quan

Quy trình phân bổ ngân sách là cơ chế để chuyển tiền từ quỹ cha (quỹ tập trung - bê chung) sang các quỹ con (quỹ tập trung - mục chi). Đây là bước đầu tiên trong chuỗi cung cấp tài chính: tiền ban đầu nằm ở quỹ cha, sau đó được phân bổ xuống các quỹ con theo nhu cầu thực tế, và từ quỹ con mới giải ngân cho sinh viên.

Mỗi lần phân bổ đều cần có quyết định phê duyệt từ Admin để đảm bảo tính pháp lý. Hệ thống cũng hỗ trợ thu hồi phân bổ trong trường hợp cần điều chỉnh.

**Lưu ý quan trọng:** Chỉ quỹ con (`Tap trung - Muc chi`) mới nhận được phân bổ. Quỹ cha (`Tap trung - Be chung`) là nguồn tiền duy nhất.

#### Bước 1: Đề Xuất Phân Bổ

Cán bộ Quỹ tạo đề xuất phân bổ qua `POST /api/funds/allocate/request`, chỉ định:
- Quỹ nguồn (phải là `Tap trung - Be chung`)
- Quỹ đích (phải là `Tap trung - Muc chi` và là con của quỹ nguồn)
- Số tiền phân bổ
- Số quyết định

Hệ thống kiểm tra: quỹ nguồn tồn tại, số dư đủ, quỹ đích là con hợp lệ.

#### Bước 2: Duyệt Phân Bổ

Admin xem danh sách đề xuất chờ duyệt, kiểm tra tính hợp lệ, và duyệt qua `POST /api/funds/allocate/:id/approve`. Khi duyệt:
- `quy.sodu` quỹ nguồn bị trừ
- `quy.sodu` quỹ đích được cộng
- Trạng thái phân bổ chuyển sang `Da duyet`

#### Bước 3: Thu Hồi (Nếu Cần)

Nếu có sai sót hoặc cần điều chỉnh, Admin có thể thu hồi phân bổ đã duyệt:

**Luồng thu hồi (`POST /api/funds/allocate/:id/rollback`):**

1. Kiểm tra phân bổ tồn tại và trạng thái = `Da duyet`
2. **Row-level locking trong transaction:**
   - `SELECT ... FOR UPDATE` trên bản ghi phân bổ
   - `SELECT ... FOR UPDATE` trên quỹ đích (lock hàng)
   - `SELECT ... FOR UPDATE` trên quỹ nguồn (lock hàng)
3. Kiểm tra số dư quỹ đích **còn đủ** (tiền chưa bị giải ngân)
4. Thực hiện đảo giao dịch:
   - Trừ `quy.sodu` quỹ đích (lấy lại tiền)
   - Cộng `quy.sodu` quỹ nguồn (hoàn tiền)
5. Cập nhật trạng thái phân bổ → `Da thu hoi`
6. Commit transaction. Nếu lỗi → rollback toàn bộ

**Lỗi thường gặp:**
- `INSUFFICIENT_DESTINATION_FUND_BALANCE_FOR_ROLLBACK` (400) — tiền đã bị giải ngân, không thể thu hồi

**Tại sao dùng `FOR UPDATE`:** Tránh race condition khi 2 admin cùng thao tác trên cùng 1 quỹ — row-level locking đảm bảo chỉ 1 process có thể修改 số dư tại 1 thời điểm.

---

### 5.4 Quy Trình Giải Ngân Đợt (Disbursement Round)

#### Mô Tả Tổng Quan

Giải ngân đợt là cách tổ chức việc chi tiền theo từng giai đoạn. Mỗi quỹ có thể có nhiều đợt giải ngân, mỗi đợt tương ứng với một khoảng thời gian cụ thể. Khi tất cả các đợt của một quỹ đã hoàn thành, quỹ đó sẽ tự động chuyển sang trạng thái `Da dong`.

Cơ chế này giúp quản lý dòng tiền theo từng giai đoạn, tránh tình trạng giải ngân hết tiền quỹ trong một lần duy nhất.

#### Quản Lý Đợt Giải Ngân

- **Xem công khai:** Công khai trên trang chi tiết quỹ
- **Tự cập nhật trạng thái:** Khi xem danh sách đợt (đăng nhập), hệ thống tự động kiểm tra ngày và cập nhật trạng thái `chuatoi` → `dangchodutien` → `hoanthanh`
- **Hoàn thành đợt:** Khi nhấn "Hoàn thành", hệ thống kiểm tra số tiền đã chi, và nếu tất cả đợt đều hoàn thành → đóng quỹ

---

### 5.5 Quy Trình Xử Lý Khách (Guest Flow)

#### Mô Tả Tổng Quan

Quy trình khách là cơ chế đặc biệt cho phép người chưa có tài khoản trên hệ thống có thể nộp đơn đề nghị hỗ trợ hoặc tài trợ. Đây là tính năng quan trọng giúp mở rộng đối tượng tiếp cận quỹ — không chỉ sinh viên đang học mà còn cả cựu sinh viên, phụ huynh, hoặc các mạnh thường quân chưa quen với hệ thống.

Quy trình sử dụng phương pháp xác thực OTP (One-Time Password) qua email: sau khi khách điền form, hệ thống sẽ gửi mã 6 chữ số qua email, khách nhập mã để xác thực. Sau xác thực thành công, hệ thống tự động tạo tài khoản và chuyển dữ liệu sang các bảng chính thức.

> **Kiến trúc OTP Stateless:** Toàn bộ dữ liệu form được lưu trong JWT token (`otpToken`) — không lưu đầy đủ vào database. Bảng `guest_tracking` chỉ lưu minimal info (uuid, tên, email, loại, quỹ, số tiền, OTP hash) để track trạng thái. Điều này giúp tiết kiệm dung lượng database và tránh lưu dữ liệu nhạy cảm.

#### Bước 1: Gửi Form

Khách truy cập trang `/apply`, chọn "Tôi là Nhà tài trợ" hoặc "Tôi là Sinh viên", điền đầy đủ thông tin. Hệ thống:
1. Tạo JWT token (`otpToken`) chứa toàn bộ dữ liệu form (họ tên, email, tiêu đề, mô tả, số tiền, quỹ, loại hỗ trợ...)
2. Tạo record trong bảng `guest_tracking` với minimal info (uuid, tên, email, loai, quy_id, sotien, otp_hash)
3. Gửi email OTP 6 chữ số cho khách
4. Trả về `otpToken` + `trackingUuid` cho frontend (lưu vào localStorage)

#### Bước 2: Xác Thực OTP

Khách nhận mã OTP 6 chữ số qua email, nhập vào form xác thực. Hệ thống kiểm tra mã OTP, sau đó:
1. **Dual flow verification:**
   - **Token-based (ApplyPage):** Nếu frontend có `otpToken` → decode JWT để lấy dữ liệu form
   - **DB-based fallback (TrackPage):** Nếu không có token → query `guest_tracking` theo `tracking_uuid` + `otp_hash`
2. Tạo tài khoản người dùng mới (email = email khách, mật khẩu tạm thời)
3. Tạo bản ghi chính thức trong `nguoidung` + `yeucauhotro`/`khoantaitro` (dữ liệu từ JWT token)
4. Cập nhật `guest_tracking.trangthai = 'DA_CHUYEN'`, `nguoidung_id`, `doituong_id`
5. Trả về UUID + mật khẩu tạm thời cho khách

#### Bước 3: Theo Dõi Trạng Thái

Khách có thể theo dõi trạng thái đơn hoặc khoản tài trợ bằng cách truy cập `/track` và nhập UUID. Hệ thống trả về trạng thái hiện tại mà không yêu cầu đăng nhập.

#### Flow Diagram

```
    Khách điền form
        │
        ▼
    ┌──────────────────┐
    │  Lưu JWT Token   │ → otpToken (toàn bộ dữ liệu form)
    │  + guest_tracking │ → minimal info: uuid, tên, email, loai, quy, sotien
    └────────┬─────────┘
             │ Gửi OTP
             ▼
    ┌──────────────────┐
    │  Nhập mã OTP     │ ← 6 chữ số
    └────────┬─────────┘
             │ Xác thực (dual flow)
             ▼
    ┌──────────────────┐
    │  Tạo tài khoản   │ → UUID + mật khẩu tạm
    │  + Đơn/Khoản TT  │ → Dữ liệu từ JWT token
    └────────┬─────────┘
             │
             ▼
    ┌──────────────────┐
    │  Theo dõi UUID   │ → Tra cứu trạng thái
    └──────────────────┘
```

---

### 5.6 Quy Trình Đề Xuất Chương Trình (3-Cấp Duyệt)

#### Mô Tả Tổng Quan

Quy trình đề xuất chương trình là cơ chế để nhà tài trợ đề xuất tạo chương trình/hoạt động mới cho trường với nguồn tài trợ kèm theo. Đây là quy trình 3 cấp duyệt được thiết kế để đảm bảo kiểm soát chặt chẽ và minh bạch tài chính:

1. **Cấp 1 — Cán bộ (vaitro = 3):** Duyệt nội dung, kiểm tra tính khả thi, có thể sửa quỹ thành phần nếu nhà tài trợ chọn sai
2. **Cấp 2 — Kế toán (vaitro = 2):** Xác nhận đã nhận tiền thực tế, **cộng tiền vào Quỹ Thành Phần (Cấp 2)**
3. **Cấp 3 — Admin (vaitro = 1):** Duyệt tạo hoạt động, **tự động tạo Quỹ Cấp 3 và trích tiền từ Quỹ Thành Phần**

> **Lý do có 3 cấp**: Tiền phải vào Quỹ Thành Phần trước (step 2), sau đó mới trích ra tạo hoạt động (step 3). Điều này đảm bảo nguyên tắc kế toán rõ ràng: tiền tài trợ → quỹ chung → hoạt động cụ thể.

#### Luồng Tiền

```
Nhà Tài Trợ
    ↓ (Chuyển khoản)
💰 Tiền thực tế
    ↓ (Bước 2: Kế toán xác nhận)
🏦 Quỹ Thành Phần (Cấp 2)
    ↓ (Bước 3: Admin tạo hoạt động)
📋 Hoạt Động/Chương Trình (Quỹ Cấp 3)
```

#### Bước 1: Cán Bộ Duyệt Nội Dung

Cán bộ Quỹ xem danh sách đề xuất chờ duyệt tại `/can-bo/de-xuat`. Tại đây, cán bộ kiểm tra:
- Thông tin đề xuất hợp lệ
- Tính khả thi của chương trình
- **Quỹ thành phần phù hợp** — nếu nhà tài trợ chọn sai, cán bộ có thể sửa lại

**API**: `POST /api/donations/propose-program/:id/approve-by-canbo`

**Body**:
```json
{
  "ghiChu": "Đã xem xét, đề xuất hợp lệ",
  "quyThanhPhanId": 5  // Optional: Sửa quỹ nếu NTT chọn sai
}
```

**Database changes**:
```sql
UPDATE dexuatchuongtrinh 
SET trangthai = 'Can bo da duyet',
    canbo_duyet_id = ?,
    ngay_canbo_duyet = CURRENT_TIMESTAMP,
    ghi_chu_canbo = ?,
    quythanhphan_id = ?  -- Cập nhật nếu có sửa
WHERE dexuatchuongtrinh_id = ?;
```

**Từ chối**: `POST /api/donations/propose-program/:id/reject-by-canbo` (yêu cầu lý do từ chối)

#### Bước 2: Kế Toán Xác Nhận Tiền

Kế toán xem danh sách đề xuất đã duyệt cấp 1 tại `/ke-toan/de-xuat`. Sau khi xác nhận đã nhận tiền thực tế từ nhà tài trợ, kế toán thực hiện:

**API**: `POST /api/donations/propose-program/:id/confirm-money`

**Body**:
```json
{
  "soTienThucTe": 50000000  // Optional: Số tiền thực tế nếu khác đề xuất
}
```

**Database changes** (trong transaction):
```sql
-- 1. Cộng tiền vào Quỹ Thành Phần (Cấp 2)
UPDATE quy 
SET sodu = sodu + ?, 
    ngaycapnhat = CURRENT_TIMESTAMP 
WHERE quy_id = ?;

-- 2. Tạo giao dịch Thu (audit trail)
INSERT INTO giaodich (
  quy_id, loaigiaodich, sotien, ghichu, nguoithuchien_id, trangthai, ngaygiaodich
) VALUES (?, 'Thu', ?, ?, ?, 'Thanh cong', CURRENT_TIMESTAMP);

-- 3. Cập nhật đề xuất
UPDATE dexuatchuongtrinh 
SET trangthai = 'Da nhan tien',
    ketoan_xacnhan_id = ?,
    ngay_ketoan_xacnhan = CURRENT_TIMESTAMP,
    so_tien_thuc_te = ?
WHERE dexuatchuongtrinh_id = ?;
```

**Ví dụ**:
```
Trước: Quỹ Học Bổng (Cấp 2) = 100,000,000 đ
Sau:  Quỹ Học Bổng (Cấp 2) = 150,000,000 đ (+50tr)
```

#### Bước 3: Admin Tạo Hoạt Động

Admin xem danh sách đề xuất đã xác nhận tiền tại `/admin/de-xuat`. Admin kiểm tra ngân sách Quỹ Thành Phần và quyết định tạo hoạt động.

**API**: `POST /api/donations/propose-program/:id/create-activity`

**Body**:
```json
{
  "ghiChu": "Đã kiểm tra, tạo hoạt động"
}
```

**Database changes** (trong transaction):
```sql
-- 1. Tạo Quỹ Cấp 3 (Hoạt động/Chương trình)
INSERT INTO quy (
  tenquy, loaiquy_id, mota, sotienmuctieu, sotienhotrotoida, 
  soluonghotrotoida, ngaybatdau, ngayketthuc, sodu, nguoitao_id, 
  trangthai, loaidieuhanh, quy_cha_id, loaihotro, capdo
) VALUES (...);  -- sodu = 0 ban đầu

-- 2. Tạo bản ghi phân bổ ngân sách
INSERT INTO phanbongansach (
  quy_nguon_id, quy_dich_id, sotien, soquyetdinh, trangthai, 
  nguoi_de_xuat_id, nguoi_duyet_id, ngayduyet, ghichu, namtaichinh
) VALUES (?, ?, ?, ?, 'Da duyet', ?, ?, CURRENT_TIMESTAMP, ?, ?);

-- 3. Trừ tiền từ Quỹ Thành Phần (Cấp 2)
UPDATE quy 
SET sodu = sodu - ?, 
    ngaycapnhat = CURRENT_TIMESTAMP 
WHERE quy_id = ?;

-- 4. Cộng tiền vào Quỹ Hoạt Động (Cấp 3)
UPDATE quy 
SET sodu = sodu + ?, 
    ngaycapnhat = CURRENT_TIMESTAMP 
WHERE quy_id = ?;

-- 5. Cập nhật đề xuất
UPDATE dexuatchuongtrinh 
SET trangthai = 'Da tao hoat dong',
    admin_duyet_id = ?,
    ngay_admin_duyet = CURRENT_TIMESTAMP,
    ghi_chu_admin = ?,
    quyketqua_id = ?
WHERE dexuatchuongtrinh_id = ?;
```

**Kiểm tra ngân sách**: Hệ thống kiểm tra `quy.sodu` của Quỹ Thành Phần phải >= số tiền cần phân bổ. Nếu không đủ → trả lỗi `INSUFFICIENT_PARENT_FUND_BALANCE`.

**Ví dụ**:
```
Quỹ Học Bổng (Cấp 2): 150tr - 50tr = 100tr
Học Bổng A (Cấp 3 mới tạo): 0 + 50tr = 50tr
```

#### Trạng Thái Đề Xuất

| Trạng thái | Mô tả | Bước tiếp theo |
|-----------|-------|----------------|
| `Cho duyet` | Mới tạo, chờ cán bộ duyệt | Cán bộ duyệt/từ chối |
| `Can bo da duyet` | Cán bộ đã duyệt nội dung | Kế toán xác nhận tiền |
| `Tu choi` | Cán bộ từ chối | Kết thúc |
| `Da nhan tien` | Kế toán đã xác nhận tiền, đã cộng vào quỹ thành phần | Admin tạo hoạt động |
| `Da tao hoat dong` | Hoàn tất, đã tạo hoạt động (quỹ cấp 3) | Kết thúc (Success) |

#### Flow Diagram

```
    Nhà tài trợ tạo đề xuất chương trình
            │
            ▼
    ┌──────────────────┐
    │   "Cho duyet"     │
    └────────┬─────────┘
             │ Bước 1: Cán bộ duyệt
             ▼
    ┌──────────────────┐
    │"Can bo da duyet"  │
    └────────┬─────────┘
             │ Bước 2: Kế toán xác nhận tiền
             │         + Cộng vào Quỹ Thành Phần
             ▼
    ┌──────────────────┐
    │ "Da nhan tien"    │
    └────────┬─────────┘
             │ Bước 3: Admin tạo hoạt động
             │         + Tạo Quỹ Cấp 3
             │         + Trích tiền từ Quỹ Thành Phần
             ▼
    ┌──────────────────┐
    │"Da tao hoat dong" │ → Hoàn thành
    └──────────────────┘
```

#### Đặc Điểm Kỹ Thuật

- **Transaction safety**: Mỗi bước dùng MySQL transaction với row-level locking (`FOR UPDATE`) để tránh race condition
- **Audit trail**: Lưu đầy đủ `canbo_duyet_id`, `ketoan_xacnhan_id`, `admin_duyet_id` và timestamp
- **Backward compatibility**: API cũ vẫn hoạt động (1-step approval)
- **Validation**: Kiểm tra role, trạng thái, số dư quỹ ở mỗi bước

---

### 5.7 Quy Trình Ngân Sách Hoạt Động (Du Toan)

#### Mô Tả Tổng Quan

Ngân sách hoạt động (dự toán hàng năm) là cơ chế kiểm soát chi tiêu cho các hoạt động vận hành hệ thống quỹ (tham dự án, bộ máy hoạt động, nhiệm vụ khác). Theo **Điều 17.2**, quy trình duyệt dự toán gồm 2 cấp:

1. **Cấp 1 — Hội đồng Quỹ:** Duyệt初步 về mức chi và tính phù hợp
2. **Cấp 2 — Hiệu trưởng ĐHTV:** Duyệt最终 theo **Điều 20.3**

Mỗi đề xuất tạo 2 bản ghi trong `dutoanhangnam` (cap 1 + cap 2), liên kết qua `parent_id`. Hệ thống cũng lưu chi tiết từng khoản chi (`chitiet_dutoan`) và lý do đề xuất.

#### Bước 1: Đề Xuất

Kế toán nhập năm tài chính, lý do đề xuất, file minh chứng, và chi tiết các khoản chi qua `POST /api/du-toan`. Hệ thống tự động:
- Tạo bản ghi cap 1 (`capduyet=1`, `trangthai='Cho duyet'`)
- Tạo bản ghi cap 2 (`capduyet=2`, `parent_id` trỏ về cap 1)
- Luôn tạo trong transaction, rollback nếu lỗi

#### Bước 2: Duyệt Cấp 1 — Hội đồng Quỹ

Hội đồng Quỹ (role 1,2,3) xem và duyệt/từ chối cap 1 qua `PUT /api/du-toan/:id/approve`. Chỉ user có role phu hop moi duoc duyet cap tuong ung.

#### Bước 3: Duyệt Cấp 2 — Hiệu trưởng

Hiệu trưởng (role 1) duyệt/từ chối cap 2. Khi cả 2 cap đều `Da duyet` → `trangthai_tong = 'Da duyet'`.

#### Bước 4: Kiểm Tra Giới Hạn

Khi tạo giao dịch `Chi` với `hangmucchi = 'Bo_may_hoat_dong'`, hệ thống tự động kiểm tra `DuToanModel.checkLimit`: phải có ngân sách đã duyệt cho năm đó, và tổng chi tích lũy + số tiền hiện tại ≤ số tiền duyệt.

#### Bước 5: Xem Thống Kê

Hệ thống hiển thị thống kê năm trước (tong thu, tong chi, chi bo may, thu hoi no...) khi chon nam de de xuat.

---

### 5.7 Quy Trình Đối Soát Giao Dịch (Reconciliation)

#### Mô Tả Tổng Quan

Đối soát giao dịch là quá trình kiểm tra và xác minh rằng số tiền thực tế trong giao dịch ngân hàng khớp với số tiền ghi nhận trong hệ thống. Đây là bước quan trọng trong kiểm soát tài chính, giúp phát hiện các giao dịch bất thường hoặc sai lệch.

#### Cách 1: Đối Soát Thủ Công

Mỗi giao dịch trong hệ thống đều có thể được đánh dấu là: **Chưa đối soát** (mặc định), **Đã đối soát** (khớp), hoặc **Bất thường** (cần xem xét).

Kế toán hoặc Admin cập nhật trạng thái đối soát qua `PATCH /api/transactions/:id/doi-soat`:
- `Chua_doi_soat` → Đặt lại mọi trường đối soát về null
- `Da_doi_soat` → Ghi nhận số tiền thực tế (mặc định = số tiền hệ thống)
- `Bat_thuong` → Đánh dấu cần xem xét, ghi nhận số tiền thực tế nếu khác

#### Cách 2: Đối Soát Tự Động (Upload File Sao Kê)

Kế toán upload file sao kê ngân hàng (hỗ trợ CSV, Excel, TXT), hệ thống tự động:

**Bước 1 — Upload & Parse:**
- File được upload qua `POST /api/upload` (loại `documents`)
- Hệ thống parse nội dung file, extract các dòng giao dịch
- Mỗi dòng bao gồm: ngày GD, số tiền, nội dung/Mô tả, số tài khoản

**Bước 2 — So Khớp Tự Động:**
- So khớp từng giao dịch trong file với dữ liệu `giaodich` trong hệ thống
- Tiêu chí khớp: **số tiền**, **ngày**, **nội dung** (fuzzy match)
- Phân loại kết quả:
  - **Đã khớp** (green) — giao dịch trong hệ thống khớp hoàn toàn với sao kê
  - **Chưa khớp** (yellow) — có trong hệ thống nhưng không tìm thấy trong sao kê
  - **Sai lệch** (red) — có trong cả hai nhưng khác biệt về số tiền hoặc thông tin

**Bước 3 — Xử Lý:**
- Kế toán xem danh sách kết quả trên UI
- Xác nhận các khoản đã khớp
- Xem xét và xử lý các khoản sai lệch (liên hệ đối tác, điều chỉnh)
- Đánh dấu trạng thái đối soát cho từng giao dịch

---

### 5.8 Quy Trình Trả Nợ & Nhận Minh Chứng (Loan Payment)

#### Mô Tả Tổng Quan

Đối với khoản vay (`Cho vay`), sau khi giải ngân hệ thống tự động tạo hợp đồng vay vốn (`hopdongvayvon`) và lịch trả nợ (`lichtrano`). Sinh viên thực hiện trả tiền theo lịch và nộp minh chứng. Kế toán xác nhận hoặc từ chối minh chứng.

#### Bước 1: Sinh Viên Nộp Minh Chứng

Sinh viên truy cập trang lịch trả nợ (`/lich-tra-no`), chọn kỳ đến hạn, nộp minh chứng (file PDF/JPG/PNG). Trạng thái chuyển sang `Cho xac nhan`.

#### Bước 2: Kế Toán Xác Nhận

Kế toán xem danh sách minh chứng chờ xử lý, kiểm tra tính hợp lệ:
- **Xác nhận:** `trangthai='Da tra'`, `trangthaixacnhan='Da xac nhan'`. Hệ thống tự động tạo giao dịch `Thu hoi no` và cộng tiền vào quỹ.
- **Từ chối:** `trangthaixacnhan='Bi tu choi'`. Sinh viên nhận email thông báo và có thể nộp lại.

#### Bước 3: Kiểm Tra Tất Toan

Khi tất cả các kỳ đã trả, hợp đồng tự động chuyển sang `Da tat toan`.

---

### 5.9 Quy Trình Thu Hồi Nợ & Lãi Phạt Quá Hạn (Dieu 19.3)

#### Mô Tả Tổng Quan

Theo **Điều 19.3** Điều lệ, khoản vay quá hạn bị tính lãi phạt. Công thức:

```
LaiPhat = GocConLai × LaiSuatPhat × SoNgayQuaHan / 365
```

Trong đó:
- `GocConLai` = Goc phai tra - Goc da tra
- `LaiSuatPhat` = LaiSuatNganHangThamChieu × HeSoPhat (he so mac dinh = 2)
- `LaiSuatNganHangThamChieu` = 2.6%/nam (cau hinh trong `system_settings.json`)
- `HeSoPhat` = 2 (mac dinh)
- → `LaiSuatPhat` = 5.2%/nam

#### Cron Job Tinh Lai Phat

He thong chay cron job **00:05 moi ngay** (`laiPhatService.capNhatTrangThaiQuaHan`):
1. Tim cac ky tra no `Chua den han` nhung da qua ngay den han
2. Cap nhat `trangthai='Qua han'`
3. Tinh lai phat theo cong thuc tren, luu vao `lichtrano.sotienlaiphat`

---

### 5.10 He Thong Thong Bao (Email + Bell Notification)

#### Mô Tả Tổng Quan

He thong thong bao ho tro 2 luong: **email** (qua SMTP/Gmail) va **bell notification** (trong he thong). Ap dung cho cac su kien lien quan den tra no.

#### 5 Email Templates

| # | Template | Su kien | Nguoi nhan |
|---|----------|---------|-----------|
| 1 | `sendPaymentProofNotificationEmail` | SV nop minh chung | Ke toan + BKS |
| 2 | `sendPaymentConfirmedEmail` | Ke toan xac nhan | Sinh vien |
| 3 | `sendPaymentRejectedEmail` | Ke toan tu choi | Sinh vien |
| 4 | `sendPaymentDueReminderEmail` | Nhac truoc 7 ngay | Sinh vien |
| 5 | `sendPaymentOverdueEmail` | Canh bao qua han | Sinh vien |

#### Bell Notification

Luu trong bang `thong_bao`. Trigger boi:
- `confirmPayment` → tao thong bao "Xac nhan thanh toan"
- `rejectPayment` → tao thong bao "Minh chung bi tu choi"
- `sendReminder` → tao thong bao "Nhac no"
- Cron job 08:00 → tao thong bao "Sap den han"

Frontend: `NotificationContext` + `useNotification` hook + `NotificationBell` component. Poll moi 30 giay.

#### Cron Job Nhac No

He thong chay cron job **08:00 moi ngay**:
1. Tim cac ky tra no den han trong 7 ngay toi
2. Gui email nhac no (fire-and-forget)
3. Tao thong bao trong he thong

---

### 5.11 Quy Trình Xuất Báo Cáo

#### Mô Tả Tổng Quan

Hệ thống cung cấp chức năng xuất báo cáo tài chính dưới 2 định dạng: DOCX (Word) và XLSX (Excel). Báo cáo được xây dựng dựa trên template có sẵn với dữ liệu thời gian thực từ database.

Đặc biệt, báo cáo năm tài chính tuân thủ theo **Điều 17.2 và Điều 18** của Điều lệ Quỹ Phát triển, đảm bảo tính pháp lý khi trình lên cấp trên hoặc công khai.

#### 7 Loại Báo Cáo

| # | Loại Báo Cáo | Nội Dung |
|---|-------------|---------|
| 1 | `thu_chi_tong_hop` | Tổng hợp thu chi theo quỹ, thời gian |
| 2 | `danh_sach_nha_tai_tro` | Danh sách và mức đóng góp của nhà tài trợ |
| 3 | `danh_sach_thu_huong` | Danh sách sinh viên nhận hỗ trợ |
| 4 | `bao_cao_quy` | Báo cáo tình hình quỹ theo từng loại |
| 5 | `bao_cao_nguoi_dung` | Thống kê người dùng theo vai trò |
| 6 | `bao_cao_de_xuat` | Báo cáo đề xuất phân bổ |
| 7 | `bao_cao_nam_tai_chinh` | **Điều 17.2, 18** — 4 block tài chính |

#### Báo Cáo Năm Tài Chính (4 Block)

1. **Block 1 — Thu/Chi thực tế:** Phân theo loại giao dịch và loại hình hỗ trợ
2. **Block 2 — Phải thu:** Từ các điều khoản thu hồi (`dieukhoanthuhoi`)
3. **Block 3 — Ngân sách nội bộ:** Phân bổ từ quỹ cha xuống quỹ con (`phanbongansach`)
4. **Block 4 — Ngân sách hoạt động:** Dự toán hàng năm và thực chi (`dutoanhangnam`)

---

### 5.12 Quy Trình Thu Hồi Vốn (Dieu Khoan Thu Hoi)

#### Mô Tả Tổng Quan

Đối với khoản tài trợ có thu hồi (`loaihotro = 'Tai tro co thu hoi'`) hoặc khoản vay không đạt nghiệm thu, hệ thống tạo điều khoản thu hồi (`dieukhoanthuhoi`). Sinh viên nộp tiền thu hồi qua từng đợt, kế toán xác nhận.

#### Bước 1: Hệ Thống Tạo Điều Khoản Thu Hồi

Khi nghiệm thu không đạt (3 lần cuối cùng đều không đạt), hệ thống tự động:
- Chuyển trạng thái `yeucauhotro` sang `Dang thu hoi no`
- Tạo bản ghi `dieukhoanthuhoi` với: số tiền thu hồi = số tiền đã giải ngân, thời hạn 3 tháng, lãi suất 0%

#### Bước 2: Sinh Viên Nộp Tiền Thu Hồi

Sinh viên truy cập trang `/nghia-vu-hoan-tra`, xem điều khoản thu hồi và nộp tiền:
- POST `/api/thu-hoi/:id/nop-tien` — upload minh chứng chuyển khoản
- Hệ thống tạo bản ghi `lan nop tien` với trạng thái `Cho xac nhan`

#### Bước 3: Kế Toán Xác Nhận

Kế toán xem danh sách `/api/thu-hoi/danh-sach`, kiểm tra minh chứng:
- **Xác nhận:** `PUT /api/thu-hoi/:lanNopId/xac-nhan` → cộng tiền vào quỹ, tạo giao dịch `Thu hoi no`
- **Từ chối:** `PUT /api/thu-hoi/:lanNopId/tu-choi` → sinh viên nhận thông báo

#### Bước 4: Kiểm Tra Hoàn Thành

Khi tổng tiền đã thu >= số tiền phải thu hồi → `dieukhoanthuhoi.trangthai = 'Da thu het'`

---

### 5A. CÁC LUỒNG HỖ TRỢ & TIỆN ÍCH

#### 5A.1 Đăng Ký Tài Khoản

Hệ thống hỗ trợ 3 loại tài khoản khi đăng ký: **Sinh viên**, **Nhà tài trợ**, **Cán bộ**.

**Luồng thực thi:**

1. Kiểm tra **chế độ bảo trì** — nếu bật, trả 503 block mọi đăng ký mới
2. Validate theo loại tài khoản:
   - **Sinh viên:** `hoTen`, `mssv`, `khoaPhong`, `lop`, `email`, `password` (bắt buộc)
   - **Nhà tài trợ:** `tenToChuc`, `email`, `soDienThoai`, `password` (bắt buộc)
   - **Cán bộ:** `hoTen`, `email`, `password` (bắt buộc)
3. Validate email (regex), password (>= 8 ký tự)
4. Kiểm tra email trùng trong DB → 409 nếu đã tồn tại
5. Hash password bằng bcrypt (salt rounds: 10)
6. Tạo user mới:
   - `roleId` = 4 (Nguoi dung) — mọi đăng ký đều nhận role mặc định
   - `maSoDinhDanh`: `mssv` (SV), `CB{timestamp}` (CB), `NTT{timestamp}` (NTT)
   - `trangthai` = `HOAT_DONG`
7. Nếu loại Nhà tài trợ → tự động tạo bản ghi trong `nhataitro` (failure không rollback user)
8. Tạo JWT token pair (access + refresh)
9. Log sự kiện đăng ký
10. Trả về `accessToken`, `refreshToken`, `user` (không chứa password)

#### 5A.2 Đăng Nhập & JWT

**Luồng đăng nhập:**

1. Validate `email` + `matKhau` không rỗng
2. Tìm user theo email — trả 401 chung (không tiết lộ email có tồn tại không)
3. Kiểm tra **chế độ bảo trì**: nếu ON và user không phải Admin → 503
4. Kiểm tra tài khoản bị khóa (`KHOA`) → 403
5. Kiểm tra vai trò bị tạm dừng (`TAM_DUNG`) → 403
6. So sánh password với bcrypt.compare → 401 nếu sai
7. Tạo JWT token pair:
   - **Access token**: `JWT_SECRET`, hết hạn `JWT_EXPIRES_IN` (mặc định 2h)
   - **Refresh token**: `JWT_REFRESH_SECRET` (secret riêng), hết hạn `JWT_REFRESH_EXPIRES_IN` (mặc định 30d)
   - Payload: `{ user_id, vai_tro }`
8. Trả về `accessToken`, `refreshToken`, `user`

**Refresh Token (rotation):**

1. Client gửi `refreshToken`
2. Verify với `JWT_REFRESH_SECRET` → 401 nếu hết hạn/sai
3. Tìm user theo decoded `user_id` → 401 nếu không tồn tại
4. Kiểm tra account locked → 403
5. **Rotate** — tạo token pair MỚI HOÀN TOÀN (cả access + refresh)
6. Trả về token mới

#### 5A.3 Quên Mật Khẩu

1. Client gửi `{ email }`
2. Tìm user theo email → 404 nếu không tồn tại
3. Kiểm tra account locked → 403
4. Tạo password random **8 ký tự** (A-Z, a-z, 0-9)
5. Hash password mới bằng bcrypt
6. Ghi đè password cũ trong DB (mật khẩu cũ bị thay vĩnh viễn)
7. Gửi email chứa password mới (plaintext) cho user
8. Trả về thông báo thành công (không trả password trong response)

> **Lưu ý:** Không có cơ chế token/link, không có expiry. Password cũ bị thay thế ngay lập tức. Sử dụng `Math.random()` (không cryptographically secure).

#### 5A.4 Đổi Mật Khẩu

1. Client gửi `{ oldPassword, newPassword, confirmPassword }`
2. Validate: `newPassword` >= 6 ký tự, `newPassword` == `confirmPassword`
3. Lấy password hash hiện tại từ DB
4. **Nếu user đã có password** (`matkhau !== null`):
   - `oldPassword` là bắt buộc
   - So sánh `oldPassword` với hash → 401 nếu sai
   - Kiểm tra `newPassword` != `oldPassword` → 400 nếu trùng
5. **Nếu user chưa có password** (Google OAuth account, `matkhau === null`):
   - `oldPassword` **không bắt buộc** — cho phép set password lần đầu
6. Hash password mới, ghi vào DB
7. Trả về thông báo thành công

#### 5A.5 Google OAuth

**Bước 1 — Redirect Google:**
1. Tạo URL authorization với `access_type: "offline"`, scope: `userinfo.profile` + `userinfo.email`, `prompt: "select_account"`
2. Redirect browser đến Google

**Bước 2 — Callback:**
1. Nhận `code` từ Google query params
2. Nếu user huỷ → redirect `${FRONTEND_URL}/login?error=google_cancelled`
3. Exchange `code` lấy Google tokens
4. Verify ID token → extract `email`, `name`, `picture`
5. Tìm user theo email:
   - **Chưa có** → tạo user mới từ Google (password = null, avatar = picture)
   - **Đã có** → check locked/suspended
6. Tạo JWT pair của ứng dụng
7. Redirect về frontend: `${FRONTEND_URL}/auth/google/callback?accessToken=...&refreshToken=...&user=...`

> **Lưu ý:** User Google lần đầu có `matkhau = null`, có thể set password sau qua `updatePassword`.

#### 5A.6 Upload File

Hệ thống hỗ trợ **6 loại upload** + **xóa file**, tất cả dùng Multer disk storage.

**Cấu trúc thư mục:**
```
backend/uploads/
├── avatars/donor/      # Avatar nhà tài trợ
├── avatars/fund/       # Ảnh bìa quỹ
├── avatars/staffs/     # Avatar cán bộ + admin
├── avatars/students/   # Avatar sinh viên
├── documents/         # File đính kèm (PDF, DOC)
├── proofs/            # minh chứng
└── tintuc/            # Ảnh tin tức
```

| Loại | Endpoint | Giới hạn | Thư mục lưu | Auth |
|------|----------|----------|-------------|------|
| Chung | `POST /api/upload` | PDF/JPG/PNG/DOC, ≤5MB | `documents/` | Có |
| Công khai | `POST /api/upload/public` | PDF/JPG/PNG/DOC, ≤5MB | `documents/` | Không |
| Nhiều file | `POST /api/upload/multiple` | Max 5 files, mỗi file ≤10MB | `documents/` | Có |
| Avatar | `POST /api/upload/avatar` | JPG/PNG, ≤5MB | `avatars/{folder}/` | Có |
| Ảnh quỹ | `POST /api/upload/fund` | JPG/PNG, ≤5MB | `avatars/fund/` | Có |
| Ảnh SV | `POST /api/upload/student` | JPG/PNG, ≤5MB | `avatars/students/` | Có |
| Ảnh tin | `POST /api/upload/news` | JPG/PNG, ≤5MB | `tintuc/` | Có |

**Avatar folder phân loại theo role:**
- Role 1, 2, 3 → `avatars/staffs/`
- Role 4 + `SINH_VIEN` → `avatars/students/`
- Role 4 + `NHA_TAI_TRO` → `avatars/staffs/`

**Xóa file:** `DELETE /api/upload/:filename` — chỉ xóa được file trong `documents/`, không xóa được avatar/ảnh quỹ/ảnh tin.

**Định dạng tên file:** `{tenGoc}_{timestamp}_{9soNgauNhau}{extension}` — ký tự đặc biệt bị thay bằng `_`.

#### 5A.7 Quản Lý Tin Tức

**Quy trình trạng thái:**
```
Ban nhap (Draft) → Da xuat ban (Published) → Da an (Hidden)
```

**Tạo tin (`POST /api/news`):**
1. Validate `title` (không rỗng) và `content` (không rỗng)
2. Nếu status = `Da xuat ban` và không có `publishDate` → tự động set ngày hiện tại
3. `phanloai` được normalize: `Tin moi`, `Tin noi bat`, `baocaohoatdong`, `chuongtrinh`, `cuusinhvien`
4. `lanoibat` mặc định = 0 (không nổi bật)
5. Lưu vào DB, trả về tin vừa tạo với URL ảnh

**Sửa tin (`PUT /api/news/:id`):**
- Nếu chuyển sang `Da xuat ban` mà chưa có ngày → tự set ngày
- Nếu chuyển sang `Ban nhap` → xóa ngày xuất bản (null)

**Đổi trạng thái (`PUT /api/news/:id/status`):**
- Chỉ 3 trạng thái: `Ban nhap`, `Da xuat ban`, `Da an`
- Tự động xử lý ngày xuất bản theo logic trên

**Xóa tin (`DELETE /api/news/:id`):**
- Chỉ Admin mới xóa được
- **Không xóa file ảnh** trên disk (chỉ xóa bản ghi DB)

**Xem công khai:**
- `GET /api/news/landing` — tin cho landing page (featured + recent)
- `GET /api/news/public` — danh sách phân trang, filter theo `phanloai`
- `GET /api/news/:id` — chỉ trả tin `Da xuat ban`, 404 cho draft/hidden

**Xây dựng URL ảnh:** Dùng `process.env.BASE_URL` + relative path → trả về URL tuyệt đối cho production.

#### 5A.8 Cảm Nhận Sinh Viên (Testimonials)

**Quy trình trạng thái:**
```
Gửi → Cho duyet → Da duyet / Tu choi
```

**Gửi đánh giá (`POST /api/danhgia`):**
1. Yêu cầu đăng nhập (`optionalProtect` — phải có token)
2. Validate `noiDung` (bắt buộc, tối đa 500 ký tự)
3. Lưu với trạng thái `Cho duyet`
4. Trả về thông báo "đã gửi, chờ duyệt"

**Duyệt (`PATCH /api/danhgia/:id/trangthai`):**
- Admin/Cán bộ chọn: `Da duyet` hoặc `Tu choi`
- Nếu từ chối phải nhập lý do

**Đặt nổi bật (`PATCH /api/danhgia/:id/noi-bat`):**
- Chỉ đặt nổi bật được khi trạng thái đã `Da duyet`
- Có thứ tự hiển thị (`thuTu`)

**Xem công khai:**
- `GET /api/danhgia/landing` — top 6 đánh giá đã duyệt (hiển thị trên landing page)
- `GET /api/danhgia` — phân trang, filter theo khoa/từ khóa

> **Bug đã biết:** `getBodyField()` chưa được define trong `danhGiaController.js` → 2 PATCH endpoint sẽ gặp `ReferenceError` khi chạy.

#### 5A.9 Sinh Viên Nổi Bật

**Quy trình:**
```
Thêm/Sửa → Hien thi / An
```

**Tạo (`POST /api/student-showcase`):**
1. Admin/Cán bộ nhập: `nguoiDungId`, `namHoc`, `thanhTich`, `thuTu`, `trangThai`
2. Validate `nguoiDungId` (bắt buộc, số)
3. `trangThai` mặc định = `Hien thi`
4. Avatar được tự động lấy từ `nguoidung.avatar`

**Đổi trạng thái (`PUT /api/student-showcase/:id/status`):**
- `Hien thi` (hiển thị trên trang công khai) hoặc `An` (ẩn)

**Xem công khai:** `GET /api/student-showcase/public` — chỉ trả SV có `Hien thi`

#### 5A.10 Chức Vụ Tổ Chức

**4 nhóm chức vụ:**
| Nhóm | Mô tả |
|------|-------|
| Hội đồng Quỹ | Ban lãnh đạo cao nhất |
| Ban Điều hành | Quản lý vận hành hàng ngày |
| Ban Kiểm soát | Giám sát độc lập (Điều 8 Điều lệ) |
| Văn phòng Thường trực | Hành chính, hỗ trợ |

**CRUD (Admin only):**
- `POST /api/chuc-vu` — tạo mới (yêu cầu `chucDanh`, `nhom`)
- `PUT /api/chuc-vu/:id` — cập nhật
- `DELETE /api/chuc-vu/:id` — **soft delete** (chuyển `trangthai` = `Het nhiem ky`)
- `PUT /api/chuc-vu/reorder` — sắp xếp lại thứ tự (dùng MySQL transaction)

**Xem công khai:** `GET /api/chuc-vu/public` — chỉ hiển thị `Dang nhiem`, sắp xếp theo nhóm và `thuTu`

#### 5A.11 Cài Đặt Hệ Thống

**60 trường cấu hình** trong `system_settings.json`,分为 các nhóm:

| Nhóm | Fields |
|------|--------|
| Nhận diện | `ten_he_thong`, `don_vi_quan_ly` |
| Liên hệ | `email_lien_he`, `email_ho_tro`, `so_dien_thoai`, `dia_chi_lien_he`, `gio_lam_viec` |
| Social | `facebook_url`, `youtube_url`, `linkedin_url` |
| TK nhận TT | `ngan_hang`, `chi_nhanh`, `so_tai_khoan`, `chu_tai_khoan` |
| Quy tắc | `thoi_han_xu_ly_ngay`, `so_cap_duyet`, `ky_tu_ly_do_toi_thieu` |
| Upload | `kich_thuoc_toi_da_mb`, `so_file_toi_da`, `dinh_dang_cho_phep` |
| Hệ thống | `maintenanceMode`, `laisuatnganhangthamchieu` |
| Landing page | `hero_*`, `process_*`, `donor_wall_*`, `ai_*`, `testimonials_*`, `progress_*`, `footer_*`, `guidelines_*` |

**Flow cập nhật:**
1. Admin gọi `PATCH /api/system/settings` với các field cần thay
2. Validate `so_cap_duyet` (1-5) nếu có
3. Merge vào settings hiện tại, ghi file JSON
4. Audit log với action `CAP_NHAT_CAI_DAT_HE_THONG`

**Flow xem:**
- `GET /api/system/settings` — Admin/BKS xem đầy đủ (bao gồm internal config)
- `GET /api/system/public` — Công khai, chỉ trả các trường public (bỏ sensitive)

#### 5A.12 Phân Quyền Trang (Page Permissions)

**Ma trận 30 trang × 6 vai trò:**

| Trang | Admin | Cán bộ | Kế toán | SV | NTT | BKS |
|-------|:-----:|:------:|:-------:|:--:|:---:|:---:|
| Trang chủ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Danh mục quỹ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Hướng dẫn | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Vinh danh | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Thống kê công khai | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Khoản TT công khai | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Cá nhân | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Tạo đơn | ✗ | ✗ | ✗ | ✓ | ✓ | ✗ |
| Nghĩa vụ hoàn trả | ✗ | ✗ | ✗ | ✓ | ✗ | ✗ |
| Tra cứu | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Dashboard | ✓ | ✓ | ✓ | ✗ | ✗ | ✓ |
| Quản lý NN | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| Xét duyệt | ✓ | ✓ | ✓ | ✗ | ✗ | ✓ |
| Danh sách Quỹ | ✓ | ✓ | ✓ | ✗ | ✗ | ✓ |
| Nhà tài trợ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| SV nổi bật | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| Tin tức | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| Báo cáo | ✓ | ✓ | ✓ | ✗ | ✗ | ✓ |
| Khoản TT | ✓ | ✗ | ✓ | ✗ | ✗ | ✓ |
| Lịch sử GD | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Về Quỹ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Cựu SV | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Giao dịch | ✓ | ✗ | ✓ | ✗ | ✗ | ✓ |
| Giải ngân | ✗ | ✗ | ✓ | ✗ | ✗ | ✗ |
| Đối soát CT | ✓ | ✗ | ✓ | ✗ | ✗ | ✗ |
| Phê duyệt | ✓ | ✗ | ✗ | ✗ | ✗ | ✓ |
| Phân quyền | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Nhật ký | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Nhân sự | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Giám sát | ✓ | ✓ | ✓ | ✗ | ✗ | ✓ |
| Phân bổ | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| Dự toán | ✓ | ✓ | ✓ | ✗ | ✗ | ✓ |
| Công nợ | ✓ | ✗ | ✓ | ✗ | ✗ | ✓ |
| Thu hồi | ✗ | ✗ | ✓ | ✓ | ✗ | ✗ |
| Cảm nhận | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |

**Flow cập nhật:**
1. Admin gọi `PATCH /api/system/permissions` với ma trận mới
2. Merge vào `page_permissions.json`, ghi file
3. Audit log (fire-and-forget)
4. Frontend đọc permissions → lọc sidebar + menu theo vai trò

#### 5A.13 Quản Lý Vai Trò

- `PATCH /api/vaitro/:role_id` — cập nhật mô tả/trạng thái
- **Bảo vệ:** Không cho sửa Admin (role_id=1) và Nguoi dung (role_id=4)
- Trạng thái: `Hoat dong` hoặc `Tam dung`
- Khi `Tam dung`: user có role đó bị block khi login hoặc gọi API
- Audit log với action `CAP_NHAT_VAI_TRO`

#### 5A.14 Chế Độ Bảo Trì (Maintenance Mode)

**Kích hoạt:** Admin set `maintenanceMode: true` trong `system_settings.json`

**Ảnh hưởng:**

| Vị trí | Hành vi |
|--------|---------|
| `POST /api/auth/register` | Trả 503 — block đăng ký mới |
| `POST /api/auth/login` | Trả 503 nếu user không phải Admin (role_id=1) |
| `protect` middleware | Trả 503 nếu decoded token không phải Admin |

**Đặc điểm kỹ thuật:**
- Đọc file JSON **đồng bộ** (`readFileSync`) trên MỖI request → toggle có hiệu lực ngay lập tức, không cần restart
- Admin **luôn được miễn** — có thể đăng nhập và truy cập mọi endpoint
- File default: `maintenanceMode: false`

#### 5A.15 Audit Log Tự Động

**Hệ thống ghi log 2 lớp:**

**Lớp 1 — Middleware tự động (`auditLogMiddleware.js`):**
1. Bắt mọi request `POST/PUT/PATCH/DELETE` có prefix `/api/`
2. Skip: `/api/nhat-ky`, `/api/auth/refresh-token`, `/api/applications/ai-suggest`, `/api/bao-cao/xuat`
3. Trên response `finish` event:
   - Skip nếu `req._systemLogWritten = true` (controller đã log trước)
   - Skip nếu status < 200 hoặc >= 400
   - Extract route params, URL path
4. Map URL prefix → resource type (17 mapping: `/api/news` → `tintuc`, `/api/funds` → `quy`, ...)
5. Sanitize data: mask password/token, convert Date, detect circular refs, truncate JSON > 6000 chars
6. Ghi log async với: action (`API_TAO_MOI/CAP_NHAT/XOA`), user ID, IP, method, path, status, duration, body

**Lớp 2 — Controller explicit log:**
- Các controller quan trọng tự gọi `logSystemActivity()` với action cụ thể (VD: `NOP_YEU_CAU_HO_TRO`, `DUYET_PHAN_BO`)
- Dùng `req._systemLogWritten = true` để báo middleware không log trùng

**Xem nhật ký:**
- `GET /api/nhat-ky` — phân trang, filter: keyword, hành động, đối tượng, ngày
- `GET /api/nhat-ky/stats` — thống kê tổng, hôm nay, tuần này, user hôm nay
- `GET /api/nhat-ky/export` — xuất Excel (.xlsx) với filter

#### 5A.16 Rate Limiting

**Triển khai:** In-memory, per-IP, dùng `Map`.

**Cấu hình:**
- `windowMs`: cửa sổ thời gian (mặc định 1 giờ)
- `max`: số request tối đa trong cửa sổ (mặc định 3)
- Message lỗi khi bị limit

**Flow:**
1. Extract IP từ `x-forwarded-for` hoặc `req.socket.remoteAddress`
2. Nếu IP mới → tạo entry `{count: 1, resetTime: now + windowMs}`
3. Nếu window hết hạn → reset count
4. Nếu count >= max → trả 429 với thông báo còn bao nhiêu phút
5. Cleanup tự động mỗi 5 phút (xóa entries hết hạn)

> **Lưu ý:** Rate limiter là per-process (reset khi server restart), không distributed.

#### 5A.17 Hệ Thống Badge Thông Báo Sidebar

Hệ thống hiển thị badge (chấm đỏ với số) trên sidebar menu để thông báo số lượng cần xử lý. Badge được cập nhật mỗi 60 giây.

**API:** `GET /statistics/pending-count` — trả về 4 count tùy vai trò:

| Count Field | Ý Nghĩa | Admin (1) | KeToan (2) | CanBo (3) | BanKS (5) |
|-------------|---------|-----------|------------|-----------|-----------|
| `pendingCount` | Đơn chờ xử lý | cap 2 | cap 3 + giaingan + dot 1 + dot 2 | cap 1 | Cho duyet (pheduyet) |
| `nghiemThuCongNo` | Nghiệm thu + Công nợ | nt + congno | nt + congno | nt only | nt + congno |
| `khoanTaiTro` | Khoản tài trợ | Da duyet | Cho duyet | — | — |
| `doiSoatChungTu` | Đối soát chứng từ | Chua doi soat | Chua doi soat | — | — |

**Ánh xạ badgeKey → sidebar item:**
- "Xét duyệt" → `pendingCount` (role 1, 3)
- "Giải ngân" → `pendingCount` (role 2)
- "Phê duyệt" → `pendingCount` (role 5)
- "Nghiệm thu & Công nợ" → `nghiemThuCongNo`
- "Khoản tài trợ" → `khoanTaiTro`
- "Đối soát chứng từ" → `doiSoatChungTu`

**Frontend:** `StaffSidebar` component poll API mỗi 60 giây, hiển thị badge number trên menu item.

#### 5A.17 Đối Soát Chứng Từ Chi

Kế toán upload file sao kê ngân hàng (CSV/Excel/TXT), hệ thống tự động:

1. Parse file → extract các giao dịch
2. So khớp với dữ liệu trong `giaodich` theo: số tiền, ngày, nội dung
3. Phân loại kết quả:
   - **Đã khớp** — giao dịch trong hệ thống khớp với sao kê
   - **Chưa khớp** — có trong hệ thống nhưng không tìm thấy trong sao kê
   - **Sai lệch** — có trong cả hai nhưng số tiền/khác biệt
4. Hiển thị kết quả trên UI để kế toán xem xét

---

## 6. MỐI QUAN HỆ DỮ LIỆU

### 6.1 Sơ Đồ Quan Hệ

```
vaitro ←──── nguoidung.vaitro_id         (1:N)
donvihoc ←── nguoidung.donvihoc_id       (1:N)

nguoidung (trung tâm)
  ├── nhataitro.nguoidung_id             (1:N)
  ├── yeucauhotro.nguoidung_id           (1:N)
  ├── pheduyet.nguoiduyet_id             (1:N)
  ├── giaodich.nguoithuchien_id          (1:N)
  ├── phanbongansach.nguoi_de_xuat_id    (1:N)
  ├── chucvuquy.nguoidung_id             (1:N)
  ├── nhatkyhethong.nguoidung_id         (1:N)
  └── sinhviennoibat.nguoidung_id        (1:1)

quy (self-ref: quy_cha_id → quy)
  ├── khoantaitro.quy_id                 (1:N)
  ├── yeucauhotro.quy_id                 (1:N)
  ├── giaodich.quy_id                    (1:N)
  ├── dotgiaingan.quy_id                 (1:N)
  ├── phanbongansach.quy_nguon/quy_dich  (1:N)
  └── taikhoannganhang.quy_id            (1:N)

yeucauhotro
  ├── pheduyet.yeucauhotro_id            (1:3 — 3 cấp)
  ├── giaodich.yeucauhotro_id            (1:N)
  ├── dieukhoanthuhoi.yeucauhotro_id     (1:1)
  ├── hopdongvayvon.yeucauhotro_id       (1:1)
  └── nghiemthu.yeucauhotro_id           (1:N)

hopdongvayvon → lichtrano.hopdongvayvon_id (1:N)
nhataitro → khoantaitro.nhataitro_id       (1:N)
```

### 6.2 Bảng Quan Trọng

| Bảng | Mục Đích | Khóa Chính | Khóa Ngoại |
|------|---------|-----------|-----------|
| `nguoidung` | Trung tâm người dùng | `nguoidung_id` (AI) | `vaitro_id`, `donvihoc_id` |
| `quy` | Các quỹ tài chính | `quy_id` | `loaiquy_id`, `nguoitao_id`, `quy_cha_id` |
| `yeucauhotro` | Đơn đề nghị hỗ trợ | `yeucauhotro_id` (AI) | `nguoidung_id`, `quy_id`, `dot_id` |
| `pheduyet` | Lượt duyệt 3 cấp | `pheduyet_id` | `yeucauhotro_id`, `nguoiduyet_id` |
| `giaodich` | Giao dịch Thu/Chi | `giaodich_id` | `quy_id`, `nguoinhan_id`, `yeucauhotro_id` |
| `khoantaitro` | Khoản tài trợ | `khoantaitro_id` | `nhataitro_id`, `quy_id` |
| `nhataitro` | Nhà tài trợ | `nhataitro_id` | `nguoidung_id` |
| `chucvuquy` | Vị trí tổ chức | `chucvu_id` (AI) | `nguoidung_id` |

---

## 7. DANH SÁCH TẤT CẢ API ENDPOINTS (204 endpoints)

### 7.1 Auth — `/api/auth` (9 endpoints)

| # | Method | Path | Middleware | Mô tả |
|---|--------|------|-----------|-------|
| 1 | POST | `/api/auth/register` | Public | Đăng ký tài khoản mới |
| 2 | POST | `/api/auth/login` | Public | Đăng nhập |
| 3 | POST | `/api/auth/refresh-token` | Public | Làm mới access token |
| 4 | GET | `/api/auth/me` | Protect | Lấy thông tin user hiện tại |
| 5 | PUT | `/api/auth/update-password` | Protect | Đổi mật khẩu |
| 6 | POST | `/api/auth/forgot-password` | Public | Yêu cầu đặt lại mật khẩu |
| 7 | POST | `/api/auth/logout` | Protect | Đăng xuất |
| 8 | GET | `/api/auth/google` | Public | Chuyển hướng Google OAuth |
| 9 | GET | `/api/auth/google/callback` | Public | Google OAuth callback |

### 7.2 Users — `/api/users` (9 endpoints)

| # | Method | Path | Middleware (Roles) | Mô tả |
|---|--------|------|-------------------|-------|
| 1 | GET | `/api/users/growth` | Protect (1,3) | Thống kê tăng trưởng用户 |
| 2 | GET | `/api/users/stats` | Protect (1,3) | Tổng quan用户 |
| 3 | GET | `/api/users/faculties` | Public | Danh sách khoa (dùng cho form) |
| 4 | GET | `/api/users/` | Protect (1,3) | Danh sách用户 (filter, pagination) |
| 5 | GET | `/api/users/:id` | Protect (1,2,3) | Chi tiết user |
| 6 | POST | `/api/users/` | Protect (1,3) | Tạo user mới |
| 7 | PATCH | `/api/users/:id` | Protect | Cập nhật info user |
| 8 | PUT | `/api/users/:id/status` | Protect (1,3) | Khóa/mở khóa tài khoản |
| 9 | DELETE | `/api/users/:id` | Protect (1) | Xóa user (Admin only) |

### 7.3 Roles — `/api/roles` (4 endpoints)

| # | Method | Path | Middleware (Roles) | Mô tả |
|---|--------|------|-------------------|-------|
| 1 | GET | `/api/roles/` | Protect (1,3) | Danh sách vai trò |
| 2 | GET | `/api/roles/:id` | Protect (1,3) | Chi tiết vai trò |
| 3 | GET | `/api/roles/:id/users` | Protect (1,3) | Users theo vai trò |
| 4 | PATCH | `/api/roles/:id` | Protect (1) | Cập nhật vai trò |

### 7.4 Applications — `/api/applications` (10 endpoints)

| # | Method | Path | Middleware (Roles) | Mô tả |
|---|--------|------|-------------------|-------|
| 1 | POST | `/api/applications/ai-suggest` | Protect | AI gợi ý đơn |
| 2 | POST | `/api/applications/public/ai-suggest` | RateLimit | AI gợi ý cho khách |
| 3 | POST | `/api/applications/` | Protect (3,4) | Nộp đơn mới |
| 4 | GET | `/api/applications/my-applications` | Protect (4) | Đơn của tôi |
| 5 | GET | `/api/applications/` | Protect (1,2,3,5) | Tất cả đơn (filter) |
| 6 | GET | `/api/applications/:id` | Protect (1,2,3,4,5) | Chi tiết đơn |
| 7 | PUT | `/api/applications/:id/reject` | Protect (1,2,3) | Từ chối đơn |
| 8 | PUT | `/api/applications/:id/staff-approve` | Protect (3) | Duyệt cấp 1 |
| 9 | PUT | `/api/applications/:id/admin-approve` | Protect (1) | Duyệt cấp 2 |
| 10 | POST | `/api/applications/:id/disburse` | Protect (2) | Duyệt cấp 3 + giải ngân |

### 7.5 Phe Duyet — `/api/pheduyet` (4 endpoints)

| # | Method | Path | Middleware (Roles) | Mô tả |
|---|--------|------|-------------------|-------|
| 1 | GET | `/api/pheduyet/stats` | Protect (1,5) | Thống kê phê duyệt |
| 2 | GET | `/api/pheduyet/approvers` | Protect (1,5) | Danh sách người duyệt |
| 3 | GET | `/api/pheduyet/timeline/:type/:id` | Protect (1,5) | Timeline phê duyệt |
| 4 | GET | `/api/pheduyet/` | Protect (1,5) | Tất cả lượt duyệt |

### 7.6 Nghiem Thu — `/api/nghiem-thu` (6 endpoints)

| # | Method | Path | Middleware (Roles) | Mô tả |
|---|--------|------|-------------------|-------|
| 1 | POST | `/api/nghiem-thu/` | Protect (3) | Tạo biên bản nghiệm thu |
| 2 | PUT | `/api/nghiem-thu/:id` | Protect (1) | Cập nhật kết quả |
| 3 | PUT | `/api/nghiem-thu/:id/edit` | Protect (1,3) | Sửa thông tin nghiệm thu |
| 4 | DELETE | `/api/nghiem-thu/:id` | Protect (1,3) | Xóa nghiệm thu chưa duyệt |
| 5 | GET | `/api/nghiem-thu/application/:yeucauhotroId` | Protect | Lịch sử nghiệm thu |
| 6 | GET | `/api/nghiem-thu/application/:yeucauhotroId/detail` | Protect | Chi tiết nghiệm thu |

### 7.7 Funds — `/api/funds` (8 endpoints)

| # | Method | Path | Middleware (Roles) | Mô tả |
|---|--------|------|-------------------|-------|
| 1 | GET | `/api/funds/public` | Public | Danh sách quỹ công khai |
| 2 | GET | `/api/funds/:id/bank-accounts` | Public | TK ngân hàng quỹ |
| 3 | GET | `/api/funds/:id` | Public | Chi tiết quỹ |
| 4 | GET | `/api/funds/:id/available-balance` | Protect (1,2,3) | Số dư khả dụng quỹ |
| 5 | GET | `/api/funds/` | Protect (1,2,3,5) | Tất cả quỹ |
| 6 | POST | `/api/funds/` | Protect (1,3) | Tạo quỹ mới |
| 7 | PUT | `/api/funds/:id` | Protect (1,3) | Cập nhật quỹ |
| 8 | PUT | `/api/funds/:id/status` | Protect (1,3) | Đổi trạng thái quỹ |

### 7.8 Loai Quy — `/api/loai-quy` (3 endpoints)

| # | Method | Path | Middleware (Roles) | Mô tả |
|---|--------|------|-------------------|-------|
| 1 | GET | `/api/loai-quy/groups` | Public | Nhóm loại quỹ |
| 2 | GET | `/api/loai-quy/` | Public | Danh sách loại quỹ |
| 3 | POST | `/api/loai-quy/` | Protect (1,3) | Tạo loại quỹ mới |

### 7.9 Disbursement Rounds — `/api/disbursement-rounds` (4 endpoints)

| # | Method | Path | Middleware (Roles) | Mô tả |
|---|--------|------|-------------------|-------|
| 1 | GET | `/api/disbursement-rounds/public/fund/:quyId` | Public | Đợt giải ngân công khai |
| 2 | GET | `/api/disbursement-rounds/fund/:quyId` | Protect (1,2,3,5) | Đợt giải ngân theo quỹ |
| 3 | GET | `/api/disbursement-rounds/:dotId` | Protect (1,2,3,5) | Chi tiết đợt |
| 4 | PUT | `/api/disbursement-rounds/:dotId/complete` | Protect (1) | Hoàn thành đợt |

### 7.10 Phan Bo Ngan Sach — `/api/funds/allocate` (6 endpoints)

| # | Method | Path | Middleware (Roles) | Mô tả |
|---|--------|------|-------------------|-------|
| 1 | GET | `/api/funds/allocate/stats` | Protect (1,2,5) | Thống kê phân bổ |
| 2 | GET | `/api/funds/allocate/` | Protect (1,2,3,5) | Danh sách đề nghị |
| 3 | POST | `/api/funds/allocate/request` | Protect (1,3) | Đề nghị phân bổ |
| 4 | POST | `/api/funds/allocate/:id/approve` | Protect (1) | Duyệt phân bổ |
| 5 | POST | `/api/funds/allocate/:id/reject` | Protect (1) | Từ chối phân bổ |
| 6 | POST | `/api/funds/allocate/:id/rollback` | Protect (1) | Thu hồi phân bổ |

### 7.11 Bank Accounts — `/api/bank-accounts` (9 endpoints)

| # | Method | Path | Middleware (Roles) | Mô tả |
|---|--------|------|-------------------|-------|
| 1 | GET | `/api/bank-accounts/school` | Public | TK ngân hàng trường |
| 2 | POST | `/api/bank-accounts/school` | Protect (1) | Thêm TK trường |
| 3 | PUT | `/api/bank-accounts/school/:id` | Protect (1) | Sửa TK trường |
| 4 | DELETE | `/api/bank-accounts/school/:id` | Protect (1) | Xóa TK trường |
| 5 | GET | `/api/bank-accounts/` | Protect | TK của tôi |
| 6 | GET | `/api/bank-accounts/user/:userId` | Protect (1,2,3) | TK theo user |
| 7 | POST | `/api/bank-accounts/` | Protect | Thêm TK cá nhân |
| 8 | DELETE | `/api/bank-accounts/:id` | Protect | Xóa TK cá nhân |
| 9 | PUT | `/api/bank-accounts/:id/set-default` | Protect | Đặt TK mặc định |

### 7.12 Donations — `/api/donations` (10 endpoints)

| # | Method | Path | Middleware (Roles) | Mô tả |
|---|--------|------|-------------------|-------|
| 1 | POST | `/api/donations/public` | Public | Tài trợ công khai |
| 2 | POST | `/api/donations/authenticated` | Protect (4) | Tài trợ đã đăng nhập |
| 3 | GET | `/api/donations/my-donations` | Protect (4) | Khoản tài trợ của tôi |
| 4 | GET | `/api/donations/stats` | Protect (1,2,5) | Thống kê tài trợ |
| 5 | GET | `/api/donations/` | Protect (1,2,3,5) | Danh sách tài trợ |
| 6 | GET | `/api/donations/:id` | Protect (1,2,3,5) | Chi tiết tài trợ |
| 7 | POST | `/api/donations/` | Protect (1,3) | Ghi nhận tài trợ |
| 8 | PUT | `/api/donations/:id/approve` | Protect (1,2) | Duyệt tài trợ |
| 9 | PUT | `/api/donations/:id/confirm` | Protect (1) | Xác nhận tài trợ |
| 10 | PUT | `/api/donations/:id/reject` | Protect (1,2) | Từ chối tài trợ |

### 7.13 Donors — `/api/donors` (7 endpoints)

| # | Method | Path | Middleware (Roles) | Mô tả |
|---|--------|------|-------------------|-------|
| 1 | GET | `/api/donors/wall` | Public | Bảng vinh danh |
| 2 | GET | `/api/donors/public/:id` | Public | Hồ sơ nhà tài trợ |
| 3 | GET | `/api/donors/my-stats` | Protect (4) | Thống kê của tôi |
| 4 | GET | `/api/donors/my-donations` | Protect (4) | Danh sách tài trợ của tôi |
| 5 | GET | `/api/donors/stats` | Protect (1,3) | Thống kê nhà tài trợ |
| 6 | GET | `/api/donors/` | Protect (1,3) | Danh sách nhà tài trợ |
| 7 | GET | `/api/donors/:id` | Protect (1,3) | Chi tiết nhà tài trợ |

### 7.14 Transactions — `/api/transactions` (12 endpoints)

| # | Method | Path | Middleware (Roles) | Mô tả |
|---|--------|------|-------------------|-------|
| 1 | GET | `/api/transactions/public` | Public | Giao dịch công khai |
| 2 | GET | `/api/transactions/public/summary` | Public | Tổng quan thu chi |
| 3 | GET | `/api/transactions/public/:id` | Public | Chi tiết GD công khai |
| 4 | GET | `/api/transactions/` | Protect (1,2,5) | Tất cả giao dịch |
| 5 | GET | `/api/transactions/summary` | Protect (1,2,5) | Tổng quan (auth) |
| 6 | GET | `/api/transactions/export` | Protect (1,2,5) | Xuất Excel |
| 7 | POST | `/api/transactions/chi-khac` | Protect (1,2) | Ghi chi khác |
| 8 | GET | `/api/transactions/by-application/:yeucauhotroId` | Protect (1,2,5) | GD theo đơn |
| 9 | GET | `/api/transactions/:id` | Protect (1,2,5) | Chi tiết |
| 10 | PATCH | `/api/transactions/:id/doi-soat` | Protect (1,2) | Đối soát |
| 11 | PATCH | `/api/transactions/:id/upload-proof` | Protect (1,2) | Upload minh chứng |
| 12 | DELETE | `/api/transactions/:id` | Protect (1) | Xóa GD (Admin) |

### 7.15 Bao Cao — `/api/bao-cao` (1 endpoint)

| # | Method | Path | Middleware (Roles) | Mô tả |
|---|--------|------|-------------------|-------|
| 1 | POST | `/api/bao-cao/xuat` | Protect | Xuất báo cáo (DOCX/XLSX) |

### 7.16 Statistics — `/api/statistics` (16 endpoints)

| # | Method | Path | Middleware (Roles) | Mô tả |
|---|--------|------|-------------------|-------|
| 1 | GET | `/api/statistics/public` | Public | Thống kê công khai |
| 2 | GET | `/api/statistics/fund-breakdown` | Public | Phân bổ quỹ |
| 3 | GET | `/api/statistics/impact` | Public | Thống kê tác động |
| 4 | GET | `/api/statistics/public/report` | Public | Thống kê báo cáo công khai |
| 5 | GET | `/api/statistics/available-years` | Protect (1,2,5) | Năm tài chính khả dụng |
| 6 | GET | `/api/statistics/ketoan/summary` | Protect (1,2,5) | Tổng quan kế toán |
| 7 | GET | `/api/statistics/ketoan/cashflow` | Protect (1,2,5) | Dòng tiền |
| 8 | GET | `/api/statistics/ketoan/transaction-status` | Protect (1,2,5) | Trạng thái GD |
| 9 | GET | `/api/statistics/ketoan/recent-transactions` | Protect (1,2,5) | GD gần đây |
| 10 | GET | `/api/statistics/ketoan/fund-health` | Protect (1,2,5) | Sức khỏe quỹ |
| 11 | GET | `/api/statistics/ketoan/pending-donations` | Protect (1,2,5) | Tài trợ chờ xử lý |
| 12 | GET | `/api/statistics/ketoan/report` | Protect (1,2,5) | Thống kê báo cáo |
| 13 | GET | `/api/statistics/yearly-report` | Protect (1,2,5) | Báo cáo năm (Điều 17.2, 18) |
| 14 | GET | `/api/statistics/applications/stats` | Protect (1,5) | Thống kê đơn |
| 15 | GET | `/api/statistics/admin/advanced` | Protect (1,5) | Thống kê nâng cao |
| 16 | GET | `/api/statistics/pending-count` | Protect (1,2,3,5) | Số chờ xử lý (badge) |

### 7.17 Du Toan — `/api/du-toan` (3 endpoints)

| # | Method | Path | Middleware (Roles) | Mô tả |
|---|--------|------|-------------------|-------|
| 1 | POST | `/api/du-toan/` | Protect (2) | Đề nghị dự toán |
| 2 | PUT | `/api/du-toan/:id` | Protect (1) | Duyệt dự toán |
| 3 | GET | `/api/du-toan/:namtaichinh` | Protect (1,2) | Xem dự toán theo năm |

### 7.18 System — `/api/vaitro`, `/api/nguoidung`, `/api/nhat-ky`, `/api/system/settings` (12 endpoints)

| # | Method | Path | Middleware (Roles) | Mô tả |
|---|--------|------|-------------------|-------|
| 1 | GET | `/api/vaitro/` | Protect (1,5) | Danh sách vai trò |
| 2 | PATCH | `/api/vaitro/:role_id` | Protect (1) | Cập nhật vai trò |
| 3 | GET | `/api/nguoidung/` | Protect (1,5) | Danh sách người dùng |
| 4 | GET | `/api/nhat-ky/stats` | Protect (1,5) | Thống kê nhật ký |
| 5 | GET | `/api/nhat-ky/export` | Protect (1) | Xuất nhật ký |
| 6 | GET | `/api/nhat-ky/:log_id` | Protect (1,5) | Chi tiết nhật ký |
| 7 | GET | `/api/nhat-ky/` | Protect (1,5) | Tất cả nhật ký |
| 8 | GET | `/api/system/settings/permissions` | Public | Quyền truy cập trang |
| 9 | PATCH | `/api/system/settings/permissions` | Protect (1) | Cập nhật quyền |
| 10 | GET | `/api/system/settings/public` | Public | Settings công khai |
| 11 | GET | `/api/system/settings/` | Protect (1,5) | Tất cả settings |
| 12 | PATCH | `/api/system/settings/` | Protect (1) | Cập nhật settings |

### 7.19 Chuc Vu — `/api/chuc-vu` (7 endpoints)

| # | Method | Path | Middleware (Roles) | Mô tả |
|---|--------|------|-------------------|-------|
| 1 | GET | `/api/chuc-vu/public` | Public | Vị trí công khai |
| 2 | GET | `/api/chuc-vu/` | Protect (1) | Tất cả vị trí |
| 3 | PUT | `/api/chuc-vu/reorder` | Protect (1) | Sắp xếp lại |
| 4 | GET | `/api/chuc-vu/:id` | Protect (1) | Chi tiết vị trí |
| 5 | POST | `/api/chuc-vu/` | Protect (1) | Tạo vị trí mới |
| 6 | PUT | `/api/chuc-vu/:id` | Protect (1) | Cập nhật vị trí |
| 7 | DELETE | `/api/chuc-vu/:id` | Protect (1) | Xóa vị trí (soft delete) |

### 7.20 News — `/api/news` (11 endpoints)

| # | Method | Path | Middleware (Roles) | Mô tả |
|---|--------|------|-------------------|-------|
| 1 | GET | `/api/news/landing` | Public | Tin tức landing page |
| 2 | GET | `/api/news/public` | Public | Danh sách tin công khai |
| 3 | GET | `/api/news/count-by-category` | Public | Đếm theo danh mục |
| 4 | GET | `/api/news/:id` | Public | Chi tiết tin |
| 5 | GET | `/api/news/` | Protect (1,3) | Quản lý tin |
| 6 | POST | `/api/news/` | Protect (1,3) | Tạo tin mới |
| 7 | PUT | `/api/news/:id` | Protect (1,3) | Cập nhật tin |
| 8 | GET | `/api/news/admin/:id` | Protect (1,3) | Chi tiết tin (admin) |
| 9 | DELETE | `/api/news/:id` | Protect (1) | Xóa tin |
| 10 | PUT | `/api/news/:id/status` | Protect (1,3) | Đổi trạng thái hiển thị |
| 11 | POST | `/api/news/fix-avatars` | Protect (1) | Fix avatar cho tin cũ |

### 7.21 Student Showcase — `/api/student-showcase` (7 endpoints)

| # | Method | Path | Middleware (Roles) | Mô tả |
|---|--------|------|-------------------|-------|
| 1 | GET | `/api/student-showcase/public` | Public | SV nổi bật công khai |
| 2 | GET | `/api/student-showcase/` | Protect (1,3) | Quản lý SV nổi bật |
| 3 | GET | `/api/student-showcase/:id` | Protect (1,3) | Chi tiết |
| 4 | POST | `/api/student-showcase/` | Protect (1,3) | Thêm mới |
| 5 | PUT | `/api/student-showcase/:id` | Protect (1,3) | Cập nhật |
| 6 | DELETE | `/api/student-showcase/:id` | Protect (1,3) | Xóa |
| 7 | PUT | `/api/student-showcase/:id/status` | Protect (1,3) | Đổi trạng thái |

### 7.22 Danh Gia — `/api/danhgia` (6 endpoints)

| # | Method | Path | Middleware (Roles) | Mô tả |
|---|--------|------|-------------------|-------|
| 1 | GET | `/api/danhgia/landing` | Public | Đánh giá landing |
| 2 | GET | `/api/danhgia/quan-ly` | Protect (1,3) | Quản lý đánh giá |
| 3 | GET | `/api/danhgia/` | Public | Đánh giá công khai |
| 4 | POST | `/api/danhgia/` | OptionalProtect | Gửi đánh giá |
| 5 | PATCH | `/api/danhgia/:id/trangthai` | Protect (1,3) | Đổi trạng thái |
| 6 | PATCH | `/api/danhgia/:id/noi-bat` | Protect (1,3) | Đổi nổi bật |

### 7.23 Guest — `/api/guest` (5 endpoints)

| # | Method | Path | Middleware | Mô tả |
|---|--------|------|-----------|-------|
| 1 | POST | `/api/guest/yeu-cau` | RateLimit | Nộp đơn khách |
| 2 | POST | `/api/guest/tai-tro` | RateLimit | Tài trợ khách |
| 3 | POST | `/api/guest/verify-otp` | Public | Xác thực OTP |
| 4 | POST | `/api/guest/resend-otp` | Public | Gửi lại OTP |
| 5 | GET | `/api/guest/track/:uuid` | Public | Theo dõi đơn |

### 7.24 Upload — `/api/upload` (8 endpoints)

| # | Method | Path | Middleware | Mô tả |
|---|--------|------|-----------|-------|
| 1 | POST | `/api/upload/` | Protect + Upload | Upload 1 file |
| 2 | POST | `/api/upload/public` | Upload | Upload công khai |
| 3 | POST | `/api/upload/multiple` | Protect + UploadMulti | Upload nhiều file (max 5) |
| 4 | POST | `/api/upload/avatar` | Protect + UploadAvatar | Upload avatar |
| 5 | POST | `/api/upload/fund` | Protect + UploadFund | Upload ảnh quỹ |
| 6 | POST | `/api/upload/student` | Protect + UploadStudent | Upload ảnh SV |
| 7 | POST | `/api/upload/news` | Protect + UploadNews | Upload ảnh tin |
| 8 | DELETE | `/api/upload/:filename` | Protect | Xóa file |

### 7.25 Thong Bao — `/api/thong-bao` (4 endpoints)

| # | Method | Path | Middleware (Roles) | Mô tả |
|---|--------|------|-------------------|-------|
| 1 | GET | `/api/thong-bao/unread-count` | Protect | So thong bao chua doc |
| 2 | GET | `/api/thong-bao/` | Protect | Danh sach thong bao |
| 3 | PUT | `/api/thong-bao/:id/doc` | Protect | Danh dau da doc |
| 4 | PUT | `/api/thong-bao/doc-tat-ca` | Protect | Danh dau tat ca da doc |

### 7.26 Cong No — `/api/cong-no` (9 endpoints)

| # | Method | Path | Middleware (Roles) | Mô tả |
|---|--------|------|-------------------|-------|
| 1 | GET | `/api/cong-no/tong-quan` | Protect (1,2,3,5) | Tong quan cong no |
| 2 | GET | `/api/cong-no/danh-sach` | Protect (1,2,3,5) | Danh sach hop dong |
| 3 | GET | `/api/cong-no/ky-tra-no/:hopdongvayvonId` | Protect (1,2,3,5) | Ky tra no theo hop dong |
| 4 | GET | `/api/cong-no/chi-tiet/:yeucauhotroId` | Protect (1,2,3,5) | Chi tiet cong no |
| 5 | PUT | `/api/cong-no/xac-nhan/:lichtranoId` | Protect (2) | Xac nhan minh chung |
| 6 | PUT | `/api/cong-no/tu-choi/:lichtranoId` | Protect (2) | Tu choi minh chung |
| 7 | POST | `/api/cong-no/nhac-no/:lichtranoId` | Protect (1,2,3) | Gui nhac no |
| 8 | GET | `/api/cong-no/nghiem-thu/tong-quan` | Protect (1,2,3,5) | Tong quan nghiem thu |
| 9 | GET | `/api/cong-no/nghiem-thu` | Protect (1,2,3,5) | Danh sach nghiem thu |

### 7.27 Lich Tra No — `/api/lich-tra-no` (3 endpoints)

| # | Method | Path | Middleware (Roles) | Mô tả |
|---|--------|------|-------------------|-------|
| 1 | GET | `/api/lich-tra-no/cua-toi` | Protect (4) | Lich tra no cua toi |
| 2 | POST | `/api/lich-tra-no/:lichtranoId/nop-minh-chung` | Protect (4) | Nop minh chung tra no |
| 3 | DELETE | `/api/lich-tra-no/:lichtranoId/huy-minh-chung` | Protect (4) | Huy minh chung |

### 7.28 Thu Hoi Von — `/api/thu-hoi` (8 endpoints)

| # | Method | Path | Middleware (Roles) | Mô tả |
|---|--------|------|-------------------|-------|
| 1 | POST | `/api/thu-hoi/:id/nop-tien` | Protect (4) | SV nộp tiền thu hồi |
| 2 | GET | `/api/thu-hoi/danh-sach` | Protect (2) | Danh sách cho kế toán |
| 3 | GET | `/api/thu-hoi/by-yeucau/:yeucauhotroId` | Protect (1,2) | Chi tiết theo yêu cầu |
| 4 | GET | `/api/thu-hoi/:id` | Protect (2) | Chi tiết điều khoản thu hồi |
| 5 | GET | `/api/thu-hoi/:id/lich-su` | Protect (2,4) | Lịch sử nộp tiền |
| 6 | PUT | `/api/thu-hoi/:lanNopId/xac-nhan` | Protect (2) | Xác nhận nộp tiền |
| 7 | PUT | `/api/thu-hoi/:lanNopId/tu-choi` | Protect (2) | Từ chối nộp tiền |
| 8 | DELETE | `/api/thu-hoi/:lanNopId/huy` | Protect (4) | Hủy lần nộp tiền |

### 7.29 Tổng Hợp

| Nhóm | Số endpoint |
|------|------------|
| Auth | 9 |
| Users | 9 |
| Roles | 4 |
| Applications | 10 |
| Phe Duyet | 4 |
| Nghiem Thu | 6 |
| Funds | 8 |
| Loai Quy | 3 |
| Disbursement Rounds | 4 |
| Phan Bo Ngan Sach | 6 |
| Bank Accounts | 9 |
| Donations | 10 |
| Donors | 7 |
| Transactions | 12 |
| Bao Cao | 1 |
| Statistics | 16 |
| Du Toan | 6 |
| Cong No | 9 |
| Lich Tra No | 3 |
| Thong Bao | 4 |
| Thu Hoi | 8 |
| System (vaitro/nguoidung/nhatky/settings) | 12 |
| Chuc Vu | 7 |
| News | 11 |
| Student Showcase | 7 |
| Danh Gia | 6 |
| Guest | 5 |
| Upload | 8 |
| **TỔNG** | **204** |

---

## 8. DANH SÁCH TẤT CẢ FRONTEND ROUTES (80 routes)

### 8.1 Public Routes (18 routes)

| # | Path | Component | Ghi chú |
|---|------|-----------|---------|
| 1 | `/` | LandingPage | Trang chủ |
| 2 | `/funds` | FundsPage | Danh sách quỹ |
| 3 | `/funds/:id` | FundDetailPage | Chi tiết quỹ |
| 4 | `/donors` | DonorsPage | Nhà tài trợ |
| 5 | `/honors` | DonorsPage | Alias của /donors |
| 6 | `/guidelines` | GuidelinesPage | Hướng dẫn |
| 7 | `/profile` | ProfilePage | Hồ sơ |
| 8 | `/apply` | ApplyPage | Nộp đơn |
| 9 | `/track/:uuid` | TrackPage | Theo dõi đơn |
| 10 | `/track` | TrackPage | Theo dõi đơn |
| 11 | `/news/:id` | NewsDetailPage | Chi tiết tin |
| 12 | `/news` | NewsPage | Danh sách tin |
| 13 | `/testimonials` | TestimonialsPage | Cảm nhận |
| 14 | `/lich-su-giao-dich` | PublicLichSuGiaoDichPage | Lịch sử GD |
| 15 | `/thong-ke-cong-khai` | PublicThongKeThuChiPage | Thống kê công khai |
| 16 | `/khoan-tai-tro-cong-khai` | PublicKhoanTaiTroPage | Khoản tài trợ công khai |
| 17 | `/ve-quy-phat-trien` | AboutFundPage | Về quỹ |
| 18 | `/alumni` | AlumniPage | Cựu SV |

### 8.2 Auth Routes (2 routes)

| # | Path | Component | Ghi chú |
|---|------|-----------|---------|
| 17 | `/login` | LoginPage | Đăng nhập (redirect nếu đã login) |
| 18 | `/register` | RegisterPage | Đăng ký (redirect nếu đã login) |

### 8.3 OAuth (1 route)

| # | Path | Component | Ghi chú |
|---|------|-----------|---------|
| 19 | `/auth/google/callback` | GoogleAuthCallbackPage | Google OAuth callback |

### 8.4 Student Dashboard & Routes (2 routes)

| # | Path | Component | Roles | Ghi chú |
|---|------|-----------|-------|---------|
| 20 | `/dashboard` | DashboardPage | All logged-in | Dashboard theo role |
| 21 | `/nghia-vu-hoan-tra` | NghiaVuHoanTraPage | Role 4 | Nghĩa vụ hoàn trả |

### 8.5 Admin Routes — Role 1 only (22 routes)

| # | Path | Component | Sidebar Label |
|---|------|-----------|--------------|
| 22 | `/admin/dashboard` | AdminDashboard | Tổng quan |
| 23 | `/admin/users` | CanBoUserManagementPage(isAdmin) | Quản lý người dùng |
| 24 | `/admin/nhan-su` | CanBoUserManagementPage(isAdmin, tab=chuc_vu) | Nhân sự |
| 25 | `/admin/roles` | HiThongPhanQuyenPage | Hệ thống & Phân quyền |
| 26 | `/admin/nhat-ky` | NhatKyPage | Nhật ký hệ thống |
| 27 | `/admin/xet-duyet` | XetDuyetPage(isAdmin) | Xét duyệt hồ sơ |
| 28 | `/admin/phe-duyet` | PheDuyetPage | Lịch sử phê duyệt |
| 29 | `/admin/quy` | CanBoQuyListPage(isAdmin) | Danh sách Quỹ |
| 30 | `/admin/quy/tao` | CanBoTaoQuyPage | (sub-route) |
| 31 | `/admin/quy/sua/:id` | CanBoTaoQuyPage | (sub-route) |
| 32 | `/admin/phan-bo` | PhanBoPage | Trích lập Ngân sách |
| 33 | `/admin/du-toan` | DuToanNamPage | Dự toán hàng năm |
| 34 | `/admin/nha-tai-tro` | CanBoNhaTaiTroPage(isAdmin) | Nhà tài trợ |
| 35 | `/admin/khoan-tai-tro` | KeToanKhoanTaiTroPage | Khoản tài trợ |
| 36 | `/admin/giao-dich` | KeToanLichSuGiaoDichPage | Lịch sử giao dịch |
| 37 | `/admin/chung-tu` | DoiSoatChungTuPage | Đối soát chứng từ |
| 38 | `/admin/sinh-vien-noi-bat` | StudentShowcasePage | Sinh viên nổi bật |
| 39 | `/admin/danhgia` | DanhGiaPage | Cảm nhận sinh viên |
| 40 | `/admin/tin-tuc` | Placeholder | Tin tức & Sự kiện |
| 41 | `/admin/tintuc/tao` | TaoTinTucPage | Tạo bài viết |
| 42 | `/admin/tintuc/chinh-sua/:id` | TaoTinTucPage | (sub-route) |
| 43 | `/admin/bao-cao` | AdminBaoCaoPage | Thống kê & Báo cáo |

### 8.6 Ke Toan Routes — Roles 1,2 (10 routes)

| # | Path | Component | Sidebar Label |
|---|------|-----------|--------------|
| 44 | `/ke-toan/dashboard` | KeToanDashboard | Tổng quan |
| 45 | `/ke-toan/xet-duyet` | XetDuyetPage(userRole=2) | Giải ngân hồ sơ |
| 46 | `/ke-toan/giai-ngan` | → redirect `/ke-toan/xet-duyet` | (redirect) |
| 47 | `/ke-toan/giai-ngan/:request_id` | GiaiNganDetailPage | Chi tiết giải ngân |
| 48 | `/ke-toan/giao-dich` | KeToanLichSuGiaoDichPage | Lịch sử giao dịch |
| 49 | `/ke-toan/khoan-tai-tro` | KeToanKhoanTaiTroPage | Khoản tài trợ |
| 50 | `/ke-toan/bao-cao` | ThongKeThuChiPage | Thống kê thu chi |
| 51 | `/ke-toan/chung-tu` | DoiSoatChungTuPage | Đối soát chứng từ |
| 52 | `/ke-toan/phan-bo` | PhanBoPage | Trích lập Ngân sách |
| 53 | `/ke-toan/du-toan` | DuToanNamPage | Dự toán hàng năm |

### 8.7 Can Bo Quy Routes — Roles 1,3 (16 routes)

| # | Path | Component | Sidebar Label |
|---|------|-----------|--------------|
| 54 | `/can-bo/dashboard` | CanBoDashboard | Tổng quan |
| 55 | `/can-bo/xet-duyet` | XetDuyetPage(userRole=3) | Xét duyệt hồ sơ |
| 56 | `/can-bo/quy` | CanBoQuyListPage | Danh sách Quỹ |
| 57 | `/can-bo/quy/tao` | CanBoTaoQuyPage | (sub-route) |
| 58 | `/can-bo/quy/sua/:id` | CanBoTaoQuyPage | (sub-route) |
| 59 | `/can-bo/phan-bo` | PhanBoPage | Trích lập Ngân sách |
| 60 | `/can-bo/du-toan` | DuToanNamPage | Dự toán hàng năm |
| 61 | `/can-bo/nha-tai-tro` | CanBoNhaTaiTroPage | Nhà tài trợ |
| 62 | `/can-bo/users` | CanBoUserManagementPage | Quản lý người dùng |
| 63 | `/can-bo/sinh-vien-noi-bat` | StudentShowcasePage | Sinh viên nổi bật |
| 64 | `/can-bo/danhgia` | DanhGiaPage | Cảm nhận sinh viên |
| 65 | `/can-bo/tin-tuc` | Placeholder | Tin tức & Sự kiện |
| 66 | `/can-bo/tintuc/tao` | TaoTinTucPage | Tạo bài viết |
| 67 | `/can-bo/tintuc/chinh-sua/:id` | TaoTinTucPage | (sub-route) |
| 68 | `/can-bo/bao-cao` | CanBoBaoCaoPage | Thống kê & Báo cáo |

### 8.8 Xet Duyet Detail — Roles 1,2,3 (1 route)

| # | Path | Component | Roles | Ghi chú |
|---|------|-----------|-------|---------|
| 69 | `/xet-duyet/:request_id` | XetDuyetDetail | 1,2,3 | Standalone, no sidebar |

### 8.9 Ban Kiem Soat Routes — Role 5 (6 routes)

| # | Path | Component | Sidebar Label |
|---|------|-----------|--------------|
| 70 | `/kiem-soat/dashboard` | AdminDashboard | Tổng quan |
| 71 | `/kiem-soat/quy` | CanBoQuyListPage | Danh sách Quỹ |
| 72 | `/kiem-soat/phe-duyet` | PheDuyetPage | Phê duyệt |
| 73 | `/kiem-soat/khoan-tai-tro` | KeToanKhoanTaiTroPage | Khoản tài trợ |
| 74 | `/kiem-soat/giao-dich` | KeToanLichSuGiaoDichPage | Giao dịch |
| 75 | `/kiem-soat/bao-cao` | AdminBaoCaoPage | Báo cáo |

### 8.10 Shared Routes — Roles 1,2,3,5 (3 routes)

| # | Path | Component | Ghi chú |
|---|------|-----------|---------|
| 76 | `/giam-sat` | GiamSatNghiemThuCongNoPage | Giám sát nghiệm thu & công nợ |
| 77 | `/giam-sat/nghiem-thu/:yeucauhotroId` | NghiemThuDetailPage | Chi tiết nghiệm thu |
| 78 | `/giam-sat/cong-no/:yeucauhotroId` | ContractDetailPage | Chi tiết công nợ |

### 8.11 Wildcard

| Path | Behavior |
|------|----------|
| `*` | Redirect về `/` |

---

## 9. TẤT CẢ GIÁ TRỊ ENUM / CHO PHÉP (38 cột)

### 9.1 yeucauhotro

| Cột | Giá trị cho phép |
|-----|-----------------|
| `trangthai` | `Cho duyet cap 1` (DEFAULT), `Da duyet cap 1`, `Tu choi cap 1`, `Cho duyet cap 2`, `Da duyet cap 2`, `Tu choi cap 2`, `Cho duyet cap 3`, `Da duyet cap 3`, `Tu choi cap 3`, `Cho giai ngan`, `Da giai ngan`, `Tu choi`, `Dang xu ly`, `Cho nghiem thu`, `Da nghiem thu`, `Nghiem thu khong dat`, `Cho giai ngan dot 1`, `Da giai ngan dot 1`, `Cho nghiem thu dot 1`, `Da nghiem thu dot 1`, `Cho giai ngan dot 2`, `Dang thu hoi no`, `Hoan thanh` |
| `loaihotro` | `Tai tro khong hoan lai` (DEFAULT), `Tai tro co thu hoi`, `Cho vay` |

### 9.2 nguoidung

| Cột | Giá trị cho phép |
|-----|-----------------|
| `trangthai` | `Hoat dong` (DEFAULT), `Khoa`, `Cho duyet` |
| `loaitaikhoan` | `Sinh vien`, `Nha tai tro`, `Can bo`, `Nha khoa hoc` |
| `gioi_tinh` | `Nam`, `Nu`, `Khac` |
| `tinhtrangcongtac` | `Dang cong tac` (DEFAULT), `Da nghi huu` |

### 9.3 taikhoannganhang

| Cột | Giá trị cho phép |
|-----|-----------------|
| `loaitaikhoan` | `Nha truong`, `Sinh vien` (DEFAULT) |
| `trangthai` | `Hoat dong` (DEFAULT), `Khoa` |

### 9.4 giaodich

| Cột | Giá trị cho phép |
|-----|-----------------|
| `loaigiaodich` | `Thu`, `Chi` (DEFAULT), `Thu hoi no` |
| `hangmucchi` | `Tai_tro_cho_vay`, `Tham_dinh_du_an`, `Bo_may_hoat_dong`, `Nhiem_vu_khac`, NULL |
| `trangthai` | `Thanh cong`, `That bai`, `Dang xu ly` (DEFAULT) |
| `hinhthuc` | `Tien mat`, `Chuyen khoan` |
| `doisoattrangthai` | `Chua_doi_soat`, `Da_doi_soat`, `Bat_thuong` |

### 9.5 quy

| Cột | Giá trị cho phép |
|-----|-----------------|
| `trangthai` | `Dang hoat dong` (DEFAULT), `Tam dung`, `Da dong` |
| `loaidieuhanh` | `Tap trung - Be chung` (DEFAULT), `Tap trung - Muc chi` |

### 9.6 khoantaitro

| Cột | Giá trị cho phép |
|-----|-----------------|
| `trangthai` | `Cho duyet` (DEFAULT), `Da duyet`, `Da nhan`, `Tu choi` |
| `hinhthuc` | `Tien mat`, `Chuyen khoan`, `Khac` |

### 9.7 pheduyet

| Cột | Giá trị cho phép |
|-----|-----------------|
| `ketqua` | `Cho duyet`, `Duyet`, `Da duyet`, `Tu choi` |

### 9.8 nghiemthu

| Cột | Giá trị cho phép |
|-----|-----------------|
| `ketqua` | `Cho danh gia` (DEFAULT), `Dat`, `Dat co dieu chinh`, `Khong dat` |
| `loaikiemtra` | `Kiem tra tien do`, `Nghiem thu cuoi cung` |

### 9.9 dotgiaingan

| Cột | Giá trị cho phép |
|-----|-----------------|
| `trangthai` | `chuatoi`, `dangchodutien`, `hoanthanh` |

### 9.10 hopdongvayvon

| Cột | Giá trị cho phép |
|-----|-----------------|
| `trangthai` | `Dang thuc hien` (DEFAULT), `Da tat toan`, `Qua han` |

### 9.11 lichtrano

| Cột | Giá trị cho phép |
|-----|-----------------|
| `trangthai` | `Chua den han` (DEFAULT), `Da tra`, `Qua han`, `Tra mot phan` |
| `trangthaixacnhan` | `Cho xac nhan` (DEFAULT), `Da xac nhan`, `Bi tu choi` |

### 9.12 vaitro

| Cột | Giá trị cho phép |
|-----|-----------------|
| `tenvaitro` | `Admin`, `Ke toan`, `Can bo Quy`, `Nguoi dung`, `Ban Kiem Soat` |

### 9.13 nhataitro

| Cột | Giá trị cho phép |
|-----|-----------------|
| `loai_nha_tai_tro` | `Ca nhan`, `To chuc`, `Doanh nghiep`, `Doi tac` |
| `trangthai` | `Hoat dong` (DEFAULT), `Ngung hoat dong` |

### 9.14 chucvuquy

| Cột | Giá trị cho phép |
|-----|-----------------|
| `trangthai` | `Dang nhiem`, `Het nhiem ky` |
| `nhom` | `Hoi dong quy`, `Ban dieu hanh`, `Ban kiem soat`, `Van phong thuong truc` |

### 9.15 phanbongansach

| Cột | Giá trị cho phép |
|-----|-----------------|
| `trangthai` | `Cho duyet` (DEFAULT), `Da duyet`, `Tu choi`, `Da thu hoi` |

### 9.16 dutoanhangnam

| Cột | Giá trị cho phép |
|-----|-----------------|
| `trangthai` | `Cho duyet` (DEFAULT), `Da duyet`, `Tu choi` |

### 9.17 thong_bao

| Cột | Giá trị cho phép |
|-----|-----------------|
| `loaithongbao` | `thanhtoan`, `nhacno`, `hethong` |

### 9.18 tintuc

| Cột | Giá trị cho phép |
|-----|-----------------|
| `trangthai` | `Ban nhap` (DEFAULT) |
| `phanloai` | `Tin moi` (DEFAULT), `Tin noi bat`, `baocaohoatdong`, `chuongtrinh`, `cuusinhvien` |

### 9.18 danhgia

| Cột | Giá trị cho phép |
|-----|-----------------|
| `trangthai` | `Cho duyet` (DEFAULT), `Da duyet`, `Tu choi` |

### 9.19 sinhviennoibat / sinh_vien_noi_bat

| Cột | Giá trị cho phép |
|-----|-----------------|
| `trang_thai` | `Hien thi` (DEFAULT), `An` |

### 9.20 donvihoc

| Cột | Giá trị cho phép |
|-----|-----------------|
| `trangthai` | `Hoat dong` (DEFAULT), `Khong hoat dong` |

### 9.21 loaiquy

| Cột | Giá trị cho phép |
|-----|-----------------|
| `maloai` | `PHAT_TRIEN`, `HOC_BONG`, `NGHIEN_CUU`, `VAY_VON`, `KHOI_NGHIEP`, `HOAT_DONG_PHONG_TRAO`, `XA_HOI`, `CO_SO_VAT_CHAT`, `DAO_TAO` |

### 9.22 Guest Tracking

| Bảng | Cột | Giá trị cho phép |
|------|-----|-----------------|
| `guest_tracking` | `loai` | `yeucauhotro`, `khoantaitro` |
| `guest_tracking` | `trangthai` | `CHO_XAC_MINH` (DEFAULT), `DA_CHUYEN`, `HET_HAN` |

---

## 10. FORM VALIDATIONS

### 10.1 Đăng ký tài khoản

| Field | Rules |
|-------|-------|
| `hoTen` | Required, 2-100 chars |
| `email` | Required, valid email format |
| `matKhau` | Required, min 6 chars |
| `loaiTaiKhoan` | Required, one of: `sinhvien`, `nhataitro`, `canbo` |
| `maSoDinhDanh` | Required for `sinhvien` |
| `soDienThoai` | Optional, valid phone |

### 10.2 Đăng nhập

| Field | Rules |
|-------|-------|
| `email` | Required |
| `matKhau` | Required |

### 10.3 Nộp đơn hỗ trợ (logged-in)

| Field | Rules |
|-------|-------|
| `tieude` | Required, 10-200 chars |
| `mota` | Required, >= 50 chars |
| `soTienYeuCau` | Required, > 0, <= `sotienhotrotoida` của quỹ (NULL = không giới hạn) |
| `quy_id` | Required, must exist |
| `loaihotro` | Required, one of: `Tai tro khong hoan lai`, `Tai tro co thu hoi`, `Cho vay` |
| `laidetac` | Optional, 0 or 1 |

### 10.4 Nộp đơn khách (Guest)

| Field | Rules |
|-------|-------|
| `guestHoTen` | Required |
| `guestEmail` | Required, valid email |
| `tieude` | Required, 10-200 chars |
| `mota` | Required, >= 50 chars |
| `soTienYeuCau` | Required, > 0 |
| `quy_id` | Required |

### 10.5 Duyệt cấp 1 (Can Bo Quy)

| Field | Rules |
|-------|-------|
| `trangthai` | Must be `Cho duyet cap 1` |
| `ghiChu` | Optional |

### 10.6 Duyệt cấp 2 (Admin)

| Field | Rules |
|-------|-------|
| `trangthai` | Must be `Cho duyet cap 2` |
| `loaihotro` | If `Tai tro co thu hoi`: required `mucthuhoi > 0`, `thoiHanHoanTra`, `soQuyetDinh` |
| `loaihotro` | If `Cho vay`: required `laisuat > 0`, `laisuat <= 70%`, `thoiHanVay`, `mucLaiVay`, `tyLeLaiVay` |

### 10.7 Giải ngân (Ke Toan)

| Field | Rules |
|-------|-------|
| `trangthai` | Must be `Cho duyet cap 3` hoặc `Cho giai ngan` |
| `quy_id` | Fund must have sufficient balance |

### 10.8 Ghi nhận tài trợ (Staff)

| Field | Rules |
|-------|-------|
| `nhataitro_id` | Required |
| `quy_id` | Required |
| `soTien` | Required, > 0 |
| `hinhthuc` | One of: `Tien mat`, `Chuyen khoan`, `Khac` |

### 10.9 Phân bổ ngân sách

| Field | Rules |
|-------|-------|
| `quy_nguon` | Required, must exist |
| `quy_dich` | Required, must exist |
| `sotiendutoan` | Required, > 0 |
| `lydo` | Required |

### 10.10 Tạo quỹ

| Field | Rules |
|-------|-------|
| `tenquy` | Required |
| `maloai` | Required |
| `sotienhotrotoida` | Optional (NULL = no cap) |
| `mota` | Optional |

### 10.11 Tạo vị trí tổ chức (Chuc Vu)

| Field | Rules |
|-------|-------|
| `tenchucvu` | Required |
| `nhom` | One of: `Hoi dong quy`, `Ban dieu hanh`, `Ban kiem soat`, `Van phong thuong truc` |
| `nguoidung_id` | Required |

### 10.12 Tạo tin tức

| Field | Rules |
|-------|-------|
| `tieude` | Required |
| `noidung` | Required |
| `phanloai` | One of: `Tin moi`, `Tin noi bat`, `baocaohoatdong`, `chuongtrinh`, `cuusinhvien` |

### 10.13 Phản hồi (Danh Gia)

| Field | Rules |
|-------|-------|
| `noiDung` | Required |
| `soSao` | 1-5 |
| `hoTen` | Optional (if not logged in) |

### 10.14 Upload File

| Context | Rules |
|---------|-------|
| General | Max 10MB, types: jpg, jpeg, png, pdf |
| Avatar | Max 5MB, types: jpg, jpeg, png |
| Fund cover | Max 5MB, types: jpg, jpeg, png |
| Student showcase | Max 5MB, types: jpg, jpeg, png |
| News | Max 5MB, types: jpg, jpeg, png |
| Multiple | Max 5 files, each <= 10MB |

### 10.15 HTTP Error Responses

| Status | Meaning | Response Format |
|--------|---------|----------------|
| 400 | Bad Request / Validation Error | `{ success: false, message: "Lỗi validation..." }` |
| 401 | Unauthorized (no token) | `{ success: false, message: "Không có token..." }` |
| 403 | Forbidden (wrong role) | `{ success: false, message: "Không có quyền..." }` |
| 404 | Not Found | `{ success: false, message: "Không tìm thấy..." }` |
| 409 | Conflict (duplicate) | `{ success: false, message: "Đã tồn tại..." }` |
| 429 | Rate Limited | `{ success: false, message: "Quá nhiều yêu cầu..." }` |
| 500 | Server Error | `{ success: false, message: "Lỗi server...", error: "..." }` |

---

## 11. MA TRẬN PHÂN QUYỀN CHI TIẾT

### 11.1 Quyền Truy Cập Endpoint (GET Routes)

| Endpoint Nhóm | Admin | KeToan | CanBo | SinhVien | BKS |
|---------------|:-----:|:------:|:-----:|:--------:|:---:|
| `/api/funds` | ✅ | ✅ | ✅ | ❌ | ✅ |
| `/api/applications` | ✅ | ✅ | ✅ | ❌ | ✅ |
| `/api/transactions` | ✅ | ✅ | ❌ | ❌ | ✅ |
| `/api/donations` | ✅ | ✅ | ✅ | ❌ | ✅ |
| `/api/donors` | ✅ | ❌ | ✅ | ❌ | ❌ |
| `/api/statistics/*` | ✅ | ✅ | ❌ | ❌ | ✅ |
| `/api/pheduyet` | ✅ | ❌ | ❌ | ❌ | ✅ |
| `/api/vaitro`, `/api/nguoidung` | ✅ | ❌ | ❌ | ❌ | ✅ |
| `/api/chuc-vu` | ✅ (CRUD) | ❌ | ❌ | ❌ | ❌ |
| `/api/nhat-ky` | ✅ | ❌ | ❌ | ❌ | ✅ |
| `/api/roles` | ✅ | ❌ | ❌ | ❌ | ❌ |
| `/api/bank-accounts` | ✅ | ❌ | ✅ | ❌ | ❌ |
| `/api/news` | ✅ | ❌ | ✅ | ❌ | ❌ |

### 11.2 Quyền Thao Tác (POST/PUT/DELETE Routes)

| Endpoint Nhóm | Admin | KeToan | CanBo | SinhVien | BKS |
|---------------|:-----:|:------:|:-----:|:--------:|:---:|
| Tạo quỹ | ✅ | ❌ | ✅ | ❌ | ❌ |
| Sửa quỹ | ✅ | ❌ | ✅ | ❌ | ❌ |
| Duyệt cấp 1 | ❌ | ❌ | ✅ | ❌ | ❌ |
| Duyệt cấp 2 | ✅ | ❌ | ❌ | ❌ | ❌ |
| Giải ngân | ❌ | ✅ | ❌ | ❌ | ❌ |
| Tạo khoản TT | ✅ | ❌ | ✅ | ❌ | ❌ |
| Duyệt khoản TT | ✅ | ✅ | ❌ | ❌ | ❌ |
| Tạo người dùng | ✅ | ❌ | ❌ | ❌ | ❌ |
| Phân bổ NS | ❌ | ❌ | ✅ | ❌ | ❌ |
| Duyệt phân bổ | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## 12. CẤU HÌNH HỆ THỐNG

### 12.1 Bảng `system_settings.json`

| Field | Mô Tả | Giá Trị Mặc Định |
|-------|-------|------------------|
| `tenTruongHoc` | Tên trường | Đại học Trà Vinh |
| `tenQuy` | Tên quỹ | Quỹ Phát triển DHTV |
| `emailTruong` | Email liên hệ | — |
| `soDienThoai` | Số điện thoại | — |
| `diaChiTruong` | Địa chỉ | — |
| `laisuatnganhangthamchieu` | Lãi suất tham chiếu (%) | Dùng cho ràng buộc điều khoản thu hồi |
| `maintenanceMode` | Chế độ bảo trì | false |
| `uploadLimits` | Giới hạn upload | 5MB, 5 files, PDF/JPG/PNG/DOC |
| Landing page content | Nội dung trang chủ | Hero, quy trình, nhà tài trợ, AI, cảm nhận, tiến độ, footer |

### 12.2 Bảng `page_permissions.json`

- **26 trang** với phân quyền theo vai trò (admin, canbo, ketoan, sinhvien, nhataitro)
- CRUD qua `PATCH /api/system/permissions`
- Frontend đọc và lọc menu sidebar theo quyền
- Ví dụ: trang "Quản lý nhân sự" (`nhan_su`) chỉ admin mới thấy

---

## 13. ĐIỀU KIỆN KIỂM TRA QUAN TRỌNG

### 13.1 Khi Tạo Đơn Đề Nghị
- `soTienYeuCau > 0` và `≤ 50,000,000 VND`
- `tieuDe` độ dài 10-200 ký tự
- `moTa` tối thiểu 50 ký tự
- File đính kèm: chỉ PDF/JPG/PNG
- Quỹ đích phải tồn tại và đang hoạt động (`trangthai = 'Dang hoat dong'`)
- Không thể nộp đơn vào quỹ cha (`Tap trung - Be chung`)
- Số dư quỹ ≥ số tiền đề nghị

### 13.2 Khi Duyệt Cấp 2 (Loại 'Tai tro co thu hoi')
- `mucthuhoi > 0`
- `laisuat ≤ laisuatnganhangthamchieu` trong `system_settings.json`
- `tongkinhphidudan > 0`
- `mucthuhoi ≤ 30% × tongkinhphidudan` (ràng buộc 30%)

### 13.3 Khi Giải Ngân
- Levels 1 & 2 phải đã duyệt (`Da duyet`)
- Level 3 đang ở trạng thái `Cho duyet cap 3` hoặc `Cho giai ngan` (retry)
- Số dư quỹ phải đủ (nếu không → chuyển sang `Cho giai ngan`)

### 13.4 Khi Tạo Giao Dịch 'Chi Khac'
- `hangmucchi` phải là: `Tham_dinh_du_an`, `Bo_may_hoat_dong`, hoặc `Nhiem_vu_khac`
- Nếu `Bo_may_hoat_dong`: phải có `dutoanhangnam` đã duyệt, tổng chi tích lũy ≤ số tiền duyệt

---

## 14. CÁC TÍNH NĂNG ĐÃ HOÀN THÀNH

### 14.1 Mở Rộng Loại Hình Đối Tượng Nhận Hỗ Trợ (Beneficiary Expansion)

**Mục tiêu:** Mở rộng hệ thống từ chỉ phục vụ sinh viên sang phục vụ nhiều đối tượng: sinh viên, nhà tài trợ, cán bộ trường, nhà khoa học.

**Backend Sprint 1 (Hoàn thành):**
- Mở rộng `nguoidung.loaitaikhoan` enum từ 2 giá trị (`Sinh vien`, `Nha tai tro`) → 4: `Sinh vien`, `Nha tai tro`, `Can bo`, `Nha khoa hoc`
- Thêm `tinhtrangcongtac` (cho `Can bo`): `Dang cong tac`, `Da nghi huu`
- Thêm `danhnghia` trên `yeucauhotro`: `Ca nhan`, `Tap the`, `Don vi` — xác định đối tượng nhận là cá nhân/tổ chức
- Thêm `tendaidien` trên `yeucauhotro`: tên đại diện khi `danhnghia != Ca nhan`
- Mapping helpers `toDbAccountType`/`fromDbAccountType` ở UserModel, NguoiDungModel, GuestModel
- Cập nhật whitelist role trong userController, authController, pheDuyetController

**Frontend Sprint 2-3 (Đã thực hiện):**
- ~~Tạo `beneficiaryTypes.js` registry~~
- ~~Cập nhật `RegisterForm` với tabs cho từng loại~~
- ~~Thêm bước `danhNghia` vào `ApplyPage`~~
- ~~Cập nhật `ProfilePage` với component map theo loại~~
- ~~Generalize labels "sinh viên" → "người nộp đơn" trong ~14 files~~

### 14.2 Chức Vụ Tổ Chức & Ban Kiểm Soát

**Mục tiêu:** Xây dựng cơ chế giám sát độc lập (Ban Kiểm soát) theo Điều 8 Điều lệ, đồng thời quản lý vị trí tổ chức của quỹ.

**Database:**
- Tạo bảng `chucvuquy` với 4 nhóm: Hội đồng Quỹ, Ban Điều hành, Ban Kiểm soát, Văn phòng thường trực
- Thêm `bankiemsoat` (role 5) vào `vaitro`

**Backend:**
- CRUD cho `chucvuquy` qua `ChucVuModel` + `chucVuController`
- Role 5 trên tất cả GET routes (statistics, applications, transactions, donations, pheduyet, nhat-ky)
- `page_permissions.json` có quyền `nhan_su` cho Admin

**Frontend:**
- `ChucVuCard` component hiển thị vị trí tổ chức
- `NhanSuSection` trong UserManagementPage CRUD nhân sự
- UserManagementPage có tab chính "Quản lý người dùng" / "Chức vụ tổ chức"
- `AboutFundPage` tab "Nhân sự" fetch dữ liệu từ API
- Route `/admin/nhan-su`

### 14.3 Báo Cáo Năm Tài Chính (D3)

**Mục tiêu:** Hỗ trợ lọc dữ liệu theo năm tài chính để tạo báo cáo chính xác theo Điều 17.2, 18 Điều lệ.

- `getAvailableYears` endpoint trả về danh sách năm có dữ liệu
- `YearFilter` component tích hợp vào AdminDashboard, ThongKeThuChiPage, LichSuGiaoDichPage, BaoCaoPage
- Năm tài chính = năm dương lịch (01/01 → 31/12)
- `nam` param null → không lọc, trả toàn bộ dữ liệu

### 14.4 Tính Năng Nổi Bật Khác

| # | Tính Năng | Mô Tả |
|---|-----------|-------|
| 1 | **Phê duyệt 3 cấp** | Luồng phê duyệt chặt chẽ: Cấp 1 → Cấp 2 → Cấp 3 → Giải ngân. Lưu lịch sử đầy đủ (người duyệt, thời gian, kết quả, ghi chú/lý do). |
| 2 | **Quản lý số dư thực tế** | Tính toán: Số dư khả dụng = Số dư hiện tại - Tổng tiền đơn "Chờ giải ngân". Tránh duyệt quá số dư thực tế của quỹ. |
| 3 | **Trang Chi Tiết Quỹ Công Khai** | Route `/funds/:id` hiển thị đầy đủ thông tin quỹ, tiến trình gây quỹ, điều kiện xét duyệt, thời gian hoạt động. Có CTA "Nộp đơn ngay" và "Đóng góp ngay" theo trạng thái quỹ. |
| 4 | **Tự Động Tạo Nhà Tài Trợ** | Khi đăng ký tài khoản loại "Nhà tài trợ" → tự động tạo hồ sơ trong bảng `nhataitro`. Phân luồng rõ ràng: Sinh viên vs Nhà tài trợ. |
| 5 | **Quản Lý Trạng Thái Quỹ** | 3 trạng thái: **Đang hoạt động** / **Tạm dừng** / **Đã đóng**. Tự động lọc quỹ trên trang công khai theo trạng thái. Quỹ "Đã đóng" được bảo vệ để tránh thay đổi dữ liệu sai nghiệp vụ. |
| 6 | **Tin Tức Động: Tin Mới & Tin Nổi Bật** | Cột `phanloai` trong bảng `tintuc` tách `Tin moi` và `Tin noi bat`. Landing Page có section Tin nổi bật riêng. |
| 7 | **Cảm Nhận Sinh Viên / Testimonials** | Người dùng hoặc khách có thể gửi cảm nhận. Admin/Cán bộ kiểm duyệt trước khi hiển thị công khai. Landing Page hiển thị carousel cảm nhận nổi bật. |
| 8 | **Bảng Vinh Danh/Tri Ân Nhà Tài Trợ** | Hiển thị logo/avatar nhà tài trợ trên Landing Page và trang đối tác. Logo fallback từ `nguoidung.avatar`. |
| 9 | **Sinh Viên Nổi Bật** | Quản lý sinh viên nổi bật từ trang Admin/Cán bộ. Lấy avatar từ bảng `nguoidung` khi sinh viên được duyệt qua cấp. Landing Page hiển thị dữ liệu thật. |
| 10 | **Cài Đặt Hệ Thống Tập Trung** | Tab Cài đặt quản lý tên website, thông tin footer, email, hotline, địa chỉ, giờ làm việc, mạng xã hội. Quản lý tài khoản ngân hàng nhận tài trợ mặc định. |
| 11 | **Xuất Báo Cáo Tự Động** | Xuất Word (báo cáo quỹ, danh sách tài trợ, danh sách thụ hưởng) và Excel (thu chi tổng hợp, lịch sử giao dịch, báo cáo đối soát). |
| 12 | **Phân Quyền Chi Tiết & Ma Trận Quyền** | Admin quản lý được ma trận quyền truy cập từng trang/chức năng. Form tạo người dùng tự động ẩn/hiện trường theo vai trò. |
| 13 | **Nhật Ký Hệ Thống** | Ghi log tự động các API tác động dữ liệu trong database. Lưu người thực hiện, hành động, đối tượng, thời gian, IP, dữ liệu cũ/mới. Filter linh hoạt. |
| 14 | **Đối Soát Chứng Từ Tài Trợ** | Upload file sao kê ngân hàng (CSV/Excel/TXT). Tự động parse và so khớp với dữ liệu trong hệ thống. Highlight các khoản: Đã khớp / Chưa khớp / Sai lệch. |
| 15 | **Quản Lý Đợt Giải Ngân (Disbursement Rounds)** | Mỗi quỹ có thể chia thành nhiều đợt giải ngân (1-4 đợt). Hệ thống tự động cập nhật trạng thái đợt theo ngày. Khi tất cả đợt hoàn thành → trạng thái quỹ tự chuyển sang "Đã đóng". |
| 16 | **Tiến Trình Gây Quỹ & Giải Ngân (Landing Page)** | Tách thành 2 khối rõ ràng: Tiến độ quyên góp (thanh progress bar) và Tiến độ giải ngân (timeline 4 dots với ngày thật/ngày dự kiến). |
| 17 | **Định Dạng Số Dư Compact** | Card thống kê trên trang danh sách quỹ hiển thị số dư dạng compact: `2,000,000,000đ` → `2 tỷ`, `280,000,000đ` → `280 triệu`. |
| 18 | **Đối Soát Chứng Từ Chi** | Kế toán upload file sao kê ngân hàng, hệ thống tự động parse và so khớp với dữ liệu trong bảng `giaodich`. Highlight các khoản: Đã khớp / Chưa khớp / Sai lệch. |

### 14.5 Nghiệm Thu & Giám Sát

**Mục tiêu:** Cho phép cán bộ tạo hồ sơ nghiệm thu, Admin duyệt kết quả cuối cùng.

- Cán bộ tạo nghiệm thu (kiểm tra tiến độ hoặc nghiệm thu cuối cùng) → trạng thái `Cho đánh giá`
- Admin duyệt → chọn `Đạt` / `Đạt có điều chỉnh` / `Không đạt`
- Chỉnh sửa / xóa khi chưa duyệt
- Timeline hiển thị lịch sử nghiệm thu với badge trạng thái

### 14.6 Ma Trận Phân Quyền

**Mục tiêu:** Admin quản lý quyền truy cập từng trang cho từng vai trò.

- Matrix UI hiển thị tất cả trang × tất cả vai trò (bao gồm Ban Kiểm soát role 5)
- Bật/tắt quyền bằng checkbox, lưu vào `page_permissions.json`
- Ảnh hưởng đến: Public Header menu, Staff Sidebar, PageAccessGuard

### 14.7 Sidebar Collapse & Responsive

**M��态:** Trạng thái sidebar tự động lưu vào `localStorage`.

- Nút toggle sidebar `position: fixed`, tự động ẩn/hiện theo kích thước màn hình
- Khi collapse: chỉ hiện icon, ẩn label và group title
- Mobile: sidebar dạng overlay với backdrop mờ

---

## 15. VẤN ĐỀ ĐÃ BIẾT

1. **`hopdongvayvon` và `lichtrano` chưa có dữ liệu mẫu** — cần tạo cho loại "Cho vay"
2. **Route `/api/bao-cao/xuat` không có auth middleware** — bất kỳ ai cũng có thể xuất báo cáo
3. **Frontend route `/api/applications/ai-suggest` không có auth** — AI suggestion có thể bị lạm dụng
4. **4 cột UNUSED đã xóa** — `nguoidung.xacnhandoclap`, `donvihoc.tennganh`, `donvihoc.khoahoc`, `donvihoc.mota`
5. **Bug `role_id` trong PhanBoPage** — đã sửa thành `vaiTro`
6. **Bug `bankiemsoat` thiếu trong permissions API** — đã thêm vào sanitized output
7. **Bug sidebar role 5 duplicate group** — đã gộp 2 group "GIÁM SÁT" thành 1

---

## 16. HƯỚNG PHÁT TRIỂN TƯƠNG LAI

### 16.1 Hoàn Thiện Beneficiary Expansion (Sprint 2-3)
- Triển khai frontend cho đa đối tượng nhận hỗ trợ
- Generalize labels trong toàn bộ UI

### 16.2 Tích Hợp Cổng Thanh Toán
- Tích hợp VNPay cho tài trợ trực tuyến
- Tự động xác nhận khoản tài trợ sau khi thanh toán thành công

### 16.3 Hệ Thống Thông Báo
- Email notification khi đơn được duyệt/từ chối
- Push notification cho mobile (nếu triển khai app)

### 16.4 Báo Cáo Nâng Cao
- Dashboard trực quan với biểu đồ real-time
- Xuất báo cáo PDF thay vì chỉ DOCX/XLSX
- Tùy chỉnh template báo cáo

### 16.5 Cải Thiện Bảo Mật
- Thêm auth middleware cho `/api/bao-cao/xuat` và `/api/applications/ai-suggest`
- Rate limiting nâng cao (per-user thay vì per-IP)
- Two-factor authentication cho Admin và Kế toán

### 16.6 Mobile Responsive
- Tối ưu hóa UI cho thiết bị di động
- PWA (Progressive Web App) cho trải nghiệm app-like

### 16.7 Quản Lý Đăng Ký Vai Trò
- Nâng cấp từ hardcoded roles trong `rolesMiddleware.js` sang dynamic roles từ DB
- Cho phép Admin tùy chỉnh quyền hạn từng vai trò

---

## 17. HƯỚNG DẪN PHÁT TRIỂN

### 17.1 Chạy Local
```bash
# Backend
cd backend && node server.js  # Port 5001

# Frontend
cd frontend && npm run dev    # Port 5173

# Database
# MySQL localhost:3306, root, no password
# Database: tvu_fund_management
```

### 17.2 Import Database
```bash
cd docs/database
C:\xampp\mysql\bin\mysql.exe -u root tvu_fund_management < tvu_fund_management.sql
```

### 17.3 Kiểm Tra Backend Load
```bash
node -e "
  require('./controllers/reports/statisticsController');
  require('./controllers/applications/applicationController');
  require('./controllers/funds/fundController');
  require('./controllers/donations/donationController');
  require('./controllers/transactions/transactionController');
  require('./controllers/system/chucVuController');
  console.log('All modules loaded OK');
" 2>&1 | head -1
```

### 17.4 Kiểm Tra Frontend Build
```bash
cd frontend && npm run build
```

### 17.5 Triển Khai Production

| Thành Phần | Nền Tảng | URL |
|-----------|----------|-----|
| **Backend** | Hugging Face Spaces (Docker, port 7860) | `https://nthien-tvu-fund-management.hf.space` |
| **Frontend** | Cloudflare Pages | `https://tvu-fund-management.pages.dev` |
| **Database** | Aiven MySQL (trial) | Remote MySQL connection |

**Tài khoản Admin mặc định:**
- **Email:** `binh@tvu.edu.vn`
- **Mật khẩu:** `123456`
- **Vai trò:** Admin (Role 1)

---

*Cập nhật lần cuối: 2026-08-02*
