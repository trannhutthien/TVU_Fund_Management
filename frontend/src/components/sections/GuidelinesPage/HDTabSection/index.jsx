import PropTypes from 'prop-types';
import { 
  HiOutlineAcademicCap, 
  HiOutlineHandRaised, 
  HiOutlineDocumentText 
} from 'react-icons/hi2';
import styles from './HDTabSection.module.scss';

const TABS = [
  { 
    id: 'sinh_vien', 
    icon: HiOutlineAcademicCap, 
    label: 'Dành cho Sinh viên', 
    count: '4 bước' 
  },
  { 
    id: 'nha_tai_tro', 
    icon: HiOutlineHandRaised, 
    label: 'Dành cho Nhà tài trợ', 
    count: '3 bước' 
  },
  { 
    id: 'quy_dinh', 
    icon: HiOutlineDocumentText, 
    label: 'Quy định & Chính sách', 
    count: '5 mục' 
  },
];

const HDTabSection = ({ activeTab, setActiveTab }) => {
  return (
    <section className={styles.hdTabSection}>
      <div className={styles.container}>
        <div className={styles.tabs}>
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                className={`${styles.tab} ${isActive ? styles.tabActive : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon className={styles.tabIcon} />
                <span className={styles.tabLabel}>{tab.label}</span>
                <span className={styles.tabCount}>{tab.count}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

HDTabSection.propTypes = {
  activeTab: PropTypes.string.isRequired,
  setActiveTab: PropTypes.func.isRequired,
};

export default HDTabSection;
