import PropTypes from 'prop-types';
import {
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineXCircle,
  HiOutlineExclamationTriangle,
  HiOutlineUser,
} from 'react-icons/hi2';
import styles from './NghiemThuTimeline.module.scss';

const KET_QUA_MAP = {
  'Cho danh gia': { label: 'Chờ đánh giá', icon: HiOutlineClock, color: '#94a3b8' },
  'Dat': { label: 'Đạt', icon: HiOutlineCheckCircle, color: '#16a34a' },
  'Dat co dieu chinh': { label: 'Đạt có điều chỉnh', icon: HiOutlineExclamationTriangle, color: '#d97706' },
  'Khong dat': { label: 'Không đạt', icon: HiOutlineXCircle, color: '#dc2626' },
};

const LOAI_KIEM_TRA_LABEL = {
  'Kiem tra tien do': 'Kiểm tra tiến độ',
  'Nghiem thu cuoi cung': 'Nghiệm thu cuối cùng',
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  return `${d.toLocaleDateString('vi-VN')} lúc ${d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
};

const NghiemThuTimeline = ({ history }) => {
  if (!history || history.length === 0) return null;

  return (
    <div className={styles.timeline}>
      {history.map((item, idx) => {
        const kq = KET_QUA_MAP[item.ketqua] || KET_QUA_MAP['Cho danh gia'];
        const Icon = kq.icon;
        const isLast = idx === history.length - 1;
        const isFinalInspection = item.loaiKiemTra === 'Nghiem thu cuoi cung';

        return (
          <div
            key={item.nghiemthuId || idx}
            className={`${styles.item} ${isLast ? styles.itemLast : ''}`}
          >
            <div className={styles.dotCol}>
              <div
                className={`${styles.dot} ${isFinalInspection ? styles.dotFinal : ''}`}
                style={{ background: kq.color }}
              >
                <Icon size={14} className={styles.dotIcon} />
              </div>
              {idx < history.length - 1 && <div className={styles.line} />}
            </div>

            <div className={styles.content}>
              <div className={styles.titleRow}>
                <span className={styles.lanLabel}>Lần {item.lanthu}</span>
                <span className={styles.loaiTag} data-final={isFinalInspection || undefined}>
                  {LOAI_KIEM_TRA_LABEL[item.loaiKiemTra] || item.loaiKiemTra}
                </span>
                <span className={styles.ketquaTag} style={{ color: kq.color, background: `${kq.color}12` }}>
                  {kq.label}
                </span>
              </div>

              {item.nhanXet && (
                <div className={styles.nhanxet}>{item.nhanXet}</div>
              )}

              <div className={styles.meta}>
                {item.tenNguoiNghiemThu && (
                  <span className={styles.metaItem}>
                    <HiOutlineUser size={13} />
                    {item.tenNguoiNghiemThu}
                  </span>
                )}
                {item.ngayNghiemThu && (
                  <span className={styles.metaItem}>
                    {formatDateTime(item.ngayNghiemThu)}
                  </span>
                )}
                {item.soQuyetDinh && (
                  <span className={styles.metaItem}>QĐ: {item.soQuyetDinh}</span>
                )}
                {item.fileBienBan && (
                  <span className={styles.metaItem}>
                    <a
                      href={item.fileBienBan}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.fileLink}
                    >
                      📎 Tải biên bản
                    </a>
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

NghiemThuTimeline.propTypes = {
  history: PropTypes.arrayOf(
    PropTypes.shape({
      nghiemthuId: PropTypes.number,
      lanthu: PropTypes.number,
      loaiKiemTra: PropTypes.string,
      ketqua: PropTypes.string,
      nhanXet: PropTypes.string,
      tenNguoiNghiemThu: PropTypes.string,
      ngayNghiemThu: PropTypes.string,
      soQuyetDinh: PropTypes.string,
      fileBienBan: PropTypes.string,
    }),
  ),
};


export default NghiemThuTimeline;
