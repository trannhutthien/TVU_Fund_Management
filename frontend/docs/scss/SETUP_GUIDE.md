# 🚀 Hướng Dẫn Setup Frontend - TVU Fund Management

## 📋 Yêu Cầu Hệ Thống

- **Node.js**: >= 16.x (khuyến nghị 18.x hoặc 20.x)
- **npm**: >= 8.x hoặc **yarn**: >= 1.22.x
- **Git**: Latest version

Kiểm tra version:
```bash
node --version
npm --version
```

---

## 🔧 Bước 1: Cài Đặt Dependencies

### 1.1. Di chuyển vào thư mục frontend
```bash
cd frontend
```

### 1.2. Cài đặt packages
```bash
npm install
```

Hoặc nếu dùng yarn:
```bash
yarn install
```

### 1.3. Cài thêm Zustand (nếu chưa có)
```bash
npm install zustand
```

---

## ⚙️ Bước 2: Cấu Hình Environment Variables

### 2.1. Copy file .env.example
```bash
cp .env.example .env
```

### 2.2. Chỉnh sửa file .env
```env
# API Configuration
VITE_API_BASE_URL=http://localhost:5000/api

# App Configuration
VITE_APP_NAME=TVU Fund Management System
VITE_APP_VERSION=1.0.0

# Environment
VITE_NODE_ENV=development

# Optional
VITE_ENABLE_DEVTOOLS=true
```

**Lưu ý**: 
- Đảm bảo `VITE_API_BASE_URL` trỏ đúng địa chỉ backend của bạn
- Tất cả env variables phải bắt đầu với `VITE_` để Vite có thể đọc được

---

## 🏗️ Bước 3: Cấu Trúc Thư Mục

Cấu trúc đã được tạo sẵn:

```
frontend/
├── src/
│   ├── assets/          ✅ Static files
│   ├── components/      ✅ Reusable components
│   ├── pages/           ✅ Page components
│   ├── services/        ✅ API services
│   ├── stores/          ✅ Zustand stores (NEW)
│   ├── hooks/           ✅ Custom hooks
│   ├── routes/          ✅ Route config (NEW)
│   ├── constants/       ✅ Constants
│   ├── utils/           ✅ Utilities
│   ├── styles/          ✅ SCSS styles
│   ├── config/          ✅ App config (NEW)
│   ├── App.jsx
│   └── main.jsx
```

---

## 🎯 Bước 4: Các File Quan Trọng Đã Tạo

### 4.1. Vite Config (`vite.config.js`)
- ✅ Path aliases (@components, @pages, etc.)
- ✅ Proxy configuration cho API
- ✅ SCSS configuration
- ✅ Build optimization

### 4.2. Zustand Stores
- ✅ `stores/authStore.js` - Authentication state
- ✅ `stores/uiStore.js` - UI state (sidebar, theme, etc.)

### 4.3. React Query Config
- ✅ `config/queryClient.js` - Query client configuration
- ✅ Query keys organization

### 4.4. Theme Config
- ✅ `config/theme.js` - Ant Design theme customization

### 4.5. Routes
- ✅ `routes/ProtectedRoute.jsx` - Auth protection
- ✅ `routes/RoleBasedRoute.jsx` - Role-based access control

### 4.6. Hooks
- ✅ `hooks/usePermission.js` - Permission checking

### 4.7. SCSS
- ✅ `styles/_mixins.scss` - Reusable SCSS mixins

---

## 🚀 Bước 5: Chạy Development Server

### 5.1. Start dev server
```bash
npm run dev
```

Server sẽ chạy tại: **http://localhost:3000**

### 5.2. Các commands khác
```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

---

## 📦 Bước 6: Cài Đặt Thêm (Optional)

### 6.1. ESLint & Prettier (Code formatting)
```bash
npm install -D prettier eslint-config-prettier eslint-plugin-prettier
```

### 6.2. React DevTools
- Cài extension: [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)

### 6.3. React Query DevTools (đã có trong @tanstack/react-query)
Thêm vào `App.jsx`:
```jsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Trong component
<ReactQueryDevtools initialIsOpen={false} />
```

---

## 🔍 Bước 7: Kiểm Tra Setup

### 7.1. Kiểm tra path aliases
Tạo file test:
```jsx
// src/test.jsx
import useAuthStore from '@stores/authStore';
import { ROLES } from '@constants/roles';

