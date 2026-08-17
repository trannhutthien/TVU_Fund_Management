import PropTypes from 'prop-types';
import {
  HiOutlineEye,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineBanknotes,
  HiOutlineRocketLaunch,
  HiOutlineInboxStack,
} from 'react-icons/hi2';
import ProposalStatusBadge from '@components/proposal/ProposalStatusBadge';
import { formatCurrency, formatDate } from '@utils/formatters';
import styles from './ProposalTable.module.scss';

/**
 * ProposalTable - Bảng danh sách đề xuất chương trình
 */
const ProposalTable = ({
  data,
  loading,
  activeTab,
  userRole,
  onViewDetail,
  onApprove,
  onReject,
  onConfirmMoney,
  onCreateActivity,
}) => {
  // Loading skeleton
  if (loading) {
    return (
      <div className={styles.tableContainer}>
        <div className={styles.loadingContainer}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className={styles.skeletonRow}>
              <div className={styles.skeleton}></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (!data || data.length === 0) {
    return (
      <div className={styles.tableContainer}>
        <div className={styles.emptyContainer}>
          <HiOutlineInboxStack className={styles.emptyIcon} />
          <p className={styles.emptyText}>
            {activeTab === 'can_xu_ly'
              ? 'Không có đề xuất nào cần xử lý'
              : 'Chưa có đề xuất chương trình nào'}
          </p>
        </div>
      </div>
    );
  }

  // Render action buttons dựa trên role và status
  const renderActions = (proposal) => {
    const { dexuatchuongtrinh_id: id, trangthai } = proposal;

    // Cán bộ (role 3) + status "Cho duyet"
    if (userRole === 3 && trangthai === 'Cho duyet') {
      return (
        <div className={styles.actions}>
          <button
            type="button"
            className={`${styles.actionBtn} ${styles.approve}`}
            onClick={() => onApprove?.(proposal)}
            title="Duyệt đề xuất"
          >
            <HiOutlineCheckCircle />
            <span>Duyệt</span>
          </button>
          <button
            type="button"
            className={`${styles.actionBtn} ${styles.reject}`}
            onClick={() => onReject?.(proposal)}
            title="Từ chối đề xuất"
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
        <div className={styles.actions}>
          <button
            type="button"
            className={`${styles.actionBtn} ${styles.confirm}`}
            onClick={() => onConfirmMoney?.(proposal)}
            title="Xác nhận đã nhận tiền"
          >
            <HiOutlineBanknotes />
            <span>Xác nhận tiền</span>
          </button>
        </div>
      );
    }

    // Admin (role 1) + status "Da nhan tien"
    if (userRole === 1 && trangthai === 'Da nhan tien') {
      return (
        <div className={styles.actions}>
          <button
            type="button"
            className={`${styles.actionBtn} ${styles.create}`}
            onClick={() => onCreateActivity?.(proposal)}
            title="Tạo hoạt động/chương trình"
          >
            <HiOutlineRocketLaunch />
            <span>Tạo hoạt động</span>
          </button>
        </div>
      );
    }

    // Chỉ có nút "Xem chi tiết" cho các trường hợp khác
    return (
      <div className={styles.actions}>
        <button
          type="button"
          className={`${styles.actionBtn} ${styles.view}`}
          onClick={() => onViewDetail?.(proposal)}
          title="Xem chi tiết"
        >
          <HiOutlineEye />
          <span>Chi tiết</span>
        </button>
      </div>
    );
  };

  return (
    <div className={styles.tableContainer}>
      {/* Desktop Table */}
      <div className={styles.desktopTable}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Mã ĐX</th>
              <th>Tên chương trình</th>
              <th>Quỹ thành phần</th>
              <th>Số tiền</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {data.map((proposal) => {
              const tongSoTien =
                proposal.soluongsuat * proposal.sotienmoisuat;

              return (
                <tr key={proposal.dexuatchuongtrinh_id}>
                  <td className={styles.cellId}>
                    #{proposal.dexuatchuongtrinh_id}
                  </td>
                  <td className={styles.cellName}>
                    <div className={styles.nameWrapper}>
                      <span className={styles.name}>
                        {proposal.tenchuongtrinh}
                      </span>
                      {proposal.mota && (
                        <span className={styles.desc}>
                          {proposal.mota.substring(0, 60)}
                          {proposal.mota.length > 60 ? '...' : ''}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className={styles.cellFund}>
                    {proposal.ten_quy_thanh_phan || '—'}
                  </td>
                  <td className={styles.cellAmount}>
                    {formatCurrency(tongSoTien)}
                    <span className={styles.amountDetail}>
                      {proposal.soluongsuat} suất
                    </span>
                  </td>
                  <td className={styles.cellStatus}>
                    <ProposalStatusBadge
                      status={proposal.trangthai}
                      size="sm"
                    />
                  </td>
                  <td className={styles.cellDate}>
                    {formatDate(proposal.ngaytao)}
                  </td>
                  <td className={styles.cellActions}>
                    {renderActions(proposal)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className={styles.mobileCards}>
        {data.map((proposal) => {
          const tongSoTien = proposal.soluongsuat * proposal.sotienmoisuat;

          return (
            <div
              key={proposal.dexuatchuongtrinh_id}
              className={styles.card}
              onClick={() => onViewDetail?.(proposal)}
            >
              <div className={styles.cardHeader}>
                <span className={styles.cardId}>
                  #{proposal.dexuatchuongtrinh_id}
                </span>
                <ProposalStatusBadge
                  status={proposal.trangthai}
                  size="sm"
                />
              </div>

              <h3 className={styles.cardTitle}>
                {proposal.tenchuongtrinh}
              </h3>

              {proposal.mota && (
                <p className={styles.cardDesc}>
                  {proposal.mota.substring(0, 80)}
                  {proposal.mota.length > 80 ? '...' : ''}
                </p>
              )}

              <div className={styles.cardInfo}>
                <div className={styles.cardInfoItem}>
                  <span className={styles.cardInfoLabel}>Quỹ:</span>
                  <span className={styles.cardInfoValue}>
                    {proposal.ten_quy_thanh_phan || '—'}
                  </span>
                </div>
                <div className={styles.cardInfoItem}>
                  <span className={styles.cardInfoLabel}>Số tiền:</span>
                  <span className={styles.cardInfoValue}>
                    {formatCurrency(tongSoTien)}
                  </span>
                </div>
                <div className={styles.cardInfoItem}>
                  <span className={styles.cardInfoLabel}>Ngày tạo:</span>
                  <span className={styles.cardInfoValue}>
                    {formatDate(proposal.ngaytao)}
                  </span>
                </div>
              </div>

              <div className={styles.cardActions}>
                {renderActions(proposal)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

ProposalTable.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      dexuatchuongtrinh_id: PropTypes.number.isRequired,
      tenchuongtrinh: PropTypes.string.isRequired,
      mota: PropTypes.string,
      ten_quy_thanh_phan: PropTypes.string,
      soluongsuat: PropTypes.number.isRequired,
      sotienmoisuat: PropTypes.number.isRequired,
      trangthai: PropTypes.string.isRequired,
      ngaytao: PropTypes.string.isRequired,
    })
  ),
  loading: PropTypes.bool,
  activeTab: PropTypes.string.isRequired,
  userRole: PropTypes.number, // 1=Admin, 2=Kế toán, 3=Cán bộ
  onViewDetail: PropTypes.func,
  onApprove: PropTypes.func,
  onReject: PropTypes.func,
  onConfirmMoney: PropTypes.func,
  onCreateActivity: PropTypes.func,
};

export default ProposalTable;
