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
  CreditCardOutlined,
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

    const roleId = user?.VaiTro || user?.vaiTro;

    // Student (role_id = 4)
    if (roleId === ROLES.SINH_VIEN) {
      items.push({
        key: '/my-applications',
        icon: <FileTextOutlined />,
        label: 'Đơn của tôi',
      })
      items.push({
        key: '/nghia-vu-hoan-tra',
        icon: <CreditCardOutlined />,
        label: 'Nghĩa vụ hoàn trả',
      })
    }

    // Staff roles (role_id = 1, 2, 3)
    if ([ROLES.ADMIN, ROLES.KE_TOAN, ROLES.CAN_BO_QUY].includes(roleId)) {
      items.push({
        key: '/applications',
        icon: <FileTextOutlined />,
        label: 'Quản lý đơn',
      })
    }

    // Admin, Can bo Quy
    if ([ROLES.ADMIN, ROLES.CAN_BO_QUY].includes(roleId)) {
      items.push({
        key: '/funds',
        icon: <DollarOutlined />,
        label: 'Quản lý quỹ',
      })
    }

    // Admin only
    if (roleId === ROLES.ADMIN) {
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
