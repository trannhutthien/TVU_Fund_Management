import { useRef } from 'react';
import PropTypes from 'prop-types';
import ProfileHeader from '../shared/ProfileHeader';
import PersonalInfoSection from '../student/sections/PersonalInfoSection';
import DonorOverviewSection from './sections/DonorOverviewSection';
import DonationHistorySection from './sections/DonationHistorySection';
import styles from './DonorProfile.module.scss';

/**
 * DonorProfile Component
 * 
 * Profile dành cho Nhà tài trợ (NHA_TAI_TRO)
 * Sections:
 * - PersonalInfoSection (shared - thông tin tổ chức)
 * - DonorOverviewSection (thống kê quyên góp)
 * - DonationHistorySection (lịch sử quyên góp)
 */
const DonorProfile = ({ user, onLogout }) => {
  const personalInfoRef = useRef(null);

  const handleEdit = () => {
    personalInfoRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSavePersonalInfo = (infoData) => {
    console.log('Save donor info:', infoData);
  };

  return (
    <div className={styles.donorProfile}>
      <ProfileHeader
        user={user}
        onEdit={handleEdit}
        onLogout={onLogout}
      />

      <div className={styles.sectionsContainer}>
        <div ref={personalInfoRef}>
          <PersonalInfoSection
            user={user}
            onSave={handleSavePersonalInfo}
          />
        </div>

        <DonorOverviewSection
          tongSoTienQuyenGop={0}
          soLanQuyenGop={0}
          hangNhaTaiTro={null}
        />

        <DonationHistorySection />
      </div>
    </div>
  );
};

DonorProfile.propTypes = {
  user: PropTypes.object,
  onLogout: PropTypes.func.isRequired,
};

export default DonorProfile;
