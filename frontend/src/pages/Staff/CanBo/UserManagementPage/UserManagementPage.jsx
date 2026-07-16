import { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'react-toastify';
import {
  HiOutlineUserPlus,
  HiOutlineUsers,
  HiOutlineAcademicCap,
  HiOutlineHandRaised,
  HiOutlineShieldCheck,
  HiOutlineBriefcase,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from 'react-icons/hi2';
import Button from '@components/common/Button/Button';
import { userService } from '@services/userService';
import UserStatsBar from './UserStatsBar/UserStatsBar';
import UserFilter from './UserFilter/UserFilter';
import UserTable from './UserTable/UserTable';
import UserDetailDrawer from './UserDetailDrawer/UserDetailDrawer';
import CreateEditUserModal from './CreateEditUserModal/CreateEditUserModal';
import NhanSuSection from './NhanSuSection/NhanSuSection';
import styles from './UserManagementPage.module.scss';

const PAGE_SIZE = 15;

const MAIN_TABS = [
  { id: 'nguoi_dung', label: 'Quản lý người dùng', icon: HiOutlineUsers },
  { id: 'chuc_vu', label: 'Chức vụ tổ chức', icon: HiOutlineBriefcase },
];

const TABS = [
  { id: 'tat_ca', label: 'Tất cả', icon: HiOutlineUsers },
  { id: 'sinh_vien', label: 'Sinh viên', icon: HiOutlineAcademicCap },
  { id: 'nha_tai_tro', label: 'Nhà tài trợ', icon: HiOutlineHandRaised },
  { id: 'nhan_vien', label: 'Nhân viên hệ thống', icon: HiOutlineShieldCheck },
];

const INITIAL_FILTERS = {
  keyword: '',
  trang_thai: '',
  khoa_phong: '',
  loai_ntt: '',
};

const UserManagementPage = ({ isAdmin = false, initialTab }) => {
  const [mainTab, setMainTab] = useState(initialTab || 'nguoi_dung');
  const [activeTab, setActiveTab] = useState('tat_ca');
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [selectedUser, setSelectedUser] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedKeyword(filters.keyword), 500);
    return () => clearTimeout(t);
  }, [filters.keyword]);

  useEffect(() => {
    setPage(1);
  }, [activeTab, debouncedKeyword, filters.trang_thai, filters.khoa_phong, filters.loai_ntt]);

  // Reset filter khi đổi tab
  useEffect(() => {
    setFilters((f) => ({
      ...f,
      khoa_phong: activeTab === 'sinh_vien' ? f.khoa_phong : '',
      loai_ntt: activeTab === 'tat_ca' ? f.loai_ntt : '',
    }));
  }, [activeTab]);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await userService.getStats();
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
      const res = await userService.getAll({
        tab: activeTab,
        keyword: debouncedKeyword,
        trang_thai: filters.trang_thai,
        khoa_phong: filters.khoa_phong,
        loai_ntt: filters.loai_ntt,
        page,
        page_size: PAGE_SIZE,
      });
      setData(res?.data || []);
      setTotal(res?.pagination?.total || 0);
    } catch (e) {
      console.error('Lỗi tải danh sách:', e);
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [activeTab, debouncedKeyword, filters.trang_thai, filters.khoa_phong, filters.loai_ntt, page]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { fetchStats(); }, [fetchStats]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / PAGE_SIZE)),
    [total]
  );

  const activeStatsCard = useMemo(() => {
    if (filters.trang_thai === 'KHOA') return 'locked';
    if (activeTab === 'sinh_vien') return 'students';
    if (activeTab === 'nha_tai_tro') return 'donors';
    if (activeTab === 'nhan_vien') return 'staff';
    if (activeTab === 'tat_ca' && !filters.trang_thai && !filters.khoa_phong && !filters.loai_ntt) return 'all';
    return '';
  }, [activeTab, filters.trang_thai, filters.khoa_phong, filters.loai_ntt]);

  const handleStatsCardClick = useCallback((cardKey) => {
    setPage(1);

    if (cardKey === 'students') {
      setActiveTab('sinh_vien');
      setFilters((current) => ({
        ...current,
        trang_thai: '',
        khoa_phong: '',
        loai_ntt: '',
      }));
      return;
    }

    if (cardKey === 'donors') {
      setActiveTab('nha_tai_tro');
      setFilters((current) => ({
        ...current,
        trang_thai: '',
        khoa_phong: '',
        loai_ntt: '',
      }));
      return;
    }

    if (cardKey === 'staff') {
      setActiveTab('nhan_vien');
      setFilters((current) => ({
        ...current,
        trang_thai: '',
        khoa_phong: '',
        loai_ntt: '',
      }));
      return;
    }

    if (cardKey === 'locked') {
      setActiveTab('tat_ca');
      setFilters((current) => ({
        ...current,
        trang_thai: 'KHOA',
        khoa_phong: '',
        loai_ntt: '',
      }));
      return;
    }

    setActiveTab('tat_ca');
    setFilters(INITIAL_FILTERS);
  }, []);

  const handleToggleStatus = async (user) => {
    const newStatus = user.trang_thai === 'HOAT_DONG' ? 'KHOA' : 'HOAT_DONG';
    const label = newStatus === 'KHOA' ? 'khóa' : 'mở khóa';
    if (!window.confirm(`Xác nhận ${label} tài khoản "${user.ho_ten}"?`)) return;
    try {
      await userService.updateStatus(user.user_id, newStatus);
      toast.success(`Đã ${label} tài khoản thành công`);
      fetchData();
      fetchStats();
    } catch (err) {
      const msg = err?.response?.data?.message || 'Không thể cập nhật trạng thái';
      toast.error(msg);
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Xác nhận xóa vĩnh viễn tài khoản "${user.ho_ten}"? Hành động này không thể hoàn tác.`)) return;
    try {
      await userService.delete(user.user_id);
      toast.success('Xóa tài khoản thành công');
      fetchData();
      fetchStats();
    } catch (err) {
      const msg = err?.response?.data?.message || 'Không thể xóa tài khoản';
      toast.error(msg);
    }
  };

  const handleOpenCreate = () => {
    setEditUser(null);
    setShowModal(true);
  };

  const handleOpenEdit = (user) => {
    setEditUser(user);
    setShowModal(true);
  };

  const handleModalSuccess = () => {
    setShowModal(false);
    setEditUser(null);
    fetchData();
    fetchStats();
  };

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.breadcrumb}>
          <span>Trang chủ</span>
          <span className={styles.breadcrumbSep}>/</span>
          <span className={styles.breadcrumbActive}>Quản lý người dùng</span>
        </div>

        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>
              {mainTab === 'chuc_vu' ? 'Chức vụ tổ chức' : 'Quản lý Người dùng'}
            </h1>
            <p className={styles.subtitle}>
              {mainTab === 'chuc_vu'
                ? 'Quản lý chức danh và nhân sự trong Quỹ'
                : 'Quản lý tài khoản sinh viên và nhà tài trợ'}
            </p>
          </div>
          {mainTab === 'nguoi_dung' && (activeTab !== 'nhan_vien' || isAdmin) && (
            <Button
              variant="primary"
              leftIcon={<HiOutlineUserPlus />}
              onClick={handleOpenCreate}
            >
              Tạo tài khoản mới
            </Button>
          )}
        </header>

        <div className={styles.mainTabBar}>
          {MAIN_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = mainTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                className={`${styles.mainTab} ${isActive ? styles.mainTabActive : ''}`}
                onClick={() => setMainTab(tab.id)}
              >
                <Icon className={styles.tabIcon} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {mainTab === 'chuc_vu' ? (
          <NhanSuSection />
        ) : (
          <>
            <UserStatsBar
              stats={stats}
              loading={statsLoading}
              activeKey={activeStatsCard}
              onCardClick={handleStatsCardClick}
            />

            <div className={styles.tabBar}>
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    className={`${styles.tab} ${isActive ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <Icon className={styles.tabIcon} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <UserFilter
              activeTab={activeTab}
              filters={filters}
              onChange={setFilters}
            />

            <UserTable
              data={data}
              loading={loading}
              activeTab={activeTab}
              onViewDetail={setSelectedUser}
              onEdit={handleOpenEdit}
              onToggleStatus={handleToggleStatus}
              isAdmin={isAdmin}
              onDelete={handleDeleteUser}
        />

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
              <span className={styles.pageTotal}> · {total} người dùng</span>
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
          </>
        )}
      </div>

      {selectedUser && (
        <UserDetailDrawer
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onEdit={(u) => {
            setSelectedUser(null);
            handleOpenEdit(u);
          }}
          isAdmin={isAdmin}
        />
      )}

      <CreateEditUserModal
        isOpen={showModal}
        user={editUser}
        onClose={() => {
          setShowModal(false);
          setEditUser(null);
        }}
        onSuccess={handleModalSuccess}
        isAdmin={isAdmin}
        defaultTab={activeTab}
      />
    </div>
  );
};

export default UserManagementPage;
