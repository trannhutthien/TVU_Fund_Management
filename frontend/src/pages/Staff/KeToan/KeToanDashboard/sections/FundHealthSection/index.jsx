import PropTypes from 'prop-types';
import { HiCircleStack } from 'react-icons/hi2';
import { formatCurrency } from '@utils/formatters';
import styles from './FundHealthSection.module.scss';

const getHealth = (percent) => {
  if (percent >= 50) {
    return {
      color: 'var(--color-gold, #f0a500)',
      badge: 'Tốt',
      bg: 'rgba(240,165,0,0.12)',
      text: '#b45309',
    };
  }
  if (percent >= 20) {
    return {
      color: '#f97316',
      badge: 'Trung bình',
      bg: 'rgba(249,115,22,0.10)',
      text: '#c2410c',
    };
  }
  return {
    color: '#ef4444',
    badge: 'Cần bổ sung',
    bg: 'rgba(239,68,68,0.10)',
    text: '#dc2626',
  };
};

const FundHealthSection = ({ data, isLoading }) => (
  <div className={styles.card}>
    <div className={styles.cardHeader}>
      <HiCircleStack size={18} className={styles.titleIcon} />
      <h3 className={styles.title}>Sức khỏe các Quỹ</h3>
    </div>

    {isLoading ? (
      <div className={styles.skeletonWrap}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={styles.skeletonItem}>
            <div className={styles.skeletonLine} />
            <div className={styles.skeletonBar} />
            <div className={styles.skeletonLine} />
          </div>
        ))}
      </div>
    ) : data.length === 0 ? (
      <div className={styles.empty}>Chưa có quỹ đang hoạt động</div>
    ) : (
      <div className={styles.list}>
        {data.map((fund) => {
          const max = fund.soTienToiDa > 0 ? fund.soTienToiDa : fund.soDu || 1;
          const percent = Math.min(
            100,
            Math.round((fund.soDu / max) * 100) || 0
          );
          const health = getHealth(percent);

          return (
            <div key={fund.quyId} className={styles.item}>
              <div className={styles.itemRow}>
                <span className={styles.fundName} title={fund.tenQuy}>
                  {fund.tenQuy}
                </span>
                <span
                  className={styles.healthBadge}
                  style={{ background: health.bg, color: health.text }}
                >
                  {health.badge}
                </span>
              </div>

              <div className={styles.progressTrack}>
                <div
                  className={styles.progressFill}
                  style={{
                    width: `${percent}%`,
                    background: health.color,
                  }}
                />
              </div>

              <div className={styles.itemRow}>
                <span className={styles.balance}>
                  {formatCurrency(fund.soDu)}
                </span>
                {fund.soTienToiDa > 0 && (
                  <span className={styles.maxAmount}>
                    Tối đa: {formatCurrency(fund.soTienToiDa)}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    )}
  </div>
);

FundHealthSection.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      quyId: PropTypes.number,
      tenQuy: PropTypes.string,
      soDu: PropTypes.number,
      soTienToiDa: PropTypes.number,
    })
  ),
  isLoading: PropTypes.bool,
};

export default FundHealthSection;
