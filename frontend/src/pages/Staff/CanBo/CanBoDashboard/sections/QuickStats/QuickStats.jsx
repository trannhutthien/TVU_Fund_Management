import {
  HiOutlineClock,
  HiOutlineArrowPath,
  HiOutlineBanknotes,
  HiOutlineCheckBadge,
} from 'react-icons/hi2';
import { useNavigate } from 'react-router-dom';
import { StatCard } from '@components/common/Card';
import { CHART_COLORS } from '../../constants';
import { formatCurrency } from '../../utils';
import styles from './QuickStats.module.scss';

const QuickStats = ({ stats }) => {
  const navigate = useNavigate();

  const cards = [
    {
      key: 'choDuyet',
      label: 'Đơn chờ xử lý',
      value: stats.choDuyet,
      icon: HiOutlineClock,
      iconBgColor: 'red',
      subText: 'Cần xử lý ngay',
      urgent: true,
      link: '/can-bo/xet-duyet',
    },
    {
      key: 'dangXuLy',
      label: 'Đang xử lý',
      value: stats.dangXuLy,
      icon: HiOutlineArrowPath,
      iconBgColor: 'yellow',
      subText: 'Đã chuyển duyệt',
    },
    {
      key: 'tongSoDu',
      label: 'Tổng số dư quỹ',
      value: formatCurrency(stats.tongSoDu),
      icon: HiOutlineBanknotes,
      iconBgColor: 'green',
      subText: `${stats.soQuyHoatDong} quỹ đang hoạt động`,
    },
    {
      key: 'daXuLy',
      label: 'Đã xử lý tháng này',
      value: stats.daXuLyThangNay,
      icon: HiOutlineCheckBadge,
      iconBgColor: 'blue',
      subText: `Tỷ lệ duyệt: ${stats.tyLeDuyet}%`,
    },
  ];

  return (
    <div className={styles.statsRow}>
      {cards.map((card) => (
        <StatCard
          key={card.key}
          title={card.label}
          value={card.value}
          subtitle={card.subText}
          icon={<card.icon size={20} />}
          iconBgColor={card.iconBgColor}
          onClick={card.link ? () => navigate(card.link) : undefined}
          className={card.urgent && Number(card.value) > 0 ? styles.statUrgent : ''}
        />
      ))}
    </div>
  );
};

export default QuickStats;
