import PropTypes from 'prop-types';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiRss,
  HiIdentification,
  HiBanknotes,
  HiCheckBadge,
  HiGift,
  HiXCircle,
  HiUserPlus,
  HiCircleStack,
} from 'react-icons/hi2';
import Button from '@components/common/Button';
import styles from './AdminActivitySection.module.scss';

// ═══════════════════════════════════════════════════════════════════════════════
// ─── ADMIN ACTIVITY SECTION ────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
// CÔNG DỤNG: Hiển thị feed hoạt động gần đây + danh sách nhân viên hệ thống
// ═══════════════════════════════════════════════════════════════════════════════

const ACTIVITY_TYPES = {
  giai_ngan: {
    icon: HiBanknotes,
    bgColor: 'rgba(22,163,74,0.12)',
    iconColor: '#16a34a',
    category: 'nghiep_vu',
  },
  duyet_don: {
    icon: HiCheckBadge,
    bgColor: 'rgba(26,47,94,0.10)',
    iconColor: '#1a2f5e',
    category: 'nghiep_vu',
  },
  tai_tro: {
    icon: HiGift,
    bgColor: 'rgba(240,165,0,0.12)',
    iconColor: '#f0a500',
    category: 'nghiep_vu',
  },
  tu_choi: {
    icon: HiXCircle,
    bgColor: 'rgba(239,68,68,0.10)',
    iconColor: '#ef4444',
    category: 'nghiep_vu',
  },
  dang_ky: {
    icon: HiUserPlus,
    bgColor: 'rgba(59,130,246,0.10)',
    iconColor: '#3b82f6',
    category: 'he_thong',
  },
  tao_quy: {
    icon: HiCircleStack,
    bgColor: 'rgba(168,85,247,0.10)',
    iconColor: '#a855f7',
    category: 'he_thong',
  },
};

const ROLE_BADGES = {
  1: { label: 'Admin', bgColor: 'rgba(168,85,247,0.12)', color: '#9333ea' },
  2: { label: 'Kế toán', bgColor: 'rgba(240,165,0,0.12)', color: '#b45309' },
  3: { label: 'Cán bộ', bgColor: 'rgba(26,47,94,0.10)', color: '#1a2f5e' },
};

