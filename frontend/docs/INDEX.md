# 📖 Frontend Documentation Index

Chào mừng đến với tài liệu Frontend của **TVU Fund Management System**!

---

## 🚀 Bắt Đầu Nhanh

### Mới bắt đầu? Đọc theo thứ tự:

1. **[QUICK_START.md](./QUICK_START.md)** ⚡
   - Cài đặt nhanh trong 5 phút
   - Kiểm tra setup
   - Commands cơ bản
   - **→ ĐỌC ĐẦU TIÊN!**

2. **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** 🔧
   - Hướng dẫn cài đặt chi tiết từng bước
   - Giải thích từng config file
   - Troubleshooting
   - **→ Đọc nếu gặp vấn đề setup**

3. **[NEXT_STEPS.md](./NEXT_STEPS.md)** 🎯
   - Roadmap phát triển
   - Các bước tiếp theo sau setup
   - Code examples cho từng module
   - **→ Đọc sau khi setup xong**

---

## 📚 Tài Liệu Chi Tiết

### Kiến Trúc & Cấu Trúc

**[FRONTEND_STRUCTURE.md](./FRONTEND_STRUCTURE.md)** 🏗️
- Cấu trúc thư mục đầy đủ
- Tech stack overview
- Key features
- Coding conventions
- **→ Đọc để hiểu tổng quan dự án**

**[TOOLS_EXPLANATION.md](./TOOLS_EXPLANATION.md)** 🛠️
- Giải thích tại sao chọn từng tool
- So sánh với alternatives
- Bundle size comparison
- Learning curve
- **→ Đọc để hiểu lý do chọn tools**

### Theo Dõi Tiến Độ

**[CHECKLIST.md](./CHECKLIST.md)** ✅
- Checklist đầy đủ ~150 tasks
- Chia theo modules
- Track progress
- **→ Dùng để theo dõi tiến độ**

---

## 📋 Tài Liệu Theo Chủ Đề

### 1. Setup & Configuration
- [QUICK_START.md](./QUICK_START.md) - Cài đặt nhanh
- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Hướng dẫn chi tiết
- `.env.example` - Environment variables template
- `vite.config.js` - Vite configuration

### 2. State Management
- `src/stores/authStore.js` - Authentication state (Zustand)
- `src/stores/uiStore.js` - UI state (Zustand)
- `src/config/queryClient.js` - React Query config

