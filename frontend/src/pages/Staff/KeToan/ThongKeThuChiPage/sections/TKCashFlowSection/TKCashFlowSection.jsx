import { useState } from 'react';
import { HiChartBar } from 'react-icons/hi2';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import styles from './TKCashFlowSection.module.scss';

// ═══════════════════════════════════════════════════════════════════════════════
// ─── TK CASH FLOW SECTION ──────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
// CÔNG DỤNG: Biểu đồ dòng tiền theo thời gian (Bar/Line chart)
// ═══════════════════════════════════════════════════════════════════════════════

const TKCashFlowSection = ({ 
  cashflowData, 
  compareCashflowData, 
  compareMode, 
  period 
}) => {
  const [chartType, setChartType] = useState('bar'); // 'bar' | 'line'

  // ─── GET PERIOD LABEL ──────────────────────────────────────────────────────
  const getPeriodLabel = () => {
    if (period.type === 'month') {
      return `Tháng ${period.month}/${period.year}`;
    }
    if (period.type === 'quarter') {
      return `Quý ${period.quarter}/${period.year}`;
    }
    if (period.type === 'year') {
      return `Năm ${period.year}`;
    }
    return '';
  };

  // ─── FORMAT Y AXIS ─────────────────────────────────────────────────────────
  const formatYAxis = (value) => {
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(1)}tỷ`;
    }
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(0)}tr`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}k`;
    }
    return value;
  };

  // ─── CUSTOM TOOLTIP ────────────────────────────────────────────────────────
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className={styles.tooltip}>
        <div className={styles.tooltipLabel}>{label}</div>
        {payload.map((entry, index) => (
          <div key={index} className={styles.tooltipItem}>
            <span 
              className={styles.tooltipDot} 
              style={{ backgroundColor: entry.color }}
            />
            <span className={styles.tooltipName}>{entry.name}:</span>
            <span className={styles.tooltipValue}>
              {entry.value.toLocaleString('vi-VN')} đ
            </span>
          </div>
        ))}
      </div>
    );
  };

  // ─── MERGE DATA FOR COMPARISON ─────────────────────────────────────────────
  const mergedData = compareMode && compareCashflowData
    ? cashflowData.map((item, index) => ({
        ...item,
        thuTruoc: compareCashflowData[index]?.thu || 0,
        chiTruoc: compareCashflowData[index]?.chi || 0,
      }))
    : cashflowData;

  // ─── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div className={styles.card}>
      {/* Card Header */}
      <div className={styles.cardHeader}>
        <div className={styles.titleBlock}>
          <HiChartBar className={styles.titleIcon} />
          <h3 className={styles.title}>Biểu đồ dòng tiền</h3>
          <span className={styles.periodBadge}>{getPeriodLabel()}</span>
        </div>

        {/* Chart Type Switcher */}
        <div className={styles.chartTypeSwitcher}>
          <button
            className={chartType === 'bar' ? styles.active : ''}
            onClick={() => setChartType('bar')}
          >
            Cột
          </button>
          <button
            className={chartType === 'line' ? styles.active : ''}
            onClick={() => setChartType('line')}
          >
            Đường
          </button>
        </div>
      </div>

      {/* Compare Legend */}
      {compareMode && (
        <div className={styles.compareLegend}>
          <div className={styles.legendItem}>
            <div className={`${styles.legendLine} ${styles.legendLineThu}`} />
            <span className={styles.legendText}>Thu kỳ này</span>
          </div>
          <div className={styles.legendItem}>
            <div className={`${styles.legendLine} ${styles.legendLineChi}`} />
            <span className={styles.legendText}>Chi kỳ này</span>
          </div>
          <div className={styles.legendItem}>
            <div className={`${styles.legendLine} ${styles.legendLineThuTruoc}`} />
            <span className={styles.legendText}>Thu kỳ trước</span>
          </div>
          <div className={styles.legendItem}>
            <div className={`${styles.legendLine} ${styles.legendLineChiTruoc}`} />
            <span className={styles.legendText}>Chi kỳ trước</span>
          </div>
        </div>
      )}

      {/* Chart */}
      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={mergedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeWidth={1.5} vertical={false} />
          
          <XAxis
            dataKey="thang"
            tick={{ fontSize: 12, fill: '#64748b' }}
            axisLine={false}
            tickLine={false}
          />
          
          <YAxis
            tickFormatter={formatYAxis}
            tick={{ fontSize: 12, fill: '#64748b' }}
            axisLine={false}
            tickLine={false}
          />
          
          <Tooltip content={<CustomTooltip />} />

          {/* Current Period */}
          {chartType === 'bar' ? (
            <>
              <Bar
                dataKey="thu"
                name="Thu"
                fill="var(--color-gold)"
                radius={[6, 6, 0, 0]}
                maxBarSize={32}
                stroke="#d4891a"
                strokeWidth={1.5}
              />
              <Bar
                dataKey="chi"
                name="Chi"
                fill="var(--color-primary)"
                radius={[6, 6, 0, 0]}
                maxBarSize={32}
                stroke="#0f1f3d"
                strokeWidth={1.5}
              />
            </>
          ) : (
            <>
              <Line
                type="monotone"
                dataKey="thu"
                name="Thu"
                stroke="var(--color-gold)"
                strokeWidth={3}
                dot={{ fill: 'var(--color-gold)', r: 5, strokeWidth: 2, stroke: '#fff' }}
              />
              <Line
                type="monotone"
                dataKey="chi"
                name="Chi"
                stroke="var(--color-primary)"
                strokeWidth={3}
                dot={{ fill: 'var(--color-primary)', r: 5, strokeWidth: 2, stroke: '#fff' }}
              />
            </>
          )}

          {/* Previous Period (Compare Mode) */}
          {compareMode && (
            <>
              {chartType === 'bar' ? (
                <>
                  <Bar
                    dataKey="thuTruoc"
                    name="Thu kỳ trước"
                    fill="rgba(240, 165, 0, 0.35)"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={32}
                    stroke="rgba(212, 137, 26, 0.6)"
                    strokeWidth={1.5}
                  />
                  <Bar
                    dataKey="chiTruoc"
                    name="Chi kỳ trước"
                    fill="rgba(26, 47, 94, 0.35)"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={32}
                    stroke="rgba(15, 31, 61, 0.6)"
                    strokeWidth={1.5}
                  />
                </>
              ) : (
                <>
                  <Line
                    type="monotone"
                    dataKey="thuTruoc"
                    name="Thu kỳ trước"
                    stroke="rgba(240, 165, 0, 0.7)"
                    strokeWidth={3}
                    strokeDasharray="5 5"
                    dot={{ fill: 'rgba(240, 165, 0, 0.7)', r: 5, strokeWidth: 2, stroke: '#fff' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="chiTruoc"
                    name="Chi kỳ trước"
                    stroke="rgba(26, 47, 94, 0.7)"
                    strokeWidth={3}
                    strokeDasharray="5 5"
                    dot={{ fill: 'rgba(26, 47, 94, 0.7)', r: 5, strokeWidth: 2, stroke: '#fff' }}
                  />
                </>
              )}
            </>
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TKCashFlowSection;
