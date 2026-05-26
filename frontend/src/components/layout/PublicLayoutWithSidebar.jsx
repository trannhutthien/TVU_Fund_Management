import { Outlet } from 'react-router-dom';
import StaffSidebar from '@components/layout/StaffSidebar';
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
        <Outlet />
      </div>
    </div>
  );
};

export default PublicLayoutWithSidebar;
