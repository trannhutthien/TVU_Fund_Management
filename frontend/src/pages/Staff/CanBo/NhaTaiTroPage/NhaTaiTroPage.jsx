import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  HiOutlinePlusCircle,
  HiOutlineUserPlus,
  HiOutlineMagnifyingGlass,
  HiOutlineXMark,
  HiOutlineHandRaised,
  HiOutlineBanknotes,
  HiOutlineCalendarDays,
  HiOutlineClock,
  HiOutlineEye,
  HiOutlineEnvelope,
  HiOutlinePhone,
  HiOutlineMapPin,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineBuildingOffice2,
  HiOutlineUser,
  HiOutlineCamera,
} from 'react-icons/hi2';
import { toast } from 'react-toastify';
import Button from '@components/common/Button/Button';
import Input from '@components/common/Input/Input';
import { StatCard } from '@components/common/Card';
import { getStaffDonors, getDonorStats, updateDonorLogo } from '@services/donorService';
import { uploadService } from '@services/uploadService';
import { formatCurrency, getInitial } from '@utils/formatters';
import NhaTaiTroDetailDrawer from './NhaTaiTroDetailDrawer/NhaTaiTroDetailDrawer';
import KhoanTaiTroModal from './KhoanTaiTroModal/KhoanTaiTroModal';
import CreateDonorModal from './CreateDonorModal/CreateDonorModal';
import styles from './NhaTaiTroPage.module.scss';

const PAGE_SIZE = 12;

const LOAI_OPTIONS = [
  { value: '', label: '-- Tất cả loại --' },
  { value: 'Ca nhan', label: 'Cá nhân' },
  { value: 'To chuc', label: 'Tổ chức' },
  { value: 'Doanh nghiep', label: 'Doanh nghiệp' },
  { value: 'Doi tac', label: 'Đối tác' },
];

const SORT_OPTIONS = [
  { value: 'tong_tai_tro_desc', label: 'Đóng góp nhiều nhất' },
  { value: 'ngay_tao_desc', label: 'Mới tham gia nhất' },
  { value: 'gan_nhat_desc', label: 'Tài trợ gần nhất' },
  { value: 'ten_asc', label: 'Tên A → Z' },
];

const LOAI_LABEL = {
  'Ca nhan': 'Cá nhân',
  'To chuc': 'Tổ chức',
  'Doanh nghiep': 'Doanh nghiệp',
  'Doi tac': 'Đối tác',
};

const formatDate = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('vi-VN');
};

