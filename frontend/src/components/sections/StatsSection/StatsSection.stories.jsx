import StatsSection from './StatsSection';

/**
 * StatsSection Demo Page
 * 
 * Demo section thống kê với 4 StatCard
 */
const StatsSectionDemo = () => {
  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <StatsSection />

      {/* Demo Info */}
      <div style={{ 
        padding: '60px 24px', 
        maxWidth: '1200px', 
        margin: '0 auto',
        background: 'white'
      }}>
        <h2 style={{ marginBottom: '24px', fontSize: '28px', color: '#1a2f5e' }}>
          ✨ StatsSection Component
        </h2>

        <div style={{ 
          background: '#f8f9fa', 
          padding: '32px', 
          borderRadius: '12px', 
          marginBottom: '24px',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{ marginBottom: '16px', fontSize: '20px', color: '#1a2f5e' }}>
            🎨 Tính năng
          </h3>
          <ul style={{ lineHeight: '1.8', fontSize: '15px', color: '#4a5568' }}>
            <li>✅ <strong>4 StatCard:</strong> Hiển thị 4 thống kê chính</li>
            <li>✅ <strong>API Integration:</strong> Fetch data từ backend</li>
            <li>✅ <strong>Loading State:</strong> Skeleton loading khi fetch data</li>
            <li>✅ <strong>Fallback Data:</strong> Mock data nếu API fails</li>
            <li>✅ <strong>Format Numbers:</strong> Tự động format số với dấu phẩy</li>
            <li>✅ <strong>Format Currency:</strong> Tự động format tiền (tỷ, triệu)</li>
            <li>✅ <strong>Trend Indicators:</strong> Hiển thị xu hướng tăng/giảm</li>
            <li>✅ <strong>Responsive Grid:</strong> 4 cột → 2 cột → 1 cột</li>
            <li>✅ <strong>Animations:</strong> Fade in up effect</li>
          </ul>
        </div>

        <div style={{ 
          background: '#f8f9fa', 
          padding: '32px', 
          borderRadius: '12px', 
          marginBottom: '24px',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{ marginBottom: '16px', fontSize: '20px', color: '#1a2f5e' }}>
            📊 4 Thống kê
          </h3>
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse', 
            fontSize: '14px' 
          }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '12px', textAlign: 'left', color: '#1a2f5e' }}>Card</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#1a2f5e' }}>Dữ liệu</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#1a2f5e' }}>Query Backend</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '12px', color: '#4a5568' }}>
                  <strong>Yêu cầu đã hỗ trợ</strong>
                </td>
                <td style={{ padding: '12px', color: '#4a5568' }}>
                  Số yêu cầu trạng thái "Đã giải ngân"
                </td>
                <td style={{ padding: '12px', color: '#4a5568', fontFamily: 'monospace', fontSize: '12px' }}>
                  SELECT COUNT(*) FROM yeucauhotro<br/>
                  WHERE TrangThai = 'Đã giải ngân'
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '12px', color: '#4a5568' }}>
                  <strong>Tổng giá trị hỗ trợ</strong>
                </td>
                <td style={{ padding: '12px', color: '#4a5568' }}>
                  Tổng số tiền tất cả các quỹ
                </td>
                <td style={{ padding: '12px', color: '#4a5568', fontFamily: 'monospace', fontSize: '12px' }}>
                  SELECT SUM(SoTienHienTai)<br/>
                  FROM quy
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '12px', color: '#4a5568' }}>
                  <strong>Nhà hảo tâm</strong>
                </td>
                <td style={{ padding: '12px', color: '#4a5568' }}>
                  Tổng số nhà hỗ trợ
                </td>
                <td style={{ padding: '12px', color: '#4a5568', fontFamily: 'monospace', fontSize: '12px' }}>
                  SELECT COUNT(DISTINCT MaNhaTaiTro)<br/>
                  FROM nhataitro
                </td>
              </tr>
              <tr>
                <td style={{ padding: '12px', color: '#4a5568' }}>
                  <strong>Quỹ đang hoạt động</strong>
                </td>
                <td style={{ padding: '12px', color: '#4a5568' }}>
                  Tổng số quỹ hiện tại
                </td>
                <td style={{ padding: '12px', color: '#4a5568', fontFamily: 'monospace', fontSize: '12px' }}>
                  SELECT COUNT(*) FROM quy<br/>
                  WHERE TrangThai = 'Đang hoạt động'
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={{ 
          background: '#f8f9fa', 
          padding: '32px', 
          borderRadius: '12px', 
          marginBottom: '24px',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{ marginBottom: '16px', fontSize: '20px', color: '#1a2f5e' }}>
            🎨 Icon Colors
          </h3>
          <ul style={{ lineHeight: '1.8', fontSize: '15px', color: '#4a5568' }}>
            <li>🟢 <strong>Green:</strong> Yêu cầu đã hỗ trợ (thành công)</li>
            <li>🔵 <strong>Blue:</strong> Tổng giá trị hỗ trợ (tiền)</li>
            <li>🔴 <strong>Red:</strong> Nhà hảo tâm (trái tim)</li>
            <li>🟣 <strong>Purple:</strong> Quỹ đang hoạt động (archive)</li>
          </ul>
        </div>

        <div style={{ 
          background: '#f8f9fa', 
          padding: '32px', 
          borderRadius: '12px',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{ marginBottom: '16px', fontSize: '20px', color: '#1a2f5e' }}>
            💻 Cách sử dụng
          </h3>
          <pre style={{ 
            background: 'white', 
            padding: '20px', 
            borderRadius: '8px', 
            overflow: 'auto',
            fontSize: '13px',
            lineHeight: '1.6',
            color: '#2d3748',
            border: '1px solid #e2e8f0'
          }}>
{`import StatsSection from '@components/sections/StatsSection';

function LandingPage() {
  return (
    <div>
      <PublicHeader />
      <HeroBanner />
      <StatsSection />  {/* ← Thêm section này */}
      <PublicFooter />
    </div>
  );
}`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default StatsSectionDemo;
