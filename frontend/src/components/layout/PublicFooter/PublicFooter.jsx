import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '@components/common/Logo/Logo';
import SocialLinks from '@components/common/SocialLinks/SocialLinks';
import styles from './PublicFooter.module.scss';

/**
 * PublicFooter Component
 * 
 * Footer cho trang public của hệ thống TVU Fund Management
 * Gồm: Thông tin tổ chức, Điều hướng, Kết nối mạng xã hội, Copyright
 * 
 * Layout: 3 cột (Thông tin | Điều hướng | Kết nối)
 * Responsive: Desktop (3 cột) → Tablet (2 cột) → Mobile (1 cột)
 */
const PublicFooter = () => {
  // Navigation links
  const navigationLinks = [
    { label: 'Điều lệ Quỹ', path: '/regulations' },
    { label: 'Báo cáo tài chính', path: '/financial-reports' },
    { label: 'Tin tức & Sự kiện', path: '/news' },
    { label: 'Đối tác đồng hành', path: '/partners' },
    { label: 'Câu hỏi thường gặp', path: '/faq' },
    { label: 'Chính sách bảo mật', path: '/privacy-policy' },
  ];

  // Social links cho TVU
  const socialLinks = [
    { 
      type: 'facebook', 
      url: 'https://www.facebook.com/dhtravinh', 
      label: 'Facebook' 
    },
    { 
      type: 'youtube', 
      url: 'https://www.youtube.com/@dhtravinh', 
      label: 'YouTube' 
    },
    { 
      type: 'linkedin', 
      url: 'https://www.linkedin.com/school/tra-vinh-university', 
      label: 'LinkedIn' 
    },
  ];

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* Main Content - 3 Columns */}
        <div className={styles.content}>
          {/* Column 1 - Organization Info */}
          <div className={styles.column}>
            <div className={styles.logoSection}>
              <Logo 
                size="md" 
                variant="full" 
                theme="dark"
                title="TVU Fund"
                subtitle="Quản lý Quỹ & Tài chính"
              />
            </div>

            <div className={styles.infoList}>
              {/* Address */}
              <div className={styles.infoItem}>
                <span className={styles.icon}>
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                </span>
                <span className={styles.text}>
                  Phòng Công tác sinh viên – Đại học Trà Vinh,<br />
                  126 Nguyễn Thiện Thành, Khóm 4, Phường 5, TP. Trà Vinh
                </span>
              </div>

              {/* Email */}
              <div className={styles.infoItem}>
                <span className={styles.icon}>
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                  </svg>
                </span>
                <a href="mailto:phongctsv@tvu.edu.vn" className={styles.link}>
                  phongctsv@tvu.edu.vn
                </a>
              </div>

              {/* Phone */}
              <div className={styles.infoItem}>
                <span className={styles.icon}>
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                  </svg>
                </span>
                <a href="tel:+842943855246" className={styles.link}>
                  (0294) 3855 246
                </a>
              </div>

              {/* Working Hours */}
              <div className={styles.infoItem}>
                <span className={styles.icon}>
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />
                    <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                  </svg>
                </span>
                <span className={styles.text}>
                  Thứ 2 – Thứ 6: 7:30 – 17:00
                </span>
              </div>
            </div>
          </div>

          {/* Column 2 - Navigation */}
          <div className={styles.column}>
            <h3 className={styles.columnTitle}>VỀ CHÚNG TÔI</h3>
            <nav className={styles.navList}>
              {navigationLinks.map((link, index) => (
                <Link 
                  key={index} 
                  to={link.path} 
                  className={styles.navLink}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Column 3 - Social Connect */}
          <div className={styles.column}>
            <h3 className={styles.columnTitle}>KẾT NỐI VỚI CHÚNG TÔI</h3>
            
            <div className={styles.socialSection}>
              <SocialLinks 
                links={socialLinks}
                variant="circle"
                color="brand"
                size="lg"
              />
            </div>

            <p className={styles.socialDescription}>
              Theo dõi chúng tôi để cập nhật thông tin học bổng và hỗ trợ sinh viên mới nhất.
            </p>
          </div>
        </div>

        {/* Copyright Bar */}
        <div className={styles.copyright}>
          <p className={styles.copyrightText}>
             2026 TVU Fund – Phòng Công tác sinh viên – Đại học Trà Vinh. 126 Nguyễn Thiện Thành.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;
