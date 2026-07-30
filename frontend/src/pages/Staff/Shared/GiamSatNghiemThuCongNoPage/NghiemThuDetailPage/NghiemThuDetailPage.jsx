import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  HiOutlineArrowLeft,
  HiOutlineClipboardDocumentCheck,
  HiOutlinePlus,
  HiOutlineExclamationTriangle,
} from 'react-icons/hi2';
import { useAuth } from '@context/AuthContext';
import nghiemThuService from '@services/nghiemThuService';
import Button from '@components/common/Button/Button';
import NghiemThuFormModal from '@pages/Staff/CanBo/XetDuyetPage/XetDuyetDetail/NghiemThuSection/NghiemThuFormModal';
import ApplicationInfoCard from './sections/ApplicationInfoCard';
import InspectionSummary from './sections/InspectionSummary';
import InspectionTimeline from './sections/InspectionTimeline';
import styles from './NghiemThuDetailPage.module.scss';

const NghiemThuDetailPage = () => {
  const { yeucauhotroId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [approveItem, setApproveItem] = useState(null);
  const [editItem, setEditItem] = useState(null);

  const userRole = user?.roleId || user?.role_id || user?.vaiTro || user?.role?.id;
  const userId = user?.id || user?.nguoidungId;

  const fetchData = useCallback(async () => {
    if (!yeucauhotroId) return;
    setLoading(true);
    try {
      const res = await nghiemThuService.getDetail(yeucauhotroId);
      setData(res.data || null);
    } catch {
      toast.error('Không thể tải dữ liệu nghiệm thu');
    } finally {
      setLoading(false);
    }
  }, [yeucauhotroId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleBack = () => {
    navigate('/giam-sat');
  };

  const canCreate = userRole === 1 || userRole === 3;
  const isAdmin = userRole === 1;

  // Tính số đợt nghiệm thu chờ duyệt (tất cả loại, ketqua = 'Cho danh gia')
  const pendingItems = data?.lichSuNghiemThu?.filter(
    (item) => item.ketqua === 'Cho danh gia'
  ) || [];
  const pendingCount = pendingItems.length;

  // ── Handlers cho InspectionTimeline ──
  const handleApprove = (item) => {
    setApproveItem(item);
  };

  const handleEdit = (item) => {
    setEditItem(item);
  };

  const handleDelete = async (item) => {
    try {
      await nghiemThuService.deleteInspection(item.nghiemthuId);
      toast.success(`Đã xóa nghiệm thu lần ${item.lanthu}`);
      fetchData();
    } catch (err) {
      const msg = err?.response?.data?.message || 'Không thể xóa nghiệm thu';
      toast.error(msg);
    }
  };

  // ── Modal close handlers ──
  const handleCreateClose = () => setShowCreateModal(false);
  const handleApproveClose = () => setApproveItem(null);
  const handleEditClose = () => setEditItem(null);

  const handleModalSuccess = () => {
    fetchData();
  };

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        {/* Header */}
        <header className={styles.header}>
          <button type="button" className={styles.backBtn} onClick={handleBack}>
            <HiOutlineArrowLeft size={18} />
            <span>Quay lại</span>
          </button>
          <div className={styles.headerTitleRow}>
            <div className={styles.headerTitle}>
              <HiOutlineClipboardDocumentCheck size={22} className={styles.headerIcon} />
              <div>
                <h1 className={styles.title}>Nghiệm thu đơn #{yeucauhotroId}</h1>
                <span className={styles.subtitle}>Quản lý và theo dõi nghiệm thu chi tiết</span>
              </div>
            </div>
            {!loading && data && canCreate && data.tongQuan?.coTheTaoMoi && (
              <Button
                variant="primary"
                leftIcon={<HiOutlinePlus size={16} />}
                onClick={() => setShowCreateModal(true)}
                className={styles.createBtn}
              >
                Tạo đợt nghiệm thu
              </Button>
            )}
          </div>
        </header>

        {/* Loading */}
        {loading && (
          <div className={styles.loadingBox}>Đang tải dữ liệu...</div>
        )}

        {/* Content */}
        {!loading && data && (
          <>
            {/* Banner chờ duyệt — chỉ hiện cho Admin */}
            {isAdmin && pendingCount > 0 && (
              <div className={styles.pendingBanner}>
                <div className={styles.pendingBannerIcon}>
                  <HiOutlineExclamationTriangle size={22} />
                </div>
                <div className={styles.pendingBannerContent}>
                  <div className={styles.pendingBannerTitle}>
                    Có {pendingCount} đợt nghiệm thu cuối cùng chờ duyệt
                  </div>
                  <div className={styles.pendingBannerDesc}>
                    {pendingItems.map((item) => `Lần ${item.lanthu}`).join(', ')}
                  </div>
                </div>
                <Button
                  variant="warning"
                  onClick={() => handleApprove(pendingItems[0])}
                  className={styles.pendingBannerBtn}
                >
                  Duyệt ngay
                </Button>
              </div>
            )}

            {/* Application Info */}
            <ApplicationInfoCard data={data} />

            {/* Summary */}
            <InspectionSummary tongQuan={data.tongQuan} />

            {/* Timeline */}
            <InspectionTimeline
              history={data.lichSuNghiemThu}
              userRole={userRole}
              userId={userId}
              onApprove={handleApprove}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </>
        )}

        {/* Empty state */}
        {!loading && !data && (
          <div className={styles.emptyBox}>
            <p>Không tìm thấy đơn xin hỗ trợ.</p>
          </div>
        )}
      </div>

      {/* ── Modal: Tạo mới ── */}
      {showCreateModal && data && (
        <NghiemThuFormModal
          yeucauhotroId={parseInt(yeucauhotroId)}
          mode="create"
          onClose={handleCreateClose}
          onSuccess={handleModalSuccess}
        />
      )}

      {/* ── Modal: Duyệt (Admin) ── */}
      {approveItem && (
        <NghiemThuFormModal
          yeucauhotroId={parseInt(yeucauhotroId)}
          mode="approve"
          inspectionData={approveItem}
          onClose={handleApproveClose}
          onSuccess={handleModalSuccess}
        />
      )}

      {/* ── Modal: Sửa (chưa duyệt) ── */}
      {editItem && (
        <NghiemThuFormModal
          yeucauhotroId={parseInt(yeucauhotroId)}
          mode="edit"
          inspectionData={editItem}
          onClose={handleEditClose}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
};

export default NghiemThuDetailPage;