const AdminActivitySection = ({ activityData = [], staffData = [] }) => {
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState('all');

  // ─── GET RELATIVE TIME ─────────────────────────────────────────────────────
  const getRelativeTime = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now - time;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays === 1) return 'Hôm qua';
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return time.toLocaleDateString('vi-VN');
  };

  // ─── FILTER ACTIVITIES ─────────────────────────────────────────────────────
  const filteredActivities = activityData.filter((activity) => {
    if (selectedFilter === 'all') return true;
    const activityType = ACTIVITY_TYPES[activity.type];
    return activityType?.category === selectedFilter;
  });

  // ─── GET AVATAR INITIALS ───────────────────────────────────────────────────
  const getInitials = (name) => {
    if (!name) return '?';
    const words = name.trim().split(' ');
    if (words.length >= 2) {
      return words[words.length - 2][0] + words[words.length - 1][0];
    }
    return name[0];
  };

  // ─── RENDER ACTIVITY ICON ──────────────────────────────────────────────────
  const renderActivityIcon = (type) => {
    const config = ACTIVITY_TYPES[type];
    if (!config) return null;

    const IconComponent = config.icon;
    return (
      <div
        className={styles.activityIcon}
        style={{ background: config.bgColor }}
      >
        <IconComponent size={18} style={{ color: config.iconColor }} />
      </div>
    );
  };

  // ─── RENDER ACTIVITY MESSAGE ───────────────────────────────────────────────
  const renderActivityMessage = (message) => {
    // Parse HTML-like message with <strong> and <span class="amount">
    // Replace <strong> with styled span and <span class="amount"> with styled span
    const styledMessage = message
      .replace(/<strong>/g, '<span style="font-weight: 700; color: var(--color-primary);">')
      .replace(/<\/strong>/g, '</span>')
      .replace(/<span class="amount">/g, '<span style="font-weight: 700; color: var(--color-gold);">')
      .replace(/<\/span>/g, '</span>');

    return (
      <div
        className={styles.activityMessage}
        dangerouslySetInnerHTML={{ __html: styledMessage }}
      />
    );
  };

  // ─── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div className={styles.section}>
      {/* Section Title */}
      <div className={styles.sectionTitle}>
        <div className={styles.titleBar} />
        <h2>Hoạt động & Nhân viên</h2>
      </div>

      {/* Grid */}
      <div className={styles.grid}>
        {/* Left Column - Activity Feed */}
        <div className={styles.feedCard}>
          {/* Header */}
          <div className={styles.feedHeader}>
            <div className={styles.feedHeaderLeft}>
              <HiRss size={18} />
              <span className={styles.feedTitle}>Hoạt động gần đây</span>
            </div>
            <div className={styles.filterChips}>
              <button
                className={selectedFilter === 'all' ? styles.chipActive : ''}
                onClick={() => setSelectedFilter('all')}
              >
                Tất cả
              </button>
              <button
                className={selectedFilter === 'nghiep_vu' ? styles.chipActive : ''}
                onClick={() => setSelectedFilter('nghiep_vu')}
              >
                Nghiệp vụ
              </button>
              <button
                className={selectedFilter === 'he_thong' ? styles.chipActive : ''}
                onClick={() => setSelectedFilter('he_thong')}
              >
                Hệ thống
              </button>
            </div>
          </div>

          {/* Feed List */}
          <div className={styles.feedList}>
            {filteredActivities.length === 0 ? (
              <div className={styles.emptyState}>Chưa có hoạt động nào</div>
            ) : (
              filteredActivities.map((activity) => (
                <div key={activity.id} className={styles.activityItem}>
                  {/* Icon */}
                  {renderActivityIcon(activity.type)}

                  {/* Content */}
                  <div className={styles.activityContent}>
                    {renderActivityMessage(activity.message)}
                    <div className={styles.activitySubText}>{activity.subText}</div>
                  </div>

                  {/* Time */}
                  <div className={styles.activityTime}>
                    {getRelativeTime(activity.time)}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className={styles.feedFooter}>
            <Button
              variant="ghost"
              onClick={() => navigate('/admin/hoat-dong')}
            >
              Xem lịch sử đầy đủ
            </Button>
          </div>
        </div>

        {/* Right Column - Staff List */}
        <div className={styles.staffCard}>
          {/* Header */}
          <div className={styles.staffHeader}>
            <div className={styles.staffHeaderLeft}>
              <HiIdentification size={18} />
              <span className={styles.staffTitle}>Nhân viên hệ thống</span>
            </div>
            <div className={styles.staffBadge}>{staffData.length} nhân viên</div>
          </div>

          {/* Staff List */}
          <div className={styles.staffList}>
            {staffData.length === 0 ? (
              <div className={styles.emptyState}>Chưa có nhân viên</div>
            ) : (
              staffData.map((staff) => {
                const roleBadge = ROLE_BADGES[staff.role_id];
                return (
                  <div key={staff.id} className={styles.staffItem}>
                    {/* Avatar */}
                    <div className={styles.staffAvatar}>
                      {staff.avatar ? (
                        <img src={staff.avatar} alt={staff.ho_ten} />
                      ) : (
                        <span>{getInitials(staff.ho_ten)}</span>
                      )}
                    </div>

                    {/* Info */}
                    <div className={styles.staffInfo}>
                      <div className={styles.staffName}>{staff.ho_ten}</div>
                      <div className={styles.staffLastActive}>
                        Hoạt động lần cuối:{' '}
                        {new Date(staff.last_active).toLocaleDateString('vi-VN')}
                      </div>
                    </div>

                    {/* Role Badge */}
                    {roleBadge && (
                      <div
                        className={styles.roleBadge}
                        style={{
                          background: roleBadge.bgColor,
                          color: roleBadge.color,
                        }}
                      >
                        {roleBadge.label}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className={styles.staffFooter}>
            <Button
              variant="ghost"
              onClick={() => navigate('/admin/users')}
            >
              Quản lý nhân viên →
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

AdminActivitySection.propTypes = {
  activityData: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      type: PropTypes.string.isRequired,
      message: PropTypes.string.isRequired,
      subText: PropTypes.string,
      time: PropTypes.string.isRequired,
    })
  ),
  staffData: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      ho_ten: PropTypes.string.isRequired,
      role_id: PropTypes.number.isRequired,
      avatar: PropTypes.string,
      last_active: PropTypes.string.isRequired,
    })
  ),
};

export default AdminActivitySection;
