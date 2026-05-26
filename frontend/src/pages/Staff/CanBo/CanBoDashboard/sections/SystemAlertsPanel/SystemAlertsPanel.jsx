import { useNavigate } from 'react-router-dom';
import {
  HiOutlineExclamationTriangle,
  HiOutlineExclamationCircle,
  HiOutlineXCircle,
  HiOutlineShieldCheck,
  HiOutlineArrowRight,
} from 'react-icons/hi2';
import styles from './SystemAlertsPanel.module.scss';

const SystemAlertsPanel = ({ warnings }) => {
  const navigate = useNavigate();

  return (
    <div className={styles.card}>
      <div className={styles.head}>
        <h2 className={styles.title}>
          <HiOutlineExclamationTriangle className={styles.titleIcon} />
          Cảnh báo cần chú ý
        </h2>
        {warnings.length > 0 && (
          <span className={styles.count}>{warnings.length}</span>
        )}
      </div>

      {warnings.length === 0 ? (
        <div className={styles.empty}>
          <HiOutlineShieldCheck className={styles.emptyIcon} />
          <span>Không có cảnh báo nào</span>
        </div>
      ) : (
        <div className={styles.list}>
          {warnings.map((w, idx) => {
            const isHigh = w.severity === 'high';
            const Icon = isHigh
              ? HiOutlineXCircle
              : HiOutlineExclamationCircle;
            return (
              <div
                key={idx}
                className={`${styles.item} ${
                  isHigh ? styles.itemHigh : styles.itemMed
                }`}
              >
                <Icon
                  className={`${styles.icon} ${
                    isHigh ? styles.iconHigh : styles.iconMed
                  }`}
                />
                <div className={styles.content}>
                  <p className={styles.msg}>{w.message}</p>
                  <button
                    type="button"
                    className={`${styles.link} ${
                      isHigh ? styles.linkHigh : styles.linkMed
                    }`}
                    onClick={() => navigate(w.link)}
                  >
                    Xem ngay <HiOutlineArrowRight />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SystemAlertsPanel;
