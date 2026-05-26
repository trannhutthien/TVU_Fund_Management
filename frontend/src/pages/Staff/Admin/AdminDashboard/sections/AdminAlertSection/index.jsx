import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  HiShieldCheck,
  HiClipboardDocumentCheck,
  HiBanknotes,
  HiExclamationTriangle,
  HiCircleStack,
} from 'react-icons/hi2';
import styles from './AdminAlertSection.module.scss';

// ═══════════════════════════════════════════════════════════════════════════════
// ─── ADMIN ALERT SECTION ───────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
// CÔNG DỤNG: Hiển thị cảnh báo và việc cần làm ngay cho Admin
// ═══════════════════════════════════════════════════════════════════════════════

const AdminAlertSection = ({ alertData }) => {
  const navigate = useNavigate();

  if (!alertData) return null;

  const { pendingCap2, pendingDonations, abnormalTransactions, lowBalanceFunds } =
    alertData;

  // ─── CHECK IF ALL CLEAR ────────────────────────────────────────────────────
  const isAllClear =
    pendingCap2 === 0 &&
    pendingDonations === 0 &&
    abnormalTransactions === 0 &&
    lowBalanceFunds === 0;

  // ─── RENDER ALL CLEAR BANNER ───────────────────────────────────────────────
  if (isAllClear) {
    return (
      <div className={styles.allClearBanner}>
        <HiShieldCheck size={32} className={styles.allClearIcon} />
        <div className={styles.allClearContent}>
          <h3 className={styles.allClearTitle}>Hệ thống hoạt động bình thường</h3>
          <p className={styles.allClearSubtitle}>
            Không có hồ sơ nào chờ xử lý, không phát hiện bất thường
          </p>
        </div>
      </div>
    );
  }

  // ─── RENDER ALERT CARDS ────────────────────────────────────────────────────
  return (
    <div className={styles.alertGrid}>
      {/* Card 1 - Đơn chờ Admin duyệt */}
      {pendingCap2 > 0 && (
        <div className={`${styles.alertCard} ${styles.alertCardOrange}`}>
          <div className={styles.alertIconBox}>
            <HiClipboardDocumentCheck size={22} />
          </div>
          <div className={styles.alertContent}>
            <div className={styles.alertValue}>{pendingCap2}</div>
            <div className={styles.alertLabel}>Đơn chờ Admin duyệt</div>
            <div className={styles.alertSub}>Đã qua vòng Cán bộ</div>
          </div>
          <button
            className={styles.alertAction}
            onClick={() => navigate('/admin/xet-duyet')}
          >
            Xét duyệt ngay →
          </button>
        </div>
      )}

      {/* Card 2 - Khoản tài trợ chờ xác nhận */}
      {pendingDonations > 0 && (
        <div className={`${styles.alertCard} ${styles.alertCardYellow}`}>
          <div className={styles.alertIconBox}>
            <HiBanknotes size={22} />
          </div>
          <div className={styles.alertContent}>
            <div className={styles.alertValue}>{pendingDonations}</div>
            <div className={styles.alertLabel}>Khoản tài trợ chờ xác nhận</div>
            <div className={styles.alertSub}>Đã duyệt, chờ kế toán nhận tiền</div>
          </div>
          <button
            className={styles.alertAction}
            onClick={() => navigate('/admin/khoan-tai-tro')}
          >
            Xem khoản tài trợ →
          </button>
        </div>
      )}

      {/* Card 3 - Giao dịch bất thường */}
      {abnormalTransactions > 0 && (
        <div className={`${styles.alertCard} ${styles.alertCardRed}`}>
          <div className={styles.alertIconBox}>
            <HiExclamationTriangle size={22} />
          </div>
          <div className={styles.alertContent}>
            <div className={styles.alertValue}>{abnormalTransactions}</div>
            <div className={styles.alertLabel}>Giao dịch bất thường</div>
            <div className={styles.alertSub}>Thất bại hoặc hoàn tiền</div>
          </div>
          <button
            className={styles.alertAction}
            onClick={() => navigate('/admin/giao-dich')}
          >
            Kiểm tra ngay →
          </button>
        </div>
      )}

      {/* Card 4 - Quỹ sắp cạn */}
      {lowBalanceFunds > 0 && (
        <div className={`${styles.alertCard} ${styles.alertCardBlue}`}>
          <div className={styles.alertIconBox}>
            <HiCircleStack size={22} />
          </div>
          <div className={styles.alertContent}>
            <div className={styles.alertValue}>{lowBalanceFunds}</div>
            <div className={styles.alertLabel}>Quỹ số dư dưới 20%</div>
            <div className={styles.alertSub}>Cần bổ sung kinh phí</div>
          </div>
          <button
            className={styles.alertAction}
            onClick={() => navigate('/admin/quy')}
          >
            Xem danh sách quỹ →
          </button>
        </div>
      )}
    </div>
  );
};

AdminAlertSection.propTypes = {
  alertData: PropTypes.shape({
    pendingCap2: PropTypes.number,
    pendingDonations: PropTypes.number,
    abnormalTransactions: PropTypes.number,
    lowBalanceFunds: PropTypes.number,
  }),
};

export default AdminAlertSection;
