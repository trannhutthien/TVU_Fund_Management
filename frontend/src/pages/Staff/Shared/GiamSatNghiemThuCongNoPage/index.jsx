import { useState } from 'react';
import { HiOutlineClipboardDocumentCheck, HiOutlineCurrencyDollar } from 'react-icons/hi2';
import { useAuth } from '@context/AuthContext';
import NghiemThuTab from './tabs/NghiemThuTab/index.jsx';
import CongNoTab from './tabs/CongNoTab/index.jsx';
import styles from './index.module.scss';

const TABS = [
  { key: 'nghiemthu', label: 'Nghiem thu', icon: HiOutlineClipboardDocumentCheck },
  { key: 'congno', label: 'Cong no', icon: HiOutlineCurrencyDollar },
];

const GiamSatNghiemThuCongNoPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('congno');

  const userRole = user?.roleId || user?.role_id || user?.vaiTro || user?.role?.id;

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <h1 className={styles.title}>Giam sat Nghiem thu & Cong no</h1>
          <span className={styles.subtitle}>
            Theo doi tien do nghiem thu va trang thai tra no cua cac hop dong vayvon / tai tro co thu hoi
          </span>
        </header>

        <div className={styles.tabBar}>
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                type="button"
                className={`${styles.tabBtn} ${activeTab === tab.key ? styles.tabBtnActive : ''}`}
                onClick={() => setActiveTab(tab.key)}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className={styles.tabContent}>
          {activeTab === 'nghiemthu' && <NghiemThuTab userRole={userRole} />}
          {activeTab === 'congno' && <CongNoTab userRole={userRole} />}
        </div>
      </div>
    </div>
  );
};

export default GiamSatNghiemThuCongNoPage;
