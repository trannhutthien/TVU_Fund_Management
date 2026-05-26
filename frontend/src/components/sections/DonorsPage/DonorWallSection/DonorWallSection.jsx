import { useState, useEffect } from 'react';
import { 
  HiOutlineSparkles, 
  HiOutlineStar,
  HiOutlineTrophy,
  HiOutlineBuildingOffice2
} from 'react-icons/hi2';
import StatusBadge from '@components/common/StatusBadge';
import Logo from '@components/common/Logo';
import donorService from '@services/donorService';
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
const DiamondCard = ({ donor }) => {
  return (
    <div className={styles.diamondCard}>
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
const GoldCard = ({ donor }) => {
  return (
    <div className={styles.goldCard}>
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
const SilverCard = ({ donor }) => {
  return (
    <div className={styles.silverCard}>
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
const DonorWallSection = () => {
  const [loading, setLoading] = useState(true);
  const [donorsData, setDonorsData] = useState({
    diamond: [],
    gold: [],
    silver: []
  });

  useEffect(() => {
    const fetchDonors = async () => {
      try {
        setLoading(true);
        const data = await donorService.getDonorWall();
        setDonorsData({
          diamond: data.diamond || [],
          gold: data.gold || [],
          silver: data.silver || []
        });
      } catch (error) {
        console.error('Error fetching donors:', error);
        setDonorsData({
          diamond: [],
          gold: [],
          silver: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDonors();
  }, []);

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

  const hasDonors = donorsData.diamond.length > 0 || 
                    donorsData.gold.length > 0 || 
                    donorsData.silver.length > 0;

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

        {!hasDonors ? (
          <div className={styles.emptyState}>
            <HiOutlineBuildingOffice2 className={styles.emptyIcon} />
            <p>Chưa có dữ liệu nhà tài trợ</p>
          </div>
        ) : (
          <>
            {/* Tier 1 & 2: Diamond + Gold */}
            {(donorsData.diamond.length > 0 || donorsData.gold.length > 0) && (
              <div className={styles.topTierRow}>
                {/* Diamond Tier */}
                {donorsData.diamond.length > 0 && (
                  <div className={styles.diamondSection}>
                    {donorsData.diamond.map((donor) => (
                      <DiamondCard key={donor.id} donor={donor} />
                    ))}
                  </div>
                )}

                {/* Gold Tier */}
                {donorsData.gold.length > 0 && (
                  <div className={styles.goldSection}>
                    {donorsData.gold.map((donor) => (
                      <GoldCard key={donor.id} donor={donor} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tier 3: Silver */}
            {donorsData.silver.length > 0 && (
              <div className={styles.silverSection}>
                {donorsData.silver.map((donor) => (
                  <SilverCard key={donor.id} donor={donor} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default DonorWallSection;
