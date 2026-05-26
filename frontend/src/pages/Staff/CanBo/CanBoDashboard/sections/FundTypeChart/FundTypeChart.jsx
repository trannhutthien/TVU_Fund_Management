import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import styles from './FundTypeChart.module.scss';

const FundTypeChart = ({ data }) => {
  const total = data.reduce((sum, x) => sum + x.value, 0);

  return (
    <div className={styles.card}>
      <div className={styles.head}>
        <h2 className={styles.title}>Phân bổ theo loại quỹ</h2>
      </div>
      {data.length === 0 ? (
        <div className={styles.empty}>Chưa có dữ liệu</div>
      ) : (
        <>
          <div className={styles.pieWrap}>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                >
                  {data.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                  }}
                  formatter={(value, name) => [
                    `${value} đơn (${Math.round((value / total) * 100)}%)`,
                    name,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className={styles.pieCenter}>
              <div className={styles.pieCenterValue}>{total}</div>
              <div className={styles.pieCenterLabel}>Tổng đơn</div>
            </div>
          </div>
          <div className={styles.legend}>
            {data.map((item) => (
              <div key={item.name} className={styles.legendItem}>
                <span
                  className={styles.legendDot}
                  style={{ background: item.color }}
                />
                <span className={styles.legendName}>{item.name}</span>
                <span className={styles.legendValue}>{item.value}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default FundTypeChart;
