import PropTypes from 'prop-types';
import styles from './PageLayout.module.scss';

const PageLayout = ({
  breadcrumbs = [],
  title,
  subtitle,
  icon: Icon,
  actions,
  children,
}) => (
  <div className={styles.page}>
    <div className={styles.inner}>
      {breadcrumbs.length > 0 && (
        <nav className={styles.breadcrumb}>
          {breadcrumbs.map((crumb, idx) => (
            <span key={idx} className={idx === breadcrumbs.length - 1 ? styles.breadcrumbActive : undefined}>
              {crumb}
              {idx < breadcrumbs.length - 1 && <span className={styles.breadcrumbSep}>/</span>}
            </span>
          ))}
        </nav>
      )}

      {(title || actions) && (
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            {Icon && <Icon className={styles.headerIcon} />}
            <div>
              {title && <h1 className={styles.title}>{title}</h1>}
              {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
            </div>
          </div>
          {actions && <div className={styles.headerActions}>{actions}</div>}
        </header>
      )}

      {children}
    </div>
  </div>
);

PageLayout.propTypes = {
  breadcrumbs: PropTypes.arrayOf(PropTypes.string),
  title: PropTypes.string,
  subtitle: PropTypes.string,
  icon: PropTypes.elementType,
  actions: PropTypes.node,
  children: PropTypes.node,
};

export default PageLayout;
