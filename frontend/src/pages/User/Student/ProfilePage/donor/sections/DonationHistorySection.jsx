import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlineHandRaised,
  HiOutlinePlus,
  HiChevronDown,
  HiChevronUp,
} from 'react-icons/hi2';
import Button from '@components/common/Button';
import { getMyDonations } from '@services/donorService';
import styles from './DonationHistorySection.module.scss';

/**
 * DonationHistorySection - Lịch sử quyên góp của Nhà tài trợ
 */
const DonationHistorySection = () => {
  const navigate = useNavigate();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [pagination, setPagination] = useState({ page: 1, page_size: 10, total: 0, total_pages: 0 });

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const res = await getMyDonations({ page, page_size: 10 });
      
      if (res?.success) {
        setDonations(res.data || []);
        setPagination(res.pagination || {});
      } else {
        setError(res?.message || 'Không thể lấy dữ liệu lịch sử quyên góp');
      }
    } catch (err) {
      console.error('Lỗi khi fetch quyên góp:', err);
      setError(err.message || 'Lỗi khi kết nối đến server');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    navigate('/donate');
  };

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

  const formatCurrency = (amount) => {
    if (!amount) return '0 ₫';
    return `${amount.toLocaleString('vi-VN')} ₫`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getStatusClass = (status) => {
    const statusMap = {
      'Cho duyet': styles.statusPending,
      'Cho xac nhan': styles.statusPending,
      'Da duyet': styles.statusApproved,
      'Da nhan': styles.statusCompleted,
      'Tu choi': styles.statusRejected,
    };
    return statusMap[status] || styles.statusDefault;
  };

  const getStatusLabel = (status) => {
    const statusLabels = {
      'Cho duyet': 'Chờ duyệt',
      'Cho xac nhan': 'Chờ xác nhận',
      'Da duyet': 'Đã duyệt',
      'Da nhan': 'Đã nhận tiền',
      'Tu choi': 'Từ chối',
    };
    return statusLabels[status] || status;
  };

  const handlePageChange = (newPage) => {
    fetchDonations(newPage);
  };

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <HiOutlineHandRaised className={styles.headerIcon} />
        <h2 className={styles.headerTitle}>Lịch sử quyên góp của tôi</h2>
        <div className={styles.headerRight}>
          <Button
            variant="primary"
            size="md"
            onClick={handleCreateNew}
            leftIcon={<HiOutlinePlus size={18} />}
          >
            Quyên góp mới
          </Button>
        </div>
      </div>

      <div className={styles.content}>
        {loading ? (
          <div className={styles.loadingContainer}>
            {[1, 2, 3].map((i) => (
              <div key={i} className={styles.skeletonRow} />
            ))}
          </div>
        ) : error ? (
          <div className={styles.errorContainer}>
            <p className={styles.errorText}>{error}</p>
            <Button variant="ghost" size="sm" onClick={() => fetchDonations()}>
              Thử lại
            </Button>
          </div>
        ) : donations.length === 0 ? (
          <div className={styles.emptyContainer}>
            <HiOutlineHandRaised className={styles.emptyIcon} />
            <p className={styles.emptyText}>Bạn chưa có khoản quyên góp nào</p>
            <p className={styles.emptySubtext}>
              Nhấn nút "Quyên góp mới" để tạo khoản quyên góp
            </p>
          </div>
        ) : (
          <>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Mã quyên góp</th>
                    <th>Tên quỹ</th>
                    <th>Loại quỹ</th>
                    <th>Số tiền</th>
                    <th>Trạng thái</th>
                    <th>Ngày quyên góp</th>
                    <th>Chi tiết</th>
                  </tr>
                </thead>
                <tbody>
                  {donations.map((donation) => {
                    const isExpanded = expandedRows.has(donation.khoanTaiTroId);
                    
                    return (
                      <>
                        <tr key={donation.khoanTaiTroId} className={isExpanded ? styles.expandedRow : ''}>
                          <td className={styles.cellCode}>#{donation.khoanTaiTroId}</td>
                          <td className={styles.cellFund}>{donation.tenQuy || '—'}</td>
                          <td className={styles.cellType}>{donation.loaiQuy || '—'}</td>
                          <td className={styles.cellAmount}>
                            {formatCurrency(donation.soTien)}
                          </td>
                          <td>
                            <span className={`${styles.statusBadge} ${getStatusClass(donation.trangThai)}`}>
                              {getStatusLabel(donation.trangThai)}
                            </span>
                          </td>
                          <td className={styles.cellDate}>
                            {formatDate(donation.ngayTaiTro)}
                          </td>
                          <td className={styles.cellAction}>
                            <button
                              type="button"
                              className={styles.actionBtn}
                              onClick={() => toggleExpandRow(donation.khoanTaiTroId)}
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
                        
                        {isExpanded && (
                          <tr key={`${donation.khoanTaiTroId}-expanded`} className={styles.expandedContent}>
                            <td colSpan="7">
                              <div className={styles.detailWrapper}>
                                <div className={styles.detailRow}>
                                  <strong>Hình thức:</strong> {donation.hinhThuc || 'Chuyển khoản'}
                                </div>
                                <div className={styles.detailRow}>
                                  <strong>Ghi chú:</strong> {donation.ghiChu || 'Không có ghi chú'}
                                </div>
                                {donation.chungTu && (
                                  <div className={styles.detailRow}>
                                    <strong>Chứng từ:</strong> 
                                    <a href={donation.chungTu} target="_blank" rel="noopener noreferrer" className={styles.linkDoc}>
                                      Xem chứng từ
                                    </a>
                                  </div>
                                )}
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

            {/* Pagination */}
            {pagination.total_pages > 1 && (
              <div className={styles.pagination}>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={pagination.page === 1}
                  onClick={() => handlePageChange(pagination.page - 1)}
                >
                  Trang trước
                </Button>
                <span className={styles.pageInfo}>
                  Trang {pagination.page} / {pagination.total_pages}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={pagination.page === pagination.total_pages}
                  onClick={() => handlePageChange(pagination.page + 1)}
                >
                  Trang sau
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DonationHistorySection;
