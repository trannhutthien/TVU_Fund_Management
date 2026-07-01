import { useState, useEffect } from 'react';
import { HiOutlineNewspaper, HiOutlineClock, HiOutlineArrowRight } from 'react-icons/hi2';
import newsService from '@services/newsService';
import styles from './NewsSidebar.module.scss';

const NewsSidebar = () => {
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        // Lấy tin tức với phân loại 'Tin moi'
        const response = await newsService.getPublicNews({ phanloai: 'Tin moi' });
        if (response.success && response.news) {
          // Lấy tối đa 5 tin mới nhất
          setNewsList(response.news.slice(0, 5));
        }
      } catch (error) {
        console.error('Lỗi tải tin tức sidebar:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    const BASE_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5001';
    return `${BASE_URL}/${imagePath}`;
  };

  return (
    <aside className={styles.newsSidebar}>
      <div className={styles.sidebarHeader}>
        <HiOutlineNewspaper className={styles.headerIcon} />
        <h3>Tin tức mới nhất</h3>
      </div>

      {loading ? (
        <div className={styles.loadingContainer}>
          {[1, 2, 3].map((n) => (
            <div key={n} className={styles.skeletonItem}>
              <div className={styles.skeletonImg} />
              <div className={styles.skeletonTextWrapper}>
                <div className={styles.skeletonLine} style={{ width: '80%' }} />
                <div className={styles.skeletonLine} style={{ width: '40%' }} />
              </div>
            </div>
          ))}
        </div>
      ) : newsList.length === 0 ? (
        <div className={styles.emptyContainer}>
          <p>Không có tin tức mới nào.</p>
        </div>
      ) : (
        <div className={styles.newsList}>
          {newsList.map((news) => {
            const newsId = news.id;
            const imgUrl = getImageUrl(news.avatar);
            return (
              <a
                key={newsId}
                href={`/news/${newsId}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.newsItem}
              >
                <div className={styles.imageWrapper}>
                  {imgUrl ? (
                    <img src={imgUrl} alt={news.title} className={styles.newsImg} />
                  ) : (
                    <div className={styles.fallbackImg}>
                      <HiOutlineNewspaper />
                    </div>
                  )}
                </div>
                <div className={styles.newsInfo}>
                  <h4 className={styles.newsTitle} title={news.title}>
                    {news.title}
                  </h4>
                  <span className={styles.newsDate}>
                    <HiOutlineClock className={styles.dateIcon} />
                    {formatDate(news.createdAt)}
                  </span>
                </div>
              </a>
            );
          })}
        </div>
      )}

      {/* Footer: dẫn đến trang tin tức */}
      <a href="/news" className={styles.sidebarFooter}>
        <span>Xem tất cả tin tức</span>
        <HiOutlineArrowRight className={styles.footerArrow} />
      </a>
    </aside>
  );
};

export default NewsSidebar;
