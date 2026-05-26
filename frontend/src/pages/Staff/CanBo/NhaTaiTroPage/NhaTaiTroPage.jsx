import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  HiOutlinePlusCircle,
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
} from 'react-icons/hi2';
import Button from '@components/common/Button/Button';
import Input from '@components/common/Input/Input';
import { getStaffDonors, getDonorStats } from '@services/donorService';
import NhaTaiTroDetailDrawer from './NhaTaiTroDetailDrawer/NhaTaiTroDetailDrawer';
import KhoanTaiTroModal from './KhoanTaiTroModal/KhoanTaiTroModal';
import styles from './NhaTaiTroPage.module.scss';

const PAGE_SIZE = 12;

const LOAI_OPTIONS = [
  { value: '', label: '-- Tất cả loại --' },
  { value: 'Ca nhan', label: 'Cá nhân' },
  { value: 'Doanh nghiep', label: 'Doanh nghiệp' },
  { value: 'To chuc phi loi nhuan', label: 'Tổ chức phi lợi nhuận' },
];

const SORT_OPTIONS = [
  { value: 'tong_tai_tro_desc', label: 'Đóng góp nhiều nhất' },
  { value: 'ngay_tao_desc', label: 'Mới tham gia nhất' },
  { value: 'gan_nhat_desc', label: 'Tài trợ gần nhất' },
  { value: 'ten_asc', label: 'Tên A → Z' },
];

const LOAI_LABEL = {
  'Ca nhan': 'Cá nhân',
  'Doanh nghiep': 'Doanh nghiệp',
  'To chuc phi loi nhuan': 'Tổ chức phi lợi nhuận',
};

const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '0đ';
  const n = Number(amount);
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)} tỷ`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)} triệu`;
  return n.toLocaleString('vi-VN') + 'đ';
};

const formatDate = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('vi-VN');
};

const getInitial = (name) => (name ? name.charAt(0).toUpperCase() : '?');

const NhaTaiTroPage = () => {
  const [sponsors, setSponsors] = useState([]);
  const [stats, setStats] = useState(null);
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

  useEffect(() => {
    const t = setTimeout(() => setDebouncedKeyword(filters.keyword), 500);
    return () => clearTimeout(t);
  }, [filters.keyword]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getStaffDonors({
        keyword: debouncedKeyword,
        loai: filters.loai,
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
  }, [debouncedKeyword, filters.loai, filters.sort_by, page]);

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
      color: 'var(--color-navy-blue, #1a2f5e)',
      bg: 'rgba(26,47,94,0.08)',
    },
    {
      label: 'Tổng đã đóng góp',
      value: formatCurrency(stats?.tongDaDongGop),
      icon: HiOutlineBanknotes,
      color: '#10b981',
      bg: 'rgba(16,185,129,0.08)',
    },
    {
      label: 'Tháng này',
      value: formatCurrency(stats?.thangNay),
      icon: HiOutlineCalendarDays,
      color: 'var(--color-gold, #f0a500)',
      bg: 'rgba(240,165,0,0.08)',
    },
    {
      label: 'Khoản chờ duyệt',
      value: stats?.choDuyet ?? 0,
      icon: HiOutlineClock,
      color: '#ef4444',
      bg: 'rgba(239,68,68,0.08)',
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
            Ghi nhận tài trợ mới
          </Button>
        </header>

        {/* ── Stat cards ───────────────────────── */}
        <div className={styles.statsRow}>
          {STAT_CARDS.map((card) => {
            const Icon = card.icon;
            const isUrgent = card.urgent && Number(card.value) > 0;
            return (
              <div
                key={card.label}
                className={`${styles.statCard} ${
                  isUrgent ? styles.statUrgent : ''
                }`}
              >
                <div
                  className={styles.statIconWrap}
                  style={{ background: card.bg, color: card.color }}
                >
                  <Icon className={styles.statIcon} />
                </div>
                <div className={styles.statText}>
                  <div className={styles.statValue}>{card.value}</div>
                  <div className={styles.statLabel}>{card.label}</div>
                </div>
              </div>
            );
          })}
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

          <select
            className={styles.select}
            value={filters.loai}
            onChange={(e) =>
              setFilters((f) => ({ ...f, loai: e.target.value }))
            }
          >
            {LOAI_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

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
            <p>Chưa có nhà tài trợ nào</p>
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
                      : styles.badgeToChuc;
                return (
                  <div key={sp.nha_tai_tro_id} className={styles.card}>
                    <div className={styles.cardHead}>
                      <div className={styles.avatar}>
                        {sp.avatar ? (
                          <img src={sp.avatar} alt={sp.ten_nha_tai_tro} />
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
    </div>
  );
};

export default NhaTaiTroPage;
