import { useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { HiOutlineXMark } from 'react-icons/hi2';
import Button from '@components/common/Button/Button';
import styles from './FormModal.module.scss';

const FormModal = ({
  open,
  onClose,
  title,
  icon: Icon,
  children,
  onSubmit,
  submitLabel = 'Lưu',
  cancelLabel = 'Hủy',
  loading = false,
  submitting = false,
  submitDisabled = false,
  width,
  footer,
}) => {
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

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        style={width ? { maxWidth: width } : undefined}
      >
        <header className={styles.header}>
          <div className={styles.headerTitle}>
            {Icon && <Icon size={22} className={styles.headerIcon} />}
            <h2>{title}</h2>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Đóng">
            <HiOutlineXMark size={22} />
          </button>
        </header>

        <div className={styles.body}>{children}</div>

        {footer !== null && (
          <footer className={styles.footer}>
            {footer ?? (
              <>
                <Button variant="secondary" onClick={onClose} disabled={submitting}>
                  {cancelLabel}
                </Button>
                {onSubmit && (
                  <Button
                    variant="primary"
                    loading={submitting || loading}
                    onClick={onSubmit}
                    disabled={submitDisabled || submitting || loading}
                  >
                    {submitting ? 'Đang lưu...' : submitLabel}
                  </Button>
                )}
              </>
            )}
          </footer>
        )}
      </div>
    </div>
  );
};

FormModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  icon: PropTypes.elementType,
  children: PropTypes.node,
  onSubmit: PropTypes.func,
  submitLabel: PropTypes.string,
  cancelLabel: PropTypes.string,
  loading: PropTypes.bool,
  submitting: PropTypes.bool,
  submitDisabled: PropTypes.bool,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  footer: PropTypes.node,
};

export default FormModal;
