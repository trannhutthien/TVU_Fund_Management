import PropTypes from 'prop-types';
import styles from './FundTitleSection.module.scss';

const FundTitleSection = ({ 
  title = 'Danh mục các Quỹ', 
  highlight = 'Hỗ trợ & Học bổng',
  subtitle = 'Tìm kiếm cơ hội phù hợp để đồng hành cùng con đường tri thức của bạn.',
  variant = 'default'
}) => {
  const sectionClass = variant === 'transparent'
    ? styles.fundTitleSectionTransparent
    : styles.fundTitleSection;

  return (
    <section className={sectionClass}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>
            {title}{' '}
            <span className={styles.highlight}>{highlight}</span>
          </h1>
          <p className={styles.subtitle}>
            {subtitle}
          </p>
        </div>
      </div>
    </section>
  );
};

FundTitleSection.propTypes = {
  title: PropTypes.string,
  highlight: PropTypes.string,
  subtitle: PropTypes.string,
  variant: PropTypes.oneOf(['default', 'transparent']),
};

export default FundTitleSection;
