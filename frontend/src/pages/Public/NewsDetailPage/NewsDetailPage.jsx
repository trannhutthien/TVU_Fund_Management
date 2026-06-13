import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  HiOutlineCalendarDays, 
  HiOutlineUser, 
  HiOutlineArrowLeft, 
  HiOutlineChevronRight,
  HiOutlineLink,
  HiOutlineBookmark,
  HiOutlineArrowUpRight
} from 'react-icons/hi2';
import { message } from 'antd';
import PublicHeader from '@components/layout/PublicHeader/PublicHeader';
import PublicFooter from '@components/layout/PublicFooter/PublicFooter';
import LoginForm from '@components/forms/LoginForm';
import RegisterForm from '@components/forms/RegisterForm';
import Button from '@components/common/Button';
import newsService from '@services/newsService';
import styles from './NewsDetailPage.module.scss';

const NewsDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Modals state
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  // Data state
  const [news, setNews] = useState(null);
  const [relatedNews, setRelatedNews] = useState([]);
  const [latestNews, setLatestNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);
  const openRegisterModal = () => setIsRegisterModalOpen(true);
  const closeRegisterModal = () => setIsRegisterModalOpen(false);

  // Scroll to top on id change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [id]);

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

  // Fetch article detail
  useEffect(() => {
    const fetchNewsDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch article detail
        const detailResponse = await newsService.getNewsById(id);
        if (detailResponse.success && detailResponse.news) {
          const activeNews = detailResponse.news;
          setNews(activeNews);

          // Fetch related news (same category, exclude current)
          try {
            const relatedResponse = await newsService.getPublicNews({
              category: activeNews.category,
              excludeId: activeNews.id,
              limit: 4
            });
            if (relatedResponse.success) {
              setRelatedNews(relatedResponse.news || []);
            }
          } catch (err) {
            console.error('Error fetching related news:', err);
          }

          // Fetch latest news (exclude current)
          try {
            const latestResponse = await newsService.getPublicNews({
              excludeId: activeNews.id,
              limit: 5
            });
            if (latestResponse.success) {
              setLatestNews(latestResponse.news || []);
            }
          } catch (err) {
            console.error('Error fetching latest news:', err);
          }
        } else {
          setError('Không tìm thấy bài viết hoặc bài viết chưa được xuất bản');
        }
      } catch (err) {
        console.error('Error fetching news detail:', err);
        setError('Bài viết không tồn tại hoặc chưa được xuất bản');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchNewsDetail();
    }
  }, [id]);

  // Truncate title helper for Breadcrumb
  const truncateText = (text, maxLength = 40) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
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

  // Copy link handler
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    message.success('Đã sao chép liên kết vào bộ nhớ tạm!');
  };

  // Share Facebook handler
  const handleShareFacebook = () => {
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  // Get CTA contents depending on news category
  const renderCtaCard = () => {
    if (!news) return null;
    const isScholarship = news.category === 'Tin hoc bong';
    
    return (
      <div className={styles.ctaCard}>
        <div className={styles.ctaCardBg} />
        <div className={styles.ctaCardContent}>
          <span className={styles.ctaEmoji}>{isScholarship ? '🎓' : '🤝'}</span>
          <h4 className={styles.ctaTitle}>
            {isScholarship ? 'Bạn cần hỗ trợ học bổng?' : 'Đồng hành cùng TVU Fund'}
          </h4>
          <p className={styles.ctaDesc}>
            {isScholarship 
              ? 'Tạo ngay hồ sơ trực tuyến, sử dụng trợ lý AI để hoàn thiện thư ngỏ và gửi tới các nhà tài trợ.' 
              : 'Đóng góp tài trợ của bạn sẽ giúp chắp cánh ước mơ cho hàng trăm sinh viên vượt khó tại ĐH Trà Vinh.'}
          </p>
          <Button
            variant="primary"
            size="md"
            className={styles.ctaButton}
            onClick={() => navigate(isScholarship ? '/apply' : '/funds')}
          >
            {isScholarship ? 'Nộp đơn ngay' : 'Tài trợ ngay'}
            <HiOutlineArrowUpRight className={styles.ctaBtnIcon} />
          </Button>
        </div>
      </div>
    );
  };

  // Map Category Vietnamese Name
  const getCategoryLabel = (cat) => {
    const map = {
      'Tin hoc bong': 'Học bổng',
      'Tin giao duc': 'Giáo dục',
      'Su kien': 'Sự kiện',
      'Thong bao': 'Thông báo',
      'Khac': 'Khác'
    };
    return map[cat] || 'Thông báo';
  };

  // Render Section Loading Skeleton
  const renderSkeleton = () => (
    <div className={styles.skeletonContainer}>
      <div className={styles.skeletonTitle} />
      <div className={styles.skeletonMeta} />
      <div className={styles.skeletonImage} />
      <div className={styles.skeletonTextLine} />
      <div className={styles.skeletonTextLine} style={{ width: '90%' }} />
      <div className={styles.skeletonTextLine} style={{ width: '95%' }} />
      <div className={styles.skeletonTextLine} style={{ width: '85%' }} />
      <div className={styles.skeletonTextLine} style={{ width: '60%' }} />
    </div>
  );

  return (
    <div className={styles.newsDetailPage}>
      <PublicHeader 
        onLoginClick={openLoginModal}
        onRegisterClick={openRegisterModal}
      />

      <div className={styles.mainWrapper}>
        <div className={styles.container}>
          {/* Breadcrumb Navigation */}
          <div className={styles.breadcrumb}>
            <Link to="/" className={styles.breadcrumbLink}>Trang chủ</Link>
            <HiOutlineChevronRight className={styles.breadcrumbDivider} />
            <Link to="/" className={styles.breadcrumbLink}>Tin tức</Link>
            {news && (
              <>
                <HiOutlineChevronRight className={styles.breadcrumbDivider} />
                <span className={styles.breadcrumbActive}>{getCategoryLabel(news.category)}</span>
                <HiOutlineChevronRight className={styles.breadcrumbDivider} />
                <span className={styles.breadcrumbTitleActive}>
                  {truncateText(news.title, 40)}
                </span>
              </>
            )}
          </div>

          {error ? (
            /* Error state view */
            <div className={styles.errorState}>
              <div className={styles.errorBox}>
                <span className={styles.errorIcon}>⚠️</span>
                <h3 className={styles.errorTitle}>Không tìm thấy bài viết</h3>
                <p className={styles.errorDesc}>{error}</p>
                <Button 
                  variant="primary" 
                  size="md"
                  onClick={() => navigate('/')}
                >
                  Quay lại trang chủ
                </Button>
              </div>
            </div>
          ) : (
            <div className={styles.contentLayout}>
              {/* Left Column - Main content (68%) */}
              <div className={styles.mainContent}>
                {loading ? (
                  renderSkeleton()
                ) : (
                  news && (
                    <article className={styles.article}>
                      {/* Header elements */}
                      <header className={styles.articleHeader}>
                        <span className={`${styles.categoryBadge} ${styles[news.category]}`}>
                          {getCategoryLabel(news.category).toUpperCase()}
                        </span>
                        <h1 className={styles.articleTitle}>{news.title}</h1>
                        <div className={styles.metaRow}>
                          <span className={styles.metaItem}>
                            <HiOutlineCalendarDays className={styles.metaIcon} />
                            {formatDate(news.publishDate || news.createdAt)}
                          </span>
                          <span className={styles.metaDivider}>•</span>
                          <span className={styles.metaItem}>
                            <HiOutlineUser className={styles.metaIcon} />
                            {news.creatorName || 'Phòng Công tác Sinh viên'}
                          </span>
                        </div>
                      </header>

                      {/* Featured image */}
                      {news.avatar && (
                        <div className={styles.articleImageWrapper}>
                          <img 
                            src={news.avatar} 
                            alt={news.title} 
                            className={styles.articleImage} 
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        </div>
                      )}

                      {/* Content Body */}
                      <div 
                        className={styles.articleBody}
                        dangerouslySetInnerHTML={{ __html: news.content }}
                      />

                      {/* Footer Actions */}
                      <footer className={styles.articleFooter}>
                        <div className={styles.divider} />
                        
                        <div className={styles.footerRow}>
                          {/* Share Buttons */}
                          <div className={styles.shareSection}>
                            <span className={styles.shareLabel}>Chia sẻ bài viết:</span>
                            <button 
                              onClick={handleShareFacebook} 
                              className={`${styles.shareBtn} ${styles.shareFb}`}
                              title="Chia sẻ lên Facebook"
                            >
                              Facebook
                            </button>
                            <button 
                              onClick={handleCopyLink} 
                              className={`${styles.shareBtn} ${styles.shareCopy}`}
                              title="Sao chép liên kết"
                            >
                              <HiOutlineLink className={styles.btnIconSmall} />
                              Sao chép Link
                            </button>
                          </div>

                          {/* Back Button */}
                          <button 
                            className={styles.backButton}
                            onClick={() => navigate('/')}
                          >
                            <HiOutlineArrowLeft className={styles.backBtnIcon} />
                            Quay lại trang chủ
                          </button>
                        </div>
                      </footer>
                    </article>
                  )
                )}
              </div>

              {/* Right Column - Sidebar (32%) */}
              <aside className={styles.sidebar}>
                {/* Latest News list */}
                {latestNews.length > 0 && (
                  <div className={styles.sidebarWidget}>
                    <h3 className={styles.widgetTitle}>
                      <HiOutlineBookmark className={styles.widgetTitleIcon} />
                      Tin mới nhất
                    </h3>
                    <div className={styles.widgetContent}>
                      {latestNews.slice(0, 5).map((item) => (
                        <Link 
                          key={item.id} 
                          to={`/news/${item.id}`}
                          className={styles.sidebarNewsItem}
                        >
                          <div className={styles.sidebarThumbWrapper}>
                            <img 
                              src={item.avatar || 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=200&auto=format&fit=crop'} 
                              alt={item.title} 
                              className={styles.sidebarThumb} 
                            />
                          </div>
                          <div className={styles.sidebarItemMeta}>
                            <h4 className={styles.sidebarItemTitle}>{item.title}</h4>
                            <span className={styles.sidebarItemDate}>{formatDate(item.publishDate || item.createdAt)}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Related Category News list (Only render if there are any) */}
                {relatedNews.length > 0 && (
                  <div className={styles.sidebarWidget}>
                    <h3 className={styles.widgetTitle}>
                      <HiOutlineBookmark className={styles.widgetTitleIcon} />
                      Cùng chủ đề
                    </h3>
                    <div className={styles.widgetContent}>
                      {relatedNews.slice(0, 4).map((item) => (
                        <Link 
                          key={item.id} 
                          to={`/news/${item.id}`}
                          className={styles.sidebarNewsItem}
                        >
                          <div className={styles.sidebarThumbWrapper}>
                            <img 
                              src={item.avatar || 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=200&auto=format&fit=crop'} 
                              alt={item.title} 
                              className={styles.sidebarThumb} 
                            />
                          </div>
                          <div className={styles.sidebarItemMeta}>
                            <h4 className={styles.sidebarItemTitle}>{item.title}</h4>
                            <span className={styles.sidebarItemDate}>{formatDate(item.publishDate || item.createdAt)}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Call to action Card */}
                {!loading && news && renderCtaCard()}
              </aside>
            </div>
          )}

          {/* Related Articles Section (Bottom Grid) */}
          {!loading && news && relatedNews.length > 0 && (
            <section className={styles.relatedSection}>
              <h3 className={styles.relatedTitleSection}>Có thể bạn quan tâm</h3>
              <div className={styles.relatedGrid}>
                {relatedNews.slice(0, 3).map((item) => (
                  <Link 
                    key={item.id} 
                    to={`/news/${item.id}`}
                    className={styles.relatedCard}
                  >
                    <div className={styles.relatedCardImgWrapper}>
                      <img 
                        src={item.avatar || 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=200&auto=format&fit=crop'} 
                        alt={item.title} 
                        className={styles.relatedCardImg} 
                      />
                    </div>
                    <div className={styles.relatedCardBody}>
                      <span className={`${styles.relatedCardBadge} ${styles[item.category]}`}>
                        {getCategoryLabel(item.category)}
                      </span>
                      <h4 className={styles.relatedCardTitle}>{item.title}</h4>
                      <p className={styles.relatedCardDesc}>{item.summary}</p>
                      <span className={styles.relatedCardDate}>{formatDate(item.publishDate || item.createdAt)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
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

export default NewsDetailPage;
