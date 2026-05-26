import { useNavigate } from 'react-router-dom';
import { HiOutlineClipboardDocumentCheck } from 'react-icons/hi2';
import Button from '@components/common/Button/Button';
import useAuthStore from '@stores/authStore';
import { getGreeting } from '../../utils';
import styles from './WelcomeHeader.module.scss';

const WelcomeHeader = ({ pendingCount = 0 }) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const displayName = user?.hoTen || user?.ho_ten || 'Giáo vụ';
  const today = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <header className={styles.header}>
      <div className={styles.headerText}>
        <h1 className={styles.greeting}>
          {getGreeting()},{' '}
          <span className={styles.userName}>{displayName}</span>!
        </h1>
        <p className={styles.todayLine}>Hôm nay là {today}</p>
      </div>
      <Button
        variant="primary"
        leftIcon={<HiOutlineClipboardDocumentCheck />}
        onClick={() => navigate('/can-bo/xet-duyet')}
      >
        Đi đến Xét duyệt
        {pendingCount > 0 && (
          <span className={styles.headerBadge}>{pendingCount}</span>
        )}
      </Button>
    </header>
  );
};

export default WelcomeHeader;
