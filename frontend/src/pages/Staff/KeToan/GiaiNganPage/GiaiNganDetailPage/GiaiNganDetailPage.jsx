import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  HiOutlineArrowLeft,
  HiOutlineInformationCircle,
  HiOutlineXCircle,
  HiOutlineCheckCircle,
  HiOutlineExclamationTriangle,
  HiOutlineClipboardDocumentCheck,
  HiOutlineBanknotes,
} from 'react-icons/hi2';
import Button from '@components/common/Button/Button';
import StatusBadge from '@components/common/StatusBadge/StatusBadge';
import { useAuth } from '@context/AuthContext';
import { formatCurrency } from '@utils/formatters';
import api from '@services/api';
import nghiemThuService from '@services/nghiemThuService';
import FundInfoSection from '@pages/Staff/CanBo/XetDuyetPage/XetDuyetDetail/FundInfoSection/FundInfoSection';
import StudentInfoCard from '@pages/Staff/CanBo/XetDuyetPage/XetDuyetDetail/StudentInfoCard/StudentInfoCard';
import RequestInfoCard from '@pages/Staff/CanBo/XetDuyetPage/XetDuyetDetail/RequestInfoCard/RequestInfoCard';
import BankInfoCard from '@pages/Staff/CanBo/XetDuyetPage/XetDuyetDetail/BankInfoCard/BankInfoCard';
import NghiemThuTimeline from '@pages/Staff/CanBo/XetDuyetPage/XetDuyetDetail/NghiemThuSection/NghiemThuTimeline';
import NghiemThuFormModal from '@pages/Staff/CanBo/XetDuyetPage/XetDuyetDetail/NghiemThuSection/NghiemThuFormModal';
import ApprovalTimeline from './ApprovalTimeline/ApprovalTimeline';
import DisbursementPanel from './DisbursementPanel/DisbursementPanel';
import ProofUploadSection from './ProofUploadSection/index';
import styles from './GiaiNganDetailPage.module.scss';

