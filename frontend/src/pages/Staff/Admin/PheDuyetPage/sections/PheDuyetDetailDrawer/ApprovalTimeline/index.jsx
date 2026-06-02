import PropTypes from 'prop-types';
import {
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineExclamationCircle,
  HiOutlineClock,
  HiOutlineChatBubbleLeft,
  HiOutlineExclamationTriangle,
} from 'react-icons/hi2';
import StatusBadge from '@components/common/StatusBadge/StatusBadge';
import styles from './ApprovalTimeline.module.scss';

const ApprovalTimeline = ({ approvals, loading }) => {
  const DOT_STYLE = {
    'Da duyet': {
      bg: 'rgba(16,185,129,0.15)',
      border: '#10b981',
      icon: HiOutlineCheckCircle,
      iconColor: '#10b981',
    },
    'Tu choi': {
      bg: 'rgba(239,68,68,0.12)',
      border: '#ef4444',
      icon: HiOutlineXCircle,
      iconColor: '#ef4444',
    },
    'Yeu cau bo sung': {
      bg: 'rgba(245,158,11,0.12)',
      border: '#f59e0b',
      icon: HiOutlineExclamationCircle,
      iconColor: '#f59e0b',
    },
    'Cho duyet': {
      bg: '#f1f5f9',
      border: '#cbd5e1',
      icon: HiOutlineClock,
      iconColor: '#94a3b8',
    },
  };

  const CAP_DO_LABEL = {
    1: {
      label: 'Cấp 1',
      sub: 'Cán bộ / Giáo vụ',
      color: 'var(--color-primary)',
      bg: 'rgba(26,47,94,0.08)',
    },
    2: {
      label: 'Cấp 2',
      sub: 'Trưởng phòng / Admin',
      color: '#7c3aed',
      bg: 'rgba(124,58,237,0.10)',
    },
    3: {
      label: 'Cấp 3',
      sub: 'Kế toán / Ban GH',
      color: '#0891b2',
      bg: 'rgba(8,145,178,0.10)',
    },
  };

  const KET_QUA_MAP = {
    'Da duyet': { status: 'approved', label: 'Đã duyệt' },
    'Tu choi': { status: 'rejected', label: 'Từ chối' },
    'Yeu cau bo sung': { status: 'processing', label: 'Yêu cầu bổ sung' },
    'Cho duyet': { status: 'pending', label: 'Chờ duyệt' },
  };

  const getInitial = (name) => (name ? name.charAt(0).toUpperCase() : '?');

  const formatDateTime = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return {
      date: d.toLocaleDateString('vi-VN'),
      time: d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  if (loading) {
    return (
      <div className={styles.timeline}>
        <div className={styles.timelineLabel}>CHUỖI PHÊ DUYỆT</div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className={styles.timelineItem}>
            <div className={styles.skeleton} />
          </div>
        ))}
      </div>
    );
  }

  if (!approvals || approvals.length === 0) {
    return (
      <div className={styles.timeline}>
        <div className={styles.timelineLabel}>CHUỖI PHÊ DUYỆT</div>
        <div className={styles.empty}>Chưa có lịch sử phê duyệt</div>
      </div>
    );
  }

  const sortedApprovals = [...approvals].sort(
    (a, b) => a.cap_do_duyet - b.cap_do_duyet
  );

  return (
    <div className={styles.timeline}>
      <div className={styles.timelineLabel}>CHUỖI PHÊ DUYỆT</div>

      {sortedApprovals.map((approval, index) => {
        const dotStyle = DOT_STYLE[approval.ket_qua] || DOT_STYLE['Cho duyet'];
        const capInfo = CAP_DO_LABEL[approval.cap_do_duyet] || {};
        const ketQuaInfo = KET_QUA_MAP[approval.ket_qua] || {};
        const dateTime = formatDateTime(approval.ngay_duyet);
        const isCompleted = approval.ngay_duyet !== null;
        const isPending = approval.ket_qua === 'Cho duyet';
        const isLastItem = index === sortedApprovals.length - 1;

        return (
          <div key={approval.phe_duyet_id} className={styles.timelineItem}>
            {/* Dot */}
            <div className={styles.dotContainer}>
              <div
                className={styles.dot}
                style={{
                  background: dotStyle.bg,
                  borderColor: dotStyle.border,
                }}
              >
                <dotStyle.icon size={16} style={{ color: dotStyle.iconColor }} />
              </div>
              {!isLastItem && (
                <div
                  className={styles.line}
                  style={{
                    background: isCompleted ? '#10b981' : '#f1f5f9',
                  }}
                />
              )}
            </div>

            {/* Content Card */}
            <div
              className={`${styles.card} ${isPending ? styles.cardPending : ''}`}
            >
              {/* Header */}
              <div className={styles.cardHeader}>
                <div className={styles.cardHeaderLeft}>
                  <div
                    className={styles.capBadge}
                    style={{
                      background: capInfo.bg,
                      color: capInfo.color,
                    }}
                  >
                    <div className={styles.capLabel}>{capInfo.label}</div>
                    <div className={styles.capSub}>{capInfo.sub}</div>
                  </div>
                  <StatusBadge status={ketQuaInfo.status}>
                    {ketQuaInfo.label}
                  </StatusBadge>
                </div>
                <div className={styles.cardHeaderRight}>
                  {dateTime ? (
                    <>
                      <span className={styles.date}>{dateTime.date}</span>
                      <span className={styles.time}>{dateTime.time}</span>
                    </>
                  ) : (
                    <span className={styles.notProcessed}>Chưa xử lý</span>
                  )}
                </div>
              </div>

              {/* Approver Info */}
              {approval.ho_ten && (
                <div className={styles.approverInfo}>
                  <div className={styles.avatar}>
                    {approval.avatar ? (
                      <img src={approval.avatar} alt={approval.ho_ten} />
                    ) : (
                      <span>{getInitial(approval.ho_ten)}</span>
                    )}
                  </div>
                  <div className={styles.approverDetails}>
                    <div className={styles.approverName}>{approval.ho_ten}</div>
                    <div className={styles.approverRole}>{approval.ten_vai_tro}</div>
                    {approval.email && (
                      <a
                        href={`mailto:${approval.email}`}
                        className={styles.approverEmail}
                      >
                        {approval.email}
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Notes */}
              {approval.ghi_chu && (
                <>
                  <div className={styles.divider} />
                  <div className={styles.note}>
                    <HiOutlineChatBubbleLeft size={14} />
                    <span>{approval.ghi_chu}</span>
                  </div>
                </>
              )}

              {/* Rejection Reason */}
              {approval.ket_qua === 'Tu choi' && approval.ly_do_tu_choi && (
                <div className={styles.rejection}>
                  <HiOutlineExclamationTriangle size={16} />
                  <span>{approval.ly_do_tu_choi}</span>
                </div>
              )}

              {/* Pending Message */}
              {isPending && !approval.ho_ten && (
                <div className={styles.pendingMessage}>
                  Chờ người duyệt cấp {approval.cap_do_duyet}...
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

ApprovalTimeline.propTypes = {
  approvals: PropTypes.array,
  loading: PropTypes.bool,
};

export default ApprovalTimeline;
