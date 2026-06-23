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

const ALL_FILTER = 'Tất cả';

const normalizeLoaiQuyName = (fund) =>
  fund?.loaiquy?.tenLoai ||
  fund?.loaiquy?.tenloai ||
  fund?.tenLoaiQuy ||
  fund?.loaiQuy ||
  '';

const getUniqueLoaiQuyNames = (items = []) =>
  Array.from(
    new Set(
      items
        .map((item) => item?.tenLoai || item?.tenloai || item?.ten_loai)
        .filter(Boolean)
    )
  );

/**
 * FundsPage - Trang Danh Mục Quỹ
 * 
 * Hiển thị danh sách các quỹ hỗ trợ sinh viên
 */
const FundsPage = () => {
  const [activeFilter, setActiveFilter] = useState(ALL_FILTER);
  const [filterCategories, setFilterCategories] = useState([ALL_FILTER]);
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

  // Fetch funds from API
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
          // Map API response to component format
          const mappedFunds = fundsResponse.funds.map((fund) => {
            const tenLoaiQuy = normalizeLoaiQuyName(fund);

            return {
              quy_id: fund.quyId,
              ten_quy: fund.tenQuy,
              loai_quy: tenLoaiQuy,
              ma_loai_quy: fund.loaiquy?.maLoai || fund.loaiQuy,
              hinh_anh: fund.hinhAnh,
              mo_ta: fund.moTa,
              so_du: fund.soDu,
              so_du_thuc_te: fund.soDuThucTe, // Số dư thực tế sau khi trừ các khoản chờ giải ngân
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

          const loaiQuyNames = getUniqueLoaiQuyNames(loaiQuyResponse?.data);
          const fallbackNames = Array.from(
            new Set(mappedFunds.map((fund) => fund.loai_quy).filter(Boolean))
          );

          setFunds(mappedFunds);
          setFilterCategories([
            ALL_FILTER,
            ...(loaiQuyNames.length > 0 ? loaiQuyNames : fallbackNames),
          ]);
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

  // Handle ESC key to close modal
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

  // Handle search
  const handleSearch = (keyword) => {
    setSearchKeyword(keyword);
  };

  // Handle sort change
  const handleSortChange = (sort) => {
    setSortValue(sort);
  };

  // Handle filter change
  const handleFilterChange = (category) => {
    setActiveFilter(category);
  };

  // Filter funds based on active filter and search keyword
  const getFilteredFunds = () => {
    let filtered = [...funds];

    // Filter by category
    if (activeFilter !== ALL_FILTER) {
      filtered = filtered.filter(fund => fund.loai_quy === activeFilter);
    }

    // Filter by search keyword
    if (searchKeyword) {
      filtered = filtered.filter(fund =>
        fund.ten_quy.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        (fund.mo_ta && fund.mo_ta.toLowerCase().includes(searchKeyword.toLowerCase()))
      );
    }

    // Sort
    switch (sortValue) {
      case 'newest':
        // Already sorted by ngay_tao DESC from API
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
            onFilterChange={handleFilterChange}
            activeFilter={activeFilter}
            filterCategories={filterCategories}
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

      {/* Login Modal */}
      {isLoginModalOpen && (
        <div className="login-modal-overlay" onClick={closeLoginModal}>
          <div className="login-modal-content" onClick={(e) => e.stopPropagation()}>
            <LoginForm 
              onSuccess={closeLoginModal}
              onClose={closeLoginModal}
            />
          </div>
        </div>
      )}

      {/* Register Modal */}
      {isRegisterModalOpen && (
        <div className="register-modal-overlay" onClick={closeRegisterModal}>
          <div className="register-modal-content" onClick={(e) => e.stopPropagation()}>
            <RegisterForm 
              onSuccess={closeRegisterModal}
              onClose={closeRegisterModal}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FundsPage;
