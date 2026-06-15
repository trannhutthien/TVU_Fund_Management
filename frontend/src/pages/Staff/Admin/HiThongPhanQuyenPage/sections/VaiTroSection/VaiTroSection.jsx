import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  HiOutlineShieldCheck,
  HiOutlineClipboardDocumentCheck,
  HiOutlineBanknotes,
  HiOutlineUsers,
  HiOutlinePencilSquare,
} from 'react-icons/hi2';
import Button from '@components/common/Button/Button';
import StatusBadge from '@components/common/StatusBadge/StatusBadge';
import api from '@services/api';
import EditVaiTroModal from './EditVaiTroModal/EditVaiTroModal';
import styles from './VaiTroSection.module.scss';

const ROLE_CONFIG = {
  1: {
    label: 'Quản trị viên',
    color: '#7c3aed',
    bg: 'rgba(124,58,237,0.10)',
    icon: HiOutlineShieldCheck,
    desc: 'Toàn quyền hệ thống — quản lý người dùng, quỹ, phê duyệt cấp cao',
  },
  2: {
    label: 'Giáo vụ',
    color: 'var(--color-primary, #1a2f5e)',
    bg: 'rgba(26,47,94,0.08)',
    icon: HiOutlineClipboardDocumentCheck,
    desc: 'Xét duyệt hồ sơ hỗ trợ, quản lý quỹ, ghi nhận tài trợ, báo cáo',
  },
  3: {
    label: 'Kế toán',
    color: '#0891b2',
    bg: 'rgba(8,145,178,0.10)',
    icon: HiOutlineBanknotes,
    desc: 'Xác nhận thu tiền, giải ngân, đối soát chứng từ, thống kê tài chính',
  },
  4: {
    label: 'Người dùng',
    color: 'var(--color-gold, #f0a500)',
    bg: 'rgba(240,165,0,0.10)',
    icon: HiOutlineUsers,
    desc: 'Sinh viên (nộp đơn hỗ trợ) và Nhà tài trợ (tạo khoản tài trợ)',
  },
};

const VaiTroSection = () => {
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingRole, setEditingRole] = useState(null);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const response = await api.get('/vaitro?include_user_count=true');
      if (response.data?.success) {
        setRoles(response.data.roles);
      } else {
        toast.error('Không thể lấy danh sách vai trò');
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
      toast.error('Lỗi khi tải dữ liệu vai trò');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  if (loading && roles.length === 0) {
    return (
      <div className={styles.loadingState}>
        <div className={styles.spinner}></div>
        <p>Đang tải danh sách vai trò...</p>
      </div>
    );
  }

  return (
    <div className={styles.section}>
      <header className={styles.sectionHeader}>
        <div>
          <h2 className={styles.sectionTitle}>Danh sách vai trò</h2>
          <p className={styles.sectionSub}>
            Xem danh sách các vai trò hoạt động trong hệ thống và cấu hình mô tả của từng vai trò
          </p>
        </div>
      </header>

      <div className={styles.grid}>
        {roles.map((role) => {
          const config = ROLE_CONFIG[role.role_id] || {
            label: role.ten_vai_tro,
            color: '#64748b',
            bg: 'rgba(100,116,139,0.1)',
            icon: HiOutlineUsers,
            desc: role.mo_ta || 'Vai trò hệ thống',
          };
          const Icon = config.icon;
          const isAdminRole = role.role_id === 1;

          // Status details for StatusBadge
          const isHoatDong = role.trang_thai === 'HOAT_DONG';
          const badgeStatus = isHoatDong ? 'approved' : 'processing';
          const badgeLabel = isHoatDong ? 'Hoạt động' : 'Tạm dừng';

          // Editable roles: Only role_id 2 and 3 are editable as per requirements
          const canEdit = role.role_id === 2 || role.role_id === 3;

          return (
            <div
              key={role.role_id}
              className={`${styles.card} ${isAdminRole ? styles.adminCard : ''}`}
            >
              <div className={styles.cardHeader}>
                <div className={styles.roleInfo}>
                  <div className={styles.iconWrapper} style={{ backgroundColor: config.bg }}>
                    <Icon className={styles.roleIcon} style={{ color: config.color }} />
                  </div>
                  <div>
                    <h3 className={styles.roleName}>{config.label}</h3>
                    <span className={styles.technicalName}>({role.ten_vai_tro})</span>
                  </div>
                </div>
                <StatusBadge status={badgeStatus} label={badgeLabel} />
              </div>

              <p className={styles.roleDesc}>{role.mo_ta || config.desc}</p>

              {/* Stats Grid */}
              <div className={styles.statsGrid}>
                <div className={styles.statBox}>
                  <div className={styles.statLabel}>Tổng người dùng</div>
                  <div className={styles.statValNavy}>{role.so_nguoi_dung}</div>
                </div>
                <div className={styles.statBox}>
                  <div className={styles.statLabel}>Đang hoạt động</div>
                  <div className={styles.statValGreen}>{role.so_hoat_dong}</div>
                </div>
                <div className={styles.statBox}>
                  <div className={styles.statLabel}>Bị khóa</div>
                  <div className={styles.statValGray}>
                    {role.so_nguoi_dung - role.so_hoat_dong}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className={styles.cardFooter}>
                <Button
                  variant="ghost"
                  size="small"
                  className={styles.viewUsersBtn}
                  onClick={() => navigate(`/admin/users?role_id=${role.role_id}`)}
                >
                  <HiOutlineUsers className={styles.btnIcon} />
                  <span>Xem người dùng</span>
                </Button>

                {canEdit && (
                  <Button
                    variant="outline"
                    size="small"
                    className={styles.editBtn}
                    onClick={() => setEditingRole(role)}
                  >
                    <HiOutlinePencilSquare className={styles.btnIcon} />
                    <span>Chỉnh sửa</span>
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {editingRole && (
        <EditVaiTroModal
          role={editingRole}
          onClose={() => setEditingRole(null)}
          onSuccess={() => {
            setEditingRole(null);
            fetchRoles();
          }}
        />
      )}
    </div>
  );
};

export default VaiTroSection;
