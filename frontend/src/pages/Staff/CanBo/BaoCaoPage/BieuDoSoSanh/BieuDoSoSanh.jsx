import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LabelList,
  ResponsiveContainer,
} from 'recharts';
import { CHART_COLORS, formatCurrency } from '../utils';
import styles from './BieuDoSoSanh.module.scss';

const formatVal = (v) => {
  if (typeof v !== 'number') return v;
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(0)}tr`;
  return v;
};

const BieuDoSoSanh = ({ data, loading }) => (
  <div className={styles.card}>
    <div className={styles.head}>
      <div>
        <h2 className={styles.title}>So sánh với kỳ trước</h2>
        <p className={styles.subtitle}>
          Đối chiếu các chỉ tiêu chính
        </p>
      </div>
    </div>

    {loading ? (
      <div className={styles.skeleton} />
    ) : (
      <ResponsiveContainer width="100%" height={280}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 60, bottom: 5, left: 10 }}
          barCategoryGap="25%"
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: '#64748b' }}
            tickFormatter={formatVal}
          />
          <YAxis
            type="category"
            dataKey="chiTieu"
            width={90}
            tick={{ fontSize: 12, fill: '#64748b' }}
          />
          <Tooltip
            contentStyle={{
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              fontSize: '12px',
              padding: '8px 12px',
            }}
            formatter={(value, _name, props) => {
              const isMoney = props.payload.chiTieu === 'Tổng chi';
              return [isMoney ? formatCurrency(value) : value, _name];
            }}
          />
          <Legend iconType="circle" iconSize={8} />
          <Bar
            dataKey="kyNay"
            name="Kỳ này"
            fill={CHART_COLORS.primary}
            radius={[0, 4, 4, 0]}
            barSize={16}
          >
            <LabelList
              dataKey="kyNay"
              position="right"
              formatter={formatVal}
              style={{ fontSize: 11, fill: '#1a2f5e', fontWeight: 600 }}
            />
          </Bar>
          <Bar
            dataKey="kyTruoc"
            name="Kỳ trước"
            fill={CHART_COLORS.gray}
            radius={[0, 4, 4, 0]}
            barSize={16}
          >
            <LabelList
              dataKey="kyTruoc"
              position="right"
              formatter={formatVal}
              style={{ fontSize: 11, fill: '#94a3b8', fontWeight: 500 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    )}
  </div>
);

export default BieuDoSoSanh;
