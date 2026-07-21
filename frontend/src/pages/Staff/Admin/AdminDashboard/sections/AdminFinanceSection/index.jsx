import PropTypes from 'prop-types';
import {
  HiArrowTrendingUp,
  HiArrowTrendingDown,
  HiBuildingLibrary,
  HiBanknotes,
  HiGift,
  HiAcademicCap,
  HiCurrencyDollar,
  HiDocumentText,
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
    duNoVay,
    hopDongVayDangThucHien,
    tongSoDuQuy,
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

        {/* Card 7 - Dư nợ vay vốn */}
        <StatCard
          title="Dư nợ vay vốn"
          value={formatCurrency(duNoVay)}
          subtitle="Tổng còn nợ từ cho vay"
          icon={<HiCurrencyDollar size={20} />}
          iconBgColor="red"
        />

        {/* Card 8 - Hợp đồng vay đang thực hiện */}
        <StatCard
          title="Hợp đồng vay đang thực hiện"
          value={hopDongVayDangThucHien}
          subtitle="Hợp đồng vay chưa tất toán"
          icon={<HiDocumentText size={20} />}
          iconBgColor="purple"
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
    duNoVay: PropTypes.number,
    hopDongVayDangThucHien: PropTypes.number,
    tongSoDuQuy: PropTypes.number,
  }),
};

export default AdminFinanceSection;
