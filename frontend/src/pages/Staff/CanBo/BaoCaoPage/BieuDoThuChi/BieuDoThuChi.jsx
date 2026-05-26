import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { CHART_COLORS, formatCurrency } from '../utils';
import styles from './BieuDoThuChi.module.scss';

const BieuDoThuChi = ({ data, year, onChangeYear, loading }) => {
  const currentYear = new Date().getFullYear();
  const years = [currentYear - 1, currentYear];

  return (
    <div className={styles.card}>
      <div className={styles.head}>
        <div>
          <h2 className={styles.title}>Biểu đồ Thu / Chi theo tháng</h2>
          <p className={styles.subtitle}>
            Theo dõi dòng tiền vào ra và số dư tích lũy
          </p>
        </div>
        <select
          className={styles.yearSelect}
          value={year}
          onChange={(e) => onChangeYear(Number(e.target.value))}
        >
          {years.map((y) => (
            <option key={y} value={y}>
              Năm {y}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className={styles.skeleton} />
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart
            data={data}
            margin={{ top: 5, right: 24, bottom: 5, left: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="thang"
              tick={{ fontSize: 12, fill: '#64748b' }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#64748b' }}
              tickFormatter={(v) =>
                v >= 1_000_000 ? `${(v / 1_000_000).toFixed(0)}tr` : v
              }
            />
            <Tooltip
              contentStyle={{
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                fontSize: '12px',
                padding: '8px 12px',
              }}
              formatter={(value) => formatCurrency(value)}
            />
            <Legend iconType="circle" iconSize={8} />
            <Bar
              dataKey="thu"
              name="Thu vào"
              fill={CHART_COLORS.green}
              radius={[4, 4, 0, 0]}
              barSize={20}
            />
            <Bar
              dataKey="chi"
              name="Chi ra"
              fill={CHART_COLORS.red}
              radius={[4, 4, 0, 0]}
              barSize={20}
            />
            <Line
              type="monotone"
              dataKey="soDu"
              name="Số dư"
              stroke={CHART_COLORS.gold}
              strokeWidth={2.5}
              dot={{ r: 4, fill: CHART_COLORS.gold }}
              activeDot={{ r: 6 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default BieuDoThuChi;
