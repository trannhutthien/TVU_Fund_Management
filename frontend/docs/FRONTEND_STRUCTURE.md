# 🏗️ Cấu Trúc Frontend - TVU Fund Management

## 📦 Tech Stack

### Core
- **React 18** - UI Library
- **Vite** - Build Tool (nhanh, HMR tốt)
- **React Router v6** - Routing & Navigation

### State Management
- **Zustand** - Global state (đơn giản, nhẹ)
- **React Query** - Server state, caching, data fetching

### Form & Validation
- **React Hook Form** - Form handling (performance cao)
- **Yup** - Schema validation
- **@hookform/resolvers** - Kết nối RHF với Yup

### HTTP & API
- **Axios** - HTTP client với interceptors

### UI & Styling
- **Ant Design** - Component library (Table, Form, Modal, etc.)
- **SCSS** - CSS preprocessor
- **React Icons** - Icon library

### Utilities
- **date-fns** - Date manipulation
- **React Toastify** - Toast notifications

---

## 📁 Cấu Trúc Thư Mục

```
frontend/
├── public/                      # Static assets
│   └── logo.png
│
├── src/
│   ├── assets/                  # Images, fonts, static files
│   │   ├── images/
│   │   ├── fonts/
│   │   └── icons/
│   │
│   ├── components/              # Reusable components
│   │   ├── common/              # Common UI components
│   │   │   ├── Button/
│   │   │   ├── Input/
│   │   │   ├── Modal/
│   │   │   ├── Table/
│   │   │   ├── Card/
│   │   │   ├── Loading/
│   │   │   └── ErrorBoundary/
│   │   │
│   │   ├── layout/              # Layout components
│   │   │   ├── Header/
│   │   │   ├── Sidebar/
│   │   │   ├── Footer/
│   │   │   └── MainLayout/
│   │   │
│   │   └── forms/               # Form components
│   │       ├── LoginForm/
│   │       ├── ApplicationForm/
│   │       ├── FundForm/
│   │       └── DonationForm/
│   │
│   ├── pages/                   # Page components (routes)
│   │   ├── Auth/
│   │   │   ├── Login/
│   │   │   └── ForgotPassword/
│   │   │
│   │   ├── Dashboard/           # Dashboard cho từng role
│   │   │   ├── StudentDashboard/
│   │   │   ├── TeacherDashboard/
│   │   │   ├── AdminDashboard/
│   │   │   └── AccountantDashboard/
│   │   │
│   │   ├── Applications/        # Quản lý đơn yêu cầu
│   │   │   ├── ApplicationList/
│   │   │   ├── ApplicationDetail/
│   │   │   ├── CreateApplication/
│   │   │   └── ApprovalFlow/
│   │   │
│   │   ├── Funds/               # Quản lý quỹ
│   │   │   ├── FundList/
│   │   │   ├── FundDetail/
│   │   │   └── CreateFund/
│   │   │
│   │   ├── Donations/           # Quản lý tài trợ
│   │   │   ├── DonationList/
│   │   │   ├── DonationDetail/
│   │   │   └── CreateDonation/
│   │   │
│   │   ├── Users/               # Quản lý người dùng
│   │   │   ├── UserList/
│   │   │   ├── UserDetail/
│   │   │   └── UserProfile/
│   │   │
│   │   ├── Transactions/        # Lịch sử giao dịch
│   │   │   └── TransactionList/
│   │   │
│   │   └── NotFound/            # 404 page
│   │
│   ├── services/                # API services
│   │   ├── api.js               # Axios instance + interceptors
│   │   ├── authService.js       # Auth APIs
│   │   ├── applicationService.js
│   │   ├── fundService.js
│   │   ├── donationService.js
│   │   ├── donorService.js
│   │   ├── userService.js
│   │   ├── transactionService.js
│   │   └── index.js             # Export all services
│   │
│   ├── stores/                  # Zustand stores
│   │   ├── authStore.js         # Auth state
│   │   ├── userStore.js         # User state
│   │   └── uiStore.js           # UI state (sidebar, theme, etc.)
│   │
│   ├── context/                 # React Context API
│   │   ├── AuthContext.jsx      # Auth context provider
│   │   ├── ThemeContext.jsx     # Theme context provider
│   │   └── AppContext.jsx       # Global app context
│   │
│   ├── hooks/                   # Custom hooks
│   │   ├── useAuth.js           # Auth hook
│   │   ├── usePermission.js     # Permission check
│   │   ├── useDebounce.js       # Debounce hook
│   │   └── useLocalStorage.js   # LocalStorage hook
│   │
│   ├── routes/                  # Route configuration
│   │   ├── index.jsx            # Main routes
│   │   ├── ProtectedRoute.jsx   # Protected route wrapper
│   │   └── RoleBasedRoute.jsx   # Role-based route
│   │
│   ├── constants/               # Constants & enums
│   │   ├── roles.js             # User roles
│   │   ├── applicationStatus.js # Application statuses
│   │   ├── fundStatus.js        # Fund statuses
│   │   ├── apiEndpoints.js      # API endpoints
│   │   └── index.js
│   │
│   ├── utils/                   # Utility functions
│   │   ├── formatters.js        # Format date, currency, etc.
│   │   ├── validators.js        # Custom validators
│   │   ├── helpers.js           # Helper functions
│   │   └── storage.js           # LocalStorage helpers
│   │
│   ├── styles/                  # Global styles
│   │   ├── _variables.scss      # SCSS variables
│   │   ├── _mixins.scss         # SCSS mixins
│   │   ├── _reset.scss          # CSS reset
│   │   ├── _base.scss           # Base styles
│   │   ├── _utilities.scss      # Utility classes
│   │   ├── components/          # Component styles
│   │   ├── layouts/             # Layout styles
│   │   ├── pages/               # Page styles
│   │   └── main.scss            # Main entry
│   │
│   ├── config/                  # App configuration
│   │   ├── queryClient.js       # React Query config
│   │   └── theme.js             # Ant Design theme
│   │
│   ├── App.jsx                  # Main App component
│   └── main.jsx                 # Entry point
│
├── .env                         # Environment variables
├── .env.example                 # Example env file
├── .gitignore
├── index.html
├── package.json
├── vite.config.js               # Vite configuration
└── README.md
```
Cấu trúc thư mục bạn vừa đưa ra là một mô hình Standard React Enterprise (Dành cho dự án quy mô lớn). Việc chia nhỏ như thế này giúp dự án cực kỳ dễ mở rộng và nhiều người có thể cùng làm việc mà không bị xung đột code.

