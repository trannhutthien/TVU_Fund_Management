import PropTypes from 'prop-types';
import styles from './BackgroundImage.module.scss';

/**
 * BackgroundImage Component
 * 
 * Component wrapper với background image và overlay
 * Sử dụng cho các page cần background ảnh khuôn viên trường
 * 
 * @param {ReactNode} children - Nội dung bên trong
 * @param {string} className - Custom class cho wrapper
 * @param {string} overlayType - Loại overlay: 'dark' | 'light' | 'none'
 * @param {string} imageUrl - URL ảnh nền tùy chỉnh (optional, mặc định dùng ảnh khuôn viên trường)
 */
const BackgroundImage = ({ 
  children, 
  className = '', 
  overlayType = 'dark',
  imageUrl = null
}) => {
  const overlayClass = overlayType !== 'none' ? styles[`overlay-${overlayType}`] : '';

  return (
    <div className={`${styles.backgroundWrapper} ${className}`}>
      {/* Background Image */}
      <div 
        className={styles.backgroundImage}
        style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : {}}
      />
      
      {/* Overlay */}
      {overlayType !== 'none' && (
        <div className={`${styles.overlay} ${overlayClass}`} />
      )}
      
      {/* Content */}
      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
};

BackgroundImage.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  overlayType: PropTypes.oneOf(['dark', 'light', 'none']),
  imageUrl: PropTypes.string,
};

export default BackgroundImage;
