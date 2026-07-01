import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  HiOutlineCalendarDays, 
  HiOutlineUser, 
  HiOutlineChevronRight,
  HiOutlineChevronLeft,
  HiOutlineFolderOpen,
  HiOutlineBookOpen,
  HiOutlineHeart
} from 'react-icons/hi2';
import PublicHeader from '@components/layout/PublicHeader/PublicHeader';
import PublicFooter from '@components/layout/PublicFooter/PublicFooter';
import LoginForm from '@components/forms/LoginForm';
import RegisterForm from '@components/forms/RegisterForm';
import Button from '@components/common/Button';
import newsService from '@services/newsService';
import khuonVienImage from '@assets/images/khuonVienTruong.png';
import styles from './NewsPage.module.scss';

// Định nghĩa thứ tự danh mục ưu tiên theo yêu cầu
const CATEGORIES_CONFIG = [
  { key: 'Tin hoc bong', label: 'Học bổng', class: 'scholarship' },
  { key: 'Thong bao', label: 'Thông báo', class: 'announcement' },
  { key: 'Su kien', label: 'Sự kiện', class: 'event' },
  { key: 'Tin giao duc', label: 'Giáo dục', class: 'education' },
  { key: 'Bao cao hoat dong', label: 'Báo cáo hoạt động', class: 'report' },
  { key: 'Khac', label: 'Khác', class: 'other' }
];

const PHANLOAI_CONFIG = [
  { key: 'all', label: 'Tất cả tin' },
  { key: 'Tin moi', label: 'Tin mới' },
  { key: 'Tin noi bat', label: 'Tin nổi bật' },
  { key: 'baocaohoatdong', label: 'Báo cáo hoạt động' },
  { key: 'chuongtrinh', label: 'Chương trình' }
];

const ITEMS_PER_PAGE = 6;

const createCategoryState = (valueFactory) => CATEGORIES_CONFIG.reduce((acc, cat) => {
  acc[cat.key] = typeof valueFactory === 'function' ? valueFactory(cat) : valueFactory;
  return acc;
}, {});

