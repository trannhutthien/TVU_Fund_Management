import { useState, useCallback, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { HiOutlineCheckBadge, HiOutlineXMark } from 'react-icons/hi2';
import { REVIEW_CHECKLIST } from '@constants/reviewChecklist';
import styles from './ReviewChecklist.module.scss';

const ReviewChecklist = ({ onAppendNote, onRemoveNote, disabled }) => {
  const [checked, setChecked] = useState(new Set());
  const prevChecked = useRef(new Set());

  useEffect(() => {
    checked.forEach((id) => {
      if (!prevChecked.current.has(id)) {
        const allItems = [...REVIEW_CHECKLIST.duyet, ...REVIEW_CHECKLIST.tuChoi];
        const item = allItems.find((i) => i.id === id);
        if (item) onAppendNote?.(item.text);
      }
    });
    prevChecked.current.forEach((id) => {
      if (!checked.has(id)) {
        const allItems = [...REVIEW_CHECKLIST.duyet, ...REVIEW_CHECKLIST.tuChoi];
        const item = allItems.find((i) => i.id === id);
        if (item) onRemoveNote?.(item.text);
      }
    });
    prevChecked.current = new Set(checked);
  }, [checked, onAppendNote, onRemoveNote]);

  const handleToggle = useCallback(
    (item) => {
      if (disabled) return;
      setChecked((prev) => {
        const next = new Set(prev);
        if (next.has(item.id)) {
          next.delete(item.id);
        } else {
          next.add(item.id);
        }
        return next;
      });
    },
    [disabled],
  );

  return (
    <div className={styles.wrapper}>
      {/* Duyệt */}
      <div className={styles.group}>
        <div className={`${styles.groupTitle} ${styles.approveGroup}`}>
          <HiOutlineCheckBadge size={14} />
          <span>Điều kiện duyệt</span>
        </div>
        <div className={styles.items}>
          {REVIEW_CHECKLIST.duyet.map((item) => (
            <label
              key={item.id}
              className={`${styles.item} ${checked.has(item.id) ? styles.checked : ''}`}
            >
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={checked.has(item.id)}
                onChange={() => handleToggle(item)}
                disabled={disabled}
              />
              <span className={styles.checkmark} />
              <span className={styles.label}>{item.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Từ chối */}
      <div className={styles.group}>
        <div className={`${styles.groupTitle} ${styles.rejectGroup}`}>
          <HiOutlineXMark size={14} />
          <span>Lý do từ chối</span>
        </div>
        <div className={styles.items}>
          {REVIEW_CHECKLIST.tuChoi.map((item) => (
            <label
              key={item.id}
              className={`${styles.item} ${styles.rejectItem} ${checked.has(item.id) ? styles.checkedReject : ''}`}
            >
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={checked.has(item.id)}
                onChange={() => handleToggle(item)}
                disabled={disabled}
              />
              <span className={styles.checkmarkReject} />
              <span className={styles.label}>{item.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

ReviewChecklist.propTypes = {
  onAppendNote: PropTypes.func,
  onRemoveNote: PropTypes.func,
  disabled: PropTypes.bool,
};

export default ReviewChecklist;
