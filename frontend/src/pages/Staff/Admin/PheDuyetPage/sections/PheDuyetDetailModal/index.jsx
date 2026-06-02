import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  HiOutlineClipboardDocumentCheck,
  HiOutlineXMark,
  HiOutlineDocumentText,
  HiOutlineBanknotes,
} from 'react-icons/hi2';
import { toast } from 'react-toastify';
import api from '@services/api';
import Button from '@components/common/Button/Button';
import StatusBadge from '@components/common/StatusBadge/StatusBadge';
import ApprovalTimeline from '../PheDuyetDetailDrawer/ApprovalTimeline';
import styles from './PheDuyetDetailModal.module.scss';

const PheDuyetDetailModal = ({ record, onClose }) => {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch timeline data from backend
  useEffect(() => {
    if (!record) return;

    const fetchTimeline = async () => {
      try {
        setLoading(true);
        const type = record.request_id ? 'yeucau' : 'taitro';
        const id = record.request_id || record.khoan_tai_tro_id;

        const res = await api.get(`/pheduyet/timeline/${type}/${id}`);
        setApprovals(res.data.data);
      } catch (error) {
        console.error('Lỗi fetch timeline:', error);
        toast.error('Không tải được chuỗi phê duyệt');
        setApprovals([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTimeline();
  }, [record]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  if (!record) return null;

  const isYeuCau = !!record.request_id;
  const formatCurrency = (n) => Number(n || 0).toLocaleString('vi-VN') + ' đ';

  const STATUS_MAP = {
    'Cho duyet': { status: 'pending', label: 'Chờ duyệt' },
    'Dang xu ly': { status: 'processing', label: 'Đang xử lý' },
    'Cho giai ngan': { status: 'processing', label: 'Chờ giải ngân' },
    'Da giai ngan': { status: 'approved', label: 'Đã giải ngân' },
    'Tu choi': { status: 'rejected', label: 'Từ chối' },
    'Da duyet': { status: 'approved', label: 'Đã duyệt' },
    'Da nhan': { status: 'approved', label: 'Đã nhận' },
  };

  const currentStatus = record.trang_thai_don || record.trang_thai_ktt || 'Cho duyet';
  const statusInfo = STATUS_MAP[currentStatus] || { status: 'pending', label: currentStatus };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerTitle}>
            <HiOutlineClipboardDocumentCheck size={20} />
            <h2>Chuỗi phê duyệt</h2>
            <div className={`${styles.sourceBadge} ${isYeuCau ? styles.sourceBadgeYeucau : styles.sourceBadgeTaitro}`}>
              {isYeuCau ? (
                <>
                  <HiOutlineDocumentText size={14} />
                  <span>Đơn hỗ trợ</span>
                </>
              ) : (
                <>
                  <HiOutlineBanknotes size={14} />
                  <span>Khoản tài trợ</span>
                </>
              )}
            </div>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Đóng"
          >
            <HiOutlineXMark size={22} />
          </button>
        </header>

        {/* Summary Section */}
        <div className={styles.summary}>
          {isYeuCau ? (
            // Đơn hỗ trợ
            <div className={styles.summaryContent}>
              <div
                className={styles.iconBox}
                style={{ background: 'rgba(26,47,94,0.08)' }}
              >
                <HiOutlineDocumentText size={20} style={{ color: 'var(--color-primary)' }} />
              </div>
              <div className={styles.summaryInfo}>
                <div className={styles.summaryTitle}>{record.tieu_de || '—'}</div>
                <div className={styles.summaryMeta}>
                  <span>{record.ten_sinh_vien || '—'}</span>
                  {record.ma_so_dinh_danh && (
                    <span className={styles.dot}>•</span>
                  )}
                  <span>{record.ma_so_dinh_danh || ''}</span>
                </div>
                <div className={styles.summaryMeta}>
                  <span className={styles.quy}>{record.ten_quy || '—'}</span>
                  <span className={styles.dot}>•</span>
                  <span className={styles.amount}>
                    {formatCurrency(record.so_tien_yeu_cau)}
                  </span>
                </div>
                <StatusBadge status={statusInfo.status}>
                  {statusInfo.label}
                </StatusBadge>
              </div>
            </div>
          ) : (
            // Khoản tài trợ
            <div className={styles.summaryContent}>
              <div
                className={styles.iconBox}
                style={{ background: 'rgba(240,165,0,0.10)' }}
              >
                <HiOutlineBanknotes size={20} style={{ color: 'var(--color-gold)' }} />
              </div>
              <div className={styles.summaryInfo}>
                <div className={styles.summaryTitle}>
                  {record.ten_nha_tai_tro || '—'}
                </div>
                <div className={styles.summaryMeta}>
                  <span className={styles.quy}>{record.ten_quy || '—'}</span>
                  <span className={styles.dot}>•</span>
                  <span className={styles.amount}>
                    {formatCurrency(record.so_tien_tai_tro)}
                  </span>
                </div>
                <StatusBadge status={statusInfo.status}>
                  {statusInfo.label}
                </StatusBadge>
              </div>
            </div>
          )}
        </div>

        {/* Timeline */}
        <div className={styles.body}>
          <ApprovalTimeline approvals={approvals} loading={loading} />
        </div>

        {/* Footer */}
        <footer className={styles.footer}>
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
        </footer>
      </div>
    </div>
  );
};

PheDuyetDetailModal.propTypes = {
  record: PropTypes.object,
  onClose: PropTypes.func.isRequired,
};

export default PheDuyetDetailModal;
