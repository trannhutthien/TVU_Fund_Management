import { useState, useEffect } from 'react';
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

  // ─── FETCH DATA ────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // TODO: Gọi API song song với Promise.all
        // GET /api/statistics/ketoan/summary?type=month&year=2025&month=5
        // GET /api/statistics/ketoan/cashflow?type=month&year=2025&month=5
        // GET /api/statistics/ketoan/breakdown-thu?type=month&year=2025&month=5
        // GET /api/statistics/ketoan/breakdown-chi?type=month&year=2025&month=5
        // GET /api/statistics/ketoan/fund-table?type=month&year=2025&month=5
        
        // Mock data tạm
        setSummaryData({
          tongThu: 500000000,
          tongChi: 300000000,
          soQuy: 5,
          soGiaoDich: 120,
        });

        // Mock data kỳ trước (nếu compareMode = true)
        if (compareMode) {
          setCompareSummaryData({
            tongThu: 450000000,
            tongChi: 280000000,
            soQuy: 5,
            soGiaoDich: 110,
          });
        } else {
          setCompareSummaryData(null);
        }
        
        setCashflowData([
          { thang: 'T1', thu: 400000000, chi: 250000000 },
          { thang: 'T2', thu: 450000000, chi: 280000000 },
          { thang: 'T3', thu: 500000000, chi: 300000000 },
          { thang: 'T4', thu: 480000000, chi: 290000000 },
          { thang: 'T5', thu: 500000000, chi: 300000000 },
        ]);

        // Mock data cashflow kỳ trước (nếu compareMode = true)
        if (compareMode) {
          setCompareCashflowData([
            { thang: 'T1', thu: 380000000, chi: 240000000 },
            { thang: 'T2', thu: 420000000, chi: 260000000 },
            { thang: 'T3', thu: 450000000, chi: 280000000 },
            { thang: 'T4', thu: 440000000, chi: 270000000 },
            { thang: 'T5', thu: 450000000, chi: 280000000 },
          ]);
        } else {
          setCompareCashflowData([]);
        }
        
        setBreakdownThuData([
          { name: 'Vingroup', value: 200000000, percentage: 40 },
          { name: 'Vinamilk', value: 150000000, percentage: 30 },
          { name: 'Masan', value: 150000000, percentage: 30 },
        ]);
        
        setBreakdownChiData([
          { name: 'Quỹ Học bổng', value: 180000000, percentage: 60 },
          { name: 'Quỹ Khó khăn', value: 120000000, percentage: 40 },
        ]);
        
        setFundTableData([
          { 
            tenQuy: 'Quỹ Học bổng', 
            thu: 300000000, 
            chi: 180000000, 
            soDu: 120000000,
            soTienToiDa: 500000000,
            soGiaoDich: 45,
            trangThai: 'Đang hoạt động',
            trendData: [
              { value: 100000000 },
              { value: 150000000 },
              { value: 180000000 },
              { value: 200000000 },
              { value: 250000000 },
              { value: 300000000 },
            ]
          },
          { 
            tenQuy: 'Quỹ Khó khăn', 
            thu: 200000000, 
            chi: 120000000, 
            soDu: 80000000,
            soTienToiDa: 300000000,
            soGiaoDich: 32,
            trangThai: 'Đang hoạt động',
            trendData: [
              { value: 80000000 },
              { value: 120000000 },
              { value: 150000000 },
              { value: 180000000 },
              { value: 190000000 },
              { value: 200000000 },
            ]
          },
        ]);
        
      } catch (error) {
        console.error('Lỗi fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [period, compareMode]);

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
