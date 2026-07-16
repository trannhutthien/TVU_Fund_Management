import { useState, useEffect, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  HiOutlineArrowLeft,
  HiOutlineInformationCircle,
  HiOutlineXCircle,
  HiOutlineClipboardDocumentCheck,
} from 'react-icons/hi2';
import Button from '@components/common/Button/Button';
import StatusBadge from '@components/common/StatusBadge/StatusBadge';
import CurrencyInput from '@components/common/CurrencyInput';
import { useAuth } from '@context/AuthContext';
import api from '@services/api';
import nghiemThuService from '@services/nghiemThuService';
import StudentInfoCard from './StudentInfoCard/StudentInfoCard';
import RequestInfoCard from './RequestInfoCard/RequestInfoCard';
import BankInfoCard from './BankInfoCard/BankInfoCard';
import ReviewPanel from './ReviewPanel/ReviewPanel';
import NghiemThuFormModal from './NghiemThuSection/NghiemThuFormModal';
import NghiemThuTimeline from './NghiemThuSection/NghiemThuTimeline';
import styles from './XetDuyetDetail.module.scss';

const INITIAL_CHECKLIST = {
  dung_doi_tuong: false,
  giay_to_day_du: false,
  so_tien_hop_ly: false,
  khong_trung_don: false,
};

const mapStatusToBadge = (trangThai) => {
  switch (trangThai) {
    case 'Cho duyet':
      return 'pending';
    case 'Dang xu ly':
      return 'processing';
    case 'Da duyet':
      return 'approved';
    case 'Tu choi':
      return 'rejected';
    case 'Hoan thanh':
      return 'completed';
    default:
      return 'pending';
  }
};

const parseFileList = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw !== 'string') return [];
  const trimmed = raw.trim();
  if (!trimmed) return [];
  if (trimmed.startsWith('[')) {
    try {
      const arr = JSON.parse(trimmed);
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  }
  return trimmed
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
};

