import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import viVN from 'antd/locale/vi_VN'
import { useAuth } from './hooks/useAuth'
import '@styles/main.scss'

// Layouts
import MainLayout from './components/layout/MainLayout'
import AuthLayout from './components/layout/AuthLayout'

// Pages
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/Auth/LoginPage'
import DashboardPage from './pages/Dashboard/DashboardPage'
import NotFoundPage from './pages/NotFound/NotFoundPage'

// Component Examples
import ButtonExamples from './components/common/Button/Button.stories'
import StatCardExamples from './components/common/Card/StatCard.stories'
import InputExamples from './components/common/Input/Input.stories'
import TableExamples from './components/common/Table/Table.stories'
import StatusBadgeExamples from './components/common/StatusBadge/StatusBadge.stories'
import LogoExamples from './components/common/Logo/Logo.stories'
import SocialLinksExamples from './components/common/SocialLinks/SocialLinks.stories'
import LoginFormExamples from './components/forms/LoginForm/LoginForm.stories'
import PublicHeaderExamples from './components/layout/PublicHeader/PublicHeader.stories'
import PublicFooterExamples from './components/layout/PublicFooter/PublicFooter.stories'
import SidebarExamples from './components/layout/Sidebar/Sidebar.stories'
import HeroBannerExamples from './components/sections/HeroBanner/HeroBanner.stories'
import StatsSectionExamples from './components/sections/StatsSection/StatsSection.stories'

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
      <Routes>
        {/* Component Examples */}
        <Route path="/button-examples" element={<ButtonExamples />} />
        <Route path="/card-examples" element={<StatCardExamples />} />
        <Route path="/input-examples" element={<InputExamples />} />
        <Route path="/table-examples" element={<TableExamples />} />
        <Route path="/badge-examples" element={<StatusBadgeExamples />} />
        <Route path="/logo-examples" element={<LogoExamples />} />
        <Route path="/social-examples" element={<SocialLinksExamples />} />
        <Route path="/login-form-examples" element={<LoginFormExamples />} />
        <Route path="/header-examples" element={<PublicHeaderExamples />} />
        <Route path="/footer-examples" element={<PublicFooterExamples />} />
        <Route path="/sidebar-examples" element={<SidebarExamples />} />
        <Route path="/hero-examples" element={<HeroBannerExamples />} />
        <Route path="/stats-examples" element={<StatsSectionExamples />} />

        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        {/* Protected Routes */}
        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<DashboardPage />} />
        </Route>


      </Routes>
    </ConfigProvider>
  )
}

export default App
