import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  HiOutlineListBullet,
  HiOutlineClock,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from 'react-icons/hi2';
import {
  getDonations,
  getDonationStats,
} from '@services/donationService';
import { useAuth } from '@context/AuthContext';
import KhoanTaiTroStats from './KhoanTaiTroStats/KhoanTaiTroStats';
import KhoanTaiTroFilter from './KhoanTaiTroFilter/KhoanTaiTroFilter';
import KhoanTaiTroTable from './KhoanTaiTroTable/KhoanTaiTroTable';
import KhoanTaiTroDetailDrawer from './KhoanTaiTroDetailDrawer/KhoanTaiTroDetailDrawer';
import XacNhanModal from './XacNhanModal/XacNhanModal';
import styles from './KhoanTaiTroPage.module.scss';

const PAGE_SIZE = 15;

const INITIAL_FILTERS = {
  keyword: '',
  quy_id: '',
  loai_ntt: '',
  trang_thai: '',
  tu_ngay: '',
  den_ngay: '',
};

const KhoanTaiTroPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.vaiTro === 1;
  const isKeToan = user?.vaiTro === 2;

  const [activeTab, setActiveTab] = useState('can_xac_nhan'); // 'can_xac_nhan' | 'tat_ca'
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [selectedItem, setSelectedItem] = useState(null);
  const [confirmItem, setConfirmItem] = useState(null);

  const pendingCount = useMemo(() => {
    if (!stats) return 0;
    return isKeToan ? (stats.choCanBo || 0) : (stats.canXacNhan || 0);
  }, [stats, isKeToan]);

  // Debounce keyword
  useEffect(() => {
    const t = setTimeout(() => setDebouncedKeyword(filters.keyword), 500);
    return () => clearTimeout(t);
  }, [filters.keyword]);

  // Reset page khi filter/tab thay đổi
  useEffect(() => {
    setPage(1);
  }, [activeTab, debouncedKeyword, filters.quy_id, filters.loai_ntt, filters.trang_thai, filters.tu_ngay, filters.den_ngay]);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await getDonationStats();
      setStats(res?.data || null);
    } catch {
      setStats(null);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // ✅ Phân quyền theo vai trò:
      // - Kế toán (role 2): Tab "Cần xác nhận" lấy 'Cho duyet'
      // - Admin (role 1): Tab "Cần xác nhận" lấy 'Da duyet'
      let trangThaiQuery = filters.trang_thai;
      
      if (activeTab === 'can_xac_nhan') {
        if (isKeToan) {
          trangThaiQuery = 'Cho duyet'; // Kế toán duyệt khoản chờ duyệt
        } else if (isAdmin) {
          trangThaiQuery = 'Da duyet'; // Admin xem khoản đã duyệt
        }
      }

      const res = await getDonations({
        keyword: debouncedKeyword,
        quy_id: filters.quy_id,
        loai_ntt: filters.loai_ntt,
        trang_thai: trangThaiQuery,
        tu_ngay: filters.tu_ngay,
        den_ngay: filters.den_ngay,
        page,
        page_size: PAGE_SIZE,
      });
      setData(res?.data || []);
      setTotal(res?.pagination?.total || 0);
    } catch (e) {
      console.error('Lỗi tải danh sách khoản tài trợ:', e);
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [activeTab, debouncedKeyword, filters.quy_id, filters.loai_ntt, filters.trang_thai, filters.tu_ngay, filters.den_ngay, page, isKeToan, isAdmin]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { fetchStats(); }, [fetchStats]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / PAGE_SIZE)),
    [total]
  );

  const handleConfirmSuccess = () => {
    setConfirmItem(null);
    fetchData();
    fetchStats();
  };

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        {/* Breadcrumb */}
        <div className={styles.breadcrumb}>
          <span>Trang chủ</span>
          <span className={styles.breadcrumbSep}>/</span>
          <span className={styles.breadcrumbActive}>Khoản tài trợ</span>
        </div>

        {/* Header */}
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Khoản tài trợ</h1>
            <p className={styles.subtitle}>
              Xác nhận tiền đã vào quỹ từ các nhà tài trợ
            </p>
          </div>
          {pendingCount > 0 && (
            <div className={styles.urgentBadge}>
              {pendingCount} khoản cần {isKeToan ? 'duyệt' : 'xác nhận'}
            </div>
          )}
        </header>

        {/* Stats */}
        <KhoanTaiTroStats
          stats={stats}
          loading={statsLoading}
          isKeToan={isKeToan}
          isAdmin={isAdmin}
        />

        {/* Tab bar */}
        <div className={styles.tabBar}>
          <button
            type="button"
            className={`${styles.tab} ${activeTab === 'can_xac_nhan' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('can_xac_nhan')}
          >
            <HiOutlineClock className={styles.tabIcon} />
            <span>Cần {isKeToan ? 'duyệt' : 'xác nhận'}</span>
            {pendingCount > 0 && (
              <span className={styles.tabBadge}>{pendingCount}</span>
            )}
          </button>
          <button
            type="button"
            className={`${styles.tab} ${activeTab === 'tat_ca' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('tat_ca')}
          >
            <HiOutlineListBullet className={styles.tabIcon} />
            <span>Tất cả khoản tài trợ</span>
          </button>
        </div>

        {/* Filter */}
        <KhoanTaiTroFilter
          filters={filters}
          activeTab={activeTab}
          onChange={setFilters}
        />

        {/* Table */}
        <KhoanTaiTroTable
          data={data}
          loading={loading}
          activeTab={activeTab}
          onViewDetail={setSelectedItem}
          onConfirm={setConfirmItem}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              type="button"
              className={styles.pageBtn}
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <HiOutlineChevronLeft />
            </button>
            <span className={styles.pageInfo}>
              Trang <strong>{page}</strong> / {totalPages}
              <span className={styles.pageTotal}> · {total} khoản</span>
            </span>
            <button
              type="button"
              className={styles.pageBtn}
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              <HiOutlineChevronRight />
            </button>
          </div>
        )}
      </div>

      {/* Detail Drawer */}
      {selectedItem && (
        <KhoanTaiTroDetailDrawer
          item={selectedItem}
          isAdmin={isAdmin}
          isKeToan={isKeToan}
          onClose={() => setSelectedItem(null)}
          onConfirm={(it) => {
            setSelectedItem(null);
            setConfirmItem(it);
          }}
        />
      )}

      {/* Confirmation Modal */}
      {confirmItem && (
        <XacNhanModal
          item={confirmItem}
          onClose={() => setConfirmItem(null)}
          onSuccess={handleConfirmSuccess}
        />
      )}
    </div>
  );
};

export default KhoanTaiTroPage;
