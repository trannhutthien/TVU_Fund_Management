import {
  HiOutlineUsers,
  HiOutlineAcademicCap,
  HiOutlineHandRaised,
  HiOutlineLockClosed,
} from 'react-icons/hi2';
import styles from './UserStatsBar.module.scss';

const UserStatsBar = ({ stats, loading }) => {
  const cards = [
    {
      label: 'Tổng người dùng',
      value: stats
        ? stats.tongNguoiDungHoatDong !== undefined
          ? `${stats.tongNguoiDungHoatDong}/${stats.tongNguoiDung}`
          : (stats.tongNguoiDung ?? 0)
        : 0,
      icon: HiOutlineUsers,
      color: 'var(--color-navy-blue, #1a2f5e)',
      bg: 'rgba(26,47,94,0.08)',
    },
    {
      label: 'Sinh viên',
      value: stats
        ? stats.sinhVienHoatDong !== undefined
          ? `${stats.sinhVienHoatDong}/${stats.sinhVien}`
          : (stats.sinhVien ?? 0)
        : 0,
      icon: HiOutlineAcademicCap,
      color: 'var(--color-gold, #f0a500)',
      bg: 'rgba(240,165,0,0.08)',
    },
    {
      label: 'Nhà tài trợ',
      value: stats
        ? stats.nhaTaiTroHoatDong !== undefined
          ? `${stats.nhaTaiTroHoatDong}/${stats.nhaTaiTro}`
          : (stats.nhaTaiTro ?? 0)
        : 0,
      icon: HiOutlineHandRaised,
      color: '#10b981',
      bg: 'rgba(16,185,129,0.08)',
    },
    {
      label: 'Tài khoản bị khóa',
      value: stats?.taiKhoanBiKhoa ?? 0,
      icon: HiOutlineLockClosed,
      color: '#ef4444',
      bg: 'rgba(239,68,68,0.08)',
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
        return (
          <div key={card.label} className={styles.statCard}>
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

export default UserStatsBar;
