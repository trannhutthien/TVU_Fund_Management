import { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  HiOutlineBuildingLibrary,
  HiOutlineBanknotes,
  HiOutlineCalendarDays,
  HiOutlinePauseCircle,
  HiOutlineMagnifyingGlass,
  HiOutlineXMark,
  HiOutlineExclamationTriangle,
  HiOutlineUsers,
  HiOutlineFolderOpen,
  HiOutlineClipboardDocumentCheck,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlinePlus,
} from 'react-icons/hi2';
import Button from '@components/common/Button/Button';
import Input from '@components/common/Input/Input';
import StatusBadge from '@components/common/StatusBadge/StatusBadge';
import api from '@services/api';
import { getAllLoaiQuy, createLoaiQuy } from '@services/fundService';
import QuyDetailDrawer from './QuyDetailDrawer/QuyDetailDrawer';
import styles from './QuyListPage.module.scss';

const PAGE_SIZE = 12;

const TRANG_THAI_OPTIONS = [
  { value: '', label: '-- Tất cả trạng thái --' },
  { value: 'Dang hoat dong', label: 'Đang hoạt động' },
  { value: 'Tam dung', label: 'Tạm dừng' },
  { value: 'Da dong', label: 'Đã đóng' },
];

const TRANG_THAI_LABEL = {
  'Dang hoat dong': 'Đang hoạt động',
  'Tam dung': 'Tạm dừng',
  'Da dong': 'Đã đóng',
};

const SORT_OPTIONS = [
  { value: 'ngay_tao', label: 'Mới nhất' },
  { value: 'so_du_desc', label: 'Số dư cao nhất' },
  { value: 'han_nop_don', label: 'Hạn nộp gần nhất' },
  { value: 'ten_quy', label: 'Tên A → Z' },
];

const INITIAL_FILTERS = {
  keyword: '',
  loai_quy: '',
  trang_thai: '',
  sort_by: 'ngay_tao',
};

const formatCurrency = (value) => {
  const n = Number(value || 0);
  return `${n.toLocaleString('vi-VN')}đ`;
};

const formatDate = (value) => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('vi-VN');
};

const daysUntil = (value) => {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  const diff = d.getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const mapStatusToBadge = (trangThai) => {
  if (trangThai === 'Dang hoat dong') return 'approved';
  if (trangThai === 'Tam dung') return 'processing';
  if (trangThai === 'Da dong') return 'cancelled';
  return 'pending';
};

const generateMaLoai = (str) => {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, ' ');
};

