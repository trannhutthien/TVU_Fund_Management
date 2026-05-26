import { Outlet } from 'react-router-dom';
import PublicHeader from '@components/layout/PublicHeader';
import StaffSidebar from '@components/layout/StaffSidebar';
import styles from './StaffLayout.module.scss';

/**
 * StaffLayout Component
 * 
 * Layout cho staff (Admin, Cán bộ Quỹ, Kế toán)
 * Bao gồm:
 * - PublicHeader (top)
 * - StaffSidebar (left) - tự ẩn nếu role_id = 4
 * - Main content (right)
 */
const StaffLayout = () => {
  return (
    <div className={`${styles.staffLayout} staff-app-shell`}>
      {/* Header */}
      <PublicHeader />

      {/* Page Body: Sidebar + Content */}
      <div className={styles.pageBody}>
        {/* Sidebar - tự return null nếu role_id = 4 */}
        <StaffSidebar />

        {/* Main Content */}
        <main className={styles.mainContent}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StaffLayout;
