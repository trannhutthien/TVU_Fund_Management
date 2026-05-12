import React, { useState } from 'react';
import Table from './Table';
import StatusBadge from '../StatusBadge';

/**
 * Table Examples / Stories
 * Demo Table component với data thực tế
 */

// Mock data - Danh sách đơn yêu cầu hỗ trợ
const mockApplications = [
  {
    id: 'DYC001',
    studentName: 'Nguyễn Văn An',
    studentCode: '2021001',
    email: 'an.nv@student.tvu.edu.vn',
    fundName: 'Quỹ Học Bổng A',
    amount: 5000000,
    status: 'pending',
    submittedDate: '2024-01-15',
    approver: 'Chưa duyệt',
  },
  {
    id: 'DYC002',
    studentName: 'Trần Thị Bình',
    studentCode: '2021002',
    email: 'binh.tt@student.tvu.edu.vn',
    fundName: 'Quỹ Hỗ Trợ Khó Khăn',
    amount: 3000000,
    status: 'approved',
    submittedDate: '2024-01-14',
    approver: 'Nguyễn Văn A',
  },
  {
    id: 'DYC003',
    studentName: 'Lê Văn Cường',
    studentCode: '2021003',
    email: 'cuong.lv@student.tvu.edu.vn',
    fundName: 'Quỹ Học Bổng B',
    amount: 4000000,
    status: 'rejected',
    submittedDate: '2024-01-13',
    approver: 'Trần Thị B',
  },
  {
    id: 'DYC004',
    studentName: 'Phạm Thị Dung',
    studentCode: '2021004',
    email: 'dung.pt@student.tvu.edu.vn',
    fundName: 'Quỹ Khuyến Học',
    amount: 6000000,
    status: 'pending',
    submittedDate: '2024-01-12',
    approver: 'Chưa duyệt',
  },
  {
    id: 'DYC005',
    studentName: 'Hoàng Văn Em',
    studentCode: '2021005',
    email: 'em.hv@student.tvu.edu.vn',
    fundName: 'Quỹ Hỗ Trợ Khó Khăn',
    amount: 2500000,
    status: 'approved',
    submittedDate: '2024-01-11',
    approver: 'Lê Văn C',
  },
  {
    id: 'DYC006',
    studentName: 'Võ Thị Phương',
    studentCode: '2021006',
    email: 'phuong.vt@student.tvu.edu.vn',
    fundName: 'Quỹ Học Bổng A',
    amount: 5500000,
    status: 'processing',
    submittedDate: '2024-01-10',
    approver: 'Đang xử lý',
  },
  {
    id: 'DYC007',
    studentName: 'Đặng Văn Giang',
    studentCode: '2021007',
    email: 'giang.dv@student.tvu.edu.vn',
    fundName: 'Quỹ Khuyến Học',
    amount: 4500000,
    status: 'approved',
    submittedDate: '2024-01-09',
    approver: 'Phạm Thị D',
  },
  {
    id: 'DYC008',
    studentName: 'Bùi Thị Hoa',
    studentCode: '2021008',
    email: 'hoa.bt@student.tvu.edu.vn',
    fundName: 'Quỹ Hỗ Trợ Khó Khăn',
    amount: 3500000,
    status: 'pending',
    submittedDate: '2024-01-08',
    approver: 'Chưa duyệt',
  },
  {
    id: 'DYC009',
    studentName: 'Ngô Văn Inh',
    studentCode: '2021009',
    email: 'inh.nv@student.tvu.edu.vn',
    fundName: 'Quỹ Học Bổng B',
    amount: 7000000,
    status: 'approved',
    submittedDate: '2024-01-07',
    approver: 'Võ Văn E',
  },
  {
    id: 'DYC010',
    studentName: 'Trương Thị Kim',
    studentCode: '2021010',
    email: 'kim.tt@student.tvu.edu.vn',
    fundName: 'Quỹ Khuyến Học',
    amount: 5000000,
    status: 'rejected',
    submittedDate: '2024-01-06',
    approver: 'Đặng Thị F',
  },
  {
    id: 'DYC011',
    studentName: 'Lý Văn Long',
    studentCode: '2021011',
    email: 'long.lv@student.tvu.edu.vn',
    fundName: 'Quỹ Hỗ Trợ Khó Khăn',
    amount: 4000000,
    status: 'pending',
    submittedDate: '2024-01-05',
    approver: 'Chưa duyệt',
  },
  {
    id: 'DYC012',
    studentName: 'Mai Thị Minh',
    studentCode: '2021012',
    email: 'minh.mt@student.tvu.edu.vn',
    fundName: 'Quỹ Học Bổng A',
    amount: 6500000,
    status: 'approved',
    submittedDate: '2024-01-04',
    approver: 'Bùi Văn G',
  },
];

// Status badge component - Sử dụng StatusBadge component
const StatusBadgeWrapper = ({ status }) => {
  return <StatusBadge status={status} />;
};

// Action buttons component
const ActionButtons = ({ onView, onEdit, onDelete }) => (
  <div className="table-actions">
    <button className="table-action-btn" onClick={onView} title="Xem chi tiết">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    </button>
    <button className="table-action-btn" onClick={onEdit} title="Chỉnh sửa">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    </button>
    <button className="table-action-btn table-action-btn-danger" onClick={onDelete} title="Xóa">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      </svg>
    </button>
  </div>
);

