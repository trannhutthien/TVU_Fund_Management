import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  HiOutlineArrowLeft,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineBanknotes,
  HiOutlineRocketLaunch,
  HiOutlineCalendar,
  HiOutlineCurrencyDollar,
  HiOutlineDocumentText,
  HiOutlineUser,
} from 'react-icons/hi2';
import { useAuth } from '@context/AuthContext';
import ProposalStatusBadge from '@components/proposal/ProposalStatusBadge';
import ProposalTimeline from '@components/proposal/ProposalTimeline';
import { getProposalById } from '@services/proposalService';
import { formatCurrency, formatDate } from '@utils/formatters';
import ApproveByCanBoModal from '../ApproveByCanBoModal/ApproveByCanBoModal';
import RejectByCanBoModal from '../RejectByCanBoModal/RejectByCanBoModal';
import ConfirmMoneyModal from '../ConfirmMoneyModal/ConfirmMoneyModal';
import CreateActivityModal from '../CreateActivityModal/CreateActivityModal';
import styles from './ProposalDetailPage.module.scss';

/**
 * ProposalDetailPage - Trang chi tiết đề xuất chương trình
 */
const ProposalDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const userRole = user?.vaiTro; // 1=Admin, 2=Kế toán, 3=Cán bộ

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [proposal, setProposal] = useState(null);

  // Modals
  const [approveModal, setApproveModal] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [confirmMoneyModal, setConfirmMoneyModal] = useState(null);
  const [createActivityModal, setCreateActivityModal] = useState(null);

  useEffect(() => {
    if (id) {
      fetchProposal();
    }
  }, [id]);

  const fetchProposal = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await getProposalById(id);
      if (res?.success) {
        setProposal(res.data);
      } else {
        throw new Error(res?.message || 'Không thể tải chi tiết đề xuất');
      }
    } catch (err) {
      console.error('Error fetching proposal:', err);
      setError(err.message || 'Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleModalSuccess = () => {
    // Close all modals
    setApproveModal(null);
    setRejectModal(null);
    setConfirmMoneyModal(null);
    setCreateActivityModal(null);
    
    // Refresh data
    fetchProposal();
  };

  const renderActionButtons = () => {
    if (!proposal) return null;

    const { de_xuat_id, trang_thai: trangThai } = proposal;

    // Cán bộ (role 3) + status "Cho duyet"
    if (userRole === 3 && trangThai === 'Cho duyet') {
      return (
        <div className={styles.actionButtons}>
          <button
            type="button"
            className={`${styles.actionBtn} ${styles.approve}`}
            onClick={() => setApproveModal(proposal)}
          >
            <HiOutlineCheckCircle />
            <span>Duyệt đề xuất</span>
          </button>
          <button
            type="button"
            className={`${styles.actionBtn} ${styles.reject}`}
            onClick={() => setRejectModal(proposal)}
          >
            <HiOutlineXCircle />
            <span>Từ chối</span>
          </button>
        </div>
      );
    }

    // Kế toán (role 2) + status "Can bo da duyet"
    if (userRole === 2 && trangThai === 'Can bo da duyet') {
      return (
        <div className={styles.actionButtons}>
          <button
            type="button"
            className={`${styles.actionBtn} ${styles.confirm}`}
            onClick={() => setConfirmMoneyModal(proposal)}
          >
            <HiOutlineBanknotes />
            <span>Xác nhận đã nhận tiền</span>
          </button>
        </div>
      );
    }

    // Admin (role 1) + status "Da nhan tien"
    if (userRole === 1 && trangThai === 'Da nhan tien') {
      return (
        <div className={styles.actionButtons}>
          <button
            type="button"
            className={`${styles.actionBtn} ${styles.create}`}
            onClick={() => setCreateActivityModal(proposal)}
          >
            <HiOutlineRocketLaunch />
            <span>Tạo hoạt động/chương trình</span>
          </button>
        </div>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <div className={styles.errorContainer}>
          <HiOutlineXCircle className={styles.errorIcon} />
          <p className={styles.errorText}>{error}</p>
          <button
            type="button"
            className={styles.retryBtn}
            onClick={fetchProposal}
          >
            Thử lại
          </button>
          <button
            type="button"
            className={styles.backBtn}
            onClick={handleBack}
          >
            <HiOutlineArrowLeft />
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className={styles.page}>
        <div className={styles.errorContainer}>
          <p>Không tìm thấy đề xuất</p>
          <button
            type="button"
            className={styles.backBtn}
            onClick={handleBack}
          >
            <HiOutlineArrowLeft />
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <button
            type="button"
            className={styles.backButton}
            onClick={handleBack}
          >
            <HiOutlineArrowLeft />
            <span>Quay lại</span>
          </button>
          <div className={styles.headerInfo}>
            <h1 className={styles.title}>Chi tiết đề xuất chương trình</h1>
            <p className={styles.subtitle}>Mã đề xuất: #{proposal.de_xuat_id}</p>
          </div>
          <ProposalStatusBadge status={proposal.trang_thai} size="lg" />
        </div>

        {/* Content Grid */}
        <div className={styles.content}>
          {/* Left Column */}
          <div className={styles.leftColumn}>
            {/* Thông tin chung */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>
                <HiOutlineDocumentText />
                <span>Thông tin chung</span>
              </h2>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Tên chương trình</span>
                  <span className={styles.infoValue}>
                    {proposal.ten_chuong_trinh}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Quỹ thành phần</span>
                  <span className={styles.infoValue}>
                    {proposal.ten_quy_thanh_phan || '—'}
                  </span>
                </div>
                {proposal.mo_ta && (
                  <div className={`${styles.infoItem} ${styles.fullWidth}`}>
                    <span className={styles.infoLabel}>Mô tả</span>
                    <span className={styles.infoValue}>{proposal.mo_ta}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Thông tin nhà tài trợ */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>
                <HiOutlineUser />
                <span>Thông tin nhà tài trợ</span>
              </h2>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Tên nhà tài trợ</span>
                  <span className={styles.infoValue}>
                    {proposal.ten_nha_tai_tro || '—'}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Loại nhà tài trợ</span>
                  <span className={styles.infoValue}>
                    {proposal.loai_nha_tai_tro || '—'}
                  </span>
                </div>
                {proposal.nha_tai_tro_email && (
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Email</span>
                    <span className={styles.infoValue}>
                      {proposal.nha_tai_tro_email}
                    </span>
                  </div>
                )}
                {proposal.nha_tai_tro_so_dien_thoai && (
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Số điện thoại</span>
                    <span className={styles.infoValue}>
                      {proposal.nha_tai_tro_so_dien_thoai}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Thông tin tài chính */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>
                <HiOutlineCurrencyDollar />
                <span>Thông tin tài chính</span>
              </h2>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Số lượng suất</span>
                  <span className={styles.infoValue}>
                    {proposal.so_luong_suat} suất
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Số tiền mỗi suất</span>
                  <span className={styles.infoValue}>
                    {formatCurrency(proposal.so_tien_moi_suat)}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Tổng số tiền</span>
                  <span className={`${styles.infoValue} ${styles.highlight}`}>
                    {formatCurrency(proposal.tong_so_tien)}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Loại hỗ trợ</span>
                  <span className={styles.infoValue}>
                    {proposal.loai_ho_tro || '—'}
                  </span>
                </div>
                {proposal.so_tien_thuc_te && (
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>
                      Số tiền thực tế đã nhận
                    </span>
                    <span className={`${styles.infoValue} ${styles.success}`}>
                      {formatCurrency(proposal.so_tien_thuc_te)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Thời gian */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>
                <HiOutlineCalendar />
                <span>Thời gian</span>
              </h2>
              <div className={styles.infoGrid}>
                {proposal.ngay_bat_dau && (
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Ngày bắt đầu</span>
                    <span className={styles.infoValue}>
                      {formatDate(proposal.ngay_bat_dau)}
                    </span>
                  </div>
                )}
                {proposal.ngay_ket_thuc && (
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Ngày kết thúc</span>
                    <span className={styles.infoValue}>
                      {formatDate(proposal.ngay_ket_thuc)}
                    </span>
                  </div>
                )}
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Ngày tạo đề xuất</span>
                  <span className={styles.infoValue}>
                    {formatDate(proposal.ngay_tao)}
                  </span>
                </div>
                {proposal.ngay_duyet && (
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Ngày duyệt</span>
                    <span className={styles.infoValue}>
                      {formatDate(proposal.ngay_duyet)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Lý do từ chối (nếu có) */}
            {proposal.trang_thai === 'Tu choi' && proposal.ly_do_tu_choi && (
              <div className={`${styles.card} ${styles.rejectCard}`}>
                <h2 className={styles.cardTitle}>
                  <HiOutlineXCircle />
                  <span>Lý do từ chối</span>
                </h2>
                <p className={styles.rejectReason}>{proposal.ly_do_tu_choi}</p>
              </div>
            )}

            {/* Action Buttons */}
            {renderActionButtons()}
          </div>

          {/* Right Column - Timeline */}
          <div className={styles.rightColumn}>
            <div className={styles.card}>
              <ProposalTimeline
                proposalId={proposal.de_xuat_id}
                onRefresh={fetchProposal}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {approveModal && (
        <ApproveByCanBoModal
          proposal={approveModal}
          onClose={() => setApproveModal(null)}
          onSuccess={handleModalSuccess}
        />
      )}

      {rejectModal && (
        <RejectByCanBoModal
          proposal={rejectModal}
          onClose={() => setRejectModal(null)}
          onSuccess={handleModalSuccess}
        />
      )}

      {confirmMoneyModal && (
        <ConfirmMoneyModal
          proposal={confirmMoneyModal}
          onClose={() => setConfirmMoneyModal(null)}
          onSuccess={handleModalSuccess}
        />
      )}

      {createActivityModal && (
        <CreateActivityModal
          proposal={createActivityModal}
          onClose={() => setCreateActivityModal(null)}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
};

export default ProposalDetailPage;
