import PropTypes from 'prop-types';
import {
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineBanknotes,
  HiOutlineRocketLaunch,
} from 'react-icons/hi2';
import styles from './ProposalStats.module.scss';

/**
 * ProposalStats - Thống kê đề xuất chương trình
 */
const ProposalStats = ({ stats, loading, userRole }) => {
  if (loading) {
    return (
      <div className={styles.statsContainer}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`${styles.statCard} ${styles.loading}`}>
            <div className={styles.skeleton}></div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const statCards = [
    {
      id: 'cho_duyet',
      label: 'Chờ cán bộ duyệt',
      value: stats.choDuyet || 0,
      icon: HiOutlineClock,
      color: 'yellow',
      show: true,
    },
    {
      id: 'can_bo_da_duyet',
      label: 'Chờ kế toán xác nhận',
      value: stats.canBoPheDuyet || 0,
      icon: HiOutlineBanknotes,
      color: 'blue',
      show: true,
    },
    {
      id: 'da_nhan_tien',
      label: 'Chờ admin tạo hoạt động',
      value: stats.daNhanTien || 0,
      icon: HiOutlineRocketLaunch,
      color: 'purple',
      show: true,
    },
    {
      id: 'da_tao_hoat_dong',
      label: 'Đã tạo hoạt động',
      value: stats.daTaoHoatDong || 0,
      icon: HiOutlineCheckCircle,
      color: 'green',
      show: true,
    },
    {
      id: 'tu_choi',
      label: 'Từ chối',
      value: stats.tuChoi || 0,
      icon: HiOutlineXCircle,
      color: 'red',
      show: true,
    },
  ];

  // Highlight stat dựa trên vai trò
  const getHighlightForRole = (cardId) => {
    // Cán bộ (vaitro_id = 3): Highlight "Chờ cán bộ duyệt"
    if (userRole === 3 && cardId === 'cho_duyet') {
      return true;
    }
    // Kế toán (vaitro_id = 2): Highlight "Chờ kế toán xác nhận"
    if (userRole === 2 && cardId === 'can_bo_da_duyet') {
      return true;
    }
    // Admin (vaitro_id = 1): Highlight "Chờ admin tạo hoạt động"
    if (userRole === 1 && cardId === 'da_nhan_tien') {
      return true;
    }
    return false;
  };

  return (
    <div className={styles.statsContainer}>
      {statCards
        .filter((card) => card.show)
        .map((card) => {
          const Icon = card.icon;
          const isHighlight = getHighlightForRole(card.id);

          return (
            <div
              key={card.id}
              className={`${styles.statCard} ${styles[card.color]} ${
                isHighlight ? styles.highlight : ''
              }`}
            >
              <div className={styles.statIcon}>
                <Icon />
              </div>
              <div className={styles.statContent}>
                <p className={styles.statLabel}>{card.label}</p>
                <p className={styles.statValue}>{card.value}</p>
              </div>
            </div>
          );
        })}
    </div>
  );
};

ProposalStats.propTypes = {
  stats: PropTypes.shape({
    choDuyet: PropTypes.number,
    canBoPheDuyet: PropTypes.number,
    daNhanTien: PropTypes.number,
    daTaoHoatDong: PropTypes.number,
    tuChoi: PropTypes.number,
  }),
  loading: PropTypes.bool,
  userRole: PropTypes.number, // 1=Admin, 2=Kế toán, 3=Cán bộ
};

export default ProposalStats;