const QuyListPage = ({ isAdmin = false }) => {
  const navigate = useNavigate();

  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [keywordInput, setKeywordInput] = useState('');
  const [funds, setFunds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFund, setSelectedFund] = useState(null);
  const [page, setPage] = useState(1);

  const [loaiQuyList, setLoaiQuyList] = useState([]);
  const [isOpenAddLoaiQuyModal, setIsOpenAddLoaiQuyModal] = useState(false);
  const [newLoaiQuyName, setNewLoaiQuyName] = useState('');
  const [submittingLoaiQuy, setSubmittingLoaiQuy] = useState(false);

  const debounceRef = useRef(null);

  // Fetch loai-quy list
  const fetchLoaiQuy = () => {
    getAllLoaiQuy()
      .then((res) => {
        if (res?.success && Array.isArray(res.data)) {
          setLoaiQuyList(res.data);
        }
      })
      .catch((err) => {
        console.error('Error fetching loai-quy:', err);
      });
  };

  useEffect(() => {
    fetchLoaiQuy();
  }, []);

  const loaiQuyOptions = useMemo(() => {
    const list = [{ value: '', label: '-- Tất cả loại --' }];
    loaiQuyList.forEach((item) => {
      list.push({ value: item.maLoai, label: item.tenLoai });
    });
    return list;
  }, [loaiQuyList]);

  const getLoaiQuyLabel = (maLoai) => {
    const found = loaiQuyList.find((item) => item.maLoai === maLoai);
    return found ? found.tenLoai : maLoai || 'Khác';
  };

  const handleAddLoaiQuySubmit = async (e) => {
    e.preventDefault();
    if (!newLoaiQuyName.trim()) {
      toast.warn('Vui lòng nhập tên loại quỹ');
      return;
    }

    const maLoai = generateMaLoai(newLoaiQuyName);
    const tenLoai = newLoaiQuyName.trim();

    try {
      setSubmittingLoaiQuy(true);
      const res = await createLoaiQuy(maLoai, tenLoai);
      if (res?.success) {
        toast.success('Tạo loại quỹ mới thành công!');
        setNewLoaiQuyName('');
        setIsOpenAddLoaiQuyModal(false);
        fetchLoaiQuy();
      } else {
        toast.error(res?.message || 'Không thể tạo loại quỹ');
      }
    } catch (err) {
      console.error('Lỗi khi tạo loại quỹ:', err);
      toast.error(err.response?.data?.message || 'Mã loại quỹ đã tồn tại hoặc có lỗi xảy ra');
    } finally {
      setSubmittingLoaiQuy(false);
    }
  };

  // ─── Debounce keyword ─────────────────────────────
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setFilters((prev) =>
        prev.keyword === keywordInput ? prev : { ...prev, keyword: keywordInput },
      );
      setPage(1);
    }, 500);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [keywordInput]);

  // ─── Fetch funds list ─────────────────────────────
  useEffect(() => {
    let mounted = true;
    setLoading(true);

    api
      .get('/funds')
      .then((res) => {
        if (!mounted) return;
        const list = Array.isArray(res.data?.funds) ? res.data.funds : [];
        setFunds(list);
      })
      .catch(() => {
        if (mounted) setFunds([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // ─── Derived: filtered + sorted ──────────────────
  const filteredFunds = useMemo(() => {
    let list = [...funds];

    if (filters.keyword.trim()) {
      const kw = filters.keyword.toLowerCase().trim();
      list = list.filter((f) =>
        (f.tenQuy || '').toLowerCase().includes(kw),
      );
    }
    if (filters.loai_quy) {
      list = list.filter((f) => f.loaiQuy === filters.loai_quy);
    }
    if (filters.trang_thai) {
      list = list.filter((f) => f.trangThai === filters.trang_thai);
    }

    switch (filters.sort_by) {
      case 'so_du_desc':
        list.sort((a, b) => Number(b.soDu || 0) - Number(a.soDu || 0));
        break;
      case 'han_nop_don':
        list.sort((a, b) => {
          if (!a.hanNopDon && !b.hanNopDon) return 0;
          if (!a.hanNopDon) return 1;
          if (!b.hanNopDon) return -1;
          return new Date(a.hanNopDon) - new Date(b.hanNopDon);
        });
        break;
      case 'ten_quy':
        list.sort((a, b) =>
          (a.tenQuy || '').localeCompare(b.tenQuy || '', 'vi'),
        );
        break;
      case 'ngay_tao':
      default:
        list.sort((a, b) => new Date(b.ngayTao || 0) - new Date(a.ngayTao || 0));
        break;
    }

    return list;
  }, [funds, filters]);

  // ─── Stats ────────────────────────────────────────
  const stats = useMemo(() => {
    const dangHoatDong = funds.filter((f) => f.trangThai === 'Dang hoat dong')
      .length;
    const tamDung = funds.filter((f) => f.trangThai === 'Tam dung').length;
    const tongSoDu = funds
      .filter((f) => f.trangThai === 'Dang hoat dong')
      .reduce((sum, f) => sum + Number(f.soDu || 0), 0);
    const sapHetHan = funds.filter((f) => {
      if (f.trangThai !== 'Dang hoat dong') return false;
      const d = daysUntil(f.hanNopDon);
      return d !== null && d >= 0 && d <= 7;
    }).length;
    return { dangHoatDong, tongSoDu, sapHetHan, tamDung };
  }, [funds]);

  const STAT_CARDS = [
    {
      label: 'Quỹ đang hoạt động',
      value: stats.dangHoatDong,
      icon: HiOutlineBuildingLibrary,
      color: 'var(--color-primary)',
      bg: 'rgba(59, 111, 245, 0.1)',
    },
    {
      label: 'Tổng số dư',
      value: formatCurrency(stats.tongSoDu),
      icon: HiOutlineBanknotes,
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.1)',
    },
    {
      label: 'Quỹ sắp hết hạn',
      value: stats.sapHetHan,
      icon: HiOutlineCalendarDays,
      color: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.1)',
    },
    {
      label: 'Quỹ tạm dừng',
      value: stats.tamDung,
      icon: HiOutlinePauseCircle,
      color: '#94a3b8',
      bg: 'rgba(148, 163, 184, 0.1)',
    },
  ];

  // ─── Pagination ──────────────────────────────────
  const total = filteredFunds.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const displayFunds = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredFunds.slice(start, start + PAGE_SIZE);
  }, [filteredFunds, currentPage]);
  const fromItem = total === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const toItem = Math.min(currentPage * PAGE_SIZE, total);

  // ─── Handlers ─────────────────────────────────────
  const handleFilterChange = (key) => (e) => {
    setFilters((prev) => ({ ...prev, [key]: e.target.value }));
    setPage(1);
  };

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
    setKeywordInput('');
    setPage(1);
  };

  const hasAnyFilter =
    filters.keyword || filters.loai_quy || filters.trang_thai;

  const handleOpenDetail = (fund) => setSelectedFund(fund);
  const handleCloseDetail = () => setSelectedFund(null);
  
  // Callback để refresh danh sách sau khi cập nhật trạng thái
  const handleStatusUpdated = () => {
    // Fetch lại danh sách quỹ
    setLoading(true);
    api
      .get('/funds')
      .then((res) => {
        const list = Array.isArray(res.data?.funds) ? res.data.funds : [];
        setFunds(list);
      })
      .catch(() => {
        setFunds([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        {/* Breadcrumb */}
        <div className={styles.breadcrumb}>
          <Link to="/" className={styles.crumbLink}>
            Trang chủ
          </Link>
          <span className={styles.crumbSep}>/</span>
          <span>Danh sách Quỹ</span>
        </div>

        {/* Page Header */}
        <header className={styles.header}>
          <div className={styles.headerText}>
            <h1 className={styles.title}>Danh sách Quỹ</h1>
            <p className={styles.subtitle}>
              Theo dõi tình trạng các quỹ hỗ trợ đang hoạt động
            </p>
          </div>
          <div className={styles.headerActions}>
            <Button
              variant="secondary"
              leftIcon={<HiOutlineFolderOpen />}
              onClick={() => setIsOpenAddLoaiQuyModal(true)}
            >
              Thêm loại quỹ
            </Button>
            <Button
              variant="secondary"
              leftIcon={<HiOutlineClipboardDocumentCheck />}
              onClick={() => navigate(isAdmin ? '/admin/xet-duyet' : '/can-bo/xet-duyet')}
            >
              Xét duyệt hồ sơ
            </Button>
            <Button
              variant="primary"
              leftIcon={<HiOutlinePlus />}
              onClick={() => navigate(isAdmin ? '/admin/quy/tao' : '/can-bo/quy/tao')}
            >
              Tạo quỹ
            </Button>
          </div>
        </header>

        {/* Stat Cards */}
        <div className={styles.statsRow}>
          {STAT_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className={styles.statCard}>
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

        {/* Filter Bar */}
        <div className={styles.filterBar}>
          <div className={styles.searchField}>
            <Input
              placeholder="Tìm tên quỹ..."
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              leftIcon={<HiOutlineMagnifyingGlass />}
            />
          </div>

          <select
            className={styles.select}
            value={filters.loai_quy}
            onChange={handleFilterChange('loai_quy')}
            aria-label="Lọc theo loại quỹ"
          >
            {loaiQuyOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <select
            className={styles.select}
            value={filters.trang_thai}
            onChange={handleFilterChange('trang_thai')}
            aria-label="Lọc theo trạng thái"
          >
            {TRANG_THAI_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <select
            className={styles.select}
            value={filters.sort_by}
            onChange={handleFilterChange('sort_by')}
            aria-label="Sắp xếp"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {hasAnyFilter && (
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<HiOutlineXMark />}
              onClick={handleResetFilters}
            >
              Xóa bộ lọc
            </Button>
          )}
        </div>

        {/* Grid */}
        {loading ? (
          <div className={styles.grid}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={`skeleton-${i}`} className={styles.skeletonCard}>
                <div className={styles.skeletonCover} />
                <div className={styles.skeletonBody}>
                  <div className={styles.skeletonBar} />
                  <div
                    className={styles.skeletonBar}
                    style={{ width: '60%' }}
                  />
                  <div
                    className={styles.skeletonBar}
                    style={{ width: '40%' }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : displayFunds.length === 0 ? (
          <div className={styles.empty}>
            <HiOutlineFolderOpen className={styles.emptyIcon} />
            <p className={styles.emptyText}>Không tìm thấy quỹ phù hợp</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {displayFunds.map((fund) => {
              const daysLeft = daysUntil(fund.hanNopDon);
              const isUrgent =
                daysLeft !== null && daysLeft >= 0 && daysLeft <= 7;
              const isLowBalance = Number(fund.soDu || 0) < 1_000_000;
              const isInactive = fund.trangThai !== 'Dang hoat dong';
              const percent = Number(fund.phanTramDaNhan || 0);
              const isAlmostFull =
                fund.soLuongChiTieu != null && percent >= 80;
              const hasQuota =
                fund.soLuongChiTieu != null && fund.soLuongChiTieu > 0;

              return (
                <div
                  key={fund.quyId}
                  className={styles.card}
                  onClick={() => handleOpenDetail(fund)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleOpenDetail(fund);
                    }
                  }}
                >
                  {/* Cover */}
                  <div className={styles.cover}>
                    {fund.hinhAnh ? (
                      <img
                        src={fund.hinhAnh}
                        alt={fund.tenQuy}
                        className={styles.coverImg}
                      />
                    ) : (
                      <div className={styles.coverPlaceholder}>
                        <HiOutlineBuildingLibrary
                          className={styles.coverIcon}
                        />
                      </div>
                    )}
                    <span className={styles.loaiBadge}>
                      {getLoaiQuyLabel(fund.loaiQuy)}
                    </span>
                    {isInactive && (
                      <div className={styles.coverOverlay}>
                        {TRANG_THAI_LABEL[fund.trangThai] || fund.trangThai}
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <div className={styles.cardBody}>
                    <div className={styles.cardHead}>
                      <h3 className={styles.fundName}>{fund.tenQuy}</h3>
                      <StatusBadge
                        status={mapStatusToBadge(fund.trangThai)}
                        size="sm"
                        showIcon={false}
                      />
                    </div>

                    <div className={styles.balanceBlock}>
                      <div className={styles.balanceLabel}>
                        Số dư hiện tại
                      </div>
                      <div
                        className={`${styles.balanceValue} ${
                          isLowBalance ? styles.balanceLow : ''
                        }`}
                      >
                        {isLowBalance && (
                          <HiOutlineExclamationTriangle
                            className={styles.warnIcon}
                          />
                        )}
                        <span>{formatCurrency(fund.soDu)}</span>
                      </div>
                    </div>

                    <div className={styles.metaRow}>
                      <span
                        className={`${styles.meta} ${
                          isUrgent ? styles.metaUrgent : ''
                        }`}
                      >
                        <HiOutlineCalendarDays className={styles.metaIcon} />
                        {fund.hanNopDon ? (
                          isUrgent ? (
                            <>⚠️ Còn {daysLeft} ngày</>
                          ) : (
                            formatDate(fund.hanNopDon)
                          )
                        ) : (
                          'Không giới hạn'
                        )}
                      </span>
                      <span className={styles.meta}>
                        <HiOutlineUsers className={styles.metaIcon} />
                        {fund.soLuongChiTieu != null
                          ? `${fund.soLuongChiTieu} suất`
                          : 'Không giới hạn'}
                      </span>
                    </div>

                    {hasQuota && (
                      <div className={styles.progressBlock}>
                        <div className={styles.progressInfo}>
                          <span className={styles.progressLeft}>
                            Đã nhận: {fund.soDonDaNop || 0}/
                            {fund.soLuongChiTieu} suất
                          </span>
                          <span
                            className={`${styles.progressRight} ${
                              isAlmostFull ? styles.progressWarn : ''
                            }`}
                          >
                            {percent}%
                          </span>
                        </div>
                        <div className={styles.progressBar}>
                          <div
                            className={`${styles.progressFill} ${
                              isAlmostFull ? styles.progressFillWarn : ''
                            }`}
                            style={{ width: `${Math.min(percent, 100)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {!loading && total > 0 && (
          <div className={styles.pagination}>
            <div className={styles.pageInfo}>
              Hiển thị {fromItem}-{toItem} trong {total} quỹ
            </div>
            <div className={styles.pageNav}>
              <Button
                variant="secondary"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                leftIcon={<HiOutlineChevronLeft />}
              >
                Trước
              </Button>
              <span className={styles.pageNum}>
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                rightIcon={<HiOutlineChevronRight />}
              >
                Tiếp
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Thêm loại quỹ mới */}
      {isOpenAddLoaiQuyModal && (
        <div className={styles.modalOverlay} onClick={() => setIsOpenAddLoaiQuyModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Thêm loại quỹ mới</h3>
              <button 
                className={styles.modalCloseBtn} 
                onClick={() => setIsOpenAddLoaiQuyModal(false)}
              >
                <HiOutlineXMark size={20} />
              </button>
            </div>
            <form onSubmit={handleAddLoaiQuySubmit} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label className={styles.modalLabel}>Tên loại quỹ *</label>
                <Input
                  placeholder="Ví dụ: Nghiên cứu khoa học, Thể thao..."
                  value={newLoaiQuyName}
                  onChange={(e) => setNewLoaiQuyName(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div className={styles.modalActions}>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsOpenAddLoaiQuyModal(false)}
                  disabled={submittingLoaiQuy}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  loading={submittingLoaiQuy}
                >
                  Xác nhận
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <QuyDetailDrawer 
        fund={selectedFund} 
        onClose={handleCloseDetail}
        onStatusUpdated={handleStatusUpdated}
        loaiQuyList={loaiQuyList}
      />
    </div>
  );
};

export default QuyListPage;
