import PropTypes from 'prop-types';
import {
  HiOutlineClipboardDocumentCheck,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlinePlus,
} from 'react-icons/hi2';
import styles from './InspectionSummary.module.scss';

const KET_QUA_MAP = {
  'Cho danh gia': { label: 'Chờ đánh giá', color: '#94a3b8' },
  'Dat': { label: 'Đạt', color: '#16a34a' },
  'Dat co dieu chinh': { label: 'Đạt có điều chỉnh', color: '#d97706' },
  'Khong dat': { label: 'Không đạt', color: '#dc2626' },
};

const CARDS = [
  {
    key: 'tongLanNghiemThu',
    label: 'Tổng lần nghiệm thu',
    icon: HiOutlineClipboardDocumentCheck,
    color: '#3b6ff5',
    bg: 'rgba(59, 111, 245, 0.08)',
  },
  {
    key: 'lanGanNhat',
    label: 'Lần gần nhất',
    icon: HiOutlineCheckCircle,
    color: '#7c3aed',
    bg: 'rgba(124, 58, 237, 0.08)',
    suffix: '',
  },
  {
    key: 'ketQuaGanNhat',
    label: 'Kết quả gần nhất',
    icon: HiOutlineClock,
    color: '#d97706',
    bg: 'rgba(217, 119, 6, 0.08)',
    isKetQua: true,
  },
  {
    key: 'coTheTaoMoi',
    label: 'Có thể tạo mới',
    icon: HiOutlinePlus,
    color: '#16a34a',
    bg: 'rgba(22, 163, 74, 0.08)',
    isBoolean: true,
  },
];

const InspectionSummary = ({ tongQuan }) => {
  if (!tongQuan) return null;

  return (
    <div className={styles.card}>
      <h3 className={styles.cardTitle}>Tổng quan nghiệm thu</h3>
      <div className={styles.grid}>
        {CARDS.map((card) => {
          const Icon = card.icon;
          let value = tongQuan[card.key];

          if (card.isKetQua) {
            const kq = KET_QUA_MAP[value];
            return (
              <div key={card.key} className={styles.statCard}>
                <div className={styles.iconWrap} style={{ background: card.bg }}>
                  <Icon size={18} style={{ color: card.color }} />
                </div>
                <div className={styles.statInfo}>
                  <span className={styles.statLabel}>{card.label}</span>
                  {kq ? (
                    <span className={styles.ketquaTag} style={{ color: kq.color, background: `${kq.color}12` }}>
                      {kq.label}
                    </span>
                  ) : (
                    <span className={styles.statValue} style={{ color: '#cbd5e1' }}>—</span>
                  )}
                </div>
              </div>
            );
          }

          if (card.isBoolean) {
            return (
              <div key={card.key} className={styles.statCard}>
                <div className={styles.iconWrap} style={{ background: card.bg }}>
                  <Icon size={18} style={{ color: card.color }} />
                </div>
                <div className={styles.statInfo}>
                  <span className={styles.statLabel}>{card.label}</span>
                  <span
                    className={`${styles.booleanTag} ${value ? styles.booleanTrue : styles.booleanFalse}`}
                  >
                    {value ? 'Được phép' : 'Không được phép'}
                  </span>
                </div>
              </div>
            );
          }

          return (
            <div key={card.key} className={styles.statCard}>
              <div className={styles.iconWrap} style={{ background: card.bg }}>
                <Icon size={18} style={{ color: card.color }} />
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>{card.label}</span>
                <span className={styles.statValue} style={{ color: card.color }}>
                  {value != null ? `${value}${card.suffix || ''}` : '—'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

InspectionSummary.propTypes = {
  tongQuan: PropTypes.shape({
    tongLanNghiemThu: PropTypes.number,
    lanGanNhat: PropTypes.number,
    ketQuaGanNhat: PropTypes.string,
    coTheTaoMoi: PropTypes.bool,
  }),
};

export default InspectionSummary;
