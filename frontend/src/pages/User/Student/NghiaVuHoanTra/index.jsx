import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined, ReloadOutlined, LoadingOutlined, FileTextOutlined } from '@ant-design/icons';
import { useAuth } from '@hooks/useAuth';
import { formatCurrency } from '@utils/formatters';
import lichTraNoService from '@services/lichTraNoService';
import TongQuanCard from './components/TongQuanCard';
import HopDongItem from './components/HopDongItem';
import NopMinhChungModal from './components/NopMinhChungModal';
import styles from './index.module.scss';

const NghiaVuHoanTraPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedKy, setSelectedKy] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await lichTraNoService.getMyRepayments();
      setData(res.data?.data || res.data);
    } catch (err) {
      console.error('Error fetching repayments:', err);
      setError('Không thể tải dữ liệu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmitProof = async (lichtranoId, formData) => {
    try {
      setSubmitting(true);
      await lichTraNoService.submitProof(lichtranoId, formData);
      setModalOpen(false);
      setSelectedKy(null);
      await fetchData();
    } catch (err) {
      console.error('Error submitting proof:', err);
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevokeProof = async (lichtranoId) => {
    try {
      await lichTraNoService.revokeProof(lichtranoId);
      await fetchData();
    } catch (err) {
      console.error('Error revoking proof:', err);
      throw err;
    }
  };

  const handleOpenSubmit = (ky) => {
    setSelectedKy(ky);
    setModalOpen(true);
  };

  if (loading && !data) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingWrap}>
          <LoadingOutlined style={{ fontSize: 32, color: '#3b6ff5' }} />
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <div className={styles.errorWrap}>
          <FileTextOutlined style={{ fontSize: 40, color: '#ef4444' }} />
          <p>{error}</p>
          <button className={styles.retryBtn} onClick={fetchData}>
            <ReloadOutlined /> Thử lại
          </button>
        </div>
      </div>
    );
  }

  const { tongQuan, danhSach = [] } = data || {};
  const isEmpty = danhSach.length === 0;
  const allPaid = tongQuan && tongQuan.conLai === 0 && danhSach.length > 0;

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        {/* Header */}
        <div className={styles.header}>
          <button className={styles.backBtn} onClick={() => navigate('/dashboard')}>
            <ArrowLeftOutlined /> Quay lại
          </button>
          <h1 className={styles.title}>Nghĩa vụ hoàn trả</h1>
        </div>

        {/* Empty state */}
        {isEmpty && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <FileTextOutlined />
            </div>
            <h2>Chưa có nghĩa vụ hoàn trả</h2>
            <p>Bạn hiện chưa có khoản vay nào cần hoàn trả.</p>
          </div>
        )}

        {/* All paid banner */}
        {allPaid && (
          <div className={styles.successBanner}>
            <span className={styles.successIcon}>✓</span>
            <div>
              <strong>Bạn đã hoàn tất tất cả nghĩa vụ!</strong>
              <p>Tất cả các khoản đã được xác nhận thanh toán.</p>
            </div>
          </div>
        )}

        {/* Summary */}
        {tongQuan && <TongQuanCard tongQuan={tongQuan} />}

        {/* Danh sách đơn */}
        <div className={styles.danhSach}>
          {danhSach.map((don) => (
            <HopDongItem
              key={don.yeucauhotroId}
              don={don}
              onSubmitProof={handleOpenSubmit}
              onRevokeProof={handleRevokeProof}
            />
          ))}
        </div>
      </div>

      {/* Modal nộp minh chứng */}
      <NopMinhChungModal
        isOpen={modalOpen}
        kyData={selectedKy}
        onSubmit={handleSubmitProof}
        onClose={() => { setModalOpen(false); setSelectedKy(null); }}
        submitting={submitting}
      />
    </div>
  );
};

export default NghiaVuHoanTraPage;
