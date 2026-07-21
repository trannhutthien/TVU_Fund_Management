import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  HiShieldCheck,
  HiClipboardDocumentCheck,
  HiBanknotes,
  HiExclamationTriangle,
  HiCircleStack,
  HiClipboardDocumentList,
  HiUserGroup,
  HiClock,
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

  const {
    pendingCap2,
    pendingDonations,
    choNghiemThu,
    banKiemSoat,
    lichTraNoChoXacNhan,
    hopDongVayQuaHan,
    lowBalanceFunds,
  } = alertData;

  // ─── CHECK IF ALL CLEAR ────────────────────────────────────────────────────
  const isAllClear =
    pendingCap2 === 0 &&
    pendingDonations === 0 &&
    choNghiemThu === 0 &&
    banKiemSoat === 0 &&
    lichTraNoChoXacNhan === 0 &&
    hopDongVayQuaHan === 0 &&
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

      {/* Card 3 - Đơn chờ nghiệm thu */}
      {choNghiemThu > 0 && (
        <div className={`${styles.alertCard} ${styles.alertCardPurple}`}>
          <div className={styles.alertIconBox}>
            <HiClipboardDocumentList size={22} />
          </div>
          <div className={styles.alertContent}>
            <div className={styles.alertValue}>{choNghiemThu}</div>
            <div className={styles.alertLabel}>Đơn chờ nghiệm thu</div>
            <div className={styles.alertSub}>Đã duyệt cấp 3, chờ nghiệm thu</div>
          </div>
          <button
            className={styles.alertAction}
            onClick={() => navigate('/admin/xet-duyet')}
          >
            Xem danh sách →
          </button>
        </div>
      )}

      {/* Card 4 - Đơn chờ Ban Kiểm Soát */}
      {banKiemSoat > 0 && (
        <div className={`${styles.alertCard} ${styles.alertCardTeal}`}>
          <div className={styles.alertIconBox}>
            <HiUserGroup size={22} />
          </div>
          <div className={styles.alertContent}>
            <div className={styles.alertValue}>{banKiemSoat}</div>
            <div className={styles.alertLabel}>Đơn chờ Ban Kiểm Soát</div>
            <div className={styles.alertSub}>Cần xem xét trước khi phê duyệt</div>
          </div>
          <button
            className={styles.alertAction}
            onClick={() => navigate('/ban-kiem-soat')}
          >
            Xem danh sách →
          </button>
        </div>
      )}

      {/* Card 5 - Lịch trả nợ chờ xác nhận */}
      {lichTraNoChoXacNhan > 0 && (
        <div className={`${styles.alertCard} ${styles.alertCardCyan}`}>
          <div className={styles.alertIconBox}>
            <HiClock size={22} />
          </div>
          <div className={styles.alertContent}>
            <div className={styles.alertValue}>{lichTraNoChoXacNhan}</div>
            <div className={styles.alertLabel}>Lịch trả nợ chờ xác nhận</div>
            <div className={styles.alertSub}>Sinh viên đã nộp minh chứng</div>
          </div>
          <button
            className={styles.alertAction}
            onClick={() => navigate('/admin/xet-duyet')}
          >
            Xác nhận ngay →
          </button>
        </div>
      )}

      {/* Card 6 - Hợp đồng vay quá hạn */}
      {hopDongVayQuaHan > 0 && (
        <div className={`${styles.alertCard} ${styles.alertCardRed}`}>
          <div className={styles.alertIconBox}>
            <HiExclamationTriangle size={22} />
          </div>
          <div className={styles.alertContent}>
            <div className={styles.alertValue}>{hopDongVayQuaHan}</div>
            <div className={styles.alertLabel}>Hợp đồng vay quá hạn</div>
            <div className={styles.alertSub}>Cần xử lý thu hồi nợ</div>
          </div>
          <button
            className={styles.alertAction}
            onClick={() => navigate('/giam-sat')}
          >
            Xem chi tiết →
          </button>
        </div>
      )}

      {/* Card 7 - Quỹ sắp cạn */}
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
    choNghiemThu: PropTypes.number,
    banKiemSoat: PropTypes.number,
    lichTraNoChoXacNhan: PropTypes.number,
    hopDongVayQuaHan: PropTypes.number,
    lowBalanceFunds: PropTypes.number,
  }),
};

export default AdminAlertSection;
