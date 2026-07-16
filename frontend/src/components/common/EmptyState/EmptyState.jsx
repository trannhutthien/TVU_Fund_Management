import PropTypes from 'prop-types';
import { HiOutlineInbox } from 'react-icons/hi2';
import styles from './EmptyState.module.scss';

const EmptyState = ({
  icon: Icon = HiOutlineInbox,
  message = 'Chưa có dữ liệu',
  description,
  action,
}) => (
  <div className={styles.empty}>
    <Icon className={styles.icon} />
    <p className={styles.message}>{message}</p>
    {description && <p className={styles.description}>{description}</p>}
    {action && <div className={styles.action}>{action}</div>}
  </div>
);

EmptyState.propTypes = {
  icon: PropTypes.elementType,
  message: PropTypes.string,
  description: PropTypes.string,
  action: PropTypes.node,
};

export default EmptyState;
