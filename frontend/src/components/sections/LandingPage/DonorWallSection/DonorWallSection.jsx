import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { HiHeart } from 'react-icons/hi2';
import { toast } from 'react-toastify';
import Button from '@components/common/Button';
import Logo from '@components/common/Logo';
import useAuthStore from '@stores/authStore';
import { useSystemSettings } from '@hooks/useSystemSettings';
import donorService from '@services/donorService';
import { formatCurrency } from '@utils/formatters';
import styles from './DonorWallSection.module.scss';

/**
 * DonorCard Component - Card hiển thị thông tin nhà tài trợ
 */
const DonorCard = ({ donor, onClick }) => {
  const getInitial = (name) => {
    if (!name || typeof name !== 'string') return '?';
    return name.charAt(0).toUpperCase();
  };

  const renderAvatar = () => {
    // Nếu có avatar URL, dùng Logo component với imageSrc
    if (donor.avatar || donor.logo) {
      return (
        <Logo
          size="xl"
          variant="icon-only"
          imageVariant="circular"
          imageSrc={donor.avatar || donor.logo}
          imageAlt={donor.name || donor.ten || 'Nhà tài trợ'}
          className={styles.donorLogo}
        />
      );
    }

    // Nếu không có avatar, hiển thị chữ cái đầu trong circle
    return (
      <div className={styles.avatarLetter}>
        {getInitial(donor.name || donor.ten)}
      </div>
    );
  };

  const handleKeyDown = (event) => {
    if (!onClick) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className={styles.donorCard}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`Xem trang đối tác nhà tài trợ ${donor.name || donor.ten || ''}`.trim()}
    >
      <div className={styles.cardContent}>
        {renderAvatar()}
        <h3 className={styles.donorName}>{donor.name || donor.ten || 'Nhà tài trợ'}</h3>
        {donor.desc && <p className={styles.donorDesc}>{donor.desc}</p>}
        <div className={styles.donorAmount}>
          {formatCurrency(donor.totalAmount)}
        </div>
      </div>
    </div>
  );
};

/**
 * DonorWallSection Component
 * 
 * Section vinh danh các nhà tài trợ và tổ chức đã đóng góp
 * Hiển thị top 6 nhà tài trợ có số tiền đóng góp lớn nhất
 * Dữ liệu lấy từ API backend
 * 
 * @param {function} onRegisterClick - Callback để mở form đăng ký
 */
