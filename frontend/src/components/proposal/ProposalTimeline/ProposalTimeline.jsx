import { useState, useEffect } from 'prop-types';
import PropTypes from 'prop-types';
import {
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineXCircle,
  HiOutlineUser,
  HiOutlineCalendar,
  HiOutlineDocumentText,
} from 'react-icons/hi2';
import { getProposalStatus } from '@services/proposalService';
import { formatDateTime } from '@utils/formatters';
import styles from './ProposalTimeline.module.scss';

/**
 * ProposalTimeline - Timeline hiển thị tiến trình duyệt đề xuất 3 cấp
 * 
 * Bước 1: Cán bộ duyệt nội dung
 * Bước 2: Kế toán xác nhận tiền
 * Bước 3: Admin tạo hoạt động
 */
const ProposalTimeline = ({ proposalId, onRefresh }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [currentStatus, setCurrentStatus] = useState('');

  useEffect(() => {
    if (proposalId) {
      fetchTimeline();
    }
  }, [proposalId]);

  const fetchTimeline = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await getProposalStatus(proposalId);
      
      if (res?.success) {
        setTimeline(res.data?.timeline || []);
        setCurrentStatus(res.data?.currentStatus || '');
      } else {
        throw new Error(res?.message || 'Không thể tải timeline');
      }
    } catch (err) {
      console.error('Error fetching proposal timeline:', err);
      setError(err.message || 'Đã xảy ra lỗi khi tải timeline');
    } finally {
      setLoading(false);
    }
  };

  const getStepIcon = (status) => {
    switch (status) {
      case 'completed':
        return HiOutlineCheckCircle;
      case 'pending':
        return HiOutlineClock;
      case 'rejected':
        return HiOutlineXCircle;
      default:
        return HiOutlineClock;
    }
  };

  const getStepClass = (status) => {
    switch (status) {
      case 'completed':
        return styles.completed;
      case 'pending':
        return styles.pending;
      case 'rejected':
        return styles.rejected;
      default:
        return styles.pending;
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p className={styles.loadingText}>Đang tải timeline...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <HiOutlineXCircle className={styles.errorIcon} />
        <p className={styles.errorText}>{error}</p>
        <button
          type="button"
          className={styles.retryBtn}
          onClick={fetchTimeline}
        >
          Thử lại
        </button>
      </div>
    );
  }

  if (!timeline || timeline.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <HiOutlineClock className={styles.emptyIcon} />
        <p className={styles.emptyText}>Chưa có thông tin timeline</p>
      </div>
    );
  }

  return (
    <div className={styles.timelineContainer}>
      <div className={styles.timelineHeader}>
        <h3 className={styles.timelineTitle}>Tiến trình duyệt</h3>
        {onRefresh && (
          <button
            type="button"
            className={styles.refreshBtn}
            onClick={() => {
              fetchTimeline();
              onRefresh?.();
            }}
            title="Làm mới"
          >
            🔄
          </button>
        )}
      </div>

      <div className={styles.timeline}>
        {timeline.map((step, index) => {
          const StepIcon = getStepIcon(step.status);
          const isLast = index === timeline.length - 1;

          return (
            <div
              key={step.step}
              className={`${styles.timelineItem} ${getStepClass(step.status)}`}
            >
              {/* Icon & Line */}
              <div className={styles.iconWrapper}>
                <div className={styles.iconCircle}>
                  <StepIcon className={styles.stepIcon} />
                </div>
                {!isLast && <div className={styles.connectLine}></div>}
              </div>

              {/* Content */}
              <div className={styles.stepContent}>
                <div className={styles.stepHeader}>
                  <h4 className={styles.stepTitle}>{step.title}</h4>
                  <span className={styles.stepBadge}>Bước {step.step}</span>
                </div>

                {/* User info */}
                {step.user && (
                  <div className={styles.stepMeta}>
                    <HiOutlineUser className={styles.metaIcon} />
                    <span className={styles.metaText}>{step.user}</span>
                  </div>
                )}

                {/* Date */}
                {step.date && (
                  <div className={styles.stepMeta}>
                    <HiOutlineCalendar className={styles.metaIcon} />
                    <span className={styles.metaText}>
                      {formatDateTime(step.date)}
                    </span>
                  </div>
                )}

                {/* Note */}
                {step.note && (
                  <div className={styles.stepNote}>
                    <HiOutlineDocumentText className={styles.noteIcon} />
                    <p className={styles.noteText}>{step.note}</p>
                  </div>
                )}

                {/* Pending message */}
                {step.status === 'pending' && !step.user && (
                  <p className={styles.pendingMessage}>
                    Đang chờ xử lý...
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

ProposalTimeline.propTypes = {
  proposalId: PropTypes.number.isRequired,
  onRefresh: PropTypes.func,
};

export default ProposalTimeline;
