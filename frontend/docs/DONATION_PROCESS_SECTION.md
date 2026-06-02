# DonationProcessSection - Quy Trình Tài Trợ

## 📋 Tổng Quan

Component **DonationProcessSection** hiển thị quy trình 4 bước để trở thành nhà tài trợ trên trang Landing Page.

## 🎯 Mục Đích

- Hướng dẫn nhà tài trợ quy trình đóng góp
- Tạo sự minh bạch và tin cậy
- Khuyến khích hành động tài trợ
- Hiển thị tính chuyên nghiệp của hệ thống

## 🎨 Thiết Kế

### Layout
- **Zigzag timeline**: Các bước xen kẽ trái-phải
- **Đường nối dọc**: Gradient vàng gold nối các bước
- **Background**: Gradient nhẹ với pattern trang trí
- **Responsive**: Chuyển sang layout dọc trên mobile

### Màu Sắc
- **Bước lẻ (1, 3)**: Gold gradient `#f0a500 → #d89500`
- **Bước chẵn (2, 4)**: Navy gradient `#1a2f5e → #152847`
- **Duration badge**: Gold với border `rgba(240, 165, 0, 0.1)`
- **Background**: Gradient `#f8fafc → #f1f5f9`

## 📊 Quy Trình 4 Bước

### Bước 1: Đăng ký tài trợ
- **Icon**: `HiOutlineHandRaised`
- **Thời gian**: ~3 phút
- **Mô tả**: Đăng ký thông tin và chọn quỹ
- **Vị trí**: Trái
- **Màu**: Gold

### Bước 2: Chọn quỹ hỗ trợ
- **Icon**: `HiOutlineBuildingLibrary`
- **Thời gian**: ~2 phút
- **Mô tả**: Lựa chọn quỹ phù hợp (Học bổng, Khẩn cấp, Nghiên cứu)
- **Vị trí**: Phải
- **Màu**: Navy

### Bước 3: Chuyển khoản
- **Icon**: `HiOutlineCurrencyDollar`
- **Thời gian**: 1–2 ngày làm việc
- **Mô tả**: Chuyển khoản và hệ thống tự động xác nhận
- **Vị trí**: Trái
- **Màu**: Gold

### Bước 4: Theo dõi & Báo cáo
- **Icon**: `HiOutlineChartPie`
- **Thời gian**: Cập nhật định kỳ
- **Mô tả**: Nhận báo cáo minh bạch về việc sử dụng kinh phí
- **Vị trí**: Phải
- **Màu**: Navy

## 🔧 Props

```jsx
DonationProcessSection.propTypes = {
  onContactClick: PropTypes.func, // Callback khi click "Trở thành nhà tài trợ"
};
```

## 💡 Sử Dụng

### Basic Usage
```jsx
import DonationProcessSection from '@components/sections/LandingPage/DonationProcessSection';

function LandingPage() {
  return (
    <main>
      <DonationProcessSection />
    </main>
  );
}
```

### With Contact Handler
```jsx
import DonationProcessSection from '@components/sections/LandingPage/DonationProcessSection';

function LandingPage() {
  const handleContactClick = () => {
    // Mở form liên hệ hoặc navigate
    console.log('Open contact form');
  };

  return (
    <main>
      <DonationProcessSection onContactClick={handleContactClick} />
    </main>
  );
}
```

## 🎯 CTA Buttons

### Primary Button: "Trở thành nhà tài trợ →"
- Gọi `onContactClick` callback nếu có
- Fallback: Scroll to footer (contact section)

### Secondary Link: "Xem danh sách quỹ"
- Navigate to `/funds` page
- Hiển thị tất cả quỹ đang hoạt động

## 📱 Responsive Behavior

### Desktop (≥768px)
- Grid 3 cột: `[Text Left] [Box] [Text Right]`
- Zigzag layout
- Đường nối dọc ở giữa

