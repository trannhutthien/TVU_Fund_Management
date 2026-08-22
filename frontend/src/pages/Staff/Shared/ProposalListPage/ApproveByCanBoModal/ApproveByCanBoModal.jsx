import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
  HiOutlineXMark,
  HiOutlineCheckCircle,
  HiOutlineExclamationTriangle,
} from 'react-icons/hi2';
import Button from '@components/common/Button/Button';
import { approveByCanBo } from '@services/proposalService';
import { getFunds } from '@services/fundService';
import { formatCurrency } from '@utils/formatters';
import styles from './ApproveByCanBoModal.module.scss';

const formatDateTime = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const ApproveByCanBoModal = ({ proposal, onClose, onSuccess }) => {
  const [ghiChu, setGhiChu] = useState('');
  const [quyThanhPhanId, setQuyThanhPhanId] = useState('');
  const [funds, setFunds] = useState([]);
  const [loadingFunds, setLoadingFunds] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (proposal) {
      setGhiChu('');
      setQuyThanhPhanId(proposal.quy_thanh_phan_id?.toString() || '');
      setConfirmed(false);
      setSubmitting(false);
      fetchFunds();
    }
  }, [proposal?.de_xuat_id]);

  const fetchFunds = async () => {
    setLoadingFunds(true);
    try {
      const res = await getFunds({ cap: 2 });
      if (res?.success) {
        setFunds(res.funds || []);
      }
    } catch (err) {
      console.error('Lỗi tải danh sách quỹ:', err);
      toast.error('Không thể tải danh sách quỹ thành phần');
    } finally {
      setLoadingFunds(false);
    }
  };

  if (!proposal) return null;

  const tongSoTien = (proposal.so_luong_suat || 0) * (proposal.so_tien_moi_suat || 0);
  const hasChangedFund =
    quyThanhPhanId && quyThanhPhanId !== proposal.quy_thanh_phan_id?.toString();

  const handleSubmit = async () => {
    if (!confirmed || submitting) return;

    setSubmitting(true);
    try {
      const payload = {
        ghiChu: ghiChu.trim() || null,
      };

      // Chỉ gửi quyThanhPhanId nếu cán bộ đã sửa
      if (hasChangedFund) {
        payload.quyThanhPhanId = parseInt(quyThanhPhanId, 10);
      }

      await approveByCanBo(proposal.de_xuat_id, payload);

      toast.success(
        `Đã duyệt đề xuất "${proposal.ten_chuong_trinh}". Chuyển sang bước kế toán xác nhận tiền.`
      );
      onSuccess?.();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        'Có lỗi xảy ra khi duyệt đề xuất. Vui lòng thử lại.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <header className={styles.header}>
          <h2 className={styles.title}>
            <HiOutlineCheckCircle className={styles.titleIcon} />
            Duyệt đề xuất chương trình
          </h2>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Đóng"
          >
            <HiOutlineXMark />
          </button>
        </header>

        <div className={styles.body}>
          {/* Tóm tắt đề xuất */}
          <div className={styles.summary}>
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Tên chương trình</span>
              <span className={styles.summaryValue}>
                {proposal.ten_chuong_trinh}
              </span>
            </div>
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Mô tả</span>
              <span className={styles.summaryValue}>
                {proposal.mo_ta || '—'}
              </span>
            </div>
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Số lượng suất</span>
              <span className={styles.summaryValue}>
                {proposal.so_luong_suat || 0}
              </span>
            </div>
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Số tiền mỗi suất</span>
              <span className={styles.summaryValue}>
                {formatCurrency(proposal.so_tien_moi_suat || 0)}
              </span>
            </div>
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Tổng số tiền</span>
              <span className={styles.summaryAmount}>
                {formatCurrency(tongSoTien)}
              </span>
            </div>
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Loại hỗ trợ</span>
              <span className={styles.summaryValue}>
                {proposal.loai_ho_tro === 'Tai tro khong hoan lai' && 'Tài trợ không thu hồi'}
                {proposal.loai_ho_tro === 'Tai tro co thu hoi' && 'Tài trợ thu hồi một phần'}
                {proposal.loai_ho_tro === 'Cho vay' && 'Tài trợ thu hồi toàn phần'}
                {!proposal.loai_ho_tro && '—'}
              </span>
            </div>
            {proposal.loai_ho_tro === 'Tai tro co thu hoi' && proposal.tilethuhoi && (
              <>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Tỷ lệ thu hồi</span>
                  <span className={styles.summaryValue}>
                    {proposal.tilethuhoi}%
                  </span>
                </div>
                {proposal.mucthuhoi && (
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>Số tiền thu hồi</span>
                    <span className={styles.summaryAmount}>
                      {formatCurrency(proposal.mucthuhoi)}
                    </span>
                  </div>
                )}
              </>
            )}
            {proposal.loai_ho_tro === 'Cho vay' && proposal.kyhantrano && (
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Kỳ hạn trả nợ</span>
                <span className={styles.summaryValue}>
                  {proposal.kyhantrano} tháng
                </span>
              </div>
            )}
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Thời gian</span>
              <span className={styles.summaryValue}>
                {formatDateTime(proposal.ngay_bat_dau)} -{' '}
                {formatDateTime(proposal.ngay_ket_thuc)}
              </span>
            </div>
          </div>

          {/* Chọn quỹ thành phần */}
          <div className={styles.field}>
            <label className={styles.label}>
              Quỹ thành phần (cấp 2){' '}
              <span className={styles.labelHint}>
                - Kiểm tra và sửa nếu nhà tài trợ chọn sai
              </span>
            </label>
            {loadingFunds ? (
              <div className={styles.loadingText}>Đang tải danh sách quỹ...</div>
            ) : (
              <select
                className={styles.select}
                value={quyThanhPhanId}
                onChange={(e) => setQuyThanhPhanId(e.target.value)}
              >
                <option value="">-- Chọn quỹ thành phần --</option>
                {funds.map((fund) => (
                  <option key={fund.quyId} value={fund.quyId}>
                    {fund.tenQuy}
                    {fund.quyId === proposal.quy_thanh_phan_id && ' (Hiện tại)'}
                  </option>
                ))}
              </select>
            )}
            {hasChangedFund && (
              <div className={styles.changeNotice}>
                ⚠️ Bạn đang thay đổi quỹ thành phần từ "
                {proposal.ten_quy_thanh_phan}" sang quỹ mới
              </div>
            )}
          </div>

          {/* Banner cảnh báo */}
          <div className={styles.warning}>
            <HiOutlineExclamationTriangle className={styles.warningIcon} />
            <div className={styles.warningText}>
              Sau khi duyệt, đề xuất sẽ chuyển sang bước kế toán xác nhận tiền.
              Kế toán sẽ cộng <strong>{formatCurrency(tongSoTien)}</strong> vào
              quỹ thành phần đã chọn.{' '}
              <strong>Hành động này không thể hoàn tác.</strong>
            </div>
          </div>

          {/* Ghi chú */}
          <div className={styles.field}>
            <label className={styles.label}>Ghi chú của cán bộ</label>
            <textarea
              className={styles.textarea}
              rows={3}
              placeholder="Ghi chú nội bộ, lý do sửa quỹ (nếu có)..."
              value={ghiChu}
              onChange={(e) => setGhiChu(e.target.value)}
            />
          </div>

          {/* Checkbox xác nhận */}
          <label className={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className={styles.checkbox}
            />
            <span className={styles.checkboxLabel}>
              Tôi xác nhận đã kiểm tra đề xuất chương trình "
              <strong>{proposal.ten_chuong_trinh}</strong>" và phê duyệt cho đề
              xuất này tiếp tục sang bước kế toán xác nhận tiền.
            </span>
          </label>
        </div>

        <footer className={styles.footer}>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Hủy
          </Button>
          <Button
            variant="primary"
            leftIcon={<HiOutlineCheckCircle />}
            disabled={!confirmed || !quyThanhPhanId}
            loading={submitting}
            onClick={handleSubmit}
          >
            Duyệt đề xuất
          </Button>
        </footer>
      </div>
    </div>
  );
};

export default ApproveByCanBoModal;
