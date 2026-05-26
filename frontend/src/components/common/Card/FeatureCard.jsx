import PropTypes from 'prop-types';
import './FeatureCard.scss';

/**
 * FeatureCard Component
 * 
 * Card hiển thị tính năng với icon, title, và description
 * Dùng cho sections giới thiệu features, benefits, services
 * 
 * @param {React.ReactNode} icon - Icon component từ react-icons
 * @param {string} title - Tiêu đề tính năng
 * @param {string} description - Mô tả chi tiết
 * @param {string} iconBgColor - Màu nền icon: 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
 * @param {function} onClick - Hàm xử lý click (optional)
 * @param {string} className - Custom class (optional)
 */
const FeatureCard = ({
  icon,
  title,
  description,
  iconBgColor = 'primary',
  onClick,
  className = '',
}) => {
  const cardClasses = [
    'feature-card',
    onClick && 'feature-card-clickable',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const iconWrapperClasses = `feature-card-icon-wrapper feature-card-icon-${iconBgColor}`;

  return (
    <div className={cardClasses} onClick={onClick}>
      {/* Icon */}
      <div className={iconWrapperClasses}>
        <div className="feature-card-icon">
          {icon}
        </div>
      </div>

      {/* Content */}
      <div className="feature-card-content">
        {/* Title */}
        <h3 className="feature-card-title">{title}</h3>

        {/* Description */}
        <p className="feature-card-description">{description}</p>
      </div>
    </div>
  );
};

FeatureCard.propTypes = {
  icon: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  iconBgColor: PropTypes.oneOf(['primary', 'secondary', 'success', 'warning', 'danger']),
  onClick: PropTypes.func,
  className: PropTypes.string,
};

export default FeatureCard;
