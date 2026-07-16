import { useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { createPortal } from 'react-dom';
import { HiOutlineXMark } from 'react-icons/hi2';
import { LOAI_HO_TRO_OPTIONS } from '@constants/loaiHoTro';
import { LOAI_HO_TRO_COMPARE, LOAI_HO_TRO_COMPARE_DATA } from '@constants/loaiHoTroInfo';
import styles from './LoanTypeCompareModal.module.scss';

const LoanTypeCompareModal = ({ open, onClose }) => {
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose?.();
    },
    [onClose]
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3 className={styles.title}>So sánh 3 loại hình hỗ trợ</h3>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Đóng">
            <HiOutlineXMark />
          </button>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.thLabel}></th>
                {LOAI_HO_TRO_OPTIONS.map((opt) => (
                  <th key={opt.value} className={styles.thType}>
                    <span
                      className={styles.typeBadge}
                      style={{ background: `${LOAI_HO_TRO_COMPARE_DATA[opt.value]?.repayment === 'Không hoàn trả' ? '#10b981' : opt.value === 'Tai tro co thu hoi' ? '#f59e0b' : '#3b6ff5'}15` }}
                    >
                      {opt.label}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {LOAI_HO_TRO_COMPARE.map((row) => (
                <tr key={row.key}>
                  <td className={styles.tdLabel}>{row.label}</td>
                  {LOAI_HO_TRO_OPTIONS.map((opt) => (
                    <td key={opt.value} className={styles.tdValue}>
                      {LOAI_HO_TRO_COMPARE_DATA[opt.value]?.[row.key] || '—'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.footer}>
          <p className={styles.footerNote}>
            Căn cứ: Điều lệ Quỹ Phát triển Khoa học Công nghệ Trường Đại học Trà Vinh
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
};

LoanTypeCompareModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default LoanTypeCompareModal;
