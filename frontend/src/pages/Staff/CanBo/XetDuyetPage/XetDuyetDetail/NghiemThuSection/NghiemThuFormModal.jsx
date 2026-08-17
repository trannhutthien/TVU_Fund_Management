import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import {
  HiOutlineXMark,
  HiOutlineClipboardDocumentCheck,
  HiOutlineExclamationTriangle,
  HiOutlinePaperClip,
  HiOutlineDocumentText,
  HiOutlineTrash,
  HiOutlineSparkles,
  HiOutlineUser,
  HiOutlineCalendarDays,
  HiOutlineCurrencyDollar,
  HiOutlineClock,
} from 'react-icons/hi2';
import Button from '@components/common/Button/Button';
import { uploadService } from '@services/uploadService';
import nghiemThuService from '@services/nghiemThuService';
import styles from './NghiemThuFormModal.module.scss';

const LOAI_KIEM_TRA_OPTIONS = [
  { value: 'Kiem tra tien do', label: 'Kiểm tra tiến độ', desc: 'Theo dõi tiến độ thực hiện, chờ Admin duyệt' },
  { value: 'Nghiem thu cuoi cung', label: 'Nghiệm thu cuối cùng', desc: 'Chốt kết quả: chờ Admin duyệt Đạt / Đạt có điều chỉnh / Không đạt' },
];

const KET_QUA_OPTIONS = [
  { value: 'Dat', label: 'Đạt', color: '#16a34a' },
  { value: 'Dat co dieu chinh', label: 'Đạt có điều chỉnh', color: '#d97706' },
  { value: 'Khong dat', label: 'Không đạt', color: '#dc2626' },
];

