# 🎨 Styles Structure - TVU Fund Management

## 📁 Cấu Trúc Thư Mục

```
styles/
├── _variables.scss      # Design tokens (màu, font, spacing, shadows)
├── _mixins.scss         # SCSS mixins & functions
├── _reset.scss          # CSS reset & scrollbar
├── _base.scss           # Base styles & typography utilities
├── _utilities.scss      # Utility classes (flex, gap, width)
├── main.scss            # Entry point - import tất cả
│
├── components/          # Component styles
│   ├── _buttons.scss    # Button variants (primary, secondary, ghost, icon)
│   ├── _cards.scss      # Card, stat-card, icon-wrap, progress, delta
│   ├── _forms.scss      # Input, label
│   ├── _badges.scss     # Badge/status tags
│   ├── _avatars.scss    # Avatar & avatar-group
│   ├── _tables.scss     # Table styles
│   ├── _modals.scss     # Modal overlay & box
│   └── _toasts.scss     # Toast notifications
│
└── layouts/             # Layout styles
    ├── _sidebar.scss    # Sidebar navigation items
    └── _grid.scss       # Grid layouts (stat cards)
```

---

## 📖 Giải Thích Từng File

### 1️⃣ **`_variables.scss`** - Design Tokens
**Nhiệm vụ:** Chứa tất cả biến thiết kế (Design System).

**Bao gồm:**
- 🎨 **Colors**: Background, brand, semantic, icons, text, border, status
- 📝 **Typography**: Font family, sizes, weights, line-height, letter-spacing
- 📏 **Spacing**: 8px grid system ($space-1 đến $space-16)
- 🔲 **Border Radius**: xs, sm, md, lg, xl, 2xl, full
- 🌑 **Shadows**: xs, sm, md, lg, xl, primary, sidebar
- ⚡ **Transitions**: Duration, easing, presets
- 📐 **Layout**: Sidebar width, topbar height, z-index layers

**Ví dụ:**
```scss
$color-primary: #3B6FF5;
$text-base: 0.875rem;
$space-4: 16px;
$shadow-sm: 0 2px 8px rgba(15, 23, 42, 0.06);
```

---

### 2️⃣ **`_mixins.scss`** - SCSS Mixins
**Nhiệm vụ:** Các đoạn code SCSS tái sử dụng.

**Bao gồm:**
- Flexbox helpers
- Responsive breakpoints
- Card styles
- Truncate text
- Custom scrollbar
- Transitions
- Shadows

**Ví dụ:**
```scss
@include flex-center;
@include card(24px);
@include respond-to('md') { ... }
```

---

### 3️⃣ **`_reset.scss`** - CSS Reset
**Nhiệm vụ:** Reset CSS mặc định của browser.

**Bao gồm:**
- Box-sizing reset
- Margin/padding reset
- Font smoothing
- Custom scrollbar (5px, mỏng, đẹp)

---

### 4️⃣ **`_base.scss`** - Base Styles
**Nhiệm vụ:** Styles cơ bản cho toàn trang.

**Bao gồm:**
- Body styles (font, color, background)
- Typography utilities:
  - `.text-heading` - Display heading (36px, bold)
  - `.text-title` - Card heading (22px, semibold)
  - `.text-subtitle` - Sub-heading (18px)
  - `.text-body` - Body text (14px)
  - `.text-secondary` - Secondary text (12.8px)
  - `.text-caption` - Caption (11.2px)
  - `.text-label` - Label ALL CAPS (11.2px)
  - `.text-stat` - Số liệu lớn (28px, bold)
- Divider

---

### 5️⃣ **`_utilities.scss`** - Utility Classes
**Nhiệm vụ:** Các class tiện ích dùng nhanh.

**Bao gồm:**
- Flexbox: `.flex`, `.flex-col`, `.items-center`, `.justify-between`
- Gap: `.gap-2`, `.gap-3`, `.gap-4`, `.gap-6`
- Width: `.w-full`

**Ví dụ:**
```html
<div class="flex items-center gap-4">
  <span>Icon</span>
  <span>Text</span>
</div>
```

---

### 6️⃣ **`components/_buttons.scss`** - Buttons
**Nhiệm vụ:** Tất cả button styles.

**Bao gồm:**
- Base button (`.btn`)
- Sizes: `.btn-sm`, `.btn-md`, `.btn-lg`
- Variants:
  - `.btn-primary` - Xanh với shadow màu
  - `.btn-secondary` - Trắng viền mờ
  - `.btn-ghost` - Transparent
  - `.btn-danger` - Đỏ
  - `.btn-icon` - Icon-only (36x36px)
- Toggle group: `.toggle-group`, `.toggle-btn`

---

### 7️⃣ **`components/_cards.scss`** - Cards
**Nhiệm vụ:** Card components.

