import PropTypes from 'prop-types';
import styles from './SkeletonCards.module.scss';

const SkeletonCards = ({ count = 4, className }) => (
  <div className={`${styles.grid} ${className || ''}`}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className={styles.card}>
        <div className={styles.iconSkeleton} />
        <div className={styles.textGroup}>
          <div className={styles.valueSkeleton} />
          <div className={styles.labelSkeleton} />
        </div>
      </div>
    ))}
  </div>
);

SkeletonCards.propTypes = {
  count: PropTypes.number,
  className: PropTypes.string,
};

export default SkeletonCards;
