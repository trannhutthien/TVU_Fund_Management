import PropTypes from 'prop-types';
import { HiChartBar } from 'react-icons/hi2';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import styles from './CashFlowChartSection.module.scss';

const formatYAxis = (n) => {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}t`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}tr`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
  return n;
};

const formatTooltipMoney = (value) => Number(value || 0).toLocaleString('vi-VN') + ' đ';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className={styles.tooltip}>
      <div className={styles.tooltipLabel}>{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className={styles.tooltipRow}>
          <span
            className={styles.tooltipDot}
            style={{ background: p.color }}
          />
          <span className={styles.tooltipName}>
            {p.dataKey === 'thu' ? 'Thu' : 'Chi'}
          </span>
          <span className={styles.tooltipValue}>
            {formatTooltipMoney(p.value)}
          </span>
        </div>
      ))}
    </div>
  );
};

const CashFlowChartSection = ({ data, isLoading }) => {
  const rangeLabel = data?.length
    ? `${data[0].thang} – ${data[data.length - 1].thang}`
    : '—';

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.titleBlock}>
          <HiChartBar size={18} className={styles.titleIcon} />
          <h3 className={styles.title}>Dòng tiền 6 tháng</h3>
        </div>
        <span className={styles.badge}>Tháng {rangeLabel}</span>
      </div>

      {isLoading ? (
        <div className={styles.skeleton} />
      ) : (
        <>
          <div className={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height={260}>
              <ComposedChart
                data={data}
                margin={{ top: 10, right: 10, bottom: 0, left: 10 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f1f5f9"
                  vertical={false}
                />
                <XAxis
                  dataKey="thang"
                  tick={{ fontSize: 12, fill: '#64748b', fontFamily: 'Inter' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={formatYAxis}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(26, 47, 94, 0.04)' }} />
                <Bar
                  dataKey="thu"
                  fill="#f0a500"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={36}
                />
                <Line
                  type="monotone"
                  dataKey="chi"
                  stroke="#1a2f5e"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#1a2f5e', strokeWidth: 0 }}
                  activeDot={{ r: 6 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className={styles.legend}>
            <span className={styles.legendItem}>
              <span className={`${styles.legendDot} ${styles.legendDotThu}`} />
              <span>Thu</span>
            </span>
            <span className={styles.legendItem}>
              <span className={`${styles.legendDot} ${styles.legendDotChi}`} />
              <span>Chi</span>
            </span>
          </div>
        </>
      )}
    </div>
  );
};

CashFlowChartSection.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      thang: PropTypes.string,
      thu: PropTypes.number,
      chi: PropTypes.number,
    })
  ),
  isLoading: PropTypes.bool,
};

export default CashFlowChartSection;
