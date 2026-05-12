import React from 'react';
import StatusBadge from './StatusBadge';

/**
 * StatusBadge Examples / Stories
 * Demo StatusBadge component
 */

const StatusBadgeExamples = () => {
  return (
    <div style={{ padding: '40px', background: '#EEF0F5', minHeight: '100vh' }}>
      <h1 style={{ marginBottom: '32px', fontFamily: 'Plus Jakarta Sans', color: '#0F172A' }}>
        StatusBadge Component Examples
      </h1>

      {/* Predefined Status */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ marginBottom: '20px', fontSize: '18px', color: '#334155' }}>
          Predefined Status (Trạng thái có sẵn)
        </h2>
        <div style={{ background: 'white', padding: '32px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(15, 23, 42, 0.06)' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <StatusBadge status="pending" />
            <StatusBadge status="processing" />
            <StatusBadge status="approved" />
            <StatusBadge status="rejected" />
            <StatusBadge status="completed" />
            <StatusBadge status="cancelled" />
          </div>
        </div>
      </section>

      {/* Variants */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ marginBottom: '20px', fontSize: '18px', color: '#334155' }}>
          Variants (Màu sắc)
        </h2>
        <div style={{ background: 'white', padding: '32px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(15, 23, 42, 0.06)' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <StatusBadge variant="success" label="Success" />
            <StatusBadge variant="warning" label="Warning" />
            <StatusBadge variant="danger" label="Danger" />
            <StatusBadge variant="info" label="Info" />
            <StatusBadge variant="default" label="Default" />
          </div>
        </div>
      </section>

      {/* With Icons */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ marginBottom: '20px', fontSize: '18px', color: '#334155' }}>
          With Icons (Có icon)
        </h2>
        <div style={{ background: 'white', padding: '32px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(15, 23, 42, 0.06)' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <StatusBadge status="pending" showIcon />
            <StatusBadge status="processing" showIcon />
            <StatusBadge status="approved" showIcon />
            <StatusBadge status="rejected" showIcon />
          </div>
        </div>
      </section>

      {/* Without Icons */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ marginBottom: '20px', fontSize: '18px', color: '#334155' }}>
          Without Icons (Không có icon)
        </h2>
        <div style={{ background: 'white', padding: '32px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(15, 23, 42, 0.06)' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <StatusBadge status="pending" showIcon={false} />
            <StatusBadge status="processing" showIcon={false} />
            <StatusBadge status="approved" showIcon={false} />
            <StatusBadge status="rejected" showIcon={false} />
          </div>
        </div>
      </section>

      {/* Sizes */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ marginBottom: '20px', fontSize: '18px', color: '#334155' }}>
          Sizes (Kích thước)
        </h2>
        <div style={{ background: 'white', padding: '32px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(15, 23, 42, 0.06)' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <StatusBadge status="approved" size="sm" />
            <StatusBadge status="approved" size="md" />
            <StatusBadge status="approved" size="lg" />
          </div>
        </div>
      </section>

      {/* Outlined */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ marginBottom: '20px', fontSize: '18px', color: '#334155' }}>
          Outlined (Viền, không fill)
        </h2>
        <div style={{ background: 'white', padding: '32px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(15, 23, 42, 0.06)' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <StatusBadge variant="success" label="Success" outlined />
            <StatusBadge variant="warning" label="Warning" outlined />
            <StatusBadge variant="danger" label="Danger" outlined />
            <StatusBadge variant="info" label="Info" outlined />
            <StatusBadge variant="default" label="Default" outlined />
          </div>
        </div>
      </section>

      {/* Pulse Animation */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ marginBottom: '20px', fontSize: '18px', color: '#334155' }}>
          Pulse Animation (Nhấp nháy)
        </h2>
        <div style={{ background: 'white', padding: '32px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(15, 23, 42, 0.06)' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <StatusBadge status="pending" pulse />
            <StatusBadge variant="warning" label="Đang chờ" pulse />
            <StatusBadge variant="info" label="Đang xử lý" pulse />
          </div>
        </div>
      </section>

      {/* Glow Effect */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ marginBottom: '20px', fontSize: '18px', color: '#334155' }}>
          Glow Effect (Phát sáng)
        </h2>
        <div style={{ background: 'white', padding: '32px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(15, 23, 42, 0.06)' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <StatusBadge status="approved" glow />
            <StatusBadge variant="success" label="Thành công" glow />
            <StatusBadge variant="danger" label="Lỗi" glow />
          </div>
        </div>
      </section>

      {/* Clickable */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ marginBottom: '20px', fontSize: '18px', color: '#334155' }}>
          Clickable (Có thể click)
        </h2>
        <div style={{ background: 'white', padding: '32px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(15, 23, 42, 0.06)' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <StatusBadge
              status="pending"
              onClick={() => alert('Clicked: Chờ duyệt')}
            />
            <StatusBadge
              status="approved"
              onClick={() => alert('Clicked: Đã duyệt')}
            />
            <StatusBadge
              variant="info"
              label="Click me!"
              onClick={() => alert('Clicked!')}
            />
          </div>
        </div>
      </section>

      {/* Custom Labels */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ marginBottom: '20px', fontSize: '18px', color: '#334155' }}>
          Custom Labels (Text tùy chỉnh)
        </h2>
        <div style={{ background: 'white', padding: '32px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(15, 23, 42, 0.06)' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <StatusBadge variant="success" label="Đã thanh toán" />
            <StatusBadge variant="warning" label="Chưa thanh toán" />
            <StatusBadge variant="info" label="Đang giao hàng" />
            <StatusBadge variant="danger" label="Hết hàng" />
            <StatusBadge variant="default" label="Nháp" />
          </div>
        </div>
      </section>

      {/* Badge Group */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ marginBottom: '20px', fontSize: '18px', color: '#334155' }}>
          Badge Group (Nhóm badges)
        </h2>
        <div style={{ background: 'white', padding: '32px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(15, 23, 42, 0.06)' }}>
          <div className="status-badge-group">
            <StatusBadge status="approved" size="sm" />
            <StatusBadge variant="info" label="Ưu tiên cao" size="sm" />
            <StatusBadge variant="default" label="Công khai" size="sm" />
          </div>
        </div>
      </section>

      {/* Combined Effects */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ marginBottom: '20px', fontSize: '18px', color: '#334155' }}>
          Combined Effects (Kết hợp hiệu ứng)
        </h2>
        <div style={{ background: 'white', padding: '32px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(15, 23, 42, 0.06)' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <StatusBadge status="pending" pulse glow />
            <StatusBadge status="approved" glow outlined />
            <StatusBadge variant="warning" label="Cảnh báo" pulse size="lg" />
          </div>
        </div>
      </section>

      {/* Instructions */}
      <section>
        <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(15, 23, 42, 0.06)' }}>
          <h3 style={{ marginBottom: '16px', fontSize: '16px', color: '#0F172A', fontWeight: 600 }}>
            Tính năng:
          </h3>
          <ul style={{ marginLeft: '20px', color: '#334155', lineHeight: '1.8' }}>
            <li><strong>Predefined Status:</strong> 6 trạng thái có sẵn (pending, processing, approved, rejected, completed, cancelled)</li>
            <li><strong>Variants:</strong> 5 màu (success, warning, danger, info, default)</li>
            <li><strong>Icons:</strong> Icon tự động theo status, có thể tắt</li>
            <li><strong>Sizes:</strong> 3 kích thước (sm, md, lg)</li>
            <li><strong>Outlined:</strong> Variant viền, không fill</li>
            <li><strong>Pulse:</strong> Animation nhấp nháy (cho pending)</li>
            <li><strong>Glow:</strong> Hiệu ứng phát sáng</li>
            <li><strong>Clickable:</strong> Có thể click (với onClick)</li>
            <li><strong>Hover:</strong> Nổi lên khi hover</li>
            <li><strong>Animation:</strong> Fade in khi xuất hiện</li>
          </ul>
        </div>
      </section>
    </div>
  );
};

export default StatusBadgeExamples;
