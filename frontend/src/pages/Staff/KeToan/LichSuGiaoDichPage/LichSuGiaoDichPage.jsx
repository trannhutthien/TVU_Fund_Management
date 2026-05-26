import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import { HiOutlineArrowDownTray } from 'react-icons/hi2';
import api from '@services/api';
import LichSuStatsSection from './sections/LichSuStatsSection';
import LichSuFilterSection from './sections/LichSuFilterSection';
import LichSuTableSection from './sections/LichSuTableSection';
import GiaoDichDetailDrawer from './sections/GiaoDichDetailDrawer';
import styles from './LichSuGiaoDichPage.module.scss';

const PAGE_SIZE = 15;

const INITIAL_RANGE = { from: '', to: '' };

// Tính from/to cho quick filter
const computeQuickRange = (key) => {
  const today = new Date();
  const fmt = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  if (key === 'today') {
    return { from: fmt(today), to: fmt(today) };
  }
  if (key === 'week') {
    const monday = new Date(today);
    const dow = today.getDay() === 0 ? 7 : today.getDay();
    monday.setDate(today.getDate() - dow + 1);
    return { from: fmt(monday), to: fmt(today) };
  }
  if (key === 'month') {
    const first = new Date(today.getFullYear(), today.getMonth(), 1);
    return { from: fmt(first), to: fmt(today) };
  }
  return INITIAL_RANGE;
};

const LichSuGiaoDichPage = () => {
  const [list, setList] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const [statsData, setStatsData] = useState(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  const [filterLoai, setFilterLoai] = useState('');
  const [filterTrangThai, setFilterTrangThai] = useState('');
  const [filterQuy, setFilterQuy] = useState('');
  const [filterDateRange, setFilterDateRange] = useState(INITIAL_RANGE);
  const [quickDateFilter, setQuickDateFilter] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');

  const [quyOptions, setQuyOptions] = useState([]);
  const [selectedGiaoDich, setSelectedGiaoDich] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  // ─── Debounce search ─────────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => setDebouncedKeyword(searchKeyword.trim()), 500);
    return () => clearTimeout(t);
  }, [searchKeyword]);

  // ─── Reset page khi filter thay đổi ──────────────────────────────────────
  useEffect(() => {
    setCurrentPage(1);
  }, [
    filterLoai,
    filterTrangThai,
    filterQuy,
    filterDateRange.from,
    filterDateRange.to,
    debouncedKeyword,
  ]);

  // ─── Fetch quỹ options khi mount ─────────────────────────────────────────
  useEffect(() => {
    let mounted = true;
    api
      .get('/funds')
      .then((res) => {
        if (!mounted) return;
        const funds = res.data?.funds || res.data?.data?.funds || [];
        setQuyOptions(
          funds.map((f) => ({
            value: String(f.quyId || f.quy_id),
            label: f.tenQuy || f.ten_quy,
          })),
        );
      })
      .catch(() => setQuyOptions([]));
    return () => {
      mounted = false;
    };
  }, []);

  // ─── Filter params chung ─────────────────────────────────────────────────
  const filterParams = useMemo(
    () => ({
      loai: filterLoai || undefined,
      trangThai: filterTrangThai || undefined,
      quyId: filterQuy || undefined,
      tuNgay: filterDateRange.from || undefined,
      denNgay: filterDateRange.to || undefined,
      keyword: debouncedKeyword || undefined,
    }),
    [
      filterLoai,
      filterTrangThai,
      filterQuy,
      filterDateRange.from,
      filterDateRange.to,
      debouncedKeyword,
    ],
  );

  // ─── Fetch list + stats song song ────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setIsLoadingStats(true);
    try {
      const [listRes, statsRes] = await Promise.all([
        api.get('/transactions', {
          params: {
            ...filterParams,
            page: currentPage,
            limit: PAGE_SIZE,
          },
        }),
        api.get('/transactions/summary', { params: filterParams }),
      ]);
      setList(listRes.data?.data || []);
      setTotalCount(listRes.data?.pagination?.totalRecords || 0);
      setStatsData(statsRes.data?.data || null);
    } catch (err) {
      console.error('Lỗi tải lịch sử giao dịch:', err);
      setList([]);
      setTotalCount(0);
      setStatsData(null);
    } finally {
      setIsLoading(false);
      setIsLoadingStats(false);
    }
  }, [filterParams, currentPage]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ─── Handlers ────────────────────────────────────────────────────────────
  const handleQuickDateChange = (key) => {
    setQuickDateFilter(key);
    setFilterDateRange(computeQuickRange(key));
  };

  const handleDateRangeChange = (newRange) => {
    setFilterDateRange(newRange);
    setQuickDateFilter(''); // Reset chip khi user nhập tay
  };

  const handleClearFilters = () => {
    setFilterLoai('');
    setFilterTrangThai('');
    setFilterQuy('');
    setFilterDateRange(INITIAL_RANGE);
    setQuickDateFilter('');
    setSearchKeyword('');
  };

  const hasFilter =
    !!filterLoai ||
    !!filterTrangThai ||
    !!filterQuy ||
    !!filterDateRange.from ||
    !!filterDateRange.to ||
    !!searchKeyword;

  const handleExportExcel = async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      const response = await api.get('/transactions/export', {
        params: filterParams,
        responseType: 'blob',
      });
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const ts = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      link.setAttribute('download', `LichSuGiaoDich_${ts}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Đã xuất file Excel thành công');
    } catch (err) {
      console.error('Lỗi xuất Excel:', err);
      toast.error('Có lỗi khi xuất Excel');
    } finally {
      setIsExporting(false);
    }
  };

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalCount / PAGE_SIZE)),
    [totalCount],
  );

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Lịch sử giao dịch</h1>
          <p className={styles.subtitle}>
            Toàn bộ dòng tiền Thu - Chi của hệ thống
          </p>
        </div>
        <button
          type="button"
          className={styles.exportBtn}
          onClick={handleExportExcel}
          disabled={isExporting}
        >
          {isExporting ? (
            <>
              <span className={styles.spinner} />
              Đang xuất...
            </>
          ) : (
            <>
              <HiOutlineArrowDownTray size={16} />
              Xuất Excel
            </>
          )}
        </button>
      </div>

      <LichSuStatsSection data={statsData} isLoading={isLoadingStats} />

      <LichSuFilterSection
        searchKeyword={searchKeyword}
        onSearchChange={setSearchKeyword}
        filterLoai={filterLoai}
        onLoaiChange={setFilterLoai}
        filterTrangThai={filterTrangThai}
        onTrangThaiChange={setFilterTrangThai}
        filterQuy={filterQuy}
        onQuyChange={setFilterQuy}
        filterDateRange={filterDateRange}
        onDateRangeChange={handleDateRangeChange}
        quickDateFilter={quickDateFilter}
        onQuickDateChange={handleQuickDateChange}
        quyOptions={quyOptions}
        hasFilter={hasFilter}
        onClearFilter={handleClearFilters}
      />

      <LichSuTableSection
        data={list}
        isLoading={isLoading}
        totalCount={totalCount}
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={PAGE_SIZE}
        onPageChange={setCurrentPage}
        onViewDetail={setSelectedGiaoDich}
      />

      {selectedGiaoDich && (
        <GiaoDichDetailDrawer
          giaoDich={selectedGiaoDich}
          onClose={() => setSelectedGiaoDich(null)}
        />
      )}
    </div>
  );
};

export default LichSuGiaoDichPage;
