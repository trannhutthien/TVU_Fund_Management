import PropTypes from 'prop-types';
import {
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineXCircle,
  HiOutlineUser,
} from 'react-icons/hi2';
import styles from './ApprovalTimeline.module.scss';

const STATUS_CONFIG = {
  'Da duyet': { label: 'Đã duyệt', icon: HiOutlineCheckCircle, color: '#16a34a' },
  'Tu choi': { label: 'Từ chối', icon: HiOutlineXCircle, color: '#dc2626' },
  'Cho duyet': { label: 'Chờ duyệt', icon: HiOutlineClock, color: '#94a3b8' },
};

const CAP_LABELS = {
  1: 'Cấp 1 — Giáo vụ',
  2: 'Cấp 2 — Admin',
  3: 'Cấp 3 — Kế toán',
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  return `${d.toLocaleDateString('vi-VN')} lúc ${d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
};

const mapBackendItem = (item) => {
  if (item.capDuyet !== undefined) return item;
  return {
    capDuyet: item.cap_do_duyet ?? item.capDuyet,
    trangThai: item.ket_qua ?? item.trangThai ?? 'Cho duyet',
    nguoiDuyet: item.nguoiDuyet ?? {
      hoTen: item.ho_ten,
      email: item.email,
    },
    ngayDuyet: item.ngay_duyet ?? item.ngayDuyet,
    ghiChu: item.ghi_chu ?? item.ghiChu,
    lyDoTuChoi: item.ly_do_tu_choi ?? item.lyDoTuChoi,
  };
};

const buildFullTimeline = (rawTimeline) => {
  const mapped = (rawTimeline || []).map(mapBackendItem);
  const byCap = {};
  mapped.forEach((item) => {
    byCap[item.capDuyet] = item;
  });

  return [1, 2, 3].map((cap) => {
    if (byCap[cap]) return byCap[cap];
    return {
      capDuyet: cap,
      trangThai: 'Cho duyet',
      nguoiDuyet: null,
      ngayDuyet: null,
      ghiChu: null,
      lyDoTuChoi: null,
    };
  });
};

const ApprovalTimeline = ({ timeline }) => {
  const fullTimeline = buildFullTimeline(timeline);
  if (!fullTimeline || fullTimeline.length === 0) return null;

  return (
    <section className={styles.card}>
      <div className={styles.cardHeader}>
        <HiOutlineCheckCircle className={styles.headerIcon} />
        <h3 className={styles.cardTitle}>Lịch sử phê duyệt</h3>
      </div>

      <div className={styles.timeline}>
        {fullTimeline.map((item, idx) => {
          const cfg = STATUS_CONFIG[item.trangThai] || STATUS_CONFIG['Cho duyet'];
          const Icon = cfg.icon;
          const isLast = idx === fullTimeline.length - 1;

          return (
            <div
              key={item.capDuyet || idx}
              className={`${styles.item} ${isLast ? styles.itemLast : ''}`}
            >
              <div className={styles.dotCol}>
                <div
                  className={styles.dot}
                  style={{ background: cfg.color }}
                >
                  <Icon size={14} className={styles.dotIcon} />
                </div>
                {!isLast && <div className={styles.line} />}
              </div>

              <div className={styles.content}>
                <div className={styles.titleRow}>
                  <span className={styles.capLabel}>
                    {CAP_LABELS[item.capDuyet] || `Cấp ${item.capDuyet}`}
                  </span>
                  <span
                    className={styles.statusTag}
                    style={{ color: cfg.color, background: `${cfg.color}12` }}
                  >
                    {cfg.label}
                  </span>
                </div>

                {item.nguoiDuyet?.hoTen ? (
                  <div className={styles.meta}>
                    <HiOutlineUser size={13} />
                    <span>{item.nguoiDuyet.hoTen}</span>
                    {item.nguoiDuyet.email && (
                      <span className={styles.metaEmail}>({item.nguoiDuyet.email})</span>
                    )}
                  </div>
                ) : item.trangThai === 'Cho duyet' ? (
                  <div className={styles.pendingMeta}>
                    <HiOutlineClock size={13} />
                    <span>Chưa có người duyệt</span>
                  </div>
                ) : null}

                {item.ngayDuyet && (
                  <div className={styles.date}>
                    {formatDateTime(item.ngayDuyet)}
                  </div>
                )}

                {item.ghiChu && (
                  <div className={styles.note}>{item.ghiChu}</div>
                )}

                {item.lyDoTuChoi && (
                  <div className={styles.rejectReason}>
                    Lý do từ chối: {item.lyDoTuChoi}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

ApprovalTimeline.propTypes = {
  timeline: PropTypes.arrayOf(
    PropTypes.shape({
      capDuyet: PropTypes.number,
      cap_do_duyet: PropTypes.number,
      trangThai: PropTypes.string,
      ket_qua: PropTypes.string,
      nguoiDuyet: PropTypes.shape({
        hoTen: PropTypes.string,
        email: PropTypes.string,
      }),
      ho_ten: PropTypes.string,
      email: PropTypes.string,
      ngayDuyet: PropTypes.string,
      ngay_duyet: PropTypes.string,
      ghiChu: PropTypes.string,
      ghi_chu: PropTypes.string,
      lyDoTuChoi: PropTypes.string,
      ly_do_tu_choi: PropTypes.string,
    }),
  ),
};

export default ApprovalTimeline;
