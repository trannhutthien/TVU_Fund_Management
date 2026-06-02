# User Pages

Thư mục chứa các pages dành cho người dùng cuối (role_id = 4).

## Cấu trúc

```
User/
├── Student/
│   ├── ApplyPage/       # Trang nộp đơn xin hỗ trợ / Quyên góp (hỗ trợ cả NHA_TAI_TRO)
│   ├── Dashboard/       # Trang tổng quan sinh viên
│   └── ProfilePage/     # Trang thông tin cá nhân (router)
│       ├── ProfilePage.jsx          # Router component
│       ├── shared/                  # Sections dùng chung
│       │   └── ProfileHeader/       # Header với avatar, badge, actions
│       ├── student/                 # Profile cho SINH_VIEN
│       │   ├── StudentProfile.jsx
│       │   └── sections/
│       │       ├── PersonalInfoSection/
│       │       ├── BankAccountSection/
│       │       ├── StudentOverviewSection/
│       │       └── ApplicationHistorySection/
│       └── donor/                   # Profile cho NHA_TAI_TRO
│           ├── DonorProfile.jsx
│           └── sections/            # TODO: Implement
│               ├── OrganizationInfoSection/
│               ├── DonationHistorySection/
│               └── DonorOverviewSection/
└── README.md
```

## Phân loại người dùng

### Role 4 - Người dùng cuối
Có 2 loại người dùng (dựa trên `loai_nguoi_dung`):

1. **SINH_VIEN** - Sinh viên
   - Nộp đơn xin hỗ trợ từ quỹ
   - Xem lịch sử đơn đã nộp
   - Quản lý thông tin cá nhân

2. **NHA_TAI_TRO** - Nhà tài trợ
   - Quyên góp cho quỹ
   - Xem lịch sử quyên góp
   - Quản lý thông tin cá nhân

## Pages chung

### ApplyPage
- **Sinh viên**: Nộp đơn xin hỗ trợ (4 bước)
- **Nhà tài trợ**: Quyên góp cho quỹ (2 bước)
- Tự động điều chỉnh UI dựa trên `loai_nguoi_dung`

### ProfilePage (Router)
ProfilePage.jsx là router component điều hướng giữa 2 loại profile:

**StudentProfile** (SINH_VIEN):
- PersonalInfoSection: Thông tin cá nhân (readonly)
- BankAccountSection: Quản lý tài khoản ngân hàng
- StudentOverviewSection: Thống kê hồ sơ, tài khoản, điểm tín nhiệm
- ApplicationHistorySection: Lịch sử đơn xin hỗ trợ

**DonorProfile** (NHA_TAI_TRO):
- OrganizationInfoSection: Thông tin tổ chức (TODO)
- DonationHistorySection: Lịch sử quyên góp (TODO)
- DonorOverviewSection: Thống kê đóng góp (TODO)

### Dashboard
- Tổng quan hoạt động
- Thống kê đơn/quyên góp
- Thông báo mới

## Routing

Tất cả pages trong thư mục này đều sử dụng `PublicLayoutWithSidebar`:

```javascript
// App.jsx
<Route element={<PublicLayoutWithSidebar />}>
  <Route path="/profile" element={<ProfilePage />} />
  <Route path="/apply" element={<ApplyPage />} />
  <Route path="/dashboard" element={<DashboardPage />} />
</Route>
```

## Lưu ý

- Pages trong thư mục này **không** yêu cầu đăng nhập bắt buộc
- Một số tính năng sẽ redirect về login nếu chưa đăng nhập
- UI tự động điều chỉnh dựa trên `loai_nguoi_dung` từ authStore
