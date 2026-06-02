import PropTypes from 'prop-types';
import {
  HiOutlineChartBarSquare,
  HiOutlineDocumentText,
  HiOutlineCreditCard,
  HiOutlineStar,
} from 'react-icons/hi2';
import styles from './StudentOverviewSection.module.scss';

const StudentOverviewSection = ({
  soHoSoDaNop = 0,
  soTaiKhoanNH = 0,
  diemTinNhiem = null,
}) => {
  const STATS = [
    {
      id: 'hoSo',
      icon: HiOutlineDocumentText,
      label: 'Hồ sơ đã nộp',
      value: soHoSoDaNop,
      type: 'number',
    },
    {
      id: 'taiKhoan',
      icon: HiOutlineCreditCard,
      label: 'Tài khoản LK',
      value: soTaiKhoanNH,
      type: 'number',
    },
    {
      id: 'diemTinNhiem',
      icon: HiOutlineStar,
      label: 'Điểm tín nhiệm',
      value: diemTinNhiem,
      type: 'badge',
    },
  ];

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <HiOutlineChartBarSquare className={styles.headerIcon} />
        <h2 className={styles.headerTitle}>Tổng quan hồ sơ</h2>
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
                {stat.type === 'number' ? (
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

StudentOverviewSection.propTypes = {
  soHoSoDaNop: PropTypes.number,
  soTaiKhoanNH: PropTypes.number,
  diemTinNhiem: PropTypes.string,
};

export default StudentOverviewSection;
