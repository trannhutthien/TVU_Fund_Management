import { useState } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import {
  HiOutlineXMark,
  HiOutlineClipboardDocumentCheck,
  HiOutlineExclamationTriangle,
  HiOutlinePaperClip,
  HiOutlineDocumentText,
  HiOutlineTrash,
} from 'react-icons/hi2';
import Button from '@components/common/Button/Button';
import { uploadService } from '@services/uploadService';
import nghiemThuService from '@services/nghiemThuService';
import styles from './NghiemThuFormModal.module.scss';

const LOAI_KIEM_TRA_OPTIONS = [
  { value: 'Kiem tra tien do', label: 'Kiểm tra tiến độ', desc: 'Theo dõi tiến độ thực hiện, không ảnh hưởng trạng thái đơn' },
  { value: 'Nghiem thu cuoi cung', label: 'Nghiệm thu cuối cùng', desc: 'Chốt kết quả: Đạt / Đạt có điều chỉnh / Không đạt' },
];

const KET_QUA_OPTIONS = [
  { value: 'Dat', label: 'Đạt', color: '#16a34a' },
  { value: 'Dat co dieu chinh', label: 'Đạt có điều chỉnh', color: '#d97706' },
  { value: 'Khong dat', label: 'Không đạt', color: '#dc2626' },
];

