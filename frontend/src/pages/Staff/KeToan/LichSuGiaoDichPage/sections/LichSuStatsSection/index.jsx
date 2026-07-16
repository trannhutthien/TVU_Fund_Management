import PropTypes from 'prop-types';
import {
  HiArrowTrendingUp,
  HiArrowTrendingDown,
  HiScale,
  HiExclamationTriangle,
} from 'react-icons/hi2';
import { formatCurrency } from '@utils/formatters';
import styles from './LichSuStatsSection.module.scss';

const getRongMeta = (val) => {
  if (val > 0) {
    return {
      color: '#16a34a',
      bg: 'rgba(22, 163, 74, 0.10)',
      sub: 'Dòng tiền dương',
    };
  }
  if (val < 0) {
    return {
      color: '#ef4444',
      bg: 'rgba(239, 68, 68, 0.10)',
      sub: 'Dòng tiền âm',
    };
  }
  return { color: '#94a3b8', bg: '#f1f5f9', sub: 'Cân bằng' };
};

const LichSuStatsSection = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className={styles.grid}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={styles.skeleton} />
        ))}
      </div>
    );
  }

  const tongThu = data?.tongThu ?? 0;
  const tongChi = data?.tongChi ?? 0;
  const soRong = data?.soRong ?? 0;
  const soBatThuong = data?.soGiaoDichBatThuong ?? 0;

  const rongMeta = getRongMeta(soRong);
  const hasBatThuong = soBatThuong > 0;

  const cards = [
    {
      key: 'thu',
      icon: HiArrowTrendingUp,
      iconBg: 'rgba(240, 165, 0, 0.12)',
      iconColor: 'var(--color-gold, #f0a500)',
      value: formatCurrency(tongThu),
      label: 'Tổng thu',
      sub: 'Từ nhà tài trợ',
      valueColor: 'var(--color-navy-blue, #1a2f5e)',
    },
    {
      key: 'chi',
      icon: HiArrowTrendingDown,
      iconBg: 'rgba(239, 68, 68, 0.10)',
      iconColor: '#ef4444',
      value: formatCurrency(tongChi),
      label: 'Tổng chi',
      sub: 'Giải ngân cho sinh viên',
      valueColor: '#dc2626',
    },
    {
      key: 'rong',
      icon: HiScale,
      iconBg: rongMeta.bg,
      iconColor: rongMeta.color,
      value: formatCurrency(soRong),
      label: 'Số ròng (Thu - Chi)',
      sub: rongMeta.sub,
      valueColor: rongMeta.color,
    },
    {
      key: 'batThuong',
      icon: HiExclamationTriangle,
      iconBg: hasBatThuong
        ? 'rgba(239, 68, 68, 0.10)'
        : 'rgba(22, 163, 74, 0.10)',
      iconColor: hasBatThuong ? '#ef4444' : '#16a34a',
      value: String(soBatThuong),
      label: hasBatThuong
        ? 'Giao dịch bất thường'
        : 'Không có bất thường',
      sub: hasBatThuong ? 'Thất bại / Hoàn tiền — cần kiểm tra' : '',
      valueColor: hasBatThuong ? '#ef4444' : '#16a34a',
      urgent: hasBatThuong,
    },
  ];

  return (
    <div className={styles.grid}>
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.key}
            className={`${styles.card} ${card.urgent ? styles.cardUrgent : ''}`}
          >
            <div
              className={styles.iconBox}
              style={{ background: card.iconBg, color: card.iconColor }}
            >
              <Icon size={22} />
            </div>
            <div className={styles.textBlock}>
              <div
                className={styles.value}
                style={{ color: card.valueColor }}
              >
                {card.value}
              </div>
              <div className={styles.label}>{card.label}</div>
              {card.sub && <div className={styles.sub}>{card.sub}</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
};

LichSuStatsSection.propTypes = {
  data: PropTypes.shape({
    tongThu: PropTypes.number,
    tongChi: PropTypes.number,
    soRong: PropTypes.number,
    soGiaoDich: PropTypes.number,
    soGiaoDichBatThuong: PropTypes.number,
  }),
  isLoading: PropTypes.bool,
};

export default LichSuStatsSection;
