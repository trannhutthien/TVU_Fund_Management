import PropTypes from 'prop-types';
import {
  HiChartPie,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineXCircle,
  HiOutlineArrowPath,
} from 'react-icons/hi2';
import styles from './TransactionStatusSection.module.scss';

const ALL_STATUSES = [
  { key: 'Thanh cong', name: 'Thành công', color: '#f0a500', icon: HiOutlineCheckCircle, bgLight: 'rgba(240, 165, 0, 0.08)' },
  { key: 'Cho xu ly', name: 'Chờ xử lý', color: '#3b82f6', icon: HiOutlineClock, bgLight: 'rgba(59, 130, 246, 0.08)' },
  { key: 'That bai', name: 'Thất bại', color: '#ef4444', icon: HiOutlineXCircle, bgLight: 'rgba(239, 68, 68, 0.08)' },
  { key: 'Hoan tien', name: 'Hoàn tiền', color: '#64748b', icon: HiOutlineArrowPath, bgLight: 'rgba(100, 116, 139, 0.08)' },
];

const TransactionStatusSection = ({ data = [], isLoading }) => {
  // Map and populate missing statuses so that all 4 statuses are always displayed
  const processedData = ALL_STATUSES.map((status) => {
    const found = data.find(
      (d) => d.key === status.key || d.name === status.name
    );
    return {
      ...status,
      value: found ? Number(found.value || 0) : 0,
    };
  });

  const total = processedData.reduce((sum, x) => sum + x.value, 0);

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.titleBlock}>
          <HiChartPie size={18} className={styles.titleIcon} />
          <h3 className={styles.title}>Cơ cấu giao dịch</h3>
        </div>
      </div>

      {isLoading ? (
        <div className={styles.skeleton} />
      ) : total === 0 ? (
        <div className={styles.empty}>Chưa có giao dịch nào</div>
      ) : (
        <div className={styles.content}>
          <div className={styles.totalBox}>
            <div className={styles.totalInfo}>
              <span className={styles.totalLabel}>Tổng số giao dịch</span>
              <div className={styles.totalNumber}>{total}</div>
            </div>
            <div className={styles.totalBadge}>6 tháng</div>
          </div>

          <div className={styles.list}>
            {processedData.map((item) => {
              const percent = total > 0 ? Math.round((item.value / total) * 100) : 0;
              const Icon = item.icon;
              return (
                <div key={item.key} className={styles.item}>
                  <div className={styles.itemHeader}>
                    <div className={styles.statusInfo}>
                      <div
                        className={styles.iconWrap}
                        style={{ backgroundColor: item.bgLight, color: item.color }}
                      >
                        <Icon size={16} />
                      </div>
                      <span className={styles.name}>{item.name}</span>
                    </div>
                    <div className={styles.metrics}>
                      <span className={styles.count}>{item.value} GD</span>
                      <span className={styles.percent}>{percent}%</span>
                    </div>
                  </div>
                  <div className={styles.progressBg}>
                    <div
                      className={styles.progressFill}
                      style={{
                        width: `${percent}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

TransactionStatusSection.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string,
      name: PropTypes.string,
      value: PropTypes.number,
    })
  ),
  isLoading: PropTypes.bool,
};

export default TransactionStatusSection;
