import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { CHART_COLORS } from '../../constants';
import { formatCurrency } from '../../utils';
import styles from './TopFundsChart.module.scss';

const TopFundsChart = ({ data }) => (
  <div className={styles.card}>
    <div className={styles.head}>
      <h2 className={styles.title}>Top 5 Quỹ có nhiều đơn nhất</h2>
    </div>
    {data.length === 0 ? (
      <div className={styles.empty}>Chưa có dữ liệu</div>
    ) : (
      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis type="number" tick={{ fontSize: 12, fill: '#64748b' }} />
          <YAxis
            type="category"
            dataKey="ten"
            width={130}
            tick={{ fontSize: 11, fill: '#64748b' }}
          />
          <Tooltip
            contentStyle={{
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              fontSize: '12px',
            }}
            formatter={(value, _name, props) => [
              `${value} đơn • Số dư: ${formatCurrency(props.payload.soDu)}`,
              props.payload.tenFull,
            ]}
          />
          <Bar
            dataKey="soDon"
            fill={CHART_COLORS.primary}
            radius={[0, 4, 4, 0]}
            barSize={20}
          />
        </BarChart>
      </ResponsiveContainer>
    )}
  </div>
);

export default TopFundsChart;
