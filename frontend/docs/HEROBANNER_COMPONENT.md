# HeroBanner Component

## 📋 Tổng quan

**HeroBanner** là component banner chính hiển thị ở đầu trang Landing Page. Component này thay thế tên "HeroSection" để dễ hiểu hơn - nhìn vào tên là biết đây là banner chính của trang.

## 🎯 Mục đích

- Hiển thị thông điệp chính của hệ thống TVU Fund Management
- Thu hút người dùng với thiết kế hiện đại, gradient Navy Blue
- Cung cấp CTA (Call-to-Action) buttons để đăng nhập hoặc tìm hiểu thêm
- Hiển thị thống kê nổi bật (số sinh viên, giá trị hỗ trợ, nhà hảo tâm)

## 📁 Cấu trúc files

```
frontend/src/components/sections/HeroBanner/
├── HeroBanner.jsx           # Component chính
├── HeroBanner.module.scss   # Styles với SCSS Module
├── HeroBanner.stories.jsx   # Demo page
└── index.js                 # Export
```

## ✨ Tính năng

### Layout
- **2-Column Grid**: Content bên trái (60%), Image bên phải (40%)
- **Responsive**: Desktop 2 cột → Mobile 1 cột xếp dọc
- **Full Height**: min-height 100vh để chiếm toàn màn hình

### Content (Bên trái)
1. **Badge**: Nhãn "🎓 Hỗ trợ sinh viên TVU" với nền Gold mờ
2. **Heading**: Tiêu đề lớn 56px với highlight màu Gold có underline effect
3. **Description**: Mô tả ngắn gọn về hệ thống (18px, line-height 1.7)
4. **CTA Buttons**: 
   - "Đăng nhập ngay" (Primary button) → navigate to /login
   - "Tìm hiểu thêm" (Ghost button) → scroll to #about section
5. **Stats**: 3 chỉ số thống kê với divider:
   - 1,200+ Sinh viên được hỗ trợ
   - 15 tỷ+ Tổng giá trị hỗ trợ
   - 50+ Nhà hảo tâm

### Image Area (Bên phải)
1. **Main Image Container**: 
   - Glassmorphism effect (rgba + blur)
   - Border-radius 24px
   - Placeholder cho hình ảnh thực tế (sinh viên hoặc khuôn viên TVU)
2. **Decorative Circles**: 3 vòng tròn Gold mờ với animation float
3. **Floating Cards**: 2 card nổi với animation:
   - Card 1: "Thành công 98%" (top-right)
   - Card 2: "Quỹ đang hoạt động 12" (bottom-left)

### Background
- **Gradient**: linear-gradient(135deg, #1a2f5e → #2a4a8f)
- **Decorative Blurs**: 2 vòng tròn blur lớn (Gold & Primary) để tạo depth

## 🎨 Design Specs

| Element | Specs |
|---------|-------|
| Background | linear-gradient(135deg, #1a2f5e 0%, #2a4a8f 100%) |
| Min Height | 100vh |
| Layout | Grid 2 columns (1fr 1fr), gap 80px |
| Heading | 56px, font-weight 800, white |
| Highlight | Gold (#f0a500) với underline effect |
| Description | 18px, line-height 1.7, rgba(255,255,255,0.85) |
| Stats Value | 32px, font-weight 800, Gold |
| Badge | Gold background mờ, border Gold |
| Floating Cards | White background, blur(12px), shadow |

## 🎬 Animations

1. **fadeInUp**: Content fade in từ dưới lên (staggered delays)
2. **fadeInRight**: Image area fade in từ phải sang
3. **float**: Decorative circles di chuyển lên xuống
4. **floatCard**: Floating cards di chuyển nhẹ

## 💻 Cách sử dụng

### Trong LandingPage
```jsx
import HeroBanner from '@components/sections/HeroBanner';

function LandingPage() {
  return (
    <div>
      <PublicHeader />
      <HeroBanner />
      {/* Other sections */}
      <PublicFooter />
    </div>
  );
}
```

### Xem Demo
```
http://localhost:3000/hero-examples
```

## 📱 Responsive Breakpoints

- **Desktop (≥968px)**: 2 cột, image visible
- **Tablet (768-967px)**: 1 cột, image hidden, text centered
- **Mobile (<768px)**: 1 cột, smaller fonts, stacked buttons

## 🔗 Dependencies

- `react-router-dom`: useNavigate() cho navigation
- `@components/common/Button`: Button component
- SCSS Modules với CSS variables từ `_variables.scss`

## 🚀 Routing Changes

### App.jsx đã được cập nhật:

**Trước:**
```jsx
<Route path="/" element={<Navigate to="/dashboard" replace />} />
```

**Sau:**
```jsx
<Route path="/" element={<LandingPage />} />
```

Bây giờ khi truy cập `/` sẽ hiển thị LandingPage với HeroBanner, không còn redirect về dashboard nữa.

## 📝 TODO - Cần thêm sau

1. **Hình ảnh thực tế**: Thay placeholder bằng ảnh sinh viên hoặc khuôn viên TVU
2. **Dynamic Stats**: Lấy số liệu thống kê từ API thay vì hardcode
3. **Scroll to Section**: Implement smooth scroll khi click "Tìm hiểu thêm"
4. **Animation on Scroll**: Thêm animation khi scroll vào viewport (AOS library)

## 🎯 Next Steps

Tiếp theo sẽ tạo các section khác cho Landing Page:
1. ✅ **HeroBanner** (Done)
2. **StatsSection** - Thống kê chi tiết với StatCard
3. **FeaturesSection** - Tính năng nổi bật
4. **FundProgressSection** - Tiến độ các quỹ
5. **ProcessSection** - Quy trình đăng ký
6. **TestimonialsSection** - Lời chứng thực
7. **FAQSection** - Câu hỏi thường gặp
