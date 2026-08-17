import { useState, useEffect, useCallback } from 'react';
import api from '@services/api';
import PublicHeader from '@components/layout/PublicHeader/PublicHeader';
import PublicFooter from '@components/layout/PublicFooter/PublicFooter';
import TKSummarySection from '../../Staff/KeToan/ThongKeThuChiPage/sections/TKSummarySection';
import TKCashFlowSection from '../../Staff/KeToan/ThongKeThuChiPage/sections/TKCashFlowSection';
import TKBreakdownSection from '../../Staff/KeToan/ThongKeThuChiPage/sections/TKBreakdownSection';
import TKFundTableSection from '../../Staff/KeToan/ThongKeThuChiPage/sections/TKFundTableSection';
import styles from './PublicThongKeThuChiPage.module.scss';

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => ({
  value: i + 1,
  label: `Tháng ${i + 1}`,
}));

const QUARTER_OPTIONS = [
  { value: 1, label: 'Quý I' },
  { value: 2, label: 'Quý II' },
  { value: 3, label: 'Quý III' },
  { value: 4, label: 'Quý IV' },
];

const YEAR_OPTIONS = Array.from({ length: 10 }, (_, i) => {
  const year = new Date().getFullYear() - i;
  return { value: year, label: String(year) };
});

const getInitialPeriod = () => {
  const now = new Date();
  return {
    type: 'month',
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    quarter: Math.ceil((now.getMonth() + 1) / 3),
  };
};

const PublicThongKeThuChiPage = () => {
  const [periodType, setPeriodType] = useState('month');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedQuarter, setSelectedQuarter] = useState(
    Math.ceil((new Date().getMonth() + 1) / 3),
  );

  const [summaryData, setSummaryData] = useState(null);
  const [compareSummaryData, setCompareSummaryData] = useState(null);
  const [cashflowData, setCashflowData] = useState([]);
  const [compareCashflowData, setCompareCashflowData] = useState(null);
  const [breakdownThuData, setBreakdownThuData] = useState([]);
  const [breakdownChiData, setBreakdownChiData] = useState([]);
  const [fundTableData, setFundTableData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const period = {
    type: periodType,
    year: selectedYear,
    month: selectedMonth,
    quarter: selectedQuarter,
  };

  const fetchReport = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {
        type: periodType,
        year: selectedYear,
      };
      if (periodType === 'month') params.month = selectedMonth;
      if (periodType === 'quarter') params.quarter = selectedQuarter;

      const res = await api.get('/statistics/public/report', { params });
      const d = res.data?.data || {};

      setSummaryData(d.summaryData || null);
      setCompareSummaryData(d.compareSummaryData || null);
      setCashflowData(d.cashflowData || []);
      setCompareCashflowData(d.compareCashflowData || null);
      setBreakdownThuData(d.breakdownThuData || []);
      setBreakdownChiData(d.breakdownChiData || []);
      setFundTableData(d.fundTableData || []);
    } catch (err) {
      console.error('Lỗi tải thống kê thu chi công khai:', err);
      setSummaryData(null);
      setCompareSummaryData(null);
      setCashflowData([]);
      setCompareCashflowData(null);
      setBreakdownThuData([]);
      setBreakdownChiData([]);
      setFundTableData([]);
    } finally {
      setIsLoading(false);
    }
  }, [periodType, selectedYear, selectedMonth, selectedQuarter]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  return (
    <div className={styles.page}>
      <PublicHeader />
      <div className={styles.container}>
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.title}>Thống kê thu chi công khai</h1>
            <p className={styles.subtitle}>
              Minh bạch toàn bộ dòng tiền Thu - Chi của quỹ phát triển TVU
            </p>
          </div>
        </div>

        <div className={styles.periodSelector}>
          <select
            className={styles.periodTypeSelect}
            value={periodType}
            onChange={(e) => setPeriodType(e.target.value)}
          >
            <option value="month">Theo tháng</option>
            <option value="quarter">Theo quý</option>
            <option value="year">Theo năm</option>
          </select>

          <select
            className={styles.yearSelect}
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            {YEAR_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {periodType === 'month' && (
            <select
              className={styles.monthSelect}
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
            >
              {MONTH_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          )}

          {periodType === 'quarter' && (
            <select
              className={styles.quarterSelect}
              value={selectedQuarter}
              onChange={(e) => setSelectedQuarter(Number(e.target.value))}
            >
              {QUARTER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          )}
        </div>

        {isLoading ? (
          <div className={styles.loadingWrap}>
            <div className={styles.spinner} />
          </div>
        ) : (
          <div className={styles.sections}>
            <TKSummarySection
              summaryData={summaryData}
              compareSummaryData={compareSummaryData}
              compareMode={false}
              period={period}
            />

            <TKCashFlowSection
              cashflowData={cashflowData}
              compareCashflowData={compareCashflowData}
              compareMode={false}
              period={period}
            />

            <div className={styles.breakdownRow}>
              <TKBreakdownSection type="thu" data={breakdownThuData} />
              <TKBreakdownSection type="chi" data={breakdownChiData} />
            </div>

            <TKFundTableSection fundTableData={fundTableData} period={period} />
          </div>
        )}
      </div>
      <PublicFooter />
    </div>
  );
};

export default PublicThongKeThuChiPage;
