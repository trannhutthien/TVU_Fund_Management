import React from 'react'
import { Card, Row, Col, Statistic } from 'antd'
import {
  FileTextOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons'
import { useAuth } from '@hooks/useAuth'

const DashboardPage = () => {
  const { user } = useAuth()

  return (
    <div className="dashboard-page">
      <h1>Dashboard</h1>
      <p>Xin chào, {user?.HoTen}!</p>
      <p>Vai trò: {user?.TenVaiTro}</p>

      <Row gutter={[16, 16]} className="stats-row">
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Tổng đơn yêu cầu"
              value={0}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Đơn chờ duyệt"
              value={0}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Đơn đã duyệt"
              value={0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Tổng quỹ"
              value={0}
              prefix={<DollarOutlined />}
              suffix="₫"
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Thông tin hệ thống" style={{ marginTop: 24 }}>
        <p>Đây là trang Dashboard của hệ thống quản lý quỹ TVU.</p>
        <p>Các tính năng sẽ được phát triển dần dần.</p>
      </Card>
    </div>
  )
}

export default DashboardPage
