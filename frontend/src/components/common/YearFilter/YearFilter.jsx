import { useState, useEffect } from 'react';
import statisticsService from '@services/statisticsService';
import './YearFilter.module.scss';

// ═══════════════════════════════════════════════════════════════════════════════
// ─── YEAR FILTER ──────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
// CÔNG DỤNG: Dropdown chọn năm tài chính, dùng chung cho tất cả trang thống kê
// API: GET /api/statistics/available-years → ["2024","2025","2026"]
// Props:
//   value    – năm hiện tại (number | null = "Tất cả")
//   onChange – callback(year: number | null)
// ═══════════════════════════════════════════════════════════════════════════════

const YearFilter = ({ value, onChange }) => {
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchYears = async () => {
      try {
        setLoading(true);
        const res = await statisticsService.getAvailableYears();
        if (!cancelled) {
          const data = res?.data?.data || [];
          setYears(data.map(Number).sort((a, b) => b - a));
        }
      } catch {
        // Fallback: hardcode 2020→currentYear
        const currentYear = new Date().getFullYear();
        if (!cancelled) {
          setYears(Array.from({ length: currentYear - 2020 + 1 }, (_, i) => 2020 + i).reverse());
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchYears();
    return () => { cancelled = true; };
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    onChange(val === 'all' ? null : parseInt(val));
  };

  return (
    <div className="year-filter">
      <label className="year-filter__label">Năm tài chính:</label>
      <select
        className="year-filter__select"
        value={value === null || value === undefined ? 'all' : value}
        onChange={handleChange}
        disabled={loading}
      >
        <option value="all">Tất cả</option>
        {years.map((y) => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>
    </div>
  );
};

export default YearFilter;