Dưới đây là giải thích chi tiết "nhiệm vụ" của từng phần trong bộ máy này:

1. Thư mục cốt lõi (src/)
- assets/: Nơi chứa tài nguyên "tĩnh" nhưng cần được Vite biên dịch (như ảnh logo, icon dạng SVG, font chữ tùy chỉnh).

- components/: Trái tim của giao diện.

  - common/: Những linh kiện nhỏ dùng ở mọi nơi (Nút bấm, ô nhập liệu, bảng). Bạn sửa 1 nút ở đây, toàn bộ web sẽ đổi theo.

  - layout/: Khung xương của web (Thanh menu bên trái, thanh tiêu đề trên cùng).

  - forms/: Nơi chứa logic các biểu mẫu phức tạp (như Form nộp đơn xin tiền). Tách riêng giúp trang Page ngắn gọn hơn.

- pages/: Đại diện cho các "Trang" mà người dùng nhìn thấy trên trình duyệt. Mỗi thư mục trong này thường gắn liền với một đường dẫn (URL). Ví dụ: pages/Auth/Login chính là trang localhost:3000/login.

- services/: "Bộ phận ngoại giao".

  - api.js: Cấu hình gốc cho Axios (gắn sẵn Token, định nghĩa URL của Server).

  - authService.js, fundService.js...: Mỗi file chứa các hàm gọi API riêng cho từng mảng. Ví dụ fundService chỉ lo việc lấy dữ liệu Quỹ.

2. Thư mục quản lý dữ liệu và logic (src/)
- stores/: "Kho chứa đồ chung" (Zustand). Khi bạn đăng nhập thành công, thông tin User sẽ được cất vào authStore.js để ở bất kỳ trang nào (Dashboard hay Profile) cũng có thể lấy ra dùng ngay mà không cần gọi lại API.

