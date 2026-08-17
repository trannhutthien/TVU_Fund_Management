import PropTypes from 'prop-types';
import {
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineBanknotes,
  HiOutlineRocketLaunch,
} from 'react-icons/hi2';
import styles from './ProposalStatusBadge.module.scss';

/**
 * ProposalStatusBadge - Badge hiển thị trạng thái đề xuất chương trình
 * 
 * Trạng thái:
 * - Cho duyet: Chờ cán bộ duyệt
 * - Can bo da duyet: Cán bộ đã duyệt, chờ kế toán xác nhận
 * - Da nhan tien: Đã nhận tiền, chờ admin tạo hoạt động
 * - Da tao hoat dong: Đã tạo hoạt động thành công
 * - Da duyet: Đã duyệt (luồng cũ - backward compat)
 * - Tu choi: Bị từ chối
 */
const ProposalStatusBadge = ({ status, size = 'md' }) => {
  const getStatusConfig = (status) => {
    const normalizedStatus = status?.trim();

    switch (normalizedStatus) {
      case 'Cho duyet':
        return {
          label: 'Chờ duyệt',
          className: 'pending',
          icon: HiOutlineClock,
        };

      case 'Can bo da duyet':
        return {
          label: 'Chờ xác nhận tiền',
          className: 'inProgress',
          icon: HiOutlineBanknotes,
        };

      case 'Da nhan tien':
        return {
          label: 'Chờ tạo hoạt động',
          className: 'confirmed',
          icon: HiOutlineRocketLaunch,
        };

      case 'Da tao hoat dong':
        return {
          label: 'Đã tạo hoạt động',
          className: 'completed',
          icon: HiOutlineCheckCircle,
        };

      case 'Da duyet':
        return {
          label: 'Đã duyệt',
          className: 'approved',
          icon: HiOutlineCheckCircle,
        };

      case 'Tu choi':
        return {
          label: 'Từ chối',
          className: 'rejected',
          icon: HiOutlineXCircle,
        };

      default:
        return {
          label: status || 'Không xác định',
          className: 'unknown',
          icon: HiOutlineClock,
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <span
      className={`${styles.badge} ${styles[config.className]} ${styles[size]}`}
      title={config.label}
    >
      <Icon className={styles.icon} />
      <span className={styles.label}>{config.label}</span>
    </span>
  );
};

ProposalStatusBadge.propTypes = {
  status: PropTypes.string.isRequired,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
};

export default ProposalStatusBadge;
