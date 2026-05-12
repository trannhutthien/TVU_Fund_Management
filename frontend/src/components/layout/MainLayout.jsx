import React, { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { Layout, Menu, Dropdown, Avatar, Button } from 'antd'
import {
  DashboardOutlined,
  FileTextOutlined,
  DollarOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import { useAuth } from '@hooks/useAuth'
import { ROLES } from '@constants'

const { Header, Sider, Content } = Layout

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  // Menu items dựa trên vai trò
  const getMenuItems = () => {
    const items = [
      {
        key: '/dashboard',
        icon: <DashboardOutlined />,
        label: 'Dashboard',
      },
    ]

    // Student
    if (user?.TenVaiTro === ROLES.STUDENT) {
      items.push({
        key: '/my-applications',
        icon: <FileTextOutlined />,
        label: 'Đơn của tôi',
      })
    }

    // GV Chu Nhiem, Giao Vu, Admin, Ke Toan
    if ([ROLES.GV_CHU_NHIEM, ROLES.GIAO_VU, ROLES.ADMIN, ROLES.KE_TOAN].includes(user?.TenVaiTro)) {
      items.push({
        key: '/applications',
        icon: <FileTextOutlined />,
        label: 'Quản lý đơn',
      })
    }

    // Admin, Ke Toan
    if ([ROLES.ADMIN, ROLES.KE_TOAN].includes(user?.TenVaiTro)) {
      items.push({
        key: '/funds',
        icon: <DollarOutlined />,
        label: 'Quản lý quỹ',
      })
    }

    // Admin only
    if (user?.TenVaiTro === ROLES.ADMIN) {
      items.push({
        key: '/users',
        icon: <TeamOutlined />,
        label: 'Quản lý người dùng',
      })
    }

    return items
  }

  const handleMenuClick = ({ key }) => {
    navigate(key)
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Thông tin cá nhân',
      onClick: () => navigate('/profile'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      onClick: handleLogout,
    },
  ]

  return (
    <Layout className="main-layout">
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div style={{ padding: '16px', textAlign: 'center', color: 'white' }}>
          <h2>{collapsed ? 'TVU' : 'TVU Fund'}</h2>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['/dashboard']}
          items={getMenuItems()}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout>
        <Header className="site-header" style={{ padding: 0, background: '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px' }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: '16px', width: 64, height: 64 }}
            />
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <Avatar icon={<UserOutlined />} style={{ marginRight: 8 }} />
                <span>{user?.HoTen}</span>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content className="site-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

export default MainLayout
