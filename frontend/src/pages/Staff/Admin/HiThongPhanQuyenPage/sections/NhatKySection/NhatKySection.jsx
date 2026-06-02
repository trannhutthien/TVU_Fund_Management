import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import {
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineBanknotes,
  HiOutlineHandRaised,
  HiOutlineUserPlus,
  HiOutlineLockClosed,
  HiOutlineArrowRightOnRectangle,
  HiOutlineBuildingLibrary,
  HiOutlineArrowDownTray,
  HiOutlineXMark,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from 'react-icons/hi2';
import Button from '@components/common/Button/Button';
import Input from '@components/common/Input/Input';
import StatusBadge from '@components/common/StatusBadge/StatusBadge';
import api from '@services/api';
import styles from './NhatKySection.module.scss';

const PAGE_SIZE = 20;

const HANH_DONG_OPTIONS = [
  { value: '', label: '-- Tất cả hành động --' },
  { value: 'DUYET_DON', label: '✅ Duyệt đơn hỗ trợ' },
  { value: 'TU_CHOI_DON', label: '❌ Từ chối đơn' },
  { value: 'GIAI_NGAN', label: '💰 Giải ngân' },
  { value: 'XAC_NHAN_TAI_TRO', label: '🤝 Xác nhận tài trợ' },
  { value: 'TAO_NGUOI_DUNG', label: '👤 Tạo người dùng' },
  { value: 'KHOA_TAI_KHOAN', label: '🔒 Khóa tài khoản' },
  { value: 'DANG_NHAP', label: '🔑 Đăng nhập' },
  { value: 'CAP_NHAT_QUY', label: '🏦 Cập nhật quỹ' },
];

const DOI_TUONG_OPTIONS = [
  { value: '', label: '-- Tất cả --' },
  { value: 'yeucauhotro', label: 'Đơn hỗ trợ' },
  { value: 'khoantaitro', label: 'Khoản tài trợ' },
  { value: 'nguoidung', label: 'Người dùng' },
  { value: 'quy', label: 'Quỹ' },
  { value: 'giaodich', label: 'Giao dịch' },
];

const HANH_DONG_STYLE = {
  DUYET_DON: { bg: 'rgba(16,185,129,0.1)', color: '#10b981', icon: HiOutlineCheckCircle, label: 'Duyệt đơn' },
  TU_CHOI_DON: { bg: 'rgba(239,68,68,0.1)', color: '#ef4444', icon: HiOutlineXCircle, label: 'Từ chối đơn' },
  GIAI_NGAN: { bg: 'rgba(240,165,0,0.1)', color: '#b45309', icon: HiOutlineBanknotes, label: 'Giải ngân' },
  XAC_NHAN_TAI_TRO: { bg: 'rgba(8,145,178,0.1)', color: '#0891b2', icon: HiOutlineHandRaised, label: 'Xác nhận tài trợ' },
  TAO_NGUOI_DUNG: { bg: 'rgba(26,47,94,0.08)', color: 'var(--color-primary, #1a2f5e)', icon: HiOutlineUserPlus, label: 'Tạo người dùng' },
  KHOA_TAI_KHOAN: { bg: 'rgba(239,68,68,0.08)', color: '#ef4444', icon: HiOutlineLockClosed, label: 'Khóa tài khoản' },
  DANG_NHAP: { bg: 'rgba(168,85,247,0.08)', color: '#7c3aed', icon: HiOutlineArrowRightOnRectangle, label: 'Đăng nhập' },
  CAP_NHAT_QUY: { bg: 'rgba(26,47,94,0.08)', color: 'var(--color-primary, #1a2f5e)', icon: HiOutlineBuildingLibrary, label: 'Cập nhật quỹ' },
};

const NhatKySection = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [staffOptions, setStaffOptions] = useState([]);

  const [filters, setFilters] = useState({
    keyword: '',
    hanh_dong: '',
    loai_doi_tuong: '',
    nguoi_dung_id: '',
    tu_ngay: '',
    den_ngay: '',
  });

  // Fetch staff list on mount
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const response = await api.get('/nguoidung?role_id=1,2,3');
        if (response.data?.success) {
          setStaffOptions(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching staff options:', error);
      }
    };
    fetchStaff();
  }, []);

  // Fetch logs
  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        page_size: PAGE_SIZE,
        ...filters,
      };

      const response = await api.get('/nhat-ky', { params });
      if (response.data?.success) {
        setLogs(response.data.logs);
        setTotal(response.data.pagination.total);
        setTotalPages(response.data.pagination.total_pages);
      } else {
        toast.error('Không thể lấy nhật ký hệ thống');
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
      toast.error('Lỗi khi tải nhật ký hoạt động');
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Handle filter changes
  const handleFilterChange = (key, val) => {
    setFilters((prev) => ({ ...prev, [key]: val }));
    setPage(1); // Reset to page 1 on filter
  };

  // Clear filters
  const handleClearFilters = () => {
    setFilters({
      keyword: '',
      hanh_dong: '',
      loai_doi_tuong: '',
      nguoi_dung_id: '',
      tu_ngay: '',
      den_ngay: '',
    });
    setPage(1);
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (logs.length === 0) {
      toast.warning('Không có dữ liệu để xuất file');
      return;
    }

    try {
      // Header for CSV
      const headers = ['Mã Log', 'Thời gian', 'Người thực hiện', 'Email', 'Hành động', 'Đối tượng', 'Mã đối tượng', 'Mô tả', 'IP Address', 'Kết quả'];
      
      const rows = logs.map((log) => {
        // Map result string
        const resultVal = log.hanh_dong === 'KHOA_TAI_KHOAN' ? 'Cảnh báo' : (log.mo_ta?.includes('thất bại') ? 'Thất bại' : 'Thành công');
        
        return [
          log.log_id,
          new Date(log.created_at).toLocaleString('vi-VN'),
          log.nguoi_thuc_hien?.ho_ten || 'Hệ thống',
          log.nguoi_thuc_hien?.email || '',
          log.hanh_dong,
          log.loai_doi_tuong || '',
          log.doi_tuong_id || '',
          (log.mo_ta || '').replace(/"/g, '""'), // escape quotes
          log.ip_address || '',
          resultVal
        ];
      });

      // Combine header and rows
      const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
      
      // Download link creation
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `NhatKy_HeThong_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Xuất file CSV thành công!');
    } catch (err) {
      console.error(err);
      toast.error('Lỗi khi xuất file');
    }
  };

  return (
    <div className={styles.section}>
      {/* Header Info */}
      <header className={styles.sectionHeader}>
        <div>
          <h2 className={styles.sectionTitle}>Nhật ký hệ thống</h2>
          <p className={styles.sectionSub}>
            Lịch sử hoạt động của cán bộ, giáo vụ, kế toán và các thay đổi dữ liệu trong hệ thống
          </p>
        </div>
      </header>

      {/* Filter panel */}
      <div className={styles.filterCard}>
        <div className={styles.filterGrid}>
          {/* Keyword Search */}
          <div className={styles.keywordWrapper}>
            <Input
              value={filters.keyword}
              onChange={(e) => handleFilterChange('keyword', e.target.value)}
              placeholder="Tìm mô tả hoạt động, tên người dùng..."
            />
          </div>

          {/* Action Filter */}
          <div className={styles.selectWrapper}>
            <select
              value={filters.hanh_dong}
              onChange={(e) => handleFilterChange('hanh_dong', e.target.value)}
              className={styles.selectInput}
            >
              {HANH_DONG_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Target Filter */}
          <div className={styles.selectWrapper}>
            <select
              value={filters.loai_doi_tuong}
              onChange={(e) => handleFilterChange('loai_doi_tuong', e.target.value)}
              className={styles.selectInput}
            >
              {DOI_TUONG_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Staff Filter */}
          <div className={styles.selectWrapper}>
            <select
              value={filters.nguoi_dung_id}
              onChange={(e) => handleFilterChange('nguoi_dung_id', e.target.value)}
              className={styles.selectInput}
            >
              <option value="">-- Nhân viên thực hiện --</option>
              {staffOptions.map((staff) => (
                <option key={staff.user_id} value={staff.user_id}>
                  {staff.ho_ten} ({staff.ten_vai_tro})
                </option>
              ))}
            </select>
          </div>

          {/* Dates */}
          <div className={styles.dateGroup}>
            <input
              type="date"
              value={filters.tu_ngay}
              onChange={(e) => handleFilterChange('tu_ngay', e.target.value)}
              className={styles.dateInput}
              placeholder="Từ ngày"
            />
            <span className={styles.dateSeparator}>đến</span>
            <input
              type="date"
              value={filters.den_ngay}
              onChange={(e) => handleFilterChange('den_ngay', e.target.value)}
              className={styles.dateInput}
              placeholder="Đến ngày"
            />
          </div>

          {/* Action buttons */}
          <div className={styles.clearBtnWrapper}>
            <Button variant="ghost" className={styles.clearBtn} onClick={handleClearFilters}>
              <HiOutlineXMark className={styles.btnIcon} />
              <span>Xóa bộ lọc</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className={styles.resultsHeader}>
        <span className={styles.resultCount}>Tìm thấy {total} bản ghi</span>
        <Button variant="outline" size="small" onClick={handleExportCSV}>
          <HiOutlineArrowDownTray className={styles.btnIcon} />
          <span>Xuất Excel</span>
        </Button>
      </div>

      {/* Logs Table */}
      <div className={styles.tableCard}>
        <div className={styles.tableWrapper}>
          <table className={styles.logsTable}>
            <thead>
              <tr>
                <th style={{ width: '150px' }}>Thời gian</th>
                <th>Người thực hiện</th>
                <th style={{ width: '160px' }}>Hành động</th>
                <th>Đối tượng</th>
                <th style={{ width: '120px' }}>Kết quả</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className={styles.loadingCell}>
                    <div className={styles.spinner}></div>
                    <p>Đang tải nhật ký...</p>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className={styles.emptyCell}>
                    <p>Không tìm thấy hoạt động nào phù hợp với bộ lọc</p>
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const dateObj = new Date(log.created_at);
                  const dateStr = dateObj.toLocaleDateString('vi-VN');
                  const timeStr = dateObj.toLocaleTimeString('vi-VN');

                  const actionConf = HANH_DONG_STYLE[log.hanh_dong] || {
                    bg: 'rgba(100,116,139,0.08)',
                    color: '#64748b',
                    icon: HiOutlineCheckCircle,
                    label: log.hanh_dong,
                  };
                  const ActionIcon = actionConf.icon;

                  // Map result value
                  const resultVal = log.hanh_dong === 'KHOA_TAI_KHOAN' ? 'CANH_BAO' : (log.mo_ta?.includes('thất bại') ? 'THAT_BAI' : 'THANH_CONG');
                  const badgeStatus = resultVal === 'THANH_CONG' ? 'approved' : (resultVal === 'THAT_BAI' ? 'rejected' : 'processing');
                  const badgeLabel = resultVal === 'THANH_CONG' ? 'Thành công' : (resultVal === 'THAT_BAI' ? 'Thất bại' : 'Cảnh báo');

                  return (
                    <tr key={log.log_id} className={styles.logRow}>
                      {/* Time */}
                      <td className={styles.timeCell}>
                        <div className={styles.dateText}>{dateStr}</div>
                        <div className={styles.timeText}>{timeStr}</div>
                      </td>

                      {/* Performing user */}
                      <td className={styles.userCell}>
                        {log.nguoi_thuc_hien ? (
                          <div className={styles.userInfo}>
                            <img
                              src={log.nguoi_thuc_hien.avatar}
                              alt="Avatar"
                              className={styles.userAvatar}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';
                              }}
                            />
                            <div>
                              <div className={styles.userName}>{log.nguoi_thuc_hien.ho_ten}</div>
                              <span className={styles.userRoleBadge}>
                                {log.nguoi_thuc_hien.ten_vai_tro}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className={styles.userInfo}>
                            <div className={styles.systemAvatar}>SYS</div>
                            <div>
                              <div className={styles.userName}>Hệ thống</div>
                              <span className={styles.systemRoleBadge}>Hệ thống</span>
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Action */}
                      <td>
                        <span
                          className={styles.actionBadge}
                          style={{ backgroundColor: actionConf.bg, color: actionConf.color }}
                        >
                          <ActionIcon className={styles.actionIcon} />
                          <span>{actionConf.label}</span>
                        </span>
                      </td>

                      {/* Target Object */}
                      <td className={styles.targetCell}>
                        <div className={styles.targetMain}>
                          <span className={styles.targetTypeBadge}>{log.loai_doi_tuong}</span>
                          <span className={styles.targetId}>ID: {log.doi_tuong_id || 'N/A'}</span>
                        </div>
                        {log.mo_ta && <div className={styles.targetDesc}>{log.mo_ta}</div>}
                      </td>

                      {/* Result */}
                      <td>
                        <StatusBadge status={badgeStatus} text={badgeLabel} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className={styles.pageBtn}
            >
              <HiOutlineChevronLeft />
            </button>
            <span className={styles.pageInfo}>
              Trang <strong>{page}</strong> / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className={styles.pageBtn}
            >
              <HiOutlineChevronRight />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NhatKySection;
