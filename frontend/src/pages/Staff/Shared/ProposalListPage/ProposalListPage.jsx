import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  HiOutlineListBullet,
  HiOutlineClock,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from 'react-icons/hi2';
import { useAuth } from '@context/AuthContext';
import { getProposals, getProposalStats } from '@services/proposalService';
import ProposalStats from './ProposalStats/ProposalStats';
import ProposalFilter from './ProposalFilter/ProposalFilter';
import ProposalTable from './ProposalTable/ProposalTable';
import ProposalDetailDrawer from './ProposalDetailDrawer/ProposalDetailDrawer';
import ApproveByCanBoModal from './ApproveByCanBoModal/ApproveByCanBoModal';
import RejectByCanBoModal from './RejectByCanBoModal/RejectByCanBoModal';
import ConfirmMoneyModal from './ConfirmMoneyModal/ConfirmMoneyModal';
import CreateActivityModal from './CreateActivityModal/CreateActivityModal';
import styles from './ProposalListPage.module.scss';

const PAGE_SIZE = 15;

const INITIAL_FILTERS = {
  keyword: '',
  quy_thanh_phan_id: '',
  trang_thai: '',
  tu_ngay: '',
  den_ngay: '',
};

/**
 * ProposalListPage - Trang quản lý đề xuất chương trình
 * Dùng chung cho: Cán bộ (role 3), Kế toán (role 2), Admin (role 1)
 */
