import { useEffect, useState } from 'react';
import {
  HiOutlineXMark,
  HiOutlinePlusCircle,
  HiOutlinePaperClip,
  HiOutlineHandRaised,
} from 'react-icons/hi2';
import Button from '@components/common/Button/Button';
import StatusBadge from '@components/common/StatusBadge/StatusBadge';
import { getDonorDetail, getPublicDonorDetail } from '@services/donorService';
import { formatCurrency, getInitial } from '@utils/formatters';
import styles from './NhaTaiTroDetailDrawer.module.scss';

const LOAI_LABEL = {
  'Ca nhan': 'Cá nhân',
  'Doanh nghiep': 'Doanh nghiệp',
  'To chuc': 'Tổ chức',
  'Doi tac': 'Đối tác',
};

const STATUS_MAP = {
  'Cho duyet': 'pending',     // chưa ai duyệt
  'Da duyet': 'processing',   // Cán bộ đã duyệt cấp 1, chờ Kế toán
  'Da nhan': 'approved',      // Kế toán đã duyệt cấp 2, tiền vào quỹ
  'Tu choi': 'rejected',
};

const formatDate = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('vi-VN');
};

const formatMonthYear = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
};

const apiOrigin = () => {
  const base = import.meta.env?.VITE_API_BASE_URL || '';
  return base.replace(/\/api\/?$/, '');
};

