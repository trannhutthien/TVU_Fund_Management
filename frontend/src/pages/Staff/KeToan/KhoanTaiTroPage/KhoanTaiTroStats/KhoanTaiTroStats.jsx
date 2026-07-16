import {
  HiOutlineClock,
  HiOutlineCheckBadge,
  HiOutlineBanknotes,
  HiOutlineArrowPathRoundedSquare,
} from 'react-icons/hi2';
import { StatCard } from '@components/common/Card';
import { formatCurrency } from '@utils/formatters';
import styles from './KhoanTaiTroStats.module.scss';

const KhoanTaiTroStats = ({ stats, loading, isKeToan, isAdmin }) => {
  const cards = [
    {
      label: isKeToan ? 'Chờ Admin xác nhận' : 'Cần xác nhận',
      value: stats?.canXacNhan ?? 0,
      icon: HiOutlineClock,
      color: isKeToan ? '#64748b' : '#ef4444',
      bg: isKeToan ? 'rgba(100,116,139,0.08)' : 'rgba(239,68,68,0.08)',
      urgent: !isKeToan,
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
      label: isKeToan ? 'Cần duyệt' : 'Chờ kế toán duyệt',
      value: stats?.choCanBo ?? 0,
      icon: HiOutlineArrowPathRoundedSquare,
      color: isKeToan ? '#ef4444' : 'var(--color-navy-blue, #1a2f5e)',
      bg: isKeToan ? 'rgba(239,68,68,0.08)' : 'rgba(26,47,94,0.08)',
      urgent: isKeToan,
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
      <StatCard
        title={cards[0].label}
        value={cards[0].value}
        icon={<HiOutlineClock size={20} />}
        iconBgColor={isKeToan ? 'purple' : 'red'}
        className={!isKeToan && Number(cards[0].value) > 0 ? styles.statUrgent : ''}
      />
      <StatCard
        title={cards[1].label}
        value={cards[1].value}
        icon={<HiOutlineCheckBadge size={20} />}
        iconBgColor="green"
      />
      <StatCard
        title={cards[2].label}
        value={cards[2].value}
        icon={<HiOutlineBanknotes size={20} />}
        iconBgColor="yellow"
      />
      <StatCard
        title={cards[3].label}
        value={cards[3].value}
        icon={<HiOutlineArrowPathRoundedSquare size={20} />}
        iconBgColor={isKeToan ? 'red' : 'blue'}
        className={isKeToan && Number(cards[3].value) > 0 ? styles.statUrgent : ''}
      />
    </div>
  );
};

export default KhoanTaiTroStats;