console.log('Path aliases working!');
```

### 7.2. Kiểm tra SCSS
Tạo file test:
```scss
// src/test.scss
@import '@styles/_variables.scss';
@import '@styles/_mixins.scss';

.test {
  @include flex-center;
  color: var(--color-primary);
}
```

### 7.3. Kiểm tra API connection
```jsx
import api from '@services/api';

// Test API
api.get('/test').then(res => console.log(res));
```

---

## 🎨 Bước 8: Customize Theme (Optional)

### 8.1. Chỉnh màu chủ đạo
Edit `src/config/theme.js`:
```js
export const antdTheme = {
  token: {
    colorPrimary: '#YOUR_COLOR', // Thay màu của TVU
    // ...
  },
};
```

### 8.2. Chỉnh SCSS variables
Edit `src/styles/_variables.scss`:
```scss
$primary-color: #1890ff; // Thay màu
$font-family: 'Your Font', sans-serif;
```

---

## 📚 Bước 9: Tài Liệu Tham Khảo

### Core Libraries
- [React](https://react.dev/) - UI Library
- [Vite](https://vitejs.dev/) - Build Tool
- [React Router](https://reactrouter.com/) - Routing

### State Management
- [Zustand](https://zustand-demo.pmnd.rs/) - State Management
- [React Query](https://tanstack.com/query/latest) - Server State

### Form & Validation
- [React Hook Form](https://react-hook-form.com/) - Form Handling
- [Yup](https://github.com/jquense/yup) - Validation

### UI & Styling
- [Ant Design](https://ant.design/) - Component Library
- [SCSS](https://sass-lang.com/) - CSS Preprocessor

### HTTP Client
- [Axios](https://axios-http.com/) - HTTP Client

---

## 🐛 Troubleshooting

### Lỗi: "Cannot find module '@components/...'"
**Giải pháp**: 
- Restart dev server
- Kiểm tra `vite.config.js` có đúng path aliases không

### Lỗi: "SCSS variables not found"
**Giải pháp**:
- Kiểm tra `vite.config.js` có config SCSS đúng không
- Đảm bảo file `_variables.scss` và `_mixins.scss` tồn tại

### Lỗi: "API connection failed"
**Giải pháp**:
- Kiểm tra backend đang chạy
- Kiểm tra `VITE_API_BASE_URL` trong `.env`
- Kiểm tra proxy config trong `vite.config.js`

### Lỗi: Port 3000 đã được sử dụng
**Giải pháp**:
```bash
# Thay đổi port trong vite.config.js
server: {
  port: 3001, // Đổi port khác
}
```

---

## ✅ Checklist Setup

- [ ] Node.js và npm đã cài đặt
- [ ] Dependencies đã cài đặt (`npm install`)
- [ ] File `.env` đã tạo và cấu hình
- [ ] Dev server chạy thành công (`npm run dev`)
- [ ] Path aliases hoạt động
- [ ] SCSS compile thành công
- [ ] API connection thành công
- [ ] Zustand stores hoạt động
- [ ] React Query hoạt động
- [ ] Ant Design components hiển thị đúng

---

## 🎯 Bước Tiếp Theo

Sau khi setup xong, bạn có thể:

1. **Xây dựng Layout chính** (Header, Sidebar, Footer)
2. **Tạo trang Login**
3. **Setup routing đầy đủ**
4. **Tạo các pages chính** (Dashboard, Applications, Funds, etc.)
5. **Kết nối với Backend APIs**

---

## 💡 Tips

1. **Sử dụng React Query** cho mọi API calls thay vì useState + useEffect
2. **Sử dụng Zustand** cho global state (auth, UI)
3. **Sử dụng React Hook Form** cho tất cả forms
4. **Tận dụng Ant Design components** thay vì tự build từ đầu
5. **Organize code theo feature** thay vì theo type
6. **Viết reusable components** để tái sử dụng
7. **Sử dụng SCSS mixins** để tránh duplicate CSS

---

## 📞 Hỗ Trợ

Nếu gặp vấn đề, hãy:
1. Kiểm tra console log
2. Kiểm tra Network tab (DevTools)
3. Đọc error message kỹ
4. Google error message
5. Hỏi AI assistant 😊

---

**Chúc bạn code vui vẻ! 🚀**
