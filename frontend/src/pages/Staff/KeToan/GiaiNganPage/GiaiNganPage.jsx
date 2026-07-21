import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { HiOutlineClock, HiOutlineListBullet } from 'react-icons/hi2';
import api from '@services/api';
import { applicationService } from '@services/applicationService';
import GiaiNganFilterSection from './sections/GiaiNganFilterSection';
import GiaiNganTableSection from './sections/GiaiNganTableSection';
import styles from './GiaiNganPage.module.scss';

const PAGE_SIZE = 10;

const INITIAL_RANGE = { from: '', to: '' };

const GiaiNganPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('cho_giai_ngan');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [filterQuy, setFilterQuy] = useState('');
  const [filterDateRange, setFilterDateRange] = useState(INITIAL_RANGE);

  const [list, setList] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const [quyOptions, setQuyOptions] = useState([]);
  const [counts, setCounts] = useState({ choXuLy: 0, daXuLyHomNay: 0 });

  // ─── Debounce search keyword ──────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => setDebouncedKeyword(searchKeyword.trim()), 500);
    return () => clearTimeout(t);
  }, [searchKeyword]);

  // ─── Reset page khi filter / tab thay đổi ─────────────────────────────────
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, debouncedKeyword, filterQuy, filterDateRange.from, filterDateRange.to]);

  // ─── Fetch danh sách quỹ cho dropdown ─────────────────────────────────────
  useEffect(() => {
    let mounted = true;
    api
      .get('/funds', { params: { trang_thai: 'Dang hoat dong' } })
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

  // ─── Fetch danh sách đơn ──────────────────────────────────────────────────
  const fetchList = useCallback(async () => {
    setIsLoading(true);
    try {
      const trangThai =
        activeTab === 'cho_giai_ngan'
          ? 'Cho duyet cap 3,Cho giai ngan'
          : 'Da giai ngan,Tu choi,Tu choi cap 3';

      const res = await applicationService.getAll({
        trangThai,
        quyId: filterQuy || undefined,
        page: currentPage,
        limit: PAGE_SIZE,
      });

      let items = res?.data || [];

      // Frontend filter cho keyword (backend chưa hỗ trợ search)
      if (debouncedKeyword) {
        const kw = debouncedKeyword.toLowerCase();
        items = items.filter(
          (a) =>
            (a.nguoiNop?.hoTen || '').toLowerCase().includes(kw) ||
            (a.nguoiNop?.maSoDinhDanh || '').toLowerCase().includes(kw) ||
            (a.tieuDe || '').toLowerCase().includes(kw),
        );
      }

      // Frontend filter cho date range
      if (filterDateRange.from) {
        items = items.filter(
          (a) => new Date(a.ngayNop) >= new Date(filterDateRange.from),
        );
      }
      if (filterDateRange.to) {
        const to = new Date(filterDateRange.to);
        to.setHours(23, 59, 59, 999);
        items = items.filter((a) => new Date(a.ngayNop) <= to);
      }

      setList(items);
      setTotalCount(res?.pagination?.totalRecords || items.length);
    } catch (err) {
      console.error('Lỗi tải danh sách giải ngân:', err);
      setList([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [
    activeTab,
    filterQuy,
    currentPage,
    debouncedKeyword,
    filterDateRange.from,
    filterDateRange.to,
  ]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  // ─── Fetch số lượng cho tab badge ─────────────────────────────────────────
  const fetchCounts = useCallback(async () => {
    try {
      const [choRes] = await Promise.all([
        applicationService.getAll({
          trangThai: 'Cho duyet cap 3,Cho giai ngan',
          page: 1,
          limit: 1,
        }),
      ]);
      setCounts({
        choXuLy: choRes?.pagination?.totalRecords || 0,
        daXuLyHomNay: 0,
      });
    } catch {
      setCounts({ choXuLy: 0, daXuLyHomNay: 0 });
    }
  }, []);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  // ─── Mở trang chi tiết ───────────────────────────────────────────────
  const handleOpenDetail = (request) => {
    navigate(`/ke-toan/giai-ngan/${request.requestId}`);
  };

  const handleCloseDrawer = () => {
    setSelectedRequest(null);
    setSelectedDetail(null);
    setBankAccount(null);
    setPheDuyetList([]);
  };

  // ─── Xử lý giải ngân ──────────────────────────────────────────────────────
  const handleGiaiNgan = async ({ ghiChu, file }) => {
    if (!selectedRequest) return;
    setIsSubmitting(true);
    try {
      // 1. Upload minh chứng trước
      let minhChungUrl = null;
      if (file) {
        const upRes = await uploadService.uploadFile(file);
        minhChungUrl = upRes?.data?.filePath || upRes?.filePath || null;
      }

      // 2. Gọi disburse
      await api.post(`/applications/${selectedRequest.requestId}/disburse`, {
        ghiChu: ghiChu || null,
        minhChungChuyenKhoan: minhChungUrl,
      });

      toast.success(
        `Đã giải ngân thành công cho ${
          selectedRequest.nguoiNop?.hoTen || 'sinh viên'
        }`,
      );
      setModalType(null);
      handleCloseDrawer();
      fetchList();
      fetchCounts();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        'Có lỗi xảy ra khi giải ngân, vui lòng thử lại';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Xử lý từ chối ────────────────────────────────────────────────────────
  const handleTuChoi = async ({ lyDoTuChoi }) => {
    if (!selectedRequest) return;
    setIsSubmitting(true);
    try {
      await api.put(`/applications/${selectedRequest.requestId}/reject`, {
        lyDoTuChoi,
      });
      toast.success('Đã từ chối hồ sơ');
      setModalType(null);
      handleCloseDrawer();
      fetchList();
      fetchCounts();
    } catch (err) {
      const msg =
        err?.response?.data?.message || 'Có lỗi khi từ chối hồ sơ';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalCount / PAGE_SIZE)),
    [totalCount],
  );

  const handleClearFilters = () => {
    setSearchKeyword('');
    setFilterQuy('');
    setFilterDateRange(INITIAL_RANGE);
  };

  const hasFilter =
    !!searchKeyword ||
    !!filterQuy ||
    !!filterDateRange.from ||
    !!filterDateRange.to;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Giải ngân hồ sơ</h1>
          <p className={styles.subtitle}>
            Xác nhận giải ngân cho sinh viên đã được phê duyệt
          </p>
        </div>
        <div className={styles.headerStats}>
          <div className={`${styles.miniStat} ${styles.miniStatUrgent}`}>
            <span className={styles.miniStatValue}>{counts.choXuLy}</span>
            <span className={styles.miniStatLabel}>Chờ giải ngân</span>
          </div>
          <div className={`${styles.miniStat} ${styles.miniStatGold}`}>
            <span className={styles.miniStatValue}>
              {counts.daXuLyHomNay}
            </span>
            <span className={styles.miniStatLabel}>Đã xử lý hôm nay</span>
          </div>
        </div>
      </div>

      <div className={styles.tabs}>
        <button
          type="button"
          className={`${styles.tab} ${
            activeTab === 'cho_giai_ngan' ? styles.tabActive : ''
          }`}
          onClick={() => setActiveTab('cho_giai_ngan')}
        >
          <HiOutlineClock className={styles.tabIcon} />
          <span>Chờ giải ngân</span>
          {counts.choXuLy > 0 && (
            <span className={styles.tabBadge}>{counts.choXuLy}</span>
          )}
        </button>
        <button
          type="button"
          className={`${styles.tab} ${
            activeTab === 'da_xu_ly' ? styles.tabActive : ''
          }`}
          onClick={() => setActiveTab('da_xu_ly')}
        >
          <HiOutlineListBullet className={styles.tabIcon} />
          <span>Đã xử lý</span>
        </button>
      </div>

      <GiaiNganFilterSection
        searchKeyword={searchKeyword}
        onSearchChange={setSearchKeyword}
        filterQuy={filterQuy}
        onQuyChange={setFilterQuy}
        filterDateRange={filterDateRange}
        onDateRangeChange={setFilterDateRange}
        quyOptions={quyOptions}
        hasFilter={hasFilter}
        onClearFilter={handleClearFilters}
      />

      <GiaiNganTableSection
        data={list}
        isLoading={isLoading}
        tab={activeTab}
        currentPage={currentPage}
        totalPages={totalPages}
        totalCount={totalCount}
        pageSize={PAGE_SIZE}
        onPageChange={setCurrentPage}
        onViewDetail={handleOpenDetail}
      />
    </div>
  );
};

export default GiaiNganPage;
