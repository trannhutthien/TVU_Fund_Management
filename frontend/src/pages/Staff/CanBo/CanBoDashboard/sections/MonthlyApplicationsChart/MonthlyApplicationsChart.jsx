import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { CHART_COLORS } from '../../constants';
import styles from './MonthlyApplicationsChart.module.scss';

const MonthlyApplicationsChart = ({ data }) => (
  <div className={styles.card}>
    <div className={styles.head}>
      <h2 className={styles.title}>Số đơn theo tháng</h2>
      <span className={styles.badge}>6 tháng gần nhất</span>
    </div>
    <ResponsiveContainer width="100%" height={260}>
      <BarChart
        data={data}
        margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="thang" tick={{ fontSize: 12, fill: '#64748b' }} />
        <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
        <Tooltip
          contentStyle={{
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            fontSize: '12px',
          }}
        />
        <Legend iconType="circle" iconSize={8} />
        <Bar
          dataKey="choDuyet"
          name="Chờ duyệt"
          fill={CHART_COLORS.red}
          radius={[4, 4, 0, 0]}
          barSize={16}
        />
        <Bar
          dataKey="dangXuLy"
          name="Đang xử lý"
          fill={CHART_COLORS.orange}
          radius={[4, 4, 0, 0]}
          barSize={16}
        />
        <Bar
          dataKey="tuChoi"
          name="Từ chối"
          fill={CHART_COLORS.gray}
          radius={[4, 4, 0, 0]}
          barSize={16}
        />
        <Bar
          dataKey="daGiaiNgan"
          name="Đã duyệt/Giải ngân"
          fill={CHART_COLORS.green}
          radius={[4, 4, 0, 0]}
          barSize={16}
        />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

export default MonthlyApplicationsChart;
