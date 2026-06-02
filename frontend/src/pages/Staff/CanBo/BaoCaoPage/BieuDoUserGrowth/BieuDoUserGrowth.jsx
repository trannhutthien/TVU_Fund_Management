import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import styles from './BieuDoUserGrowth.module.scss';

const BieuDoUserGrowth = ({ data, loading }) => {
  const totalNewUsers = data.reduce((sum, item) => sum + (item.count || 0), 0);

  return (
    <div className={styles.card}>
      <div className={styles.head}>
        <div>
          <h2 className={styles.title}>Tăng trưởng người dùng mới</h2>
          <p className={styles.subtitle}>Số tài khoản đăng ký mới trong 6 tháng qua</p>
        </div>
        <div className={styles.summaryBadge}>
          <span className={styles.summaryValue}>{totalNewUsers}</span>
          <span className={styles.summaryLabel}> người dùng mới</span>
        </div>
      </div>

      {loading ? (
        <div className={styles.skeleton} />
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorUserGrowth" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1a2f5e" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#1a2f5e" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12, fill: '#64748b' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#64748b' }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                fontSize: '12px',
                padding: '8px 12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              }}
              formatter={(value) => [`${value} tài khoản`, 'Đăng ký mới']}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#1a2f5e"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorUserGrowth)"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default BieuDoUserGrowth;
