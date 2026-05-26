import { useMemo } from 'react';
import styles from './TKFilterSection.module.scss';

// ═══════════════════════════════════════════════════════════════════════════════
// ─── TK FILTER SECTION ─────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
// CÔNG DỤNG: Chọn kỳ báo cáo (tháng/quý/năm) và bật/tắt so sánh kỳ trước
// ═══════════════════════════════════════════════════════════════════════════════

const TKFilterSection = ({ period, setPeriod, compareMode, setCompareMode }) => {
  // ─── GENERATE YEARS ────────────────────────────────────────────────────────
  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const startYear = 2020;
    return Array.from({ length: currentYear - startYear + 1 }, (_, i) => startYear + i);
  }, []);

  // ─── CALCULATE PREVIOUS PERIOD ────────────────────────────────────────────
  const getPreviousPeriodLabel = () => {
    if (period.type === 'month') {
      const prevMonth = period.month === 1 ? 12 : period.month - 1;
      const prevYear = period.month === 1 ? period.year - 1 : period.year;
      return `(Tháng ${prevMonth}/${prevYear})`;
    }
    if (period.type === 'quarter') {
      const prevQuarter = period.quarter === 1 ? 4 : period.quarter - 1;
      const prevYear = period.quarter === 1 ? period.year - 1 : period.year;
      return `(Quý ${prevQuarter}/${prevYear})`;
    }
    if (period.type === 'year') {
      return `(Năm ${period.year - 1})`;
    }
    return '';
  };

  // ─── HANDLERS ──────────────────────────────────────────────────────────────
  const handleTypeChange = (type) => {
    setPeriod({ ...period, type });
  };

  const handleMonthChange = (e) => {
    setPeriod({ ...period, month: parseInt(e.target.value) });
  };

  const handleQuarterChange = (e) => {
    setPeriod({ ...period, quarter: parseInt(e.target.value) });
  };

  const handleYearChange = (e) => {
    setPeriod({ ...period, year: parseInt(e.target.value) });
  };

  const handleToggleCompare = () => {
    setCompareMode(!compareMode);
  };

  // ─── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div className={styles.card}>
      {/* Left: Period Type + Picker */}
      <div className={styles.left}>
        {/* Period Type Tabs */}
        <div className={styles.periodTypeTabs}>
          <button
            className={period.type === 'month' ? styles.active : ''}
            onClick={() => handleTypeChange('month')}
          >
            Tháng
          </button>
          <button
            className={period.type === 'quarter' ? styles.active : ''}
            onClick={() => handleTypeChange('quarter')}
          >
            Quý
          </button>
          <button
            className={period.type === 'year' ? styles.active : ''}
            onClick={() => handleTypeChange('year')}
          >
            Năm
          </button>
        </div>

        {/* Period Picker */}
        <div className={styles.periodPicker}>
          {/* Month Picker */}
          {period.type === 'month' && (
            <>
              <select value={period.month} onChange={handleMonthChange}>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    Tháng {m}
                  </option>
                ))}
              </select>
              <select value={period.year} onChange={handleYearChange}>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </>
          )}

          {/* Quarter Picker */}
          {period.type === 'quarter' && (
            <>
              <select value={period.quarter} onChange={handleQuarterChange}>
                {[1, 2, 3, 4].map((q) => (
                  <option key={q} value={q}>
                    Quý {q}
                  </option>
                ))}
              </select>
              <select value={period.year} onChange={handleYearChange}>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </>
          )}

          {/* Year Picker */}
          {period.type === 'year' && (
            <select value={period.year} onChange={handleYearChange}>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Right: Compare Toggle */}
      <div className={styles.right}>
        <div className={styles.compareToggle}>
          <div className={styles.compareLabel}>
            <span className={styles.labelText}>So sánh kỳ trước</span>
            <span className={styles.labelSub}>{getPreviousPeriodLabel()}</span>
          </div>
          <button
            className={`${styles.toggleSwitch} ${compareMode ? styles.on : ''}`}
            onClick={handleToggleCompare}
            aria-label="Toggle so sánh"
          >
            <span className={styles.toggleThumb} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TKFilterSection;
