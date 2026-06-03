import PropTypes from 'prop-types';
import {
  HiOutlineArchiveBox,
  HiOutlineCalendarDays,
  HiOutlineChartBarSquare,
  HiOutlineUsers,
} from 'react-icons/hi2';
import styles from './NhatKyStats.module.scss';

const NhatKyStats = ({ stats, loading }) => {
  const toLocaleDate = (date) => {
    return date.toLocaleDateString('vi-VN');
  };

  const STATS_CONFIG = [
    {
      label: 'Tổng bản ghi',
      value: stats?.tongBanGhi ?? 0,
      icon: HiOutlineArchiveBox,
      color: 'var(--color-primary, #1a2f5e)',
      bg: 'rgba(26,47,94,0.08)',
      sub: 'Toàn bộ lịch sử',
    },
    {
      label: 'Hôm nay',
      value: stats?.homNay ?? 0,
      icon: HiOutlineCalendarDays,
      color: 'var(--color-gold, #f0a500)',
      bg: 'rgba(240,165,0,0.08)',
      sub: toLocaleDate(new Date()),
    },
    {
      label: '7 ngày gần nhất',
      value: stats?.tuanNay ?? 0,
      icon: HiOutlineChartBarSquare,
      color: '#0891b2',
      bg: 'rgba(8,145,178,0.08)',
      sub: 'Hoạt động gần đây',
    },
    {
      label: 'Người dùng hoạt động hôm nay',
      value: stats?.nguoiDungDoc ?? 0,
      icon: HiOutlineUsers,
      color: '#10b981',
      bg: 'rgba(16,185,129,0.08)',
      sub: 'Nhân viên có thao tác',
    },
  ];

  if (loading) {
    return (
      <div className={styles.grid}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`${styles.card} ${styles.skeleton}`}>
            <div className={styles.skeletonIcon} />
            <div className={styles.skeletonContent}>
              <div className={styles.skeletonLabel} />
              <div className={styles.skeletonValue} />
              <div className={styles.skeletonSub} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {STATS_CONFIG.map((stat, idx) => {
        const IconComponent = stat.icon;
        return (
          <div key={idx} className={styles.card}>
            <div
              className={styles.iconBox}
              style={{ backgroundColor: stat.bg, color: stat.color }}
            >
              <IconComponent size={24} />
            </div>
            <div className={styles.cardInfo}>
              <span className={styles.label}>{stat.label}</span>
              <span className={styles.value}>
                {(stat.value ?? 0).toLocaleString('vi-VN')}
              </span>
              <span className={styles.sub}>{stat.sub}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

NhatKyStats.propTypes = {
  stats: PropTypes.shape({
    tongBanGhi: PropTypes.number,
    homNay: PropTypes.number,
    tuanNay: PropTypes.number,
    nguoiDungDoc: PropTypes.number,
  }),
  loading: PropTypes.bool,
};

export default NhatKyStats;
