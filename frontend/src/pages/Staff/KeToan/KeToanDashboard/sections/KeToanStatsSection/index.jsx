import PropTypes from 'prop-types';
import {
  HiBanknotes,
  HiArrowTrendingDown,
  HiClock,
  HiExclamationCircle,
} from 'react-icons/hi2';
import styles from './KeToanStatsSection.module.scss';

const formatCurrency = (amount) => {
  const n = Number(amount) || 0;
  return n.toLocaleString('vi-VN') + ' đ';
};

const KeToanStatsSection = ({ data, isLoading }) => {
  const thang = data?.thang ?? new Date().getMonth() + 1;
  const nam = data?.nam ?? new Date().getFullYear();

  const cards = [
    {
      key: 'tongThu',
      label: 'Tổng thu tháng này',
      value: formatCurrency(data?.tongThu),
      sub: `Tháng ${thang}/${nam}`,
      Icon: HiBanknotes,
      iconBg: 'rgba(240, 165, 0, 0.12)',
      iconColor: 'var(--color-gold, #f0a500)',
      urgent: false,
    },
    {
      key: 'tongChi',
      label: 'Tổng chi tháng này',
      value: formatCurrency(data?.tongChi),
      sub: 'Đã giải ngân cho sinh viên',
      Icon: HiArrowTrendingDown,
      iconBg: 'rgba(239, 68, 68, 0.10)',
      iconColor: '#ef4444',
      urgent: false,
    },
    {
      key: 'choXacNhanThu',
      label: 'Khoản chờ xác nhận thu',
      value: data?.choXacNhanThu ?? 0,
      sub: 'Cần xác nhận tiền vào quỹ',
      Icon: HiClock,
      iconBg: 'rgba(249, 115, 22, 0.10)',
      iconColor: '#f97316',
      urgent: false,
    },
    {
      key: 'choGiaiNgan',
      label: 'Đơn chờ giải ngân',
      value: data?.choGiaiNgan ?? 0,
      sub: 'Sinh viên đang chờ nhận tiền',
      Icon: HiExclamationCircle,
      iconBg: 'rgba(239, 68, 68, 0.10)',
      iconColor: '#ef4444',
      urgent: true,
    },
  ];

  if (isLoading) {
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
      {cards.map((card) => {
        const Icon = card.Icon;
        const isUrgent = card.urgent && Number(card.value) > 0;
        return (
          <div
            key={card.key}
            className={`${styles.card} ${isUrgent ? styles.cardUrgent : ''}`}
          >
            <div
              className={styles.iconBox}
              style={{ background: card.iconBg, color: card.iconColor }}
            >
              <Icon size={22} />
            </div>
            <div className={styles.textBlock}>
              <div className={styles.value}>{card.value}</div>
              <div className={styles.label}>{card.label}</div>
              <div className={styles.sub}>{card.sub}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

KeToanStatsSection.propTypes = {
  data: PropTypes.shape({
    tongThu: PropTypes.number,
    tongChi: PropTypes.number,
    choXacNhanThu: PropTypes.number,
    choGiaiNgan: PropTypes.number,
    thang: PropTypes.number,
    nam: PropTypes.number,
  }),
  isLoading: PropTypes.bool,
};

export default KeToanStatsSection;
