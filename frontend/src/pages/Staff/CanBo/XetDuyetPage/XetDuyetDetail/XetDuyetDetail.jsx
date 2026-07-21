import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  HiOutlineArrowLeft,
  HiOutlineInformationCircle,
  HiOutlineXCircle,
  HiOutlineClipboardDocumentCheck,
  HiOutlineBanknotes,
  HiOutlineClock,
  HiOutlineDocumentDuplicate,
  HiOutlineExclamationTriangle,
  HiOutlineCheckCircle,
  HiOutlineSparkles,
} from 'react-icons/hi2';
import Button from '@components/common/Button/Button';
import StatusBadge from '@components/common/StatusBadge/StatusBadge';
import CurrencyInput from '@components/common/CurrencyInput';
import { formatCurrency } from '@utils/formatters';
import { useAuth } from '@context/AuthContext';
import api from '@services/api';
import nghiemThuService from '@services/nghiemThuService';
import StudentInfoCard from './StudentInfoCard/StudentInfoCard';
import RequestInfoCard from './RequestInfoCard/RequestInfoCard';
import BankInfoCard from './BankInfoCard/BankInfoCard';
import FundInfoSection from './FundInfoSection/FundInfoSection';
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
  const [fundDetail, setFundDetail] = useState(null);

  // ── Fields cho "Tài trợ có thu hồi" (Admin duyệt cấp 2) ──
  const [mucThuHoi, setMucThuHoi] = useState('');
  const [thoiHanHoanTra, setThoiHanHoanTra] = useState('');
  const [soQuyetDinh, setSoQuyetDinh] = useState('');
  const [thuHoiErrors, setThuHoiErrors] = useState({});

  // ── Fields cho "Cho vay" (Admin duyệt cấp 2) ──
  const [laiSuat, setLaiSuat] = useState('');
  const [kyHan, setKyHan] = useState('');
  const [ngayKyHopDong, setNgayKyHopDong] = useState('');
  const [vayErrors, setVayErrors] = useState({});

  // ── Tính năng hỗ trợ: Mức thu hồi tối đa 30% ──
  const tongKinhPhi = data?.tongKinhPhiDuAn || 0;
  const mucToiDaThuHoi = tongKinhPhi > 0 ? Math.floor(tongKinhPhi * 0.3) : 0;
  const mucThuHoiNum = parseFloat(mucThuHoi) || 0;
  const isExceededMucToiDa = mucToiDaThuHoi > 0 && mucThuHoiNum > mucToiDaThuHoi;

  // ── Tính năng hỗ trợ: Tự động sinh số quyết định ──
  const generateSoQuyetDinh = useCallback(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const seq = String(Math.floor(Math.random() * 900) + 100).padStart(3, '0');
    return `QĐ-${year}${month}-TTH-${seq}`;
  }, []);

  // Xác định role và endpoint tương ứng
  const userRole = user?.roleId || user?.role_id || user?.vaiTro || user?.role?.id;
  const isAdmin = userRole === 1;
  const isKeToan = userRole === 2;
  const isGiaoVu = userRole === 3;

  // Auto-generate số QĐ khi mở form thu hồi
  useEffect(() => {
    if (isAdmin && data?.loaiHotro === 'Tai tro co thu hoi' && !soQuyetDinh) {
      setSoQuyetDinh(generateSoQuyetDinh());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.loaiHotro]);

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

  // Fetch chi tiết quỹ khi có data đơn
  useEffect(() => {
    if (!data?.quy?.id) return undefined;
    let mounted = true;
    api
      .get(`/funds/${data.quy.id}`)
      .then((res) => {
        if (mounted) setFundDetail(res.data?.fund || res.data?.data || null);
      })
      .catch(() => {
        if (mounted) setFundDetail(null);
      });
    return () => { mounted = false; };
  }, [data?.quy?.id]);

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
      } else if (isExceededMucToiDa) {
        errors.mucThuHoi = `Mức thu hồi vượt quá 30% tổng kinh phí (tối đa: ${formatCurrency(mucToiDaThuHoi)})`;
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

    // Validate thêm cho "Cho vay" (Admin duyệt cấp 2)
    if (isAdmin && data?.loaiHotro === 'Cho vay') {
      const errors = {};
      if (!laiSuat || isNaN(laiSuat) || parseFloat(laiSuat) < 0) {
        errors.laiSuat = 'Lãi suất phải ≥ 0';
      }
      if (!kyHan || isNaN(kyHan) || parseInt(kyHan) <= 0) {
        errors.kyHan = 'Kỳ hạn phải > 0 tháng';
      }
      if (!ngayKyHopDong) {
        errors.ngayKyHopDong = 'Ngày ký hợp đồng là bắt buộc';
      }
      if (Object.keys(errors).length > 0) {
        setVayErrors(errors);
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
            ketqua: 'Duyet',
            ghiChu,
            mucthuhoi: parseFloat(mucThuHoi),
            thoihanhoantra: parseInt(thoiHanHoanTra),
            soQuyetDinh: soQuyetDinh.trim(),
          };
        } else if (data?.loaiHotro === 'Cho vay') {
          payload = {
            ketqua: 'Duyet',
            ghiChu,
            sotienvon: data.soTienYeuCau,
            laisuatphantram: parseFloat(laiSuat),
            ngaykyhopdong: ngayKyHopDong,
            kyhandothang: parseInt(kyHan),
          };
        } else {
          payload = { ketqua: 'Duyet', ghiChu };
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
            <FundInfoSection fund={fundDetail} />
            <StudentInfoCard userId={data.nguoiNop?.id} fallback={data.nguoiNop} />
            <RequestInfoCard
              tieuDe={data.tieuDe}
              moTa={data.moTa}
              soTienYeuCau={data.soTienYeuCau}
              loaiHoTro={data.loaiHotro}
              tongKinhPhiDuAn={data.tongKinhPhiDuAn}
              quy={data.quy}
              files={files}
              onPreviewFile={setPreviewFile}
            />
            <BankInfoCard userId={data.nguoiNop?.id} />
          </div>

          <aside className={styles.rightCol}>
            {/* ── "Tài trợ có thu hồi" — Form nhập (Admin duyệt cấp 2, chưa duyệt) ── */}
            {isAdmin && data?.loaiHotro === 'Tai tro co thu hoi' && !isDisabled && (
              <section className={styles.thuHoiSection}>
                <div className={styles.thuHoiHeader}>
                  <h3 className={styles.thuHoiTitle}>Thông tin tài trợ thu hồi</h3>
                  <span className={styles.thuHoiRequired}>Bắt buộc</span>
                </div>

                {/* Gợi ý mức thu hồi tối đa */}
                {mucToiDaThuHoi > 0 && (
                  <div className={`${styles.thuHoiHint} ${isExceededMucToiDa ? styles.thuHoiHintDanger : styles.thuHoiHintOk}`}>
                    {isExceededMucToiDa ? (
                      <HiOutlineExclamationTriangle className={styles.thuHoiHintIcon} />
                    ) : (
                      <HiOutlineCheckCircle className={styles.thuHoiHintIcon} />
                    )}
                    <div className={styles.thuHoiHintText}>
                      <span>
                        {isExceededMucToiDa
                          ? `Vượt quá mức cho phép! Tối đa 30% tổng kinh phí dự án`
                          : `Mức thu hồi tối đa theo Điều 15.1:`
                        }
                      </span>
                      <strong>{formatCurrency(mucToiDaThuHoi)}</strong>
                      <span className={styles.thuHoiHintSub}>
                        (Dựa trên tổng kinh phí dự án: {formatCurrency(tongKinhPhi)})
                      </span>
                    </div>
                  </div>
                )}

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
                    className={`${styles.thuHoiInput} ${thuHoiErrors.mucThuHoi || isExceededMucToiDa ? styles.thuHoiInputError : ''}`}
                    placeholder="VD: 10000000"
                    min={0}
                    max={mucToiDaThuHoi || undefined}
                  />
                  {thuHoiErrors.mucThuHoi && <span className={styles.thuHoiError}>{thuHoiErrors.mucThuHoi}</span>}
                  {isExceededMucToiDa && !thuHoiErrors.mucThuHoi && (
                    <span className={styles.thuHoiError}>
                      Số tiền ({formatCurrency(mucThuHoiNum)}) vượt quá mức tối đa ({formatCurrency(mucToiDaThuHoi)})
                    </span>
                  )}
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
                  <div className={styles.genRow}>
                    <input
                      id="soQuyetDinh"
                      type="text"
                      className={`${styles.thuHoiInput} ${styles.genInput} ${thuHoiErrors.soQuyetDinh ? styles.thuHoiInputError : ''}`}
                      value={soQuyetDinh}
                      onChange={(e) => {
                        setSoQuyetDinh(e.target.value);
                        if (thuHoiErrors.soQuyetDinh) setThuHoiErrors((p) => ({ ...p, soQuyetDinh: '' }));
                      }}
                      placeholder="QĐ-202601-TTH-001"
                    />
                    <button
                      type="button"
                      className={styles.genBtn}
                      onClick={() => setSoQuyetDinh(generateSoQuyetDinh())}
                      title="Tạo lại mã tự động"
                    >
                      <HiOutlineSparkles />
                    </button>
                  </div>
                  {thuHoiErrors.soQuyetDinh && <span className={styles.thuHoiError}>{thuHoiErrors.soQuyetDinh}</span>}
                </div>
              </section>
            )}

            {/* ── "Tài trợ có thu hồi" — Hiển thị data đã lưu (đã duyệt) ── */}
            {data?.loaiHotro === 'Tai tro co thu hoi' && data?.dieukhoanthuhoi && (
              <section className={styles.contractSection}>
                <div className={styles.contractHeader}>
                  <HiOutlineBanknotes size={18} className={styles.contractIcon} />
                  <h3 className={styles.contractTitle}>Điều khoản thu hồi</h3>
                  <span className={`${styles.contractBadge} ${styles.contractBadgeRecovery}`}>Đã phê duyệt</span>
                </div>
                <div className={styles.contractGrid}>
                  <div className={styles.contractItem}>
                    <span className={styles.contractLabel}>Mức thu hồi</span>
                    <span className={styles.contractValue}>{formatCurrency(data.dieukhoanthuhoi.mucthuhoi)}</span>
                  </div>
                  <div className={styles.contractItem}>
                    <span className={styles.contractLabel}>Thời hạn hoàn trả</span>
                    <span className={styles.contractValue}>{data.dieukhoanthuhoi.thoihanhoantra_thang} tháng</span>
                  </div>
                  <div className={styles.contractItem}>
                    <span className={styles.contractLabel}>Số quyết định</span>
                    <span className={styles.contractValue}>{data.dieukhoanthuhoi.soquyetdinh_hopdong || '—'}</span>
                  </div>
                  {data.dieukhoanthuhoi.filehopdong && (
                    <div className={styles.contractItem}>
                      <span className={styles.contractLabel}>File hợp đồng</span>
                      <a
                        href={data.dieukhoanthuhoi.filehopdong}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.contractLink}
                      >
                        Xem file
                      </a>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* ── "Cho vay" — Form nhập (Admin duyệt cấp 2, chưa duyệt) ── */}
            {isAdmin && data?.loaiHotro === 'Cho vay' && !isDisabled && (
              <section className={styles.loanSection}>
                <div className={styles.loanHeader}>
                  <h3 className={styles.loanTitle}>Thông tin khoản vay</h3>
                  <span className={styles.loanRequired}>Bắt buộc</span>
                </div>

                <div className={styles.loanInfo}>
                  <HiOutlineInformationCircle size={14} />
                  <span>Số tiền vay = số tiền đề nghị ({formatCurrency(data.soTienYeuCau)})</span>
                </div>

                <div className={styles.loanField}>
                  <label className={styles.loanLabel} htmlFor="laiSuat">
                    Lãi suất (%/năm)
                  </label>
                  <input
                    id="laiSuat"
                    type="number"
                    step="0.1"
                    min="0"
                    className={`${styles.loanInput} ${vayErrors.laiSuat ? styles.loanInputError : ''}`}
                    value={laiSuat}
                    onChange={(e) => {
                      setLaiSuat(e.target.value);
                      if (vayErrors.laiSuat) setVayErrors((p) => ({ ...p, laiSuat: '' }));
                    }}
                    placeholder="VD: 4.5"
                  />
                  {vayErrors.laiSuat && <span className={styles.loanError}>{vayErrors.laiSuat}</span>}
                </div>

                <div className={styles.loanField}>
                  <label className={styles.loanLabel} htmlFor="kyHan">
                    Kỳ hạn (tháng)
                  </label>
                  <input
                    id="kyHan"
                    type="number"
                    min="1"
                    className={`${styles.loanInput} ${vayErrors.kyHan ? styles.loanInputError : ''}`}
                    value={kyHan}
                    onChange={(e) => {
                      setKyHan(e.target.value);
                      if (vayErrors.kyHan) setVayErrors((p) => ({ ...p, kyHan: '' }));
                    }}
                    placeholder="VD: 24"
                  />
                  {vayErrors.kyHan && <span className={styles.loanError}>{vayErrors.kyHan}</span>}
                </div>

                <div className={styles.loanField}>
                  <label className={styles.loanLabel} htmlFor="ngayKyHopDong">
                    Ngày ký hợp đồng
                  </label>
                  <input
                    id="ngayKyHopDong"
                    type="date"
                    className={`${styles.loanInput} ${vayErrors.ngayKyHopDong ? styles.loanInputError : ''}`}
                    value={ngayKyHopDong}
                    onChange={(e) => {
                      setNgayKyHopDong(e.target.value);
                      if (vayErrors.ngayKyHopDong) setVayErrors((p) => ({ ...p, ngayKyHopDong: '' }));
                    }}
                  />
                  {vayErrors.ngayKyHopDong && <span className={styles.loanError}>{vayErrors.ngayKyHopDong}</span>}
                </div>
              </section>
            )}

            {/* ── "Cho vay" — Hiển thị hợp đồng đã tạo (đã duyệt) ── */}
            {data?.loaiHotro === 'Cho vay' && data?.hopdongvayvon && (
              <section className={styles.contractSection}>
                <div className={styles.contractHeader}>
                  <HiOutlineDocumentDuplicate size={18} className={styles.contractIcon} />
                  <h3 className={styles.contractTitle}>Hợp đồng vay vốn</h3>
                  <span className={`${styles.contractBadge} ${styles.contractBadgeLoan}`}>Đang thực hiện</span>
                </div>
                <div className={styles.contractGrid}>
                  <div className={styles.contractItem}>
                    <span className={styles.contractLabel}>Số tiền vay</span>
                    <span className={styles.contractValue}>{formatCurrency(data.hopdongvayvon.sotienvon)}</span>
                  </div>
                  <div className={styles.contractItem}>
                    <span className={styles.contractLabel}>Lãi suất</span>
                    <span className={styles.contractValue}>{data.hopdongvayvon.laisuatphantram}%/năm</span>
                  </div>
                  <div className={styles.contractItem}>
                    <span className={styles.contractLabel}>Kỳ hạn</span>
                    <span className={styles.contractValue}>{data.hopdongvayvon.kyhandothang} tháng</span>
                  </div>
                  <div className={styles.contractItem}>
                    <span className={styles.contractLabel}>Ngày ký HĐ</span>
                    <span className={styles.contractValue}>{data.hopdongvayvon.ngaykyhopdong}</span>
                  </div>
                  <div className={styles.contractItem}>
                    <span className={styles.contractLabel}>Ngày đáo hạn</span>
                    <span className={styles.contractValue}>{data.hopdongvayvon.ngaydaohan}</span>
                  </div>
                  <div className={styles.contractItem}>
                    <span className={styles.contractLabel}>Trạng thái HĐ</span>
                    <span className={styles.contractValue}>{data.hopdongvayvon.trangthai}</span>
                  </div>
                  {data.hopdongvayvon.filehopdong && (
                    <div className={styles.contractItem}>
                      <span className={styles.contractLabel}>File hợp đồng</span>
                      <a
                        href={data.hopdongvayvon.filehopdong}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.contractLink}
                      >
                        Xem file
                      </a>
                    </div>
                  )}
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
