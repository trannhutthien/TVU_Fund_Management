import {
  HiOutlineInformationCircle,
  HiOutlineCheckCircle,
  HiOutlineExclamationTriangle,
  HiOutlineXCircle,
  HiOutlineClock,
} from 'react-icons/hi2';
import styles from './StatusBanner.module.scss';

const STATUS_CONFIG = {
  'Cho duyet':           { label: 'Chờ duyệt cấp 1',       bg: 'warning',  icon: HiOutlineClock },
  'Cho duyet cap 1':     { label: 'Chờ duyệt cấp 1',       bg: 'warning',  icon: HiOutlineClock },
  'Cho duyet cap 2':     { label: 'Chờ duyệt cấp 2',       bg: 'warning',  icon: HiOutlineClock },
  'Cho duyet cap 3':     { label: 'Chờ duyệt cấp 3',       bg: 'info',     icon: HiOutlineClock },
  'Dang xu ly':          { label: 'Đang xử lý',            bg: 'info',     icon: HiOutlineInformationCircle },
  'Da duyet':            { label: 'Đã duyệt',              bg: 'success',  icon: HiOutlineCheckCircle },
  'Cho giai ngan':       { label: 'Chờ giải ngân',          bg: 'info',     icon: HiOutlineInformationCircle },
  'Da giai ngan':        { label: 'Đã giải ngân',           bg: 'success',  icon: HiOutlineCheckCircle },
  'Cho nghiem thu':      { label: 'Chờ nghiệm thu',         bg: 'info',     icon: HiOutlineInformationCircle },
  'Da nghiem thu':       { label: 'Đã nghiệm thu',          bg: 'success',  icon: HiOutlineCheckCircle },
  'Hoan thanh':          { label: 'Hoàn thành',             bg: 'success',  icon: HiOutlineCheckCircle },
  'Tu choi':             { label: 'Bị từ chối',             bg: 'danger',   icon: HiOutlineXCircle },
  'Tu choi cap 1':       { label: 'Bị từ chối cấp 1',      bg: 'danger',   icon: HiOutlineXCircle },
  'Tu choi cap 2':       { label: 'Bị từ chối cấp 2',      bg: 'danger',   icon: HiOutlineXCircle },
  'Tu choi cap 3':       { label: 'Bị từ chối cấp 3',      bg: 'danger',   icon: HiOutlineXCircle },
  'Nghiem thu khong dat':{ label: 'Nghiệm thu không đạt',   bg: 'danger',   icon: HiOutlineExclamationTriangle },
  'Dang thu hoi no':      { label: 'Đang thu hồi nợ',       bg: 'warning',  icon: HiOutlineExclamationTriangle },
  'Cho giai ngan dot 1':{ label: 'Chờ giải ngân đợt 1',    bg: 'info',     icon: HiOutlineInformationCircle },
  'Da giai ngan dot 1': { label: 'Đã giải ngân đợt 1',     bg: 'success',  icon: HiOutlineCheckCircle },
  'Cho nghiem thu dot 1':{ label: 'Chờ nghiệm thu đợt 1',  bg: 'info',     icon: HiOutlineInformationCircle },
  'Da nghiem thu dot 1': { label: 'Đã nghiệm thu đợt 1',   bg: 'success',  icon: HiOutlineCheckCircle },
  'Cho giai ngan dot 2':{ label: 'Chờ giải ngân đợt 2',    bg: 'info',     icon: HiOutlineInformationCircle },
};

const StatusBanner = ({ trangThai, maDon, tenQuy, dotDuyet, warnings = [] }) => {
  const config = STATUS_CONFIG[trangThai] || { label: trangThai, bg: 'info', icon: HiOutlineInformationCircle };
  const Icon = config.icon;

  return (
    <div className={`${styles.banner} ${styles[config.bg]}`}>
      <div className={styles.mainRow}>
        <div className={styles.statusBadge}>
          <Icon size={16} />
          <span>{config.label}</span>
        </div>
        {maDon && <span className={styles.requestId}>#{maDon}</span>}
        {tenQuy && <span className={styles.fundName}>{tenQuy}</span>}
        {dotDuyet && <span className={styles.dotDuyet}>Đợt: {dotDuyet}</span>}
      </div>

      {warnings.length > 0 && (
        <div className={styles.warningList}>
          {warnings.map((w, i) => (
            <div key={i} className={styles.warningItem}>
              <HiOutlineExclamationTriangle size={14} />
              <span>{w}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StatusBanner;
