import styles from './ChucVuCard.module.scss';

const ChucVuCard = ({ hoTen, chucDanh, anh, ngayBatDau, ngayKetThuc, moTa }) => {
  const formatYear = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).getFullYear();
  };

  const namBatDau = formatYear(ngayBatDau);
  const namKetThuc = formatYear(ngayKetThuc);
  const nhiemKy = namBatDau
    ? namKetThuc
      ? `${namBatDau} - ${namKetThuc}`
      : `${namBatDau} - nay`
    : '';

  return (
    <div className={styles.card}>
      <div className={styles.avatarWrapper}>
        {anh ? (
          <img
            src={anh.startsWith('http') ? anh : `${import.meta.env?.VITE_API_BASE_URL?.replace(/\/api\/?$/, '') || 'http://localhost:5001'}${anh}`}
            alt={hoTen}
            className={styles.avatar}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div
          className={styles.avatarFallback}
          style={{ display: anh ? 'none' : 'flex' }}
        >
          {hoTen?.charAt(0)?.toUpperCase() || '?'}
        </div>
      </div>
      <div className={styles.info}>
        <h4 className={styles.name}>{hoTen}</h4>
        <p className={styles.role}>{chucDanh}</p>
        {nhiemKy && <p className={styles.term}>Nhiệm kỳ: {nhiemKy}</p>}
        {moTa && <p className={styles.desc}>{moTa}</p>}
      </div>
    </div>
  );
};

export default ChucVuCard;