**Bao gồm:**
- `.card` - Card cơ bản (hover effect)
- `.card-sm` - Card nhỏ
- `.stat-card` - Stat card (4 ô số liệu)
- `.icon-wrap` - Icon wrapper với variants (blue, purple, yellow, teal)
- `.delta` - Change indicator (+12.5%, up/down/flat)
- `.progress-track` & `.progress-fill` - Progress bar

---

### 8️⃣ **`components/_forms.scss`** - Forms
**Nhiệm vụ:** Form elements.

**Bao gồm:**
- `.input` - Input field (focus effect, shadow)
- `.input-label` - Label cho input

---

### 9️⃣ **`components/_badges.scss`** - Badges
**Nhiệm vụ:** Badge/status tags.

**Bao gồm:**
- `.badge` - Base badge
- Variants: `.badge-success`, `.badge-warning`, `.badge-danger`, `.badge-info`, `.badge-primary`

---

### 🔟 **`components/_avatars.scss`** - Avatars
**Nhiệm vụ:** Avatar components.

**Bao gồm:**
- `.avatar` - Avatar (36x36px, circular)
- `.avatar-group` - Stacked avatars

---

### 1️⃣1️⃣ **`components/_tables.scss`** - Tables
**Nhiệm vụ:** Table styles.

**Bao gồm:**
- `.table` - Table với header uppercase, hover effect

---

### 1️⃣2️⃣ **`components/_modals.scss`** - Modals
**Nhiệm vụ:** Modal/dialog.

**Bao gồm:**
- `.modal-overlay` - Overlay với blur
- `.modal-box` - Modal content box

---

### 1️⃣3️⃣ **`components/_toasts.scss`** - Toasts
**Nhiệm vụ:** Toast notifications.

**Bao gồm:**
- `.toast` - Toast notification box

---

### 1️⃣4️⃣ **`layouts/_sidebar.scss`** - Sidebar
**Nhiệm vụ:** Sidebar navigation.

**Bao gồm:**
- `.nav-item` - Navigation item (hover, active states)

---

### 1️⃣5️⃣ **`layouts/_grid.scss`** - Grids
**Nhiệm vụ:** Grid layouts.

**Bao gồm:**
- `.grid-stats` - Grid cho stat cards (responsive, auto-fit)

---

### 1️⃣6️⃣ **`main.scss`** - Entry Point
**Nhiệm vụ:** Import tất cả files theo thứ tự.

**Thứ tự import:**
1. Variables & Mixins
2. Reset & Base
3. Components
4. Layouts
5. Utilities

---

## 🎯 Cách Sử Dụng

### 1. Import trong component:
```jsx
import './ComponentName.scss';
```

### 2. Sử dụng classes:
```html
<!-- Card với stat -->
<div class="stat-card">
  <div class="icon-wrap icon-wrap--blue">
    <DollarIcon />
  </div>
  <div>
    <p class="text-label">Total Revenue</p>
    <p class="text-stat">$45,231</p>
    <div class="delta delta--up">
      <ArrowUpIcon />
      <span>+12.5%</span>
    </div>
  </div>
</div>

<!-- Button -->
<button class="btn btn-primary btn-lg">
  Create Fund
</button>

<!-- Badge -->
<span class="badge badge-success">Approved</span>
```

### 3. Sử dụng variables trong SCSS:
```scss
@use '@styles/variables' as *;

.my-component {
  background: $bg-card;
  padding: $space-6;
  border-radius: $radius-xl;
  box-shadow: $shadow-sm;
}
```

---

## 🎨 Design System Highlights

### Colors
- **Primary**: #3B6FF5 (Xanh chủ đạo)
- **Success**: #16A34A (Xanh lá)
- **Danger**: #DC2626 (Đỏ)
- **Warning**: #D97706 (Vàng cam)

### Typography
- **Font**: Plus Jakarta Sans
- **Base size**: 14px (0.875rem)
- **Scale**: xs (11.2px) → 4xl (36px)

### Spacing
- **Base grid**: 8px
- **Scale**: 4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px, 64px

### Shadows
- **VibeDash style**: Nhẹ, tinh tế, phân tầng rõ ràng
- **Primary shadow**: Màu xanh cho CTA buttons

---

## 💡 Best Practices

1. **Dùng variables** thay vì hardcode màu/spacing
2. **Dùng utility classes** cho layout nhanh
3. **Dùng component classes** cho UI components
4. **Tránh !important** - Dùng specificity đúng cách
5. **Mobile-first** - Viết base styles cho mobile, sau đó responsive

---

## 🔄 Cập Nhật

Khi cần thêm styles mới:
1. **Variables** → Thêm vào `_variables.scss`
2. **Component mới** → Tạo file trong `components/`
3. **Layout mới** → Tạo file trong `layouts/`
4. **Import** → Thêm vào `main.scss`

---

**Design System này được lấy cảm hứng từ VibeDash - Modern, clean, professional! 🎨**
