import {
  HiArrowTrendingUp,
  HiArrowTrendingDown,
  HiScale,
  HiArrowsRightLeft,
  HiArrowSmallUp,
  HiArrowSmallDown,
} from 'react-icons/hi2';
import styles from './TKSummarySection.module.scss';

// ═══════════════════════════════════════════════════════════════════════════════
// ─── TK SUMMARY SECTION ────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
// CÔNG DỤNG: 4 thẻ KPI tổng hợp + delta so sánh với kỳ trước
// ═══════════════════════════════════════════════════════════════════════════════

const TKSummarySection = ({ 
  summaryData, 
  compareSummaryData, 
  compareMode, 
  period 
}) => {
  // ─── CALCULATE DELTA ───────────────────────────────────────────────────────
  const calculateDelta = (current, previous) => {
    if (!previous || previous === 0) return null;
    return ((current - previous) / previous) * 100;
  };

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

  // ─── RENDER DELTA ──────────────────────────────────────────────────────────
  const renderDelta = (current, previous) => {
    if (!compareMode || !previous) return null;

    const delta = calculateDelta(current, previous);
    if (delta === null) return null;

    if (delta === 0) {
      return (
        <div className={`${styles.delta} ${styles.neutral}`}>
          <span className={styles.deltaText}>Không thay đổi</span>
        </div>
      );
    }

    const isPositive = delta > 0;
    return (
      <div className={`${styles.delta} ${isPositive ? styles.positive : styles.negative}`}>
        {isPositive ? (
          <HiArrowSmallUp className={styles.deltaIcon} />
        ) : (
          <HiArrowSmallDown className={styles.deltaIcon} />
        )}
        <span className={styles.deltaText}>
          {isPositive ? '+' : ''}{delta.toFixed(1)}% so với kỳ trước
        </span>
      </div>
    );
  };

  // ─── CALCULATE NET BALANCE ────────────────────────────────────────────────
  const netBalance = summaryData.tongThu - summaryData.tongChi;
  const prevNetBalance = compareSummaryData 
    ? compareSummaryData.tongThu - compareSummaryData.tongChi 
    : null;
  const isNetPositive = netBalance >= 0;

  // ─── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div className={styles.grid}>
      {/* Card 1: Tổng Thu */}
      <div className={styles.card}>
        <div className={`${styles.iconBox} ${styles.iconBoxGold}`}>
          <HiArrowTrendingUp className={styles.icon} />
        </div>
        <div className={styles.content}>
          <div className={`${styles.value} ${styles.valueGold}`}>
            {summaryData.tongThu.toLocaleString('vi-VN')} đ
          </div>
          {renderDelta(summaryData.tongThu, compareSummaryData?.tongThu)}
          <div className={styles.label}>Tổng thu</div>
          <div className={styles.sublabel}>{getPeriodLabel()}</div>
        </div>
      </div>

      {/* Card 2: Tổng Chi */}
      <div className={styles.card}>
        <div className={`${styles.iconBox} ${styles.iconBoxRed}`}>
          <HiArrowTrendingDown className={styles.icon} />
        </div>
        <div className={styles.content}>
          <div className={`${styles.value} ${styles.valueRed}`}>
            {summaryData.tongChi.toLocaleString('vi-VN')} đ
          </div>
          {renderDelta(summaryData.tongChi, compareSummaryData?.tongChi)}
          <div className={styles.label}>Tổng chi</div>
          <div className={styles.sublabel}>{getPeriodLabel()}</div>
        </div>
      </div>

      {/* Card 3: Số dư ròng */}
      <div className={styles.card}>
        <div className={`${styles.iconBox} ${styles.iconBoxPrimary}`}>
          <HiScale className={styles.icon} />
        </div>
        <div className={styles.content}>
          <div className={`${styles.value} ${isNetPositive ? styles.valueGreen : styles.valueRed}`}>
            {netBalance.toLocaleString('vi-VN')} đ
          </div>
          {renderDelta(netBalance, prevNetBalance)}
          <div className={styles.label}>Số dư ròng</div>
          <div className={styles.sublabel}>{getPeriodLabel()}</div>
        </div>
      </div>

      {/* Card 4: Số giao dịch */}
      <div className={styles.card}>
        <div className={`${styles.iconBox} ${styles.iconBoxNavy}`}>
          <HiArrowsRightLeft className={styles.icon} />
        </div>
        <div className={styles.content}>
          <div className={`${styles.value} ${styles.valueNavy}`}>
            {summaryData.soGiaoDich.toLocaleString('vi-VN')}
          </div>
          {renderDelta(summaryData.soGiaoDich, compareSummaryData?.soGiaoDich)}
          <div className={styles.label}>Giao dịch phát sinh</div>
          <div className={styles.sublabel}>{getPeriodLabel()}</div>
        </div>
      </div>
    </div>
  );
};

export default TKSummarySection;
