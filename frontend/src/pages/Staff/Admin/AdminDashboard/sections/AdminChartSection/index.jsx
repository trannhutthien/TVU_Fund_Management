import PropTypes from 'prop-types';
import {
  ComposedChart,
  Bar,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  HiChartBar,
  HiUserPlus,
  HiChartPie,
} from 'react-icons/hi2';
import styles from './AdminChartSection.module.scss';

// ═══════════════════════════════════════════════════════════════════════════════
// ─── ADMIN CHART SECTION ───────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
// CÔNG DỤNG: Hiển thị 3 biểu đồ xu hướng (dòng tiền, người dùng, phân bổ quỹ)
// ═══════════════════════════════════════════════════════════════════════════════

const FUND_COLORS = [
  '#f0a500',
  '#d4891a',
  '#1a2f5e',
  '#2d4a8a',
  '#3d5fa8',
  '#5278c5',
  '#6b90d4',
];

const AdminChartSection = ({ chartData, selectedPeriod, onPeriodChange }) => {
  if (!chartData) return null;

  const { cashflow6Months = [], userGrowth6Months = [], fundDistribution = [] } = chartData;

  // ─── FORMAT CURRENCY SHORT ─────────────────────────────────────────────────
  const formatCurrencyShort = (value) => {
    if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
    return value;
  };

  // ─── CUSTOM TOOLTIP ────────────────────────────────────────────────────────
  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className={styles.tooltip}>
        <p className={styles.tooltipLabel}>{payload[0].payload.month}</p>
        {payload.map((entry, index) => (
          <p key={index} className={styles.tooltipItem} style={{ color: entry.color }}>
            {entry.name}: {entry.value.toLocaleString('vi-VN')}đ
          </p>
        ))}
      </div>
    );
  };

  // ─── CALCULATE TOTAL NEW USERS ─────────────────────────────────────────────
  const totalNewUsers = userGrowth6Months.reduce((sum, item) => sum + (item.count || 0), 0);

  // ─── TOP 3 FUNDS ───────────────────────────────────────────────────────────
  const sortedFunds = [...fundDistribution].sort((a, b) => b.value - a.value);
  const top3Funds = sortedFunds.slice(0, 3);
  const remainingCount = sortedFunds.length - 3;
  const totalValue = fundDistribution.reduce((sum, item) => sum + item.value, 0);

  // ─── RENDER CENTER LABEL FOR PIE ───────────────────────────────────────────
  const renderCenterLabel = () => (
    <text
      x="50%"
      y="50%"
      textAnchor="middle"
      dominantBaseline="middle"
      className={styles.centerLabel}
    >
      <tspan x="50%" dy="-8" className={styles.centerValue}>
        {fundDistribution.length}
      </tspan>
      <tspan x="50%" dy="20" className={styles.centerText}>
        Quỹ
      </tspan>
    </text>
  );

  // ─── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div className={styles.section}>
      {/* Section Title */}
      <div className={styles.sectionTitle}>
        <div className={styles.titleBar} />
        <h2>Biểu đồ xu hướng</h2>
      </div>

      {/* Grid */}
      <div className={styles.grid}>
        {/* Chart 1 - Dòng tiền */}
        <div className={styles.chartCard}>
          {/* Header */}
          <div className={styles.chartHeader}>
            <div className={styles.chartHeaderLeft}>
              <HiChartBar size={18} />
              <span className={styles.chartTitle}>Dòng tiền hệ thống</span>
            </div>
            <div className={styles.periodSwitcher}>
              <button
                className={selectedPeriod === 'month' ? styles.periodActive : ''}
                onClick={() => onPeriodChange('month')}
              >
                Tháng
              </button>
              <button
                className={selectedPeriod === 'quarter' ? styles.periodActive : ''}
                onClick={() => onPeriodChange('quarter')}
              >
                Quý
              </button>
              <button
                className={selectedPeriod === 'year' ? styles.periodActive : ''}
                onClick={() => onPeriodChange('year')}
              >
                Năm
              </button>
            </div>
          </div>

          {/* Chart */}
          <ResponsiveContainer width="100%" height={240}>
            <ComposedChart data={cashflow6Months}>
              <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 13, fill: '#1e293b', fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 13, fill: '#1e293b', fontWeight: 600 }}
                tickFormatter={formatCurrencyShort}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{
                  paddingTop: '12px',
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '16px',
                }}
                iconType="circle"
              />
              <Bar
                dataKey="thu"
                name="Thu"
                fill="#f0a500"
                radius={[4, 4, 0, 0]}
                maxBarSize={28}
              />
              <Bar
                dataKey="chi"
                name="Chi"
                fill="#1a2f5e"
                radius={[4, 4, 0, 0]}
                maxBarSize={28}
              />
              <Line
                type="monotone"
                dataKey="soDu"
                name="Số dư ròng"
                stroke="#16a34a"
                strokeWidth={2}
                dot={{ r: 3, fill: '#16a34a' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 2 - Tăng trưởng người dùng */}
        <div className={styles.chartCard}>
          {/* Header */}
          <div className={styles.chartHeader}>
            <div className={styles.chartHeaderLeft}>
              <HiUserPlus size={18} />
              <span className={styles.chartTitle}>Người dùng mới</span>
            </div>
          </div>

          {/* Chart */}
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={userGrowth6Months}>
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f0a500" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f0a500" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: '#1e293b', fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#1e293b', fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
                width={35}
              />
              <Tooltip
                contentStyle={{
                  background: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  fontSize: '12px',
                  padding: '8px 12px',
                }}
                labelStyle={{
                  fontWeight: 600,
                  marginBottom: '4px',
                  color: '#1e293b',
                }}
                itemStyle={{
                  color: '#f0a500',
                  fontWeight: 600,
                }}
                formatter={(value) => [`${value} người dùng`, 'Mới']}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#f0a500"
                strokeWidth={3}
                fill="url(#colorUsers)"
                dot={{ r: 4, fill: '#f0a500', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6, fill: '#f0a500', strokeWidth: 2, stroke: '#fff' }}
              />
            </AreaChart>
          </ResponsiveContainer>

          {/* Footer */}
          <div className={styles.chartFooter}>
            <div className={styles.footerValue}>{totalNewUsers.toLocaleString('vi-VN')}</div>
            <div className={styles.footerLabel}>người dùng mới</div>
          </div>
        </div>

        {/* Chart 3 - Phân bổ quỹ */}
        <div className={styles.chartCard}>
          {/* Header */}
          <div className={styles.chartHeader}>
            <div className={styles.chartHeaderLeft}>
              <HiChartPie size={18} />
              <span className={styles.chartTitle}>Phân bổ giải ngân</span>
            </div>
          </div>

          {/* Chart */}
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={fundDistribution}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={2}
                dataKey="value"
              >
                {fundDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={FUND_COLORS[index % FUND_COLORS.length]} />
                ))}
              </Pie>
              {renderCenterLabel()}
            </PieChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div className={styles.fundLegend}>
            {top3Funds.map((fund, index) => {
              const percent = totalValue > 0 ? ((fund.value / totalValue) * 100).toFixed(1) : 0;
              return (
                <div key={index} className={styles.fundLegendItem}>
                  <div
                    className={styles.fundLegendDot}
                    style={{ background: FUND_COLORS[index] }}
                  />
                  <span className={styles.fundLegendName}>{fund.name}</span>
                  <span className={styles.fundLegendPercent}>{percent}%</span>
                </div>
              );
            })}
            {remainingCount > 0 && (
              <div className={styles.fundLegendMore}>+ {remainingCount} quỹ khác</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

AdminChartSection.propTypes = {
  chartData: PropTypes.shape({
    cashflow6Months: PropTypes.array,
    userGrowth6Months: PropTypes.array,
    fundDistribution: PropTypes.array,
  }),
  selectedPeriod: PropTypes.string,
  onPeriodChange: PropTypes.func,
};

export default AdminChartSection;
