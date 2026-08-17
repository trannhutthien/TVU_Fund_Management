import { memo } from 'react';
import PropTypes from 'prop-types';
import {
  HiOutlineAcademicCap,
  HiOutlineBriefcase,
  HiOutlineUserGroup,
  HiOutlineBeaker,
} from 'react-icons/hi2';
import styles from './UserRoleSection.module.scss';

const ROLES = [
  {
    key: 'sinh_vien',
    label: 'Sinh vien',
    icon: HiOutlineAcademicCap,
    description: 'Dang theo hoc tai truong',
    detail: 'Ban dang tung ngay lon len cung mai truong nay',
    color: '#3b82f6',
  },
  {
    key: 'can_bo_truong',
    label: 'Can bo giang vien',
    icon: HiOutlineBriefcase,
    description: 'Giao vien, nhan vien dang cong tac',
    detail: 'Nguoi da va dang dong gianh cho su nghiep giao duc',
    color: '#10b981',
  },
  {
    key: 'can_bo_nghi_huu',
    label: 'Can bo nghi huu',
    icon: HiOutlineUserGroup,
    description: 'Da nghi huu, van luon nho ngoi truong',
    detail: 'Tinh yeu voi truong van luon trong tim',
    color: '#f59e0b',
  },
  {
    key: 'nha_khoa_hoc',
    label: 'Nha khoa hoc',
    icon: HiOutlineBeaker,
    description: 'Nghien cuu vien, giang vien, chuyen gia',
    detail: 'Mang tri thuc den cho cong dong',
    color: '#8b5cf6',
  },
];

const UserRoleSection = ({ selectedRole, onSelect, disabled }) => {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <span className={styles.stepBadge}>Phan 1B</span>
        </div>
        <h3 className={styles.title}>Vai tro cua ban</h3>
        <p className={styles.subtitle}>
          Hay cho chung toi biet ban la ai de cung tao nen dieu y nghia
        </p>
      </div>

      <div className={styles.roleGrid}>
        {ROLES.map((role) => {
          const Icon = role.icon;
          const isSelected = selectedRole === role.key;
          return (
            <button
              key={role.key}
              type="button"
              className={`${styles.roleCard} ${isSelected ? styles.roleCardSelected : ''}`}
              onClick={() => onSelect(role.key)}
              disabled={disabled}
              style={{ '--role-color': role.color }}
            >
              <div className={styles.roleIconWrap}>
                <Icon className={styles.roleIcon} />
              </div>
              <div className={styles.roleContent}>
                <div className={styles.roleLabel}>{role.label}</div>
                <div className={styles.roleDesc}>{role.description}</div>
                <div className={styles.roleDetail}>{role.detail}</div>
              </div>
              {isSelected && (
                <div className={styles.roleCheck}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

UserRoleSection.propTypes = {
  selectedRole: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

export default memo(UserRoleSection);
