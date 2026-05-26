import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import {
  HiOutlineDocumentText,
  HiOutlineXMark,
  HiOutlineEnvelope,
  HiOutlinePhone,
  HiOutlineAcademicCap,
  HiOutlineBuildingLibrary,
  HiOutlineClipboard,
  HiOutlineExclamationTriangle,
  HiOutlineCheckCircle,
  HiOutlinePaperClip,
  HiOutlineArrowDownTray,
  HiOutlineBanknotes,
  HiOutlineXCircle,
} from 'react-icons/hi2';
import Button from '@components/common/Button/Button';
import styles from './GiaiNganDetailDrawer.module.scss';

const formatCurrency = (n) => Number(n || 0).toLocaleString('vi-VN') + ' đ';
const formatDate = (v) => {
  if (!v) return '—';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('vi-VN');
};
const formatDateTime = (v) => {
  if (!v) return '—';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getInitial = (name) => (name ? name.charAt(0).toUpperCase() : '?');

const copyToClipboard = (text, label) => {
  navigator.clipboard?.writeText(text).then(
    () => toast.success(`Đã copy ${label || 'nội dung'}`),
    () => toast.error('Không copy được'),
  );
};

const PHE_DUYET_COLOR = {
  'Da duyet': 'gold',
  'Tu choi': 'red',
  'Cho duyet': 'gray',
};

const GiaiNganDetailDrawer = ({
  request,
  detail,
  bankAccount,
  pheDuyetList,
  isLoading,
  tab,
  onClose,
  onGiaiNgan,
  onTuChoi,
}) => {
  const data = detail || request;
  const fundBalance = data?.quy?.soDu ?? data?.quy?.so_du ?? null;
  const soTien = Number(data?.soTienYeuCau || 0);
  const isEnough = fundBalance !== null && Number(fundBalance) >= soTien;
  const remainingAfter = fundBalance !== null ? Number(fundBalance) - soTien : null;

  const isWaiting = tab === 'cho_giai_ngan';
  const isProcessed =
    data?.trangThai === 'Da giai ngan' || data?.trangThai === 'Tu choi';

  const files = (data?.fileDinhKem || '')
    .split(/[;,|]/)
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <>
      <div className={styles.backdrop} onClick={onClose} />
      <aside
        className={styles.drawer}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Chi tiết hồ sơ"
      >
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerTitle}>
            <HiOutlineDocumentText
              size={20}
              className={styles.headerIcon}
            />
            <h2>Chi tiết hồ sơ #{data?.requestId}</h2>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Đóng"
          >
            <HiOutlineXMark size={22} />
          </button>
        </header>

        {/* Body */}
        <div className={styles.body}>
          {isLoading ? (
            <div className={styles.loadingWrap}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className={styles.skeletonBlock} />
              ))}
            </div>
          ) : (
            <>
              {/* Khối A — Thông tin sinh viên */}
              <section className={styles.block}>
                <div className={styles.blockLabel}>THÔNG TIN SINH VIÊN</div>
                <div className={styles.studentCard}>
                  <div className={styles.studentTop}>
                    <div className={styles.avatar}>
                      {data?.nguoiNop?.avatar ? (
                        <img
                          src={data.nguoiNop.avatar}
                          alt={data.nguoiNop.hoTen}
                        />
                      ) : (
                        <span>{getInitial(data?.nguoiNop?.hoTen)}</span>
                      )}
                    </div>
                    <div className={styles.studentInfo}>
                      <div className={styles.studentName}>
                        {data?.nguoiNop?.hoTen || '—'}
                      </div>
                      <div className={styles.studentCode}>
                        {data?.nguoiNop?.maSoDinhDanh || '—'}
                      </div>
                      {data?.nguoiNop?.khoaPhong && (
                        <div className={styles.studentFaculty}>
                          {data.nguoiNop.khoaPhong}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={styles.studentContact}>
                    {data?.nguoiNop?.email && (
                      <div className={styles.contactItem}>
                        <HiOutlineEnvelope size={14} />
                        <span>{data.nguoiNop.email}</span>
                      </div>
                    )}
                    {data?.nguoiNop?.soDienThoai && (
                      <div className={styles.contactItem}>
                        <HiOutlinePhone size={14} />
                        <span>{data.nguoiNop.soDienThoai}</span>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* Khối B — Tài khoản ngân hàng */}
              <section className={styles.block}>
                <div
                  className={`${styles.blockLabel} ${styles.blockLabelGold}`}
                >
                  TÀI KHOẢN NHẬN TIỀN
                </div>
                {bankAccount ? (
                  <div className={styles.bankCard}>
                    <div className={styles.bankRow}>
                      <span className={styles.bankRowLabel}>Ngân hàng</span>
                      <span className={styles.bankRowValue}>
                        {bankAccount.ten_ngan_hang ||
                          bankAccount.tenNganHang ||
                          '—'}
                      </span>
                    </div>
                    <div className={styles.bankRow}>
                      <span className={styles.bankRowLabel}>
                        Số tài khoản
                      </span>
                      <span className={styles.bankAccountNumber}>
                        {bankAccount.so_tai_khoan ||
                          bankAccount.soTaiKhoan ||
                          '—'}
                        <button
                          type="button"
                          className={styles.copyBtn}
                          onClick={() =>
                            copyToClipboard(
                              bankAccount.so_tai_khoan ||
                                bankAccount.soTaiKhoan,
                              'số tài khoản',
                            )
                          }
                          aria-label="Copy số tài khoản"
                        >
                          <HiOutlineClipboard size={14} />
                        </button>
                      </span>
                    </div>
                    <div className={styles.bankRow}>
                      <span className={styles.bankRowLabel}>
                        Chủ tài khoản
                      </span>
                      <span className={styles.bankRowValue}>
                        {bankAccount.chu_tai_khoan ||
                          bankAccount.chuTaiKhoan ||
                          '—'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className={styles.bankWarning}>
                    <HiOutlineExclamationTriangle size={18} />
                    <span>
                      Sinh viên chưa cập nhật tài khoản ngân hàng — không
                      thể giải ngân
                    </span>
                  </div>
                )}
              </section>

              {/* Khối C — Nội dung yêu cầu */}
              <section className={styles.block}>
                <div className={styles.blockLabel}>NỘI DUNG YÊU CẦU</div>
                <div className={styles.requestCard}>
                  <div className={styles.requestTitle}>
                    {data?.tieuDe || '—'}
                  </div>
                  <div className={styles.requestDesc}>
                    {data?.moTa || 'Không có mô tả'}
                  </div>
                  <div className={styles.requestMeta}>
                    <div className={styles.requestMetaItem}>
                      <HiOutlineBuildingLibrary size={14} />
                      <span>{data?.quy?.tenQuy || '—'}</span>
                    </div>
                    <div className={styles.requestMetaItem}>
                      <HiOutlineAcademicCap size={14} />
                      <span>Nộp ngày {formatDate(data?.ngayNop)}</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Khối D — Số tiền + kiểm tra quỹ */}
              <section className={styles.block}>
                <div className={styles.amountCard}>
                  <div className={styles.amountLabel}>Số tiền yêu cầu</div>
                  <div className={styles.amountValue}>
                    {formatCurrency(soTien)}
                  </div>
                  <div className={styles.amountDivider} />
                  <div className={styles.amountRow}>
                    <span>Số dư hiện tại của quỹ:</span>
                    {fundBalance !== null ? (
                      <strong
                        className={
                          isEnough ? styles.balanceOk : styles.balanceLow
                        }
                      >
                        {formatCurrency(fundBalance)}
                      </strong>
                    ) : (
                      <strong>—</strong>
                    )}
                  </div>
                  {fundBalance !== null && (
                    <div
                      className={`${styles.amountStatus} ${
                        isEnough
                          ? styles.amountStatusOk
                          : styles.amountStatusBad
                      }`}
                    >
                      {isEnough ? (
                        <>
                          <HiOutlineCheckCircle size={16} />
                          Đủ điều kiện giải ngân — số dư còn lại sau:{' '}
                          {formatCurrency(remainingAfter)}
                        </>
                      ) : (
                        <>
                          <HiOutlineExclamationTriangle size={16} />
                          Quỹ không đủ số dư (thiếu{' '}
                          {formatCurrency(soTien - Number(fundBalance))})
                        </>
                      )}
                    </div>
                  )}
                </div>
              </section>

              {/* Khối E — Hồ sơ đính kèm */}
              {files.length > 0 && (
                <section className={styles.block}>
                  <div className={styles.blockLabel}>HỒ SƠ ĐÍNH KÈM</div>
                  <div className={styles.fileList}>
                    {files.map((f, idx) => {
                      const name = f.split('/').pop() || f;
                      const url = f.startsWith('http')
                        ? f
                        : `${import.meta.env.VITE_API_BASE_URL || ''}${f.startsWith('/') ? '' : '/'}${f}`;
                      return (
                        <a
                          key={idx}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.fileChip}
                          title={name}
                        >
                          <HiOutlinePaperClip size={14} />
                          <span className={styles.fileChipName}>{name}</span>
                          <HiOutlineArrowDownTray size={14} />
                        </a>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Khối F — Lịch sử phê duyệt */}
              {pheDuyetList && pheDuyetList.length > 0 && (
                <section className={styles.block}>
                  <div className={styles.blockLabel}>LỊCH SỬ PHÊ DUYỆT</div>
                  <ul className={styles.timeline}>
                    {pheDuyetList
                      .slice()
                      .sort(
                        (a, b) =>
                          (a.cap_do_duyet || a.capDoDuyet || 0) -
                          (b.cap_do_duyet || b.capDoDuyet || 0),
                      )
                      .map((pd, idx) => {
                        const color =
                          PHE_DUYET_COLOR[pd.ket_qua || pd.ketQua] || 'gray';
                        const cap = pd.cap_do_duyet || pd.capDoDuyet;
                        return (
                          <li key={idx} className={styles.timelineItem}>
                            <span
                              className={`${styles.timelineDot} ${
                                styles[`dot${color.charAt(0).toUpperCase() + color.slice(1)}`]
                              }`}
                            />
                            <div className={styles.timelineContent}>
                              <div className={styles.timelineTitle}>
                                Cấp {cap} —{' '}
                                {pd.ket_qua || pd.ketQua || 'Chờ duyệt'}
                              </div>
                              {(pd.nguoi_duyet_ho_ten ||
                                pd.nguoiDuyetHoTen) && (
                                <div className={styles.timelineMeta}>
                                  Người duyệt:{' '}
                                  {pd.nguoi_duyet_ho_ten ||
                                    pd.nguoiDuyetHoTen}
                                </div>
                              )}
                              {(pd.ngay_duyet || pd.ngayDuyet) && (
                                <div className={styles.timelineMeta}>
                                  {formatDateTime(
                                    pd.ngay_duyet || pd.ngayDuyet,
                                  )}
                                </div>
                              )}
                              {(pd.ghi_chu || pd.ghiChu) && (
                                <div className={styles.timelineNote}>
                                  Ghi chú: {pd.ghi_chu || pd.ghiChu}
                                </div>
                              )}
                            </div>
                          </li>
                        );
                      })}
                  </ul>
                </section>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <footer className={styles.footer}>
          {isWaiting && !isProcessed ? (
            <>
              <Button
                variant="ghost"
                leftIcon={<HiOutlineXCircle />}
                onClick={onTuChoi}
                className={styles.btnReject}
              >
                Từ chối
              </Button>
              <Button
                variant="primary"
                leftIcon={<HiOutlineBanknotes />}
                onClick={onGiaiNgan}
                disabled={!bankAccount || !isEnough}
                title={
                  !bankAccount
                    ? 'Sinh viên chưa có tài khoản ngân hàng'
                    : !isEnough
                      ? 'Quỹ không đủ số dư'
                      : ''
                }
              >
                Xác nhận giải ngân
              </Button>
            </>
          ) : (
            <Button variant="ghost" onClick={onClose}>
              Đóng
            </Button>
          )}
        </footer>
      </aside>
    </>
  );
};

GiaiNganDetailDrawer.propTypes = {
  request: PropTypes.object.isRequired,
  detail: PropTypes.object,
  bankAccount: PropTypes.object,
  pheDuyetList: PropTypes.array,
  isLoading: PropTypes.bool,
  tab: PropTypes.oneOf(['cho_giai_ngan', 'da_xu_ly']).isRequired,
  onClose: PropTypes.func.isRequired,
  onGiaiNgan: PropTypes.func.isRequired,
  onTuChoi: PropTypes.func.isRequired,
};

export default GiaiNganDetailDrawer;
