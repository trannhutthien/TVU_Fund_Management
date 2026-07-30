import { useState, useEffect } from 'react';
import {
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineClock,
  HiOutlineUser,
} from 'react-icons/hi2';
import api from '@services/api';
import styles from './ApprovalHistory.module.scss';

const CAP_LABELS = { 1: 'Cấp 1 — Giáo vụ', 2: 'Cấp 2 — Admin', 3: 'Cấp 3 — Kế toán' };

const RESULT_CONFIG = {
  'Da duyet':  { label: 'Đã duyệt', icon: HiOutlineCheckCircle, cls: 'approved' },
  'Tu choi':   { label: 'Từ chối',  icon: HiOutlineXCircle,    cls: 'rejected' },
  'Cho duyet': { label: 'Chờ xử lý', icon: HiOutlineClock,      cls: 'pending' },
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
    + ' ' + d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
};

const ApprovalHistory = ({ yeucauhotroId }) => {
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!yeucauhotroId) return;
    let mounted = true;
    api.get(`/pheduyet/timeline/yeucau/${yeucauhotroId}`)
      .then((res) => {
        if (mounted) setTimeline(res.data?.data || []);
      })
      .catch(() => {
        if (mounted) setTimeline([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, [yeucauhotroId]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Đang tải lịch sử phê duyệt...</div>
      </div>
    );
  }

  if (!timeline.length) return null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Lịch sử phê duyệt</h3>
      </div>
      <div className={styles.timeline}>
        {timeline.map((item, idx) => {
          const capLabel = CAP_LABELS[item.cap_do_duyet] || `Cấp ${item.cap_do_duyet}`;
          const result = RESULT_CONFIG[item.ket_qua] || RESULT_CONFIG['Cho duyet'];
          const ResultIcon = result.icon;
          const isLast = idx === timeline.length - 1;

          return (
            <div key={item.phe_duyet_id || idx} className={styles.milestone}>
              <div className={styles.dotColumn}>
                <div className={`${styles.dot} ${styles[result.cls]}`}>
                  <ResultIcon size={14} />
                </div>
                {!isLast && <div className={styles.line} />}
              </div>
              <div className={styles.content}>
                <div className={styles.capLabel}>{capLabel}</div>
                {item.ho_ten ? (
                  <div className={styles.reviewer}>
                    <HiOutlineUser size={12} />
                    <span>{item.ho_ten}</span>
                    {item.ten_vai_tro && <span className={styles.role}>({item.ten_vai_tro})</span>}
                  </div>
                ) : (
                  <div className={styles.noReviewer}>Chưa có người xử lý</div>
                )}
                <div className={styles.resultBadge}>
                  <span className={`${styles.badge} ${styles[result.cls]}`}>{result.label}</span>
                  {item.ngay_duyet && (
                    <span className={styles.date}>{formatDateTime(item.ngay_duyet)}</span>
                  )}
                </div>
                {(item.ghi_chu || item.ly_do_tu_choi) && (
                  <div className={styles.note}>
                    {item.ly_do_tu_choi || item.ghi_chu}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ApprovalHistory;
