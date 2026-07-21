import { useState } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import {
  HiOutlineBanknotes,
  HiOutlineExclamationTriangle,
  HiOutlineCheckCircle,
} from 'react-icons/hi2';
import Button from '@components/common/Button/Button';
import { formatCurrency } from '@utils/formatters';
import styles from './DisbursementPanel.module.scss';

const formatDateTime = (v) => {
  if (!v) return '—';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const DisbursementPanel = ({
  data,
  fundBalance,
  isKeToan,
  onDisburse,
  onReject,
}) => {
  const [ghiChu, setGhiChu] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const trangThai = data?.trangThai;
  const soTien = Number(data?.soTienYeuCau || 0);
  const isEnough = fundBalance !== null && Number(fundBalance) >= soTien;
  const remainingAfter = fundBalance !== null ? Number(fundBalance) - soTien : null;

  const canDisburse = trangThai === 'Cho duyet cap 3' || trangThai === 'Cho giai ngan';
  const isDisbursed = trangThai === 'Da giai ngan';
  const isRejected = trangThai === 'Tu choi cap 3';
  const isWaitingNghiemThu = trangThai === 'Cho nghiem thu' || trangThai === 'Da nghiem thu' || trangThai === 'Nghiem thu khong dat';

  const handleDisburse = async () => {
    if (!isEnough) {
      toast.error('Quỹ không đủ số dư để giải ngân');
      return;
    }

    setSubmitting(true);
    try {
      await onDisburse({ ghiChu: ghiChu.trim() || undefined });
    } catch {
      toast.error('Lỗi giải ngân, vui lòng thử lại');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim() || rejectReason.trim().length < 10) {
      toast.error('Lý do từ chối phải ít nhất 10 ký tự');
      return;
    }
    setSubmitting(true);
    try {
      await onReject({ lyDoTuChoi: rejectReason.trim(), ghiChu: rejectReason.trim() });
    } catch {
      toast.error('Lỗi từ chối, vui lòng thử lại');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isKeToan) return null;

  return (
    <section className={styles.card}>
      <div className={`${styles.banner} ${isDisbursed ? styles.bannerDone : styles.bannerActive}`}>
        <div className={styles.bannerOverlay} />
        <div className={styles.bannerContent}>
          <HiOutlineBanknotes size={22} className={styles.bannerIcon} />
          <div className={styles.bannerText}>
            <h3 className={styles.bannerTitle}>
              {isDisbursed ? 'Thông tin giải ngân' : 'Giải ngân hồ sơ'}
            </h3>
            <span className={styles.bannerSub}>
              {isDisbursed ? 'Giao dịch đã hoàn tất' : 'Xác nhận chuyển khoản cho sinh viên'}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.body}>
        {/* ── Highlighted amount ── */}
        <div className={styles.highlightAmount}>
          <span className={styles.highlightLabel}>Số tiền giải ngân</span>
          <span className={styles.highlightValue}>{formatCurrency(soTien)}</span>
        </div>

        {/* ── Fund balance grid ── */}
        {fundBalance !== null && (
          <div className={styles.fundGrid}>
            <div className={styles.fundItem}>
              <span className={styles.fundLabel}>Số dư hiện tại</span>
              <span className={styles.fundValue}>{formatCurrency(fundBalance)}</span>
            </div>
            <div className={`${styles.fundItem} ${remainingAfter < 0 ? styles.fundItemWarn : ''}`}>
              <span className={styles.fundLabel}>Sau giải ngân</span>
              <span className={`${styles.fundValue} ${remainingAfter < 0 ? styles.textRed : ''}`}>
                {formatCurrency(remainingAfter)}
              </span>
            </div>
          </div>
        )}

        {/* ── Kiểm tra quỹ ── */}
        {canDisburse && fundBalance !== null && (
          <div className={`${styles.checkBanner} ${isEnough ? styles.checkOk : styles.checkFail}`}>
            {isEnough ? (
              <>
                <HiOutlineCheckCircle className={styles.checkIcon} />
                <span>Quỹ đủ số dư — có thể giải ngân</span>
              </>
            ) : (
              <>
                <HiOutlineExclamationTriangle className={styles.checkIcon} />
                <span>
                  Quỹ thiếu <strong>{formatCurrency(soTien - Number(fundBalance))}</strong> —
                  chưa thể giải ngân
                </span>
              </>
            )}
          </div>
        )}

        {/* ── Đã giải ngân — hiển thị kết quả ── */}
        {isDisbursed && (
          <div className={styles.resultBox}>
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>Trạng thái</span>
              <span className={`${styles.badge} ${styles.badgeGreen}`}>Đã giải ngân</span>
            </div>
            {data.ngayCapNhat && (
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>Ngày giải ngân</span>
                <span className={styles.resultValue}>{formatDateTime(data.ngayCapNhat)}</span>
              </div>
            )}
            {data.ghichu && (
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>Ghi chú</span>
                <span className={styles.resultValue}>{data.ghichu}</span>
              </div>
            )}
          </div>
        )}

        {/* ── Form giải ngân ── */}
        {canDisburse && (
          <>
            {/* Ghi chú */}
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Ghi chú</label>
              <textarea
                className={styles.textarea}
                rows={3}
                maxLength={500}
                placeholder="Ghi chú khi giải ngân (không bắt buộc)..."
                value={ghiChu}
                onChange={(e) => setGhiChu(e.target.value)}
              />
              <span className={styles.charCount}>{ghiChu.length}/500</span>
            </div>

            {/* Buttons */}
            <div className={styles.actions}>
              <Button
                variant="ghost"
                onClick={() => setShowRejectForm(true)}
                disabled={submitting}
                className={styles.rejectBtn}
              >
                Từ chối
              </Button>
              <Button
                variant="primary"
                onClick={handleDisburse}
                disabled={submitting || !isEnough}
                loading={submitting}
              >
                Xác nhận giải ngân
              </Button>
            </div>
          </>
        )}

        {/* ── Form từ chối ── */}
        {showRejectForm && (
          <div className={styles.rejectForm}>
            <div className={styles.rejectHeader}>
              <HiOutlineExclamationTriangle className={styles.rejectIcon} />
              <span>Lý do từ chối</span>
            </div>
            <textarea
              className={styles.textarea}
              rows={3}
              maxLength={500}
              placeholder="Nhập lý do từ chối (tối thiểu 10 ký tự)..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <span className={styles.charCount}>{rejectReason.length}/500</span>
            <div className={styles.actions}>
              <Button
                variant="ghost"
                onClick={() => { setShowRejectForm(false); setRejectReason(''); }}
                disabled={submitting}
              >
                Hủy
              </Button>
              <Button
                variant="primary"
                onClick={handleReject}
                disabled={submitting || rejectReason.trim().length < 10}
                loading={submitting}
                className={styles.rejectSubmitBtn}
              >
                Xác nhận từ chối
              </Button>
            </div>
          </div>
        )}

        {/* ── Đã từ chối ── */}
        {isRejected && (
          <div className={styles.resultBox}>
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>Trạng thái</span>
              <span className={`${styles.badge} ${styles.badgeRed}`}>Đã từ chối</span>
            </div>
            {data.lyDoTuChoi && (
              <div className={styles.rejectReasonDisplay}>
                <HiOutlineExclamationTriangle size={14} />
                <span>{data.lyDoTuChoi}</span>
              </div>
            )}
          </div>
        )}

        {/* ── Đang chờ nghiệm thu ── */}
        {isWaitingNghiemThu && (
          <div className={styles.resultBox}>
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>Trạng thái</span>
              <span className={`${styles.badge} ${styles.badgeBlue}`}>
                {trangThai === 'Da nghiem thu' ? 'Đã nghiệm thu' :
                 trangThai === 'Nghiem thu khong dat' ? 'Nghiệm thu không đạt' :
                 'Chờ nghiệm thu'}
              </span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

DisbursementPanel.propTypes = {
  data: PropTypes.shape({
    soTienYeuCau: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    trangThai: PropTypes.string,
    ghichu: PropTypes.string,
    lyDoTuChoi: PropTypes.string,
    ngayCapNhat: PropTypes.string,
  }),
  fundBalance: PropTypes.number,
  isKeToan: PropTypes.bool,
  onDisburse: PropTypes.func.isRequired,
  onReject: PropTypes.func.isRequired,
};

export default DisbursementPanel;
