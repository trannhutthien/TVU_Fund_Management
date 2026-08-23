import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
  HiOutlineXMark,
  HiOutlineRocketLaunch,
  HiOutlineExclamationTriangle,
  HiOutlineInformationCircle,
} from 'react-icons/hi2';
import Button from '@components/common/Button/Button';
import { createActivityByAdmin } from '@services/proposalService';
import { getFundById } from '@services/fundService';
import { formatCurrency } from '@utils/formatters';
import styles from './CreateActivityModal.module.scss';

const CreateActivityModal = ({ proposal, onClose, onSuccess }) => {
  const [ghiChu, setGhiChu] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [fundInfo, setFundInfo] = useState(null);
  const [loadingFund, setLoadingFund] = useState(false);

  useEffect(() => {
    if (proposal) {
      setGhiChu('');
      setConfirmed(false);
      setSubmitting(false);
      fetchFundInfo();
    }
  }, [proposal?.de_xuat_id]);

  const fetchFundInfo = async () => {
    if (!proposal?.quy_thanh_phan_id) return;
    
    setLoadingFund(true);
    try {
      const res = await getFundById(proposal.quy_thanh_phan_id);
      if (res?.success) {
        setFundInfo(res.fund);  // Backend trả về res.fund chứ không phải res.data
      }
    } catch (err) {
      console.error('Lỗi tải thông tin quỹ:', err);
      toast.error('Không thể tải thông tin quỹ thành phần');
    } finally {
      setLoadingFund(false);
    }
  };

  if (!proposal) return null;

  const soTienCanTrich = proposal.so_tien_thuc_te || 
    (proposal.so_luong_suat || 0) * (proposal.so_tien_moi_suat || 0);
  const soDuQuy = parseFloat(fundInfo?.soDu) || 0;  // Parse soDu (camelCase) thành number
  const soDuSauKhiTrich = soDuQuy - soTienCanTrich;
  const khongDuSoDu = soDuSauKhiTrich < 0;

  const handleSubmit = async () => {
    if (!confirmed || submitting || khongDuSoDu) return;

    setSubmitting(true);
    try {
      await createActivityByAdmin(proposal.de_xuat_id, {
        ghiChu: ghiChu.trim() || null,
      });

      toast.success(
        `Đã tạo hoạt động "${proposal.ten_chuong_trinh}" thành công! Quỹ cấp 3 đã được tạo và nhận tiền.`
      );
      onSuccess?.();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        'Có lỗi xảy ra khi tạo hoạt động. Vui lòng thử lại.';
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
            <HiOutlineRocketLaunch className={styles.titleIcon} />
            Tạo hoạt động từ đề xuất
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
          {/* Thông tin quỹ thành phần (cấp 2) */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>
              Quỹ thành phần (cấp 2) - Nguồn tiền
            </div>
            <div className={styles.fundCard}>
              <div className={styles.fundRow}>
                <span className={styles.fundLabel}>Tên quỹ</span>
                <span className={styles.fundValue}>
                  {proposal.ten_quy_thanh_phan || '—'}
                </span>
              </div>
              <div className={styles.fundRow}>
                <span className={styles.fundLabel}>Số dư hiện tại</span>
                <span className={`${styles.fundValue} ${styles.fundAmount}`}>
                  {loadingFund ? 'Đang tải...' : formatCurrency(soDuQuy)}
                </span>
              </div>
              <div className={styles.fundRow}>
                <span className={styles.fundLabel}>Số tiền sẽ trích ra</span>
                <span className={`${styles.fundValue} ${styles.fundDeduct}`}>
                  - {formatCurrency(soTienCanTrich)}
                </span>
              </div>
              <div className={styles.fundRow}>
                <span className={styles.fundLabel}>Số dư sau khi trích</span>
                <span
                  className={`${styles.fundValue} ${styles.fundResult} ${
                    khongDuSoDu ? styles.fundError : ''
                  }`}
                >
                  {formatCurrency(soDuSauKhiTrich)}
                </span>
              </div>
            </div>

            {khongDuSoDu && (
              <div className={styles.errorBanner}>
                <HiOutlineExclamationTriangle className={styles.errorIcon} />
                <div className={styles.errorText}>
                  <strong>Số dư không đủ!</strong> Quỹ thành phần không đủ tiền để
                  tạo hoạt động này. Vui lòng kiểm tra lại hoặc yêu cầu kế toán bổ
                  sung tiền vào quỹ.
                </div>
              </div>
            )}
          </div>

          {/* Thông tin hoạt động sẽ tạo (cấp 3) */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>
              Hoạt động mới (cấp 3) - Sẽ được tạo
            </div>
            <div className={styles.activityCard}>
              <div className={styles.activityRow}>
                <span className={styles.activityLabel}>Tên hoạt động</span>
                <span className={styles.activityValue}>
                  {proposal.ten_chuong_trinh}
                </span>
              </div>
              <div className={styles.activityRow}>
                <span className={styles.activityLabel}>Số tiền</span>
                <span className={styles.activityAmount}>
                  {formatCurrency(soTienCanTrich)}
                </span>
              </div>
              <div className={styles.activityRow}>
                <span className={styles.activityLabel}>Số lượng suất</span>
                <span className={styles.activityValue}>
                  {proposal.so_luong_suat || 0} suất
                </span>
              </div>
              <div className={styles.activityRow}>
                <span className={styles.activityLabel}>Loại hỗ trợ</span>
                <span className={styles.activityValue}>
                  {proposal.loai_ho_tro === 'Tai tro khong hoan lai' && 'Tài trợ không thu hồi'}
                  {proposal.loai_ho_tro === 'Tai tro co thu hoi' && 'Tài trợ thu hồi một phần'}
                  {proposal.loai_ho_tro === 'Cho vay' && 'Tài trợ thu hồi toàn phần'}
                  {!proposal.loai_ho_tro && '—'}
                </span>
              </div>
              {proposal.loai_ho_tro === 'Cho vay' && proposal.kyhantrano && (() => {
                const kyHanThang = parseInt(proposal.kyhantrano) || 0;
                const laiSuatNam = 1.61;
                const tienLai = soTienCanTrich * (laiSuatNam / 100) * (kyHanThang / 12);
                const tongPhaiTra = soTienCanTrich + tienLai;
                return (
                  <>
                    <div className={styles.activityRow}>
                      <span className={styles.activityLabel}>Kỳ hạn trả nợ</span>
                      <span className={styles.activityValue}>{kyHanThang} tháng</span>
                    </div>
                    <div className={styles.activityRow}>
                      <span className={styles.activityLabel}>Lãi suất</span>
                      <span className={styles.activityValue}>{laiSuatNam}%/năm (70% lãi suất tham chiếu)</span>
                    </div>
                    <div className={styles.activityRow}>
                      <span className={styles.activityLabel}>Tiền lãi</span>
                      <span className={styles.activityValue}>{formatCurrency(tienLai)}</span>
                    </div>
                    <div className={styles.activityRow}>
                      <span className={styles.activityLabel}>Tổng tiền nhà tài trợ nhận lại</span>
                      <span className={styles.activityAmount} style={{ color: '#dc2626' }}>
                        {formatCurrency(tongPhaiTra)}
                      </span>
                    </div>
                    <div className={styles.activityRow}>
                      <span className={styles.activityLabel}>Lịch trả nợ</span>
                      <span className={styles.activityValue} style={{ color: '#2563eb', fontWeight: 600 }}>
                        1 kỳ — trả toàn bộ gốc + lãi cuối kỳ
                      </span>
                    </div>
                    <div className={styles.activityRow}>
                      <span className={styles.activityLabel}>Hợp đồng vay</span>
                      <span className={styles.activityValue} style={{ color: '#2563eb', fontWeight: 600 }}>
                        Tự động tạo khi duyệt
                      </span>
                    </div>
                  </>
                );
              })()}
              {proposal.loai_ho_tro === 'Tai tro co thu hoi' && proposal.tilethuhoi && (() => {
                const tileThuHoi = parseFloat(proposal.tilethuhoi) || 0;
                const soTienThuHoi = proposal.mucthuhoi || (soTienCanTrich * tileThuHoi / 100);
                return (
                  <>
                    <div className={styles.activityRow}>
                      <span className={styles.activityLabel}>Tỷ lệ thu hồi</span>
                      <span className={styles.activityValue}>{tileThuHoi}%</span>
                    </div>
                    <div className={styles.activityRow}>
                      <span className={styles.activityLabel}>Số tiền thu hồi</span>
                      <span className={styles.activityAmount} style={{ color: '#dc2626' }}>
                        {formatCurrency(soTienThuHoi)}
                      </span>
                    </div>
                    <div className={styles.activityRow}>
                      <span className={styles.activityLabel}>Quỹ giữ lại</span>
                      <span className={styles.activityValue}>{formatCurrency(soTienCanTrich - soTienThuHoi)}</span>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          {/* Banner thông tin */}
          {!khongDuSoDu && (
            <div className={styles.infoBanner}>
              <HiOutlineInformationCircle className={styles.infoIcon} />
              <div className={styles.infoText}>
                Hệ thống sẽ tự động TRỪ {formatCurrency(soTienCanTrich)} từ quỹ
                thành phần, TẠO quỹ mới cấp 3, CỘNG tiền vào quỹ mới, và TẠO bản
                ghi phân bổ ngân sách.{' '}
                <strong>Hành động này không thể hoàn tác.</strong>
              </div>
            </div>
          )}

          {/* Ghi chú */}
          <div className={styles.field}>
            <label className={styles.label}>Ghi chú của admin</label>
            <textarea
              className={styles.textarea}
              rows={3}
              placeholder="Ghi chú nội bộ về hoạt động này..."
              value={ghiChu}
              onChange={(e) => setGhiChu(e.target.value)}
            />
          </div>

          {/* Checkbox xác nhận */}
          {!khongDuSoDu && (
            <label className={styles.checkboxRow}>
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className={styles.checkbox}
              />
              <span className={styles.checkboxLabel}>
                Tôi xác nhận tạo hoạt động "<strong>{proposal.ten_chuong_trinh}</strong>
                " với số tiền <strong>{formatCurrency(soTienCanTrich)}</strong> được
                trích từ quỹ thành phần{' '}
                <strong>{proposal.ten_quy_thanh_phan}</strong>.
              </span>
            </label>
          )}
        </div>

        <footer className={styles.footer}>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Hủy
          </Button>
          <Button
            variant="primary"
            leftIcon={<HiOutlineRocketLaunch />}
            disabled={!confirmed || khongDuSoDu}
            loading={submitting}
            onClick={handleSubmit}
          >
            Tạo hoạt động
          </Button>
        </footer>
      </div>
    </div>
  );
};

export default CreateActivityModal;
