import PropTypes from 'prop-types';
import {
  HiArrowTrendingUp,
  HiArrowTrendingDown,
  HiBuildingLibrary,
  HiGift,
  HiAcademicCap,
} from 'react-icons/hi2';
import styles from './AdminFinanceSection.module.scss';

// ═══════════════════════════════════════════════════════════════════════════════
// ─── ADMIN FINANCE SECTION ─────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
// CÔNG DỤNG: Hiển thị 5 stats cards tài chính quan trọng
// ═══════════════════════════════════════════════════════════════════════════════

const AdminFinanceSection = ({ financeData }) => {
  if (!financeData) return null;

  const {
    tongThuHeThong,
    tongChiHeThong,
    tongSoDuTatCaQuy,
    tongKhoanTaiTro,
    tongGiaiNgan,
  } = financeData;

  // ─── CALCULATE BALANCE PERCENTAGE ──────────────────────────────────────────
  const balancePercentage =
    tongThuHeThong > 0 ? (tongSoDuTatCaQuy / tongThuHeThong) * 100 : 0;

  // ─── FORMAT CURRENCY ───────────────────────────────────────────────────────
  const formatCurrency = (value) => {
    return `${(value || 0).toLocaleString('vi-VN')}đ`;
  };

  // ─── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div className={styles.section}>
      {/* Section Title */}
      <div className={styles.sectionTitle}>
        <div className={styles.titleBar} />
        <h2>Sức khỏe tài chính</h2>
      </div>

      {/* Stats Grid */}
      <div className={styles.grid}>
        {/* Card 1 - Tổng thu */}
        <div className={styles.statCard}>
          <div className={`${styles.iconBox} ${styles.iconBoxGold}`}>
            <HiArrowTrendingUp size={20} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{formatCurrency(tongThuHeThong)}</div>
            <div className={styles.statLabel}>Tổng thu tích lũy</div>
            <div className={styles.statSub}>Từ tất cả khoản tài trợ</div>
          </div>
        </div>

        {/* Card 2 - Tổng chi */}
        <div className={styles.statCard}>
          <div className={`${styles.iconBox} ${styles.iconBoxRed}`}>
            <HiArrowTrendingDown size={20} />
          </div>
          <div className={styles.statContent}>
            <div className={`${styles.statValue} ${styles.statValueRed}`}>
              {formatCurrency(tongChiHeThong)}
            </div>
            <div className={styles.statLabel}>Tổng đã giải ngân</div>
            <div className={styles.statSub}>Cho sinh viên nhận hỗ trợ</div>
          </div>
        </div>

        {/* Card 3 - Tổng số dư */}
        <div className={styles.statCard}>
          <div className={`${styles.iconBox} ${styles.iconBoxNavy}`}>
            <HiBuildingLibrary size={20} />
          </div>
          <div className={styles.statContent}>
            <div className={`${styles.statValue} ${styles.statValueGreen}`}>
              {formatCurrency(tongSoDuTatCaQuy)}
            </div>
            <div className={styles.statLabel}>Tổng số dư các quỹ</div>
            <div className={styles.statSub}>Số dư khả dụng hiện tại</div>
            {/* Mini Progress Bar */}
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${Math.min(balancePercentage, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 4 - Tổng khoản tài trợ */}
        <div className={styles.statCard}>
          <div className={`${styles.iconBox} ${styles.iconBoxGold}`}>
            <HiGift size={20} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{tongKhoanTaiTro}</div>
            <div className={styles.statLabel}>Khoản tài trợ đã nhận</div>
            <div className={styles.statSub}>Tổng số lượt tài trợ thành công</div>
          </div>
        </div>

        {/* Card 5 - Tổng giải ngân */}
        <div className={styles.statCard}>
          <div className={`${styles.iconBox} ${styles.iconBoxNavy}`}>
            <HiAcademicCap size={20} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{tongGiaiNgan}</div>
            <div className={styles.statLabel}>Lượt giải ngân cho SV</div>
            <div className={styles.statSub}>Sinh viên đã nhận hỗ trợ</div>
          </div>
        </div>
      </div>
    </div>
  );
};

AdminFinanceSection.propTypes = {
  financeData: PropTypes.shape({
    tongThuHeThong: PropTypes.number,
    tongChiHeThong: PropTypes.number,
    tongSoDuTatCaQuy: PropTypes.number,
    tongKhoanTaiTro: PropTypes.number,
    tongGiaiNgan: PropTypes.number,
  }),
};

export default AdminFinanceSection;