- hooks/: Những hàm logic dùng đi dùng lại.

  - useAuth.js: Giúp bạn kiểm tra nhanh: "Ông này đã đăng nhập chưa?".

  - usePermission.js: Kiểm tra: "Ông này có phải Kế toán không để cho hiện nút Chi tiền?".

- routes/: "Sơ đồ tòa nhà".

  - ProtectedRoute.jsx: Một "bức tường" ngăn chặn người chưa đăng nhập vào xem dữ liệu bên trong.

  - RoleBasedRoute.jsx: Chặn người dùng vào sai phòng (ví dụ Sinh viên cố tình vào trang Admin).

- constants/: Nơi định nghĩa các giá trị không đổi. Ví dụ thay vì viết chữ "Da giai ngan" ở khắp nơi, bạn định nghĩa STATUS_PAID = "Da giai ngan". Sau này muốn đổi chữ, bạn chỉ cần sửa 1 chỗ duy nhất.

- utils/: "Bộ dụng cụ sửa chữa".

  - formatters.js: Hàm đổi số 1000000 thành 1.000.000đ hoặc đổi ngày giờ hệ thống thành định dạng dễ đọc.

3. Thư mục giao diện (src/styles/)
_variables.scss: Nơi chứa các biến màu sắc và font chữ từ tệp CSS bạn đã gửi.

_mixins.scss: Các đoạn code CSS mẫu để dùng lại (ví dụ mẫu CSS cho việc đổ bóng card).

main.scss: Tệp tổng hợp, nơi bạn "import" tất cả các tệp con để tạo ra bộ áo hoàn chỉnh cho web.

4. Các tệp cấu hình bên ngoài
.env: "Tệp bảo mật". Chứa địa chỉ Backend. Khi bạn đổi từ máy cá nhân lên server thật, bạn chỉ cần đổi địa chỉ trong file này.

vite.config.js: "Bộ não điều khiển" của Vite. Tại đây bạn cấu hình các bí danh như @components để khi viết code không phải dùng những đường dẫn dài loằng ngoằng như ../../../../components.

package.json: "Danh sách mua sắm". Liệt kê tất cả thư viện (React, Ant Design, Axios...) và các lệnh để chạy dự án (npm run dev).
---

## � Giải Thích Chi Tiết Cấu Trúc

### 1️⃣ Thư Mục Cốt Lõi (src/)

#### 📁 `assets/`
**Nhiệm vụ:** Nơi chứa tài nguyên "tĩnh" nhưng cần được Vite biên dịch.

- `images/`: Ảnh logo, banner, background
- `fonts/`: Font chữ tùy chỉnh (nếu có)
- `icons/`: Icon dạng SVG hoặc PNG

**Ví dụ:** Logo trường, ảnh nền dashboard, icon tùy chỉnh.

---

#### 📁 `components/`
**Nhiệm vụ:** Trái tim của giao diện - chứa tất cả các thành phần UI có thể tái sử dụng.

##### 📂 `components/common/`
**Nhiệm vụ:** Những linh kiện nhỏ dùng ở mọi nơi trong ứng dụng.

- `Button/`: Nút bấm tùy chỉnh
- `Input/`: Ô nhập liệu
- `Modal/`: Cửa sổ popup
- `Table/`: Bảng dữ liệu
- `Card/`: Thẻ hiển thị thông tin
- `Loading/`: Hiệu ứng loading
- `ErrorBoundary/`: Xử lý lỗi React

**Lợi ích:** Bạn sửa 1 nút ở đây, toàn bộ web sẽ đổi theo. Đảm bảo tính nhất quán.

##### 📂 `components/layout/`
**Nhiệm vụ:** Khung xương của website.

- `Header/`: Thanh tiêu đề trên cùng (logo, menu user, thông báo)
- `Sidebar/`: Thanh menu bên trái (navigation)
- `Footer/`: Chân trang (copyright, version)
- `MainLayout/`: Layout tổng hợp (Header + Sidebar + Content + Footer)

**Ví dụ:** Mọi trang đều dùng chung MainLayout, chỉ thay đổi phần Content.

##### 📂 `components/forms/`
**Nhiệm vụ:** Chứa logic các biểu mẫu phức tạp.

