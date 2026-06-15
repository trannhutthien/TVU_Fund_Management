import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import PublicHeader from '@components/layout/PublicHeader';
import StaffSidebar from '@components/layout/StaffSidebar';
import PageAccessGuard from '@components/auth/PageAccessGuard';
import styles from './StaffLayout.module.scss';

/**
 * StaffLayout Component
 *
 * Layout cho staff (Admin, Cán bộ Quỹ, Kế toán)
 * Bao gồm:
 * - PublicHeader (top) – nhận onToggleSidebar để điều khiển sidebar mobile
 * - StaffSidebar (left) – tự ẩn nếu role_id = 4, slide-in trên mobile
 * - Overlay backdrop – đóng sidebar khi click ra ngoài trên mobile
 * - Main content (right)
 */
const StaffLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    console.log('[StaffLayout] Toggle sidebar - Before:', isSidebarOpen);
    setIsSidebarOpen((prev) => {
      console.log('[StaffLayout] Toggle sidebar - After:', !prev);
      return !prev;
    });
  };
  
  const closeSidebar = () => {
    console.log('[StaffLayout] Close sidebar');
    setIsSidebarOpen(false);
  };

  // Log state changes
  useEffect(() => {
    console.log('[StaffLayout] isSidebarOpen changed:', isSidebarOpen);
  }, [isSidebarOpen]);

  // Đóng sidebar khi resize về desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={`${styles.staffLayout} staff-app-shell`}>
      {/* Header – truyền callback toggle sidebar */}
      <PublicHeader onToggleSidebar={toggleSidebar} />

      {/* Page Body: Sidebar + Content */}
      <div className={styles.pageBody}>
        {/* Overlay backdrop – chỉ hiện trên mobile khi sidebar mở */}
        {isSidebarOpen && (
          <div
            className={styles.sidebarOverlay}
            onClick={closeSidebar}
            aria-hidden="true"
          />
        )}

        {/* Sidebar – nhận isOpen + onClose để xử lý mobile toggle */}
        <StaffSidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

        {/* Main Content */}
        <main className={styles.mainContent}>
          <PageAccessGuard>
            <Outlet />
          </PageAccessGuard>
        </main>
      </div>
    </div>
  );
};

export default StaffLayout;
