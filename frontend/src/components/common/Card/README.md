# 📊 StatCard Component

Component Card hiển thị thống kê với icon, số liệu, và xu hướng. Có animation đẹp, hover effect, và nhiều variants.

---

## 🎨 Features

✅ **Icon với background màu** (6 màu: blue, purple, yellow, teal, green, red)  
✅ **Title nhỏ** (uppercase, tracking wide)  
✅ **Số liệu lớn** (bold, 28px, hover chuyển màu primary)  
✅ **Trend indicator** (up/down/neutral với icon mũi tên)  
✅ **Subtitle** (mô tả phụ)  
✅ **Hover effect** (nổi lên, shadow đậm, icon xoay nhẹ)  
✅ **Active effect** (nhấn xuống)  
✅ **Loading state** (spinner + overlay)  
✅ **Clickable** (có indicator khi hover)  
✅ **Animation** (fade in từ dưới lên)  
✅ **Responsive** (tự động điều chỉnh trên mobile)  

---

## 📦 Import

```jsx
import StatCard from '@components/common/Card';
// hoặc
import { StatCard } from '@components/common/Card';
```

---

## 🚀 Cách Sử Dụng

### 1. Basic Card

```jsx
<StatCard
  title="Tổng Quỹ"
  value="45,234,567 đ"
  icon={<MoneyIcon />}
  iconBgColor="blue"
/>
```

### 2. Card với Trend

```jsx
<StatCard
  title="Sinh Viên"
  value="1,234"
  icon={<UsersIcon />}
  iconBgColor="purple"
  trend="up"
  trendValue="+12.5%"
  subtitle="So với tháng trước"
/>
```

### 3. Clickable Card

```jsx
<StatCard
  title="Đơn Yêu Cầu"
  value="156"
  icon={<FileIcon />}
  iconBgColor="yellow"
  onClick={() => navigate('/applications')}
/>
```

### 4. Loading State

```jsx
const [loading, setLoading] = useState(true);

<StatCard
  title="Đang Tải"
  value="..."
  icon={<MoneyIcon />}
  iconBgColor="blue"
  loading={loading}
/>
```

### 5. Grid Layout

```jsx
<div className="stat-card-grid">
  <StatCard title="Card 1" value="123" icon={<Icon1 />} iconBgColor="blue" />
  <StatCard title="Card 2" value="456" icon={<Icon2 />} iconBgColor="purple" />
  <StatCard title="Card 3" value="789" icon={<Icon3 />} iconBgColor="yellow" />
  <StatCard title="Card 4" value="012" icon={<Icon4 />} iconBgColor="teal" />
</div>
```

---

## 🎯 Props API

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| `title` | `string` | - | ✅ | Tiêu đề nhỏ (VD: "Tổng Quỹ") |
| `value` | `string \| number` | - | ✅ | Số liệu hiển thị (VD: "1,234,567 đ") |
| `icon` | `ReactNode` | - | ✅ | Icon component |
| `iconBgColor` | `'blue' \| 'purple' \| 'yellow' \| 'teal' \| 'green' \| 'red'` | `'blue'` | ❌ | Màu nền icon |
| `trend` | `'up' \| 'down' \| 'neutral'` | - | ❌ | Xu hướng |
| `trendValue` | `string` | - | ❌ | Giá trị xu hướng (VD: "+12.5%") |
| `subtitle` | `string` | - | ❌ | Mô tả phụ |
| `onClick` | `function` | - | ❌ | Hàm xử lý click |
| `className` | `string` | `''` | ❌ | Custom class |
| `loading` | `boolean` | `false` | ❌ | Loading state |

---

## 🎨 Icon Colors

```jsx
// Blue - Xanh dương (mặc định)
<StatCard iconBgColor="blue" ... />

// Purple - Tím
<StatCard iconBgColor="purple" ... />

// Yellow - Vàng cam
<StatCard iconBgColor="yellow" ... />

// Teal - Xanh ngọc
<StatCard iconBgColor="teal" ... />

// Green - Xanh lá (success)
<StatCard iconBgColor="green" ... />

// Red - Đỏ (danger)
<StatCard iconBgColor="red" ... />
```

---

## 📈 Trend Variants

```jsx
// Trend Up - Xanh lá, mũi tên lên
<StatCard trend="up" trendValue="+12.5%" ... />

// Trend Down - Đỏ, mũi tên xuống
<StatCard trend="down" trendValue="-3.2%" ... />

// Trend Neutral - Xám, không mũi tên
<StatCard trend="neutral" trendValue="0%" ... />
```

---

## 🎭 Variants

### Compact (Nhỏ gọn)

```jsx
<StatCard
  title="Compact"
  value="123"
  icon={<Icon />}
  iconBgColor="blue"
  className="stat-card-compact"
/>
```

### Large (Lớn)

```jsx
<StatCard
  title="Large"
  value="999,999"
  icon={<Icon />}
  iconBgColor="blue"
  className="stat-card-large"
/>
```

### Gradient Border

```jsx
<StatCard
  title="Gradient"
  value="123"
  icon={<Icon />}
  iconBgColor="blue"
  className="stat-card-gradient"
/>
```

### Glow Effect

