import { useEffect, useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { HiOutlineXMark } from 'react-icons/hi2';
import Button from '@components/common/Button/Button';
import EmptyState from '@components/common/EmptyState/EmptyState';
import styles from './DetailDrawer.module.scss';

const DetailDrawer = ({
  open,
  onClose,
  title,
  loading = false,
  error = null,
  actions,
  children,
  width = 480,
}) => {
  const [internalLoading, setInternalLoading] = useState(false);

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

  const isLoading = loading || internalLoading;

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <aside
        className={styles.drawer}
        style={{ width: `min(${width}px, 90vw)` }}
        onClick={(e) => e.stopPropagation()}
      >
        <header className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          <div className={styles.headerActions}>
            {actions}
            <button className={styles.closeBtn} onClick={onClose} aria-label="Đóng">
              <HiOutlineXMark size={20} />
            </button>
          </div>
        </header>

        <div className={styles.body}>
          {isLoading && (
            <div className={styles.loadingState}>
              <div className={styles.spinner} />
              <span>Đang tải...</span>
            </div>
          )}
          {!isLoading && error && (
            <EmptyState message="Không thể tải dữ liệu" description={String(error)} />
          )}
          {!isLoading && !error && children}
        </div>
      </aside>
    </>
  );
};

DetailDrawer.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  loading: PropTypes.bool,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  actions: PropTypes.node,
  children: PropTypes.node,
  width: PropTypes.number,
};

export default DetailDrawer;
