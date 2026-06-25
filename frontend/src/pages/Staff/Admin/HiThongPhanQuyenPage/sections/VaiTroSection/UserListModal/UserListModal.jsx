import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import {
  HiOutlineXMark,
  HiOutlineMagnifyingGlass,
  HiOutlineUserGroup,
  HiOutlineExclamationCircle,
  HiOutlineEye,
  HiOutlinePencilSquare,
  HiOutlineLockClosed,
  HiOutlineLockOpen,
  HiOutlineTrash,
} from 'react-icons/hi2';
import Button from '@components/common/Button/Button';
import StatusBadge from '@components/common/StatusBadge/StatusBadge';
import { userService } from '@services/userService';
import api from '@services/api';
import UserDetailDrawer from '@pages/Staff/CanBo/UserManagementPage/UserDetailDrawer/UserDetailDrawer';
import CreateEditUserModal from '@pages/Staff/CanBo/UserManagementPage/CreateEditUserModal/CreateEditUserModal';
import styles from './UserListModal.module.scss';

const formatDate = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('vi-VN');
};

const normalizeStatus = (trangThai) => {
  if (!trangThai) return 'HOAT_DONG';
  const s = trangThai.trim().toUpperCase().replace(/\s+/g, '_');
  if (s === 'HOAT_DONG' || s === 'HOATDONG') return 'HOAT_DONG';
  if (s === 'KHOA') return 'KHOA';
  if (s === 'CHO_DUYET' || s === 'CHODUYET') return 'CHO_DUYET';
  return trangThai;
};

const getStatusBadge = (trangThai) => {
  const s = normalizeStatus(trangThai);
  if (s === 'HOAT_DONG') return { status: 'approved', label: 'Hoạt động' };
  if (s === 'KHOA')      return { status: 'rejected', label: 'Bị khóa' };
  return { status: 'pending', label: 'Chờ duyệt' };
};

/**
 * Map data từ /roles/:id/users (API shape) → snake_case shape
 * mà UserDetailDrawer & CreateEditUserModal mong đợi.
 */
const toDrawerUser = (u) => ({
  user_id:           u.user_id,
  ma_so_dinh_danh:   u.id,          // masodinhdanh
  ho_ten:            u.hoTen,
  email:             u.email,
  trang_thai:        normalizeStatus(u.trangThai),
  role_id:           u.vaiTro,
  created_at:        u.createdAt,
  // Các trường bổ sung nếu thiếu để Drawer không crash
  so_dien_thoai:     u.soDienThoai  || null,
  dia_chi:           u.diaChi       || null,
  avatar:            u.avatar       || null,
  loai_tai_khoan:    u.loaiTaiKhoan || null,
  khoa_phong:        u.khoaPhong    || null,
  ten_nha_tai_tro:   u.tenNhaTaiTro || null,
  loai_nha_tai_tro:  u.loaiNhaTaiTro|| null,
});

/**
 * Lấy full user từ /api/users/:id để truyền vào Drawer / EditModal.
 * /api/users/:id trả về camelCase → cần map sang snake_case.
 */
const fetchFullUser = async (userId) => {
  const res = await userService.getAll({ tab: 'tat_ca', keyword: '', page: 1, page_size: 999 });
  // Nếu có getById trả đúng shape thì dùng, không thì dùng getAll và lọc
  // Phương án an toàn nhất: lấy từ list /api/users có user_id
  const list = res?.data || [];
  return list.find((u) => u.user_id === userId) || null;
};