```jsx
<StatCard
  title="Glow"
  value="456"
  icon={<Icon />}
  iconBgColor="red"
  className="stat-card-glow"
/>
```

---

## 🎨 Hiệu Ứng

### Hover Effects
- ✅ Card nổi lên 4px
- ✅ Shadow đậm hơn
- ✅ Border chuyển màu primary
- ✅ Icon phóng to + xoay 5 độ
- ✅ Value chuyển màu primary
- ✅ Hover indicator xuất hiện (nếu clickable)

### Active Effect
- ✅ Card nhấn xuống 2px
- ✅ Shadow giảm

### Animation
- ✅ Fade in từ dưới lên khi load
- ✅ Duration: 0.4s
- ✅ Easing: cubic-bezier

---

## 📱 Responsive

```scss
// Desktop: Full size
padding: 24px
icon: 56x56px
value: 28px

// Mobile (<768px): Smaller
padding: 16px
icon: 48x48px
value: 22px
```

---

## 💡 Ví Dụ Thực Tế

### Dashboard Stats

```jsx
import { StatCard } from '@components/common/Card';
import { MoneyIcon, UsersIcon, FileIcon, CheckIcon } from 'react-icons/fa';

function DashboardPage() {
  const stats = {
    totalFunds: 45234567,
    students: 1234,
    applications: 156,
    approved: 89,
  };

  return (
    <div className="stat-card-grid">
      <StatCard
        title="Tổng Quỹ"
        value={`${stats.totalFunds.toLocaleString('vi-VN')} đ`}
        icon={<MoneyIcon />}
        iconBgColor="blue"
        trend="up"
        trendValue="+12.5%"
        subtitle="So với tháng trước"
        onClick={() => navigate('/funds')}
      />

      <StatCard
        title="Sinh Viên"
        value={stats.students.toLocaleString('vi-VN')}
        icon={<UsersIcon />}
        iconBgColor="purple"
        trend="up"
        trendValue="+8.2%"
        subtitle="Đang hoạt động"
        onClick={() => navigate('/students')}
      />

      <StatCard
        title="Đơn Yêu Cầu"
        value={stats.applications}
        icon={<FileIcon />}
        iconBgColor="yellow"
        trend="down"
        trendValue="-3.1%"
        subtitle="Chờ duyệt"
        onClick={() => navigate('/applications')}
      />

      <StatCard
        title="Đã Phê Duyệt"
        value={stats.approved}
        icon={<CheckIcon />}
        iconBgColor="green"
        trend="up"
        trendValue="+15.3%"
        subtitle="Trong tháng này"
        onClick={() => navigate('/approved')}
      />
    </div>
  );
}
```

### Với API Data

```jsx
import { useQuery } from '@tanstack/react-query';
import { StatCard } from '@components/common/Card';

function StatsSection() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats,
  });

  return (
    <div className="stat-card-grid">
      <StatCard
        title="Tổng Quỹ"
        value={data?.totalFunds || '0 đ'}
        icon={<MoneyIcon />}
        iconBgColor="blue"
        loading={isLoading}
      />
      {/* ... more cards */}
    </div>
  );
}
```

---

## 🎨 Custom Icons

```jsx
// Dùng react-icons
import { FaMoneyBillWave, FaUsers, FaFileAlt } from 'react-icons/fa';

<StatCard icon={<FaMoneyBillWave />} ... />

// Dùng SVG custom
const CustomIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="..." />
  </svg>
);

<StatCard icon={<CustomIcon />} ... />

// Dùng Ant Design Icons
import { DollarOutlined } from '@ant-design/icons';

<StatCard icon={<DollarOutlined />} ... />
```

---

## 🧪 Testing

### Chạy dev server
```bash
npm run dev
```

### Mở browser
```
http://localhost:3000/card-examples
```

### Xem tất cả variants
- Basic cards
- Clickable cards
- Loading state
- Compact/Large variants
- Special effects
- All icon colors

---

## ♿ Accessibility

✅ **Semantic HTML**: Dùng `<div>` với proper roles  
✅ **Keyboard**: Clickable cards có thể tab và enter  
✅ **Screen Reader**: Proper labels và aria attributes  
✅ **Color Contrast**: Đảm bảo WCAG AA  
✅ **Focus**: Visible focus state  

---

## 🎯 Design System Compliance

Component tuân thủ 100% design system:

✅ **Colors**: `$color-primary`, `$icon-bg-blue`, etc.  
✅ **Typography**: `$font-family`, `$text-3xl`, `$font-bold`  
✅ **Spacing**: `$space-4`, `$space-6`, etc.  
✅ **Shadows**: `$shadow-sm`, `$shadow-lg`  
✅ **Border Radius**: `$radius-xl`, `$radius-lg`  
✅ **Transitions**: `$transition-base`, `$ease-default`  

---

## 📚 Related Components

- **Button** - Action buttons
- **Badge** - Status indicators
- **Card** (generic) - Content containers

---

## 🚀 Next Steps

1. Tạo thêm card variants (InfoCard, ActionCard)
2. Thêm chart integration (mini charts trong card)
3. Thêm animation options
4. Thêm theme variants (dark mode)

---

**StatCard component sẵn sàng sử dụng! 🎉**

Truy cập: **http://localhost:3000/card-examples** để xem demo!
