# 🎯 Các Bước Tiếp Theo - Frontend Development

## ✅ Đã Hoàn Thành

- [x] Setup project structure
- [x] Install dependencies (React, Vite, Ant Design, React Query, Zustand, etc.)
- [x] Configure Vite with path aliases
- [x] Setup Zustand stores (authStore, uiStore)
- [x] Setup React Query configuration
- [x] Setup Ant Design theme
- [x] Create SCSS mixins and variables
- [x] Create Protected Routes and Role-Based Routes
- [x] Create usePermission hook
- [x] Create project documentation

## 📋 Bước 1: Cài Đặt & Kiểm Tra (NGAY BÂY GIỜ)

```bash
cd frontend
npm install
npm install zustand  # Cài thêm Zustand
cp .env.example .env # Tạo file .env
npm run dev          # Chạy dev server
```

**Kiểm tra:**
- [ ] Dev server chạy thành công tại http://localhost:3000
- [ ] Không có lỗi trong console
- [ ] Path aliases hoạt động

---

## 🏗️ Bước 2: Xây Dựng Layout Cơ Bản

### 2.1. Main Layout Component
**File**: `src/components/layout/MainLayout/MainLayout.jsx`

```jsx
import { Layout } from 'antd';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';

const { Content } = Layout;

const MainLayout = ({ children }) => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar />
      <Layout>
        <Header />
        <Content style={{ margin: '24px 16px', padding: 24 }}>
          {children}
        </Content>
        <Footer />
      </Layout>
    </Layout>
  );
};

export default MainLayout;
```

### 2.2. Header Component
**File**: `src/components/layout/Header/Header.jsx`
- Logo
- User menu (dropdown)
- Notifications
- Logout button

### 2.3. Sidebar Component
**File**: `src/components/layout/Sidebar/Sidebar.jsx`
- Navigation menu theo role
- Collapsible sidebar
- Active menu item highlight

### 2.4. Footer Component
**File**: `src/components/layout/Footer/Footer.jsx`
- Copyright
- Version info

---

## 🔐 Bước 3: Xây Dựng Authentication

### 3.1. Login Page
**File**: `src/pages/Auth/Login/Login.jsx`

**Features:**
- Login form (email/MSSV + password)
- Form validation với Yup
- Loading state
- Error handling
- Remember me checkbox
- Forgot password link

**API Integration:**
```jsx
import { useMutation } from '@tanstack/react-query';
import { authService } from '@services';
import useAuthStore from '@stores/authStore';

const loginMutation = useMutation({
  mutationFn: authService.login,
  onSuccess: (data) => {
    // Save to store
    login(data.user, data.token);
    // Redirect to dashboard
    navigate('/dashboard');
  },
});
```

### 3.2. Update API Service
**File**: `src/services/api.js`

Thêm interceptors:
```jsx
// Request interceptor - attach token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired, logout
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

## 🛣️ Bước 4: Setup Routing

### 4.1. Main Routes
**File**: `src/routes/index.jsx`

```jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import RoleBasedRoute from './RoleBasedRoute';
import { ROLES } from '@constants/roles';

// Pages
import Login from '@pages/Auth/Login';
import StudentDashboard from '@pages/Dashboard/StudentDashboard';
import AdminDashboard from '@pages/Dashboard/AdminDashboard';
// ... import other pages

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        
        {/* Protected routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <MainLayout>
              <Navigate to="/dashboard" replace />
            </MainLayout>
          </ProtectedRoute>
        } />
        
        {/* Student routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={ROLES.STUDENT}>
              <MainLayout>
                <StudentDashboard />
              </MainLayout>
            </RoleBasedRoute>
          </ProtectedRoute>
        } />
        
        {/* Admin routes */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={ROLES.ADMIN}>
              <MainLayout>
                <AdminDashboard />
              </MainLayout>
            </RoleBasedRoute>
          </ProtectedRoute>
        } />
        
        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};
