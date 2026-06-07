import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import viVN from 'antd/locale/vi_VN'
import { useAuth } from './hooks/useAuth'
import ScrollToTop from './components/common/ScrollToTop'
import AuthGuard from './components/auth/AuthGuard'
import '@styles/main.scss'

// Layouts
import MainLayout from './components/layout/MainLayout'
import AuthLayout from './components/layout/AuthLayout'
import StaffLayout from './components/layout/StaffLayout'
import PublicLayoutWithSidebar from './components/layout/PublicLayoutWithSidebar'

// Pages - Public
import LandingPage from './pages/Public/LandingPage/LandingPage'
import FundsPage from './pages/Public/FundsPage/FundsPage'
import DonorsPage from './pages/Public/DonorsPage/DonorsPage'
import GuidelinesPage from './pages/Public/GuidelinesPage/GuidelinesPage'

// Pages - Auth
import LoginPage from './pages/Auth/LoginPage'
import RegisterPage from './pages/Auth/RegisterPage'
import GoogleAuthCallbackPage from './pages/Auth/GoogleAuthCallbackPage'

// Pages - Student (Role 4)
import ProfilePage from './pages/User/Student/ProfilePage/ProfilePage'
import ApplyPage from './pages/User/Student/ApplyPage/ApplyPage'
import DashboardPage from './pages/User/Student/Dashboard/DashboardPage'

// Pages - Staff (Role 1, 2, 3)
import AdminDashboard from './pages/Staff/Admin/AdminDashboard'
import AdminUsersPage from './pages/Staff/Admin/UsersPage'
import HiThongPhanQuyenPage from './pages/Staff/Admin/HiThongPhanQuyenPage/HiThongPhanQuyenPage'
import AdminApplicationsPage from './pages/Staff/Admin/ApplicationsPage'
import PheDuyetPage from './pages/Staff/Admin/PheDuyetPage/PheDuyetPage'
import StudentShowcasePage from './pages/Staff/Admin/StudentShowcasePage/StudentShowcasePage'
import AdminBaoCaoPage from './pages/Staff/Admin/BaoCaoPage'
import NhatKyPage from './pages/Staff/Admin/NhatKyPage/NhatKyPage'

import KeToanDashboard from './pages/Staff/KeToan/KeToanDashboard'
import KeToanGiaiNganPage from './pages/Staff/KeToan/GiaiNganPage'
import KeToanLichSuGiaoDichPage from './pages/Staff/KeToan/LichSuGiaoDichPage'
import KeToanKhoanTaiTroPage from './pages/Staff/KeToan/KhoanTaiTroPage/KhoanTaiTroPage'
import ThongKeThuChiPage from './pages/Staff/KeToan/ThongKeThuChiPage'
import DoiSoatChungTuPage from './pages/Staff/KeToan/DoiSoatChungTuPage'

import CanBoDashboard from './pages/Staff/CanBo/CanBoDashboard'
import XetDuyetPage from './pages/Staff/CanBo/XetDuyetPage/XetDuyetPage'
import XetDuyetDetail from './pages/Staff/CanBo/XetDuyetPage/XetDuyetDetail/XetDuyetDetail'
import CanBoQuyListPage from './pages/Staff/CanBo/QuyListPage/QuyListPage'
import CanBoTaoQuyPage from './pages/Staff/CanBo/TaoQuyPage/TaoQuyPage'
import CanBoNhaTaiTroPage from './pages/Staff/CanBo/NhaTaiTroPage/NhaTaiTroPage'
import CanBoUserManagementPage from './pages/Staff/CanBo/UserManagementPage/UserManagementPage'
import CanBoBaoCaoPage from './pages/Staff/CanBo/BaoCaoPage'
// Protected Route: Bảo vệ routes cần đăng nhập
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) return <div>Loading...</div>
  if (!user) return <Navigate to="/login" replace />
  return children
}