const NhaTaiTroPage = () => {
  const [sponsors, setSponsors] = useState([]);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('nha-tai-tro');
  const [filters, setFilters] = useState({
    keyword: '',
    loai: '',
    sort_by: 'tong_tai_tro_desc',
  });
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [selectedSponsor, setSelectedSponsor] = useState(null);
  const [showKhoanModal, setShowKhoanModal] = useState(false);
  const [preselectedSponsor, setPreselectedSponsor] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const logoInputRef = useRef(null);
  const [uploadingLogoId, setUploadingLogoId] = useState(null);
  const uploadingLogoRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedKeyword(filters.keyword), 500);
    return () => clearTimeout(t);
  }, [filters.keyword]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const effectiveLoai = activeTab === 'doi-tac' ? 'Doi tac' : filters.loai;
      const excludeLoai = activeTab === 'nha-tai-tro' && !filters.loai ? 'Doi tac' : '';
      const res = await getStaffDonors({
        keyword: debouncedKeyword,
        loai: effectiveLoai,
        exclude_loai: excludeLoai,
        sort_by: filters.sort_by,
        page,
        page_size: PAGE_SIZE,
      });
      setSponsors(res?.data || []);
      setTotal(res?.pagination?.total || 0);
    } catch (e) {
      console.error('Lỗi tải danh sách nhà tài trợ:', e);
      setSponsors([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [debouncedKeyword, filters.loai, filters.sort_by, page, activeTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    getDonorStats()
      .then((res) => setStats(res?.data || null))
      .catch(() => setStats(null));
  }, []);

  useEffect(() => {
    setPage(1);
  }, [debouncedKeyword, filters.loai, filters.sort_by]);

  const hasFilter =
    filters.keyword || filters.loai || filters.sort_by !== 'tong_tai_tro_desc';

  const clearFilters = () => {
    setFilters({ keyword: '', loai: '', sort_by: 'tong_tai_tro_desc' });
  };

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / PAGE_SIZE)),
    [total],
  );

  const STAT_CARDS = [
    {
      label: 'Tổng nhà tài trợ',
      value: stats?.tongNhaTaiTro ?? 0,
      icon: HiOutlineHandRaised,
      iconBgColor: 'blue',
    },
    {
      label: 'Tổng đã đóng góp',
      value: formatCurrency(stats?.tongDaDongGop),
      icon: HiOutlineBanknotes,
      iconBgColor: 'green',
    },
    {
      label: 'Tháng này',
      value: formatCurrency(stats?.thangNay),
      icon: HiOutlineCalendarDays,
      iconBgColor: 'yellow',
    },
    {
      label: 'Khoản chờ duyệt',
      value: stats?.choDuyet ?? 0,
      icon: HiOutlineClock,
      iconBgColor: 'red',
      urgent: true,
    },
  ];

  const handleOpenCreateModal = (sponsor = null) => {
    setPreselectedSponsor(sponsor);
    setShowKhoanModal(true);
  };

  const handleCloseModal = () => {
    setShowKhoanModal(false);
    setPreselectedSponsor(null);
  };

  const handleSuccessSave = () => {
    fetchData();
    getDonorStats()
      .then((res) => setStats(res?.data || null))
      .catch(() => {});
  };

  const handlePartnerLogoUpload = async (e, sponsorItem) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('File vượt quá 5MB'); return; }
    if (!file.type.startsWith('image/')) { toast.error('Chỉ chấp nhận file ảnh'); return; }

    setUploadingLogoId(sponsorItem.nha_tai_tro_id);
    try {
      const upRes = await uploadService.uploadDonorLogo(file);
      const logoPath = upRes?.data?.filePath;
      if (!logoPath) { toast.error('Upload thất bại'); return; }

      await updateDonorLogo(sponsorItem.nha_tai_tro_id, logoPath);
      toast.success('Cập nhật logo thành công');
      fetchData();
    } catch (err) {
      console.error('Lỗi upload logo:', err);
      toast.error('Lỗi khi cập nhật logo');
    } finally {
      setUploadingLogoId(null);
      if (logoInputRef.current) logoInputRef.current.value = '';
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        {/* ── Header ───────────────────────────── */}
        <div className={styles.breadcrumb}>
          <span>Trang chủ</span>
          <span className={styles.breadcrumbSep}>/</span>
          <span className={styles.breadcrumbActive}>Nhà tài trợ</span>
        </div>

        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Quản lý Nhà tài trợ</h1>
            <p className={styles.subtitle}>
              Theo dõi và ghi nhận đóng góp từ các nhà tài trợ
            </p>
          </div>
          <Button
            variant="primary"
            leftIcon={<HiOutlinePlusCircle />}
            onClick={() => handleOpenCreateModal(null)}
          >
            Tạo khoản tài trợ
          </Button>
          <Button
            variant="secondary"
            leftIcon={<HiOutlineUserPlus />}
            onClick={() => setShowCreateModal(true)}
            className={styles.headerBtn}
          >
            Tạo đối tác
          </Button>
        </header>

        {/* ── Stat cards ───────────────────────── */}
        <div className={styles.statsRow}>
          {STAT_CARDS.map((card) => {
            const Icon = card.icon;
            const isUrgent = card.urgent && Number(card.value) > 0;
            return (
              <StatCard
                key={card.label}
                title={card.label}
                value={card.value}
                icon={<Icon size={20} />}
                iconBgColor={card.iconBgColor}
                className={isUrgent ? styles.statUrgent : ''}
              />
            );
          })}
        </div>

        {/* ── Tab Navigation ───────────────────── */}
        <div className={styles.tabContainer}>
          <div className={styles.tabNavigation}>
            <button
              className={`${styles.navTab} ${activeTab === 'nha-tai-tro' ? styles.navTabActive : ''}`}
              onClick={() => { setActiveTab('nha-tai-tro'); setPage(1); }}
            >
              <HiOutlineUser className={styles.tabIcon} />
              Nhà tài trợ
            </button>
            <button
              className={`${styles.navTab} ${activeTab === 'doi-tac' ? styles.navTabActive : ''}`}
              onClick={() => { setActiveTab('doi-tac'); setPage(1); }}
            >
              <HiOutlineBuildingOffice2 className={styles.tabIcon} />
              Đối tác
            </button>
          </div>
        </div>

        {/* ── Filter bar ───────────────────────── */}
        <div className={styles.filterBar}>
          <div className={styles.searchWrap}>
            <Input
              placeholder="Tìm tên tổ chức, email, số điện thoại..."
              value={filters.keyword}
              onChange={(e) =>
                setFilters((f) => ({ ...f, keyword: e.target.value }))
              }
              leftIcon={<HiOutlineMagnifyingGlass />}
            />
          </div>

          {activeTab !== 'doi-tac' && (
            <select
              className={styles.select}
              value={filters.loai}
              onChange={(e) =>
                setFilters((f) => ({ ...f, loai: e.target.value }))
              }
            >
              {LOAI_OPTIONS.filter((o) => o.value !== 'Doi tac').map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          )}

          <select
            className={styles.select}
            value={filters.sort_by}
            onChange={(e) =>
              setFilters((f) => ({ ...f, sort_by: e.target.value }))
            }
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          {hasFilter && (
            <Button
              variant="ghost"
              leftIcon={<HiOutlineXMark />}
              onClick={clearFilters}
            >
              Xóa bộ lọc
            </Button>
          )}
        </div>

        {/* ── Grid danh sách ───────────────────── */}
        {loading ? (
          <div className={styles.grid}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={styles.skeletonCard} />
            ))}
          </div>
        ) : sponsors.length === 0 ? (
          <div className={styles.empty}>
            <HiOutlineHandRaised className={styles.emptyIcon} />
            <p>Chưa có {activeTab === 'doi-tac' ? 'đối tác' : 'nhà tài trợ'} nào</p>
          </div>
        ) : activeTab === 'doi-tac' ? (
          <div className={styles.partnersGrid}>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => {
                if (uploadingLogoRef.current) handlePartnerLogoUpload(e, uploadingLogoRef.current);
              }}
            />
            {sponsors.map((sp) => (
              <div key={sp.nha_tai_tro_id} className={styles.partnerCard} onClick={() => setSelectedSponsor(sp)}>
                <div className={styles.partnerLogoWrap}>
                  {sp.logo || sp.avatar ? (
                    <img src={sp.logo || sp.avatar} alt={sp.ten_nha_tai_tro} className={styles.partnerLogoImg} />
                  ) : (
                    <div className={styles.partnerLogoPlaceholder}>
                      {getInitial(sp.ten_nha_tai_tro)}
                    </div>
                  )}
                  <button
                    type="button"
                    className={styles.partnerLogoUploadBtn}
                    title="Cập nhật logo"
                    onClick={(e) => {
                      e.stopPropagation();
                      uploadingLogoRef.current = sp;
                      logoInputRef.current?.click();
                    }}
                    disabled={uploadingLogoId === sp.nha_tai_tro_id}
                  >
                    <HiOutlineCamera size={14} />
                  </button>
                </div>
                <h3 className={styles.partnerName}>{sp.ten_nha_tai_tro}</h3>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className={styles.grid}>
              {sponsors.map((sp) => {
                const loaiClass =
                  sp.loai === 'Ca nhan'
                    ? styles.badgeCaNhan
                    : sp.loai === 'Doanh nghiep'
                      ? styles.badgeDoanhNghiep
                      : sp.loai === 'Doi tac'
                        ? styles.badgeDoiTac
                        : styles.badgeToChuc;
                return (
                  <div key={sp.nha_tai_tro_id} className={styles.card}>
                    <div className={styles.cardHead}>
                      <div className={styles.avatar}>
                        {sp.logo || sp.avatar ? (
                          <img src={sp.logo || sp.avatar} alt={sp.ten_nha_tai_tro} />
                        ) : (
                          <span>{getInitial(sp.ten_nha_tai_tro)}</span>
                        )}
                      </div>
                      <div className={styles.cardHeadText}>
                        <h3 className={styles.cardName}>{sp.ten_nha_tai_tro}</h3>
                        <span className={`${styles.loaiBadge} ${loaiClass}`}>
                          {LOAI_LABEL[sp.loai] || sp.loai}
                        </span>
                      </div>
                    </div>

                    <div className={styles.divider} />

                    <div className={styles.contactList}>
                      <div className={styles.contactItem}>
                        <HiOutlineEnvelope className={styles.contactIcon} />
                        <span className={styles.contactText}>
                          {sp.email || '—'}
                        </span>
                      </div>
                      <div className={styles.contactItem}>
                        <HiOutlinePhone className={styles.contactIcon} />
                        <span className={styles.contactText}>
                          {sp.so_dien_thoai || '—'}
                        </span>
                      </div>
                      {sp.dia_chi && (
                        <div className={styles.contactItem}>
                          <HiOutlineMapPin className={styles.contactIcon} />
                          <span className={styles.contactAddress}>
                            {sp.dia_chi}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className={styles.divider} />

                    <div className={styles.totalBox}>
                      <div className={styles.totalLabel}>TỔNG ĐÃ ĐÓNG GÓP</div>
                      <div className={styles.totalValue}>
                        {formatCurrency(sp.tong_da_dong_gop)}
                      </div>
                      <div className={styles.totalSub}>
                        {sp.so_khoan} khoản · Lần cuối: {formatDate(sp.lan_cuoi)}
                      </div>
                    </div>

                    <div className={styles.cardActions}>
                      <Button
                        variant="secondary"
                        leftIcon={<HiOutlineEye />}
                        onClick={() => setSelectedSponsor(sp)}
                        className={styles.actionBtn}
                      >
                        Xem chi tiết
                      </Button>
                      <Button
                        variant="primary"
                        leftIcon={<HiOutlinePlusCircle />}
                        onClick={() => handleOpenCreateModal(sp)}
                        className={styles.actionBtn}
                      >
                        Ghi tài trợ
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  type="button"
                  className={styles.pageBtn}
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <HiOutlineChevronLeft />
                </button>
                <span className={styles.pageInfo}>
                  Trang <strong>{page}</strong> / {totalPages}
                </span>
                <button
                  type="button"
                  className={styles.pageBtn}
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  <HiOutlineChevronRight />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Drawer ───────────────────────────── */}
      {selectedSponsor && (
        <NhaTaiTroDetailDrawer
          sponsor={selectedSponsor}
          onClose={() => setSelectedSponsor(null)}
          onGhiTaiTro={() => {
            handleOpenCreateModal(selectedSponsor);
            setSelectedSponsor(null);
          }}
        />
      )}

      {/* ── Modal ghi nhận khoản ─────────────── */}
      <KhoanTaiTroModal
        isOpen={showKhoanModal}
        onClose={handleCloseModal}
        preselectedSponsor={preselectedSponsor}
        onSuccess={handleSuccessSave}
      />

      {/* ── Modal tạo nhà tài trợ mới ────────── */}
      <CreateDonorModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleSuccessSave}
      />
    </div>
  );
};

export default NhaTaiTroPage;
