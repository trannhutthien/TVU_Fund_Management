import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ReloadOutlined, LoadingOutlined, FileTextOutlined } from '@ant-design/icons';
import { HiChartBar, HiBanknotes, HiArrowUturnLeft } from 'react-icons/hi2';
import { useAuth } from '@hooks/useAuth';
import PublicHeader from '@components/layout/PublicHeader/PublicHeader';
import lichTraNoService from '@services/lichTraNoService';
import thuHoiService from '@services/thuHoiService';
import { systemSettingsService } from '@services/systemSettingsService';
import TongQuanCard from './components/TongQuanCard';
import HopDongItem from './components/HopDongItem';
import NopMinhChungModal from './components/NopMinhChungModal';
import styles from './index.module.scss';

const TABS = [
  { key: 'tongquan', label: 'Tổng quan', icon: HiChartBar, count: 'tất cả' },
  { key: 'vayvon', label: 'Khoản vay', icon: HiBanknotes, count: 'cho vay' },
  { key: 'thuhoi', label: 'Thu hồi nợ', icon: HiArrowUturnLeft, count: 'thu hồi' },
];

const NghiaVuHoanTraPage = () => {
  useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedKy, setSelectedKy] = useState(null);
  const [bankInfo, setBankInfo] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('tongquan');

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

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    systemSettingsService.getPublicSettings()
      .then((settings) => setBankInfo(settings.tai_khoan_nhan_tai_tro || null))
      .catch(() => {});
  }, []);

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

  const handleSubmitThuHoi = async (dieukhoanthuhoiId, formData) => {
    try {
      setSubmitting(true);
      await thuHoiService.submitProof(dieukhoanthuhoiId, formData);
      await fetchData();
    } catch (err) {
      console.error('Error submitting thu hoi:', err);
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  const handleHuyThuHoi = async (dieukhoanthuhoiId, lanNopId) => {
    try {
      setSubmitting(true);
      await thuHoiService.cancelPayment(lanNopId);
      await fetchData();
    } catch (err) {
      console.error('Error cancelling thu hoi:', err);
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenSubmit = (ky) => {
    setSelectedKy(ky);
    setModalOpen(true);
  };

  const { tongQuan, danhSach = [] } = data || {};
  const isEmpty = danhSach.length === 0;
  const allPaid = tongQuan && tongQuan.conLai === 0 && danhSach.length > 0;

  const filteredDanhSach = useMemo(() => {
    if (activeTab === 'vayvon') return danhSach.filter(d => d.loaihotro === 'Cho vay' && d.trangThaiDon !== 'Dang thu hoi no');
    if (activeTab === 'thuhoi') return danhSach.filter(d => d.loaihotro !== 'Cho vay' || d.trangThaiDon === 'Dang thu hoi no');
    return danhSach;
  }, [danhSach, activeTab]);

  const isTabEmpty = filteredDanhSach.length === 0;

  if (loading && !data) {
    return (
      <div className={styles.page}>
        <PublicHeader />
        <section className={styles.heroSection}>
          <div className={styles.heroContent}>
            <div className={styles.heroIconWrap}>
              <LoadingOutlined className={styles.heroIconSpin} />
            </div>
            <h1 className={styles.heroTitle}>Nghĩa vụ hoàn trả</h1>
            <p className={styles.heroSubtitle}>Đang tải dữ liệu...</p>
          </div>
        </section>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <PublicHeader />
        <section className={styles.heroSection}>
          <div className={styles.heroContent}>
            <div className={styles.heroIconWrap}>
              <FileTextOutlined className={styles.heroIconError} />
            </div>
            <h1 className={styles.heroTitle}>Nghĩa vụ hoàn trả</h1>
            <p className={styles.heroSubtitle}>{error}</p>
            <button className={styles.heroRetryBtn} onClick={fetchData}>
              <ReloadOutlined /> Thử lại
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <PublicHeader />

      {/* Hero section */}
      <section className={styles.heroSection}>
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <div className={styles.heroIconWrap}>
            <HiArrowUturnLeft className={styles.heroIcon} />
          </div>
          <h1 className={styles.heroTitle}>Nghĩa vụ hoàn trả</h1>
          <p className={styles.heroSubtitle}>Theo dõi và quản lý khoản vay, khoản thu hồi nợ</p>
        </div>
      </section>

      {/* Sticky tab bar */}
      <div id="tab-section" className={styles.tabBarWrapper}>
        <div className={styles.tabBarInner}>
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                className={`${styles.tabBtn} ${activeTab === tab.key ? styles.tabBtnActive : ''}`}
                onClick={() => setActiveTab(tab.key)}
              >
                <Icon size={18} />
                <span className={styles.tabLabel}>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <main className={styles.content}>
        <div className={styles.contentInner}>
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

          {/* All paid banner — chỉ ở tab tổng quan */}
          {!isEmpty && activeTab === 'tongquan' && allPaid && (
            <div className={styles.successBanner}>
              <span className={styles.successIcon}>✓</span>
              <div>
                <strong>Bạn đã hoàn tất tất cả nghĩa vụ!</strong>
                <p>Tất cả các khoản đã được xác nhận thanh toán.</p>
              </div>
            </div>
          )}

          {/* Summary — chỉ ở tab tổng quan */}
          {activeTab === 'tongquan' && tongQuan && <TongQuanCard tongQuan={tongQuan} />}

          {/* Tab rỗng */}
          {!isEmpty && isTabEmpty && (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <FileTextOutlined />
              </div>
              <h2>Không có khoản nào</h2>
              <p>
                {activeTab === 'vayvon' && 'Bạn chưa có khoản vay nào.'}
                {activeTab === 'thuhoi' && 'Bạn chưa có khoản thu hồi nợ nào.'}
              </p>
            </div>
          )}

          {/* Danh sách đơn */}
          <div className={styles.danhSach}>
            {filteredDanhSach.map((don) => (
              <HopDongItem
                key={don.yeucauhotroId}
                don={don}
                onSubmitProof={handleOpenSubmit}
                onRevokeProof={handleRevokeProof}
                onSubmitThuHoi={handleSubmitThuHoi}
                onHuyThuHoi={handleHuyThuHoi}
                submitting={submitting}
              />
            ))}
          </div>
        </div>
      </main>

      {/* Modal nộp minh chứng */}
      <NopMinhChungModal
        isOpen={modalOpen}
        kyData={selectedKy}
        bankInfo={bankInfo}
        onSubmit={handleSubmitProof}
        onClose={() => { setModalOpen(false); setSelectedKy(null); }}
        submitting={submitting}
      />
    </div>
  );
};

export default NghiaVuHoanTraPage;