const NewsPage = () => {
  const navigate = useNavigate();

  // Modals state
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  // Filter & Page States
  const [activeCategory, setActiveCategory] = useState('all');
  const [activePhanloai, setActivePhanloai] = useState('all');
  const [categoryCounts, setCategoryCounts] = useState(createCategoryState(0));

  // Independent state per category
  const [categoryPages, setCategoryPages] = useState(createCategoryState(1));

  const [categoryData, setCategoryData] = useState(createCategoryState(() => []));

  const [categoryTotals, setCategoryTotals] = useState(createCategoryState(0));

  const [categoryLoading, setCategoryLoading] = useState(createCategoryState(false));

  const [initLoading, setInitLoading] = useState(true);
  const filterRequestIdRef = useRef(0);

  // Modal Handlers
  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);
  const openRegisterModal = () => setIsRegisterModalOpen(true);
  const closeRegisterModal = () => setIsRegisterModalOpen(false);

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

  const getPhanloaiParam = (phanloaiKey = activePhanloai) => (
    phanloaiKey === 'all' ? undefined : phanloaiKey
  );

  // Fetch counts when the news type filter changes
  useEffect(() => {
    const fetchCounts = async () => {
      const requestId = filterRequestIdRef.current + 1;
      filterRequestIdRef.current = requestId;
      const currentPhanloai = activePhanloai;

      try {
        setInitLoading(true);
        setCategoryCounts(createCategoryState(0));
        setCategoryTotals(createCategoryState(0));
        setCategoryData(createCategoryState(() => []));
        setCategoryPages(createCategoryState(1));
        setCategoryLoading(createCategoryState(false));

        const response = await newsService.getNewsCountByCategory({
          phanloai: getPhanloaiParam(currentPhanloai)
        });

        if (requestId !== filterRequestIdRef.current) return;

        if (response.success && response.data) {
          const nextCounts = {
            ...createCategoryState(0),
            ...response.data
          };

          setCategoryCounts(nextCounts);
          setCategoryTotals(nextCounts);

          CATEGORIES_CONFIG.forEach(cat => {
            const count = nextCounts[cat.key] || 0;
            if (count > 0) {
              fetchCategoryNews(cat.key, 1, currentPhanloai, requestId);
            }
          });
        }
      } catch (error) {
        console.error('Error fetching news category counts:', error);
      } finally {
        if (requestId === filterRequestIdRef.current) {
          setInitLoading(false);
        }
      }
    };
    fetchCounts();
  }, [activePhanloai]);

  // Fetch news for a category when its page or counts change
  const fetchCategoryNews = async (
    categoryKey,
    page,
    phanloaiKey = activePhanloai,
    requestId = filterRequestIdRef.current
  ) => {
    try {
      setCategoryLoading(prev => ({ ...prev, [categoryKey]: true }));
      const response = await newsService.getPublicNews({
        category: categoryKey,
        phanloai: getPhanloaiParam(phanloaiKey),
        page,
        limit: ITEMS_PER_PAGE
      });

      if (requestId !== filterRequestIdRef.current) return;

      if (response.success) {
        setCategoryData(prev => ({ ...prev, [categoryKey]: response.news || [] }));
        setCategoryTotals(prev => ({ ...prev, [categoryKey]: response.total || 0 }));
      }
    } catch (error) {
      console.error(`Error fetching news for category ${categoryKey}:`, error);
    } finally {
      if (requestId === filterRequestIdRef.current) {
        setCategoryLoading(prev => ({ ...prev, [categoryKey]: false }));
      }
    }
  };

  // Handle pagination change
  const handlePageChange = (categoryKey, newPage) => {
    setCategoryPages(prev => ({ ...prev, [categoryKey]: newPage }));
    fetchCategoryNews(categoryKey, newPage);
    
    // Scroll category section header into view smoothly
    const sectionElement = document.getElementById(`section-${categoryKey}`);
    if (sectionElement) {
      sectionElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handlePhanloaiChange = (phanloaiKey) => {
    setActivePhanloai(phanloaiKey);
    setActiveCategory('all');
  };

  // Format date helper
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getCategoryLabel = (key) => {
    const found = CATEGORIES_CONFIG.find(c => c.key === key);
    return found ? found.label : 'Thông tin';
  };

  const getCategoryClass = (key) => {
    const found = CATEGORIES_CONFIG.find(c => c.key === key);
    return found ? found.class : 'other';
  };

  // Check if any category has content
  const totalNewsCount = Object.values(categoryCounts).reduce((a, b) => a + b, 0);

  // Render skeleton loaders for a category section
  const renderSkeletons = () => {
    return (
      <div className={styles.grid}>
        {Array.from({ length: 3 }).map((_, idx) => (
          <div key={`skeleton-${idx}`} className={styles.skeletonCard}>
            <div className={styles.skeletonImage} />
            <div className={styles.skeletonBody}>
              <div className={styles.skeletonTag} />
              <div className={styles.skeletonTitle} />
              <div className={styles.skeletonDesc} />
              <div className={styles.skeletonMeta} />
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render a specific category section
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
          <div className={styles.sectionHeaderLine} />
          <h2 className={styles.sectionTitle}>
            <span className={`${styles.titleDot} ${styles[cat.class]}`} />
            {cat.label}
          </h2>
          <span className={styles.sectionCount}>({total} bài viết)</span>
        </div>

        {loading ? (
          renderSkeletons()
        ) : data.length === 0 ? (
          <div className={styles.emptyCategory}>
            <HiOutlineFolderOpen className={styles.emptyIcon} />
            <p>Không có bài viết nào trong chuyên mục này.</p>
          </div>
        ) : (
          <>
            <div className={styles.grid}>
              {data.map((item) => (
                <article key={item.id} className={styles.card} onClick={() => navigate(`/news/${item.id}`)}>
                  <div className={styles.cardImageWrapper}>
                    {item.avatar ? (
                      <img 
                        src={item.avatar} 
                        alt={item.title} 
                        className={styles.cardImage}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=800&auto=format&fit=crop';
                        }}
                      />
                    ) : (
                      <div className={styles.imagePlaceholder}>
                        <HiOutlineBookOpen className={styles.placeholderIcon} />
                      </div>
                    )}
                    <span className={`${styles.cardBadge} ${styles[cat.class]}`}>
                      {cat.label}
                    </span>
                  </div>

                  <div className={styles.cardContent}>
                    <h3 className={styles.cardTitle} title={item.title}>
                      {item.title}
                    </h3>
                    <p className={styles.cardDesc}>
                      {item.summary || 'Nhấp vào để xem chi tiết bài viết này.'}
                    </p>
                    <div className={styles.cardMeta}>
                      <span className={styles.metaItem}>
                        <HiOutlineCalendarDays className={styles.metaIcon} />
                        {formatDate(item.publishDate || item.createdAt)}
                      </span>
                      <span className={styles.readMore}>
                        Chi tiết <HiOutlineChevronRight className={styles.readMoreIcon} />
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination for this category */}
            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  className={styles.pagBtn}
                  disabled={currentPage <= 1}
                  onClick={() => handlePageChange(cat.key, currentPage - 1)}
                  aria-label="Trang trước"
                >
                  <HiOutlineChevronLeft />
                  <span>Trước</span>
                </button>
                <div className={styles.pagPages}>
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        className={`${styles.pagNumBtn} ${currentPage === pageNum ? styles.active : ''}`}
                        onClick={() => handlePageChange(cat.key, pageNum)}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  className={styles.pagBtn}
                  disabled={currentPage >= totalPages}
                  onClick={() => handlePageChange(cat.key, currentPage + 1)}
                  aria-label="Trang sau"
                >
                  <span>Tiếp</span>
                  <HiOutlineChevronRight />
                </button>
              </div>
            )}
          </>
        )}
      </section>
    );
  };

  return (
    <div className={styles.newsPage}>
      <PublicHeader 
        onLoginClick={openLoginModal}
        onRegisterClick={openRegisterModal}
      />

      {/* Banner đầu trang */}
      <section className={styles.banner}>
        {/* Background Image */}
        <div className={styles.backgroundImage}>
          <img src={khuonVienImage} alt="Khuôn viên Đại học Trà Vinh" />
          <div className={styles.bannerOverlay} />
        </div>
        <div className={styles.bannerContainer}>
          <div className={styles.bannerLeft}>
            {/* Breadcrumbs */}
            <nav className={styles.breadcrumb}>
              <Link to="/" className={styles.breadcrumbLink}>Trang chủ</Link>
              <HiOutlineChevronRight className={styles.breadcrumbDivider} />
              <span className={styles.breadcrumbActive}>Tin tức</span>
            </nav>
            
            <h1 className={styles.bannerTitle}>Tin Tức & Sự Kiện</h1>
            <p className={styles.bannerDesc}>
              Cập nhật thông tin mới nhất về học bổng, sự kiện và hoạt động của Quỹ TVU
            </p>
          </div>
          <div className={styles.bannerRight}>
            <Button
              variant="primary"
              size="lg"
              className={styles.sponsorBtn}
              onClick={() => navigate('/apply')}
            >
              Tiếp nhận tài trợ
              <HiOutlineHeart className={styles.sponsorBtnIcon} />
            </Button>
          </div>
        </div>
      </section>

      <div className={styles.mainContent}>
        <div className={styles.container}>
          {/* Filter Bar */}
          <div className={styles.filterBar}>
            <div className={styles.filterGroup}>
              <span className={styles.filterGroupLabel}>Phân loại</span>
              {PHANLOAI_CONFIG.map((item) => (
                <button
                  key={item.key}
                  className={`${styles.filterTab} ${activePhanloai === item.key ? styles.active : ''}`}
                  onClick={() => handlePhanloaiChange(item.key)}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className={styles.filterDivider} />

            <div className={styles.filterGroup}>
              <span className={styles.filterGroupLabel}>Danh mục</span>
              <button
                className={`${styles.filterTab} ${activeCategory === 'all' ? styles.active : ''}`}
                onClick={() => setActiveCategory('all')}
              >
                Tất cả
              </button>
              {CATEGORIES_CONFIG.map((cat) => {
                const count = categoryCounts[cat.key] || 0;
                const isDisabled = count === 0;
                return (
                  <button
                    key={cat.key}
                    className={`${styles.filterTab} ${activeCategory === cat.key ? styles.active : ''} ${isDisabled ? styles.disabled : ''}`}
                    onClick={() => !isDisabled && setActiveCategory(cat.key)}
                    disabled={isDisabled}
                    title={isDisabled ? 'Chưa có bài viết thuộc danh mục này' : ''}
                  >
                    {cat.label}
                    <span className={styles.filterCount}>{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section Rendering logic */}
          {initLoading ? (
            <div className={styles.pageLoading}>
              <div className={styles.spinner} />
              <p>Đang tải dữ liệu tin tức...</p>
            </div>
          ) : totalNewsCount === 0 ? (
            <div className={styles.emptyState}>
              <HiOutlineFolderOpen className={styles.emptyStateIcon} />
              <h3 className={styles.emptyStateTitle}>Chưa có tin tức</h3>
              <p className={styles.emptyStateDesc}>Hệ thống đang được cập nhật tin tức. Vui lòng quay lại sau.</p>
              <Link to="/" className={styles.backHomeBtn}>Quay lại trang chủ</Link>
            </div>
          ) : (
            <div className={styles.sectionsWrapper}>
              {activeCategory === 'all' ? (
                // Hiển thị tất cả danh mục xếp chồng từ trên xuống dưới
                CATEGORIES_CONFIG.map((cat) => renderCategorySection(cat))
              ) : (
                // Chỉ hiển thị danh mục được chọn
                renderCategorySection(CATEGORIES_CONFIG.find(c => c.key === activeCategory))
              )}
            </div>
          )}
        </div>
      </div>

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

export default NewsPage;
