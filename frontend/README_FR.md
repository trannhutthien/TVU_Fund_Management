# 🎓 TVU Fund Management - Frontend

Hệ thống quản lý quỹ phát triển Trường Đại học Trà Vinh - Giao diện người dùng

## 📚 Tài Liệu

- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Hướng dẫn cài đặt chi tiết
- **[FRONTEND_STRUCTURE.md](./FRONTEND_STRUCTURE.md)** - Cấu trúc dự án và conventions

## 🛠️ Tech Stack

- **React 18** + **Vite** - UI Framework & Build Tool
- **React Router v6** - Routing
- **Zustand** - State Management
- **React Query** - Server State & Data Fetching
- **React Hook Form** + **Yup** - Form Handling & Validation
- **Ant Design** - UI Component Library
- **Axios** - HTTP Client
- **SCSS** - Styling

## 🚀 Quick Start

```bash
# 1. Cài đặt dependencies
npm install

# 2. Tạo file .env
cp .env.example .env

# 3. Chỉnh sửa .env với backend URL của bạn
# VITE_API_BASE_URL=http://localhost:5000/api

# 4. Chạy development server
npm run dev

# 5. Mở browser tại http://localhost:3000
```

## 📦 Available Scripts

```bash
# Development
npm run dev          # Start dev server (port 3000)

# Production
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
```

## 🏗️ Project Structure

```
src/
├── assets/          # Static files (images, fonts, icons)
├── components/      # Reusable components
│   ├── common/      # Common UI components
│   ├── layout/      # Layout components
│   └── forms/       # Form components
├── pages/           # Page components (routes)
├── services/        # API services
├── stores/          # Zustand stores
├── hooks/           # Custom hooks
├── routes/          # Route configuration
├── constants/       # Constants & enums
├── utils/           # Utility functions
├── styles/          # Global SCSS
├── config/          # App configuration
├── App.jsx          # Main App component
└── main.jsx         # Entry point
```

## 🎯 Key Features

### Authentication & Authorization
- ✅ JWT-based authentication
- ✅ Role-based access control (RBAC)
- ✅ Protected routes
- ✅ Auto token refresh

### User Roles
- 👨‍🎓 **Student** (Sinh viên) - Nộp đơn yêu cầu hỗ trợ
- 👨‍🏫 **Teacher** (Giáo viên chủ nhiệm) - Phê duyệt cấp 1
- 👔 **Academic Staff** (Giáo vụ) - Phê duyệt cấp 2
- 👨‍💼 **Admin** - Quản lý hệ thống, phê duyệt cấp 2
- 💰 **Accountant** (Kế toán) - Phê duyệt cấp 3, quản lý tài chính

### Main Modules
- 📝 **Applications** - Quản lý đơn yêu cầu hỗ trợ
- 💼 **Funds** - Quản lý quỹ
- 💵 **Donations** - Quản lý tài trợ
- 👥 **Users** - Quản lý người dùng
- 📊 **Dashboard** - Thống kê và báo cáo
- 💳 **Transactions** - Lịch sử giao dịch

## 🔧 Configuration

### Environment Variables
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=TVU Fund Management System
VITE_APP_VERSION=1.0.0
```

### Path Aliases
```js
@/              → src/
@components/    → src/components/
@pages/         → src/pages/
@services/      → src/services/
@stores/        → src/stores/
@hooks/         → src/hooks/
@utils/         → src/utils/
@constants/     → src/constants/
@styles/        → src/styles/
@assets/        → src/assets/
@config/        → src/config/
@routes/        → src/routes/
```

## 📖 Usage Examples

### Using Zustand Store
```jsx
import useAuthStore from '@stores/authStore';

function MyComponent() {
  const { user, login, logout } = useAuthStore();
  
  return <div>Welcome {user?.HoTen}</div>;
}
```

### Using React Query
```jsx
import { useQuery } from '@tanstack/react-query';
import { fundService } from '@services';
import { queryKeys } from '@config/queryClient';

function FundList() {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.funds.list(),
    queryFn: () => fundService.getAllFunds(),
  });
  
  if (isLoading) return <div>Loading...</div>;
  
  return <div>{/* Render funds */}</div>;
}
```

### Using React Hook Form
```jsx
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const schema = yup.object({
  email: yup.string().email().required(),
  password: yup.string().min(6).required(),
});

function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });
  
  const onSubmit = (data) => {
    console.log(data);
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}
      
      <input type="password" {...register('password')} />
      {errors.password && <span>{errors.password.message}</span>}
      
      <button type="submit">Login</button>
    </form>
  );
}
```

### Using Permission Hook
```jsx
import usePermission from '@hooks/usePermission';

function ApplicationActions() {
  const { canApproveLevel1, canApproveLevel2 } = usePermission();
  
  return (
    <div>
      {canApproveLevel1 && <button>Phê duyệt cấp 1</button>}
      {canApproveLevel2 && <button>Phê duyệt cấp 2</button>}
    </div>
  );
}
```

## 🎨 Styling

### Using SCSS Mixins
```scss
@import '@styles/_variables.scss';
@import '@styles/_mixins.scss';

.my-component {
  @include flex-center;
  @include card(24px);
  
  color: var(--color-primary);
  
  @include respond-to('md') {
    padding: 32px;
  }
}
```

### Using Ant Design Theme
```jsx
import { ConfigProvider } from 'antd';
import { antdTheme } from '@config/theme';

function App() {
  return (
    <ConfigProvider theme={antdTheme}>
      {/* Your app */}
    </ConfigProvider>
  );
}
```

## 🔐 Security

- ✅ JWT tokens stored in localStorage
- ✅ Axios interceptors for auto token attachment
- ✅ Protected routes with authentication check
- ✅ Role-based access control
- ✅ XSS protection with React's built-in escaping
- ✅ CSRF protection (if needed, implement in backend)

## 📱 Responsive Design

- ✅ Mobile-first approach
- ✅ Breakpoints: xs (480px), sm (576px), md (768px), lg (992px), xl (1200px), xxl (1600px)
- ✅ Ant Design responsive grid system
- ✅ Custom SCSS mixins for responsive design

## 🧪 Testing (TODO)

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:coverage
```

## 📈 Performance Optimization

- ✅ Code splitting with React.lazy()
- ✅ Route-based code splitting
- ✅ React Query caching
- ✅ Vite's fast HMR
- ✅ Production build optimization
- ✅ Image optimization
- ✅ Tree shaking

## 🐛 Debugging

### React DevTools
Install: [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)

### React Query DevTools
Already included in development mode.

### Redux DevTools (for Zustand)
```bash
npm install -D @redux-devtools/extension
```

## 📝 Coding Standards

- ✅ ESLint for code linting
- ✅ Prettier for code formatting (optional)
- ✅ Component naming: PascalCase
- ✅ File naming: PascalCase for components, camelCase for utilities
- ✅ CSS class naming: kebab-case
- ✅ Consistent import order

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

Private project - TVU Fund Management System

## 👥 Team

- **Developer**: [Your Name]
- **University**: Trường Đại học Trà Vinh

---

**Happy Coding! 🚀**
