import {
  HiOutlineBanknotes,
  HiOutlineDocumentText,
  HiOutlineUserGroup,
  HiOutlineCheckCircle,
  HiArrowUpRight,
  HiArrowDownRight,
  HiMinus,
} from 'react-icons/hi2';
import { formatCurrency } from '../utils';
import styles from './BieuDoSoSanh.module.scss';

const METRIC_ICONS = {
  'Tổng chi': HiOutlineBanknotes,
  'Số đơn': HiOutlineDocumentText,
  'SV hỗ trợ': HiOutlineUserGroup,
  'Đơn duyệt': HiOutlineCheckCircle,
};

const MetricCard = ({ title, kyNay, kyTruoc }) => {
  const Icon = METRIC_ICONS[title] || HiOutlineDocumentText;
  const isMoney = title === 'Tổng chi';

  // Format display
  const valNay = isMoney ? formatCurrency(kyNay) : kyNay;
  const valTruoc = isMoney ? formatCurrency(kyTruoc) : kyTruoc;

  // Calculate percentage change
  let pct = 0;
  let trend = 'none'; // 'up' | 'down' | 'none'
  if (kyTruoc > 0) {
    pct = Math.round(((kyNay - kyTruoc) / kyTruoc) * 100);
    trend = pct > 0 ? 'up' : pct < 0 ? 'down' : 'none';
  } else if (kyNay > 0) {
    pct = 100;
    trend = 'up';
  }

  // Progress relative proportion (max is 100%)
  const maxVal = Math.max(kyNay, kyTruoc, 1);
  const percentNay = Math.round((kyNay / maxVal) * 100);
  const percentTruoc = Math.round((kyTruoc / maxVal) * 100);

  return (
    <div className={styles.metricCard}>
      <div className={styles.metricHeader}>
        <div className={styles.iconBox}>
          <Icon size={18} />
        </div>
        <span className={styles.metricTitle}>{title}</span>
      </div>

      <div className={styles.metricBody}>
        <div className={styles.mainValue}>{valNay}</div>
        
        {trend === 'up' && (
          <div className={`${styles.badge} ${styles.badgeUp}`}>
            <HiArrowUpRight size={12} />
            <span>+{pct}%</span>
          </div>
        )}
        {trend === 'down' && (
          <div className={`${styles.badge} ${styles.badgeDown}`}>
            <HiArrowDownRight size={12} />
            <span>{pct}%</span>
          </div>
        )}
        {trend === 'none' && (
          <div className={`${styles.badge} ${styles.badgeNone}`}>
            <HiMinus size={10} />
            <span>0%</span>
          </div>
        )}
      </div>

      <div className={styles.metricFooter}>
        <div className={styles.comparisonLabel}>
          <span>Kỳ trước: </span>
          <span className={styles.prevValue}>{valTruoc}</span>
        </div>
        
        {/* Double comparison progress bars */}
        <div className={styles.progressGroup}>
          <div className={styles.progressLabelRow}>
            <span>Kỳ này</span>
            <span>{percentNay}%</span>
          </div>
          <div className={styles.progressBar}>
            <div
              className={`${styles.progressFill} ${styles.fillPrimary}`}
              style={{ width: `${percentNay}%` }}
            />
          </div>

          <div className={styles.progressLabelRow}>
            <span>Kỳ trước</span>
            <span>{percentTruoc}%</span>
          </div>
          <div className={styles.progressBar}>
            <div
              className={`${styles.progressFill} ${styles.fillGray}`}
              style={{ width: `${percentTruoc}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const BieuDoSoSanh = ({ data, loading }) => {
  return (
    <div className={styles.card}>
      <div className={styles.head}>
        <div>
          <h2 className={styles.title}>So sánh với kỳ trước</h2>
          <p className={styles.subtitle}>Hiệu suất chỉ tiêu hoạt động so với chu kỳ trước</p>
        </div>
      </div>

      {loading ? (
        <div className={styles.skeleton} />
      ) : (
        <div className={styles.grid}>
          {data.map((item, idx) => (
            <MetricCard
              key={idx}
              title={item.chiTieu}
              kyNay={item.kyNay}
              kyTruoc={item.kyTruoc}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BieuDoSoSanh;