const NghiemThuFormModal = ({ yeucauhotroId, existingHistory, onClose, onSuccess }) => {
  const [loaiKiemTra, setLoaiKiemTra] = useState('Kiem tra tien do');
  const [ketqua, setKetqua] = useState('');
  const [nhanXet, setNhanXet] = useState('');
  const [soQuyetDinh, setSoQuyetDinh] = useState('');
  const [fileBienBan, setFileBienBan] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const isNghiemThuCuoiCung = loaiKiemTra === 'Nghiem thu cuoi cung';
  const isKhongDat = ketqua === 'Khong dat';
  const canSubmit = nhanXet.trim().length > 0 && (!isNghiemThuCuoiCung || ketqua) && !uploadingFile;

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Dung lượng tệp tối đa là 5MB');
      return;
    }

    setUploadingFile(true);
    try {
      const res = await uploadService.uploadFile(file);
      // Backend upload API trả về res.url hoặc res.data.url
      const url = res?.url || res?.data?.url;
      if (url) {
        setFileBienBan(url);
        toast.success('Tải tài liệu lên thành công');
      } else {
        toast.error('Không lấy được URL tài liệu sau tải lên');
      }
    } catch (err) {
      toast.error('Lỗi khi tải tài liệu lên');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleRequestSubmit = () => {
    if (!canSubmit) return;
    setConfirming(true);
  };

  const handleConfirmSubmit = async () => {
    setSubmitting(true);
    try {
      const createRes = await nghiemThuService.createInspection(yeucauhotroId, loaiKiemTra);
      const newId = createRes?.data?.nghiemthuId;

      if (newId) {
        await nghiemThuService.updateResult(newId, {
          ketqua: isNghiemThuCuoiCung ? ketqua : 'Dat',
          nhanXet: nhanXet.trim(),
          soQuyetDinh: soQuyetDinh.trim() || undefined,
          fileBienBan: fileBienBan || undefined,
        });
      }

      toast.success(
        isNghiemThuCuoiCung
          ? `Nghiệm thu cuối cùng: ${KET_QUA_OPTIONS.find(k => k.value === ketqua)?.label || ketqua}`
          : 'Đã ghi nhận kiểm tra tiến độ'
      );
      onSuccess?.();
      onClose();
    } catch (err) {
      const msg = err?.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại';
      toast.error(msg);
    } finally {
      setSubmitting(false);
      setConfirming(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <header className={styles.header}>
          <div className={styles.headerTitle}>
            <HiOutlineClipboardDocumentCheck size={22} className={styles.headerIcon} />
            <h2>Nghiệm thu đơn #{yeucauhotroId}</h2>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Đóng">
            <HiOutlineXMark size={22} />
          </button>
        </header>

        <div className={styles.body}>
          {/* Loại kiểm tra */}
          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>Loại kiểm tra</legend>
            <div className={styles.radioGroup}>
              {LOAI_KIEM_TRA_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={`${styles.radioCard} ${loaiKiemTra === opt.value ? styles.radioCardActive : ''}`}
                >
                  <input
                    type="radio"
                    name="loaiKiemTra"
                    value={opt.value}
                    checked={loaiKiemTra === opt.value}
                    onChange={(e) => {
                      setLoaiKiemTra(e.target.value);
                      setKetqua('');
                      setConfirming(false);
                    }}
                    className={styles.radioInput}
                  />
                  <div className={styles.radioContent}>
                    <span className={styles.radioLabel}>{opt.label}</span>
                    <span className={styles.radioDesc}>{opt.desc}</span>
                  </div>
                </label>
              ))}
            </div>
          </fieldset>

          {/* Kết quả (chỉ hiện khi nghiệm thu cuối cùng) */}
          {isNghiemThuCuoiCung && (
            <fieldset className={styles.fieldset}>
              <legend className={styles.legend}>Kết quả nghiệm thu</legend>
              <div className={styles.ketQuaGroup}>
                {KET_QUA_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`${styles.ketQuaBtn} ${ketqua === opt.value ? styles.ketQuaBtnActive : ''}`}
                    style={{ '--accent': opt.color }}
                    onClick={() => { setKetqua(opt.value); setConfirming(false); }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          {/* Nhận xét */}
          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>
              Nhận xét <span className={styles.required}>*</span>
            </legend>
            <textarea
              className={styles.textarea}
              rows={4}
              value={nhanXet}
              onChange={(e) => setNhanXet(e.target.value)}
              placeholder={
                isNghiemThuCuoiCung
                  ? 'Nhận xét về kết quả nghiệm thu...'
                  : 'Ghi chú về tiến độ thực hiện...'
              }
              maxLength={500}
            />
            <div className={styles.charCount}>{nhanXet.length}/500</div>
          </fieldset>

          {/* Số quyết định (tuỳ chọn) */}
          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>Số quyết định (tuỳ chọn)</legend>
            <input
              type="text"
              className={styles.input}
              value={soQuyetDinh}
              onChange={(e) => setSoQuyetDinh(e.target.value)}
              placeholder="Ví dụ: QD-2026/NT-001"
              maxLength={100}
            />
          </fieldset>

          {/* Tài liệu đính kèm / Biên bản nghiệm thu */}
          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>Biên bản nghiệm thu / Tài liệu đính kèm (tuỳ chọn)</legend>
            <div className={styles.fileUploadRow}>
              {fileBienBan ? (
                <div className={styles.fileUploadedBadge}>
                  <HiOutlineDocumentText size={16} />
                  <a href={fileBienBan} target="_blank" rel="noopener noreferrer" className={styles.fileLink}>
                    {fileBienBan.split('/').pop() || 'Xem tài liệu'}
                  </a>
                  <button type="button" className={styles.removeFileBtn} onClick={() => setFileBienBan('')}>
                    <HiOutlineTrash size={14} />
                  </button>
                </div>
              ) : (
                <label className={styles.uploadFileBtn}>
                  <HiOutlinePaperClip size={16} />
                  <span>{uploadingFile ? 'Đang tải lên...' : 'Đính kèm tài liệu'}</span>
                  <input
                    type="file"
                    className={styles.fileInputHidden}
                    disabled={uploadingFile}
                    onChange={handleFileUpload}
                  />
                </label>
              )}
            </div>
          </fieldset>

          {/* Cảnh báo "Không đạt" */}
          {isNghiemThuCuoiCung && isKhongDat && confirming && (
            <div className={styles.warningBox}>
              <HiOutlineExclamationTriangle size={20} className={styles.warningIcon} />
              <div>
                <div className={styles.warningTitle}>Xác nhận: Đơn KHÔNG ĐẠT nghiệm thu?</div>
                <div className={styles.warningDesc}>
                  Hành động này sẽ chuyển trạng thái đơn sang "Nghiem thu khong dat" và
                  <strong> chặn các đợt giải ngân tiếp theo</strong> của quỹ liên quan.
                </div>
                <div className={styles.warningActions}>
                  <Button variant="ghost" onClick={() => setConfirming(false)}>
                    Huỷ
                  </Button>
                  <Button variant="danger" onClick={handleConfirmSubmit} loading={submitting}>
                    Xác nhận Không đạt
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Cảnh báo "Đạt" / "Đạt có điều chỉnh" */}
          {isNghiemThuCuoiCung && !isKhongDat && ketqua && confirming && (
            <div className={styles.confirmBox}>
              <div className={styles.confirmTitle}>
                Xác nhận nghiệm thu cuối cùng: <strong>{KET_QUA_OPTIONS.find(k => k.value === ketqua)?.label}</strong>?
              </div>
              <div className={styles.warningActions}>
                <Button variant="ghost" onClick={() => setConfirming(false)}>
                  Huỷ
                </Button>
                <Button variant="primary" onClick={handleConfirmSubmit} loading={submitting}>
                  Xác nhận
                </Button>
              </div>
            </div>
          )}
        </div>

        <footer className={styles.footer}>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Đóng
          </Button>
          {!confirming && (
            <Button
              variant={isNghiemThuCuoiCung && isKhongDat ? 'danger' : 'primary'}
              disabled={!canSubmit || submitting}
              loading={submitting}
              onClick={handleRequestSubmit}
            >
              {isNghiemThuCuoiCung ? 'Nghiệm thu cuối cùng' : 'Ghi nhận kiểm tra'}
            </Button>
          )}
        </footer>
      </div>
    </div>
  );
};

NghiemThuFormModal.propTypes = {
  yeucauhotroId: PropTypes.number.isRequired,
  existingHistory: PropTypes.array,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
};

export default NghiemThuFormModal;

