import PropTypes from 'prop-types';
import {
  HiOutlineClipboardDocumentCheck,
  HiOutlineCheckBadge,
  HiOutlineXCircle,
  HiOutlineExclamationCircle,
} from 'react-icons/hi2';
import styles from './PheDuyetStats.module.scss';

const PheDuyetStats = ({ stats, loading }) => {
  const STATS = [
    {
      label: 'Tổng lượt phê duyệt',
      value: stats?.tongBanGhi || 0,
      icon: HiOutlineClipboardDocumentCheck,
      color: 'var(--color-primary)',
      bg: 'rgba(26,47,94,0.08)',
    },
    {
      label: 'Đã duyệt',
      value: stats?.daDuyet || 0,
      icon: HiOutlineCheckBadge,
      color: '#10b981',
      bg: 'rgba(16,185,129,0.08)',
    },
    {
      label: 'Từ chối',
      value: stats?.tuChoi || 0,
      icon: HiOutlineXCircle,
      color: '#ef4444',
      bg: 'rgba(239,68,68,0.08)',
      urgent: true,
    },
    {
      label: 'Yêu cầu bổ sung',
      value: stats?.yeuCauBoSung || 0,
      icon: HiOutlineExclamationCircle,
      color: 'var(--color-gold)',
      bg: 'rgba(240,165,0,0.08)',
    },
  ];

  if (loading) {
    return (
      <div className={styles.grid}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={styles.skeleton} />
        ))}
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {STATS.map((stat, index) => (
        <div
          key={index}
          className={`${styles.card} ${stat.urgent ? styles.cardUrgent : ''}`}
        >
          <div
            className={styles.iconBox}
            style={{ background: stat.bg }}
          >
            <stat.icon size={20} style={{ color: stat.color }} />
          </div>
          <div className={styles.content}>
            <div className={styles.value}>{stat.value.toLocaleString('vi-VN')}</div>
            <div className={styles.label}>{stat.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

PheDuyetStats.propTypes = {
  stats: PropTypes.shape({
    tongBanGhi: PropTypes.number,
    daDuyet: PropTypes.number,
    tuChoi: PropTypes.number,
    yeuCauBoSung: PropTypes.number,
  }),
  loading: PropTypes.bool,
};

export default PheDuyetStats;
