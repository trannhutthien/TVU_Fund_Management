# Donor Profile Implementation

## Tổng quan

Đã implement đầy đủ DonorProfile với 3 sections chính, tái sử dụng và điều chỉnh từ StudentProfile.

## Cấu trúc

```
donor/
├── DonorProfile.jsx                      # Main component
├── DonorProfile.module.scss
└── sections/
    ├── DonorOverviewSection.jsx          # Thống kê quyên góp
    ├── DonorOverviewSection.module.scss
    ├── DonationHistorySection.jsx        # Lịch sử quyên góp
    └── DonationHistorySection.module.scss
```

## Sections

### 1. PersonalInfoSection (Shared)

**Tái sử dụng từ:** `student/sections/PersonalInfoSection`

**Hiển thị cho Nhà tài trợ:**
- ✅ Họ và tên (tên tổ chức)
- ✅ Email
- ✅ Số điện thoại
- ✅ Mã số định danh
- ✅ Địa chỉ liên hệ
- ❌ MSSV (ẩn - chỉ cho sinh viên)
- ❌ Khoa/Đơn vị (ẩn - chỉ cho sinh viên)

**Logic:**
```javascript
const userType = user?.loai_tai_khoan || user?.loaiTaiKhoan || user?.loai_nguoi_dung;
const isSinhVien = userType === 'SINH_VIEN';

// Chỉ hiện MSSV và Khoa nếu là sinh viên
{isSinhVien && <Input label="MSSV" ... />}
{isSinhVien && <Input label="Khoa/Đơn vị" ... />}
```

### 2. DonorOverviewSection (New)

**Dựa trên:** `student/sections/StudentOverviewSection`

**Thống kê:**

| Stat | Icon | Type | Description |
|------|------|------|-------------|
| **Tổng số tiền quyên góp** | `HiOutlineCurrencyDollar` | currency | Tổng tiền đã quyên góp |
| **Số lần quyên góp** | `HiOutlineHandRaised` | number | Số lần đã quyên góp |
| **Hạng nhà tài trợ** | `HiOutlineTrophy` | badge | Vàng/Bạc/Đồng |

**Props:**
```typescript
interface DonorOverviewSectionProps {
  tongSoTienQuyenGop: number;  // Tổng tiền quyên góp
  soLanQuyenGop: number;       // Số lần quyên góp
  hangNhaTaiTro: string | null; // 'Vàng', 'Bạc', 'Đồng', null
}
```

**So sánh với StudentOverviewSection:**

| Student | Donor |
|---------|-------|
| Hồ sơ đã nộp | Tổng số tiền quyên góp |
| Tài khoản LK | Số lần quyên góp |
| Điểm tín nhiệm | Hạng nhà tài trợ |

### 3. DonationHistorySection (New)

**Dựa trên:** `student/sections/ApplicationHistorySection`

**Bảng lịch sử:**

| Column | Description |
|--------|-------------|
| Mã quyên góp | ID của khoản quyên góp |
| Tên quỹ | Quỹ được quyên góp |
| Số tiền | Số tiền quyên góp |
| Trạng thái | CHO_XAC_NHAN, DA_XAC_NHAN, HOAN_THANH |
| Ngày quyên góp | Ngày thực hiện |
| Thao tác | Expand để xem chi tiết |

**Trạng thái:**

| Status | Label | Color |
|--------|-------|-------|
| `CHO_XAC_NHAN` | Chờ xác nhận | Yellow |
| `DA_XAC_NHAN` | Đã xác nhận | Green |
| `HOAN_THANH` | Hoàn thành | Blue |

**Empty state:**
```
Icon: HiOutlineHandRaised
Text: "Bạn chưa có khoản quyên góp nào"
Subtext: "Nhấn nút 'Quyên góp mới' để tạo khoản quyên góp"
Button: "Quyên góp mới" → navigate('/apply')
```

**So sánh với ApplicationHistorySection:**

| Student | Donor |
|---------|-------|
| Lịch sử yêu cầu của tôi | Lịch sử quyên góp của tôi |
| Mã đơn | Mã quyên góp |
| Nộp đơn hỗ trợ mới | Quyên góp mới |
| ApplicationStatusStepper | Detail info (ghi chú, phương thức) |

## DonorProfile Component

