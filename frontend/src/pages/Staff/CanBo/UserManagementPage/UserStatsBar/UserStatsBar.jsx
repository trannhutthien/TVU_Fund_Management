import {
  HiOutlineUsers,
  HiOutlineAcademicCap,
  HiOutlineHandRaised,
  HiOutlineLockClosed,
} from 'react-icons/hi2';
import { StatCard } from '@components/common/Card';
import styles from './UserStatsBar.module.scss';

const UserStatsBar = ({ stats, loading, activeKey, onCardClick }) => {
  const cards = [
    {
      key: 'all',
      label: 'Tổng người dùng',
      value: stats
        ? stats.tongNguoiDungHoatDong !== undefined
          ? `${stats.tongNguoiDungHoatDong}/${stats.tongNguoiDung}`
          : (stats.tongNguoiDung ?? 0)
        : 0,
      icon: HiOutlineUsers,
      color: 'var(--color-navy-blue, #1a2f5e)',
      bg: 'rgba(26,47,94,0.08)',
      iconBgColor: 'blue',
    },
    {
      key: 'students',
      label: 'Sinh viên',
      value: stats
        ? stats.sinhVienHoatDong !== undefined
          ? `${stats.sinhVienHoatDong}/${stats.sinhVien}`
          : (stats.sinhVien ?? 0)
        : 0,
      icon: HiOutlineAcademicCap,
      color: 'var(--color-gold, #f0a500)',
      bg: 'rgba(240,165,0,0.08)',
      iconBgColor: 'yellow',
    },
    {
      key: 'donors',
      label: 'Nhà tài trợ',
      value: stats
        ? stats.nhaTaiTroHoatDong !== undefined
          ? `${stats.nhaTaiTroHoatDong}/${stats.nhaTaiTro}`
          : (stats.nhaTaiTro ?? 0)
        : 0,
      icon: HiOutlineHandRaised,
      color: '#10b981',
      bg: 'rgba(16,185,129,0.08)',
      iconBgColor: 'green',
    },
    {
      key: 'locked',
      label: 'Tài khoản bị khóa',
      value: stats?.taiKhoanBiKhoa ?? 0,
      icon: HiOutlineLockClosed,
      color: '#ef4444',
      bg: 'rgba(239,68,68,0.08)',
      iconBgColor: 'red',
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
        const isActive = activeKey === card.key;

        return (
          <StatCard
            key={card.key}
            title={card.label}
            value={card.value}
            icon={<Icon size={20} />}
            iconBgColor={card.iconBgColor}
            onClick={() => onCardClick?.(card.key)}
            className={isActive ? styles.activeCard : ''}
          />
        );
      })}
    </div>
  );
};

export default UserStatsBar;
