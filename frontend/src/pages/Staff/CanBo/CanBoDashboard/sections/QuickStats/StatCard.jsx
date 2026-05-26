import { useNavigate } from 'react-router-dom';
import styles from './QuickStats.module.scss';

const StatCard = ({ card }) => {
  const navigate = useNavigate();
  const Icon = card.icon;
  const isUrgent = card.urgent && Number(card.value) > 0;
  const isClickable = !!card.link;

  const handleClick = () => {
    if (isClickable) navigate(card.link);
  };

  return (
    <div
      className={`${styles.statCard} ${
        isUrgent ? styles.statUrgent : ''
      } ${isClickable ? styles.statClickable : ''}`}
      onClick={handleClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={(e) => {
        if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <div
        className={styles.statIconWrap}
        style={{
          background: card.bgColor,
          color: card.color,
        }}
      >
        <Icon className={styles.statIcon} />
      </div>
      <div className={styles.statText}>
        <div className={styles.statValue}>{card.value}</div>
        <div className={styles.statLabel}>{card.label}</div>
        <div className={styles.statSub}>{card.subText}</div>
      </div>
    </div>
  );
};

export default StatCard;
