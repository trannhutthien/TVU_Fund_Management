import PropTypes from 'prop-types';
import { HiChartPie } from 'react-icons/hi2';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import styles from './TransactionStatusSection.module.scss';

const TransactionStatusSection = ({ data, isLoading }) => {
  const total = data.reduce((sum, x) => sum + Number(x.value || 0), 0);

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
      ) : data.length === 0 ? (
        <div className={styles.empty}>Chưa có giao dịch nào</div>
      ) : (
        <>
          <div className={styles.donutWrap}>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={3}
                  cornerRadius={4}
                >
                  {data.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: '10px',
                    border: '1px solid #f1f5f9',
                    fontSize: '12px',
                    padding: '8px 12px',
                  }}
                  formatter={(value, name) => [
                    `${value} (${Math.round((value / total) * 100)}%)`,
                    name,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className={styles.donutCenter}>
              <div className={styles.donutCenterValue}>{total}</div>
              <div className={styles.donutCenterLabel}>Giao dịch</div>
            </div>
          </div>

          <div className={styles.legend}>
            {data.map((item) => {
              const percent =
                total > 0 ? Math.round((item.value / total) * 100) : 0;
              return (
                <div key={item.key || item.name} className={styles.legendItem}>
                  <span
                    className={styles.legendDot}
                    style={{ background: item.color }}
                  />
                  <span className={styles.legendName}>{item.name}</span>
                  <span className={styles.legendCount}>{item.value}</span>
                  <span className={styles.legendPercent}>{percent}%</span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

TransactionStatusSection.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      value: PropTypes.number,
      color: PropTypes.string,
    })
  ),
  isLoading: PropTypes.bool,
};

export default TransactionStatusSection;
