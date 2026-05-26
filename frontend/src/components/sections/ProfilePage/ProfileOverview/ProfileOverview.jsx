import PropTypes from 'prop-types';
import {
  HiOutlineChartBarSquare,
  HiOutlineDocumentText,
  HiOutlineCreditCard,
  HiOutlineStar,
} from 'react-icons/hi2';
import styles from './ProfileOverview.module.scss';

/**
 * ProfileOverview Component
 * 
 * Card tổng quan hồ sơ hiển thị trong sidebar phải của ProfilePage
 * Width: 100% để tự co giãn theo cột cha
 * 
 * @param {Number} soHoSoDaNop - Số đơn đã nộp
 * @param {Number} soTaiKhoanNH - Số tài khoản ngân hàng đã liên kết
 * @param {String} diemTinNhiem - Điểm tín nhiệm: 'A+', 'A', 'B+', 'B', 'C' hoặc null
 * @param {Boolean} loading - Trạng thái loading
 */
const ProfileOverview = ({
  soHoSoDaNop = 0,
  soTaiKhoanNH = 0,
  diemTinNhiem = null,
  loading = false,
}) => {
  // Danh sách stats
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
    <div className={styles.profileOverview}>
      {/* Header */}
      <div className={styles.header}>
        <HiOutlineChartBarSquare className={styles.headerIcon} />
        <span className={styles.headerText}>Tổng quan hồ sơ</span>
      </div>

      {/* Stats list */}
      {loading ? (
        // Loading skeleton
        <div className={styles.statsList}>
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className={styles.skeleton}
              style={{ animationDelay: `${index * 0.15}s` }}
            />
          ))}
        </div>
      ) : (
        // Stats rows
        <div className={styles.statsList}>
          {STATS.map((stat, index) => {
            const Icon = stat.icon;
            const isLast = index === STATS.length - 1;
            const isBadgeRow = stat.type === 'badge';
            const rowClasses = `${styles.statRow} ${isBadgeRow ? styles.statRowBadge : ''} ${isLast ? styles.statRowLast : ''}`;

            return (
              <div key={stat.id} className={rowClasses}>
                {/* Left side */}
                <div className={styles.statLeft}>
                  <Icon className={styles.statIcon} />
                  <span className={styles.statLabel}>{stat.label}</span>
                </div>

                {/* Right side */}
                <div className={styles.statRight}>
                  {stat.type === 'number' ? (
                    // Number value
                    <span
                      className={
                        stat.value === 0 ? styles.statValueZero : styles.statValue
                      }
                    >
                      {stat.value}
                    </span>
                  ) : (
                    // Badge value (Điểm tín nhiệm)
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
      )}
    </div>
  );
};

ProfileOverview.propTypes = {
  soHoSoDaNop: PropTypes.number,
  soTaiKhoanNH: PropTypes.number,
  diemTinNhiem: PropTypes.string,
  loading: PropTypes.bool,
};

export default ProfileOverview;
