import { Outlet } from 'react-router-dom';
import StaffSidebar from '@components/layout/StaffSidebar';
import PageAccessGuard from '@components/auth/PageAccessGuard';
import styles from './PublicLayoutWithSidebar.module.scss';

/**
 * PublicLayoutWithSidebar Component
 * 
 * Wrapper layout cho các trang public
 * Tự động hiển thị StaffSidebar nếu user có vaiTro 1, 2, 3
 * Sidebar tự return null nếu không cần thiết
 */
const PublicLayoutWithSidebar = () => {
  return (
    <div className={styles.layoutWrapper}>
      <StaffSidebar />
      <div className={styles.mainContent}>
        <PageAccessGuard>
          <Outlet />
        </PageAccessGuard>
      </div>
    </div>
  );
};

export default PublicLayoutWithSidebar;
