import { useState, useEffect } from 'react';
import { 
  HiOutlineSparkles, 
  HiOutlineStar,
  HiOutlineTrophy,
  HiOutlineBuildingOffice2,
  HiOutlineUser
} from 'react-icons/hi2';
import StatusBadge from '@components/common/StatusBadge';
import Logo from '@components/common/Logo';
import donorService from '@services/donorService';
import NhaTaiTroDetailDrawer from '@pages/Staff/CanBo/NhaTaiTroPage/NhaTaiTroDetailDrawer/NhaTaiTroDetailDrawer';
import styles from './DonorWallSection.module.scss';

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Get tier icon component
 */
const getTierIcon = (tier) => {
  switch (tier) {
    case 'diamond':
      return <HiOutlineSparkles className={styles.tierIcon} />;
    case 'gold':
      return <HiOutlineStar className={styles.tierIcon} />;
    case 'silver':
      return <HiOutlineTrophy className={styles.tierIcon} />;
    default:
      return null;
  }
};

/**
 * Format fund types summary
 */
const formatFundTypes = (cacQuyHoTro) => {
  if (!cacQuyHoTro || cacQuyHoTro.length === 0) {
    return 'Chưa có thông tin';
  }
  
  return cacQuyHoTro
    .map(quy => `${quy.loaiQuy} (${quy.soLuong})`)
    .join(', ');
};

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTS - Card components cho từng tier
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * DiamondCard - Card lớn cho đối tác Kim cương
 */