const XetDuyetDetail = () => {
  const { request_id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [checklist, setChecklist] = useState(INITIAL_CHECKLIST);
  const [ghiChu, setGhiChu] = useState('');
  const [ghiChuError, setGhiChuError] = useState('');
  const [previewFile, setPreviewFile] = useState(null);
  const [nghiemThuHistory, setNghiemThuHistory] = useState([]);
  const [showNghiemThuModal, setShowNghiemThuModal] = useState(false);

  // ── Fields cho "Tài trợ có thu hồi" (Admin duyệt cấp 2) ──
  const [mucThuHoi, setMucThuHoi] = useState('');
  const [thoiHanHoanTra, setThoiHanHoanTra] = useState('');
  const [soQuyetDinh, setSoQuyetDinh] = useState('');
  const [thuHoiErrors, setThuHoiErrors] = useState({});

  // Xác định role và endpoint tương ứng
  const userRole = user?.roleId || user?.role_id || user?.vaiTro || user?.role?.id;
  const isAdmin = userRole === 1;
  const isKeToan = userRole === 2;
  const isGiaoVu = userRole === 3;

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api
      .get(`/applications/${request_id}`)
      .then((res) => {
        if (mounted) setData(res.data?.data || null);
      })
      .catch(() => {
        if (mounted) {
          setData(null);
          toast.error('Không tải được thông tin đơn');
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [request_id]);

  useEffect(() => {
    if (!previewFile) return undefined;
    const handler = (e) => {
      if (e.key === 'Escape') setPreviewFile(null);
    };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [previewFile]);

  useEffect(() => {
    if (!data?.canNghiemThu || !request_id) {
      setNghiemThuHistory([]);
      return;
    }
    let mounted = true;
    nghiemThuService
      .getInspectionHistory(request_id)
      .then((res) => {
        if (mounted) setNghiemThuHistory(res?.data?.lichSuNghiemThu || []);
      })
      .catch(() => {
        if (mounted) setNghiemThuHistory([]);
      });
    return () => { mounted = false; };
  }, [data?.canNghiemThu, request_id]);

  const files = useMemo(
    () => parseFileList(data?.fileDinhKem),
    [data?.fileDinhKem],
  );

  const tickedCount = Object.values(checklist).filter(Boolean).length;
  
  const isReviewed = (() => {
    const status = data?.trangThai;
    
    // Đơn đã từ chối, đã giải ngân, hoàn thành → không cho duyệt nữa
    if (
      status === 'Tu choi' || 
      status === 'Tu choi cap 1' || 
      status === 'Tu choi cap 2' || 
      status === 'Tu choi cap 3' || 
      status === 'Da giai ngan' || 
      status === 'Hoan thanh'
    ) {
      return true;
    }
    
    // Cán bộ (Giáo vụ): Chỉ được duyệt đơn ở trạng thái "Cho duyet" hoặc "Cho duyet cap 1"
    if (isGiaoVu) {
      return status !== 'Cho duyet' && status !== 'Cho duyet cap 1';
    }
    
    // Admin: Chỉ được duyệt đơn ở trạng thái "Cho duyet cap 2"
    if (isAdmin) {
      return status !== 'Cho duyet cap 2';
    }
    
    // Kế toán: Không duyệt tại đây (duyệt ở trang Giải ngân)
    if (isKeToan) {
      return true;
    }
    
    return false;
  })();

  const isDisabled = isReviewed;

  const canShowNghiemThu = data?.canNghiemThu && 
    ['Da giai ngan', 'Cho nghiem thu', 'Da nghiem thu', 'Nghiem thu khong dat'].includes(data?.trangThai);
  const canCreateNghiemThu = data?.canNghiemThu && 
    ['Da giai ngan', 'Cho nghiem thu'].includes(data?.trangThai);
  const isNghiemThuDone = data?.trangThai === 'Da nghiem thu';
  const isNghiemThuFailed = data?.trangThai === 'Nghiem thu khong dat';

  const handleToggleChecklist = (key) => {
    if (isDisabled) return;
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleGhiChuChange = (value) => {
    if (value.length > 500) return;
    setGhiChu(value);
    if (ghiChuError) setGhiChuError('');
  };

  const handleReject = async () => {
    if (!ghiChu.trim()) {
      setGhiChuError('Bắt buộc nhập lý do từ chối');
      return;
    }
    setSubmitting(true);
    try {
      await api.put(`/applications/${request_id}/reject`, {
        lyDoTuChoi: ghiChu,
        ghiChu,
      });
      toast.error('Đã từ chối hồ sơ');
      
      // Redirect về đúng trang dựa trên role
      const redirectPath = isAdmin ? '/admin/xet-duyet' : '/can-bo/xet-duyet';
      navigate(redirectPath);
    } catch (err) {
      const msg =
        err?.response?.data?.message || 'Không thể từ chối hồ sơ, vui lòng thử lại';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async () => {
    if (tickedCount < 3) return;
    if (!ghiChu.trim()) {
      setGhiChuError('Bắt buộc nhập ghi chú xét duyệt');
      return;
    }

    // Validate thêm cho "Tài trợ có thu hồi" (Admin duyệt cấp 2)
    if (isAdmin && data?.loaiHotro === 'Tai tro co thu hoi') {
      const errors = {};
      if (!mucThuHoi || isNaN(mucThuHoi) || parseFloat(mucThuHoi) <= 0) {
        errors.mucThuHoi = 'Mức thu hồi phải > 0';
      }
      if (!thoiHanHoanTra || isNaN(thoiHanHoanTra) || parseInt(thoiHanHoanTra) <= 0) {
        errors.thoiHanHoanTra = 'Thời hạn hoàn trả phải > 0 tháng';
      }
      if (!soQuyetDinh.trim()) {
        errors.soQuyetDinh = 'Số quyết định là bắt buộc';
      }
      if (Object.keys(errors).length > 0) {
        setThuHoiErrors(errors);
        return;
      }
    }

    setSubmitting(true);
    try {
      // Xác định endpoint dựa trên role
      let endpoint;
      let successMessage;
      let redirectPath;
      let payload;

      if (isGiaoVu) {
        // Giáo vụ (role 3): Duyệt cấp 1
        endpoint = `/applications/${request_id}/staff-approve`;
        successMessage = 'Đã chuyển hồ sơ lên Admin xét duyệt';
        redirectPath = '/can-bo/xet-duyet';
        payload = { ghiChu };
      } else if (isAdmin) {
        // Admin (role 1): Duyệt cấp 2
        endpoint = `/applications/${request_id}/admin-approve`;
        successMessage = 'Đã chuyển hồ sơ lên Kế toán giải ngân';
        redirectPath = '/admin/xet-duyet';
        if (data?.loaiHotro === 'Tai tro co thu hoi') {
          payload = {
            ghiChu,
            mucthuhoi: parseFloat(mucThuHoi),
            thoihanhoantra: parseInt(thoiHanHoanTra),
            soQuyetDinh: soQuyetDinh.trim(),
          };
        } else {
          payload = { ghiChu };
        }
      } else if (isKeToan) {
        // Kế toán (role 2): Duyệt cấp 3 - sẽ xử lý ở trang Giải ngân
        toast.info('Vui lòng sử dụng trang Giải ngân để xử lý đơn này');
        navigate('/ke-toan/giai-ngan');
        return;
      } else {
        toast.error('Bạn không có quyền duyệt đơn này');
        return;
      }

      await api.put(endpoint, payload);
      toast.success(successMessage);
      navigate(redirectPath);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        'Không thể chuyển duyệt, vui lòng thử lại';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.inner}>
          <div className={styles.loadingBox}>Đang tải thông tin đơn...</div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={styles.page}>
        <div className={styles.inner}>
          <div className={styles.loadingBox}>
            Không tìm thấy đơn #{request_id}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.breadcrumb}>
          <Link to="/can-bo/xet-duyet" className={styles.crumbLink}>
            Xét duyệt hồ sơ
          </Link>
          <span className={styles.crumbSep}>/</span>
          <span>Chi tiết đơn #{request_id}</span>
        </div>

        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className={styles.title}>Chi tiết đơn #{request_id}</h1>
            <StatusBadge status={mapStatusToBadge(data.trangThai)} />
          </div>
          <Button
            variant="ghost"
            leftIcon={<HiOutlineArrowLeft />}
            onClick={() => navigate(-1)}
          >
            Quay lại danh sách
          </Button>
        </header>

        {data.trangThai === 'Dang xu ly' && (
          <div className={`${styles.banner} ${styles.bannerInfo}`}>
            <HiOutlineInformationCircle className={styles.bannerIcon} />
            <span>Đơn này đã được chuyển lên cấp duyệt tiếp theo.</span>
          </div>
        )}

        {data.trangThai === 'Tu choi' && (
          <div className={`${styles.banner} ${styles.bannerDanger}`}>
            <HiOutlineXCircle className={styles.bannerIcon} />
            <div>
              <div className={styles.bannerTitle}>Đơn này đã bị từ chối.</div>
              {data.lyDoTuChoi && (
                <div className={styles.bannerReason}>
                  Lý do: {data.lyDoTuChoi}
                </div>
              )}
            </div>
          </div>
        )}

        <div className={styles.layout}>
          <div className={styles.leftCol}>
            <StudentInfoCard userId={data.nguoiNop?.id} fallback={data.nguoiNop} />
            <RequestInfoCard
              tieuDe={data.tieuDe}
              moTa={data.moTa}
              soTienYeuCau={data.soTienYeuCau}
              quy={data.quy}
              files={files}
              onPreviewFile={setPreviewFile}
            />
            <BankInfoCard userId={data.nguoiNop?.id} />
          </div>

          <aside className={styles.rightCol}>
            {/* ── Fields bổ sung cho "Tài trợ có thu hồi" (Admin duyệt cấp 2) ── */}
            {isAdmin && data?.loaiHotro === 'Tai tro co thu hoi' && !isDisabled && (
              <section className={styles.thuHoiSection}>
                <div className={styles.thuHoiHeader}>
                  <h3 className={styles.thuHoiTitle}>Thông tin tài trợ thu hồi</h3>
                  <span className={styles.thuHoiRequired}>Bắt buộc</span>
                </div>

                <div className={styles.thuHoiField}>
                  <label className={styles.thuHoiLabel} htmlFor="mucThuHoi">
                    Mức thu hồi (VNĐ)
                  </label>
                  <CurrencyInput
                    id="mucThuHoi"
                    value={mucThuHoi}
                    onChange={(raw) => {
                      setMucThuHoi(raw);
                      if (thuHoiErrors.mucThuHoi) setThuHoiErrors((p) => ({ ...p, mucThuHoi: '' }));
                    }}
                    className={`${styles.thuHoiInput} ${thuHoiErrors.mucThuHoi ? styles.thuHoiInputError : ''}`}
                    placeholder="VD: 10000000"
                    min={0}
                  />
                  {thuHoiErrors.mucThuHoi && <span className={styles.thuHoiError}>{thuHoiErrors.mucThuHoi}</span>}
                </div>

                <div className={styles.thuHoiField}>
                  <label className={styles.thuHoiLabel} htmlFor="thoiHanHoanTra">
                    Thời hạn hoàn trả (tháng)
                  </label>
                  <input
                    id="thoiHanHoanTra"
                    type="number"
                    min="1"
                    className={`${styles.thuHoiInput} ${thuHoiErrors.thoiHanHoanTra ? styles.thuHoiInputError : ''}`}
                    value={thoiHanHoanTra}
                    onChange={(e) => {
                      setThoiHanHoanTra(e.target.value);
                      if (thuHoiErrors.thoiHanHoanTra) setThuHoiErrors((p) => ({ ...p, thoiHanHoanTra: '' }));
                    }}
                    placeholder="VD: 12"
                  />
                  {thuHoiErrors.thoiHanHoanTra && <span className={styles.thuHoiError}>{thuHoiErrors.thoiHanHoanTra}</span>}
                </div>

                <div className={styles.thuHoiField}>
                  <label className={styles.thuHoiLabel} htmlFor="soQuyetDinh">
                    Số quyết định hợp đồng
                  </label>
                  <input
                    id="soQuyetDinh"
                    type="text"
                    className={`${styles.thuHoiInput} ${thuHoiErrors.soQuyetDinh ? styles.thuHoiInputError : ''}`}
                    value={soQuyetDinh}
                    onChange={(e) => {
                      setSoQuyetDinh(e.target.value);
                      if (thuHoiErrors.soQuyetDinh) setThuHoiErrors((p) => ({ ...p, soQuyetDinh: '' }));
                    }}
                    placeholder="VD: QĐ-2025-001"
                  />
                  {thuHoiErrors.soQuyetDinh && <span className={styles.thuHoiError}>{thuHoiErrors.soQuyetDinh}</span>}
                </div>
              </section>
            )}

            <ReviewPanel
              checklist={checklist}
              onToggleChecklist={handleToggleChecklist}
              ghiChu={ghiChu}
              onGhiChuChange={handleGhiChuChange}
              ghiChuError={ghiChuError}
              submitting={submitting}
              disabled={isDisabled}
              tickedCount={tickedCount}
              onApprove={handleApprove}
              onReject={handleReject}
            />

            {canShowNghiemThu && (
              <section className={styles.nghiemThuSection}>
                <div className={styles.nghiemThuHeader}>
                  <HiOutlineClipboardDocumentCheck size={18} className={styles.nghiemThuIcon} />
                  <h3 className={styles.nghiemThuTitle}>Nghiệm thu</h3>
                  {isNghiemThuDone && <span className={styles.nghiemThuBadge}>Đạt</span>}
                  {isNghiemThuFailed && <span className={`${styles.nghiemThuBadge} ${styles.nghiemThuBadgeFailed}`}>Không đạt</span>}
                </div>

                {nghiemThuHistory.length > 0 && (
                  <NghiemThuTimeline history={nghiemThuHistory} />
                )}

                {canCreateNghiemThu && (isAdmin || isGiaoVu) && (
                  <Button
                    variant="primary"
                    leftIcon={<HiOutlineClipboardDocumentCheck />}
                    onClick={() => setShowNghiemThuModal(true)}
                    className={styles.nghiemThuBtn}
                  >
                    Tạo lượt nghiệm thu
                  </Button>
                )}
              </section>
            )}
          </aside>
        </div>

        {previewFile && (
          <div
            className={styles.modalOverlay}
            onClick={() => setPreviewFile(null)}
          >
            <button
              type="button"
              className={styles.modalClose}
              onClick={() => setPreviewFile(null)}
              aria-label="Đóng"
            >
              ✕
            </button>
            <img
              src={previewFile}
              alt="Preview"
              className={styles.modalImage}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}

        {showNghiemThuModal && (
          <NghiemThuFormModal
            yeucauhotroId={parseInt(request_id)}
            existingHistory={nghiemThuHistory}
            onClose={() => setShowNghiemThuModal(false)}
            onSuccess={() => {
              // Reload data
              api.get(`/applications/${request_id}`).then((res) => {
                setData(res.data?.data || null);
              });
              nghiemThuService.getInspectionHistory(request_id).then((res) => {
                setNghiemThuHistory(res?.data?.lichSuNghiemThu || []);
              });
            }}
          />
        )}
      </div>
    </div>
  );
};

export default XetDuyetDetail;
