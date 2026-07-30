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
    label: 'Sinh viên',
    icon: HiOutlineAcademicCap,
    description: 'Đang học tại trường',
    color: '#3b82f6',
  },
  {
    key: 'can_bo_truong',
    label: 'Cán bộ trong trường',
    icon: HiOutlineBriefcase,
    description: 'Giáo viên, nhân viên đang công tác',
    color: '#10b981',
  },
  {
    key: 'can_bo_nghi_huu',
    label: 'Cán bộ về hưu',
    icon: HiOutlineUserGroup,
    description: 'Đã nghỉ hưu, còn quyền nộp đơn',
    color: '#f59e0b',
  },
  {
    key: 'nha_khoa_hoc',
    label: 'Nhà khoa học',
    icon: HiOutlineBeaker,
    description: 'Nghiên cứu viên, giảng viên',
    color: '#8b5cf6',
  },
];

const UserRoleSection = ({ selectedRole, onSelect, disabled }) => {
  return (
    <div className={styles.card}>
      <div className={styles.sectionTitle}>
        <span className={styles.stepBadge}>Phần 1B</span>
        <span>Bạn là ai?</span>
      </div>
      <p className={styles.sectionDesc}>
        Chọn vai trò của bạn để hiển thị biểu mẫu phù hợp
      </p>

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
              <div className={styles.roleLabel}>{role.label}</div>
              <div className={styles.roleDesc}>{role.description}</div>
              {isSelected && <div className={styles.roleCheck}>✓</div>}
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
