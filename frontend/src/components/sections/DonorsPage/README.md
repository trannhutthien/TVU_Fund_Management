# DonorsPage Sections

Các sections cho trang **Nhà tài trợ** (Donors Page).

## 📁 Cấu trúc

```
DonorsPage/
├── DonorTitleSection.jsx    # Section tiêu đề trang
├── index.js                  # Export tất cả sections
└── README.md                 # Documentation
```

## 🎯 Sections

### 1. DonorTitleSection

**Mô tả**: Section tiêu đề cho trang Nhà tài trợ

**Nội dung**:
- Tiêu đề: "Bảng **Tri ân Nhà tài trợ**"
- Phụ đề: "Vinh danh những nhà hảo tâm và đối tác chiến lược đã đồng hành cùng Quỹ TVU để thắp sáng tương lai cho các thế hệ sinh viên Đại học Trà Vinh."

**Kỹ thuật**: Tái sử dụng `FundTitleSection` component với props tùy chỉnh

**Import**:
```jsx
import { DonorTitleSection } from '@components/sections/DonorsPage';
```

**Sử dụng**:
```jsx
<DonorTitleSection />
```

### 2. ImpactStatsSection

**Mô tả**: Section thống kê tác động của quỹ với animation đếm số

**Nội dung**:
- **Sinh viên được hỗ trợ**: 1000+ (animated count-up)
- **Đã giải ngân**: 1.2 Tỷ VNĐ (animated count-up)
- **Đối tác doanh nghiệp**: 50+ (animated count-up)

**Đặc điểm**:
- Card nổi lên với box-shadow
- Animation đếm số từ 0 lên giá trị thật (1.5s)
- Custom hook `useCountUp` để tái sử dụng
- Responsive: 3 cột desktop → 1 cột mobile

**Import**:
```jsx
import { ImpactStatsSection } from '@components/sections/DonorsPage';
```

**Sử dụng**:
```jsx
// Basic (dùng data mặc định)
<ImpactStatsSection />

// Custom data từ API
<ImpactStatsSection stats={customStats} />
```

**Props**:
- `stats` (Array, optional): Mảng stats tùy chỉnh

**Chi tiết**: Xem [ImpactStatsSection/README.md](./ImpactStatsSection/README.md)

## 🔄 Tái sử dụng Component

### FundTitleSection (Refactored)

Component `FundTitleSection` đã được refactor để có thể tái sử dụng cho nhiều trang:

**Props**:
- `title` (string): Tiêu đề chính (text trước highlight)
- `highlight` (string): Text được highlight màu vàng
- `subtitle` (string): Phụ đề mô tả

**Default values** (cho FundsPage):
```jsx
title="Danh mục các Quỹ"
highlight="Hỗ trợ & Học bổng"
subtitle="Tìm kiếm cơ hội phù hợp để đồng hành cùng con đường tri thức của bạn."
```

**Custom values** (cho DonorsPage):
```jsx
title="Bảng"
highlight="Tri ân Nhà tài trợ"
subtitle="Vinh danh những nhà hảo tâm và đối tác chiến lược đã đồng hành cùng Quỹ TVU để thắp sáng tương lai cho các thế hệ sinh viên Đại học Trà Vinh."
```

## 📝 TODO

Các sections cần thêm cho DonorsPage:

- [x] **DonorTitleSection**: Section tiêu đề trang ✅
- [x] **ImpactStatsSection**: Thống kê tác động với animation đếm số ✅
- [ ] **DonorWallSection**: Hiển thị top 6 nhà tài trợ có đóng góp lớn nhất
- [ ] **DonorFilterSection**: Bộ lọc theo loại nhà tài trợ (Doanh nghiệp, Cá nhân, Tổ chức)

## 🎨 Style Guide

- Sử dụng CSS variables: `var(--color-primary)`, `var(--color-gold)`, `var(--color-white)`
- SCSS Module - không inline style
- Responsive: Desktop (≥1024px), Tablet (768-1023px), Mobile (<768px)
- Icon từ `react-icons/hi2`
