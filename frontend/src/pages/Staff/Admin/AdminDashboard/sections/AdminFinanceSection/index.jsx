import PropTypes from 'prop-types';
import {
  HiArrowTrendingUp,
  HiArrowTrendingDown,
  HiBuildingLibrary,
  HiBanknotes,
  HiGift,
  HiAcademicCap,
} from 'react-icons/hi2';
import { StatCard } from '@components/common/Card';
import { formatCurrency } from '@utils/formatters';
import styles from './AdminFinanceSection.module.scss';

const AdminFinanceSection = ({ financeData }) => {
  if (!financeData) return null;

  const {
    tongThuHeThong,
    tongChiHeThong,
    tongSoDuQuyPhatTrien,
    tongSoDuQuyHoatDong,
    tongKhoanTaiTro,
    tongGiaiNgan,
  } = financeData;

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

        {/* Card 3 - Số dư quỹ mẹ */}
        <StatCard
          title="Số dư Quỹ phát triển TVU"
          value={formatCurrency(tongSoDuQuyPhatTrien)}
          subtitle="Số dư hiện tại của quỹ mẹ"
          icon={<HiBuildingLibrary size={20} />}
          iconBgColor="blue"
        />

        <StatCard
          title="Số dư quỹ hoạt động"
          value={formatCurrency(tongSoDuQuyHoatDong)}
          subtitle="Tổng số dư các mục chi con"
          icon={<HiBanknotes size={20} />}
          iconBgColor="green"
        />

        {/* Card 5 - Tổng khoản tài trợ */}
        <StatCard
          title="Khoản tài trợ đã nhận"
          value={tongKhoanTaiTro}
          subtitle="Tổng số lượt tài trợ thành công"
          icon={<HiGift size={20} />}
          iconBgColor="yellow"
        />

        {/* Card 6 - Tổng giải ngân */}
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
    tongSoDuQuyPhatTrien: PropTypes.number,
    tongSoDuQuyHoatDong: PropTypes.number,
    tongKhoanTaiTro: PropTypes.number,
    tongGiaiNgan: PropTypes.number,
  }),
};

export default AdminFinanceSection;
