import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  HiOutlineXMark,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineBanknotes,
  HiOutlineRocketLaunch,
  HiOutlineCalendar,
  HiOutlineCurrencyDollar,
  HiOutlineUserGroup,
  HiOutlineDocumentText,
} from 'react-icons/hi2';
import ProposalStatusBadge from '@components/proposal/ProposalStatusBadge';
import ProposalTimeline from '@components/proposal/ProposalTimeline';
import { getProposalById } from '@services/proposalService';
import { formatCurrency, formatDate } from '@utils/formatters';
import styles from './ProposalDetailDrawer.module.scss';

/**
 * ProposalDetailDrawer - Drawer hiển thị chi tiết đề xuất
 */
const ProposalDetailDrawer = ({
  proposalId,
  userRole,
  onClose,
  onApprove,
  onReject,
  onConfirmMoney,
  onCreateActivity,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [proposal, setProposal] = useState(null);

  useEffect(() => {
    if (proposalId) {
      fetchProposal();
    }
  }, [proposalId]);

  const fetchProposal = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await getProposalById(proposalId);
      if (res?.success) {
        setProposal(res.data);
      } else {
        throw new Error(res?.message || 'Không thể tải chi tiết đề xuất');
      }
    } catch (err) {
      console.error('Error fetching proposal:', err);
      setError(err.message || 'Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  };

  const renderActionButtons = () => {
    if (!proposal) return null;

    const { dexuatchuongtrinh_id: id, trangthai } = proposal;

    // Cán bộ (role 3) + status "Cho duyet"
    if (userRole === 3 && trangthai === 'Cho duyet') {
      return (
        <div className={styles.actionButtons}>
          <button
            type="button"
            className={`${styles.actionBtn} ${styles.approve}`}
            onClick={() => onApprove?.(proposal)}
          >
            <HiOutlineCheckCircle />
            <span>Duyệt đề xuất</span>
          </button>
          <button
            type="button"
            className={`${styles.actionBtn} ${styles.reject}`}
            onClick={() => onReject?.(proposal)}
          >
            <HiOutlineXCircle />
            <span>Từ chối</span>
          </button>
        </div>
      );
    }

    // Kế toán (role 2) + status "Can bo da duyet"
    if (userRole === 2 && trangthai === 'Can bo da duyet') {
      return (
        <div className={styles.actionButtons}>
          <button
            type="button"
            className={`${styles.actionBtn} ${styles.confirm}`}
            onClick={() => onConfirmMoney?.(proposal)}
          >
            <HiOutlineBanknotes />
            <span>Xác nhận đã nhận tiền</span>
          </button>
        </div>
      );
    }

    // Admin (role 1) + status "Da nhan tien"
    if (userRole === 1 && trangthai === 'Da nhan tien') {
      return (
        <div className={styles.actionButtons}>
          <button
            type="button"
            className={`${styles.actionBtn} ${styles.create}`}
            onClick={() => onCreateActivity?.(proposal)}
          >
            <HiOutlineRocketLaunch />
            <span>Tạo hoạt động/chương trình</span>
          </button>
        </div>
      );
    }

    return null;
  };

  return (
    <div className={styles.drawer} onClick={onClose}>
      <div
        className={styles.drawerContent}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={styles.drawerHeader}>
          <div>
            <h2 className={styles.drawerTitle}>Chi tiết đề xuất</h2>
            {proposal && (
              <p className={styles.drawerSubtitle}>
                Mã đề xuất: #{proposal.dexuatchuongtrinh_id}
              </p>
            )}
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Đóng"
          >
            <HiOutlineXMark />
          </button>
        </div>

        {/* Content */}
        <div className={styles.drawerBody}>
          {loading && (
            <div className={styles.loadingContainer}>
              <div className={styles.spinner}></div>
              <p>Đang tải thông tin...</p>
            </div>
          )}

          {error && (
            <div className={styles.errorContainer}>
              <HiOutlineXCircle className={styles.errorIcon} />
              <p className={styles.errorText}>{error}</p>
              <button
                type="button"
                className={styles.retryBtn}
                onClick={fetchProposal}
              >
                Thử lại
              </button>
            </div>
          )}

          {!loading && !error && proposal && (
            <>
              {/* Status Badge */}
              <div className={styles.statusSection}>
                <ProposalStatusBadge
                  status={proposal.trangthai}
                  size="lg"
                />
              </div>

              {/* Thông tin chung */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  <HiOutlineDocumentText />
                  <span>Thông tin chung</span>
                </h3>
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Tên chương trình</span>
                    <span className={styles.infoValue}>
                      {proposal.tenchuongtrinh}
                    </span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Quỹ thành phần</span>
                    <span className={styles.infoValue}>
                      {proposal.ten_quy_thanh_phan || '—'}
                    </span>
                  </div>
                  {proposal.mota && (
                    <div className={`${styles.infoItem} ${styles.fullWidth}`}>
                      <span className={styles.infoLabel}>Mô tả</span>
                      <span className={styles.infoValue}>{proposal.mota}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Thông tin tài chính */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  <HiOutlineCurrencyDollar />
                  <span>Thông tin tài chính</span>
                </h3>
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Số lượng suất</span>
                    <span className={styles.infoValue}>
                      {proposal.soluongsuat} suất
                    </span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Số tiền mỗi suất</span>
                    <span className={styles.infoValue}>
                      {formatCurrency(proposal.sotienmoisuat)}
                    </span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Tổng số tiền</span>
                    <span
                      className={`${styles.infoValue} ${styles.highlight}`}
                    >
                      {formatCurrency(
                        proposal.soluongsuat * proposal.sotienmoisuat
                      )}
                    </span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Loại hỗ trợ</span>
                    <span className={styles.infoValue}>
                      {proposal.loaihotro || '—'}
                    </span>
                  </div>
                  {proposal.so_tien_thuc_te && (
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>
                        Số tiền thực tế đã nhận
                      </span>
                      <span
                        className={`${styles.infoValue} ${styles.success}`}
                      >
                        {formatCurrency(proposal.so_tien_thuc_te)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Thời gian */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  <HiOutlineCalendar />
                  <span>Thời gian</span>
                </h3>
                <div className={styles.infoGrid}>
                  {proposal.ngaybatdau && (
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Ngày bắt đầu</span>
                      <span className={styles.infoValue}>
                        {formatDate(proposal.ngaybatdau)}
                      </span>
                    </div>
                  )}
                  {proposal.ngayketthuc && (
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Ngày kết thúc</span>
                      <span className={styles.infoValue}>
                        {formatDate(proposal.ngayketthuc)}
                      </span>
                    </div>
                  )}
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Ngày tạo đề xuất</span>
                    <span className={styles.infoValue}>
                      {formatDate(proposal.ngaytao)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Lý do từ chối (nếu có) */}
              {proposal.trangthai === 'Tu choi' && proposal.lydotuchoi && (
                <div className={`${styles.section} ${styles.rejectSection}`}>
                  <h3 className={styles.sectionTitle}>
                    <HiOutlineXCircle />
                    <span>Lý do từ chối</span>
                  </h3>
                  <p className={styles.rejectReason}>{proposal.lydotuchoi}</p>
                </div>
              )}

              {/* Timeline */}
              <div className={styles.section}>
                <ProposalTimeline
                  proposalId={proposal.dexuatchuongtrinh_id}
                  onRefresh={fetchProposal}
                />
              </div>

              {/* Action Buttons */}
              {renderActionButtons()}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

ProposalDetailDrawer.propTypes = {
  proposalId: PropTypes.number.isRequired,
  userRole: PropTypes.number, // 1=Admin, 2=Kế toán, 3=Cán bộ
  onClose: PropTypes.func.isRequired,
  onApprove: PropTypes.func,
  onReject: PropTypes.func,
  onConfirmMoney: PropTypes.func,
  onCreateActivity: PropTypes.func,
};

export default ProposalDetailDrawer;
