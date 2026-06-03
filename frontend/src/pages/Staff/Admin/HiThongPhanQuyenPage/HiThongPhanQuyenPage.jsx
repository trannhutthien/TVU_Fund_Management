import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  HiOutlineShieldCheck,
  HiOutlineLockClosed,
  HiOutlineIdentification,
  HiOutlineKey,
  HiOutlineClipboardDocumentList,
  HiOutlineCog6Tooth,
} from 'react-icons/hi2';
import VaiTroSection from './sections/VaiTroSection/VaiTroSection';
import PhanQuyenMatrixSection from './sections/PhanQuyenMatrixSection/PhanQuyenMatrixSection';
import NhatKySection from './sections/NhatKySection/NhatKySection';
import CaiDatSection from './sections/CaiDatSection/CaiDatSection';
import styles from './HiThongPhanQuyenPage.module.scss';

const TABS = [
  { id: 'vai_tro', icon: HiOutlineIdentification, label: 'Quản lý vai trò' },
  { id: 'phan_quyen', icon: HiOutlineKey, label: 'Ma trận phân quyền' },
  { id: 'nhat_ky', icon: HiOutlineClipboardDocumentList, label: 'Nhật ký hệ thống' },
  { id: 'cai_dat', icon: HiOutlineCog6Tooth, label: 'Cài đặt' },
];

const HiThongPhanQuyenPage = () => {
  const location = useLocation();
  const getInitialTab = () => {
    if (location.state && location.state.tab) {
      return location.state.tab;
    }
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam && TABS.some(t => t.id === tabParam)) {
      return tabParam;
    }
    return 'vai_tro';
  };
  const [activeTab, setActiveTab] = useState(getInitialTab);

  useEffect(() => {
    if (location.state && location.state.tab) {
      setActiveTab(location.state.tab);
    } else {
      const params = new URLSearchParams(location.search);
      const tabParam = params.get('tab');
      if (tabParam && TABS.some(t => t.id === tabParam)) {
        setActiveTab(tabParam);
      }
    }
  }, [location]);

  return (
    <div className={styles.container}>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <span>Trang chủ</span>
        <span className={styles.divider}>/</span>
        <span className={styles.active}>Hệ thống & Phân quyền</span>
      </div>

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.iconBox}>
            <HiOutlineShieldCheck className={styles.shieldIcon} />
          </div>
          <div>
            <h1 className={styles.title}>Hệ thống & Phân quyền</h1>
            <p className={styles.description}>
              Quản lý vai trò, phân quyền và nhật ký hoạt động hệ thống
            </p>
          </div>
        </div>

        <div className={styles.adminBadge}>
          <HiOutlineLockClosed size={12} />
          <span>Chỉ Admin</span>
        </div>
      </header>

      {/* Tab bar */}
      <div className={styles.tabBar}>
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${styles.tabBtn} ${isActive ? styles.activeTab : ''}`}
            >
              <Icon className={styles.tabIcon} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content Sections */}
      <div className={styles.tabContent}>
        {activeTab === 'vai_tro' && <VaiTroSection />}
        {activeTab === 'phan_quyen' && <PhanQuyenMatrixSection />}
        {activeTab === 'nhat_ky' && <NhatKySection />}
        {activeTab === 'cai_dat' && <CaiDatSection />}
      </div>
    </div>
  );
};

export default HiThongPhanQuyenPage;
