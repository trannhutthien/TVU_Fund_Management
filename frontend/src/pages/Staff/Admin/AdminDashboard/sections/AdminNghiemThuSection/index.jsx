import PropTypes from 'prop-types';
import {
  HiClipboardDocumentCheck,
  HiClock,
  HiCheckCircle,
  HiXCircle,
} from 'react-icons/hi2';
import styles from './AdminNghiemThuSection.module.scss';

const AdminNghiemThuSection = ({ nghiemThuData, isLoading }) => {
  const data = nghiemThuData?.data?.data || {};
  const tongDon = data.tongDon || 0;
  const dangCho = data.dangCho || 0;
  const dat = data.dat || 0;
  const khongDat = data.khongDat || 0;
  const tyLeDat = dat + khongDat > 0 ? Math.round((dat / (dat + khongDat)) * 100) : 0;

  const cards = [
    {
      key: 'tongDon',
      label: 'Tổng đơn nghiệm thu',
      value: tongDon,
      Icon: HiClipboardDocumentCheck,
      iconBg: 'rgba(59, 130, 246, 0.10)',
      iconColor: '#3b82f6',
      highlight: false,
    },
    {
      key: 'dangCho',
      label: 'Đang chờ xử lý',
      value: dangCho,
      Icon: HiClock,
      iconBg: 'rgba(249, 115, 22, 0.10)',
      iconColor: '#f97316',
      highlight: false,
    },
    {
      key: 'dat',
      label: 'Đạt nghiệm thu',
      value: dat,
      Icon: HiCheckCircle,
      iconBg: 'rgba(22, 163, 74, 0.10)',
      iconColor: '#16a34a',
      highlight: dat > 0,
      subText: `${tyLeDat}% tỷ lệ đạt`,
    },
    {
      key: 'khongDat',
      label: 'Không đạt',
      value: khongDat,
      Icon: HiXCircle,
      iconBg: 'rgba(239, 68, 68, 0.10)',
      iconColor: '#ef4444',
      highlight: false,
    },
  ];

  if (isLoading) {
    return (
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Nghiệm thu</div>
        <div className={styles.grid}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={styles.skeleton} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>Nghiệm thu</div>
      <div className={styles.grid}>
        {cards.map((card) => {
          const Icon = card.Icon;
          return (
            <div
              key={card.key}
              className={`${styles.card} ${card.highlight ? styles.cardHighlight : ''}`}
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
                {card.subText && (
                  <div className={styles.subText}>{card.subText}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

AdminNghiemThuSection.propTypes = {
  nghiemThuData: PropTypes.shape({
    data: PropTypes.shape({
      data: PropTypes.shape({
        tongDon: PropTypes.number,
        dangCho: PropTypes.number,
        dat: PropTypes.number,
        khongDat: PropTypes.number,
      }),
    }),
  }),
  isLoading: PropTypes.bool,
};

export default AdminNghiemThuSection;
