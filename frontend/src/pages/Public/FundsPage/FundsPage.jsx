import { useState, useEffect } from 'react';
import PublicHeader from '@components/layout/PublicHeader/PublicHeader';
import PublicFooter from '@components/layout/PublicFooter/PublicFooter';
import BackgroundImage from '@components/common/BackgroundImage';
import FundTitleSection from '@components/sections/FundsPage/FundTitleSection';
import FundSelectSection from '@components/sections/FundsPage/FundSelectSection';
import FundGridSection from '@components/sections/FundsPage/FundGridSection';
import LoginForm from '@components/forms/LoginForm';
import RegisterForm from '@components/forms/RegisterForm';
import { getAllLoaiQuy, getPublicFunds } from '@services/fundService';
import styles from './FundsPage.module.scss';

const normalizeLoaiQuyName = (fund) =>
  fund?.loaiquy?.tenLoai ||
  fund?.loaiquy?.tenloai ||
  fund?.tenLoaiQuy ||
  fund?.loaiQuy ||
  '';

const FundsPage = () => {
  const [activeMaLoai, setActiveMaLoai] = useState(null);
  const [loaiQuyData, setLoaiQuyData] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [sortValue, setSortValue] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [funds, setFunds] = useState([]);
  const [error, setError] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);
  
  const openRegisterModal = () => setIsRegisterModalOpen(true);
  const closeRegisterModal = () => setIsRegisterModalOpen(false);

  const switchToRegister = () => {
    setIsLoginModalOpen(false);
    setIsRegisterModalOpen(true);
  };

  const switchToLogin = () => {
    setIsRegisterModalOpen(false);
    setIsLoginModalOpen(true);
  };

  useEffect(() => {
    const fetchFunds = async () => {
      try {
        setLoading(true);
        setError(null);
        const [fundsResponse, loaiQuyResponse] = await Promise.all([
          getPublicFunds(),
          getAllLoaiQuy(),
        ]);
        
        if (fundsResponse.success) {
          const mappedFunds = fundsResponse.funds.map((fund) => {
            const tenLoaiQuy = normalizeLoaiQuyName(fund);

            return {
              quy_id: fund.quyId,
              ten_quy: fund.tenQuy,
              loai_quy: tenLoaiQuy,
              ma_loai_quy: fund.loaiquy?.maLoai || fund.loaiQuy,
              nhom_loai_quy: fund.loaiquy?.nhom || '',
              hinh_anh: fund.hinhAnh,
              mo_ta: fund.moTa,
              so_du: fund.soDu,
              so_du_thuc_te: fund.soDuThucTe,
              trang_thai: fund.trangThai,
              so_tien_toi_thieu: fund.soTienToiThieu,
              so_tien_toi_da: fund.soTienToiDa,
              so_luong_chi_tieu: fund.soLuongChiTieu,
              han_nop_don: fund.hanNopDon,
              ngay_bat_dau: fund.ngayBatDau,
              ngay_ket_thuc: fund.ngayKetThuc || fund.hanNopDon,
              dieu_kien_tom_tat: fund.dieuKienTomTat,
              so_don_da_nop: fund.soDonDaNop,
              phan_tram_da_nhan: fund.phanTramDaNhan,
            };
          });

          setFunds(mappedFunds);
          setLoaiQuyData(loaiQuyResponse?.data || []);
        } else {
          setError('Không thể tải danh sách quỹ');
        }
      } catch (err) {
        console.error('Error fetching funds:', err);
        setError('Lỗi kết nối đến server');
      } finally {
        setLoading(false);
      }
    };

    fetchFunds();
  }, []);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        if (isLoginModalOpen) closeLoginModal();
        if (isRegisterModalOpen) closeRegisterModal();
      }
    };

    if (isLoginModalOpen || isRegisterModalOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isLoginModalOpen, isRegisterModalOpen]);

  const handleSearch = (keyword) => {
    setSearchKeyword(keyword);
  };

  const handleSortChange = (sort) => {
    setSortValue(sort);
  };

  const handleMaLoaiChange = (maLoai) => {
    setActiveMaLoai(maLoai);
  };

  const getFilteredFunds = () => {
    let filtered = [...funds];

    if (activeMaLoai) {
      filtered = filtered.filter(fund => fund.ma_loai_quy === activeMaLoai);
    }

    if (searchKeyword) {
      filtered = filtered.filter(fund =>
        fund.ten_quy.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        (fund.mo_ta && fund.mo_ta.toLowerCase().includes(searchKeyword.toLowerCase()))
      );
    }

    switch (sortValue) {
      case 'newest':
        break;
      case 'oldest':
        filtered = [...filtered].reverse();
        break;
      case 'highest':
        filtered = [...filtered].sort((a, b) => b.so_du - a.so_du);
        break;
      case 'name':
        filtered = [...filtered].sort((a, b) => a.ten_quy.localeCompare(b.ten_quy, 'vi'));
        break;
      default:
        break;
    }

    return filtered;
  };

  return (
    <div className={styles.fundsPage}>
      <PublicHeader 
        onLoginClick={openLoginModal}
        onRegisterClick={openRegisterModal}
      />
      
      <BackgroundImage overlayType="dark">
        <main className={styles.mainContent}>
          <FundTitleSection />

          <FundSelectSection
            onSearch={handleSearch}
            onSortChange={handleSortChange}
            loaiQuyData={loaiQuyData}
            activeMaLoai={activeMaLoai}
            onMaLoaiChange={handleMaLoaiChange}
          />

          {error ? (
            <div className={styles.errorMessage}>
              <p>{error}</p>
            </div>
          ) : (
            <FundGridSection
              funds={getFilteredFunds()}
              loading={loading}
            />
          )}
        </main>
      </BackgroundImage>

      <PublicFooter />

      {isLoginModalOpen && (
        <div className="login-modal-overlay" onClick={closeLoginModal}>
          <div className="login-modal-content" onClick={(e) => e.stopPropagation()}>
            <LoginForm 
              onSuccess={closeLoginModal}
              onClose={closeLoginModal}
              onSwitchToRegister={switchToRegister}
            />
          </div>
        </div>
      )}

      {isRegisterModalOpen && (
        <div className="register-modal-overlay" onClick={closeRegisterModal}>
          <div className="register-modal-content" onClick={(e) => e.stopPropagation()}>
            <RegisterForm 
              onSuccess={closeRegisterModal}
              onClose={closeRegisterModal}
              onSwitchToLogin={switchToLogin}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FundsPage;
