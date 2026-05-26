import { useState, useEffect, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  HiOutlineArrowLeft,
  HiOutlineInformationCircle,
  HiOutlineXCircle,
} from 'react-icons/hi2';
import Button from '@components/common/Button/Button';
import StatusBadge from '@components/common/StatusBadge/StatusBadge';
import api from '@services/api';
import StudentInfoCard from './StudentInfoCard/StudentInfoCard';
import RequestInfoCard from './RequestInfoCard/RequestInfoCard';
import BankInfoCard from './BankInfoCard/BankInfoCard';
import ReviewPanel from './ReviewPanel/ReviewPanel';
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

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [checklist, setChecklist] = useState(INITIAL_CHECKLIST);
  const [ghiChu, setGhiChu] = useState('');
  const [ghiChuError, setGhiChuError] = useState('');
  const [previewFile, setPreviewFile] = useState(null);

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

  const files = useMemo(
    () => parseFileList(data?.fileDinhKem),
    [data?.fileDinhKem],
  );

  const tickedCount = Object.values(checklist).filter(Boolean).length;
  const isReviewed =
    data?.trangThai === 'Dang xu ly' ||
    data?.trangThai === 'Tu choi' ||
    data?.trangThai === 'Da duyet' ||
    data?.trangThai === 'Hoan thanh';

  const isDisabled = isReviewed;

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
      navigate('/can-bo/xet-duyet');
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
    setSubmitting(true);
    try {
      await api.put(`/applications/${request_id}/staff-approve`, {
        ghiChu,
      });
      toast.success('Đã chuyển hồ sơ lên cấp duyệt tiếp theo');
      navigate('/can-bo/xet-duyet');
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
      </div>
    </div>
  );
};

export default XetDuyetDetail;
