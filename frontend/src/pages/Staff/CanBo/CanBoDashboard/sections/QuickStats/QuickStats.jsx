import {
  HiOutlineClock,
  HiOutlineArrowPath,
  HiOutlineBanknotes,
  HiOutlineBuildingLibrary,
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
      key: 'tongSoDuQuyPhatTrien',
      label: 'Số dư Quỹ phát triển TVU',
      value: formatCurrency(stats.tongSoDuQuyPhatTrien),
      icon: HiOutlineBuildingLibrary,
      iconBgColor: 'blue',
      subText: 'Số dư hiện tại của quỹ mẹ',
    },
    {
      key: 'tongSoDuQuyHoatDong',
      label: 'Số dư quỹ hoạt động',
      value: formatCurrency(stats.tongSoDuQuyHoatDong),
      icon: HiOutlineBanknotes,
      iconBgColor: 'green',
      subText: 'Tổng số dư các mục chi con',
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
