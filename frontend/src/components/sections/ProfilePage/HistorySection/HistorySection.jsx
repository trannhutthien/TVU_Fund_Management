import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  HiOutlineClipboardDocumentList,
  HiOutlinePlus,
  HiOutlineEye,
  HiChevronDown,
  HiChevronUp,
} from 'react-icons/hi2';
import Button from '@components/common/Button';
import ApplicationStatusStepper from '@components/common/ApplicationStatusStepper';
import { applicationService } from '@services/applicationService';
import styles from './HistorySection.module.scss';

/**
 * HistorySection Component
 * 
 * Hiển thị lịch sử yêu cầu hỗ trợ của người dùng
 * 
 * @param {Boolean} loading - Trạng thái loading từ parent
 */
const HistorySection = ({ loading: parentLoading = false }) => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedRows, setExpandedRows] = useState(new Set()); // Track expanded rows

  // Fetch applications khi component mount
  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await applicationService.getMyApplications();
      
      if (response.success) {
        setApplications(response.data || []);
      } else {
        setError(response.message || 'Không thể tải danh sách yêu cầu');
      }
    } catch (err) {
      console.error('Fetch applications error:', err);
      setError('Đã xảy ra lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  // Handle navigate to create application
  const handleCreateNew = () => {
    navigate('/apply');
  };

  // Handle view detail
  const handleViewDetail = (id) => {
    // TODO: Navigate to detail page or open modal
    console.log('View detail:', id);
  };

  // Toggle expand row
  const toggleExpandRow = (id) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return '0 ₫';
    return `${amount.toLocaleString('vi-VN')} ₫`;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  // Get status badge class
  const getStatusClass = (status) => {
    const statusMap = {
      'CHO_DUYET': styles.statusPending,
      'DANG_XU_LY': styles.statusProcessing,
      'DA_DUYET': styles.statusApproved,
      'TU_CHOI': styles.statusRejected,
      'HOAN_THANH': styles.statusCompleted,
    };
    return statusMap[status] || styles.statusDefault;
  };

  // Get status label
  const getStatusLabel = (status) => {
    const statusLabels = {
      'CHO_DUYET': 'Chờ duyệt',
      'DANG_XU_LY': 'Đang xử lý',
      'DA_DUYET': 'Đã duyệt',
      'TU_CHOI': 'Từ chối',
      'HOAN_THANH': 'Hoàn thành',
    };
    return statusLabels[status] || status;
  };

  return (
    <div className={styles.historySection}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <HiOutlineClipboardDocumentList className={styles.headerIcon} />
          <h2 className={styles.headerTitle}>Lịch sử yêu cầu của tôi</h2>
        </div>
        <div className={styles.headerRight}>
          <Button
            variant="primary"
            size="md"
            onClick={handleCreateNew}
            leftIcon={<HiOutlinePlus size={18} />}
          >
            Nộp đơn hỗ trợ mới
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {loading || parentLoading ? (
          // Loading skeleton
          <div className={styles.loadingContainer}>
            {[1, 2, 3].map((i) => (
              <div key={i} className={styles.skeletonRow} />
            ))}
          </div>
        ) : error ? (
          // Error state
          <div className={styles.errorContainer}>
            <p className={styles.errorText}>{error}</p>
            <Button variant="ghost" size="sm" onClick={fetchApplications}>
              Thử lại
            </Button>
          </div>
        ) : applications.length === 0 ? (
          // Empty state
          <div className={styles.emptyContainer}>
            <HiOutlineClipboardDocumentList className={styles.emptyIcon} />
            <p className={styles.emptyText}>Bạn chưa có yêu cầu hỗ trợ nào</p>
            <p className={styles.emptySubtext}>
              Nhấn nút "Nộp đơn hỗ trợ mới" để tạo yêu cầu
            </p>
          </div>
        ) : (
          // Table
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Tên quỹ</th>
                  <th>Số tiền</th>
                  <th>Trạng thái</th>
                  <th>Ngày gửi</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => {
                  const isExpanded = expandedRows.has(app.requestId);
                  
                  return (
                    <>
                      <tr key={app.requestId} className={isExpanded ? styles.expandedRow : ''}>
                        <td className={styles.cellCode}>#{app.requestId}</td>
                        <td className={styles.cellFund}>{app.quy?.tenQuy || '—'}</td>
                        <td className={styles.cellAmount}>
                          {formatCurrency(app.soTienYeuCau)}
                        </td>
                        <td>
                          <span className={`${styles.statusBadge} ${getStatusClass(app.trangThai)}`}>
                            {getStatusLabel(app.trangThai)}
                          </span>
                        </td>
                        <td className={styles.cellDate}>
                          {formatDate(app.ngayNop)}
                        </td>
                        <td className={styles.cellAction}>
                          <button
                            type="button"
                            className={styles.actionBtn}
                            onClick={() => toggleExpandRow(app.requestId)}
                            aria-label={isExpanded ? 'Thu gọn' : 'Xem thêm'}
                            title={isExpanded ? 'Thu gọn' : 'Xem thêm'}
                          >
                            {isExpanded ? (
                              <HiChevronUp size={18} />
                            ) : (
                              <HiChevronDown size={18} />
                            )}
                          </button>
                        </td>
                      </tr>
                      
                      {/* Expanded row with status stepper */}
                      {isExpanded && (
                        <tr key={`${app.requestId}-expanded`} className={styles.expandedContent}>
                          <td colSpan="6">
                            <div className={styles.stepperWrapper}>
                              <ApplicationStatusStepper currentStatus={app.trangThai} />
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

HistorySection.propTypes = {
  loading: PropTypes.bool,
};

export default HistorySection;