const DonorWallSection = ({ onRegisterClick }) => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const { settings } = useSystemSettings();
  const [loading, setLoading] = useState(true);
  const [topDonors, setTopDonors] = useState([]);
  const [tickerDonors, setTickerDonors] = useState([]);

  // Fetch donors data từ API
  useEffect(() => {
    const fetchDonors = async () => {
      try {
        setLoading(true);
        const data = await donorService.getDonorWall();
        
        if (!data || typeof data !== 'object') {
          setTopDonors([]);
          setTickerDonors([]);
          return;
        }
        
        // Lấy danh sách donors từ flat list
        const allDonors = data.donors || [];
        
        // Map data để đảm bảo có field name
        const mappedDonors = allDonors.map(donor => ({
          ...donor,
          name: donor.ten || donor.name,
          avatar: donor.logo || donor.avatar
        }));
        
        // Lấy top 6 nhà tài trợ có số tiền lớn nhất
        const sortedDonors = mappedDonors
          .sort((a, b) => (b.totalAmount || 0) - (a.totalAmount || 0))
          .slice(0, 6);
        
        setTopDonors(sortedDonors);
        
        // Ticker hiển thị tên tất cả nhà tài trợ
        const allDonorNames = mappedDonors.map(d => d.name || 'Nhà tài trợ');
        setTickerDonors(allDonorNames);
      } catch (error) {
        console.error('Error fetching donors:', error);
        setTopDonors([]);
        setTickerDonors([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDonors();
  }, []);

  // Handle "Liên hệ hợp tác" button click
  const handleContactClick = () => {
    // Case 1: Chưa đăng nhập → Mở form đăng ký
    if (!isAuthenticated) {
      if (onRegisterClick) {
        onRegisterClick();
      } else {
        toast.info('Vui lòng đăng ký tài khoản để trở thành nhà tài trợ');
      }
      return;
    }

    // Case 2: Đã đăng nhập với role_id = 4 (Người dùng)
    if (user?.vaiTro === 4) {
      // Kiểm tra loai_tai_khoan
      const accountType = user?.loaiTaiKhoan || user?.loai_tai_khoan;
      
      if (accountType === 'NHA_TAI_TRO') {
        toast.info('Tính năng tạo khoản tài trợ đang được phát triển. Vui lòng liên hệ quản trị viên để được hỗ trợ.');
      } else {
        toast.warning('Tài khoản của bạn không phải là tài khoản nhà tài trợ. Vui lòng liên hệ quản trị viên để được hỗ trợ.');
      }
      return;
    }

    // Case 3: Đã đăng nhập với role khác (Staff: 1, 2, 3)
    toast.info('Tính năng này dành cho nhà tài trợ. Vui lòng đăng nhập bằng tài khoản nhà tài trợ.');
  };

  // Loading state
  if (loading) {
    return (
      <section className={styles.donorWallSection}>
        <div className={styles.container}>
          <div className={styles.header}>
            <div className={styles.label}>GHI NHẬN ĐÓNG GÓP</div>
            <h2 className={styles.title}>Bảng Vàng Nhà Tài Trợ</h2>
            <p className={styles.description}>Đang tải dữ liệu...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.donorWallSection}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.label}>{settings?.donor_wall_label || 'GHI NHẬN ĐÓNG GÓP'}</div>
          <h2 className={styles.title}>{settings?.donor_wall_title || 'Bảng Vàng Nhà Tài Trợ'}</h2>
          <p className={styles.description}>
            {settings?.donor_wall_description || 'Tri ân những cá nhân và tổ chức đã đồng hành cùng TVU Fund trong hành trình hỗ trợ sinh viên.'}
          </p>
        </div>

        {/* Top 6 Donors - Grid đều */}
        {topDonors.length > 0 ? (
          <div className={styles.donorsGrid}>
            {topDonors.map((donor, index) => (
              <DonorCard 
                key={donor.id || index} 
                donor={donor}
                onClick={() => navigate('/donors')}
              />
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <p>Chưa có dữ liệu nhà tài trợ</p>
          </div>
        )}

        {/* Ticker - Tất cả nhà tài trợ (xoay vòng) */}
        <div className={styles.tickerSection}>
          <div className={styles.tickerHeader}>
            <HiHeart className={styles.tickerHeaderIcon} />
            <span>Cảm ơn sự đóng góp của</span>
          </div>
          <div className={styles.tickerTrack}>
            <div className={styles.tickerContent}>
              {tickerDonors.length > 0 ? (
                tickerDonors.map((name, index) => (
                  <span key={index} className={styles.tickerItem}>
                    {name}
                  </span>
                ))
              ) : (
                <span className={styles.tickerItem}>Đang tải...</span>
              )}
            </div>
            <div className={styles.tickerContent} aria-hidden="true">
              {tickerDonors.length > 0 ? (
                tickerDonors.map((name, index) => (
                  <span key={`dup-${index}`} className={styles.tickerItem}>
                    {name}
                  </span>
                ))
              ) : (
                <span className={styles.tickerItem}>Đang tải...</span>
              )}
            </div>
          </div>
        </div>

        {/* CTA Banner */}
        <div className={styles.ctaBanner}>
          <div className={styles.ctaContent}>
            <div className={styles.ctaText}>
              <h3 className={styles.ctaTitle}>{settings?.donor_wall_cta_title || 'Trở thành Nhà Tài Trợ'}</h3>
              <p className={styles.ctaDesc}>
                {settings?.donor_wall_cta_desc || 'Đồng hành cùng chúng tôi trong việc hỗ trợ sinh viên TVU'}
              </p>
            </div>
            <div className={styles.ctaAction}>
              <Button 
                variant="primary" 
                size="lg"
                onClick={handleContactClick}
              >
                Liên hệ hợp tác →
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

DonorWallSection.propTypes = {
  onRegisterClick: PropTypes.func,
};

export default DonorWallSection;