- `LoginForm/`: Form đăng nhập
- `ApplicationForm/`: Form nộp đơn xin hỗ trợ
- `FundForm/`: Form tạo/sửa quỹ
- `DonationForm/`: Form tạo khoản tài trợ

**Lợi ích:** Tách riêng giúp trang Page ngắn gọn, dễ maintain.

---

#### 📁 `pages/`
**Nhiệm vụ:** Đại diện cho các "Trang" mà người dùng nhìn thấy trên trình duyệt.

Mỗi thư mục trong này thường gắn liền với một đường dẫn (URL).

**Ví dụ:**
- `pages/Auth/Login` → `localhost:3000/login`
- `pages/Dashboard/StudentDashboard` → `localhost:3000/dashboard`
- `pages/Applications/ApplicationList` → `localhost:3000/applications`

**Cấu trúc theo module:**
- `Auth/`: Trang đăng nhập, quên mật khẩu
- `Dashboard/`: Dashboard riêng cho từng vai trò
- `Applications/`: Quản lý đơn yêu cầu hỗ trợ
- `Funds/`: Quản lý quỹ
- `Donations/`: Quản lý tài trợ
- `Users/`: Quản lý người dùng
- `Transactions/`: Lịch sử giao dịch

---

#### 📁 `services/`
**Nhiệm vụ:** "Bộ phận ngoại giao" - giao tiếp với Backend API.

- `api.js`: **Trung tâm điều phối** - Cấu hình gốc cho Axios
  - Gắn sẵn Token vào mọi request
  - Định nghĩa URL của Server
  - Xử lý lỗi tập trung (401, 403, 500)

- `authService.js`: Các API liên quan đến xác thực
  - `login()`, `logout()`, `refreshToken()`, `changePassword()`

- `fundService.js`: Các API liên quan đến quỹ
  - `getAllFunds()`, `getFundById()`, `createFund()`, `updateFund()`

- `applicationService.js`: Các API liên quan đến đơn yêu cầu
- `donationService.js`: Các API liên quan đến tài trợ
- `userService.js`: Các API liên quan đến người dùng

**Lợi ích:** Tách biệt logic API, dễ test, dễ thay đổi endpoint.

---

### 2️⃣ Thư Mục Quản Lý Dữ Liệu & Logic (src/)

#### 📁 `stores/` (Zustand)
**Nhiệm vụ:** "Kho chứa đồ chung" - Global State Management.

- `authStore.js`: **Thông tin đăng nhập**
  - Lưu user, token
  - Khi đăng nhập thành công → lưu vào đây
  - Mọi trang đều có thể lấy ra dùng mà không cần gọi lại API

- `uiStore.js`: **Trạng thái giao diện**
  - Sidebar đang mở hay đóng?
  - Theme sáng hay tối?
  - Modal nào đang hiển thị?

- `userStore.js`: **Dữ liệu người dùng**
  - Danh sách users (nếu cần cache)

**Khi nào dùng Zustand?**
- ✅ Dữ liệu cần dùng ở nhiều nơi (user info, UI state)
- ✅ Dữ liệu không phải từ API (UI state)
- ❌ Dữ liệu từ API → Dùng React Query

---

#### 📁 `context/` (React Context API)
**Nhiệm vụ:** Chia sẻ dữ liệu giữa các component mà không cần truyền props.

- `AuthContext.jsx`: **Context cho authentication**
  - Cung cấp thông tin user, login/logout functions
  - Wrap toàn bộ app để mọi component đều truy cập được

- `ThemeContext.jsx`: **Context cho theme**
  - Quản lý theme sáng/tối
  - Cung cấp hàm toggle theme

- `AppContext.jsx`: **Context tổng hợp**
  - Các state/functions dùng chung toàn app

**Khi nào dùng Context?**
- ✅ Dữ liệu cần truyền sâu qua nhiều cấp component
- ✅ Thay thế prop drilling
- ❌ State phức tạp → Dùng Zustand
- ❌ Server data → Dùng React Query

**So sánh Context vs Zustand:**

| Feature | Context | Zustand |
|---------|---------|---------|
| Complexity | Phức tạp hơn | Đơn giản |
| Performance | Re-render nhiều | Tối ưu hơn |
| DevTools | Không có | Có |
| Use case | Prop drilling | Global state |