const DiamondCard = ({ donor, onClick }) => {
  return (
    <div className={styles.diamondCard} onClick={onClick} style={{ cursor: 'pointer' }}>
      {/* Tier Icon */}
      <div className={styles.tierBadge}>
        {getTierIcon('diamond')}
      </div>

      {/* Avatar */}
      <div className={styles.avatarWrapper}>
        <Logo
          size="xl"
          variant="icon-only"
          imageVariant="circular"
          imageSrc={donor.logo}
          imageAlt={donor.ten}
        />
      </div>

      {/* Content */}
      <div className={styles.cardContent}>
        <div className={styles.tierLabel}>{donor.tenHienThi}</div>
        <h3 className={styles.donorName}>{donor.ten}</h3>
        
        {donor.moTa && (
          <p className={styles.donorDesc}>{donor.moTa}</p>
        )}

        <div className={styles.statsRow}>
          <div className={styles.statItem}>
            <div className={styles.statLabel}>Tổng đóng góp</div>
            <div className={styles.statValue}>
              {donor.totalAmount?.toLocaleString('vi-VN')} VNĐ
            </div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statLabel}>Số quỹ hỗ trợ</div>
            <div className={styles.statValue}>{donor.soQuyHoTro || 0}</div>
          </div>
        </div>

        {donor.cacQuyHoTro && donor.cacQuyHoTro.length > 0 && (
          <div className={styles.fundTypes}>
            <div className={styles.fundTypesLabel}>Các loại quỹ:</div>
            <div className={styles.fundTypesList}>
              {formatFundTypes(donor.cacQuyHoTro)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * GoldCard - Card vừa cho nhà tài trợ Vàng
 */
const GoldCard = ({ donor, onClick }) => {
  return (
    <div className={styles.goldCard} onClick={onClick} style={{ cursor: 'pointer' }}>
      {/* Tier Icon */}
      <div className={styles.tierBadge}>
        {getTierIcon('gold')}
      </div>

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
        <div className={styles.tierLabel}>{donor.tenHienThi}</div>
        <h3 className={styles.donorName}>{donor.ten}</h3>
        
        {donor.moTa && (
          <p className={styles.donorDesc}>{donor.moTa}</p>
        )}

        <div className={styles.statsRow}>
          <div className={styles.statItem}>
            <div className={styles.statLabel}>Đóng góp</div>
            <div className={styles.statValue}>
              {donor.totalAmount?.toLocaleString('vi-VN')} VNĐ
            </div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statLabel}>Quỹ</div>
            <div className={styles.statValue}>{donor.soQuyHoTro || 0}</div>
          </div>
        </div>

        {donor.cacQuyHoTro && donor.cacQuyHoTro.length > 0 && (
          <div className={styles.fundTypes}>
            <div className={styles.fundTypesLabel}>Loại quỹ:</div>
            <div className={styles.fundTypesList}>
              {formatFundTypes(donor.cacQuyHoTro)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * SilverCard - Card nhỏ cho nhà tài trợ Bạc
 */
const SilverCard = ({ donor, onClick }) => {
  return (
    <div className={styles.silverCard} onClick={onClick} style={{ cursor: 'pointer' }}>
      {/* Tier Icon */}
      <div className={styles.tierBadge}>
        {getTierIcon('silver')}
      </div>

      {/* Avatar */}
      <div className={styles.avatarWrapper}>
        <Logo
          size="md"
          variant="icon-only"
          imageVariant="circular"
          imageSrc={donor.logo}
          imageAlt={donor.ten}
        />
      </div>

      {/* Content */}
      <div className={styles.cardContent}>
        <div className={styles.tierLabel}>{donor.tenHienThi}</div>
        <h3 className={styles.donorName}>{donor.ten}</h3>
        
        <div className={styles.statsRow}>
          <div className={styles.statItem}>
            <div className={styles.statValue}>
              {donor.totalAmount?.toLocaleString('vi-VN')} VNĐ
            </div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>{donor.soQuyHoTro || 0} quỹ</div>
          </div>
        </div>
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
 * Section hiển thị bảng vàng nhà tài trợ theo 3 tier:
 * - Kim cương (Diamond): ≥100M
 * - Vàng (Gold): 50M-100M
 * - Bạc (Silver): <50M
 * 
 * Dữ liệu lấy từ API backend
 */
const DonorWallSection = ({ donorsData = { diamond: [], gold: [], silver: [] }, loading = true }) => {
  const [activeTab, setActiveTab] = useState('doi-tac'); // 'doi-tac' or 'nha-tai-tro'
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

  // Filter donor arrays based on activeTab
  const filteredDiamond = donorsData.diamond.filter((donor) =>
    activeTab === 'doi-tac'
      ? donor.loai === 'To chuc' || donor.loai === 'Doanh nghiep'
      : donor.loai === 'Ca nhan'
  );

  const filteredGold = donorsData.gold.filter((donor) =>
    activeTab === 'doi-tac'
      ? donor.loai === 'To chuc' || donor.loai === 'Doanh nghiep'
      : donor.loai === 'Ca nhan'
  );

  const filteredSilver = donorsData.silver.filter((donor) =>
    activeTab === 'doi-tac'
      ? donor.loai === 'To chuc' || donor.loai === 'Doanh nghiep'
      : donor.loai === 'Ca nhan'
  );

  const hasFilteredDonors =
    filteredDiamond.length > 0 ||
    filteredGold.length > 0 ||
    filteredSilver.length > 0;

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
              Đối tác (Tổ chức & Doanh nghiệp)
            </button>
            <button
              className={`${styles.navTab} ${activeTab === 'nha-tai-tro' ? styles.navTabActive : ''}`}
              onClick={() => setActiveTab('nha-tai-tro')}
            >
              <HiOutlineUser className={styles.tabIcon} />
              Nhà tài trợ (Cá nhân)
            </button>
          </div>
        </div>

        {!hasFilteredDonors ? (
          <div className={styles.emptyState}>
            <HiOutlineBuildingOffice2 className={styles.emptyIcon} />
            <p>Chưa có dữ liệu {activeTab === 'doi-tac' ? 'đối tác' : 'nhà tài trợ'}</p>
          </div>
        ) : (
          <>
            {/* Diamond Tier */}
            {filteredDiamond.length > 0 && (
              <div className={styles.diamondSection}>
                {filteredDiamond.map((donor) => (
                  <DiamondCard key={donor.id} donor={donor} onClick={() => setSelectedSponsor(donor)} />
                ))}
              </div>
            )}

            {/* Gold Tier */}
            {filteredGold.length > 0 && (
              <div className={styles.goldSection}>
                {filteredGold.map((donor) => (
                  <GoldCard key={donor.id} donor={donor} onClick={() => setSelectedSponsor(donor)} />
                ))}
              </div>
            )}

            {/* Tier 3: Silver */}
            {filteredSilver.length > 0 && (
              <div className={styles.silverSection}>
                {filteredSilver.map((donor) => (
                  <SilverCard key={donor.id} donor={donor} onClick={() => setSelectedSponsor(donor)} />
                ))}
              </div>
            )}
          </>
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
