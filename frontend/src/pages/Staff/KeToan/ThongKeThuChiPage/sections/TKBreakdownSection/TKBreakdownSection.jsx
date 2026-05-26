import { HiArrowTrendingUp, HiArrowTrendingDown } from 'react-icons/hi2';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import styles from './TKBreakdownSection.module.scss';

// ═══════════════════════════════════════════════════════════════════════════════
// ─── TK BREAKDOWN SECTION ──────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
// CÔNG DỤNG: Donut chart cơ cấu Thu/Chi (dùng cho cả 2 loại)
// PROPS: type = 'thu' | 'chi', data = array
// ═══════════════════════════════════════════════════════════════════════════════

// ─── COLOR PALETTES ────────────────────────────────────────────────────────────
const COLORS_THU = ['#f0a500', '#fbbf24', '#fcd34d', '#fde68a', '#d4891a'];
const COLORS_CHI = ['#1a2f5e', '#2d4a8a', '#3d5fa8', '#5278c5', '#6b90d4'];

const TKBreakdownSection = ({ type, data }) => {
  // ─── CONFIG BY TYPE ────────────────────────────────────────────────────────
  const config = {
    thu: {
      icon: HiArrowTrendingUp,
      iconColor: '#f0a500',
      title: 'Cơ cấu nguồn Thu',
      centerLabel: 'Tổng thu',
      colors: COLORS_THU,
    },
    chi: {
      icon: HiArrowTrendingDown,
      iconColor: '#ef4444',
      title: 'Cơ cấu Chi phí',
      centerLabel: 'Tổng chi',
      colors: COLORS_CHI,
    },
  };

  const currentConfig = config[type];
  const Icon = currentConfig.icon;

  // ─── CALCULATE TOTAL ───────────────────────────────────────────────────────
  const total = data.reduce((sum, item) => sum + item.value, 0);

  // ─── LIMIT TO TOP 5 ────────────────────────────────────────────────────────
  const displayData = data.slice(0, 5);
  const hasMore = data.length > 5;
  const remainingCount = data.length - 5;

  // ─── RENDER CENTER LABEL ───────────────────────────────────────────────────
  const renderCenterLabel = () => {
    return (
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        className={styles.centerLabel}
      >
        <tspan x="50%" dy="-0.5em" className={styles.centerValue}>
          {(total / 1000000).toFixed(0)}tr
        </tspan>
        <tspan x="50%" dy="1.5em" className={styles.centerText}>
          {currentConfig.centerLabel}
        </tspan>
      </text>
    );
  };

  // ─── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div className={styles.card}>
      {/* Card Header */}
      <div className={styles.cardHeader}>
        <div className={styles.titleBlock}>
          <Icon className={styles.titleIcon} style={{ color: currentConfig.iconColor }} />
          <h3 className={styles.title}>{currentConfig.title}</h3>
        </div>
        <div className={styles.totalAmount} style={{ color: currentConfig.iconColor }}>
          {total.toLocaleString('vi-VN')} đ
        </div>
      </div>

      {/* Donut Chart */}
      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
              cornerRadius={4}
              dataKey="value"
              stroke="#fff"
              strokeWidth={2}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={currentConfig.colors[index % currentConfig.colors.length]}
                />
              ))}
            </Pie>
            {renderCenterLabel()}
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Detail List */}
      <div className={styles.detailList}>
        {displayData.map((item, index) => (
          <div key={index} className={styles.detailItem}>
            <div
              className={styles.dot}
              style={{
                backgroundColor: currentConfig.colors[index % currentConfig.colors.length],
              }}
            />
            <span className={styles.itemName}>{item.name}</span>
            <div className={styles.spacer} />
            <span className={styles.itemValue}>
              {item.value.toLocaleString('vi-VN')} đ
            </span>
            <span className={styles.itemBadge}>{item.percentage}%</span>
          </div>
        ))}

        {/* Show "X more items" if data > 5 */}
        {hasMore && (
          <div className={`${styles.detailItem} ${styles.moreItem}`}>
            <span className={styles.moreText}>+ {remainingCount} mục khác</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TKBreakdownSection;