### Mobile (<768px)
- Grid 2 cột: `[Box] [Text]`
- Layout dọc
- Đường nối dọc bên trái box
- Text luôn bên phải box

## 🎨 Visual Effects

### Hover Effects
- **Step Box**: 
  - `translateY(-4px)` + `scale(1.05)`
  - Shadow tăng từ `0 6px 20px` → `0 12px 35px`
- **Link**: Color chuyển từ Navy → Gold

### Animations
- Smooth transitions: `0.3s ease`
- Transform và shadow đồng bộ

## 🔄 So Sánh Với ProcessSection

| Feature | ProcessSection | DonationProcessSection |
|---------|---------------|------------------------|
| **Đối tượng** | Sinh viên | Nhà tài trợ |
| **Background** | White | Gradient + Pattern |
| **Đường nối** | Navy `rgba(26, 47, 94, 0.15)` | Gold gradient |
| **Badge color** | Navy | Gold |
| **Bước lẻ** | Navy | Gold |
| **Bước chẵn** | Gold | Navy |
| **Primary CTA** | "Bắt đầu ngay" | "Trở thành nhà tài trợ" |
| **Secondary CTA** | "Xem hướng dẫn" | "Xem danh sách quỹ" |

## 📁 File Structure

```
DonationProcessSection/
├── DonationProcessSection.jsx          # Main component
├── DonationProcessSection.module.scss  # Styles
└── index.js                            # Export
```

## 🎯 Key Features

### 1. Visual Hierarchy
- Header với label, title, subtitle
- Timeline rõ ràng với đường nối
- CTA buttons nổi bật

### 2. Information Architecture
- 4 bước logic và dễ hiểu
- Duration badge cho mỗi bước
- Mô tả chi tiết nhưng ngắn gọn

### 3. User Experience
- Hover effects tạo tương tác
- Responsive design mượt mà
- Clear call-to-action

### 4. Brand Consistency
- Sử dụng CSS variables
- Màu sắc nhất quán với hệ thống
- Typography chuẩn

## 🚀 Integration

### LandingPage.jsx
```jsx
import DonationProcessSection from '@components/sections/LandingPage/DonationProcessSection';

<main>
  <HeroBanner />
  <StatsSection />
  <AISupportSection />
  <FundBreakdownSection />
  <ProcessSection onLoginClick={openLoginModal} />
  <DonationProcessSection />  {/* ← Added here */}
  <DonorWallSection />
</main>
```

## 📊 Content Strategy

### Messaging
- **Empathy**: "Đồng hành cùng sinh viên TVU"
- **Impact**: "Hiện thực hóa ước mơ"
- **Transparency**: "Báo cáo minh bạch"
- **Trust**: "Hệ thống tự động xác nhận"

### Tone of Voice
- Professional nhưng ấm áp
- Khuyến khích hành động
- Tạo niềm tin
- Nhấn mạnh tác động

## 🎨 Design Tokens

### Colors
```scss
--color-primary: #1a2f5e;  // Navy Blue
--color-gold: #f0a500;     // Gold
--color-text: #64748b;     // Slate Gray
```

### Spacing
```scss
--section-padding: 80px;
--step-gap: 48px;
--content-gap: 8px;
```

### Border Radius
```scss
--box-radius: 14px;
--badge-radius: 20px;
```

## ✅ Checklist

- [x] Component created
- [x] SCSS module created
- [x] Integrated to LandingPage
- [x] Responsive design
- [x] Hover effects
- [x] PropTypes validation
- [x] Documentation

## 🎉 Kết Quả

Section **DonationProcessSection** đã hoàn thành với:
- ✅ Quy trình 4 bước rõ ràng
- ✅ Design đẹp mắt với gradient và pattern
- ✅ Responsive hoàn hảo
- ✅ Hover effects mượt mà
- ✅ CTA buttons hiệu quả
- ✅ Integration với LandingPage

**Sẵn sàng để test!** 🚀

---

**Created**: 27/05/2026
**Status**: Complete ✅
