import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
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
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  useEffect(() => {
    const handleToggleSidebar = () => {
      toggleSidebar();
    };
    const handleCloseSidebar = () => {
      closeSidebar();
    };

    window.addEventListener('tvu:toggle-staff-sidebar', handleToggleSidebar);
    window.addEventListener('tvu:close-staff-sidebar', handleCloseSidebar);
    return () => {
      window.removeEventListener('tvu:toggle-staff-sidebar', handleToggleSidebar);
      window.removeEventListener('tvu:close-staff-sidebar', handleCloseSidebar);
    };
  }, []);

  useEffect(() => {
    closeSidebar();
  }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        closeSidebar();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={styles.layoutWrapper}>
      {isSidebarOpen && (
        <div
          className={styles.sidebarOverlay}
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}
      <StaffSidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
      <div className={styles.mainContent}>
        <PageAccessGuard>
          <Outlet />
        </PageAccessGuard>
      </div>
    </div>
  );
};

export default PublicLayoutWithSidebar;