**Lưu ý:** Trong dự án này, chúng ta **ưu tiên dùng Zustand** vì đơn giản và performance tốt hơn. Context chỉ dùng khi thực sự cần thiết.

---

#### 📁 `hooks/`
**Nhiệm vụ:** Những hàm logic tái sử dụng (Custom Hooks).

- `useAuth.js`: **Hook xác thực**
  ```js
  const { user, isAuthenticated, login, logout } = useAuth();
  ```
  - Kiểm tra: "User đã đăng nhập chưa?"
  - Lấy thông tin user hiện tại

- `usePermission.js`: **Hook phân quyền**
  ```js
  const { canApproveLevel1, canCreateFund } = usePermission();
  ```
  - Kiểm tra: "User có quyền làm hành động X không?"
  - Dùng để ẩn/hiện button, menu

- `useDebounce.js`: **Hook delay input**
  - Dùng cho search box (chỉ gọi API sau khi user ngừng gõ 500ms)

- `useLocalStorage.js`: **Hook lưu trữ local**
  - Lưu/đọc dữ liệu từ localStorage

**Lợi ích:** Code gọn, logic tập trung, dễ test.

---

#### 📁 `routes/`
**Nhiệm vụ:** "Sơ đồ tòa nhà" - Quản lý điều hướng và bảo mật.

- `index.jsx`: **Định nghĩa tất cả routes**
  ```jsx
  <Route path="/login" element={<Login />} />
  <Route path="/dashboard" element={<Dashboard />} />
  ```

- `ProtectedRoute.jsx`: **"Bức tường bảo vệ"**
  - Chặn người chưa đăng nhập vào xem dữ liệu bên trong
  - Redirect về `/login` nếu chưa đăng nhập

- `RoleBasedRoute.jsx`: **"Kiểm soát phòng ban"**
  - Chặn user vào sai phòng
  - Ví dụ: Sinh viên cố vào trang Admin → Hiện 403 Forbidden

**Ví dụ sử dụng:**
```jsx
<ProtectedRoute>
  <RoleBasedRoute allowedRoles={[ROLES.ADMIN]}>
    <AdminDashboard />
  </RoleBasedRoute>
</ProtectedRoute>
```

---

#### 📁 `constants/`
**Nhiệm vụ:** Định nghĩa các giá trị không đổi (Constants).

- `roles.js`: **Vai trò người dùng**
  ```js
  export const ROLES = {
    STUDENT: 'Student',
    TEACHER: 'Teacher',
    ADMIN: 'Admin',
    ACCOUNTANT: 'Accountant',
  };
  ```

- `applicationStatus.js`: **Trạng thái đơn**
  ```js
  export const STATUS = {
    PENDING: 'Cho duyet',
    APPROVED: 'Da duyet',
    REJECTED: 'Tu choi',
  };
  ```

- `apiEndpoints.js`: **Danh sách API endpoints**

**Lợi ích:** 
- Thay vì viết chữ "Da giai ngan" ở khắp nơi
- Định nghĩa `STATUS_PAID = "Da giai ngan"`
- Muốn đổi chữ → Chỉ sửa 1 chỗ duy nhất

---

#### 📁 `utils/`
**Nhiệm vụ:** "Bộ dụng cụ sửa chữa" - Các hàm tiện ích.

- `formatters.js`: **Format dữ liệu**
  ```js
  formatCurrency(1000000) // → "1.000.000đ"
  formatDate(new Date()) // → "02/05/2026"
  ```

- `validators.js`: **Validate dữ liệu**
  ```js
  isValidEmail("test@tvu.edu.vn") // → true
  isValidPhone("0123456789") // → true
  ```

- `helpers.js`: **Các hàm helper**
  ```js
  getFullName(user) // → "Nguyễn Văn A"
  calculateAge(birthDate) // → 20
  ```

- `storage.js`: **LocalStorage helpers**
  ```js
  setItem('token', 'abc123')
  getItem('token') // → 'abc123'
  ```

---

### 3️⃣ Thư Mục Giao Diện (src/styles/)

#### 📁 `styles/`
**Nhiệm vụ:** Quản lý toàn bộ CSS/SCSS của dự án theo Design System VibeDash.

