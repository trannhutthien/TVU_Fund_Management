import { useState } from 'react';
import { 
  HiOutlineBuildingOffice2,
  HiOutlineUser
} from 'react-icons/hi2';
import StatusBadge from '@components/common/StatusBadge';
import Logo from '@components/common/Logo';
import NhaTaiTroDetailDrawer from '@pages/Staff/CanBo/NhaTaiTroPage/NhaTaiTroDetailDrawer/NhaTaiTroDetailDrawer';
import { formatCurrency } from '@utils/formatters';
import styles from './DonorWallSection.module.scss';

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Format fund names summary
 */
const formatFundNames = (cacQuyHoTro) => {
  if (!cacQuyHoTro || cacQuyHoTro.length === 0) {
    return 'Chưa có thông tin';
  }
  
  return cacQuyHoTro
    .map(quy => quy.tenQuy || quy.ten_quy)
    .filter(Boolean)
    .join(', ');
};

// ═══════════════════════════════════════════════════════════════════════════════
// DONOR CARD - Card đồng đều cho tất cả nhà tài trợ
// ═══════════════════════════════════════════════════════════════════════════════

const DonorCard = ({ donor, onClick }) => {
  return (
    <div className={styles.donorCard} onClick={onClick} style={{ cursor: 'pointer' }}>
      {/* Avatar */}
      <div className={styles.avatarWrapper}>
        <Logo
          size="lg"
          variant="icon-only"
          imageVariant="circular"
          imageSrc={donor.logo}
          imageAlt={donor.ten}
        />
      </div>

      {/* Content */}
      <div className={styles.cardContent}>
        <h3 className={styles.donorName}>{donor.ten}</h3>
        
        <div className={styles.statsRow}>
          <div className={styles.statItem}>
            <div className={styles.statLabel}>Tổng đóng góp</div>
            <div className={styles.statValue}>
              {formatCurrency(donor.totalAmount)}
            </div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statLabel}>Số quỹ</div>
            <div className={styles.statValue}>{donor.soQuyHoTro || 0}</div>
          </div>
        </div>

        {donor.cacQuyHoTro && donor.cacQuyHoTro.length > 0 && (
          <div className={styles.fundTypes}>
            <div className={styles.fundTypesLabel}>Các quỹ đã tài trợ:</div>
            <div className={styles.fundTypesList}>
              {formatFundNames(donor.cacQuyHoTro)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * DonorWallSection Component
 * 
 * Section hiển thị bảng vàng nhà tài trợ
 * Dữ liệu lấy từ API backend (flat list, sắp xếp theo tổng đóng góp)
 */
const DonorWallSection = ({ donorsData = { donors: [] }, loading = true }) => {
  const [activeTab, setActiveTab] = useState('doi-tac');
  const [selectedSponsor, setSelectedSponsor] = useState(null);

  if (loading) {
    return (
      <section className={styles.donorWallSection}>
        <div className={styles.container}>
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <h2 className={styles.title}>Bảng vàng Nhà tài trợ</h2>
              <p className={styles.description}>Đang tải dữ liệu...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Filter donors based on activeTab
  const donors = donorsData.donors || [];
  const filteredDonors = donors.filter((donor) =>
    activeTab === 'doi-tac'
      ? donor.loai === 'Doi tac'
      : donor.loai !== 'Doi tac'
  );

  return (
    <section className={styles.donorWallSection}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h2 className={styles.title}>Bảng vàng Nhà tài trợ</h2>
            <p className={styles.description}>
              Các đối tác là nền tảng cho sứ mệnh của chúng tôi. 
              Chúng tôi trân trọng sự cam kết của quý vị đối với sự nghiệp 
              giáo dục và phúc lợi sinh viên.
            </p>
          </div>
          <div className={styles.headerRight}>
            <StatusBadge 
              status="approved" 
              text="ĐỐI TÁC ƯU TÚ"
              className={styles.partnerBadge}
            />
          </div>
        </div>

        {/* Tab Navigation */}
        <div className={styles.tabContainer}>
          <div className={styles.tabNavigation}>
            <button
              className={`${styles.navTab} ${activeTab === 'doi-tac' ? styles.navTabActive : ''}`}
              onClick={() => setActiveTab('doi-tac')}
            >
              <HiOutlineBuildingOffice2 className={styles.tabIcon} />
              Đối tác
            </button>
            <button
              className={`${styles.navTab} ${activeTab === 'nha-tai-tro' ? styles.navTabActive : ''}`}
              onClick={() => setActiveTab('nha-tai-tro')}
            >
              <HiOutlineUser className={styles.tabIcon} />
              Nhà tài trợ
            </button>
          </div>
        </div>

        {filteredDonors.length === 0 ? (
          <div className={styles.emptyState}>
            <HiOutlineBuildingOffice2 className={styles.emptyIcon} />
            <p>Chưa có dữ liệu {activeTab === 'doi-tac' ? 'đối tác' : 'nhà tài trợ'}</p>
          </div>
        ) : (
          <div className={styles.donorsGrid}>
            {filteredDonors.map((donor) => (
              <DonorCard 
                key={donor.id} 
                donor={donor} 
                onClick={() => setSelectedSponsor(donor)} 
              />
            ))}
          </div>
        )}
      </div>

      {/* Detail Drawer for Public Visitors */}
      {selectedSponsor && (
        <NhaTaiTroDetailDrawer
          sponsor={{ nha_tai_tro_id: selectedSponsor.id, ...selectedSponsor }}
          onClose={() => setSelectedSponsor(null)}
          isPublic={true}
        />
      )}
    </section>
  );
};

export default DonorWallSection;