const TableExamples = () => {
  const [selectedRows, setSelectedRows] = useState([]);
  const [loading, setLoading] = useState(false);

  // Columns configuration
  const columns = [
    {
      key: 'id',
      label: 'Mã đơn',
      sortable: true,
      width: '100px',
    },
    {
      key: 'studentName',
      label: 'Sinh viên',
      sortable: true,
      render: (value, row) => (
        <div className="table-avatar">
          <div className="table-avatar-placeholder">
            {value.charAt(0)}
          </div>
          <div className="table-avatar-info">
            <div className="table-avatar-name">{value}</div>
            <div className="table-avatar-email">{row.studentCode}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'fundName',
      label: 'Quỹ',
      sortable: true,
    },
    {
      key: 'amount',
      label: 'Số tiền',
      sortable: true,
      render: (value) => (
        <span style={{ fontWeight: 600, color: '#3B6FF5' }}>
          {value.toLocaleString('vi-VN')} đ
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Trạng thái',
      sortable: true,
      render: (value) => <StatusBadgeWrapper status={value} />,
    },
    {
      key: 'submittedDate',
      label: 'Ngày nộp',
      sortable: true,
    },
    {
      key: 'approver',
      label: 'Người duyệt',
      sortable: false,
    },
    {
      key: 'actions',
      label: 'Thao tác',
      sortable: false,
      width: '140px',
      render: (_, row) => (
        <ActionButtons
          onView={() => alert(`Xem chi tiết: ${row.id}`)}
          onEdit={() => alert(`Chỉnh sửa: ${row.id}`)}
          onDelete={() => alert(`Xóa: ${row.id}`)}
        />
      ),
    },
  ];

  // Handle row click
  const handleRowClick = (row) => {
    console.log('Row clicked:', row);
  };

  // Test loading
  const testLoading = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div style={{ padding: '40px', background: '#EEF0F5', minHeight: '100vh' }}>
      <h1 style={{ marginBottom: '32px', fontFamily: 'Plus Jakarta Sans', color: '#0F172A' }}>
        Table Component Examples
      </h1>

      {/* Controls */}
      <section style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={testLoading}
            style={{
              padding: '10px 20px',
              background: '#3B6FF5',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontFamily: 'Plus Jakarta Sans',
              fontWeight: 600,
            }}
          >
            Test Loading (2s)
          </button>
          <button
            onClick={() => setSelectedRows([])}
            disabled={selectedRows.length === 0}
            style={{
              padding: '10px 20px',
              background: selectedRows.length > 0 ? '#DC2626' : '#CBD5E1',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: selectedRows.length > 0 ? 'pointer' : 'not-allowed',
              fontFamily: 'Plus Jakarta Sans',
              fontWeight: 600,
            }}
          >
            Clear Selection ({selectedRows.length})
          </button>
        </div>
      </section>

      {/* Main Table */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ marginBottom: '20px', fontSize: '18px', color: '#334155' }}>
          Danh Sách Đơn Yêu Cầu Hỗ Trợ
        </h2>
        <Table
          columns={columns}
          data={mockApplications}
          loading={loading}
          striped
          hoverable
          selectable
          selectedRows={selectedRows}
          onSelectionChange={setSelectedRows}
          onRowClick={handleRowClick}
          pagination
          pageSize={5}
        />
      </section>

      {/* Small Table */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ marginBottom: '20px', fontSize: '18px', color: '#334155' }}>
          Small Size Table
        </h2>
        <Table
          columns={columns.slice(0, 5)}
          data={mockApplications.slice(0, 5)}
          size="sm"
          striped
          hoverable
          pagination={false}
        />
      </section>

      {/* Bordered Table */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ marginBottom: '20px', fontSize: '18px', color: '#334155' }}>
          Bordered Table
        </h2>
        <Table
          columns={columns.slice(0, 5)}
          data={mockApplications.slice(0, 5)}
          bordered
          hoverable
          pagination={false}
        />
      </section>

      {/* Empty State */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ marginBottom: '20px', fontSize: '18px', color: '#334155' }}>
          Empty State
        </h2>
        <Table
          columns={columns}
          data={[]}
          emptyText="Không có đơn yêu cầu nào"
        />
      </section>

      {/* Instructions */}
      <section>
        <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(15, 23, 42, 0.06)' }}>
          <h3 style={{ marginBottom: '16px', fontSize: '16px', color: '#0F172A', fontWeight: 600 }}>
            Tính năng:
          </h3>
          <ul style={{ marginLeft: '20px', color: '#334155', lineHeight: '1.8' }}>
            <li><strong>Sorting:</strong> Click vào header để sắp xếp (mũi tên lên/xuống)</li>
            <li><strong>Selection:</strong> Checkbox để chọn nhiều rows</li>
            <li><strong>Pagination:</strong> Phân trang tự động (5 rows/page)</li>
            <li><strong>Hover:</strong> Row nổi lên khi hover</li>
            <li><strong>Click:</strong> Click row để xem log trong console</li>
            <li><strong>Actions:</strong> Nút xem/sửa/xóa ở cột cuối</li>
            <li><strong>Status Badge:</strong> Badge màu theo trạng thái</li>
            <li><strong>Loading:</strong> Click "Test Loading" để xem spinner</li>
          </ul>
        </div>
      </section>
    </div>
  );
};

export default TableExamples;