const NghiemThuFormModal = ({
  yeucauhotroId,
  mode = 'create',
  inspectionData = null,
  onClose,
  onSuccess,
}) => {
  const [loaiKiemTra, setLoaiKiemTra] = useState('Kiem tra tien do');
  const [ketqua, setKetqua] = useState('');
  const [nhanXet, setNhanXet] = useState('');
  const [soQuyetDinh, setSoQuyetDinh] = useState('');
  const [fileBienBan, setFileBienBan] = useState('');
  const [ngayNghiemThu, setNgayNghiemThu] = useState(() => new Date().toISOString().slice(0, 10));
  const [uploadingFile, setUploadingFile] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const generateSoQuyetDinh = useCallback(() => {
    const now = new Date();
    const year = now.getFullYear();
    const seq = String(Math.floor(Math.random() * 900) + 100).padStart(3, '0');
    return `QĐ-${year}/NT-${seq}`;
  }, []);

  // Pre-fill form for approve/edit modes
  useEffect(() => {
    if (inspectionData && (mode === 'approve' || mode === 'edit')) {
      setLoaiKiemTra(inspectionData.loaiKiemTra || 'Kiem tra tien do');
      setNhanXet(inspectionData.nhanXet || '');
      setSoQuyetDinh(inspectionData.soQuyetDinh || generateSoQuyetDinh());
      setFileBienBan(inspectionData.fileBienBan || '');
      setKetqua(''); // Admin selects fresh
    }
  }, [inspectionData, mode, generateSoQuyetDinh]);

  // Auto-generate soQuyetDinh when opening in create mode
  useEffect(() => {
    if (mode === 'create') {
      setSoQuyetDinh(generateSoQuyetDinh());
    }
  }, [mode, generateSoQuyetDinh]);

  const isNghiemThuCuoiCung = loaiKiemTra === 'Nghiem thu cuoi cung';
  const isKhongDat = ketqua === 'Khong dat';
  const isApproveMode = mode === 'approve';
  const isEditMode = mode === 'edit';
  const isCreateMode = mode === 'create';
  const needsKetqua = isApproveMode;

  const canSubmit = nhanXet.trim().length > 0
    && (!needsKetqua || ketqua)
    && !uploadingFile
    && !submitting;

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
      const basePath = import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/?$/, '') || 'http://localhost:5001';
      const url = res?.data?.filePath ? `${basePath}/${res.data.filePath}` : (res?.url || res?.data?.url);
      if (url) {
        setFileBienBan(url);
        toast.success('Tải tài liệu lên thành công');
      } else {
        toast.error('Không lấy được URL tài liệu sau tải lên');
      }
    } catch {
      toast.error('Lỗi khi tải tài liệu lên');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleRequestSubmit = () => {
    if (!canSubmit) return;
    if (isApproveMode) {
      setConfirming(true);
    } else {
      handleConfirmSubmit();
    }
  };

  const handleConfirmSubmit = async () => {
    setSubmitting(true);
    try {
      if (isCreateMode) {
        // ── TẠO MỚI ──
        await nghiemThuService.createInspection(yeucauhotroId, loaiKiemTra, {
          soQuyetDinh: soQuyetDinh.trim() || undefined,
          fileBienBan: fileBienBan || undefined,
          nhanXet: nhanXet.trim() || undefined,
        });
        toast.success(isNghiemThuCuoiCung
          ? 'Đã tạo nghiệm thu cuối cùng, chờ Admin duyệt'
          : 'Đã tạo kiểm tra tiến độ, chờ Admin duyệt'
        );
      } else if (isApproveMode) {
        // ── DUYỆT (Admin) ──
        await nghiemThuService.updateResult(inspectionData.nghiemthuId, {
          ketqua,
          nhanXet: nhanXet.trim(),
          soQuyetDinh: soQuyetDinh.trim() || undefined,
          fileBienBan: fileBienBan || undefined,
          ngayNghiemThu,
        });
        const label = KET_QUA_OPTIONS.find(k => k.value === ketqua)?.label || ketqua;
        toast.success(`Đã duyệt: ${label}`);
      } else if (isEditMode) {
        // ── SỬA CHƯA DUYỆT ──
        await nghiemThuService.updateInspection(inspectionData.nghiemthuId, {
          nhanXet: nhanXet.trim(),
          soQuyetDinh: soQuyetDinh.trim() || undefined,
          fileBienBan: fileBienBan || undefined,
        });
        toast.success('Đã cập nhật thông tin nghiệm thu');
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      // Kiem tra DB da thay doi chua (backend commit truoc khi loi)
      if (isApproveMode && inspectionData?.nghiemthuId) {
        try {
          const checkRes = await nghiemThuService.getInspectionHistory(yeucauhotroId);
          const item = checkRes?.data?.lichSuNghiemThu?.find(
            (x) => x.nghiemthuId === inspectionData.nghiemthuId && x.ketqua !== 'Cho danh gia'
          );
          if (item) {
            toast.success('Đã duyệt nghiệm thu');
            onSuccess?.();
            onClose();
            return;
          }
        } catch { /* ignore re-fetch error */ }
      }
      const msg = err?.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại';
      toast.error(msg);
    } finally {
      setSubmitting(false);
      setConfirming(false);
    }
  };

  const modalTitle = isApproveMode
    ? `Duyệt nghiệm thu #${inspectionData?.nghiemthuId || ''}`
    : isEditMode
      ? `Sửa nghiệm thu lần ${inspectionData?.lanthu || ''}`
      : `Nghiệm thu đơn #${yeucauhotroId}`;

  const submitLabel = isApproveMode
    ? 'Duyệt kết quả'
    : isEditMode
      ? 'Lưu thay đổi'
      : isNghiemThuCuoiCung ? 'Tạo & chờ duyệt' : 'Ghi nhận kiểm tra';

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <header className={styles.header}>
          <div className={styles.headerTitle}>
            <HiOutlineClipboardDocumentCheck size={22} className={styles.headerIcon} />
            <h2>{modalTitle}</h2>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Đóng">
            <HiOutlineXMark size={22} />
          </button>
        </header>

        <div className={styles.body}>
          {/* Loại kiểm tra — chỉ hiện khi tạo mới */}
          {isCreateMode && (
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
          )}

          {/* Hiển thị thông tin đợt nghiệm thu khi duyệt/sửa */}
          {(isApproveMode || isEditMode) && (
            <div className={styles.infoCard}>
              <div className={styles.infoCardTitle}>Thông tin đợt nghiệm thu</div>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <HiOutlineClipboardDocumentCheck size={15} className={styles.infoItemIcon} />
                  <span className={styles.infoItemLabel}>Loại kiểm tra:</span>
                  <span className={styles.infoItemValue}>
                    {isNghiemThuCuoiCung ? 'Nghiệm thu cuối cùng' : 'Kiểm tra tiến độ'}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <HiOutlineCurrencyDollar size={15} className={styles.infoItemIcon} />
                  <span className={styles.infoItemLabel}>Đợt giải ngân:</span>
                  <span className={styles.infoItemValue}>Đợt {inspectionData?.dotgiaingan || 1}</span>
                </div>
                <div className={styles.infoItem}>
                  <HiOutlineClock size={15} className={styles.infoItemIcon} />
                  <span className={styles.infoItemLabel}>Lần thứ:</span>
                  <span className={styles.infoItemValue}>{inspectionData?.lanthu || 1}</span>
                </div>
                {inspectionData?.tenNguoiNghiemThu && (
                  <div className={styles.infoItem}>
                    <HiOutlineUser size={15} className={styles.infoItemIcon} />
                    <span className={styles.infoItemLabel}>Người nghiệm thu:</span>
                    <span className={styles.infoItemValue}>{inspectionData.tenNguoiNghiemThu}</span>
                  </div>
                )}
                {inspectionData?.ngayTao && (
                  <div className={styles.infoItem}>
                    <HiOutlineCalendarDays size={15} className={styles.infoItemIcon} />
                    <span className={styles.infoItemLabel}>Ngày tạo:</span>
                    <span className={styles.infoItemValue}>
                      {new Date(inspectionData.ngayTao).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Kết quả — hiện khi DUYỆT (cả 2 loại) */}
          {isApproveMode && (
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

          {/* Ngày nghiệm thu — chỉ khi duyệt */}
          {isApproveMode && (
            <fieldset className={styles.fieldset}>
              <legend className={styles.legend}>Ngày nghiệm thu</legend>
              <input
                type="date"
                className={styles.input}
                value={ngayNghiemThu}
                onChange={(e) => setNgayNghiemThu(e.target.value)}
              />
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
                isApproveMode
                  ? 'Nhận xét của Admin về kết quả...'
                  : isNghiemThuCuoiCung
                    ? 'Nhận xét về kết quả nghiệm thu...'
                    : 'Ghi chú về tiến độ thực hiện...'
              }
              maxLength={500}
            />
            <div className={styles.charCount}>{nhanXet.length}/500</div>
          </fieldset>

          {/* Số quyết định */}
          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>Số quyết định (tuỳ chọn)</legend>
            <div className={styles.genInputRow}>
              <input
                type="text"
                className={`${styles.input} ${styles.genInput}`}
                value={soQuyetDinh}
                onChange={(e) => setSoQuyetDinh(e.target.value)}
                placeholder="QĐ-2026/NT-001"
                maxLength={100}
              />
              <button
                type="button"
                className={styles.genBtn}
                onClick={() => setSoQuyetDinh(generateSoQuyetDinh())}
                title="Tạo lại số quyết định"
              >
                <HiOutlineSparkles />
              </button>
            </div>
          </fieldset>

          {/* Tài liệu đính kèm */}
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
          {isApproveMode && isKhongDat && confirming && (
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
          {isApproveMode && !isKhongDat && ketqua && confirming && (
            <div className={styles.confirmBox}>
              <div className={styles.confirmTitle}>
                Xác nhận nghiệm thu: <strong>{KET_QUA_OPTIONS.find(k => k.value === ketqua)?.label}</strong>?
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
              variant={isApproveMode && isKhongDat ? 'danger' : 'primary'}
              disabled={!canSubmit}
              loading={submitting}
              onClick={handleRequestSubmit}
            >
              {submitLabel}
            </Button>
          )}
        </footer>
      </div>
    </div>
  );
};

NghiemThuFormModal.propTypes = {
  yeucauhotroId: PropTypes.number.isRequired,
  mode: PropTypes.oneOf(['create', 'approve', 'edit']),
  inspectionData: PropTypes.shape({
    nghiemthuId: PropTypes.number,
    lanthu: PropTypes.number,
    loaiKiemTra: PropTypes.string,
    ketqua: PropTypes.string,
    nhanXet: PropTypes.string,
    soQuyetDinh: PropTypes.string,
    fileBienBan: PropTypes.string,
  }),
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
};

export default NghiemThuFormModal;
