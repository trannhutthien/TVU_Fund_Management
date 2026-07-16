import { useMemo } from 'react';
import useAuthStore from '@stores/authStore';
import { ROLES } from '@constants/roles';

/**
 * Custom Hook - usePermission
 * Kiểm tra quyền truy cập của user
 * 
 * @returns {Object} Permission utilities
 */
const usePermission = () => {
  const { user, hasRole } = useAuthStore();

  // Check if user has specific role
  const checkRole = (role) => {
    return hasRole(role);
  };

  // Check if user has any of the roles
  const hasAnyRole = (roles) => {
    return hasRole(roles);
  };

  // Permission checks
  const permissions = useMemo(() => {
    if (!user) return {};

    const userRole = user.VaiTro || user.vaiTro;

    return {
      // Application permissions
      canCreateApplication: userRole === ROLES.SINH_VIEN,
      canViewApplication: true,
      canApproveLevel1: userRole === ROLES.CAN_BO_QUY,
      canApproveLevel2: userRole === ROLES.ADMIN,
      canApproveLevel3: userRole === ROLES.KE_TOAN,
      canRejectApplication: [ROLES.CAN_BO_QUY, ROLES.ADMIN, ROLES.KE_TOAN].includes(userRole),

      // Fund permissions
      canCreateFund: [ROLES.ADMIN, ROLES.CAN_BO_QUY].includes(userRole),
      canEditFund: [ROLES.ADMIN, ROLES.CAN_BO_QUY].includes(userRole),
      canDeleteFund: userRole === ROLES.ADMIN,
      canViewFund: true,

      // Donation permissions
      canCreateDonation: [ROLES.ADMIN, ROLES.CAN_BO_QUY].includes(userRole),
      canEditDonation: [ROLES.ADMIN, ROLES.KE_TOAN].includes(userRole),
      canDeleteDonation: userRole === ROLES.ADMIN,
      canViewDonation: true,

      // User management permissions
      canCreateUser: userRole === ROLES.ADMIN,
      canEditUser: userRole === ROLES.ADMIN,
      canDeleteUser: userRole === ROLES.ADMIN,
      canViewUsers: [ROLES.ADMIN, ROLES.CAN_BO_QUY, ROLES.BAN_KIEM_SOAT].includes(userRole),
      canAssignRole: userRole === ROLES.ADMIN,

      // Transaction permissions
      canViewAllTransactions: [ROLES.ADMIN, ROLES.KE_TOAN, ROLES.BAN_KIEM_SOAT].includes(userRole),
      canViewOwnTransactions: true,

      // Dashboard permissions
      canViewAdminDashboard: userRole === ROLES.ADMIN,
      canViewAccountantDashboard: userRole === ROLES.KE_TOAN,
      canViewStaffDashboard: userRole === ROLES.CAN_BO_QUY,
      canViewStudentDashboard: userRole === ROLES.SINH_VIEN,

      // Report permissions
      canViewReports: [ROLES.ADMIN, ROLES.KE_TOAN, ROLES.CAN_BO_QUY, ROLES.BAN_KIEM_SOAT].includes(userRole),
      canExportReports: [ROLES.ADMIN, ROLES.KE_TOAN].includes(userRole),
    };
  }, [user]);

  return {
    user,
    checkRole,
    hasAnyRole,
    ...permissions,
  };
};

export default usePermission;