```

### 4.2. Update App.jsx
```jsx
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ConfigProvider } from 'antd';
import { ToastContainer } from 'react-toastify';
import { queryClient } from '@config/queryClient';
import { antdTheme } from '@config/theme';
import AppRoutes from '@routes';
import 'react-toastify/dist/ReactToastify.css';
import '@styles/main.scss';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider theme={antdTheme}>
        <AppRoutes />
        <ToastContainer position="top-right" autoClose={3000} />
      </ConfigProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
```

---

## 📊 Bước 5: Xây Dựng Dashboard (Theo Role)

### 5.1. Student Dashboard
**File**: `src/pages/Dashboard/StudentDashboard/StudentDashboard.jsx`

**Features:**
- Thống kê đơn của sinh viên (pending, approved, rejected)
- Danh sách quỹ có thể apply
- Lịch sử đơn đã nộp
- Quick action: Nộp đơn mới

### 5.2. Teacher Dashboard
**File**: `src/pages/Dashboard/TeacherDashboard/TeacherDashboard.jsx`

**Features:**
- Danh sách đơn cần phê duyệt cấp 1
- Thống kê đơn đã duyệt/từ chối
- Danh sách sinh viên

### 5.3. Admin Dashboard
**File**: `src/pages/Dashboard/AdminDashboard/AdminDashboard.jsx`

**Features:**
- Tổng quan hệ thống (users, funds, applications, donations)
- Charts (applications by status, funds by status)
- Recent activities
- Quick actions

### 5.4. Accountant Dashboard
**File**: `src/pages/Dashboard/AccountantDashboard/AccountantDashboard.jsx`

**Features:**
- Danh sách đơn cần phê duyệt cấp 3
- Thống kê tài chính
- Transactions overview
- Fund balance

---

## 📝 Bước 6: Xây Dựng Application Module

### 6.1. Application List
**File**: `src/pages/Applications/ApplicationList/ApplicationList.jsx`

**Features:**
- Table với pagination, sorting, filtering
- Search by MSSV, name
- Filter by status, fund
- Actions: View, Approve, Reject (theo role)

**React Query:**
```jsx
const { data, isLoading } = useQuery({
  queryKey: queryKeys.applications.list(filters),
  queryFn: () => applicationService.getApplications(filters),
});
```

### 6.2. Application Detail
**File**: `src/pages/Applications/ApplicationDetail/ApplicationDetail.jsx`

**Features:**
- Thông tin chi tiết đơn
- Timeline phê duyệt (3 cấp)
- Documents/attachments
- Approval actions (nếu có quyền)

### 6.3. Create Application (Student only)
**File**: `src/pages/Applications/CreateApplication/CreateApplication.jsx`

**Features:**
- Form với React Hook Form + Yup
- Select fund
- Upload documents
- Preview before submit

**React Query Mutation:**
```jsx
const createMutation = useMutation({
  mutationFn: applicationService.createApplication,
  onSuccess: () => {
    toast.success('Nộp đơn thành công!');
    queryClient.invalidateQueries(queryKeys.applications.all);
    navigate('/applications');
  },
});
```

### 6.4. Approval Flow Component
**File**: `src/pages/Applications/ApprovalFlow/ApprovalFlow.jsx`

**Features:**
- Hiển thị 3 cấp phê duyệt
- Status của từng cấp
- Approve/Reject buttons (theo role)
- Comment/reason input

---

## 💼 Bước 7: Xây Dựng Fund Module

### 7.1. Fund List
**File**: `src/pages/Funds/FundList/FundList.jsx`

**Features:**
- Card grid hoặc table view
- Filter by status
- Search by name
- Actions: View, Edit, Delete (Admin/Accountant only)

### 7.2. Fund Detail
**File**: `src/pages/Funds/FundDetail/FundDetail.jsx`

**Features:**
- Fund information
- Balance & transactions
- Donations list
- Applications using this fund

### 7.3. Create/Edit Fund
**File**: `src/pages/Funds/FundForm/FundForm.jsx`

**Features:**
- Form với validation
- Fund name, description
- Initial balance
- Status

---

## 💵 Bước 8: Xây Dựng Donation Module

### 8.1. Donation List
**File**: `src/pages/Donations/DonationList/DonationList.jsx`

### 8.2. Donation Detail
**File**: `src/pages/Donations/DonationDetail/DonationDetail.jsx`

### 8.3. Create Donation
**File**: `src/pages/Donations/CreateDonation/CreateDonation.jsx`

---

## 👥 Bước 9: Xây Dựng User Management (Admin only)

### 9.1. User List
**File**: `src/pages/Users/UserList/UserList.jsx`

### 9.2. User Detail
**File**: `src/pages/Users/UserDetail/UserDetail.jsx`

### 9.3. User Profile
**File**: `src/pages/Users/UserProfile/UserProfile.jsx`

---

## 💳 Bước 10: Xây Dựng Transaction Module

### 10.1. Transaction List
**File**: `src/pages/Transactions/TransactionList/TransactionList.jsx`

---

## 🎨 Bước 11: Xây Dựng Common Components

### 11.1. Loading Component
**File**: `src/components/common/Loading/Loading.jsx`

### 11.2. Error Boundary
**File**: `src/components/common/ErrorBoundary/ErrorBoundary.jsx`

### 11.3. Empty State
**File**: `src/components/common/EmptyState/EmptyState.jsx`

### 11.4. Confirmation Modal
**File**: `src/components/common/ConfirmModal/ConfirmModal.jsx`

### 11.5. Status Badge
**File**: `src/components/common/StatusBadge/StatusBadge.jsx`

---

## 🧪 Bước 12: Testing (Optional)

### 12.1. Setup Testing
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

### 12.2. Write Tests
- Unit tests for utilities
- Component tests
- Integration tests

---

## 🚀 Bước 13: Optimization & Deployment

### 13.1. Code Splitting
```jsx
const AdminDashboard = lazy(() => import('@pages/Dashboard/AdminDashboard'));
```

### 13.2. Build for Production
```bash
npm run build
```

### 13.3. Deploy
- Vercel
- Netlify
- AWS S3 + CloudFront
- Nginx

---

## 📝 Thứ Tự Ưu Tiên Phát Triển

### Phase 1: Core (1-2 tuần)
1. ✅ Setup project (DONE)
2. Layout components (Header, Sidebar, Footer)
3. Login page + Authentication
4. Routing setup
5. Student Dashboard (basic)

### Phase 2: Main Features (2-3 tuần)
6. Application List
7. Application Detail
8. Create Application (Student)
9. Approval Flow (Teacher, Admin, Accountant)
10. Fund List & Detail

### Phase 3: Advanced Features (1-2 tuần)
11. User Management (Admin)
12. Donation Management
13. Transaction History
14. All Dashboards (complete)

### Phase 4: Polish (1 tuần)
15. Error handling
16. Loading states
17. Responsive design
18. Performance optimization
19. Testing

---

## 💡 Tips

1. **Làm từng module một**, đừng làm tất cả cùng lúc
2. **Test thường xuyên** với backend API
3. **Commit code thường xuyên** với Git
4. **Sử dụng React Query** cho mọi API calls
5. **Tái sử dụng components** càng nhiều càng tốt
6. **Follow coding conventions** đã định nghĩa
7. **Đọc docs** của các libraries khi cần

---

## 🎯 Mục Tiêu Ngắn Hạn (Tuần Này)

- [ ] Cài đặt và chạy được dev server
- [ ] Tạo Layout components (Header, Sidebar, Footer)
- [ ] Tạo Login page
- [ ] Setup routing cơ bản
- [ ] Tạo Student Dashboard đơn giản

---

**Bắt đầu từ Bước 1 ngay bây giờ! 🚀**
