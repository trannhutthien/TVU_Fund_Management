import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PublicHeader from '@components/layout/PublicHeader/PublicHeader';
import PublicFooter from '@components/layout/PublicFooter/PublicFooter';
import HeroBanner from '@components/sections/LandingPage/HeroBanner';
import FundCard from '@components/common/Card/FundCard';
import LoginForm from '@components/forms/LoginForm';
import RegisterForm from '@components/forms/RegisterForm';
import { getAllLoaiQuy, getPublicFunds, getFundCountByGroup } from '@services/fundService';
import statisticsService from '@services/statisticsService';
import { useSystemSettings } from '@hooks/useSystemSettings';
import { HiMagnifyingGlass, HiChevronRight, HiOutlineBuildingLibrary, HiOutlineSquare3Stack3D, HiOutlineRocketLaunch } from 'react-icons/hi2';
import styles from './FundsPage.module.scss';

const ITEMS_PER_PAGE = 6;

// Helper function để tạo state object cho tất cả categories
const createCategoryState = (valueFactory) => ({});

const FundsPage = () => {
  const { settings } = useSystemSettings();
  const navigate = useNavigate();
  // Filter states
  const [activeCapDo, setActiveCapDo] = useState(null);
  const [activeTrangThai, setActiveTrangThai] = useState(null);
  const [activeLoaiQuy, setActiveLoaiQuy] = useState(null); // State mới cho filter loại quỹ
  const [searchKeyword, setSearchKeyword] = useState('');
  const [sortValue, setSortValue] = useState('newest');
  
  // Statistics state
  const [statistics, setStatistics] = useState({
    totalFunds: 0,
    supportedRequests: 0,
    totalFundAmount: 0
  });
  
  // Category-based states
  const [categories, setCategories] = useState([]); // Danh sách các loại quỹ động từ API
  const [categoryCounts, setCategoryCounts] = useState({});
  const [categoryPages, setCategoryPages] = useState({});
  const [categoryData, setCategoryData] = useState({});
  const [categoryTotals, setCategoryTotals] = useState({});
  const [categoryLoading, setCategoryLoading] = useState({});
  
  // General states
  const [initLoading, setInitLoading] = useState(true);
  const [countError, setCountError] = useState(null);
  const [loaiQuyData, setLoaiQuyData] = useState([]);
  
  // Modal states
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  
  // Request cancellation
  const filterRequestIdRef = useRef(0);

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

  // Fetch statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await statisticsService.getPublicStats();
        setStatistics({
          totalFunds: data.totalFunds || 0,
          supportedRequests: data.supportedRequests || 0,
          totalFundAmount: data.totalFundAmount || 0
        });
      } catch (error) {
        console.error('Error fetching statistics:', error);
      }
    };
    fetchStats();
  }, []);

  // Fetch loại quỹ data (for reference)
  useEffect(() => {
    const fetchLoaiQuy = async () => {
      try {
        const response = await getAllLoaiQuy();
        setLoaiQuyData(response?.data || []);
      } catch (err) {
        console.error('Error fetching loai quy:', err);
      }
    };
    fetchLoaiQuy();
  }, []);

  // Fetch category funds for a specific category
  const fetchCategoryFunds = async (categoryKey, page, requestId) => {
    try {
      setCategoryLoading(prev => ({ ...prev, [categoryKey]: true }));
      
      const response = await getPublicFunds({
        maloai: categoryKey,
        page,
        limit: ITEMS_PER_PAGE,
        capDo: activeCapDo,
        trangThai: activeTrangThai,
        search: searchKeyword,
        sapXep: sortValue === 'newest' ? 'ngaytao_desc' : 
                sortValue === 'oldest' ? 'ngaytao_asc' :
                sortValue === 'name' ? 'tenquy_asc' : 'ngaytao_desc'
      });
      
      // Check if request is stale
      if (requestId !== filterRequestIdRef.current) return;
      
      if (response.success) {
        setCategoryData(prev => ({ ...prev, [categoryKey]: response.funds }));
        setCategoryTotals(prev => ({ ...prev, [categoryKey]: response.total }));
      }
    } catch (error) {
      console.error(`Error fetching funds for ${categoryKey}:`, error);
    } finally {
      if (requestId === filterRequestIdRef.current) {
        setCategoryLoading(prev => ({ ...prev, [categoryKey]: false }));
      }
    }
  };

  // Fetch counts when filters change
  useEffect(() => {
    const fetchCounts = async () => {
      const requestId = filterRequestIdRef.current + 1;
      filterRequestIdRef.current = requestId;
      
      try {
        setInitLoading(true);
        setCountError(null);
        
        // Reset all states
        setCategoryCounts({});
        setCategoryTotals({});
        setCategoryData({});
        setCategoryPages({});
        setCategories([]);
        
        const response = await getFundCountByGroup({
          capDo: activeCapDo,
          trangThai: activeTrangThai
        });
        
        // Check if request is stale
        if (requestId !== filterRequestIdRef.current) return;
        
        if (response.success) {
          const countData = response.data;
          
          // Tạo danh sách categories từ API response
          let categoryList = Object.keys(countData).map(maloai => ({
            key: maloai,
            label: countData[maloai].tenLoai,
            class: `category-${maloai.toLowerCase()}`
          }));
          
          // Lọc categories theo loại quỹ đã chọn (nếu có)
          if (activeLoaiQuy) {
            categoryList = categoryList.filter(cat => cat.key === activeLoaiQuy);
          }
          
          setCategories(categoryList);
          
          // Set counts và totals
          const counts = {};
          const totals = {};
          const pages = {};
          
          categoryList.forEach(cat => {
            counts[cat.key] = countData[cat.key].soLuong;
            totals[cat.key] = countData[cat.key].soLuong;
            pages[cat.key] = 1;
          });
          
          setCategoryCounts(counts);
          setCategoryTotals(totals);
          setCategoryPages(pages);
          
          // Fetch funds for categories with count > 0
          categoryList.forEach(cat => {
            if (counts[cat.key] > 0) {
              fetchCategoryFunds(cat.key, 1, requestId);
            }
          });
        }
      } catch (error) {
        console.error('Error fetching counts:', error);
        setCountError('Không thể tải danh mục quỹ. Vui lòng thử lại.');
      } finally {
        if (requestId === filterRequestIdRef.current) {
          setInitLoading(false);
        }
      }
    };
    
    fetchCounts();
  }, [activeCapDo, activeTrangThai, activeLoaiQuy, sortValue, searchKeyword]);

  // Handle pagination
  const handlePageChange = (categoryKey, newPage) => {
    setCategoryPages(prev => ({ ...prev, [categoryKey]: newPage }));
    fetchCategoryFunds(categoryKey, newPage, filterRequestIdRef.current);
    
    // Scroll to category section
    const sectionElement = document.getElementById(`section-${categoryKey}`);
    if (sectionElement) {
      sectionElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Render skeleton loaders
  const renderSkeletons = () => (
    <div className={styles.grid}>
      {[...Array(6)].map((_, index) => (
        <div key={index} className={styles.skeletonCard}>
          <div className={styles.skeletonImage}></div>
          <div className={styles.skeletonText}></div>
          <div className={styles.skeletonText}></div>
        </div>
      ))}
    </div>
  );

  // Render pagination controls
  const renderPagination = (categoryKey, currentPage, totalPages) => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxPagesToShow = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className={styles.pagination}>
        <button
          className={styles.paginationButton}
          onClick={() => handlePageChange(categoryKey, currentPage - 1)}
          disabled={currentPage === 1}
        >
          Trước
        </button>
        
        {startPage > 1 && (
          <>
            <button
              className={styles.paginationButton}
              onClick={() => handlePageChange(categoryKey, 1)}
            >
              1
            </button>
            {startPage > 2 && <span className={styles.ellipsis}>...</span>}
          </>
        )}
        
        {pages.map(page => (
          <button
            key={page}
            className={`${styles.paginationButton} ${page === currentPage ? styles.active : ''}`}
            onClick={() => handlePageChange(categoryKey, page)}
          >
            {page}
          </button>
        ))}
        
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className={styles.ellipsis}>...</span>}
            <button
              className={styles.paginationButton}
              onClick={() => handlePageChange(categoryKey, totalPages)}
            >
              {totalPages}
            </button>
          </>
        )}
        
        <button
          className={styles.paginationButton}
          onClick={() => handlePageChange(categoryKey, currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Tiếp
        </button>
      </div>
    );
  };

  // Render category section
  const renderCategorySection = (cat) => {
    const data = categoryData[cat.key] || [];
    const loading = categoryLoading[cat.key];
    const total = categoryTotals[cat.key] || 0;
    const currentPage = categoryPages[cat.key] || 1;
    const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
    
    if (total === 0) return null;
    
    return (
      <section 
        key={cat.key} 
        id={`section-${cat.key}`} 
        className={styles.categorySection}
      >
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            <span className={`${styles.titleDot} ${styles[cat.class]}`} />
            {cat.label}
          </h2>
          <span className={styles.sectionCount}>({total} quỹ)</span>
        </div>
        
        {loading ? (
          renderSkeletons()
        ) : (
          <>
            <div className={styles.grid}>
              {data.map(fund => (
                <FundCard 
                  key={fund.quyId} 
                  fund={{
                    quy_id: fund.quyId,
                    ten_quy: fund.tenQuy,
                    loai_quy: fund.loaiquy?.tenLoai || fund.loaiQuy,
                    hinh_anh: fund.hinhAnh,
                    mo_ta: fund.moTa,
                    so_du: fund.soDu,
                    so_du_thuc_te: fund.soDuThucTe,
                    trang_thai: fund.trangThai,
                    so_tien_toi_da: fund.soTienHoTroToiDa,
                    so_luong_chi_tieu: fund.soLuongChiTieu,
                    han_nop_don: fund.hanNopDon,
                    so_don_da_nop: fund.soDonDaNop,
                    phan_tram_da_nhan: fund.phanTramDaNhan,
                  }}
                />
              ))}
            </div>
            
            {renderPagination(cat.key, currentPage, totalPages)}
          </>
        )}
      </section>
    );
  };

  // Calculate total funds count
  const totalFundsCount = Object.values(categoryTotals).reduce((sum, count) => sum + count, 0);

  // Modal escape handler
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

  return (
    <div className={styles.fundsPage}>
      <PublicHeader 
        onLoginClick={openLoginModal}
        onRegisterClick={openRegisterModal}
      />
      
      <HeroBanner
        variant="compact"
        images={settings?.funds_banner_images}
        showStats={true}
        showLoginPrompt={false}
      />

      <div className={styles.ctaBanner}>
        <div className={styles.ctaContent}>
          <h3>Bạn muốn đồng hành cùng các quỹ?</h3>
          <p>Mỗi đóng góp của bạn là nguồn động viên lớn lao cho sự phát triển của trường.</p>
        </div>
        <button
          className={styles.ctaButton}
          onClick={() => navigate('/dong-gop')}
        >
          Tài trợ ngay
        </button>
      </div>

      <main className={styles.mainContent}>
        {/* Search and Filters Section */}
        <section className={styles.filterSection}>
            <div className={styles.filterContainer}>
              {/* Search Bar - Full Width */}
              <div className={styles.searchWrapper}>
                <HiMagnifyingGlass className={styles.searchIcon} />
                <input
                  type="text"
                  className={styles.searchInput}
                  placeholder="Tìm theo tên quỹ, chương trình..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                />
              </div>

              {/* Breadcrumb - Cấp quản lý */}
              <div className={styles.breadcrumbRow}>
                <label className={styles.filterLabel}>Cấp quản lý</label>
                <div className={styles.breadcrumbContainer}>
                  <button
                    className={`${styles.breadcrumbButton} ${activeCapDo === '1' ? styles.active : ''}`}
                    onClick={() => setActiveCapDo(activeCapDo === '1' ? null : '1')}
                  >
                    <HiOutlineBuildingLibrary size={18} />
                    <span>Quỹ mẹ</span>
                  </button>
                  <HiChevronRight className={styles.breadcrumbArrow} />
                  <button
                    className={`${styles.breadcrumbButton} ${activeCapDo === '2' ? styles.active : ''}`}
                    onClick={() => setActiveCapDo(activeCapDo === '2' ? null : '2')}
                  >
                    <HiOutlineSquare3Stack3D size={18} />
                    <span>Quỹ thành phần</span>
                  </button>
                  <HiChevronRight className={styles.breadcrumbArrow} />
                  <button
                    className={`${styles.breadcrumbButton} ${activeCapDo === '3' ? styles.active : ''}`}
                    onClick={() => setActiveCapDo(activeCapDo === '3' ? null : '3')}
                  >
                    <HiOutlineRocketLaunch size={18} />
                    <span>Quỹ hoạt động</span>
                  </button>
                </div>
              </div>

              {/* Filters Row - Loại quỹ (2x) + Trạng thái + Sắp xếp */}
              <div className={styles.filtersRow}>
                {/* Loại quỹ - Double Width */}
                <div className={`${styles.filterItem} ${styles.doubleWidth}`}>
                  <label className={styles.filterLabel}>Loại quỹ</label>
                  <select
                    className={styles.filterSelect}
                    value={activeLoaiQuy || ''}
                    onChange={(e) => setActiveLoaiQuy(e.target.value || null)}
                  >
                    <option value="">Tất cả loại quỹ</option>
                    {loaiQuyData.map((item) => (
                      <option key={item.maLoai || item.ma_loai} value={item.maLoai || item.ma_loai}>
                        {item.tenLoai || item.ten_loai}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Trạng thái - Single Width */}
                <div className={styles.filterItem}>
                  <label className={styles.filterLabel}>Trạng thái</label>
                  <select
                    className={styles.filterSelect}
                    value={activeTrangThai || ''}
                    onChange={(e) => setActiveTrangThai(e.target.value || null)}
                  >
                    <option value="">Tất cả</option>
                    <option value="Dang hoat dong">Đang hoạt động</option>
                    <option value="Tam dung">Tạm dừng</option>
                  </select>
                </div>

                {/* Sắp xếp - Single Width */}
                <div className={styles.filterItem}>
                  <label className={styles.filterLabel}>Sắp xếp</label>
                  <select
                    className={styles.filterSelect}
                    value={sortValue}
                    onChange={(e) => setSortValue(e.target.value)}
                  >
                    <option value="newest">Mới nhất</option>
                    <option value="oldest">Cũ nhất</option>
                    <option value="name">Tên A→Z</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {countError ? (
            <div className={styles.errorMessage}>
              <p>{countError}</p>
              <button onClick={() => window.location.reload()}>Thử lại</button>
            </div>
          ) : initLoading ? (
            <div className={styles.loadingState}>
              {renderSkeletons()}
            </div>
          ) : totalFundsCount === 0 ? (
            <div className={styles.emptyState}>
              <p>Không tìm thấy quỹ phù hợp</p>
            </div>
          ) : (
            <div className={styles.sectionsWrapper}>
              {categories.map(cat => renderCategorySection(cat))}
            </div>
          )}
        </main>

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
