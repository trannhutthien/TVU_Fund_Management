import { BrowserRouter } from 'react-router-dom';
import HeroBanner from './HeroBanner';

/**
 * HeroBanner Demo Page
 * 
 * Banner chính ở đầu trang Landing Page
 */
const HeroBannerDemo = () => {
  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh' }}>
        <HeroBanner />

        {/* Demo Info */}
        <div style={{ 
          padding: '60px 24px', 
          maxWidth: '1200px', 
          margin: '0 auto',
          background: '#f8f9fa'
        }}>
          <h2 style={{ marginBottom: '24px', fontSize: '28px', color: '#1a2f5e' }}>
            ✨ HeroBanner Component
          </h2>

          <div style={{ 
            background: 'white', 
            padding: '32px', 
            borderRadius: '12px', 
            marginBottom: '24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            <h3 style={{ marginBottom: '16px', fontSize: '20px', color: '#1a2f5e' }}>
              🎨 Tính năng
            </h3>
            <ul style={{ lineHeight: '1.8', fontSize: '15px', color: '#4a5568' }}>
              <li>✅ <strong>Gradient Background:</strong> Navy Blue gradient với decorative elements</li>
              <li>✅ <strong>2-Column Layout:</strong> Content bên trái, Image bên phải</li>
              <li>✅ <strong>Badge:</strong> Nhãn "Hỗ trợ sinh viên TVU" với icon</li>
              <li>✅ <strong>Heading:</strong> Tiêu đề lớn với highlight màu Gold</li>
              <li>✅ <strong>Description:</strong> Mô tả ngắn gọn về hệ thống</li>
              <li>✅ <strong>CTA Buttons:</strong> 2 nút "Đăng nhập ngay" và "Tìm hiểu thêm"</li>
              <li>✅ <strong>Stats:</strong> 3 chỉ số thống kê (Sinh viên, Giá trị, Nhà hảo tâm)</li>
              <li>✅ <strong>Image Placeholder:</strong> Khu vực để thêm hình ảnh thực tế</li>
              <li>✅ <strong>Floating Cards:</strong> 2 card nổi với animation</li>
              <li>✅ <strong>Decorative Circles:</strong> 3 vòng tròn trang trí với animation</li>
              <li>✅ <strong>Animations:</strong> Fade in, float, smooth transitions</li>
              <li>✅ <strong>Responsive:</strong> Desktop 2 cột, Mobile 1 cột</li>
            </ul>
          </div>

          <div style={{ 
            background: 'white', 
            padding: '32px', 
            borderRadius: '12px', 
            marginBottom: '24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            <h3 style={{ marginBottom: '16px', fontSize: '20px', color: '#1a2f5e' }}>
              📐 Design Specs
            </h3>
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse', 
              fontSize: '14px' 
            }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#1a2f5e' }}>Element</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#1a2f5e' }}>Specs</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '12px', color: '#4a5568' }}>Background</td>
                  <td style={{ padding: '12px', color: '#4a5568' }}>
                    linear-gradient(135deg, #1a2f5e 0%, #2a4a8f 100%)
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '12px', color: '#4a5568' }}>Min Height</td>
                  <td style={{ padding: '12px', color: '#4a5568' }}>100vh (full viewport)</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '12px', color: '#4a5568' }}>Layout</td>
                  <td style={{ padding: '12px', color: '#4a5568' }}>
                    Grid 2 columns (1fr 1fr), gap 80px
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '12px', color: '#4a5568' }}>Heading</td>
                  <td style={{ padding: '12px', color: '#4a5568' }}>
                    56px, font-weight 800, color white
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '12px', color: '#4a5568' }}>Highlight</td>
                  <td style={{ padding: '12px', color: '#4a5568' }}>
                    Color Gold (#f0a500) với underline effect
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '12px', color: '#4a5568' }}>Description</td>
                  <td style={{ padding: '12px', color: '#4a5568' }}>
                    18px, line-height 1.7, color rgba(255,255,255,0.85)
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '12px', color: '#4a5568' }}>Stats Value</td>
                  <td style={{ padding: '12px', color: '#4a5568' }}>
                    32px, font-weight 800, color Gold
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '12px', color: '#4a5568' }}>Animations</td>
                  <td style={{ padding: '12px', color: '#4a5568' }}>
                    fadeInUp, fadeInRight, float, floatCard
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{ 
            background: 'white', 
            padding: '32px', 
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            <h3 style={{ marginBottom: '16px', fontSize: '20px', color: '#1a2f5e' }}>
              💻 Cách sử dụng
            </h3>
            <pre style={{ 
              background: '#f7fafc', 
              padding: '20px', 
              borderRadius: '8px', 
              overflow: 'auto',
              fontSize: '13px',
              lineHeight: '1.6',
              color: '#2d3748',
              border: '1px solid #e2e8f0'
            }}>
{`import HeroBanner from '@components/sections/HeroBanner';

function LandingPage() {
  return (
    <div>
      <PublicHeader />
      <HeroBanner />
      <PublicFooter />
    </div>
  );
}`}
            </pre>
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
};

export default HeroBannerDemo;
