import React from 'react';
import Sidebar from './Sidebar';

/**
 * Sidebar Demo Page
 * 
 * Demo sidebar với RBAC system
 * Lưu ý: Cần có AuthContext để sidebar hoạt động đúng
 */
const SidebarDemo = () => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#1a2f5e' }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div style={{ flex: 1, marginLeft: '260px', padding: '40px', color: 'white' }}>
        <h1 style={{ marginBottom: '24px' }}>Sidebar Component Demo</h1>

        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '32px', borderRadius: '12px', marginBottom: '32px' }}>
          <h2 style={{ marginBottom: '16px', fontSize: '20px' }}>✨ Tính năng</h2>
          <ul style={{ lineHeight: '1.8', fontSize: '14px' }}>
            <li>✅ <strong>RBAC System:</strong> Tự động filter menu theo role (admin, giaovu, ketoan)</li>
            <li>✅ <strong>NAV_CONFIG:</strong> Cấu hình menu dạng data, không viết cứng JSX</li>
            <li>✅ <strong>Toggle Collapsed:</strong> Thu gọn/mở rộng sidebar (260px ↔ 72px)</li>
            <li>✅ <strong>LocalStorage:</strong> Nhớ trạng thái collapsed khi reload</li>
            <li>✅ <strong>Glassmorphism:</strong> Nền mờ với backdrop-filter: blur(12px)</li>
            <li>✅ <strong>Active State:</strong> NavLink tự động nhận active, nền Gold</li>
            <li>✅ <strong>Badge:</strong> Hiển thị số thông báo (vd: 26 hồ sơ chờ duyệt)</li>
            <li>✅ <strong>Scrollable:</strong> Menu dài có scrollbar, footer cố định dưới</li>
            <li>✅ <strong>Responsive:</strong> Mobile có backdrop overlay</li>
            <li>✅ <strong>Icons:</strong> React Icons (HeroIcons 2)</li>
          </ul>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '32px', borderRadius: '12px', marginBottom: '32px' }}>
          <h2 style={{ marginBottom: '16px', fontSize: '20px' }}>🎨 Design Specs</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>Element</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Specs</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <td style={{ padding: '12px' }}>Width</td>
                <td style={{ padding: '12px' }}>260px (expanded), 72px (collapsed)</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <td style={{ padding: '12px' }}>Background</td>
                <td style={{ padding: '12px' }}>rgba(255, 255, 255, 0.08) + blur(12px)</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <td style={{ padding: '12px' }}>Border</td>
                <td style={{ padding: '12px' }}>1px solid rgba(255, 255, 255, 0.12)</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <td style={{ padding: '12px' }}>Text Color</td>
                <td style={{ padding: '12px' }}>rgba(255, 255, 255, 0.75)</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <td style={{ padding: '12px' }}>Active State</td>
                <td style={{ padding: '12px' }}>Background: #f0a500 (Gold), Text: #1a2f5e (Navy)</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <td style={{ padding: '12px' }}>Hover State</td>
                <td style={{ padding: '12px' }}>Background: rgba(255, 255, 255, 0.08)</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <td style={{ padding: '12px' }}>Badge</td>
                <td style={{ padding: '12px' }}>Background: #ef4444 (Red), Font: 11px</td>
              </tr>
              <tr>
                <td style={{ padding: '12px' }}>Toggle Button</td>
                <td style={{ padding: '12px' }}>32x32px, Gold background, Navy icon</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '32px', borderRadius: '12px', marginBottom: '32px' }}>
          <h2 style={{ marginBottom: '16px', fontSize: '20px' }}>👥 RBAC - Role Based Access Control</h2>
          <div style={{ fontSize: '14px', lineHeight: '1.8' }}>
            <h3 style={{ marginTop: '16px', marginBottom: '8px', fontSize: '16px' }}>Admin (Quản trị viên):</h3>
            <ul>
              <li>✅ Bảng điều khiển</li>
              <li>✅ Quản lý Nguồn quỹ</li>
              <li>✅ Xét duyệt hồ sơ</li>
              <li>✅ Lịch sử giao dịch</li>
              <li>✅ Nhà hảo tâm & Vinh danh</li>
              <li>✅ Quản lý người dùng</li>
              <li>✅ Hệ thống & Phân quyền</li>
            </ul>

            <h3 style={{ marginTop: '16px', marginBottom: '8px', fontSize: '16px' }}>Giáo vụ:</h3>
            <ul>
              <li>✅ Bảng điều khiển</li>
              <li>✅ Xét duyệt hồ sơ</li>
            </ul>

            <h3 style={{ marginTop: '16px', marginBottom: '8px', fontSize: '16px' }}>Kế toán:</h3>
            <ul>
              <li>✅ Lịch sử giao dịch</li>
              <li>✅ Nhà hảo tâm & Vinh danh</li>
            </ul>
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '32px', borderRadius: '12px', marginBottom: '32px' }}>
          <h2 style={{ marginBottom: '16px', fontSize: '20px' }}>💻 Cách sử dụng</h2>
          <pre style={{ 
            background: 'rgba(0,0,0,0.3)', 
            padding: '20px', 
            borderRadius: '8px', 
            overflow: 'auto',
            fontSize: '13px',
            lineHeight: '1.6'
          }}>
{`import Sidebar from '@components/layout/Sidebar';

function DashboardLayout() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <Sidebar 
        isMobileOpen={isMobileOpen}
        onMobileClose={() => setIsMobileOpen(false)}
      />
      
      {/* Main Content */}
      <main className="main-content">
        {/* Your page content */}
      </main>
    </div>
  );
}`}
          </pre>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '32px', borderRadius: '12px' }}>
          <h2 style={{ marginBottom: '16px', fontSize: '20px' }}>📋 NAV_CONFIG Structure</h2>
          <pre style={{ 
            background: 'rgba(0,0,0,0.3)', 
            padding: '20px', 
            borderRadius: '8px', 
            overflow: 'auto',
            fontSize: '13px',
            lineHeight: '1.6'
          }}>
{`const NAV_CONFIG = [
  {
    title: 'ĐIỀU HÀNH & NGHIỆP VỤ',
    roles: ['admin', 'giaovu'],
    items: [
      {
        label: 'Bảng điều khiển',
        path: '/dashboard',
        icon: <HiOutlineSquares2X2 />,
        roles: ['admin', 'giaovu'],
      },
      {
        label: 'Xét duyệt hồ sơ',
        path: '/applications',
        icon: <HiOutlineDocumentCheck />,
        roles: ['admin', 'giaovu'],
        badge: 26, // Số thông báo
      },
    ],
  },
  // ... more groups
];`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default SidebarDemo;
