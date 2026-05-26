import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '../utils';
import styles from './BieuDoPhanBo.module.scss';

const BieuDoPhanBo = ({ data, loading }) => {
  const total = data.reduce((sum, x) => sum + Number(x.tien || 0), 0);
  const soLoai = data.length;

  return (
    <div className={styles.card}>
      <div className={styles.head}>
        <div>
          <h2 className={styles.title}>Phân bổ theo loại quỹ</h2>
          <p className={styles.subtitle}>
            Tỷ trọng tài sản từng nhóm quỹ
          </p>
        </div>
      </div>

      {loading ? (
        <div className={styles.skeleton} />
      ) : data.length === 0 ? (
        <div className={styles.empty}>Chưa có dữ liệu</div>
      ) : (
        <>
          <div className={styles.pieWrap}>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={data}
                  dataKey="tien"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={100}
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
                    padding: '8px 12px',
                  }}
                  formatter={(value, _name, props) => [
                    `${formatCurrency(value)} (${props.payload.value}%)`,
                    props.payload.name,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className={styles.pieCenter}>
              <div className={styles.pieCenterValue}>{soLoai}</div>
              <div className={styles.pieCenterLabel}>loại quỹ</div>
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
                <span className={styles.legendValue}>
                  {formatCurrency(item.tien)}
                  <span className={styles.legendPercent}>
                    {' '}
                    · {item.value}%
                  </span>
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default BieuDoPhanBo;
