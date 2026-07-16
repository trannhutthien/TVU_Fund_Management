import { useEffect, useState } from 'react';
import {
  HiOutlineXMark,
  HiOutlineCheckCircle,
  HiOutlineEnvelope,
  HiOutlinePhone,
  HiOutlineBuildingLibrary,
  HiOutlineUserCircle,
  HiOutlineClock,
  HiOutlineXCircle,
} from 'react-icons/hi2';
import Button from '@components/common/Button/Button';
import StatusBadge from '@components/common/StatusBadge/StatusBadge';
import { getDonationById } from '@services/donationService';
import { formatCurrency, getInitial } from '@utils/formatters';
import styles from './KhoanTaiTroDetailDrawer.module.scss';

const LOAI_LABEL = {
  'Ca nhan': 'Cá nhân',
  'To chuc': 'Tổ chức',
  'Doanh nghiep': 'Doanh nghiệp',
  'Doi tac': 'Đối tác',
};

const STATUS_CONFIG = {
  'Cho duyet': { status: 'pending', label: 'Chờ duyệt' },
  'Da duyet': { status: 'processing', label: 'Chờ xác nhận' },
  'Da nhan': { status: 'approved', label: 'Đã xác nhận' },
  'Tu choi': { status: 'rejected', label: 'Từ chối' },
};

const KET_QUA_LABEL = {
  'Cho duyet': { text: 'Chờ duyệt', icon: HiOutlineClock, color: '#f59e0b' },
  'Da duyet': { text: 'Đã duyệt', icon: HiOutlineCheckCircle, color: '#10b981' },
  'Tu choi': { text: 'Từ chối', icon: HiOutlineXCircle, color: '#ef4444' },
  'Yeu cau bo sung': { text: 'Yêu cầu bổ sung', icon: HiOutlineClock, color: '#3b82f6' },
};

const formatDateTime = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const apiOrigin = () => {
  const base = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:5001/api';
  return base.replace(/\/api\/?$/, '');
};

const buildUrl = (path) => {
  if (!path) return null;
  return path.startsWith('http') ? path : `${apiOrigin()}${path}`;
};

const CAP_LABEL = {
  1: 'Cán bộ Quỹ xác nhận',
  2: 'Kế toán xác nhận tiền vào quỹ',
};

