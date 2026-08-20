import React from 'react'
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import viVN from 'antd/locale/vi_VN'
import { useAuth } from './hooks/useAuth'
import { SystemSettingsProvider } from './hooks/useSystemSettings'
import ScrollToTop from './components/common/ScrollToTop'
import AuthGuard from './components/auth/AuthGuard'
import RoleBasedRoute from './routes/RoleBasedRoute'
import '@styles/main.scss'

// Layouts
import MainLayout from './components/layout/MainLayout'
import AuthLayout from './components/layout/AuthLayout'
import StaffLayout from './components/layout/StaffLayout'
import PublicLayoutWithSidebar from './components/layout/PublicLayoutWithSidebar'

// Pages - Public
import LandingPage from './pages/Public/LandingPage/LandingPage'
import FundsPage from './pages/Public/FundsPage/FundsPage'
import FundDetailPage from './pages/Public/FundDetailPage'
import DonorsPage from './pages/Public/DonorsPage/DonorsPage'
import GuidelinesPage from './pages/Public/GuidelinesPage/GuidelinesPage'
import TrackPage from './pages/Public/TrackPage/TrackPage'
import NewsDetailPage from './pages/Public/NewsDetailPage/NewsDetailPage'
import NewsPage from './pages/Public/NewsPage'
import TestimonialsPage from './pages/Public/TestimonialsPage'
import PublicLichSuGiaoDichPage from './pages/Public/LichSuGiaoDichPage/PublicLichSuGiaoDichPage'
import PublicThongKeThuChiPage from './pages/Public/PublicThongKeThuChiPage/PublicThongKeThuChiPage'
import PublicKhoanTaiTroPage from './pages/Public/PublicKhoanTaiTroPage/PublicKhoanTaiTroPage'
import AboutFundPage from './pages/Public/AboutFundPage/AboutFundPage'
import AlumniPage from './pages/Public/AlumniPage/AlumniPage'
import PublicDonationPage from './pages/Public/PublicDonationPage/PublicDonationPage'

// Pages - Auth
import LoginPage from './pages/Auth/LoginPage'
import RegisterPage from './pages/Auth/RegisterPage'
import GoogleAuthCallbackPage from './pages/Auth/GoogleAuthCallbackPage'

// Pages - Student (Role 4)
import ProfilePage from './pages/User/Student/ProfilePage/ProfilePage'
import ApplyPage from './pages/Public/ApplyPage/ApplyPage'
import DashboardPage from './pages/User/Student/Dashboard/DashboardPage'
import NghiaVuHoanTraPage from './pages/User/Student/NghiaVuHoanTra/index.jsx'

// Pages - Staff (Role 1, 2, 3)
import AdminDashboard from './pages/Staff/Admin/AdminDashboard'
import HiThongPhanQuyenPage from './pages/Staff/Admin/HiThongPhanQuyenPage/HiThongPhanQuyenPage'
import PheDuyetPage from './pages/Staff/Admin/PheDuyetPage/PheDuyetPage'
// import StudentShowcasePage from './pages/Staff/Admin/StudentShowcasePage/StudentShowcasePage' // REMOVED: Feature không còn sử dụng
import DanhGiaPage from './pages/Staff/Admin/DanhGiaPage'
import AdminBaoCaoPage from './pages/Staff/Admin/BaoCaoPage'
import NhatKyPage from './pages/Staff/Admin/NhatKyPage/NhatKyPage'

import KeToanDashboard from './pages/Staff/KeToan/KeToanDashboard'
import GiaiNganDetailPage from './pages/Staff/KeToan/GiaiNganPage/GiaiNganDetailPage/GiaiNganDetailPage'
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
import PhanBoPage from './pages/Staff/CanBo/PhanBoPage/PhanBoPage'
import DuToanNamPage from './pages/Staff/CanBo/DuToanNamPage/DuToanNamPage'
import TaoTinTucPage from './pages/Admin/TinTuc/TaoTinTucPage'
import GiamSatNghiemThuCongNoPage from './pages/Staff/Shared/GiamSatNghiemThuCongNoPage/index.jsx'
import NghiemThuDetailPage from './pages/Staff/Shared/GiamSatNghiemThuCongNoPage/NghiemThuDetailPage/NghiemThuDetailPage'
import ContractDetailPage from './pages/Staff/Shared/GiamSatNghiemThuCongNoPage/ContractDetailPage/index.jsx'
import ProposalListPage from './pages/Staff/Shared/ProposalListPage/ProposalListPage'
import ProposalDetailPage from './pages/Staff/Shared/ProposalListPage/ProposalDetailPage/ProposalDetailPage'


// Protected Route: Bảo vệ routes cần đăng nhập
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) return <div>Loading...</div>
  if (!user) return <Navigate to="/" replace />
  return children
}

