import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { HiHeart } from 'react-icons/hi2';
import { message } from 'antd';
import Button from '@components/common/Button';
import useAuthStore from '@stores/authStore';
import donorService from '@services/donorService';
import styles from './DonorWallSection.module.scss';

/**
 * DonorCard Component - Card hiển thị thông tin nhà tài trợ
 */
const DonorCard = ({ donor, isFeatured = false }) => {
  const [avatarFailed, setAvatarFailed] = useState(false);
  const avatarUrl = donor.avatar || donor.logo;

  const getInitial = (name) => {
    if (!name || typeof name !== 'string') return '?';
    return name.charAt(0).toUpperCase();
  };

  const renderAvatar = () => {
    if (avatarUrl && !avatarFailed) {
      return (
        <img
          src={avatarUrl}
          alt={donor.name || donor.ten || 'Nhà tài trợ'}
          className={
            isFeatured
              ? styles.featuredDonorAvatarImage
              : styles.donorAvatarImage
          }
          loading="lazy"
          onError={() => setAvatarFailed(true)}
        />
      );
    }

    return (
      <div className={isFeatured ? styles.featuredAvatarLetter : styles.avatarLetter}>
        {getInitial(donor.name || donor.ten)}
      </div>
    );
  };

  return (
    <div className={`${styles.donorCard} ${isFeatured ? styles.featuredDonorCard : ''}`}>
      <div className={styles.cardContent}>
        {isFeatured && <span className={styles.featuredBadge}>⭐ TOP 1 NHÀ TÀI TRỢ</span>}
        {renderAvatar()}
        <h3 className={styles.donorName}>{donor.name || donor.ten || 'Nhà tài trợ'}</h3>
        {donor.desc && <p className={styles.donorDesc}>{donor.desc}</p>}
        <div className={styles.donorAmount}>
          {donor.totalAmount?.toLocaleString('vi-VN') || '0'} VNĐ
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
        
        // Gộp tất cả donors từ 3 tiers
        const allDonors = [
          ...(data.diamond || []),
          ...(data.gold || []),
          ...(data.silver || [])
        ];
        
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
        message.info('Vui lòng đăng ký tài khoản để trở thành nhà tài trợ');
      }
      return;
    }

    // Case 2: Đã đăng nhập với role_id = 4 (Người dùng)
    if (user?.vaiTro === 4) {
      // Kiểm tra loai_tai_khoan
      const accountType = user?.loaiTaiKhoan || user?.loai_tai_khoan;
      
      if (accountType === 'NHA_TAI_TRO') {
        // Đúng là nhà tài trợ → Navigate đến trang tạo đơn tài trợ
        // TODO: Cần tạo trang này (ví dụ: /donor/create-donation)
        message.success('Chuyển đến trang tạo khoản tài trợ');
        navigate('/donor/create-donation');
      } else {
        // Không phải nhà tài trợ → Thông báo
        message.warning('Tài khoản của bạn không phải là tài khoản nhà tài trợ. Vui lòng liên hệ quản trị viên để được hỗ trợ.');
      }
      return;
    }

    // Case 3: Đã đăng nhập với role khác (Staff: 1, 2, 3)
    message.info('Tính năng này dành cho nhà tài trợ. Vui lòng đăng nhập bằng tài khoản nhà tài trợ.');
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
          <div className={styles.label}>GHI NHẬN ĐÓNG GÓP</div>
          <h2 className={styles.title}>Bảng Vàng Nhà Tài Trợ</h2>
          <p className={styles.description}>
            Tri ân những cá nhân và tổ chức đã đồng hành cùng TVU Fund 
            trong hành trình hỗ trợ sinh viên.
          </p>
        </div>

        {/* Top 6 Donors - 2 Columns (Featured on Left, Grid on Right) */}
        {topDonors.length > 0 ? (
          <div className={styles.donorLayout}>
            {/* Top 1 Featured Donor */}
            <div className={styles.featuredSection}>
              <DonorCard donor={topDonors[0]} isFeatured={true} />
            </div>

            {/* Other Donors Grid */}
            <div className={styles.otherDonorsGrid}>
              {topDonors.slice(1).map((donor, index) => (
                <DonorCard 
                  key={donor.id || index} 
                  donor={donor}
                  isFeatured={false}
                />
              ))}
            </div>
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
              <h3 className={styles.ctaTitle}>Trở thành Nhà Tài Trợ</h3>
              <p className={styles.ctaDesc}>
                Đồng hành cùng chúng tôi trong việc hỗ trợ sinh viên TVU
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
