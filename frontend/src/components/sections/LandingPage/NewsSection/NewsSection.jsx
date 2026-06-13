import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import newsService from '@services/newsService';
import Button from '@components/common/Button';
import styles from './NewsSection.module.scss';

const NewsSection = () => {
  const navigate = useNavigate();
  const [featured, setFeatured] = useState(null);
  const [featuredSmall, setFeaturedSmall] = useState([]);
  const [sidebar, setSidebar] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const handleFallback = () => {
    setFeatured({
      id: 1,
      title: 'Đại học Trà Vinh trao tặng hơn 500 suất học bổng vượt khó học kỳ II năm học 2025-2026',
      summary: 'Nhằm động viên kịp thời các sinh viên có hoàn cảnh khó khăn đạt thành tích học tập tốt, Phòng Công tác sinh viên phối hợp cùng các nhà tài trợ trao tặng các suất học bổng với tổng trị giá hơn 2.5 tỷ đồng.',
      date: '10/06/2026',
      category: 'Tin hoc bong',
      image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=600&auto=format&fit=crop'
    });
    setFeaturedSmall([
      {
        id: 2,
        title: 'Hội thảo "Đồng hành cùng ước mơ giảng đường" kết nối nhà hảo tâm',
        summary: 'Kết nối các doanh nghiệp và cựu sinh viên nhằm tạo nguồn tài trợ bền vững cho sinh viên có hoàn cảnh đặc biệt khó khăn học tập tại TVU.',
        date: '08/06/2026',
        category: 'Su kien',
        image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=300&auto=format&fit=crop'
      },
      {
        id: 3,
        title: 'TVU ra mắt Trợ lý AI hỗ trợ sinh viên tối ưu hóa hồ sơ xin học bổng trực tuyến',
        summary: 'Trợ lý AI tích hợp giúp sinh viên tự động hóa việc viết thư ngỏ, tối ưu hóa hồ sơ và kiểm tra tính hợp lệ nhanh chóng.',
        date: '05/06/2026',
        category: 'Thong bao',
        image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=300&auto=format&fit=crop'
      }
    ]);
    setSidebar([
      {
        id: 2,
        title: 'Hội thảo "Đồng hành cùng ước mơ giảng đường" kết nối các nhà tài trợ lớn',
        summary: 'Kết nối các doanh nghiệp và cựu sinh viên nhằm tạo nguồn tài trợ vững chắc cho sinh viên vượt khó tại trường.',
        date: '08/06/2026',
        category: 'Su kien',
        image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=300&auto=format&fit=crop'
      },
      {
        id: 3,
        title: 'TVU ra mắt Trợ lý AI hỗ trợ sinh viên tối ưu hóa hồ sơ xin học bổng trực tuyến',
        summary: 'Trợ lý AI tích hợp giúp sinh viên tự động hóa việc viết thư ngỏ, tối ưu hóa hồ sơ.',
        date: '05/06/2026',
        category: 'Thong bao',
        image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=300&auto=format&fit=crop'
      },
      {
        id: 4,
        title: 'Nhà tài trợ vàng công bố gói hỗ trợ y tế khẩn cấp cho sinh viên khó khăn',
        summary: 'Gói hỗ trợ y tế bao gồm chi phí nằm viện, bảo hiểm y tế và chăm sóc sức khỏe định kỳ cho sinh viên.',
        date: '01/06/2026',
        category: 'Khac',
        image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=300&auto=format&fit=crop'
      }
    ]);
  };

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const response = await newsService.getLandingNews();
        
        if (response.success && response.data) {
          const mapNewsItem = (item) => {
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

          const mappedFeatured = mapNewsItem(response.data.featured);
          const mappedFeaturedSmall = (response.data.featuredSmall || []).map(mapNewsItem).filter(Boolean);
          const mappedSidebar = (response.data.sidebar || []).map(mapNewsItem).filter(Boolean);

          // Nếu API trả về trống rỗng (không có tin nổi bật nào), dùng mock data
          if (!mappedFeatured && mappedFeaturedSmall.length === 0 && mappedSidebar.length === 0) {
            handleFallback();
          } else {
            setFeatured(mappedFeatured);
            setFeaturedSmall(mappedFeaturedSmall);
            setSidebar(mappedSidebar);
          }
        } else {
          handleFallback();
        }
      } catch (error) {
        console.error('Error fetching public news:', error);
        handleFallback();
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

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

  return (
    <section className={styles.newsSection}>
      <div className={styles.container}>
        {/* Section Header */}
        <div className={styles.header}>
          <div className={styles.titleContainer}>
            <span className={styles.decoratorLine} />
            <h2 className={styles.title}>TIN TỨC & SỰ KIỆN</h2>
          </div>
          <p className={styles.subtitle}>
            Cập nhật những hoạt động mới nhất về quỹ hỗ trợ và học bổng tại Trường Đại học Trà Vinh
          </p>
        </div>

        {/* Content Layout */}
        <div className={styles.contentGrid}>
          {/* Left Column: Featured Large & Small */}
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

          {/* Right Column: Sidebar */}
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