const UserListModal = ({ role, onClose }) => {
  const [users, setUsers]               = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery]   = useState('');
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);

  // Sub-modal/drawer state
  const [selectedUser, setSelectedUser]   = useState(null);
  const [editUser, setEditUser]           = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Card Admin (role_id = 1) — không cho phép thao tác CRUD
  const isAdminRole = role?.role_id === 1;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/roles/${role.role_id}/users`);
      if (response.data?.success) {
        setUsers(response.data.users || []);
      } else {
        setError(response.data?.message || 'Không thể lấy danh sách người dùng');
      }
    } catch (err) {
      console.error('Error fetching users by role:', err);
      setError(err.response?.data?.message || 'Lỗi kết nối máy chủ');
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    if (role?.role_id) fetchUsers();
  }, [fetchUsers, role]);

  // Filter theo search
  useEffect(() => {
    if (!searchQuery.trim()) { setFilteredUsers(users); return; }
    const q = searchQuery.toLowerCase().trim();
    setFilteredUsers(
      users.filter((u) =>
        [u.id, u.hoTen, u.email].some((f) => f && String(f).toLowerCase().includes(q))
      )
    );
  }, [searchQuery, users]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleViewDetail = async (listUser) => {
    // Ưu tiên lấy full data từ /api/users để có đủ trường cho Drawer
    try {
      const full = await fetchFullUser(listUser.user_id);
      setSelectedUser(full || toDrawerUser(listUser));
    } catch {
      setSelectedUser(toDrawerUser(listUser));
    }
  };

  const handleOpenEdit = async (listUser) => {
    try {
      const full = await fetchFullUser(listUser.user_id);
      setEditUser(full || toDrawerUser(listUser));
    } catch {
      setEditUser(toDrawerUser(listUser));
    }
    setShowEditModal(true);
  };

  const handleToggleStatus = async (user) => {
    const isLocked  = normalizeStatus(user.trangThai) === 'KHOA';
    const newStatus = isLocked ? 'HOAT_DONG' : 'KHOA';
    const label     = isLocked ? 'mở khóa' : 'khóa';
    if (!window.confirm(`Xác nhận ${label} tài khoản "${user.hoTen}"?`)) return;
    try {
      await userService.updateStatus(user.user_id, newStatus);
      toast.success(`Đã ${label} tài khoản thành công`);
      fetchUsers();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Không thể cập nhật trạng thái');
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Xác nhận xóa vĩnh viễn tài khoản "${user.hoTen}"?\nHành động này không thể hoàn tác.`)) return;
    try {
      await userService.delete(user.user_id);
      toast.success('Xóa tài khoản thành công');
      fetchUsers();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Không thể xóa tài khoản');
    }
  };

  const handleModalSuccess = () => {
    setShowEditModal(false);
    setEditUser(null);
    fetchUsers();
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Main Modal ── */}
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>

          {/* Header */}
          <div className={styles.modalHeader}>
            <h3 className={styles.modalTitle}>
              Danh sách người dùng —&nbsp;
              <span className={styles.roleName}>{role.ten_vai_tro}</span>
              <span className={styles.totalBadge}>{role.so_nguoi_dung} thành viên</span>
            </h3>
            <button className={styles.closeBtn} onClick={onClose}>
              <HiOutlineXMark />
            </button>
          </div>

          {/* Body */}
          <div className={styles.modalBody}>

            {/* Search */}
            {!loading && !error && users.length > 0 && (
              <div className={styles.searchContainer}>
                <HiOutlineMagnifyingGlass className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo mã số định danh, họ tên, email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={styles.searchInput}
                />
              </div>
            )}

            {/* States */}
            {loading ? (
              <div className={styles.loadingContainer}>
                <div className={styles.spinner} />
                <p>Đang tải danh sách người dùng...</p>
              </div>
            ) : error ? (
              <div className={styles.errorContainer}>
                <HiOutlineExclamationCircle className={styles.errorIcon} />
                <p>{error}</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className={styles.noUsers}>
                <HiOutlineUserGroup className={styles.emptyIcon} />
                <p>
                  {users.length === 0
                    ? 'Không có người dùng nào thuộc vai trò này.'
                    : 'Không tìm thấy người dùng phù hợp với từ khóa.'}
                </p>
              </div>
            ) : (
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>STT</th>
                      <th>Mã định danh</th>
                      <th>Họ tên</th>
                      <th>Email</th>
                      <th>Trạng thái</th>
                      <th>Ngày tham gia</th>
                      {!isAdminRole && <th>Hành động</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user, idx) => {
                      const badge    = getStatusBadge(user.trangThai);
                      const isLocked = normalizeStatus(user.trangThai) === 'KHOA';
                      return (
                        <tr key={user.user_id || user.id || idx}>
                          <td className={styles.colStt}>{idx + 1}</td>
                          <td><span className={styles.userId}>{user.id || '—'}</span></td>
                          <td><span className={styles.userName}>{user.hoTen || '—'}</span></td>
                          <td><span className={styles.userEmail}>{user.email || '—'}</span></td>
                          <td>
                            <StatusBadge status={badge.status} label={badge.label} size="sm" />
                          </td>
                          <td className={styles.colDate}>{formatDate(user.createdAt)}</td>

                          {!isAdminRole && (
                            <td>
                              <div className={styles.actionsCell}>
                                {/* Xem chi tiết */}
                                <button
                                  className={styles.actionBtn}
                                  title="Xem chi tiết"
                                  onClick={() => handleViewDetail(user)}
                                >
                                  <HiOutlineEye />
                                </button>

                                {/* Chỉnh sửa */}
                                <button
                                  className={`${styles.actionBtn} ${styles.actionEdit}`}
                                  title="Chỉnh sửa"
                                  onClick={() => handleOpenEdit(user)}
                                >
                                  <HiOutlinePencilSquare />
                                </button>

                                {/* Khoá / Mở khoá */}
                                <button
                                  className={`${styles.actionBtn} ${isLocked ? styles.actionUnlock : styles.actionLock}`}
                                  title={isLocked ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
                                  onClick={() => handleToggleStatus(user)}
                                >
                                  {isLocked ? <HiOutlineLockOpen /> : <HiOutlineLockClosed />}
                                </button>

                                {/* Xóa */}
                                <button
                                  className={`${styles.actionBtn} ${styles.actionDelete}`}
                                  title="Xóa tài khoản"
                                  onClick={() => handleDelete(user)}
                                >
                                  <HiOutlineTrash />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className={styles.modalFooter}>
            {!loading && !error && (
              <span className={styles.footerCount}>
                {filteredUsers.length !== users.length
                  ? `Hiển thị ${filteredUsers.length} / ${users.length} người dùng`
                  : `Tổng cộng ${users.length} người dùng`}
              </span>
            )}
            <Button variant="outline" size="small" onClick={onClose}>
              Đóng
            </Button>
          </div>
        </div>
      </div>

      {/* ── User Detail Drawer ── */}
      {selectedUser && (
        <UserDetailDrawer
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onEdit={(u) => {
            setSelectedUser(null);
            setEditUser(u);
            setShowEditModal(true);
          }}
          isAdmin
        />
      )}

      {/* ── Create/Edit User Modal ── */}
      <CreateEditUserModal
        isOpen={showEditModal}
        user={editUser}
        onClose={() => {
          setShowEditModal(false);
          setEditUser(null);
        }}
        onSuccess={handleModalSuccess}
        isAdmin
        defaultTab="tat_ca"
      />
    </>
  );
};

export default UserListModal;
