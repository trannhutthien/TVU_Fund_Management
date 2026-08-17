import { useState, useEffect } from 'react';
import {
  HiOutlineUser,
  HiOutlineEnvelope,
  HiOutlinePhone,
  HiOutlineAcademicCap,
  HiOutlineBriefcase,
  HiOutlineCalendarDays,
  HiOutlineUserCircle,
  HiOutlineUserGroup,
  HiOutlineMapPin,
} from 'react-icons/hi2';
import userService from '@services/userService';
import styles from './StudentInfoCard.module.scss';

const LOAI_TAI_KHOAN_MAP = {
  sinhvien:   { label: 'Sinh viên',   cls: 'student' },
  canbo:      { label: 'Cán bộ',      cls: 'staff' },
  nhakhoahoc: { label: 'Nhà khoa học', cls: 'researcher' },
};

const StudentInfoCard = ({ userId, fallback }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setUser(fallback || null);
      setLoading(false);
      return;
    }
    let mounted = true;
    setLoading(true);
    userService.getById(userId)
      .then((res) => {
        const userData = res?.user || res?.data?.user || res?.data || res || null;
        if (mounted) setUser(userData || fallback || null);
      })
      .catch(() => {
        if (mounted) setUser(fallback || null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, [userId, fallback]);

  if (loading) {
    return (
      <div className={styles.card}>
        <div className={styles.skeleton}>Đang tải thông tin...</div>
      </div>
    );
  }

  if (!user) return null;

  const loaiTK = LOAI_TAI_KHOAN_MAP[user.loaiTaiKhoan || user.loaitaikhoan] || LOAI_TAI_KHOAN_MAP.sinhvien;
  const danhNghia = user.danhNghia || user.danhnghia;
  const tenDaiDien = user.tenDaiDien || user.tendaidien;
  const tinhTrangCongTac = user.tinhTrangCongTac || user.tinhtrangcongtac;
  const isStaff = loaiTK.cls === 'staff' || loaiTK.cls === 'researcher';

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <HiOutlineUserCircle size={18} className={styles.headerIcon} />
        <h3 className={styles.headerTitle}>Thông tin người nộp đơn</h3>
      </div>

      {danhNghia && (
        <div className={styles.collectiveBanner}>
          <HiOutlineUserGroup size={14} />
          <span>Nộp với danh nghĩa: <strong>{danhNghia}</strong>{tenDaiDien ? ` — ${tenDaiDien}` : ''}</span>
        </div>
      )}

      <div className={styles.twoCol}>
        {/* Cột trái */}
        <div className={styles.col}>
          <div className={styles.avatarRow}>
            <div className={styles.avatar}>
              {user.avatar ? (
                <img src={user.avatar} alt={user.hoTen || user.hoten} />
              ) : (
                <HiOutlineUser size={24} />
              )}
            </div>
            <div className={styles.nameBlock}>
              <span className={styles.name}>{user.hoTen || user.hoten || '—'}</span>
              <span className={`${styles.typeBadge} ${styles[loaiTK.cls]}`}>{loaiTK.label}</span>
            </div>
          </div>
          <div className={styles.field}>
            <HiOutlineEnvelope size={14} className={styles.fieldIcon} />
            <a href={`mailto:${user.email}`} className={styles.fieldLink}>{user.email || '—'}</a>
          </div>
          <div className={styles.field}>
            <HiOutlinePhone size={14} className={styles.fieldIcon} />
            <a href={`tel:${user.soDienThoai || user.sodienthoai}`} className={styles.fieldLink}>{user.soDienThoai || user.sodienthoai || '—'}</a>
          </div>
          {(user.ngaySinh || user.ngaysinh) && (
            <div className={styles.field}>
              <HiOutlineCalendarDays size={14} className={styles.fieldIcon} />
              <span className={styles.fieldValue}>{user.ngaySinh || user.ngaysinh}</span>
            </div>
          )}
          {(user.gioiTinh || user.gioitinh) && (
            <div className={styles.field}>
              <HiOutlineUserCircle size={14} className={styles.fieldIcon} />
              <span className={styles.fieldValue}>{user.gioiTinh || user.gioitinh}</span>
            </div>
          )}
          {(user.diaChi || user.diachi) && (
            <div className={styles.field}>
              <HiOutlineMapPin size={14} className={styles.fieldIcon} />
              <span className={styles.fieldValue}>{user.diaChi || user.diachi}</span>
            </div>
          )}
        </div>

        {/* Cột phải */}
        <div className={styles.col}>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Mã số định danh</span>
            <span className={styles.fieldValue}>{user.maSoDinhDanh || user.masodinhdanh || '—'}</span>
          </div>
          <div className={styles.field}>
            <HiOutlineAcademicCap size={14} className={styles.fieldIcon} />
            <span className={styles.fieldValue}>{user.khoa || user.khoaPhong || user.donviCongTac || user.donvicongtac || '—'}</span>
          </div>
          <div className={styles.field}>
            <HiOutlineBriefcase size={14} className={styles.fieldIcon} />
            <span className={styles.fieldValue}>{user.lop || '—'}</span>
          </div>
          {isStaff && tinhTrangCongTac && (
            <div className={styles.field}>
              <span className={styles.fieldLabel}>Tình trạng công tác</span>
              <span className={`${styles.statusDot} ${tinhTrangCongTac === 'Dang cong tac' ? styles.active : styles.inactive}`}>
                {tinhTrangCongTac === 'Dang cong tac' ? 'Đang công tác' : 'Đã nghỉ hưu'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentInfoCard;
