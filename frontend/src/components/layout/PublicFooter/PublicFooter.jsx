import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import Logo from '@components/common/Logo/Logo';
import SocialLinks from '@components/common/SocialLinks/SocialLinks';
import { useSystemSettings } from '@hooks/useSystemSettings';
import styles from './PublicFooter.module.scss';

const PublicFooter = () => {
  const { settings } = useSystemSettings();

  const navigationLinks = [
    { label: 'Điều lệ Quỹ', path: '/regulations' },
    { label: 'Báo cáo tài chính', path: '/financial-reports' },
    { label: 'Tin tức & Sự kiện', path: '/news' },
    { label: 'Đối tác đồng hành', path: '/partners' },
    { label: 'Câu hỏi thường gặp', path: '/faq' },
    { label: 'Chính sách bảo mật', path: '/privacy-policy' },
  ];

  const socialLinks = useMemo(() => ([
    settings.facebook_url && {
      type: 'facebook',
      url: settings.facebook_url,
      label: 'Facebook',
    },
    settings.youtube_url && {
      type: 'youtube',
      url: settings.youtube_url,
      label: 'YouTube',
    },
    settings.linkedin_url && {
      type: 'linkedin',
      url: settings.linkedin_url,
      label: 'LinkedIn',
    },
  ].filter(Boolean)), [settings]);

  const supportEmail = settings.email_ho_tro || settings.email_lien_he;
  const phoneHref = `tel:${String(settings.so_dien_thoai || '').replace(/[^\d+]/g, '')}`;

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.column}>
            <div className={styles.logoSection}>
              <Logo
                size="md"
                variant="full"
                theme="dark"
                title={settings.ten_he_thong || 'TVU Fund'}
                subtitle={settings.don_vi_quan_ly || 'Quản lý Quỹ & Tài chính'}
              />
            </div>

            <div className={styles.infoList}>
              <div className={styles.infoItem}>
                <span className={styles.icon}>
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                </span>
                <span className={styles.text}>
                  {settings.don_vi_quan_ly}<br />
                  {settings.dia_chi_lien_he}
                </span>
              </div>

              <div className={styles.infoItem}>
                <span className={styles.icon}>
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                  </svg>
                </span>
                <a href={`mailto:${supportEmail}`} className={styles.link}>
                  {supportEmail}
                </a>
              </div>

              <div className={styles.infoItem}>
                <span className={styles.icon}>
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                  </svg>
                </span>
                <a href={phoneHref} className={styles.link}>
                  {settings.so_dien_thoai}
                </a>
              </div>

              <div className={styles.infoItem}>
                <span className={styles.icon}>
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />
                    <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                  </svg>
                </span>
                <span className={styles.text}>{settings.gio_lam_viec}</span>
              </div>
            </div>
          </div>

          <div className={styles.column}>
            <h3 className={styles.columnTitle}>{settings?.footer_about_title || 'VỀ CHÚNG TÔI'}</h3>
            <nav className={styles.navList}>
              {navigationLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={styles.navLink}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className={styles.column}>
            <h3 className={styles.columnTitle}>{settings?.footer_social_title || 'KẾT NỐI VỚI CHÚNG TÔI'}</h3>

            {socialLinks.length > 0 && (
              <div className={styles.socialSection}>
                <SocialLinks
                  links={socialLinks}
                  variant="circle"
                  color="brand"
                  size="lg"
                />
              </div>
            )}

            <p className={styles.socialDescription}>
              {settings?.footer_social_desc || 'Theo dõi chúng tôi để cập nhật thông tin học bổng và hỗ trợ sinh viên mới nhất.'}
            </p>
          </div>
        </div>

        <div className={styles.copyright}>
          <p className={styles.copyrightText}>
            2026 {settings.ten_he_thong} - {settings.don_vi_quan_ly}. {settings.dia_chi_lien_he}.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;