### 3. Routing & Navigation
- `src/routes/ProtectedRoute.jsx` - Auth protection
- `src/routes/RoleBasedRoute.jsx` - Role-based access
- [NEXT_STEPS.md#routing](./NEXT_STEPS.md#bước-4-setup-routing) - Routing guide

### 4. Authentication
- `src/stores/authStore.js` - Auth state
- `src/hooks/useAuth.js` - Auth hook
- `src/hooks/usePermission.js` - Permission hook
- [NEXT_STEPS.md#authentication](./NEXT_STEPS.md#bước-3-xây-dựng-authentication) - Auth guide

### 5. API Integration
- `src/services/api.js` - Axios instance
- `src/services/*Service.js` - API services
- `src/config/queryClient.js` - React Query setup

### 6. Styling
- `src/styles/_variables.scss` - SCSS variables
- `src/styles/_mixins.scss` - SCSS mixins
- `src/config/theme.js` - Ant Design theme

### 7. Components
- `src/components/common/` - Reusable components
- `src/components/layout/` - Layout components
- `src/components/forms/` - Form components

### 8. Pages
- `src/pages/Auth/` - Authentication pages
- `src/pages/Dashboard/` - Dashboard pages
- `src/pages/Applications/` - Application module
- `src/pages/Funds/` - Fund module
- `src/pages/Donations/` - Donation module
- `src/pages/Users/` - User management

---

## 🎯 Workflows Phổ Biến

### Workflow 1: Tạo Page Mới
1. Tạo component trong `src/pages/`
2. Tạo route trong `src/routes/index.jsx`
3. Thêm menu item trong Sidebar
4. Tạo API service nếu cần
5. Integrate với React Query

### Workflow 2: Tạo API Service
1. Tạo file trong `src/services/`
2. Import axios instance từ `api.js`
3. Export các functions
4. Sử dụng với React Query trong component

### Workflow 3: Tạo Form
1. Sử dụng React Hook Form
2. Tạo validation schema với Yup
3. Sử dụng Ant Design form components
4. Handle submit với React Query mutation

### Workflow 4: Thêm Permission Check
1. Update `usePermission` hook
2. Sử dụng trong component
3. Conditionally render UI
4. Protect routes với RoleBasedRoute

---

## 🛠️ Tech Stack Summary

```
┌─────────────────────────────────────┐
│         React 18 + Vite             │
├─────────────────────────────────────┤
│  State Management                   │
│  ├─ Zustand (Global State)          │
│  └─ React Query (Server State)      │
├─────────────────────────────────────┤
│  Routing                            │
│  └─ React Router v6                 │
├─────────────────────────────────────┤
│  Forms & Validation                 │
│  ├─ React Hook Form                 │
│  └─ Yup                             │
├─────────────────────────────────────┤
│  UI & Styling                       │
│  ├─ Ant Design                      │
│  └─ SCSS                            │
├─────────────────────────────────────┤
│  HTTP Client                        │
│  └─ Axios                           │
├─────────────────────────────────────┤
│  Utilities                          │
│  ├─ date-fns                        │
│  ├─ React Icons                     │
│  └─ React Toastify                  │
└─────────────────────────────────────┘
```

**Chi tiết:** [TOOLS_EXPLANATION.md](./TOOLS_EXPLANATION.md)

---

## 📊 Project Status

### ✅ Completed
- [x] Project structure setup
- [x] Dependencies installation
- [x] Vite configuration
- [x] Zustand stores
- [x] React Query config
- [x] Ant Design theme
- [x] SCSS setup
- [x] Route components
- [x] Custom hooks
- [x] Documentation

### 🚧 In Progress
- [ ] Layout components
- [ ] Authentication
- [ ] Routing
- [ ] Dashboard pages

### 📋 Todo
- [ ] Application module
- [ ] Fund module
- [ ] Donation module
- [ ] User management
- [ ] Transaction module
- [ ] Testing
- [ ] Deployment

**Full checklist:** [CHECKLIST.md](./CHECKLIST.md)

---

## 🎓 Learning Path

### Beginner (Tuần 1-2)
1. Học React basics
2. Học Vite
3. Học React Router
4. Làm Layout + Login

### Intermediate (Tuần 3-4)
5. Học Zustand
6. Học React Query
7. Học React Hook Form
8. Làm Dashboard + CRUD

### Advanced (Tuần 5-6)
9. Học optimization techniques
10. Học testing
11. Polish UI/UX
12. Deploy

---

## 📞 Support & Resources

### Documentation
- [React Docs](https://react.dev/)
- [Vite Docs](https://vitejs.dev/)
- [Zustand Docs](https://zustand-demo.pmnd.rs/)
- [React Query Docs](https://tanstack.com/query/latest)
- [React Hook Form Docs](https://react-hook-form.com/)
- [Ant Design Docs](https://ant.design/)

### Troubleshooting
1. Kiểm tra [SETUP_GUIDE.md#troubleshooting](./SETUP_GUIDE.md#troubleshooting)
2. Kiểm tra console errors
3. Kiểm tra Network tab
4. Google error message
5. Hỏi AI assistant

---

## 🗺️ Roadmap

### Phase 1: Foundation (Week 1-2)
- ✅ Setup project
- 🚧 Layout components
- 🚧 Authentication
- 🚧 Routing
- 🚧 Basic dashboard

### Phase 2: Core Features (Week 3-4)
- 📋 Application CRUD
- 📋 Approval flow
- 📋 Fund management
- 📋 Donation management

### Phase 3: Advanced Features (Week 5-6)
- 📋 User management
- 📋 Transaction history
- 📋 Reports & analytics
- 📋 All dashboards

### Phase 4: Polish (Week 7-8)
- 📋 UI/UX improvements
- 📋 Performance optimization
- 📋 Testing
- 📋 Deployment

---

## 💡 Best Practices

### Code Organization
- ✅ One component per file
- ✅ Group related files together
- ✅ Use index.js for exports
- ✅ Keep components small and focused

### State Management
- ✅ Use Zustand for global state (auth, UI)
- ✅ Use React Query for server state (API data)
- ✅ Use local state (useState) for component-specific state

### API Calls
- ✅ Always use React Query
- ✅ Never use useState + useEffect for API calls
- ✅ Use query keys properly
- ✅ Handle loading and error states

### Forms
- ✅ Always use React Hook Form
- ✅ Always validate with Yup
- ✅ Use Ant Design form components
- ✅ Handle errors properly

### Styling
- ✅ Use Ant Design components first
- ✅ Use SCSS for custom styles
- ✅ Use mixins for reusable styles
- ✅ Follow BEM naming convention

---

## 🎯 Quick Links

### Getting Started
- [Quick Start](./QUICK_START.md) ⚡
- [Setup Guide](./SETUP_GUIDE.md) 🔧
- [Next Steps](./NEXT_STEPS.md) 🎯

### Reference
- [Structure](./FRONTEND_STRUCTURE.md) 🏗️
- [Tools](./TOOLS_EXPLANATION.md) 🛠️
- [Checklist](./CHECKLIST.md) ✅

### Code
- [Stores](./src/stores/)
- [Services](./src/services/)
- [Components](./src/components/)
- [Pages](./src/pages/)

---

## 📝 Notes

- Tài liệu này sẽ được cập nhật thường xuyên
- Mọi thay đổi lớn sẽ được ghi chú trong CHANGELOG
- Nếu có câu hỏi, hãy tạo issue hoặc hỏi team

---

**Happy Coding! 🚀**

*Last updated: 2026-05-02*
