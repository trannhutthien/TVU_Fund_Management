import {
  HiOutlineClock,
  HiOutlineCheckBadge,
  HiOutlineBanknotes,
  HiOutlineArrowPathRoundedSquare,
} from 'react-icons/hi2';
import styles from './KhoanTaiTroStats.module.scss';

const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '0đ';
  const n = Number(amount);
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)} tỷ`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)} triệu`;
  return n.toLocaleString('vi-VN') + 'đ';
};

const KhoanTaiTroStats = ({ stats, loading }) => {
  const cards = [
    {
      label: 'Cần xác nhận',
      value: stats?.canXacNhan ?? 0,
      icon: HiOutlineClock,
      color: '#ef4444',
      bg: 'rgba(239,68,68,0.08)',
      urgent: true,
    },
    {
      label: 'Đã xác nhận hôm nay',
      value: stats?.daXacNhanHomNay ?? 0,
      icon: HiOutlineCheckBadge,
      color: '#10b981',
      bg: 'rgba(16,185,129,0.08)',
    },
    {
      label: 'Tổng thu tháng này',
      value: formatCurrency(stats?.tongThangNay),
      icon: HiOutlineBanknotes,
      color: 'var(--color-gold, #f0a500)',
      bg: 'rgba(240,165,0,0.08)',
    },
    {
      label: 'Chờ cán bộ duyệt',
      value: stats?.choCanBo ?? 0,
      icon: HiOutlineArrowPathRoundedSquare,
      color: 'var(--color-navy-blue, #1a2f5e)',
      bg: 'rgba(26,47,94,0.08)',
    },
  ];

  if (loading) {
    return (
      <div className={styles.statsRow}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={styles.skeleton} />
        ))}
      </div>
    );
  }

  return (
    <div className={styles.statsRow}>
      {cards.map((card) => {
        const Icon = card.icon;
        const isUrgent = card.urgent && Number(card.value) > 0;
        return (
          <div
            key={card.label}
            className={`${styles.statCard} ${isUrgent ? styles.statUrgent : ''}`}
          >
            <div
              className={styles.statIconWrap}
              style={{ background: card.bg, color: card.color }}
            >
              <Icon className={styles.statIcon} />
            </div>
            <div className={styles.statText}>
              <div className={styles.statValue}>{card.value}</div>
              <div className={styles.statLabel}>{card.label}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KhoanTaiTroStats;
