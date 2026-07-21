import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { HiOutlineUser } from 'react-icons/hi2';
import { userService } from '@services/userService';
import styles from './StudentInfoCard.module.scss';

const GIOI_TINH_MAP = { Nam: 'Nam', Nu: 'Nữ', Khac: 'Khác' };

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('vi-VN');
  } catch {
    return dateStr;
  }
};

const StudentInfoCard = ({ userId, fallback }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!userId) return undefined;
    let mounted = true;
    setLoading(true);
    setError(false);
    userService
      .getById(userId)
      .then((res) => {
        if (!mounted) return;
        setUser(res?.data || res?.user || null);
      })
      .catch(() => {
        if (mounted) setError(true);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [userId]);

  const data = user || fallback || {};

  const hoTen = data.hoTen || '—';
  const mssv = data.maSoDinhDanh || '—';
  const khoaPhong = data.khoaPhong || '—';
  const email = data.email || '';
  const sdt = data.soDienThoai || '';
  const gioiTinh = GIOI_TINH_MAP[data.gioiTinh] || data.gioiTinh || '—';
  const ngaySinh = formatDate(data.ngaySinh);
  const donViCongTac = data.donViCongTac || '—';

  return (
    <section className={styles.card}>
      <div className={styles.cardHeader}>
        <HiOutlineUser className={styles.headerIcon} />
        <h2 className={styles.cardTitle}>Thông tin người nộp</h2>
      </div>

      {loading ? (
        <div className={styles.placeholder}>Đang tải...</div>
      ) : error && !user ? (
        <div className={styles.placeholder}>Không tải được thông tin</div>
      ) : (
        <div className={styles.grid}>
          <div className={styles.field}>
            <div className={styles.label}>Họ và tên</div>
            <div className={styles.value}>{hoTen}</div>
          </div>

          <div className={styles.field}>
            <div className={styles.label}>Mã số định danh</div>
            <div className={styles.value}>{mssv}</div>
          </div>

          <div className={styles.field}>
            <div className={styles.label}>Khoa / Phòng</div>
            <div className={styles.value}>{khoaPhong}</div>
          </div>

          <div className={styles.field}>
            <div className={styles.label}>Email</div>
            {email ? (
              <a className={`${styles.value} ${styles.link}`} href={`mailto:${email}`}>
                {email}
              </a>
            ) : (
              <div className={styles.value}>—</div>
            )}
          </div>

          <div className={styles.field}>
            <div className={styles.label}>Số điện thoại</div>
            {sdt ? (
              <a className={`${styles.value} ${styles.link}`} href={`tel:${sdt}`}>
                {sdt}
              </a>
            ) : (
              <div className={styles.value}>—</div>
            )}
          </div>

          <div className={styles.field}>
            <div className={styles.label}>Giới tính</div>
            <div className={styles.value}>{gioiTinh}</div>
          </div>

          <div className={styles.field}>
            <div className={styles.label}>Ngày sinh</div>
            <div className={styles.value}>{ngaySinh}</div>
          </div>

          <div className={styles.field}>
            <div className={styles.label}>Đơn vị công tác</div>
            <div className={styles.value}>{donViCongTac}</div>
          </div>
        </div>
      )}
    </section>
  );
};

StudentInfoCard.propTypes = {
  userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  fallback: PropTypes.shape({
    hoTen: PropTypes.string,
    maSoDinhDanh: PropTypes.string,
    khoaPhong: PropTypes.string,
    email: PropTypes.string,
    soDienThoai: PropTypes.string,
  }),
};

export default StudentInfoCard;
