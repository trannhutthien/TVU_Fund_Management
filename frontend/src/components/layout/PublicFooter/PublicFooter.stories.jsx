import React from 'react';
import PublicFooter from './PublicFooter';

/**
 * PublicFooter Demo Page
 * 
 * Demo footer cho trang public với đầy đủ chức năng
 */
const PublicFooterDemo = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Demo Content */}
      <div style={{ flex: 1, padding: '40px', background: '#f5f7fa' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <h1 style={{ color: '#0F172A', marginBottom: '24px' }}>
            PublicFooter Component Demo
          </h1>

          <div style={{ background: 'white', padding: '32px', borderRadius: '12px', marginBottom: '32px' }}>
            <h2 style={{ color: '#334155', marginBottom: '16px' }}>✨ Tính năng</h2>
            <ul style={{ color: '#64748B', lineHeight: '1.8' }}>
              <li>✅ <strong>3 Cột Layout:</strong> Thông tin tổ chức | Điều hướng | Kết nối</li>
              <li>✅ <strong>Navy Blue Background:</strong> #0f1f3d với Gold border-top</li>
              <li>✅ <strong>Logo Component:</strong> Sử dụng Logo component có sẵn</li>
              <li>✅ <strong>SocialLinks Component:</strong> Tích hợp social links</li>
              <li>✅ <strong>Thông tin liên hệ:</strong> Địa chỉ, email, hotline, giờ làm việc</li>
              <li>✅ <strong>Navigation Links:</strong> 6 links với hover effect</li>
              <li>✅ <strong>Copyright Bar:</strong> Thông tin bản quyền</li>
              <li>✅ <strong>Responsive:</strong> Desktop (3 cột) → Tablet (2 cột) → Mobile (1 cột)</li>
              <li>✅ <strong>Hover Effects:</strong> Gold color, transform, smooth transitions</li>
              <li>✅ <strong>Icons:</strong> Location, email, phone, clock với SVG</li>
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
                  <td style={{ padding: '12px', color: '#334155' }}>Background</td>
                  <td style={{ padding: '12px', color: '#64748B' }}>#0f1f3d (Navy Blue đậm)</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '12px', color: '#334155' }}>Border Top</td>
                  <td style={{ padding: '12px', color: '#64748B' }}>2px solid rgba(240, 165, 0, 0.3)</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '12px', color: '#334155' }}>Text Color</td>
                  <td style={{ padding: '12px', color: '#64748B' }}>rgba(255, 255, 255, 0.75)</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '12px', color: '#334155' }}>Title Color</td>
                  <td style={{ padding: '12px', color: '#64748B' }}>#f0a500 (Gold)</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '12px', color: '#334155' }}>Padding</td>
                  <td style={{ padding: '12px', color: '#64748B' }}>60px 0 (Desktop), 40px 0 (Mobile)</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '12px', color: '#334155' }}>Grid Columns</td>
                  <td style={{ padding: '12px', color: '#64748B' }}>35% | 30% | 35%</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '12px', color: '#334155' }}>Title Font</td>
                  <td style={{ padding: '12px', color: '#64748B' }}>13px, Uppercase, Letter-spacing: 0.1em</td>
                </tr>
                <tr>
                  <td style={{ padding: '12px', color: '#334155' }}>Hover Effect</td>
                  <td style={{ padding: '12px', color: '#64748B' }}>Color: Gold, Transform: translateX(4px)</td>
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
{`import PublicFooter from '@components/layout/PublicFooter';

function PublicPage() {
  return (
    <>
      {/* Page content */}
      <main>
        <h1>Welcome to TVU Fund Management</h1>
      </main>
      
      {/* Footer */}
      <PublicFooter />
    </>
  );
}`}
            </pre>
          </div>

          <div style={{ background: 'white', padding: '32px', borderRadius: '12px', marginBottom: '32px' }}>
            <h2 style={{ color: '#334155', marginBottom: '16px' }}>📱 Responsive Breakpoints</h2>
            <ul style={{ color: '#64748B', lineHeight: '1.8' }}>
              <li><strong>Desktop (≥1024px):</strong> 3 cột ngang (35% | 30% | 35%)</li>
              <li><strong>Tablet (768-1023px):</strong> Cột 1 full width, Cột 2 & 3 chia đôi</li>
              <li><strong>Mobile (&lt;768px):</strong> 1 cột dọc, tất cả xếp chồng, căn giữa</li>
            </ul>
          </div>

          <div style={{ background: 'white', padding: '32px', borderRadius: '12px' }}>
            <h2 style={{ color: '#334155', marginBottom: '16px' }}>🔗 Navigation Links</h2>
            <ul style={{ color: '#64748B', lineHeight: '1.8' }}>
              <li>Điều lệ Quỹ → /regulations</li>
              <li>Báo cáo tài chính → /financial-reports</li>
              <li>Tin tức & Sự kiện → /news</li>
              <li>Đối tác đồng hành → /partners</li>
              <li>Câu hỏi thường gặp → /faq</li>
              <li>Chính sách bảo mật → /privacy-policy</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Footer */}
      <PublicFooter />
    </div>
  );
};

export default PublicFooterDemo;
