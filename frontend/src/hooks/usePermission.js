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

    const userRole = user.VaiTro;

    return {
      // Application permissions
      canCreateApplication: userRole === ROLES.STUDENT,
      canViewApplication: true, // All roles can view
      canApproveLevel1: userRole === ROLES.TEACHER,
      canApproveLevel2: [ROLES.ACADEMIC_STAFF, ROLES.ADMIN].includes(userRole),
      canApproveLevel3: userRole === ROLES.ACCOUNTANT,
      canRejectApplication: [
        ROLES.TEACHER, 
        ROLES.ACADEMIC_STAFF, 
        ROLES.ADMIN, 
        ROLES.ACCOUNTANT
      ].includes(userRole),

      // Fund permissions
      canCreateFund: [ROLES.ADMIN, ROLES.ACCOUNTANT].includes(userRole),
      canEditFund: [ROLES.ADMIN, ROLES.ACCOUNTANT].includes(userRole),
      canDeleteFund: userRole === ROLES.ADMIN,
      canViewFund: true, // All roles can view

      // Donation permissions
      canCreateDonation: [ROLES.ADMIN, ROLES.ACCOUNTANT].includes(userRole),
      canEditDonation: [ROLES.ADMIN, ROLES.ACCOUNTANT].includes(userRole),
      canDeleteDonation: userRole === ROLES.ADMIN,
      canViewDonation: true,

      // User management permissions
      canCreateUser: userRole === ROLES.ADMIN,
      canEditUser: userRole === ROLES.ADMIN,
      canDeleteUser: userRole === ROLES.ADMIN,
      canViewUsers: [ROLES.ADMIN, ROLES.ACADEMIC_STAFF].includes(userRole),
      canAssignRole: userRole === ROLES.ADMIN,

      // Transaction permissions
      canViewAllTransactions: [ROLES.ADMIN, ROLES.ACCOUNTANT].includes(userRole),
      canViewOwnTransactions: true,

      // Dashboard permissions
      canViewAdminDashboard: userRole === ROLES.ADMIN,
      canViewAccountantDashboard: userRole === ROLES.ACCOUNTANT,
      canViewTeacherDashboard: userRole === ROLES.TEACHER,
      canViewAcademicDashboard: userRole === ROLES.ACADEMIC_STAFF,
      canViewStudentDashboard: userRole === ROLES.STUDENT,

      // Report permissions
      canViewReports: [ROLES.ADMIN, ROLES.ACCOUNTANT, ROLES.ACADEMIC_STAFF].includes(userRole),
      canExportReports: [ROLES.ADMIN, ROLES.ACCOUNTANT].includes(userRole),
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
