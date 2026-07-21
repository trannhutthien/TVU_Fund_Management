import PropTypes from 'prop-types';
import {
  HiOutlineCurrencyDollar,
  HiOutlineArrowTrendingUp,
  HiOutlineExclamationTriangle,
  HiOutlineBuildingOffice2,
  HiOutlineClock,
} from 'react-icons/hi2';
import { formatCurrency } from '@utils/formatters';
import styles from './index.module.scss';

const CARDS = [
  {
    key: 'tongDuNo',
    label: 'Tong du no toan he thong',
    icon: HiOutlineCurrencyDollar,
    color: '#3b6ff5',
    bg: 'rgba(59, 111, 245, 0.08)',
    isCurrency: true,
  },
  {
    key: 'daThuHoi',
    label: 'Da thu hoi luy ke',
    icon: HiOutlineArrowTrendingUp,
    color: '#16a34a',
    bg: 'rgba(22, 163, 74, 0.08)',
    isCurrency: true,
  },
  {
    key: 'dangQuaHan',
    label: 'Gia tri dang qua han',
    icon: HiOutlineExclamationTriangle,
    color: '#dc2626',
    bg: 'rgba(220, 38, 38, 0.06)',
    isCurrency: true,
  },
  {
    key: 'soHoSoQuaHan',
    label: 'So ho so qua han',
    icon: HiOutlineBuildingOffice2,
    color: '#d97706',
    bg: 'rgba(217, 119, 6, 0.08)',
    isCurrency: false,
  },
  {
    key: 'choXacNhan',
    label: 'Dang cho Ke toan xac nhan',
    icon: HiOutlineClock,
    color: '#7c3aed',
    bg: 'rgba(124, 58, 237, 0.08)',
    isCurrency: false,
  },
];

const TongQuanCongNoCard = ({ data }) => {
  if (!data) return null;

  return (
    <div className={styles.cardGrid}>
      {CARDS.map((card) => {
        const Icon = card.icon;
        const value = data[card.key] ?? 0;
        return (
          <div key={card.key} className={styles.statCard}>
            <div className={styles.statIconWrap} style={{ background: card.bg }}>
              <Icon size={20} style={{ color: card.color }} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>{card.label}</span>
              <span className={styles.statValue} style={{ color: card.color }}>
                {card.isCurrency ? formatCurrency(value) : value}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

TongQuanCongNoCard.propTypes = {
  data: PropTypes.shape({
    tongDuNo: PropTypes.number,
    daThuHoi: PropTypes.number,
    dangQuaHan: PropTypes.number,
    soHoSoQuaHan: PropTypes.number,
    choXacNhan: PropTypes.number,
  }),
};

export default TongQuanCongNoCard;
