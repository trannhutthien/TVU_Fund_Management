import PropTypes from 'prop-types';
import {
  HiOutlineCurrencyDollar,
  HiOutlineArrowTrendingUp,
  HiOutlineExclamationTriangle,
  HiOutlineBuildingOffice2,
  HiOutlineClock,
  HiOutlineReceiptPercent,
  HiOutlineArrowPath,
} from 'react-icons/hi2';
import { StatCard } from '@components/common/Card';
import { formatCurrency } from '@utils/formatters';
import styles from './index.module.scss';

const CARDS = [
  {
    key: 'tongDuNo',
    label: 'Tong du no toan he thong',
    icon: HiOutlineCurrencyDollar,
    iconBgColor: 'blue',
    isCurrency: true,
  },
  {
    key: 'daThuHoi',
    label: 'Da thu hoi luy ke',
    icon: HiOutlineArrowTrendingUp,
    iconBgColor: 'green',
    isCurrency: true,
  },
  {
    key: 'dangQuaHan',
    label: 'Gia tri dang qua han',
    icon: HiOutlineExclamationTriangle,
    iconBgColor: 'red',
    isCurrency: true,
  },
  {
    key: 'soHoSoQuaHan',
    label: 'So ho so qua han',
    icon: HiOutlineBuildingOffice2,
    iconBgColor: 'yellow',
    isCurrency: false,
  },
  {
    key: 'choXacNhan',
    label: 'Dang cho xac nhan',
    icon: HiOutlineClock,
    iconBgColor: 'purple',
    isCurrency: false,
  },
  {
    key: 'dangThuHoiNo',
    label: 'Dang thu hoi no',
    icon: HiOutlineArrowPath,
    iconBgColor: 'yellow',
    isCurrency: true,
  },
  {
    key: 'tongLaiPhat',
    label: 'Lai phat chua thu',
    icon: HiOutlineReceiptPercent,
    iconBgColor: 'red',
    isCurrency: true,
  },
];

const TongQuanCongNoCard = ({ data }) => {
  if (!data) return null;

  return (
    <div className={styles.cardGrid}>
      {CARDS.map((card) => {
        const value = data[card.key] ?? 0;
        const displayValue = card.isCurrency ? formatCurrency(value) : value;
        return (
          <StatCard
            key={card.key}
            title={card.label}
            value={displayValue}
            icon={<card.icon size={28} />}
            iconBgColor={card.iconBgColor}
          />
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
    dangThuHoiNo: PropTypes.number,
    tongLaiPhat: PropTypes.number,
  }),
};

export default TongQuanCongNoCard;
