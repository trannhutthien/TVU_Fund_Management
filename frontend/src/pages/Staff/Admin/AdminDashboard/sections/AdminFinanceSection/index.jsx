import PropTypes from 'prop-types';
import {
  HiArrowTrendingUp,
  HiArrowTrendingDown,
  HiBuildingLibrary,
  HiGift,
  HiAcademicCap,
} from 'react-icons/hi2';
import { StatCard } from '@components/common/Card';
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
        <StatCard
          title="Tổng thu tích lũy"
          value={formatCurrency(tongThuHeThong)}
          subtitle="Từ tất cả khoản tài trợ"
          icon={<HiArrowTrendingUp size={20} />}
          iconBgColor="yellow"
        />

        {/* Card 2 - Tổng chi */}
        <StatCard
          title="Tổng đã giải ngân"
          value={formatCurrency(tongChiHeThong)}
          subtitle="Cho sinh viên nhận hỗ trợ"
          icon={<HiArrowTrendingDown size={20} />}
          iconBgColor="red"
        />

        {/* Card 3 - Tổng số dư */}
        <StatCard
          title="Tổng số dư các quỹ"
          value={formatCurrency(tongSoDuTatCaQuy)}
          subtitle="Số dư khả dụng hiện tại"
          icon={<HiBuildingLibrary size={20} />}
          iconBgColor="blue"
          trend={balancePercentage >= 50 ? 'up' : balancePercentage >= 20 ? 'neutral' : 'down'}
          trendValue={`${balancePercentage.toFixed(1)}%`}
        />

        {/* Card 4 - Tổng khoản tài trợ */}
        <StatCard
          title="Khoản tài trợ đã nhận"
          value={tongKhoanTaiTro}
          subtitle="Tổng số lượt tài trợ thành công"
          icon={<HiGift size={20} />}
          iconBgColor="yellow"
        />

        {/* Card 5 - Tổng giải ngân */}
        <StatCard
          title="Lượt giải ngân cho SV"
          value={tongGiaiNgan}
          subtitle="Sinh viên đã nhận hỗ trợ"
          icon={<HiAcademicCap size={20} />}
          iconBgColor="blue"
        />
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
