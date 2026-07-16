import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import statisticsService from '@services/statisticsService';
import YearFilter from '@components/common/YearFilter';
import TKFilterSection from './sections/TKFilterSection';
import TKSummarySection from './sections/TKSummarySection';
import TKCashFlowSection from './sections/TKCashFlowSection';
import TKBreakdownSection from './sections/TKBreakdownSection';
import TKFundTableSection from './sections/TKFundTableSection';
import TKExportSection from './sections/TKExportSection';
import styles from './ThongKeThuChiPage.module.scss';

// ═══════════════════════════════════════════════════════════════════════════════
// ─── THỐNG KÊ THU CHI PAGE ─────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
// CÔNG DỤNG: Trang thống kê thu chi cho Kế toán (role 2)
// ROUTE: /ke-toan/bao-cao
// ═══════════════════════════════════════════════════════════════════════════════

const ThongKeThuChiPage = () => {
  // ─── STATE ─────────────────────────────────────────────────────────────────
  const [period, setPeriod] = useState({
    type: 'month', // 'month' | 'quarter' | 'year'
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    quarter: Math.ceil((new Date().getMonth() + 1) / 3),
  });
  
  const [compareMode, setCompareMode] = useState(false);
  const [summaryData, setSummaryData] = useState(null);
  const [compareSummaryData, setCompareSummaryData] = useState(null);
  const [cashflowData, setCashflowData] = useState([]);
  const [compareCashflowData, setCompareCashflowData] = useState([]);
  const [breakdownThuData, setBreakdownThuData] = useState([]);
  const [breakdownChiData, setBreakdownChiData] = useState([]);
  const [fundTableData, setFundTableData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedYear, setSelectedYear] = useState(null);

  // ─── FETCH DATA ────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const res = await statisticsService.getKeToanReportStats({
          type: period.type,
          year: period.year,
          month: period.month,
          quarter: period.quarter,
          compareMode: compareMode,
          nam: selectedYear,
        });

        if (res) {
          setSummaryData(res.summaryData);
          setCompareSummaryData(res.compareSummaryData);
          setCashflowData(res.cashflowData || []);
          setCompareCashflowData(res.compareCashflowData || []);
          setBreakdownThuData(res.breakdownThuData || []);
          setBreakdownChiData(res.breakdownChiData || []);
          setFundTableData(res.fundTableData || []);
        }
      } catch (error) {
        console.error('Lỗi tải thống kê thu chi:', error);
        toast.error('Không tải được dữ liệu thống kê');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [period, compareMode, selectedYear]);

  // ─── RENDER ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>Đang tải dữ liệu...</div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Thống kê Thu - Chi</h1>
          <p className={styles.pageSubtitle}>
            Phân tích dòng tiền và lập báo cáo tài chính
          </p>
        </div>
        <YearFilter value={selectedYear} onChange={setSelectedYear} />
      </div>

      {/* Filter Section */}
      <TKFilterSection
        period={period}
        setPeriod={setPeriod}
        compareMode={compareMode}
        setCompareMode={setCompareMode}
      />

      {/* Summary Section */}
      <TKSummarySection
        summaryData={summaryData}
        compareSummaryData={compareSummaryData}
        compareMode={compareMode}
        period={period}
      />

      {/* Cash Flow Section */}
      <TKCashFlowSection
        cashflowData={cashflowData}
        compareCashflowData={compareCashflowData}
        compareMode={compareMode}
        period={period}
      />

      {/* Breakdown Row */}
      <div className={styles.breakdownRow}>
        <TKBreakdownSection type="thu" data={breakdownThuData} />
        <TKBreakdownSection type="chi" data={breakdownChiData} />
      </div>

      {/* Fund Table Section */}
      <TKFundTableSection fundTableData={fundTableData} period={period} />

      {/* Export Section */}
      <TKExportSection period={period} compareMode={compareMode} />
    </div>
  );
};

export default ThongKeThuChiPage;
