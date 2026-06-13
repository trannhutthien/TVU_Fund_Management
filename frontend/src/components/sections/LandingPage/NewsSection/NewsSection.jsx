import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@components/common/Button';
import styles from './NewsSection.module.scss';

const NewsSection = ({ 
  title = "TIN MỚI", 
  subtitle = "Cập nhật những hoạt động mới nhất về quỹ hỗ trợ và học bổng tại Trường Đại học Trà Vinh", 
  data, 
  loading = false, 
  sidebarPosition = "right", 
  type = "moi" 
}) => {
  const navigate = useNavigate();
  const [featured, setFeatured] = useState(null);
  const [featuredSmall, setFeaturedSmall] = useState([]);
  const [sidebar, setSidebar] = useState([]);

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

  const handleNewsClick = (id) => {
    navigate(`/news/${id}`);
  };

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

  useEffect(() => {
    if (loading) return;

    const mapItem = (item) => {
      if (!item) return null;
      return {
        id: item.id,
        title: item.title,
        summary: item.summary,
        category: item.category,
        date: formatDate(item.publishDate),
        image: item.avatar || 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=600&auto=format&fit=crop'
      };
    };

    if (data) {
      setFeatured(mapItem(data.featured));
      setFeaturedSmall((data.featuredSmall || []).map(mapItem).filter(Boolean));
      setSidebar((data.sidebar || []).map(mapItem).filter(Boolean));
    } else {
      setFeatured(null);
      setFeaturedSmall([]);
      setSidebar([]);
    }
  }, [data, loading]);

  const sidebarFirst = sidebar[0];
  const sidebarRest = sidebar.slice(1);

  if (loading) {
    return (
      <section className={styles.newsSection}>
        <div className={styles.container}>
          <div className={styles.loadingState}>
            <p>Đang tải tin tức & sự kiện...</p>
          </div>
        </div>
      </section>
    );
  }

  // Không hiển thị section nếu hoàn toàn không có dữ liệu tin tức nào
  if (!featured && featuredSmall.length === 0 && sidebar.length === 0) {
    return null;
  }

  return (
    <section className={styles.newsSection}>
      <div className={styles.container}>
        {/* Section Header */}
        <div className={styles.header}>
          <div className={styles.titleContainer}>
            <span className={styles.decoratorLine} />
            <h2 className={styles.title}>{title}</h2>
          </div>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>

        {/* Content Layout */}
        <div className={`${styles.contentGrid} ${sidebarPosition === 'left' ? styles.sidebarLeft : ''}`}>
          {/* Main Column: Featured Large & Small */}
          <div className={styles.mainColumn}>
            {/* Featured Large Card */}
            {featured && (
              <div 
                className={styles.featuredLargeCard}
                onClick={() => handleNewsClick(featured.id)}
              >
                <div className={styles.featuredLargeImgWrapper}>
                  <img 
                    src={featured.image} 
                    alt={featured.title} 
                    className={styles.featuredLargeImg}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
                <div className={styles.featuredLargeInfo}>
                  <div className={styles.metaRow}>
                    <span className={`${styles.categoryBadge} ${styles[featured.category]}`}>
                      {getCategoryLabel(featured.category)}
                    </span>
                    <span className={styles.date}>{featured.date}</span>
                  </div>
                  <h3 className={styles.featuredLargeTitle}>{featured.title}</h3>
                  <p className={styles.summary}>{featured.summary}</p>
                  <span className={styles.readMore}>Đọc thêm →</span>
                </div>
              </div>
            )}

            {/* Featured Small Cards Row */}
            {featuredSmall.length > 0 && (
              <div className={`${styles.featuredSmallRow} ${featuredSmall.length === 1 ? styles.single : ''}`}>
                {featuredSmall.map((item) => (
                  <div 
                    key={item.id} 
                    className={styles.featuredSmallCard}
                    onClick={() => handleNewsClick(item.id)}
                  >
                    <div className={styles.featuredSmallImgWrapper}>
                      <img 
                        src={item.image} 
                        alt={item.title} 
                        className={styles.featuredSmallImg}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    </div>
                    <div className={styles.featuredSmallInfo}>
                      <div className={styles.metaRow}>
                        <span className={`${styles.categoryBadge} ${styles[item.category]}`}>
                          {getCategoryLabel(item.category)}
                        </span>
                        <span className={styles.date}>{item.date}</span>
                      </div>
                      <h4 className={styles.featuredSmallTitle}>{item.title}</h4>
                      <p className={styles.featuredSmallSummary}>{item.summary}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar Column */}
          <div className={styles.sidebarColumn}>
            <h3 className={styles.sidebarTitle}>NỔI BẬT KHÁC</h3>
            
            <div className={styles.sidebarContent}>
              {/* First Item: Large Sidebar Card */}
              {sidebarFirst && (
                <div 
                  className={styles.sidebarFeatured}
                  onClick={() => handleNewsClick(sidebarFirst.id)}
                >
                  <div className={styles.sidebarFeaturedImgWrapper}>
                    <img 
                      src={sidebarFirst.image} 
                      alt={sidebarFirst.title} 
                      className={styles.sidebarFeaturedImg}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </div>
                  <div className={styles.sidebarFeaturedInfo}>
                    <div className={styles.sidebarFeaturedMeta}>
                      <span className={`${styles.categoryBadge} ${styles[sidebarFirst.category]}`}>
                        {getCategoryLabel(sidebarFirst.category)}
                      </span>
                      <span className={styles.sidebarFeaturedDate}>{sidebarFirst.date}</span>
                    </div>
                    <h4 className={styles.sidebarFeaturedTitle}>{sidebarFirst.title}</h4>
                    <p className={styles.sidebarFeaturedSummary}>{sidebarFirst.summary}</p>
                  </div>
                </div>
              )}

              {/* Remaining Items: List of small items */}
              {sidebarRest.length > 0 && (
                <div className={styles.sidebarList}>
                  {sidebarRest.map((item) => (
                    <div 
                      key={item.id} 
                      className={styles.sidebarItem}
                      onClick={() => handleNewsClick(item.id)}
                    >
                      <div className={styles.sidebarThumbWrapper}>
                        <img 
                          src={item.image} 
                          alt={item.title} 
                          className={styles.sidebarThumb}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      </div>
                      <div className={styles.sidebarItemInfo}>
                        <div className={styles.sidebarItemMeta}>
                          <span className={`${styles.sidebarBadge} ${styles[item.category]}`}>
                            {getCategoryLabel(item.category)}
                          </span>
                          <span className={styles.sidebarItemDate}>{item.date}</span>
                        </div>
                        <h5 className={styles.sidebarItemTitle}>{item.title}</h5>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Action */}
        <div className={styles.sectionFooter}>
          <Button 
            variant="secondary" 
            size="md"
            onClick={() => navigate('/news')}
          >
            Xem tất cả tin tức →
          </Button>
        </div>
      </div>
    </section>
  );
};

export default NewsSection;
