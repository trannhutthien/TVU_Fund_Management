import PropTypes from 'prop-types';
import {
  HiCurrencyDollar,
  HiDocumentCheck,
  HiExclamationTriangle,
  HiClock,
  HiCheckCircle,
  HiExclamationCircle,
  HiArrowPath,
} from 'react-icons/hi2';
import { formatCurrency } from '@utils/formatters';
import styles from './AdminCongNoSection.module.scss';

const AdminCongNoSection = ({ summaryData, congNoData, isLoading }) => {
  const vayVonCards = [
    {
      key: 'duNoVay',
      label: 'Dư nợ vay vốn',
      value: formatCurrency(summaryData?.duNoVay),
      Icon: HiCurrencyDollar,
      iconBg: 'rgba(239, 68, 68, 0.10)',
      iconColor: '#ef4444',
      urgent: false,
    },
    {
      key: 'hopDongVayDangThucHien',
      label: 'HĐ đang thực hiện',
      value: summaryData?.hopDongVayDangThucHien ?? 0,
      Icon: HiDocumentCheck,
      iconBg: 'rgba(59, 130, 246, 0.10)',
      iconColor: '#3b82f6',
      urgent: false,
    },
    {
      key: 'hopDongVayQuaHan',
      label: 'HĐ quá hạn',
      value: summaryData?.hopDongVayQuaHan ?? 0,
      Icon: HiExclamationTriangle,
      iconBg: 'rgba(239, 68, 68, 0.10)',
      iconColor: '#ef4444',
      urgent: true,
    },
    {
      key: 'lichTraNoChoXacNhan',
      label: 'Chờ xác nhận trả nợ',
      value: summaryData?.lichTraNoChoXacNhan ?? 0,
      Icon: HiClock,
      iconBg: 'rgba(249, 115, 22, 0.10)',
      iconColor: '#f97316',
      urgent: false,
    },
  ];

  const congNo = congNoData?.data?.data || {};
  const congNoCards = [
    {
      key: 'tongDuNo',
      label: 'Tổng dư nợ hệ thống',
      value: formatCurrency(congNo.tongDuNo),
      Icon: HiCurrencyDollar,
      iconBg: 'rgba(59, 130, 246, 0.10)',
      iconColor: '#3b82f6',
      urgent: false,
    },
    {
      key: 'daThuHoi',
      label: 'Đã thu hồi lũy kế',
      value: formatCurrency(congNo.daThuHoi),
      Icon: HiCheckCircle,
      iconBg: 'rgba(22, 163, 74, 0.10)',
      iconColor: '#16a34a',
      urgent: false,
    },
    {
      key: 'dangQuaHan',
      label: 'Giá trị đang quá hạn',
      value: formatCurrency(congNo.dangQuaHan),
      Icon: HiExclamationTriangle,
      iconBg: 'rgba(239, 68, 68, 0.10)',
      iconColor: '#ef4444',
      urgent: true,
    },
    {
      key: 'soHoSoQuaHan',
      label: 'Hồ sơ quá hạn',
      value: congNo.soHoSoQuaHan ?? 0,
      Icon: HiExclamationCircle,
      iconBg: 'rgba(234, 179, 8, 0.10)',
      iconColor: '#eab308',
      urgent: true,
    },
    {
      key: 'dangThuHoiNo',
      label: 'Đang thu hồi nợ',
      value: formatCurrency(congNo.dangThuHoiNo),
      Icon: HiArrowPath,
      iconBg: 'rgba(234, 179, 8, 0.10)',
      iconColor: '#eab308',
      urgent: false,
    },
    {
      key: 'tongLaiPhat',
      label: 'Lãi phạt chưa thu',
      value: formatCurrency(congNo.tongLaiPhat),
      Icon: HiCurrencyDollar,
      iconBg: 'rgba(239, 68, 68, 0.10)',
      iconColor: '#ef4444',
      urgent: true,
    },
  ];

  if (isLoading) {
    return (
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Tình hình vay vốn & Công nợ</div>
        <div className={styles.grid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={styles.skeleton} />
          ))}
        </div>
      </div>
    );
  }

  const renderCard = (card) => {
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
          <Icon size={20} />
        </div>
        <div className={styles.textBlock}>
          <div className={styles.value}>{card.value}</div>
          <div className={styles.label}>{card.label}</div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>Tình hình vay vốn & Công nợ</div>

      <div className={styles.groupLabel}>Vay vốn</div>
      <div className={styles.grid}>{vayVonCards.map(renderCard)}</div>

      <div className={styles.groupLabel}>Công nợ</div>
      <div className={styles.grid}>{congNoCards.map(renderCard)}</div>
    </div>
  );
};

AdminCongNoSection.propTypes = {
  summaryData: PropTypes.shape({
    duNoVay: PropTypes.number,
    hopDongVayDangThucHien: PropTypes.number,
    hopDongVayQuaHan: PropTypes.number,
    lichTraNoChoXacNhan: PropTypes.number,
  }),
  congNoData: PropTypes.shape({
    data: PropTypes.shape({
      data: PropTypes.shape({
        tongDuNo: PropTypes.number,
        daThuHoi: PropTypes.number,
        dangQuaHan: PropTypes.number,
        soHoSoQuaHan: PropTypes.number,
        dangThuHoiNo: PropTypes.number,
        tongLaiPhat: PropTypes.number,
      }),
    }),
  }),
  isLoading: PropTypes.bool,
};

export default AdminCongNoSection;
