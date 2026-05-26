import {
  HiOutlineClock,
  HiOutlineArrowPath,
  HiOutlineBanknotes,
  HiOutlineCheckBadge,
} from 'react-icons/hi2';
import StatCard from './StatCard';
import { CHART_COLORS } from '../../constants';
import { formatCurrency } from '../../utils';
import styles from './QuickStats.module.scss';

const QuickStats = ({ stats }) => {
  const cards = [
    {
      key: 'choDuyet',
      label: 'Đơn chờ xử lý',
      value: stats.choDuyet,
      icon: HiOutlineClock,
      color: CHART_COLORS.red,
      bgColor: 'rgba(239,68,68,0.08)',
      subText: 'Cần xử lý ngay',
      urgent: true,
      link: '/can-bo/xet-duyet',
    },
    {
      key: 'dangXuLy',
      label: 'Đang xử lý',
      value: stats.dangXuLy,
      icon: HiOutlineArrowPath,
      color: CHART_COLORS.orange,
      bgColor: 'rgba(245,158,11,0.08)',
      subText: 'Đã chuyển duyệt',
    },
    {
      key: 'tongSoDu',
      label: 'Tổng số dư quỹ',
      value: formatCurrency(stats.tongSoDu),
      icon: HiOutlineBanknotes,
      color: CHART_COLORS.green,
      bgColor: 'rgba(16,185,129,0.08)',
      subText: `${stats.soQuyHoatDong} quỹ đang hoạt động`,
    },
    {
      key: 'daXuLy',
      label: 'Đã xử lý tháng này',
      value: stats.daXuLyThangNay,
      icon: HiOutlineCheckBadge,
      color: CHART_COLORS.primary,
      bgColor: 'rgba(26,47,94,0.08)',
      subText: `Tỷ lệ duyệt: ${stats.tyLeDuyet}%`,
    },
  ];

  return (
    <div className={styles.statsRow}>
      {cards.map((card) => (
        <StatCard key={card.key} card={card} />
      ))}
    </div>
  );
};

export default QuickStats;