const mapStatusToBadge = (trangThai) => {
  switch (trangThai) {
    case 'Cho duyet cap 3':
    case 'Cho giai ngan':
      return 'pending';
    case 'Da giai ngan':
      return 'approved';
    case 'Tu choi cap 3':
      return 'rejected';
    case 'Cho nghiem thu':
      return 'processing';
    case 'Da nghiem thu':
      return 'completed';
    case 'Nghiem thu khong dat':
      return 'rejected';
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
  return trimmed.split(/[;,|]/).map((s) => s.trim()).filter(Boolean);
};

const GiaiNganDetailPage = () => {
  const { request_id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fundDetail, setFundDetail] = useState(null);
  const [approvalTimeline, setApprovalTimeline] = useState([]);
  const [nghiemThuHistory, setNghiemThuHistory] = useState([]);
  const [showNghiemThuModal, setShowNghiemThuModal] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [giaoDich, setGiaoDich] = useState(null);

  const userRole = user?.roleId || user?.role_id || user?.vaiTro || user?.role?.id;
  const isKeToan = userRole === 2;

  const files = useMemo(() => parseFileList(data?.fileDinhKem), [data?.fileDinhKem]);

  // ── Fetch application detail ──
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api.get(`/applications/${request_id}`)
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
    return () => { mounted = false; };
  }, [request_id]);

  // ── Fetch approval timeline ──
  useEffect(() => {
    if (!request_id) return undefined;
    let mounted = true;
    api.get(`/pheduyet/timeline/yeucau/${request_id}`)
      .then((res) => {
        if (mounted) setApprovalTimeline(res?.data?.data || []);
      })
      .catch(() => {
        if (mounted) setApprovalTimeline([]);
      });
    return () => { mounted = false; };
  }, [request_id]);

  // ── Fetch fund detail ──
  useEffect(() => {
    if (!data?.quy?.id) return undefined;
    let mounted = true;
    api.get(`/funds/${data.quy.id}`)
      .then((res) => {
        if (mounted) setFundDetail(res.data?.fund || res.data?.data || null);
      })
      .catch(() => {
        if (mounted) setFundDetail(null);
      });
    return () => { mounted = false; };
  }, [data?.quy?.id]);

  // ── Fetch nghiem thu history ──
  useEffect(() => {
    if (!data?.canNghiemThu || !request_id) {
      setNghiemThuHistory([]);
      return;
    }
    let mounted = true;
    nghiemThuService.getInspectionHistory(request_id)
      .then((res) => {
        if (mounted) setNghiemThuHistory(res?.data?.lichSuNghiemThu || []);
      })
      .catch(() => {
        if (mounted) setNghiemThuHistory([]);
      });
    return () => { mounted = false; };
  }, [data?.canNghiemThu, request_id]);

  // ── Fetch giaodich (minh chứng giải ngân) ──
  const fetchGiaoDich = useCallback(() => {
    if (!request_id) return;
    api.get(`/transactions/by-application/${request_id}`)
      .then((res) => setGiaoDich(res.data?.data || null))
      .catch(() => setGiaoDich(null));
  }, [request_id]);

  useEffect(() => {
    fetchGiaoDich();
  }, [fetchGiaoDich]);

  // ── File preview ESC handler ──
  useEffect(() => {
    if (!previewFile) return undefined;
    const handler = (e) => { if (e.key === 'Escape') setPreviewFile(null); };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [previewFile]);

  const canShowNghiemThu = data?.canNghiemThu &&
    ['Da giai ngan', 'Cho nghiem thu', 'Da nghiem thu', 'Nghiem thu khong dat'].includes(data?.trangThai);
  const canCreateNghiemThu = data?.canNghiemThu &&
    ['Da giai ngan', 'Cho nghiem thu'].includes(data?.trangThai);
  const isNghiemThuDone = data?.trangThai === 'Da nghiem thu';
  const isNghiemThuFailed = data?.trangThai === 'Nghiem thu khong dat';

  // ── Handle disburse ──
  const handleDisburse = async (payload) => {
    try {
      await api.post(`/applications/${request_id}/disburse`, payload);
      toast.success('Giải ngân thành công');
      const res = await api.get(`/applications/${request_id}`);
      setData(res.data?.data || null);
      fetchGiaoDich();
    } catch (err) {
      const msg = err?.response?.data?.message || 'Lỗi giải ngân, vui lòng thử lại';
      toast.error(msg);
      throw err;
    }
  };

  // ── Handle reject ──
  const handleReject = async (payload) => {
    try {
      await api.put(`/applications/${request_id}/reject`, payload);
      toast.error('Đã từ chối hồ sơ');
      navigate('/ke-toan/giai-ngan');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Không thể từ chối hồ sơ';
      toast.error(msg);
      throw err;
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

  const fundBalance = Number(fundDetail?.soDu ?? data?.quy?.soDu ?? null);

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        {/* ── Breadcrumb ── */}
        <div className={styles.breadcrumb}>
          <Link to="/ke-toan/giai-ngan" className={styles.crumbLink}>
            Giải ngân hồ sơ
          </Link>
          <span className={styles.crumbSep}>/</span>
          <span>Chi tiết đơn #{request_id}</span>
        </div>

        {/* ── Header ── */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className={styles.title}>Chi tiết đơn #{request_id}</h1>
            <StatusBadge status={mapStatusToBadge(data.trangThai)} />
          </div>
          <Button
            variant="ghost"
            leftIcon={<HiOutlineArrowLeft />}
            onClick={() => navigate('/ke-toan/giai-ngan')}
          >
            Quay lại danh sách
          </Button>
        </header>

        {/* ── Status banners ── */}
        {data.trangThai === 'Da giai ngan' && (
          <div className={`${styles.banner} ${styles.bannerSuccess}`}>
            <HiOutlineCheckCircle className={styles.bannerIcon} />
            <span>Đơn này đã được giải ngân thành công.</span>
          </div>
        )}

        {data.trangThai === 'Tu choi cap 3' && (
          <div className={`${styles.banner} ${styles.bannerDanger}`}>
            <HiOutlineXCircle className={styles.bannerIcon} />
            <div>
              <div className={styles.bannerTitle}>Đơn đã bị từ chối ở cấp 3.</div>
              {data.lyDoTuChoi && (
                <div className={styles.bannerReason}>Lý do: {data.lyDoTuChoi}</div>
              )}
            </div>
          </div>
        )}

        {(data.trangThai === 'Cho duyet cap 3' || data.trangThai === 'Cho giai ngan') && (
          <div className={`${styles.banner} ${styles.bannerWarning}`}>
            <HiOutlineInformationCircle className={styles.bannerIcon} />
            <span>
              {data.trangThai === 'Cho giai ngan'
                ? 'Đơn chờ giải ngân (quỹ chưa đủ số dư). Vui lòng chờ hoặc từ chối.'
                : 'Đơn đã duyệt cấp 2, chờ kế toán xử lý giải ngân.'}
            </span>
          </div>
        )}

        {data.trangThai === 'Nghiem thu khong dat' && (
          <div className={`${styles.banner} ${styles.bannerDanger}`}>
            <HiOutlineExclamationTriangle className={styles.bannerIcon} />
            <span>Nghiệm thu không đạt — đơn không thể giải ngân thêm.</span>
          </div>
        )}

        {/* ── 2-column layout ── */}
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
            {/* ── Contract section: Tài trợ có thu hồi ── */}
            {data?.loaiHotro === 'Tai tro co thu hoi' && data?.dieukhoanthuhoi && (
              <section className={styles.contractSection}>
                <div className={`${styles.contractBanner} ${styles.contractBannerRecovery}`}>
                  <div className={styles.contractBannerOverlay} />
                  <div className={styles.contractBannerContent}>
                    <HiOutlineBanknotes size={22} className={styles.contractBannerIcon} />
                    <div className={styles.contractBannerText}>
                      <h3 className={styles.contractBannerTitle}>Điều khoản thu hồi</h3>
                      <span className={styles.contractBannerSub}>Đã phê duyệt bởi Admin</span>
                    </div>
                  </div>
                </div>
                <div className={styles.contractBody}>
                  <div className={styles.contractHighlight}>
                    <span className={styles.contractHighlightLabel}>Mức thu hồi</span>
                    <span className={styles.contractHighlightValue}>
                      {formatCurrency(data.dieukhoanthuhoi.mucthuhoi)}
                    </span>
                  </div>
                  <div className={styles.contractGrid3}>
                    <div className={styles.contractField}>
                      <span className={styles.contractFieldIcon}>📅</span>
                      <div>
                        <span className={styles.contractFieldLabel}>Thời hạn</span>
                        <span className={styles.contractFieldValue}>{data.dieukhoanthuhoi.thoihanhoantra_thang} tháng</span>
                      </div>
                    </div>
                    <div className={styles.contractField}>
                      <span className={styles.contractFieldIcon}>📄</span>
                      <div>
                        <span className={styles.contractFieldLabel}>Số QĐ</span>
                        <span className={styles.contractFieldValue}>{data.dieukhoanthuhoi.soquyetdinh_hopdong || '—'}</span>
                      </div>
                    </div>
                    {data.dieukhoanthuhoi.filehopdong && (
                      <div className={styles.contractField}>
                        <span className={styles.contractFieldIcon}>📎</span>
                        <div>
                          <span className={styles.contractFieldLabel}>Hợp đồng</span>
                          <a href={data.dieukhoanthuhoi.filehopdong} target="_blank" rel="noopener noreferrer" className={styles.contractFieldValueLink}>
                            Xem file
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* ── Contract section: Cho vay ── */}
            {data?.loaiHotro === 'Cho vay' && data?.hopdongvayvon && (
              <section className={styles.contractSection}>
                <div className={`${styles.contractBanner} ${styles.contractBannerLoan}`}>
                  <div className={styles.contractBannerOverlay} />
                  <div className={styles.contractBannerContent}>
                    <HiOutlineClipboardDocumentCheck size={22} className={styles.contractBannerIcon} />
                    <div className={styles.contractBannerText}>
                      <h3 className={styles.contractBannerTitle}>Hợp đồng vay vốn</h3>
                      <span className={styles.contractBannerSub}>Đang thực hiện</span>
                    </div>
                  </div>
                </div>
                <div className={styles.contractBody}>
                  <div className={styles.contractHighlight}>
                    <span className={styles.contractHighlightLabel}>Số tiền vay</span>
                    <span className={styles.contractHighlightValue}>
                      {formatCurrency(data.hopdongvayvon.sotienvon)}
                    </span>
                  </div>
                  <div className={styles.contractGrid3}>
                    <div className={styles.contractField}>
                      <span className={styles.contractFieldIcon}>💰</span>
                      <div>
                        <span className={styles.contractFieldLabel}>Lãi suất</span>
                        <span className={styles.contractFieldValue}>{data.hopdongvayvon.laisuatphantram}%/năm</span>
                      </div>
                    </div>
                    <div className={styles.contractField}>
                      <span className={styles.contractFieldIcon}>⏳</span>
                      <div>
                        <span className={styles.contractFieldLabel}>Kỳ hạn</span>
                        <span className={styles.contractFieldValue}>{data.hopdongvayvon.kyhandothang} tháng</span>
                      </div>
                    </div>
                    <div className={styles.contractField}>
                      <span className={styles.contractFieldIcon}>📝</span>
                      <div>
                        <span className={styles.contractFieldLabel}>Ngày ký</span>
                        <span className={styles.contractFieldValue}>{data.hopdongvayvon.ngaykyhopdong}</span>
                      </div>
                    </div>
                    <div className={styles.contractField}>
                      <span className={styles.contractFieldIcon}>🏁</span>
                      <div>
                        <span className={styles.contractFieldLabel}>Đáo hạn</span>
                        <span className={styles.contractFieldValue}>{data.hopdongvayvon.ngaydaohan}</span>
                      </div>
                    </div>
                    {data.hopdongvayvon.filehopdong && (
                      <div className={styles.contractField}>
                        <span className={styles.contractFieldIcon}>📎</span>
                        <div>
                          <span className={styles.contractFieldLabel}>Hợp đồng</span>
                          <a href={data.hopdongvayvon.filehopdong} target="_blank" rel="noopener noreferrer" className={styles.contractFieldValueLink}>
                            Xem file
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* ── Approval Timeline ── */}
            <ApprovalTimeline timeline={approvalTimeline} />

            {/* ── Disbursement Panel ── */}
            <DisbursementPanel
              data={data}
              fundBalance={fundBalance}
              isKeToan={isKeToan}
              onDisburse={handleDisburse}
              onReject={handleReject}
            />

            {/* ── Proof Upload (minh chứng chuyển khoản) ── */}
            {isKeToan && data?.trangThai === 'Da giai ngan' && (
              <ProofUploadSection giaoDich={giaoDich} onUploaded={fetchGiaoDich} />
            )}

            {/* ── Nghiem Thu Section ── */}
            {canShowNghiemThu && (
              <section className={styles.nghiemThuSection}>
                <div className={styles.nghiemThuHeader}>
                  <HiOutlineClipboardDocumentCheck size={18} className={styles.nghiemThuIcon} />
                  <h3 className={styles.nghiemThuTitle}>Nghiệm thu</h3>
                  {isNghiemThuDone && <span className={styles.nghiemThuBadge}>Đạt</span>}
                  {isNghiemThuFailed && (
                    <span className={`${styles.nghiemThuBadge} ${styles.nghiemThuBadgeFailed}`}>Không đạt</span>
                  )}
                </div>
                {nghiemThuHistory.length > 0 && (
                  <NghiemThuTimeline history={nghiemThuHistory} />
                )}
                {canCreateNghiemThu && (
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

        {/* ── Image preview modal ── */}
        {previewFile && (
          <div className={styles.modalOverlay} onClick={() => setPreviewFile(null)}>
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

        {/* ── NghiemThu modal ── */}
        {showNghiemThuModal && (
          <NghiemThuFormModal
            yeucauhotroId={parseInt(request_id)}
            existingHistory={nghiemThuHistory}
            onClose={() => setShowNghiemThuModal(false)}
            onSuccess={() => {
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

export default GiaiNganDetailPage;