**Cấu trúc:**
```
styles/
├── _variables.scss      # Design tokens (màu, font, spacing, shadows)
├── _mixins.scss         # SCSS mixins & functions
├── _reset.scss          # CSS reset & custom scrollbar
├── _base.scss           # Base styles & typography utilities
├── _utilities.scss      # Utility classes (flex, gap, width)
├── main.scss            # Entry point - import tất cả
├── components/          # Component styles
│   ├── _buttons.scss    # Buttons (primary, secondary, ghost, icon, toggle)
│   ├── _cards.scss      # Cards (stat-card, icon-wrap, delta, progress)
│   ├── _forms.scss      # Forms (input, label)
│   ├── _badges.scss     # Badges (success, warning, danger, info)
│   ├── _avatars.scss    # Avatars & avatar-group
│   ├── _tables.scss     # Tables
│   ├── _modals.scss     # Modals (overlay, box)
│   └── _toasts.scss     # Toast notifications
└── layouts/             # Layout styles
    ├── _sidebar.scss    # Sidebar navigation
    └── _grid.scss       # Grid layouts
```

**Chi tiết:**

- **`_variables.scss`**: Design tokens
  - Colors (backgrounds, brand, semantic, icons, text, border, status)
  - Typography (Plus Jakarta Sans, sizes, weights, line-height)
  - Spacing (8px grid: 4px → 64px)
  - Border radius (xs → 2xl, full)
  - Shadows (VibeDash style: xs → xl, primary)
  - Transitions & animations
  - Layout constants (sidebar width, z-index layers)

- **`_mixins.scss`**: Reusable SCSS patterns
  ```scss
  @include flex-center;
  @include card(24px);
  @include respond-to('md') { ... }
  @include truncate(2); // 2 lines
  ```

- **`_reset.scss`**: CSS reset
  - Box-sizing, margin/padding reset
  - Font smoothing
  - Custom scrollbar (5px, mỏng, đẹp)

- **`_base.scss`**: Base styles
  - Body styles
  - Typography utilities: `.text-heading`, `.text-title`, `.text-body`, `.text-stat`, etc.
  - Divider

- **`_utilities.scss`**: Utility classes
  - Flexbox: `.flex`, `.flex-col`, `.items-center`
  - Gap: `.gap-2`, `.gap-3`, `.gap-4`
  - Width: `.w-full`

- **`components/`**: Component-specific styles
  - Mỗi component có file riêng
  - Dễ maintain, không conflict
  - Có thể import riêng lẻ nếu cần

- **`layouts/`**: Layout-specific styles
  - Sidebar navigation
  - Grid systems

**Design System Highlights:**
- **Font**: Plus Jakarta Sans (300-800 weights)
- **Primary Color**: #3B6FF5 (Xanh chủ đạo)
- **Typography Scale**: 11.2px → 36px (T-shirt sizing)
- **Spacing**: 8px base grid
- **Shadows**: Nhẹ, tinh tế, phân tầng rõ ràng (VibeDash style)

**Cách sử dụng:**
```jsx
// Import trong component
import '@styles/main.scss';

// Sử dụng classes
<div className="stat-card">
  <div className="icon-wrap icon-wrap--blue">
    <DollarIcon />
  </div>
  <p className="text-label">Total Revenue</p>
  <p className="text-stat">$45,231</p>
  <div className="delta delta--up">+12.5%</div>
</div>

<button className="btn btn-primary btn-lg">
  Create Fund
</button>

<span className="badge badge-success">Approved</span>
```

**Lợi ích:**
- ✅ Tổ chức tốt, dễ tìm
- ✅ Maintainable, scalable
- ✅ Reusable components
- ✅ Modern SCSS (`@use` thay `@import`)
- ✅ No deprecation warnings

**Tài liệu:** Xem chi tiết tại `src/styles/README.md`

---

### 4️⃣ Các Tệp Cấu Hình Bên Ngoài

