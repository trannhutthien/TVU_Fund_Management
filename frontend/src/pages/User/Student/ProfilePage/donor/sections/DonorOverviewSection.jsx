import PropTypes from 'prop-types';
import {
  HiOutlineChartBarSquare,
  HiOutlineCurrencyDollar,
  HiOutlineHandRaised,
  HiOutlineTrophy,
} from 'react-icons/hi2';
import styles from './DonorOverviewSection.module.scss';

/**
 * DonorOverviewSection - Thống kê quyên góp của Nhà tài trợ
 */
const DonorOverviewSection = ({
  tongSoTienQuyenGop = 0,
  soLanQuyenGop = 0,
  hangNhaTaiTro = null,
}) => {
  const STATS = [
    {
      id: 'tongTien',
      icon: HiOutlineCurrencyDollar,
      label: 'Tổng số tiền quyên góp',
      value: tongSoTienQuyenGop,
      type: 'currency',
    },
    {
      id: 'soLan',
      icon: HiOutlineHandRaised,
      label: 'Số lần quyên góp',
      value: soLanQuyenGop,
      type: 'number',
    },
    {
      id: 'hang',
      icon: HiOutlineTrophy,
      label: 'Hạng nhà tài trợ',
      value: hangNhaTaiTro,
      type: 'badge',
    },
  ];

  const formatCurrency = (amount) => {
    if (!amount) return '0 ₫';
    return `${amount.toLocaleString('vi-VN')} ₫`;
  };

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <HiOutlineChartBarSquare className={styles.headerIcon} />
        <h2 className={styles.headerTitle}>Tổng quan quyên góp</h2>
      </div>

      <div className={styles.statsList}>
        {STATS.map((stat, index) => {
          const Icon = stat.icon;
          const isLast = index === STATS.length - 1;
          const isBadgeRow = stat.type === 'badge';
          const rowClasses = `${styles.statRow} ${isBadgeRow ? styles.statRowBadge : ''} ${isLast ? styles.statRowLast : ''}`;

          return (
            <div key={stat.id} className={rowClasses}>
              <div className={styles.statLeft}>
                <Icon className={styles.statIcon} />
                <span className={styles.statLabel}>{stat.label}</span>
              </div>

              <div className={styles.statRight}>
                {stat.type === 'currency' ? (
                  <span
                    className={
                      stat.value === 0 ? styles.statValueZero : styles.statValue
                    }
                  >
                    {formatCurrency(stat.value)}
                  </span>
                ) : stat.type === 'number' ? (
                  <span
                    className={
                      stat.value === 0 ? styles.statValueZero : styles.statValue
                    }
                  >
                    {stat.value}
                  </span>
                ) : (
                  <>
                    {stat.value !== null ? (
                      <div className={styles.badge}>{stat.value}</div>
                    ) : (
                      <span className={styles.statValueNull}>—</span>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

DonorOverviewSection.propTypes = {
  tongSoTienQuyenGop: PropTypes.number,
  soLanQuyenGop: PropTypes.number,
  hangNhaTaiTro: PropTypes.string,
};

export default DonorOverviewSection;
