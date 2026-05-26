import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { CHART_COLORS } from '../../constants';
import { formatCurrency } from '../../utils';
import styles from './AmountTrendChart.module.scss';

const AmountTrendChart = ({ data, year, onChangeYear }) => {
  const currentYear = new Date().getFullYear();

  return (
    <div className={styles.card}>
      <div className={styles.head}>
        <h2 className={styles.title}>Xu hướng số tiền yêu cầu</h2>
        <select
          className={styles.yearSelect}
          value={year}
          onChange={(e) => onChangeYear(Number(e.target.value))}
        >
          <option value={currentYear - 1}>Năm {currentYear - 1}</option>
          <option value={currentYear}>Năm {currentYear}</option>
        </select>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart
          data={data}
          margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="thang" tick={{ fontSize: 12, fill: '#64748b' }} />
          <YAxis
            tick={{ fontSize: 12, fill: '#64748b' }}
            tickFormatter={(v) =>
              v >= 1_000_000 ? `${v / 1_000_000}tr` : v
            }
          />
          <Tooltip
            contentStyle={{
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              fontSize: '12px',
            }}
            formatter={(value) => formatCurrency(value)}
          />
          <Legend iconType="circle" iconSize={8} />
          <Line
            type="monotone"
            dataKey="tong"
            name="Tổng yêu cầu"
            stroke={CHART_COLORS.primary}
            strokeWidth={2.5}
            dot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="daDuyet"
            name="Đã được duyệt"
            stroke={CHART_COLORS.green}
            strokeWidth={2.5}
            strokeDasharray="5 5"
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AmountTrendChart;
