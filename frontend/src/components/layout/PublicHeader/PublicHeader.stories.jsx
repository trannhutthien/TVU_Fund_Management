import React from 'react';
import PublicHeader from './PublicHeader';

/**
 * PublicHeader Demo Page
 * 
 * Demo header cho trang public với đầy đủ chức năng
 */
const PublicHeaderDemo = () => {
  return (
    <div style={{ minHeight: '200vh', background: '#f5f7fa' }}>
      {/* Header */}
      <PublicHeader />

        {/* Demo Content */}
        <div style={{ padding: '40px', maxWidth: '1280px', margin: '0 auto' }}>
          <h1 style={{ color: '#0F172A', marginBottom: '24px' }}>
            PublicHeader Component Demo
          </h1>

          <div style={{ background: 'white', padding: '32px', borderRadius: '12px', marginBottom: '32px' }}>
            <h2 style={{ color: '#334155', marginBottom: '16px' }}>✨ Tính năng</h2>
            <ul style={{ color: '#64748B', lineHeight: '1.8' }}>
              <li>✅ <strong>Sticky Header:</strong> Dính ở đầu trang khi scroll</li>
              <li>✅ <strong>Glassmorphism:</strong> Hiệu ứng kính mờ với backdrop-filter</li>
              <li>✅ <strong>Gradient Background:</strong> Navy Blue (#1a2f5e → #2a4a8f)</li>
              <li>✅ <strong>Gold Border:</strong> Viền dưới màu vàng gold (#f0a500)</li>
              <li>✅ <strong>Logo Component:</strong> Sử dụng Logo component có sẵn</li>
              <li>✅ <strong>Navigation Menu:</strong> 4 mục với hover effect và active state</li>
              <li>✅ <strong>Action Buttons:</strong> Đăng ký (outline) và Đăng nhập (solid)</li>
              <li>✅ <strong>Responsive:</strong> Hamburger menu trên mobile (&lt;768px)</li>
              <li>✅ <strong>Smooth Animations:</strong> Underline animation, hover effects</li>
              <li>✅ <strong>React Router:</strong> Tích hợp NavLink với active state tự động</li>
            </ul>
          </div>

          <div style={{ background: 'white', padding: '32px', borderRadius: '12px', marginBottom: '32px' }}>
            <h2 style={{ color: '#334155', marginBottom: '16px' }}>🎨 Design Specs</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #E2E8F0' }}>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#64748B' }}>Element</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#64748B' }}>Specs</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '12px', color: '#334155' }}>Header Height</td>
                  <td style={{ padding: '12px', color: '#64748B' }}>72px (Desktop), 64px (Mobile)</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '12px', color: '#334155' }}>Background</td>
                  <td style={{ padding: '12px', color: '#64748B' }}>Gradient: #1a2f5e → #2a4a8f</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '12px', color: '#334155' }}>Border Bottom</td>
                  <td style={{ padding: '12px', color: '#64748B' }}>2px solid rgba(240, 165, 0, 0.3)</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '12px', color: '#334155' }}>Logo Text</td>
                  <td style={{ padding: '12px', color: '#64748B' }}>18px, Bold, White</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '12px', color: '#334155' }}>Nav Links</td>
                  <td style={{ padding: '12px', color: '#64748B' }}>13px, Uppercase, Letter-spacing: 0.08em</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '12px', color: '#334155' }}>Gold Color</td>
                  <td style={{ padding: '12px', color: '#64748B' }}>#f0a500 (Hover: #d4af37)</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '12px', color: '#334155' }}>Button Padding</td>
                  <td style={{ padding: '12px', color: '#64748B' }}>10px 24px (Desktop), 8px 16px (Mobile)</td>
                </tr>
                <tr>
                  <td style={{ padding: '12px', color: '#334155' }}>Border Radius</td>
                  <td style={{ padding: '12px', color: '#64748B' }}>8px</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{ background: 'white', padding: '32px', borderRadius: '12px', marginBottom: '32px' }}>
            <h2 style={{ color: '#334155', marginBottom: '16px' }}>💻 Cách sử dụng</h2>
            <pre style={{ 
              background: '#0F172A', 
              color: '#E2E8F0', 
              padding: '20px', 
              borderRadius: '8px', 
              overflow: 'auto',
              fontSize: '14px',
              lineHeight: '1.6'
            }}>
{`import PublicHeader from '@components/layout/PublicHeader';

function PublicPage() {
  return (
    <>
      <PublicHeader />
      
      {/* Page content */}
      <main>
        <h1>Welcome to TVU Fund Management</h1>
      </main>
    </>
  );
}`}
            </pre>
          </div>

          <div style={{ background: 'white', padding: '32px', borderRadius: '12px', marginBottom: '32px' }}>
            <h2 style={{ color: '#334155', marginBottom: '16px' }}>📱 Responsive Behavior</h2>
            <ul style={{ color: '#64748B', lineHeight: '1.8' }}>
              <li><strong>Desktop (&gt;768px):</strong> Full navigation menu hiển thị ở giữa</li>
              <li><strong>Mobile (≤768px):</strong> Navigation menu ẩn, hiện hamburger icon</li>
              <li><strong>Mobile Menu:</strong> Click hamburger mở dropdown menu dọc</li>
              <li><strong>Logo Text:</strong> Ẩn trên mobile, chỉ giữ icon logo</li>
              <li><strong>Buttons:</strong> Giảm padding và font-size trên mobile</li>
            </ul>
          </div>

          <div style={{ background: 'white', padding: '32px', borderRadius: '12px' }}>
            <h2 style={{ color: '#334155', marginBottom: '16px' }}>🎯 Navigation Routes</h2>
            <ul style={{ color: '#64748B', lineHeight: '1.8' }}>
              <li><strong>VỀ CHÚNG TÔI:</strong> /about</li>
              <li><strong>DANH MỤC QUỸ:</strong> /funds</li>
              <li><strong>HƯỚNG DẪN & QUY ĐỊNH:</strong> /guidelines</li>
              <li><strong>VINH DANH:</strong> /honors</li>
              <li><strong>Đăng ký:</strong> /register</li>
              <li><strong>Đăng nhập:</strong> /login</li>
            </ul>
          </div>

          {/* Scroll demo content */}
          <div style={{ marginTop: '60px', padding: '40px', background: 'white', borderRadius: '12px' }}>
            <h2 style={{ color: '#334155', marginBottom: '16px' }}>⬇️ Scroll xuống để test Sticky Header</h2>
            <p style={{ color: '#64748B', lineHeight: '1.8' }}>
              Header sẽ dính ở đầu trang và thêm shadow khi bạn scroll xuống.
              Thử scroll lên xuống để xem hiệu ứng!
            </p>
            <div style={{ height: '800px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>
              <p>Scroll content area...</p>
            </div>
          </div>
        </div>
      </div>
  );
};

export default PublicHeaderDemo;