#### 📄 `.env`
**Nhiệm vụ:** "Tệp bảo mật" - Chứa thông tin nhạy cảm.

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=TVU Fund Management
```

**Lợi ích:**
- Khi đổi từ máy cá nhân lên server thật
- Chỉ cần đổi địa chỉ trong file này
- Không cần sửa code

---

#### 📄 `vite.config.js`
**Nhiệm vụ:** "Bộ não điều khiển" của Vite.

**Cấu hình:**
- **Path aliases**: `@components`, `@pages`, `@stores`
  ```js
  import Button from '@components/common/Button';
  // Thay vì: import Button from '../../../../components/common/Button';
  ```

- **Proxy API**: Chuyển tiếp request từ frontend sang backend
  ```js
  '/api' → 'http://localhost:5000'
  ```

- **SCSS config**: Import tự động variables và mixins

---

#### 📄 `package.json`
**Nhiệm vụ:** "Danh sách mua sắm" - Quản lý dependencies.

**Chứa:**
- Danh sách thư viện (React, Ant Design, Axios...)
- Scripts để chạy dự án:
  ```json
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
  ```

---

## 🎯 Tóm Tắt Luồng Hoạt Động

### 1. User mở trang web
```
index.html → main.jsx → App.jsx → Routes → Page Component
```

### 2. Page cần dữ liệu từ API
```
Page → useQuery (React Query) → Service → Axios → Backend API
```

### 3. Page cần dữ liệu global
```
Page → useAuthStore (Zustand) → authStore.js
```

### 4. User submit form
```
Form → React Hook Form → Validate (Yup) → useMutation → Service → API
```

### 5. Hiển thị thông báo
```
Action → toast.success() → React Toastify → Hiện popup
```

---

## �🔑 Key Features

### 1. Authentication Flow
- Login/Logout
- Token management (localStorage)
- Auto token refresh
- Protected routes

### 2. Role-Based Access Control (RBAC)
- Student (Sinh viên)
- Teacher (Giáo viên chủ nhiệm)
- Academic Staff (Giáo vụ)
- Admin
- Accountant (Kế toán)

### 3. Main Features by Role

#### Student
- Xem danh sách quỹ
- Nộp đơn yêu cầu hỗ trợ
- Xem trạng thái đơn
- Xem lịch sử giao dịch cá nhân

#### Teacher (GV Chủ nhiệm)
- Phê duyệt đơn cấp 1
- Xem danh sách sinh viên
- Xem lịch sử phê duyệt

#### Academic Staff (Giáo vụ)
- Phê duyệt đơn cấp 2
- Quản lý danh sách đơn
- Báo cáo thống kê

#### Admin
- Phê duyệt đơn cấp 2
- Quản lý quỹ
- Quản lý người dùng
- Quản lý vai trò
- Dashboard tổng quan

#### Accountant (Kế toán)
- Phê duyệt đơn cấp 3 (cuối cùng)
- Quản lý giao dịch
- Quản lý tài trợ
- Báo cáo tài chính

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Setup Environment Variables
```bash
cp .env.example .env
# Edit .env with your backend URL
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
```

---

## 📝 Coding Conventions

### Component Structure
```jsx
// 1. Imports
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'antd';
import './ComponentName.scss';

// 2. Component
const ComponentName = ({ prop1, prop2 }) => {
  // 3. Hooks
  const navigate = useNavigate();
  
  // 4. State
  const [state, setState] = useState(null);
  
  // 5. Effects
  useEffect(() => {
    // ...
  }, []);
  
  // 6. Handlers
  const handleClick = () => {
    // ...
  };
  
  // 7. Render
  return (
    <div className="component-name">
      {/* JSX */}
    </div>
  );
};

// 8. Export
export default ComponentName;
```

### Naming Conventions
- **Components**: PascalCase (e.g., `UserProfile.jsx`)
- **Hooks**: camelCase with 'use' prefix (e.g., `useAuth.js`)
- **Services**: camelCase with 'Service' suffix (e.g., `authService.js`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)
- **CSS Classes**: kebab-case (e.g., `user-profile`)

---

## 🔧 Configuration Files

### vite.config.js
- Path aliases (@components, @pages, etc.)
- Proxy configuration for API
- Build optimization

### .env
```
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=TVU Fund Management
```

---

## 📚 Libraries Documentation

- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [React Router](https://reactrouter.com/)
- [Zustand](https://zustand-demo.pmnd.rs/)
- [React Query](https://tanstack.com/query/latest)
- [React Hook Form](https://react-hook-form.com/)
- [Ant Design](https://ant.design/)
- [Axios](https://axios-http.com/)