```javascript
const DonorProfile = ({ user, onLogout }) => {
  return (
    <div className={styles.donorProfile}>
      <ProfileHeader user={user} onEdit={handleEdit} onLogout={onLogout} />

      <div className={styles.sectionsContainer}>
        {/* Thông tin cá nhân (tổ chức) */}
        <PersonalInfoSection user={user} onSave={handleSavePersonalInfo} />

        {/* Thống kê quyên góp */}
        <DonorOverviewSection
          tongSoTienQuyenGop={0}
          soLanQuyenGop={0}
          hangNhaTaiTro={null}
        />

        {/* Lịch sử quyên góp */}
        <DonationHistorySection />
      </div>
    </div>
  );
};
```

## API Integration (TODO)

### DonorOverviewSection

```javascript
// TODO: Fetch donor stats
const response = await donationService.getMyStats();
const stats = response.data;

setDonorStats({
  tongSoTienQuyenGop: stats.totalAmount,
  soLanQuyenGop: stats.totalCount,
  hangNhaTaiTro: stats.rank, // 'Vàng', 'Bạc', 'Đồng'
});
```

### DonationHistorySection

```javascript
// TODO: Fetch donation history
const response = await donationService.getMyDonations();
const donations = response.data;

setDonations(donations.map(d => ({
  id: d.donationId,
  tenQuy: d.fundName,
  soTien: d.amount,
  trangThai: d.status, // 'CHO_XAC_NHAN', 'DA_XAC_NHAN', 'HOAN_THANH'
  ngayQuyenGop: d.donationDate,
  ghiChu: d.note,
  phuongThuc: d.method,
})));
```

## Styling

### Design Consistency

- ✅ Giống StudentProfile (glassmorphism, colors, spacing)
- ✅ Width: 70vw (max 1400px) → responsive
- ✅ CSS variables: `var(--color-primary)`, `var(--color-gold)`
- ✅ SCSS modules cho mỗi section

### Icons

| Section | Icon |
|---------|------|
| Overview | `HiOutlineChartBarSquare` |
| Tổng tiền | `HiOutlineCurrencyDollar` |
| Số lần | `HiOutlineHandRaised` |
| Hạng | `HiOutlineTrophy` |
| History | `HiOutlineHandRaised` |

## Testing

### Manual Testing Checklist

**Nhà tài trợ đăng nhập:**
- [ ] Vào `/profile` → Hiện DonorProfile
- [ ] Badge hiện "NHÀ TÀI TRỢ"
- [ ] PersonalInfoSection hiện đúng (không có MSSV, Khoa)
- [ ] DonorOverviewSection hiện 3 stats
- [ ] DonationHistorySection hiện empty state
- [ ] Click "Quyên góp mới" → Navigate đến `/apply`
- [ ] Responsive trên mobile

**Sinh viên đăng nhập:**
- [ ] Vào `/profile` → Hiện StudentProfile (không phải DonorProfile)
- [ ] Badge hiện "SINH VIÊN"

## Comparison: Student vs Donor

| Feature | StudentProfile | DonorProfile |
|---------|---------------|--------------|
| **Header** | ProfileHeader (shared) | ProfileHeader (shared) |
| **Personal Info** | PersonalInfoSection (có MSSV, Khoa) | PersonalInfoSection (không có MSSV, Khoa) |
| **Bank Account** | BankAccountSection ✅ | ❌ Không có |
| **Overview** | StudentOverviewSection | DonorOverviewSection |
| **History** | ApplicationHistorySection | DonationHistorySection |
| **Stats** | Hồ sơ, Tài khoản, Điểm | Tổng tiền, Số lần, Hạng |
| **Action Button** | "Nộp đơn hỗ trợ mới" | "Quyên góp mới" |

## Next Steps

1. ✅ Implement DonorProfile sections
2. ✅ Adjust labels cho Donor
3. ⏳ Integrate API calls
4. ⏳ Add loading states
5. ⏳ Add error handling
6. ⏳ Test với tài khoản thật
7. ⏳ Add unit tests

## Related Files

- `frontend/src/pages/User/Student/ProfilePage/donor/DonorProfile.jsx`
- `frontend/src/pages/User/Student/ProfilePage/donor/sections/DonorOverviewSection.jsx`
- `frontend/src/pages/User/Student/ProfilePage/donor/sections/DonationHistorySection.jsx`
- `frontend/src/pages/User/Student/ProfilePage/student/sections/PersonalInfoSection.jsx` (shared)

## Date

Implementation completed: 2026-05-27