const NhaTaiTroDetailDrawer = ({ sponsor, onClose, onGhiTaiTro, isPublic = false }) => {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sponsor?.nha_tai_tro_id) return;
    setLoading(true);
    const fetchDetail = isPublic
      ? getPublicDonorDetail(sponsor.nha_tai_tro_id)
      : getDonorDetail(sponsor.nha_tai_tro_id);

    fetchDetail
      .then((res) => setDetail(res?.data || null))
      .catch(() => setDetail(null))
      .finally(() => setLoading(false));
  }, [sponsor?.nha_tai_tro_id, isPublic]);

  if (!sponsor) return null;

  // Fallback: lúc loading dùng dữ liệu list để render skeleton có thông tin
  const data = detail || sponsor;
  const lichSu = detail?.lich_su || [];

  return (
    <>
      <div className={styles.backdrop} onClick={onClose} />
      <aside className={styles.drawer}>
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.headerTitle}>Thông tin nhà tài trợ</h2>
          <div className={styles.headerActions}>
            {!isPublic && onGhiTaiTro && (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<HiOutlinePlusCircle />}
                onClick={onGhiTaiTro}
              >
                Ghi nhận tài trợ
              </Button>
            )}
            <button
              type="button"
              className={styles.closeBtn}
              onClick={onClose}
              aria-label="Đóng"
            >
              <HiOutlineXMark />
            </button>
          </div>
        </div>

        {/* Profile */}
        <section className={styles.profile}>
          <div className={styles.avatar}>
            {data.avatar ? (
              <img src={data.avatar} alt={data.ten_nha_tai_tro} />
            ) : (
              <span>{getInitial(data.ten_nha_tai_tro)}</span>
            )}
          </div>
          <div className={styles.profileText}>
            <h3 className={styles.profileName}>{data.ten_nha_tai_tro}</h3>
            <span className={styles.loaiBadge}>
              {LOAI_LABEL[data.loai] || data.loai}
            </span>
            {!isPublic && (
              <div className={styles.profileMeta}>
                {data.email && <div>{data.email}</div>}
                {data.so_dien_thoai && <div>{data.so_dien_thoai}</div>}
                {data.dia_chi && (
                  <div className={styles.address}>{data.dia_chi}</div>
                )}
              </div>
            )}
            <div className={styles.joinDate}>
              Thành viên từ {formatMonthYear(data.created_at)}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className={styles.statsGrid}>
          <div className={styles.statBox}>
            <div className={styles.statValue}>
              {formatCurrency(data.tong_da_dong_gop)}
            </div>
            <div className={styles.statLabel}>Tổng đóng góp</div>
          </div>
          <div className={styles.statBox}>
            <div className={styles.statValue}>{data.so_khoan ?? 0}</div>
            <div className={styles.statLabel}>Số khoản</div>
          </div>
          <div className={styles.statBox}>
            <div className={styles.statValueSmall}>
              {formatDate(data.lan_cuoi)}
            </div>
            <div className={styles.statLabel}>Lần cuối</div>
          </div>
        </section>

        <div className={styles.divider} />

        {/* Additional Details */}
        <section className={styles.detailsSection}>
          <div className={styles.sectionTitle}>THÔNG TIN BỔ SUNG</div>
          <div className={styles.detailsGrid}>
            {data.website && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Website:</span>
                <span className={styles.detailValue}>
                  <a
                    href={data.website.startsWith('http') ? data.website : `https://${data.website}`}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.webLink}
                  >
                    {data.website}
                  </a>
                </span>
              </div>
            )}
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Trạng thái:</span>
              <span className={styles.detailValue}>
                <span
                  className={
                    data.trangthai === 'Hoat dong' || data.trangthai === 'Active'
                      ? styles.statusActive
                      : styles.statusInactive
                  }
                >
                  {data.trangthai === 'Hoat dong' || data.trangthai === 'Active'
                    ? 'Đang hoạt động'
                    : 'Ngừng hoạt động'}
                </span>
              </span>
            </div>
            {!isPublic && (
              data.nguoidung_id ? (
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Tài khoản liên kết:</span>
                  <span className={styles.detailValue}>
                    <span className={styles.linkedUser}>
                      {data.ho_ten} (ID: {data.nguoidung_id})
                    </span>
                  </span>
                </div>
              ) : (
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Tài khoản liên kết:</span>
                  <span className={styles.detailValue}>Không có (Nhà tài trợ vãng lai)</span>
                </div>
              )
            )}
          </div>
          {data.mota && (
            <div className={styles.motaBox}>
              <div className={styles.motaLabel}>Giới thiệu / Mô tả:</div>
              <div className={styles.motaText}>{data.mota}</div>
            </div>
          )}
        </section>

        <div className={styles.divider} />

        {/* Lịch sử */}
        <section className={styles.historySection}>
          <div className={styles.historyHead}>
            <span className={styles.historyTitle}>LỊCH SỬ ĐÓNG GÓP</span>
            <span className={styles.historyCount}>{lichSu.length} khoản</span>
          </div>

          {loading ? (
            <div className={styles.loadingHint}>Đang tải...</div>
          ) : lichSu.length === 0 ? (
            <div className={styles.empty}>
              <HiOutlineHandRaised className={styles.emptyIcon} />
              <span>Chưa có khoản tài trợ nào</span>
            </div>
          ) : (
            <ul className={styles.historyList}>
              {lichSu.map((item) => (
                <li key={item.khoan_tai_tro_id} className={styles.historyItem}>
                  <div className={styles.historyLeft}>
                    <div className={styles.fundName}>{item.ten_quy}</div>
                    <div className={styles.donationDate}>
                      {formatDate(item.ngay_tai_tro)}
                    </div>
                    {item.ghi_chu && (
                      <div className={styles.donationNote}>
                        {item.ghi_chu}
                      </div>
                    )}
                  </div>
                  <div className={styles.historyRight}>
                    <div className={styles.amount}>
                      {formatCurrency(item.so_tien)}
                    </div>
                    <StatusBadge
                      status={STATUS_MAP[item.trang_thai] || 'pending'}
                      size="sm"
                    />
                    {!isPublic && item.hinh_anh_minh_chung && (
                      <a
                        href={`${apiOrigin()}/${item.hinh_anh_minh_chung}`}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.attachLink}
                        title="Xem minh chứng"
                      >
                        <HiOutlinePaperClip />
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </aside>
    </>
  );
};

export default NhaTaiTroDetailDrawer;