const KhoanTaiTroDetailDrawer = ({ item, isAdmin, isKeToan, onClose, onConfirm }) => {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imageOpen, setImageOpen] = useState(false);

  useEffect(() => {
    if (!item?.khoan_tai_tro_id) {
      setDetail(null);
      return;
    }
    setLoading(true);
    getDonationById(item.khoan_tai_tro_id)
      .then((res) => setDetail(res?.data || null))
      .catch(() => setDetail(null))
      .finally(() => setLoading(false));
  }, [item?.khoan_tai_tro_id]);

  if (!item) return null;

  const data = detail || item;
  const statusCfg = STATUS_CONFIG[data.trang_thai] || { status: 'pending', label: data.trang_thai };
  const minhChungUrl = buildUrl(data.hinh_anh_minh_chung);
  const lichSu = detail?.lich_su_phe_duyet || [];

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <aside className={styles.drawer} onClick={(e) => e.stopPropagation()}>
        <header className={styles.header}>
          <h2 className={styles.title}>Chi tiết khoản tài trợ</h2>
          <div className={styles.headerActions}>
            {data.trang_thai === 'Cho duyet' && isKeToan && (
              <Button
                variant="success"
                size="sm"
                leftIcon={<HiOutlineCheckCircle />}
                onClick={() => onConfirm?.(data)}
              >
                Duyệt khoản tài trợ
              </Button>
            )}
            {data.trang_thai === 'Da duyet' && isAdmin && (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<HiOutlineCheckCircle />}
                onClick={() => onConfirm?.(data)}
              >
                Xác nhận thu tiền
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
        </header>

        <div className={styles.body}>
          {/* Card 1: Nhà tài trợ */}
          <section className={`${styles.card} ${styles.cardSponsor}`}>
            <div className={styles.sponsorTop}>
              <div className={styles.avatar}>
                {data.avatar ? (
                  <img src={data.avatar} alt={data.ten_nha_tai_tro} />
                ) : (
                  <span>{getInitial(data.ten_nha_tai_tro)}</span>
                )}
              </div>
              <div className={styles.sponsorMeta}>
                <div className={styles.sponsorName}>{data.ten_nha_tai_tro}</div>
                <span className={styles.sponsorLoai}>
                  {LOAI_LABEL[data.loai_ntt] || data.loai_ntt}
                </span>
              </div>
            </div>
            <div className={styles.contactList}>
              {data.ho_ten && (
                <div className={styles.contactItem}>
                  <HiOutlineUserCircle className={styles.contactIcon} />
                  <span>{data.ho_ten}</span>
                </div>
              )}
              {data.email && (
                <div className={styles.contactItem}>
                  <HiOutlineEnvelope className={styles.contactIcon} />
                  <span>{data.email}</span>
                </div>
              )}
              {data.so_dien_thoai && (
                <div className={styles.contactItem}>
                  <HiOutlinePhone className={styles.contactIcon} />
                  <span>{data.so_dien_thoai}</span>
                </div>
              )}
            </div>
          </section>

          {/* Card 2: Chi tiết khoản */}
          <section className={styles.card}>
            <h3 className={styles.cardTitle}>Chi tiết khoản tài trợ</h3>
            <div className={styles.amountBox}>
              <div className={styles.amountLabel}>SỐ TIỀN</div>
              <div className={styles.amountValue}>{formatCurrency(data.so_tien)}</div>
            </div>
            <div className={styles.grid2}>
              <div className={styles.field}>
                <div className={styles.fieldLabel}>Quỹ nhận</div>
                <div className={styles.fieldValue}>
                  <HiOutlineBuildingLibrary className={styles.fieldIcon} />
                  {data.ten_quy}
                </div>
              </div>
              <div className={styles.field}>
                <div className={styles.fieldLabel}>Trạng thái</div>
                <div className={styles.fieldValue}>
                  <StatusBadge status={statusCfg.status} label={statusCfg.label} size="sm" />
                </div>
              </div>
              <div className={styles.field}>
                <div className={styles.fieldLabel}>Ngày tài trợ</div>
                <div className={styles.fieldValue}>{formatDateTime(data.ngay_tai_tro)}</div>
              </div>
              <div className={styles.field}>
                <div className={styles.fieldLabel}>Cập nhật</div>
                <div className={styles.fieldValue}>{formatDateTime(data.ngay_cap_nhat)}</div>
              </div>
            </div>
            {data.ghi_chu && (
              <div className={styles.fieldFull}>
                <div className={styles.fieldLabel}>Ghi chú</div>
                <div className={styles.fieldValue}>{data.ghi_chu}</div>
              </div>
            )}
          </section>

          {/* Card 3: Minh chứng chuyển khoản */}
          <section className={styles.card}>
            <h3 className={styles.cardTitle}>Minh chứng chuyển khoản</h3>
            {minhChungUrl ? (
              <>
                <img
                  src={minhChungUrl}
                  alt="Minh chứng"
                  className={styles.proofImage}
                  onClick={() => setImageOpen(true)}
                />
                {imageOpen && (
                  <div className={styles.lightbox} onClick={() => setImageOpen(false)}>
                    <img src={minhChungUrl} alt="Minh chứng full" />
                  </div>
                )}
              </>
            ) : (
              <p className={styles.empty}>Không có minh chứng đính kèm</p>
            )}
          </section>

          {/* Card 4: Lịch sử phê duyệt */}
          <section className={styles.card}>
            <h3 className={styles.cardTitle}>Lịch sử phê duyệt</h3>
            {loading ? (
              <p className={styles.empty}>Đang tải...</p>
            ) : lichSu.length === 0 ? (
              <p className={styles.empty}>Chưa có phê duyệt nào</p>
            ) : (
              <div className={styles.timeline}>
                {lichSu.map((h, idx) => {
                  const kqCfg = KET_QUA_LABEL[h.ket_qua] || KET_QUA_LABEL['Cho duyet'];
                  const KqIcon = kqCfg.icon;
                  return (
                    <div key={h.phe_duyet_id} className={styles.timelineItem}>
                      <div className={styles.timelineDot} style={{ background: kqCfg.color }}>
                        <KqIcon />
                      </div>
                      {idx < lichSu.length - 1 && <div className={styles.timelineLine} />}
                      <div className={styles.timelineContent}>
                        <div className={styles.timelineTitle}>
                          {CAP_LABEL[h.cap_do_duyet] || `Cấp ${h.cap_do_duyet}`}
                          <span
                            className={styles.timelineBadge}
                            style={{ background: `${kqCfg.color}20`, color: kqCfg.color }}
                          >
                            {kqCfg.text}
                          </span>
                        </div>
                        {h.nguoi_duyet_ten && (
                          <div className={styles.timelineSub}>
                            {h.nguoi_duyet_ten}
                            {h.nguoi_duyet_vai_tro && ` · ${h.nguoi_duyet_vai_tro}`}
                          </div>
                        )}
                        <div className={styles.timelineDate}>
                          {h.ngay_duyet ? formatDateTime(h.ngay_duyet) : formatDateTime(h.ngay_tao)}
                        </div>
                        {h.ghi_chu && (
                          <div className={styles.timelineNote}>{h.ghi_chu}</div>
                        )}
                        {h.ly_do_tu_choi && (
                          <div className={`${styles.timelineNote} ${styles.timelineRejection}`}>
                            Lý do: {h.ly_do_tu_choi}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </aside>
    </>
  );
};

export default KhoanTaiTroDetailDrawer;
