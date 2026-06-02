import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '../utils';
import styles from './BieuDoQuyChiTiet.module.scss';

const FUND_COLORS = [
  '#1a2f5e', // Navy blue
  '#f0a500', // Gold
  '#10b981', // Emerald green
  '#3b82f6', // Bright blue
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#f97316', // Orange
  '#64748b', // Slate gray
];

const BieuDoQuyChiTiet = ({ data, loading }) => {
  const totalBalance = data.reduce((sum, item) => sum + (item.value || 0), 0);

  // Top 3 funds and others
  const sortedFunds = [...data].sort((a, b) => b.value - a.value);
  const displayLegend = sortedFunds.slice(0, 4);
  const remainingCount = sortedFunds.length - 4;

  return (
    <div className={styles.card}>
      <div className={styles.head}>
        <div>
          <h2 className={styles.title}>Chi tiết số dư các Quỹ</h2>
          <p className={styles.subtitle}>Tỷ lệ và số tiền khả dụng hiện có trong từng quỹ</p>
        </div>
      </div>

      {loading ? (
        <div className={styles.skeleton} />
      ) : (
        <div className={styles.chartWrapper}>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height={170}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={FUND_COLORS[index % FUND_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontSize: '11px',
                    padding: '6px 10px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  }}
                  formatter={(value, name) => [formatCurrency(value), name]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className={styles.centerLabel}>
              <span className={styles.centerValue}>{data.length}</span>
              <span className={styles.centerText}>Quỹ</span>
            </div>
          </div>

          <div className={styles.legendContainer}>
            {displayLegend.map((fund, index) => {
              const color = FUND_COLORS[index % FUND_COLORS.length];
              return (
                <div key={index} className={styles.legendItem}>
                  <div className={styles.legendDot} style={{ background: color }} />
                  <div className={styles.legendInfo}>
                    <span className={styles.legendName} title={fund.name}>
                      {fund.name}
                    </span>
                    <span className={styles.legendMeta}>
                      {formatCurrency(fund.value)} ({fund.percentage}%)
                    </span>
                  </div>
                </div>
              );
            })}
            {remainingCount > 0 && (
              <div className={styles.legendMore}>
                + {remainingCount} quỹ khác
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BieuDoQuyChiTiet;
