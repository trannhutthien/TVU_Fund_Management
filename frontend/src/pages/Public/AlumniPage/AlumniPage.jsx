import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HiOutlineChevronRight,
  HiOutlineChevronLeft,
  HiOutlineBookOpen,
  HiOutlineFolderOpen,
  HiOutlineCalendarDays
} from 'react-icons/hi2';
import PublicHeader from '@components/layout/PublicHeader/PublicHeader';
import PublicFooter from '@components/layout/PublicFooter/PublicFooter';
import LoginForm from '@components/forms/LoginForm';
import RegisterForm from '@components/forms/RegisterForm';
import Button from '@components/common/Button';
import newsService from '@services/newsService';
import khuonVienImage from '@assets/images/khuonVienTruong.png';
import styles from './AlumniPage.module.scss';

const AlumniPage = () => {
  const navigate = useNavigate();

  // Modals state
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);
  const openRegisterModal = () => setIsRegisterModalOpen(true);
  const closeRegisterModal = () => setIsRegisterModalOpen(false);

  // States for Alumni articles
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalArticles, setTotalArticles] = useState(0);
  const limit = 6;

  // Scroll to top when page mounts
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
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

  // Fetch alumni articles
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const response = await newsService.getPublicNews({
          phanloai: 'cuusinhvien',
          page: currentPage,
          limit: limit
        });
        if (response.success) {
          setArticles(response.news || []);
          setTotalArticles(response.total || 0);
        }
      } catch (error) {
        console.error('Error fetching alumni articles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [currentPage]);

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

  const totalPages = Math.ceil(totalArticles / limit);

  return (
    <div className={styles.page}>
      <PublicHeader 
        onLoginClick={openLoginModal}
        onRegisterClick={openRegisterModal}
      />
      
      {/* Hero Banner Section */}
      <section className={styles.heroBanner}>
        <div className={styles.backgroundImage}>
          <img src={khuonVienImage} alt="Khuôn viên Đại học Trà Vinh" />
          <div className={styles.bannerOverlay} />
        </div>
        <div className={styles.bannerContainer}>
          <div className={styles.bannerContent}>
            <span className={styles.badge}>🎓 GẮN KẾT & ĐỒNG HÀNH</span>
            <h1 className={styles.title}>Cựu Sinh Viên TVU</h1>
            <p className={styles.subtitle}>
              Nơi kết nối các thế hệ cựu học viên, sinh viên Đại học Trà Vinh cùng chia sẻ, hỗ trợ và đồng hành phát triển.
            </p>
            <div className={styles.heroActions}>
              <Button 
                variant="primary" 
                onClick={() => navigate('/apply?role=student')}
                className={styles.heroBtn}
              >
                Đăng ký ngay
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className={styles.mainContent}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h3>Hoạt Động & Gương Cựu Sinh Viên Nổi Bật</h3>
            <p>Những câu chuyện truyền cảm hứng và các chương trình kết nối thế hệ cựu sinh viên</p>
          </div>

          {loading ? (
            // Skeleton Loading
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
          ) : articles.length === 0 ? (
            // Empty State
            <div className={styles.emptyState}>
              <HiOutlineFolderOpen className={styles.emptyIcon} />
              <p>Chưa có bài viết nào thuộc chuyên mục cựu sinh viên.</p>
            </div>
          ) : (
            <>
              {/* Cards Grid */}
              <div className={styles.grid}>
                {articles.map((item) => (
                  <article 
                    key={item.id} 
                    className={styles.card} 
                    onClick={() => navigate(`/news/${item.id}`)}
                  >
                    <div className={styles.cardImageWrapper}>
                      {item.avatar ? (
                        <img 
                          src={item.avatar} 
                          alt={item.title} 
                          className={styles.cardImage}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=800&auto=format&fit=crop';
                          }}
                        />
                      ) : (
                        <div className={styles.imagePlaceholder}>
                          <HiOutlineBookOpen className={styles.placeholderIcon} />
                        </div>
                      )}
                      <span className={styles.cardBadge}>
                        Cựu sinh viên
                      </span>
                    </div>

                    <div className={styles.cardContent}>
                      <h4 className={styles.cardTitle} title={item.title}>
                        {item.title}
                      </h4>
                      <p className={styles.cardDesc}>
                        {item.summary || 'Nhấp vào để xem chi tiết bài viết này.'}
                      </p>
                      <div className={styles.cardMeta}>
                        <span className={styles.metaItem}>
                          <HiOutlineCalendarDays className={styles.metaIcon} size={14} />
                          {formatDate(item.publishDate || item.createdAt)}
                        </span>
                        <span className={styles.readMore}>
                          Chi tiết <HiOutlineChevronRight className={styles.readMoreIcon} size={14} />
                        </span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className={styles.pagination}>
                  <button
                    className={styles.pagBtn}
                    disabled={currentPage <= 1}
                    onClick={() => {
                      setCurrentPage(prev => prev - 1);
                      window.scrollTo({ top: 380, behavior: 'smooth' });
                    }}
                    aria-label="Trang trước"
                  >
                    <HiOutlineChevronLeft size={16} />
                    <span>Trước</span>
                  </button>
                  <div className={styles.pagPages}>
                    {Array.from({ length: totalPages }).map((_, i) => {
                      const pageNum = i + 1;
                      return (
                        <button
                          key={pageNum}
                          className={`${styles.pagNumBtn} ${currentPage === pageNum ? styles.active : ''}`}
                          onClick={() => {
                            setCurrentPage(pageNum);
                            window.scrollTo({ top: 380, behavior: 'smooth' });
                          }}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    className={styles.pagBtn}
                    disabled={currentPage >= totalPages}
                    onClick={() => {
                      setCurrentPage(prev => prev + 1);
                      window.scrollTo({ top: 380, behavior: 'smooth' });
                    }}
                    aria-label="Trang sau"
                  >
                    <span>Tiếp</span>
                    <HiOutlineChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

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

export default AlumniPage;