const ProposalListPage = () => {
  const { user } = useAuth();
  const userRole = user?.vaiTro; // 1=Admin, 2=Kế toán, 3=Cán bộ

  // Tab: 'can_xu_ly' (Cần xử lý) | 'tat_ca' (Tất cả)
  const [activeTab, setActiveTab] = useState('can_xu_ly');
  
  // Stats
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Filters
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [debouncedKeyword, setDebouncedKeyword] = useState('');

  // Data
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Detail drawer
  const [selectedProposal, setSelectedProposal] = useState(null);

  // Modals
  const [approveModal, setApproveModal] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [confirmMoneyModal, setConfirmMoneyModal] = useState(null);
  const [createActivityModal, setCreateActivityModal] = useState(null);

  // Pending count dựa trên role
  const pendingCount = useMemo(() => {
    if (!stats) return 0;
    
    if (userRole === 3) {
      // Cán bộ: Chờ duyệt
      return stats.choDuyet || 0;
    } else if (userRole === 2) {
      // Kế toán: Chờ xác nhận tiền
      return stats.canBoPheDuyet || 0;
    } else if (userRole === 1) {
      // Admin: Chờ tạo hoạt động
      return stats.daNhanTien || 0;
    }
    return 0;
  }, [stats, userRole]);

  // Tên tab theo role
  const getPendingTabLabel = () => {
    if (userRole === 3) return 'Chờ duyệt';
    if (userRole === 2) return 'Chờ xác nhận';
    if (userRole === 1) return 'Chờ tạo hoạt động';
    return 'Cần xử lý';
  };

  // Debounce keyword
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(filters.keyword);
    }, 500);
    return () => clearTimeout(timer);
  }, [filters.keyword]);

  // Reset page khi filter/tab thay đổi
  useEffect(() => {
    setPage(1);
  }, [
    activeTab,
    debouncedKeyword,
    filters.quy_thanh_phan_id,
    filters.trang_thai,
    filters.tu_ngay,
    filters.den_ngay,
  ]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await getProposalStats();
      if (res?.success) {
        setStats(res.data || null);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
      setStats(null);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Xác định trạng thái query dựa trên tab và role
      let trangThaiQuery = filters.trang_thai;

      if (activeTab === 'can_xu_ly') {
        if (userRole === 3) {
          // Cán bộ: Lấy "Cho duyet"
          trangThaiQuery = 'Cho duyet';
        } else if (userRole === 2) {
          // Kế toán: Lấy "Can bo da duyet"
          trangThaiQuery = 'Can bo da duyet';
        } else if (userRole === 1) {
          // Admin: Lấy "Da nhan tien"
          trangThaiQuery = 'Da nhan tien';
        }
      }

      const res = await getProposals({
        keyword: debouncedKeyword,
        quy_thanh_phan_id: filters.quy_thanh_phan_id,
        trang_thai: trangThaiQuery,
        tu_ngay: filters.tu_ngay,
        den_ngay: filters.den_ngay,
        page,
        page_size: PAGE_SIZE,
      });

      if (res?.success) {
        setData(res.data || []);
        setTotal(res.pagination?.total || 0);
      } else {
        throw new Error(res?.message || 'Không thể tải dữ liệu');
      }
    } catch (err) {
      console.error('Error fetching proposals:', err);
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [
    activeTab,
    debouncedKeyword,
    filters,
    page,
    userRole,
  ]);

  // Initial fetch
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Pagination
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / PAGE_SIZE)),
    [total]
  );

  // Handlers (sẽ implement modals ở Phase 3)
  const handleApprove = (proposal) => {
    setApproveModal(proposal);
  };

  const handleReject = (proposal) => {
    setRejectModal(proposal);
  };

  const handleConfirmMoney = (proposal) => {
    setConfirmMoneyModal(proposal);
  };

  const handleCreateActivity = (proposal) => {
    setCreateActivityModal(proposal);
  };

  const handleViewDetail = (proposal) => {
    setSelectedProposal(proposal.dexuatchuongtrinh_id);
  };

  const handleCloseDetail = () => {
    setSelectedProposal(null);
  };

  const handleModalSuccess = () => {
    // Close all modals
    setApproveModal(null);
    setRejectModal(null);
    setConfirmMoneyModal(null);
    setCreateActivityModal(null);
    setSelectedProposal(null);
    
    // Refresh data
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
          <span className={styles.breadcrumbActive}>
            Đề xuất chương trình
          </span>
        </div>

        {/* Header */}
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Đề xuất chương trình</h1>
            <p className={styles.subtitle}>
              Quản lý đề xuất chương trình mới từ nhà tài trợ
            </p>
          </div>
          {pendingCount > 0 && (
            <div className={styles.urgentBadge}>
              {pendingCount} đề xuất cần xử lý
            </div>
          )}
        </header>

        {/* Stats */}
        <ProposalStats
          stats={stats}
          loading={statsLoading}
          userRole={userRole}
        />

        {/* Tab bar */}
        <div className={styles.tabBar}>
          <button
            type="button"
            className={`${styles.tab} ${
              activeTab === 'can_xu_ly' ? styles.tabActive : ''
            }`}
            onClick={() => setActiveTab('can_xu_ly')}
          >
            <HiOutlineClock className={styles.tabIcon} />
            <span>{getPendingTabLabel()}</span>
            {pendingCount > 0 && (
              <span className={styles.tabBadge}>{pendingCount}</span>
            )}
          </button>
          <button
            type="button"
            className={`${styles.tab} ${
              activeTab === 'tat_ca' ? styles.tabActive : ''
            }`}
            onClick={() => setActiveTab('tat_ca')}
          >
            <HiOutlineListBullet className={styles.tabIcon} />
            <span>Tất cả đề xuất</span>
          </button>
        </div>

        {/* Filter */}
        <ProposalFilter
          filters={filters}
          activeTab={activeTab}
          onChange={setFilters}
        />

        {/* Table */}
        <ProposalTable
          data={data}
          loading={loading}
          activeTab={activeTab}
          userRole={userRole}
          onViewDetail={handleViewDetail}
          onApprove={handleApprove}
          onReject={handleReject}
          onConfirmMoney={handleConfirmMoney}
          onCreateActivity={handleCreateActivity}
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
              <span className={styles.pageTotal}> · {total} đề xuất</span>
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
      {selectedProposal && (
        <ProposalDetailDrawer
          proposalId={selectedProposal}
          userRole={userRole}
          onClose={handleCloseDetail}
          onApprove={handleApprove}
          onReject={handleReject}
          onConfirmMoney={handleConfirmMoney}
          onCreateActivity={handleCreateActivity}
        />
      )}

      {/* Modals */}
      {approveModal && (
        <ApproveByCanBoModal
          proposal={approveModal}
          onClose={() => setApproveModal(null)}
          onSuccess={handleModalSuccess}
        />
      )}

      {rejectModal && (
        <RejectByCanBoModal
          proposal={rejectModal}
          onClose={() => setRejectModal(null)}
          onSuccess={handleModalSuccess}
        />
      )}

      {confirmMoneyModal && (
        <ConfirmMoneyModal
          proposal={confirmMoneyModal}
          onClose={() => setConfirmMoneyModal(null)}
          onSuccess={handleModalSuccess}
        />
      )}

      {createActivityModal && (
        <CreateActivityModal
          proposal={createActivityModal}
          onClose={() => setCreateActivityModal(null)}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
};

export default ProposalListPage;
