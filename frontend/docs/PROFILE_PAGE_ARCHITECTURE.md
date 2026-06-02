# ProfilePage Architecture

## Tổng quan

ProfilePage đã được tái cấu trúc theo phương án **colocation** để hỗ trợ 2 loại người dùng:
- **SINH_VIEN** (Sinh viên)
- **NHA_TAI_TRO** (Nhà tài trợ)

## Cấu trúc thư mục

```
ProfilePage/
├── ProfilePage.jsx                    # Router component
├── ProfilePage.module.scss
├── shared/                            # Components dùng chung
│   ├── ProfileHeader.jsx              # Header với avatar, badge, actions
│   └── ProfileHeader.module.scss
├── student/                           # Profile cho SINH_VIEN
│   ├── StudentProfile.jsx             # Main component
│   ├── StudentProfile.module.scss
│   └── sections/
│       ├── PersonalInfoSection.jsx    # Thông tin cá nhân (readonly)
│       ├── PersonalInfoSection.module.scss
│       ├── BankAccountSection.jsx     # Quản lý tài khoản ngân hàng
│       ├── BankAccountSection.module.scss
│       ├── StudentOverviewSection.jsx # Thống kê hồ sơ
│       ├── StudentOverviewSection.module.scss
│       ├── ApplicationHistorySection.jsx # Lịch sử đơn xin hỗ trợ
│       └── ApplicationHistorySection.module.scss
└── donor/                             # Profile cho NHA_TAI_TRO
    ├── DonorProfile.jsx               # Main component (placeholder)
    ├── DonorProfile.module.scss
    └── sections/                      # TODO: Implement
        ├── OrganizationInfoSection/
        ├── DonationHistorySection/
        └── DonorOverviewSection/
```

## Luồng hoạt động

### 1. ProfilePage.jsx (Router)

```javascript
const ProfilePage = () => {
  // Fetch user data
  // Xác định loại người dùng
  const isDonor = user?.loai_nguoi_dung === 'NHA_TAI_TRO';
  
  // Điều hướng đến profile tương ứng
  return isDonor ? (
    <DonorProfile user={user} onLogout={handleLogout} />
  ) : (
    <StudentProfile user={user} onLogout={handleLogout} />
  );
};
```

### 2. StudentProfile (SINH_VIEN)

**Sections:**

1. **ProfileHeader** (shared)
   - Avatar với nút upload
   - Tên, badge (SINH VIÊN), MSSV
   - Nút "Chỉnh sửa" và "Đăng xuất"

2. **PersonalInfoSection**
   - Thông tin cá nhân (readonly)
   - Họ tên, Email, SĐT, MSSV, Địa chỉ, Khoa/Đơn vị
   - Note: "Liên hệ Giáo vụ để cập nhật"

3. **BankAccountSection**
   - Danh sách tài khoản ngân hàng
   - Thêm/Xóa/Đặt mặc định tài khoản
   - Form validation

4. **StudentOverviewSection**
   - Số hồ sơ đã nộp
   - Số tài khoản ngân hàng
   - Điểm tín nhiệm (badge)

5. **ApplicationHistorySection**
   - Bảng lịch sử đơn xin hỗ trợ
   - Expand row để xem ApplicationStatusStepper
   - Nút "Nộp đơn hỗ trợ mới"

### 3. DonorProfile (NHA_TAI_TRO)

**Status:** Placeholder (TODO)

**Sections cần implement:**

1. **ProfileHeader** (shared)
   - Tương tự StudentProfile nhưng badge "NHÀ TÀI TRỢ"

2. **OrganizationInfoSection**
   - Tên tổ chức
   - Mã số thuế
   - Địa chỉ
   - Người đại diện
   - Lĩnh vực hoạt động

3. **DonationHistorySection**
   - Bảng lịch sử quyên góp
   - Số tiền, quỹ, ngày quyên góp
   - Trạng thái (Đã xác nhận, Chờ xác nhận)

4. **DonorOverviewSection**
   - Tổng số tiền đã quyên góp
   - Số lần quyên góp
   - Hạng nhà tài trợ (Vàng, Bạc, Đồng)

## API Integration

### StudentProfile

```javascript
// Bank accounts
const response = await bankAccountService.getAll();
const accounts = response.data.map(acc => ({
  tai_khoan_id: acc.taiKhoanId,
  so_tai_khoan: acc.soTaiKhoan,
  ten_ngan_hang: acc.tenNganHang,
  chu_tai_khoan: acc.chuTaiKhoan,
  la_mac_dinh: acc.laMacDinh,
}));

// Applications
const response = await applicationService.getMyApplications();
const applications = response.data;
```

### DonorProfile (TODO)

```javascript
// Donations
const response = await donationService.getMyDonations();
const donations = response.data;

// Statistics
const response = await donationService.getMyStats();
const stats = response.data;
```

## Styling

### Design System

- **Card style:** Glassmorphism với backdrop-filter
- **Width:** 70vw (max 1400px) → responsive
- **Colors:** CSS variables từ design system
- **Spacing:** SCSS variables ($space-*)
- **Typography:** Font weights từ variables

### Responsive Breakpoints

```scss
@media (max-width: 1200px) { width: 80vw; }
@media (max-width: 768px)  { width: 90vw; }
@media (max-width: 480px)  { width: calc(100vw - 32px); }
```

## Props Interface

### ProfileHeader

```typescript
interface ProfileHeaderProps {
  user: User;
  onEdit: () => void;
  onLogout: () => void;
}
```

### StudentProfile

```typescript
interface StudentProfileProps {
  user: User;
  onLogout: () => void;
}
```

### BankAccountSection

```typescript
interface BankAccountSectionProps {
  bankAccounts: BankAccount[];
  onAdd: (data: BankAccountData) => void;
  onDelete: (id: number) => void;
  onSetDefault: (id: number) => void;
  loading: boolean;
}
```

## Lợi ích của Colocation

1. **Dễ maintain:** Sections gần với component sử dụng
2. **Tránh conflict:** Không lo sections bị dùng nhầm
3. **Clear ownership:** Rõ ràng section nào thuộc profile nào
4. **Scalable:** Dễ thêm sections mới cho từng loại
5. **Type safety:** Props rõ ràng, không generic

## TODO

### DonorProfile Implementation

1. Tạo OrganizationInfoSection
2. Tạo DonationHistorySection
3. Tạo DonorOverviewSection
4. Implement API calls
5. Add form validation
6. Add loading states
7. Add error handling

### Enhancements

1. Add avatar upload functionality
2. Add personal info edit (với approval workflow)
3. Add pagination cho history tables
4. Add filters cho history
5. Add export functionality
6. Add notifications
7. Add analytics tracking

## Migration Notes

**Old structure:**
```
components/sections/ProfilePage/
├── ProfileHeader/
├── ProfileTabs/
├── ProfileOverview/
└── HistorySection/
```

**New structure:**
```
pages/User/Student/ProfilePage/
├── shared/ProfileHeader/
├── student/sections/
└── donor/sections/
```

**Breaking changes:** None - old components vẫn tồn tại, chưa xóa

**Rollback plan:** Revert ProfilePage.jsx về version cũ nếu cần