function App() {
  return (
    <ConfigProvider locale={viVN}>
      <SystemSettingsProvider>
        <AuthGuard>
          <ScrollToTop />
        <Routes>
          {/* Public Routes - Wrap trong PublicLayoutWithSidebar */}
          <Route element={<PublicLayoutWithSidebar />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/funds" element={<FundsPage />} />
            <Route path="/funds/:id" element={<FundDetailPage />} />
            <Route path="/donors" element={<DonorsPage />} />
            <Route path="/honors" element={<DonorsPage />} /> {/* Redirect old path to DonorsPage */}
            <Route path="/guidelines" element={<GuidelinesPage />} />
            <Route path="/profile" element={<ProfilePage />} /> {/* Trang cá nhân - chỉ hiện menu khi đã đăng nhập */}
            <Route path="/apply" element={<ApplyPage />} />  {/* Nộp đơn - tự redirect về login nếu chưa đăng nhập */}
            <Route path="/track/:uuid" element={<TrackPage />} />
            <Route path="/track" element={<TrackPage />} />
            <Route path="/news/:id" element={<NewsDetailPage />} />
            <Route path="/news" element={<NewsPage />} />
            <Route path="/testimonials" element={<TestimonialsPage />} />
            <Route path="/lich-su-giao-dich" element={<PublicLichSuGiaoDichPage />} />
            <Route path="/thong-ke-cong-khai" element={<PublicThongKeThuChiPage />} />
            <Route path="/khoan-tai-tro-cong-khai" element={<PublicKhoanTaiTroPage />} />
            <Route path="/ve-quy-phat-trien" element={<AboutFundPage />} />
            <Route path="/alumni" element={<AlumniPage />} />
            <Route path="/dong-gop" element={<PublicDonationPage />} />
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

          {/* Protected Routes - Standalone (no sidebar) */}
          <Route element={<ProtectedRoute><Outlet /></ProtectedRoute>}>
            <Route path="/nghia-vu-hoan-tra" element={<NghiaVuHoanTraPage />} />
          </Route>

          {/* Staff Routes - với StaffSidebar */}
          <Route element={<ProtectedRoute><StaffLayout /></ProtectedRoute>}>
            {/* Redirects for base paths */}
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/ke-toan" element={<Navigate to="/ke-toan/dashboard" replace />} />
            <Route path="/can-bo" element={<Navigate to="/can-bo/dashboard" replace />} />
            <Route path="/kiem-soat" element={<Navigate to="/kiem-soat/dashboard" replace />} />

            {/* Admin Routes (role_id = 1) */}
            <Route element={<RoleBasedRoute allowedRoles={[1]} redirectTo="/" />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<CanBoUserManagementPage isAdmin={true} />} />
              <Route path="/admin/nhan-su" element={<CanBoUserManagementPage isAdmin={true} initialTab="chuc_vu" />} />
              <Route path="/admin/roles" element={<HiThongPhanQuyenPage />} />
              <Route path="/admin/nhat-ky" element={<NhatKyPage />} />
              <Route path="/admin/xet-duyet" element={<XetDuyetPage userRole={1} />} />
              <Route path="/admin/phe-duyet" element={<PheDuyetPage />} />
              <Route path="/admin/quy" element={<CanBoQuyListPage isAdmin={true} />} />
              <Route path="/admin/quy/tao" element={<CanBoTaoQuyPage />} />
              <Route path="/admin/quy/sua/:id" element={<CanBoTaoQuyPage />} />
              <Route path="/admin/phan-bo" element={<PhanBoPage />} />
              <Route path="/admin/du-toan" element={<DuToanNamPage />} />
              <Route path="/admin/de-xuat-chuong-trinh" element={<Navigate to="/admin/quy?tab=de_xuat" replace />} />
              <Route path="/admin/de-xuat" element={<ProposalListPage />} />
              <Route path="/admin/de-xuat/:id" element={<ProposalDetailPage />} />
              <Route path="/admin/nha-tai-tro" element={<CanBoNhaTaiTroPage isAdmin={true} />} />
              <Route path="/admin/khoan-tai-tro" element={<KeToanKhoanTaiTroPage />} />
              <Route path="/admin/giao-dich" element={<KeToanLichSuGiaoDichPage />} />
              <Route path="/admin/chung-tu" element={<DoiSoatChungTuPage />} />
              {/* <Route path="/admin/sinh-vien-noi-bat" element={<StudentShowcasePage />} /> */} {/* REMOVED: Feature không còn sử dụng */}
              <Route path="/admin/danhgia" element={<DanhGiaPage />} />
              <Route path="/admin/tin-tuc" element={<div><h1>Tin tức & Sự kiện</h1></div>} />
              <Route path="/admin/tintuc/tao" element={<TaoTinTucPage />} />
              <Route path="/admin/tintuc/chinh-sua/:id" element={<TaoTinTucPage />} />
              <Route path="/admin/bao-cao" element={<AdminBaoCaoPage />} />
            </Route>

            {/* Kế toán Routes (role_id = 2) */}
            <Route element={<RoleBasedRoute allowedRoles={[1, 2]} redirectTo="/" />}>
              <Route path="/ke-toan/dashboard" element={<KeToanDashboard />} />
              <Route path="/ke-toan/xet-duyet" element={<XetDuyetPage userRole={2} />} />
              <Route path="/ke-toan/giai-ngan" element={<Navigate to="/ke-toan/xet-duyet" replace />} />
              <Route path="/ke-toan/giai-ngan/:request_id" element={<GiaiNganDetailPage />} />
              <Route path="/ke-toan/giao-dich" element={<KeToanLichSuGiaoDichPage />} />
              <Route path="/ke-toan/khoan-tai-tro" element={<KeToanKhoanTaiTroPage />} />
              <Route path="/ke-toan/de-xuat" element={<ProposalListPage />} />
              <Route path="/ke-toan/de-xuat/:id" element={<ProposalDetailPage />} />
              <Route path="/ke-toan/bao-cao" element={<ThongKeThuChiPage />} />
              <Route path="/ke-toan/chung-tu" element={<DoiSoatChungTuPage />} />
              <Route path="/ke-toan/phan-bo" element={<PhanBoPage />} />
              <Route path="/ke-toan/du-toan" element={<DuToanNamPage />} />
            </Route>

            {/* Cán bộ Quỹ Routes (role_id = 3) */}
            <Route element={<RoleBasedRoute allowedRoles={[1, 3]} redirectTo="/" />}>
              <Route path="/can-bo/dashboard" element={<CanBoDashboard />} />
              <Route path="/can-bo/xet-duyet" element={<XetDuyetPage userRole={3} />} />
              <Route path="/can-bo/quy" element={<CanBoQuyListPage />} />
              <Route path="/can-bo/quy/tao" element={<CanBoTaoQuyPage />} />
              <Route path="/can-bo/quy/sua/:id" element={<CanBoTaoQuyPage />} />
              <Route path="/can-bo/phan-bo" element={<PhanBoPage />} />
              <Route path="/can-bo/du-toan" element={<DuToanNamPage />} />
              <Route path="/can-bo/de-xuat-chuong-trinh" element={<Navigate to="/can-bo/quy?tab=de_xuat" replace />} />
              <Route path="/can-bo/de-xuat" element={<ProposalListPage />} />
              <Route path="/can-bo/de-xuat/:id" element={<ProposalDetailPage />} />
              <Route path="/can-bo/nha-tai-tro" element={<CanBoNhaTaiTroPage />} />
              <Route path="/can-bo/users" element={<CanBoUserManagementPage />} />
              {/* <Route path="/can-bo/sinh-vien-noi-bat" element={<StudentShowcasePage />} /> */} {/* REMOVED: Feature không còn sử dụng */}
              <Route path="/can-bo/danhgia" element={<DanhGiaPage />} />
              <Route path="/can-bo/tin-tuc" element={<div><h1>Tin tức & Sự kiện</h1></div>} />
              <Route path="/can-bo/tintuc/tao" element={<TaoTinTucPage />} />
              <Route path="/can-bo/tintuc/chinh-sua/:id" element={<TaoTinTucPage />} />
              <Route path="/can-bo/bao-cao" element={<CanBoBaoCaoPage />} />
            </Route>

            {/* Chi tiết đơn xét duyệt - dùng chung cho Admin/Kế toán/Cán bộ */}
            <Route element={<RoleBasedRoute allowedRoles={[1, 2, 3]} redirectTo="/" />}>
              <Route path="/xet-duyet/:request_id" element={<XetDuyetDetail />} />
            </Route>

            {/* Ban Kiem Soat Routes (role_id = 5) - read-only */}
            <Route element={<RoleBasedRoute allowedRoles={[1, 5]} redirectTo="/" />}>
              <Route path="/kiem-soat/dashboard" element={<AdminDashboard />} />
              <Route path="/kiem-soat/quy" element={<CanBoQuyListPage />} />
              <Route path="/kiem-soat/de-xuat/:id" element={<ProposalDetailPage />} />
              <Route path="/kiem-soat/phe-duyet" element={<PheDuyetPage />} />
              <Route path="/kiem-soat/khoan-tai-tro" element={<KeToanKhoanTaiTroPage />} />
              <Route path="/kiem-soat/giao-dich" element={<KeToanLichSuGiaoDichPage />} />
              <Route path="/kiem-soat/bao-cao" element={<AdminBaoCaoPage />} />
            </Route>

            {/* Shared Routes - Admin, Ke toan, Can bo, Ban kiem soat */}
            <Route element={<RoleBasedRoute allowedRoles={[1, 2, 3, 5]} redirectTo="/" />}>
              <Route path="/giam-sat" element={<GiamSatNghiemThuCongNoPage />} />
              <Route path="/giam-sat/nghiem-thu/:yeucauhotroId" element={<NghiemThuDetailPage />} />
              <Route path="/giam-sat/cong-no/:yeucauhotroId" element={<ContractDetailPage />} />
            </Route>

            {/* Proposal Management - Admin, Ke toan, Can bo */}
            <Route element={<RoleBasedRoute allowedRoles={[1, 2, 3]} redirectTo="/" />}>
              <Route path="/staff/proposals" element={<ProposalListPage />} />
            </Route>


          </Route>

          {/* Wildcard Fallback Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </AuthGuard>
      </SystemSettingsProvider>
    </ConfigProvider>
  )
}

export default App;
