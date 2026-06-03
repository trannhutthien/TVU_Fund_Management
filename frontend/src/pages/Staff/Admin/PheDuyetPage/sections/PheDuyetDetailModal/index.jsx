import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  HiOutlineClipboardDocumentCheck,
  HiOutlineXMark,
  HiOutlineDocumentText,
  HiOutlineBanknotes,
  HiOutlineCalendarDays,
  HiOutlineUser,
  HiOutlineChatBubbleBottomCenterText,
  HiOutlineFolderOpen,
  HiOutlineCheckBadge,
} from 'react-icons/hi2';
import Button from '@components/common/Button/Button';
import StatusBadge from '@components/common/StatusBadge/StatusBadge';
import styles from './PheDuyetDetailModal.module.scss';

const PheDuyetDetailModal = ({ record, onClose }) => {


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

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return `${d.toLocaleDateString('vi-VN')} lúc ${d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
  };

  const STATUS_MAP = {
    'Cho duyet': { status: 'pending', label: 'Chờ duyệt' },
    'Cho duyet cap 1': { status: 'pending', label: 'Chờ duyệt cấp 1' },
    'Cho duyet cap 2': { status: 'pending', label: 'Chờ duyệt cấp 2' },
    'Cho duyet cap 3': { status: 'pending', label: 'Chờ duyệt cấp 3' },
    'Dang xu ly': { status: 'processing', label: 'Đang xử lý' },
    'Cho giai ngan': { status: 'processing', label: 'Chờ giải ngân' },
    'Da giai ngan': { status: 'approved', label: 'Đã giải ngân' },
    'Tu choi': { status: 'rejected', label: 'Từ chối' },
    'Tu choi cap 1': { status: 'rejected', label: 'Từ chối cấp 1' },
    'Tu choi cap 2': { status: 'rejected', label: 'Từ chối cấp 2' },
    'Tu choi cap 3': { status: 'rejected', label: 'Từ chối cấp 3' },
    'Da duyet': { status: 'approved', label: 'Đã duyệt' },
    'Da nhan': { status: 'approved', label: 'Đã nhận' },
  };

  const currentStatus = record.trang_thai_don || record.trang_thai_ktt || 'Cho duyet';
  const statusInfo = STATUS_MAP[currentStatus] || { status: 'pending', label: currentStatus };

  const capDoDuyet = record.cap_do_duyet || record.capduyet || 1;
  const ketQuaStep = record.ket_qua || record.ketqua || 'Cho duyet';
  const hoTenApprover = record.ho_ten || record.hoten || record.nguoi_duyet_ten;
  const tenVaiTroApprover = record.ten_vai_tro || record.tenvaitro || record.nguoi_duyet_vai_tro;
  const ngayDuyetStep = record.ngay_duyet || record.ngayduyet;
  const ghiChuStep = record.ghichu || record.ghichu_duyet || record.lydo || record.ly_do_tu_choi;

  const stepStatusInfo = STATUS_MAP[ketQuaStep] || { status: 'pending', label: ketQuaStep };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerTitle}>
            <HiOutlineClipboardDocumentCheck size={22} className={styles.headerIcon} />
            <h2>Chi tiết chuỗi phê duyệt</h2>
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

        {/* Scrollable Body */}
        <div className={styles.body}>
          {/* Summary Section */}
          <div className={styles.summaryCard}>
            <div className={styles.summaryHeader}>
              <h3 className={styles.summaryTitle}>
                {isYeuCau ? (record.tieu_de || 'Đề xuất xin hỗ trợ quỹ') : (record.ten_nha_tai_tro || 'Khoản tài trợ quỹ')}
              </h3>
              <StatusBadge status={statusInfo.status}>
                {statusInfo.label}
              </StatusBadge>
            </div>

            {/* Grid details */}
            <div className={styles.detailsGrid}>
              <div className={styles.gridItem}>
                <span className={styles.label}>Mã hồ sơ:</span>
                <span className={styles.value}>
                  {isYeuCau ? `#YCHT-${record.request_id}` : `#KTT-${record.khoan_tai_tro_id}`}
                </span>
              </div>

              <div className={styles.gridItem}>
                <span className={styles.label}>
                  {isYeuCau ? 'Người nộp đơn:' : 'Nhà tài trợ:'}
                </span>
                <span className={styles.value}>
                  <HiOutlineUser size={14} className={styles.inlineIcon} />
                  {isYeuCau ? (
                    <>
                      <strong>{record.ten_sinh_vien}</strong>
                      {record.ma_so_dinh_danh && ` (${record.ma_so_dinh_danh})`}
                    </>
                  ) : (
                    <strong>{record.ten_nha_tai_tro}</strong>
                  )}
                </span>
              </div>

              <div className={styles.gridItem}>
                <span className={styles.label}>
                  {isYeuCau ? 'Ngày nộp đơn:' : 'Ngày tài trợ:'}
                </span>
                <span className={styles.value}>
                  <HiOutlineCalendarDays size={14} className={styles.inlineIcon} />
                  {isYeuCau ? formatDate(record.ngay_nop_don) : formatDate(record.ngaytaitro)}
                </span>
              </div>

              <div className={styles.gridItem}>
                <span className={styles.label}>Số tiền đề xuất:</span>
                <span className={`${styles.value} ${styles.highlightAmount}`}>
                  {isYeuCau 
                    ? formatCurrency(record.so_tien_de_nghi || record.so_tien_yeu_cau)
                    : formatCurrency(record.so_tien_tai_tro)
                  }
                </span>
              </div>
            </div>

            {/* Fund info */}
            <div className={styles.fundRow}>
              <HiOutlineFolderOpen size={16} className={styles.fundIcon} />
              <span className={styles.label}>Quỹ tiếp nhận:</span>
              <span className={styles.fundName}>{record.ten_quy || '—'}</span>
            </div>

            {/* Tra cứu cấp duyệt cụ thể */}
            <div className={styles.stepHighlightCard}>
              <div className={styles.stepHighlightHeader}>
                <div className={styles.stepHighlightTitleBox}>
                  <HiOutlineCheckBadge size={16} className={styles.stepHighlightIcon} />
                  <span>
                    Chi tiết mục đang tra cứu: <strong>Cấp {capDoDuyet}</strong>
                  </span>
                </div>
                <StatusBadge status={stepStatusInfo.status}>
                  {stepStatusInfo.label}
                </StatusBadge>
              </div>
              <div className={styles.stepHighlightBody}>
                <div className={styles.stepHighlightRow}>
                  <span className={styles.stepLabel}>Người thực hiện duyệt:</span>
                  <span className={styles.stepValue}>
                    {hoTenApprover ? (
                      <strong>{hoTenApprover} <span className={styles.stepRoleBadge}>{tenVaiTroApprover}</span></strong>
                    ) : (
                      <span className={styles.stepValuePending}>Chờ xử lý ở cấp này</span>
                    )}
                  </span>
                </div>
                {ngayDuyetStep && (
                  <div className={styles.stepHighlightRow}>
                    <span className={styles.stepLabel}>Thời gian duyệt:</span>
                    <span className={styles.stepValue}>
                      {formatDateTime(ngayDuyetStep)}
                    </span>
                  </div>
                )}
                {ghiChuStep && (
                  <div className={styles.stepHighlightRow}>
                    <span className={styles.stepLabel}>Ý kiến / Ghi chú:</span>
                    <span className={styles.stepValueComment}>
                      "{ghiChuStep}"
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Reason / Ghi chú */}
            {((isYeuCau && record.lydo_don) || (!isYeuCau && record.ghichu)) && (
              <div className={styles.reasonBox}>
                <div className={styles.reasonHeader}>
                  <HiOutlineChatBubbleBottomCenterText size={15} />
                  <span>{isYeuCau ? 'Mục đích / Lý do xin hỗ trợ:' : 'Ghi chú tài trợ:'}</span>
                </div>
                <div className={styles.reasonContent}>
                  {isYeuCau ? record.lydo_don : record.ghichu}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className={styles.footer}>
          <Button variant="outline" onClick={onClose}>
            Đóng cửa sổ
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