function App() {
  return (
    <ConfigProvider locale={viVN}>
      <AuthGuard>
        <ScrollToTop />
        <Routes>
          {/* Public Routes - Wrap trong PublicLayoutWithSidebar */}
          <Route element={<PublicLayoutWithSidebar />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/funds" element={<FundsPage />} />
            <Route path="/donors" element={<DonorsPage />} />
            <Route path="/honors" element={<DonorsPage />} /> {/* Redirect old path to DonorsPage */}
            <Route path="/guidelines" element={<GuidelinesPage />} />
            <Route path="/profile" element={<ProfilePage />} /> {/* Trang cá nhân - chỉ hiện menu khi đã đăng nhập */}
            <Route path="/apply" element={<ApplyPage />} />  {/* Nộp đơn - tự redirect về login nếu chưa đăng nhập */}
          </Route>
          
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* Google OAuth Callback - không wrap AuthLayout */}
          <Route path="/auth/google/callback" element={<GoogleAuthCallbackPage />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<DashboardPage />} />
          </Route>

          {/* Staff Routes - với StaffSidebar */}
          <Route element={<ProtectedRoute><StaffLayout /></ProtectedRoute>}>
            {/* Redirects for base paths */}
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/ke-toan" element={<Navigate to="/ke-toan/dashboard" replace />} />
            <Route path="/can-bo" element={<Navigate to="/can-bo/dashboard" replace />} />

            {/* Admin Routes (role_id = 1) */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<CanBoUserManagementPage isAdmin={true} />} />
            <Route path="/admin/roles" element={<HiThongPhanQuyenPage />} />
            <Route path="/admin/nhat-ky" element={<NhatKyPage />} />
            <Route path="/admin/xet-duyet" element={<XetDuyetPage isAdmin={true} />} />
            <Route path="/admin/phe-duyet" element={<PheDuyetPage />} />
            <Route path="/admin/quy" element={<CanBoQuyListPage isAdmin={true} />} />
            <Route path="/admin/quy/tao" element={<CanBoTaoQuyPage />} />
            <Route path="/admin/quy/sua/:id" element={<CanBoTaoQuyPage />} />
            <Route path="/admin/nha-tai-tro" element={<CanBoNhaTaiTroPage isAdmin={true} />} />
            <Route path="/admin/khoan-tai-tro" element={<KeToanKhoanTaiTroPage />} />
            <Route path="/admin/giao-dich" element={<KeToanLichSuGiaoDichPage />} />
            <Route path="/admin/sinh-vien-noi-bat" element={<StudentShowcasePage />} />
            <Route path="/admin/tin-tuc" element={<div><h1>Tin tức & Sự kiện</h1></div>} />
            <Route path="/admin/bao-cao" element={<AdminBaoCaoPage />} />

            {/* Kế toán Routes (role_id = 2) */}
            <Route path="/ke-toan/dashboard" element={<KeToanDashboard />} />
            <Route path="/ke-toan/giai-ngan" element={<KeToanGiaiNganPage />} />
            <Route path="/ke-toan/giao-dich" element={<KeToanLichSuGiaoDichPage />} />
            <Route path="/ke-toan/khoan-tai-tro" element={<KeToanKhoanTaiTroPage />} />
            <Route path="/ke-toan/bao-cao" element={<ThongKeThuChiPage />} />
            <Route path="/ke-toan/chung-tu" element={<DoiSoatChungTuPage />} />

            {/* Cán bộ Quỹ Routes (role_id = 3) */}
            <Route path="/can-bo/dashboard" element={<CanBoDashboard />} />
            <Route path="/can-bo/xet-duyet" element={<XetDuyetPage />} />
            <Route path="/xet-duyet/:request_id" element={<XetDuyetDetail />} />
            <Route path="/can-bo/quy" element={<CanBoQuyListPage />} />
            <Route path="/can-bo/quy/tao" element={<CanBoTaoQuyPage />} />
            <Route path="/can-bo/quy/sua/:id" element={<CanBoTaoQuyPage />} />
            <Route path="/can-bo/nha-tai-tro" element={<CanBoNhaTaiTroPage />} />
            <Route path="/can-bo/users" element={<CanBoUserManagementPage />} />
            <Route path="/can-bo/sinh-vien-noi-bat" element={<StudentShowcasePage />} />
            <Route path="/can-bo/tin-tuc" element={<div><h1>Tin tức & Sự kiện</h1></div>} />
            <Route path="/can-bo/bao-cao" element={<CanBoBaoCaoPage />} />
          </Route>

          {/* Wildcard Fallback Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthGuard>
    </ConfigProvider>
  )
}

export default App
