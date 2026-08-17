import { useState, useEffect, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { Link, useNavigate } from 'react-router-dom';
import {
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineMagnifyingGlass,
  HiOutlineCalendarDays,
  HiOutlineXMark,
  HiOutlineEye,
  HiOutlineExclamationTriangle,
  HiOutlineDocumentMagnifyingGlass,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from 'react-icons/hi2';
import Button from '@components/common/Button/Button';
import Input from '@components/common/Input/Input';
import StatusBadge from '@components/common/StatusBadge/StatusBadge';
import Dropdown from '@components/common/Dropdown/Dropdown';
import { applicationService } from '@services/applicationService';
import api from '@services/api';
import { formatCurrency } from '@utils/formatters';
import styles from './XetDuyetPage.module.scss';

const PAGE_SIZE = 10;
const SEARCH_WINDOW = 200;

const TABS = [
  { key: 'pending', label: 'Chờ xử lý', icon: HiOutlineClock },
  { key: 'processed', label: 'Đã xử lý', icon: HiOutlineCheckCircle },
];

const KHOA_OPTIONS = [
  { value: 'Công nghệ thông tin', label: 'Công nghệ thông tin' },
  { value: 'Kinh tế - Luật', label: 'Kinh tế - Luật' },
  { value: 'Ngôn ngữ - Văn hóa - Nghệ thuật', label: 'Ngôn ngữ - Văn hóa - Nghệ thuật' },
  { value: 'Kỹ thuật - Công nghệ', label: 'Kỹ thuật - Công nghệ' },
  { value: 'Nông nghiệp - Thủy sản', label: 'Nông nghiệp - Thủy sản' },
  { value: 'Y - Dược', label: 'Y - Dược' },
  { value: 'Khoa học cơ bản', label: 'Khoa học cơ bản' },
  { value: 'Sư phạm', label: 'Sư phạm' },
];

const RESULT_OPTIONS = [
  { value: 'Dang xu ly', label: 'Đang xử lý' },
  { value: 'Tu choi', label: 'Từ chối' },
];

const ALL_STATUSES = [
  'Cho duyet cap 1',
  'Da duyet cap 1',
  'Tu choi cap 1',
  'Cho duyet cap 2',
  'Da duyet cap 2',
  'Tu choi cap 2',
  'Cho duyet cap 3',
  'Da duyet cap 3',
  'Tu choi cap 3',
  'Cho giai ngan',
  'Da giai ngan',
  'Cho nghiem thu',
  'Da nghiem thu',
  'Nghiem thu khong dat',
  'Tu choi',
  'Cho giai ngan dot 1',
  'Da giai ngan dot 1',
  'Cho nghiem thu dot 1',
  'Da nghiem thu dot 1',
  'Cho giai ngan dot 2',
  'Dang thu hoi no',
  'Hoan thanh',
];

// Nhóm trạng thái "chờ xử lý" theo vai trò → các trạng thái còn lại sẽ hiện ở tab Đã xử lý
const PENDING_BY_ROLE = {
  1: ['Cho duyet cap 2'],
  2: ['Cho duyet cap 3', 'Cho giai ngan', 'Cho giai ngan dot 1', 'Cho giai ngan dot 2'],
  3: ['Cho duyet cap 1'],
};

const getProcessedStatuses = (role) => {
  const excluded = PENDING_BY_ROLE[role] || PENDING_BY_ROLE[3];
  return ALL_STATUSES.filter((s) => !excluded.includes(s)).join(',');
};

const getPendingStatus = (role) => {
  const list = PENDING_BY_ROLE[role] || PENDING_BY_ROLE[3];
  return list.join(',');
};

const INITIAL_FILTERS = {
  quy_id: null,
  khoa_phong: null,
  tu_ngay: '',
  den_ngay: '',
  keyword: '',
};

const formatDate = (value) => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('vi-VN');
};

const daysSince = (value) => {
  if (!value) return 0;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return 0;
  const diff = Date.now() - d.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};

const STATUS_CONFIG = {
  'Cho duyet cap 1':      { label: 'Chờ duyệt cấp 1',       variant: 'warning' },
  'Da duyet cap 1':       { label: 'Đã duyệt cấp 1',        variant: 'info' },
  'Tu choi cap 1':        { label: 'Từ chối cấp 1',         variant: 'danger' },
  'Cho duyet cap 2':      { label: 'Chờ duyệt cấp 2',       variant: 'warning' },
  'Da duyet cap 2':       { label: 'Đã duyệt cấp 2',        variant: 'info' },
  'Tu choi cap 2':        { label: 'Từ chối cấp 2',         variant: 'danger' },
  'Cho duyet cap 3':      { label: 'Chờ duyệt cấp 3',       variant: 'warning' },
  'Da duyet cap 3':       { label: 'Đã duyệt cấp 3',        variant: 'info' },
  'Tu choi cap 3':        { label: 'Từ chối cấp 3',         variant: 'danger' },
  'Dang xu ly':           { label: 'Đang xử lý',            variant: 'info' },
  'Cho giai ngan':        { label: 'Chờ giải ngân',          variant: 'warning' },
  'Da giai ngan':         { label: 'Đã giải ngân',           variant: 'success' },
  'Cho nghiem thu':       { label: 'Chờ nghiệm thu',         variant: 'warning' },
  'Da nghiem thu':        { label: 'Đã nghiệm thu',          variant: 'success' },
  'Nghiem thu khong dat': { label: 'Nghiệm thu không đạt',   variant: 'danger' },
  'Tu choi':              { label: 'Từ chối',                variant: 'danger' },
  'Cho giai ngan dot 1':  { label: 'Chờ giải ngân đợt 1',    variant: 'warning' },
  'Da giai ngan dot 1':   { label: 'Đã giải ngân đợt 1',     variant: 'success' },
  'Cho nghiem thu dot 1': { label: 'Chờ nghiệm thu đợt 1',   variant: 'warning' },
  'Da nghiem thu dot 1':  { label: 'Đã nghiệm thu đợt 1',    variant: 'success' },
  'Cho giai ngan dot 2':  { label: 'Chờ giải ngân đợt 2',    variant: 'warning' },
  'Dang thu hoi no':      { label: 'Đang thu hồi nợ',        variant: 'info' },
  'Hoan thanh':           { label: 'Hoàn thành',              variant: 'success' },
};

const matchesKeyword = (item, kw) => {
  if (!kw) return false;
  const k = kw.toLowerCase().trim();
  if (!k) return false;
  const ten = (item.nguoiNop?.hoTen || '').toLowerCase();
  const mssv = (item.nguoiNop?.maSoDinhDanh || '').toLowerCase();
  const id = String(item.requestId || '').toLowerCase();
  const tieuDe = (item.tieuDe || item.moTa || '').toLowerCase();
  return ten.includes(k) || mssv.includes(k) || id.includes(k) || tieuDe.includes(k);
};

const XetDuyetPage = ({ userRole = 3 }) => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('pending');
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [filterResult, setFilterResult] = useState(null);
  const [page, setPage] = useState(1);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

  const [keywordInput, setKeywordInput] = useState('');
  const [funds, setFunds] = useState([]);

  const debounceRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    api
      .get('/funds')
      .then((res) => {
        if (!mounted) return;
        const list = (res.data?.funds || []).filter(
          (f) => f.trangThai === 'Dang hoat dong',
        );
        setFunds(list);
      })
      .catch(() => {
        if (mounted) setFunds([]);
      });
    return () => {
      mounted = false;
    };
  }, []);

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

  const processedStatuses = useMemo(() => getProcessedStatuses(userRole), [userRole]);

  const resultOptions = useMemo(() => {
    if (userRole === 1) {
      return [
        { value: '', label: 'Tất cả' },
        { value: 'Cho duyet cap 3', label: 'Đã duyệt (Chờ cấp 3)' },
        { value: 'Cho giai ngan dot 1,Cho giai ngan dot 2,Cho giai ngan', label: 'Chờ giải ngân' },
        { value: 'Da giai ngan,Da giai ngan dot 1', label: 'Đã giải ngân' },
        { value: 'Tu choi cap 1,Tu choi cap 2,Tu choi cap 3,Tu choi', label: 'Từ chối' },
        { value: 'Cho nghiem thu,Cho nghiem thu dot 1', label: 'Chờ nghiệm thu' },
        { value: 'Da nghiem thu,Da nghiem thu dot 1', label: 'Đã nghiệm thu' },
        { value: 'Nghiem thu khong dat', label: 'Nghiệm thu không đạt' },
        { value: 'Dang thu hoi no', label: 'Đang thu hồi nợ' },
        { value: 'Hoan thanh', label: 'Hoàn thành' },
      ];
    }
    if (userRole === 2) {
      return [
        { value: '', label: 'Tất cả' },
        { value: 'Cho duyet cap 3', label: 'Đã duyệt (Chờ cấp 3)' },
        { value: 'Cho giai ngan dot 1,Cho giai ngan dot 2,Cho giai ngan', label: 'Chờ giải ngân' },
        { value: 'Da giai ngan,Da giai ngan dot 1', label: 'Đã giải ngân' },
        { value: 'Tu choi cap 1,Tu choi cap 2,Tu choi cap 3,Tu choi', label: 'Từ chối' },
        { value: 'Cho nghiem thu,Cho nghiem thu dot 1', label: 'Chờ nghiệm thu' },
        { value: 'Da nghiem thu,Da nghiem thu dot 1', label: 'Đã nghiệm thu' },
        { value: 'Nghiem thu khong dat', label: 'Nghiệm thu không đạt' },
        { value: 'Dang thu hoi no', label: 'Đang thu hồi nợ' },
        { value: 'Hoan thanh', label: 'Hoàn thành' },
      ];
    }
    return [
      { value: '', label: 'Tất cả' },
      { value: 'Cho duyet cap 2', label: 'Đã duyệt (Chờ cấp 2)' },
      { value: 'Cho duyet cap 3', label: 'Đã duyệt (Chờ cấp 3)' },
      { value: 'Cho giai ngan dot 1,Cho giai ngan dot 2,Cho giai ngan', label: 'Chờ giải ngân' },
      { value: 'Da giai ngan,Da giai ngan dot 1', label: 'Đã giải ngân' },
      { value: 'Tu choi cap 1,Tu choi cap 2,Tu choi cap 3,Tu choi', label: 'Từ chối' },
      { value: 'Nghiem thu khong dat', label: 'Nghiệm thu không đạt' },
      { value: 'Dang thu hoi no', label: 'Đang thu hồi nợ' },
      { value: 'Hoan thanh', label: 'Hoàn thành' },
    ];
  }, [userRole]);

  const trangThaiParam = useMemo(() => {
    if (activeTab === 'pending') {
      return getPendingStatus(userRole);
    }
    return filterResult || processedStatuses;
  }, [activeTab, filterResult, userRole, processedStatuses]);

  const isSearching = !!filters.keyword.trim();

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    const params = {
      page: isSearching ? 1 : page,
      limit: isSearching ? SEARCH_WINDOW : PAGE_SIZE,
      trangThai: trangThaiParam,
      quyId: filters.quy_id || undefined,
    };

    applicationService
      .getAll(params)
      .then((res) => {
        if (!mounted) return;
        setData(Array.isArray(res?.data) ? res.data : []);
        setTotal(res?.pagination?.totalRecords ?? 0);
      })
      .catch(() => {
        if (!mounted) return;
        setData([]);
        setTotal(0);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [activeTab, filters, filterResult, page, trangThaiParam, isSearching]);

  useEffect(() => {
    let mounted = true;
    const pendingCountStatus = getPendingStatus(userRole);
    
    applicationService
      .getAll({ page: 1, limit: 1, trangThai: pendingCountStatus })
      .then((res) => {
        if (!mounted) return;
        setPendingCount(res?.pagination?.totalRecords ?? 0);
      })
      .catch(() => {
        if (mounted) setPendingCount(0);
      });
    return () => {
      mounted = false;
    };
  }, [activeTab, userRole]);

  const sortedData = useMemo(() => {
    if (!isSearching) return data;
    return [...data].sort((a, b) => {
      const aMatch = matchesKeyword(a, filters.keyword) ? 0 : 1;
      const bMatch = matchesKeyword(b, filters.keyword) ? 0 : 1;
      return aMatch - bMatch;
    });
  }, [data, filters.keyword, isSearching]);

  const displayData = useMemo(() => {
    if (!isSearching) return sortedData;
    const start = (page - 1) * PAGE_SIZE;
    return sortedData.slice(start, start + PAGE_SIZE);
  }, [sortedData, page, isSearching]);

  const displayTotal = isSearching ? sortedData.length : total;
  const totalPages = Math.max(1, Math.ceil(displayTotal / PAGE_SIZE));
  const fromItem = displayTotal === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const toItem = Math.min(page * PAGE_SIZE, displayTotal);
  const showStatusColumn = activeTab === 'processed';

  const fundOptions = useMemo(
    () => funds.map((f) => ({ value: f.quyId, label: f.tenQuy })),
    [funds],
  );

  const handleFilterChange = (key) => (value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleDateChange = (key) => (e) => {
    setFilters((prev) => ({ ...prev, [key]: e.target.value }));
    setPage(1);
  };

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
    setKeywordInput('');
    setFilterResult(null);
    setPage(1);
  };

  const handleSwitchTab = (key) => {
    if (key === activeTab) return;
    setActiveTab(key);
    setFilterResult(null);
    setPage(1);
  };

  const handleOpenDetail = (requestId) => {
    if (userRole === 2) {
      navigate(`/ke-toan/giai-ngan/${requestId}`);
      return;
    }
    navigate(`/xet-duyet/${requestId}`);
  };

  const hasAnyFilter =
    filters.quy_id ||
    filters.khoa_phong ||
    filters.tu_ngay ||
    filters.den_ngay ||
    filters.keyword ||
    filterResult;

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.breadcrumb}>
          <Link to="/" className={styles.crumbLink}>
            Trang chủ
          </Link>
          <span className={styles.crumbSep}>/</span>
          <span>{userRole === 2 ? 'Xét duyệt & giải ngân hồ sơ' : 'Xét duyệt hồ sơ'}</span>
        </div>

        <header className={styles.header}>
          <h1 className={styles.title}>
            {userRole === 2 ? 'Xét duyệt & giải ngân hồ sơ' : 'Xét duyệt hồ sơ'}
          </h1>
          <p className={styles.subtitle}>
            {userRole === 2
              ? 'Xem xét, phê duyệt và giải ngân các đơn xin hỗ trợ'
              : 'Xem xét và xử lý các đơn xin hỗ trợ từ sinh viên'}
          </p>
        </header>

        <div className={styles.card}>
          <div className={styles.tabs}>
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  className={`${styles.tab} ${isActive ? styles.tabActive : ''}`}
                  onClick={() => handleSwitchTab(tab.key)}
                >
                  <Icon className={styles.tabIcon} />
                  <span>{tab.label}</span>
                  {tab.key === 'pending' && pendingCount > 0 && (
                    <span className={styles.tabBadge}>{pendingCount}</span>
                  )}
                </button>
              );
            })}
          </div>

          <div className={styles.filters}>
            <div className={styles.filterRow}>
              <div className={styles.searchField}>
                <Input
                  placeholder="Tìm tên sinh viên, MSSV, mã đơn..."
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  leftIcon={<HiOutlineMagnifyingGlass />}
                />
              </div>

              <div className={styles.selectField}>
                <Dropdown
                  options={fundOptions}
                  value={filters.quy_id}
                  onChange={handleFilterChange('quy_id')}
                  placeholder="-- Tất cả quỹ --"
                  clearable
                  searchable
                  size="medium"
                />
              </div>

              <div className={styles.selectField}>
                <Dropdown
                  options={KHOA_OPTIONS}
                  value={filters.khoa_phong}
                  onChange={handleFilterChange('khoa_phong')}
                  placeholder="-- Tất cả khoa --"
                  clearable
                  size="medium"
                />
              </div>
            </div>

            <div className={styles.filterRow}>
              <div className={styles.dateField}>
                <HiOutlineCalendarDays className={styles.dateIcon} />
                <input
                  type="date"
                  className={styles.dateInput}
                  value={filters.tu_ngay}
                  onChange={handleDateChange('tu_ngay')}
                  aria-label="Từ ngày"
                />
              </div>

              <div className={styles.dateField}>
                <HiOutlineCalendarDays className={styles.dateIcon} />
                <input
                  type="date"
                  className={styles.dateInput}
                  value={filters.den_ngay}
                  onChange={handleDateChange('den_ngay')}
                  aria-label="Đến ngày"
                />
              </div>

              {activeTab === 'processed' && (
                <div className={styles.selectField}>
                  <Dropdown
                    options={resultOptions}
                    value={filterResult}
                    onChange={(v) => {
                      setFilterResult(v);
                      setPage(1);
                    }}
                    placeholder="-- Tất cả --"
                    clearable
                    size="medium"
                  />
                </div>
              )}

              <div className={styles.resetWrap}>
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<HiOutlineXMark />}
                  onClick={handleResetFilters}
                  disabled={!hasAnyFilter}
                >
                  Xóa bộ lọc
                </Button>
              </div>
            </div>
          </div>

          <div className={styles.tableWrap}>
            <div className={`${styles.row} ${styles.headerRow}`}>
              <div className={`${styles.cell} ${styles.colCode}`}>Mã đơn</div>
              <div className={`${styles.cell} ${styles.colName}`}>Họ tên SV</div>
              <div className={`${styles.cell} ${styles.colMssv}`}>MSSV</div>
              <div className={`${styles.cell} ${styles.colTopic}`}>Đề tài / Lý do</div>
              <div className={`${styles.cell} ${styles.colFund}`}>Quỹ</div>
              <div className={`${styles.cell} ${styles.colDotDuyet}`}>Đợt duyệt</div>
              <div className={`${styles.cell} ${styles.colAmount}`}>Số tiền YC</div>
              <div className={`${styles.cell} ${styles.colDate}`}>Ngày nộp</div>
              {showStatusColumn && (
                <div className={`${styles.cell} ${styles.colStatus}`}>Trạng thái</div>
              )}
              <div className={`${styles.cell} ${styles.colAction}`}>Thao tác</div>
            </div>

            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={`skeleton-${i}`}
                  className={`${styles.row} ${styles.skeletonRow}`}
                >
                  <div className={styles.skeletonBar} />
                </div>
              ))
            ) : displayData.length === 0 ? (
              <div className={styles.empty}>
                <HiOutlineDocumentMagnifyingGlass className={styles.emptyIcon} />
                <p className={styles.emptyText}>
                  {activeTab === 'pending'
                    ? 'Không có đơn nào đang chờ xử lý'
                    : 'Chưa có đơn nào được xử lý'}
                </p>
              </div>
            ) : (
              displayData.map((item) => {
                const days = daysSince(item.ngayNop);
                const isOverdue = activeTab === 'pending' && days > 7;
                const isMatch =
                  isSearching && matchesKeyword(item, filters.keyword);
                return (
                  <div
                    key={item.requestId}
                    className={`${styles.row} ${isMatch ? styles.rowMatch : ''}`}
                  >
                    <div className={`${styles.cell} ${styles.colCode} ${styles.code}`}>
                      #{item.requestId}
                    </div>
                    <div className={`${styles.cell} ${styles.colName} ${styles.name}`}>
                      {item.nguoiNop?.hoTen || '—'}
                    </div>
                    <div className={`${styles.cell} ${styles.colMssv}`}>
                      {item.nguoiNop?.maSoDinhDanh || '—'}
                    </div>
                    <div className={`${styles.cell} ${styles.colTopic} ${styles.topic}`} title={item.tieuDe || item.moTa || ''}>
                      {item.tieuDe || item.moTa || '—'}
                    </div>
                    <div className={`${styles.cell} ${styles.colFund}`}>
                      {item.quy?.tenQuy || '—'}
                    </div>
                    <div className={`${styles.cell} ${styles.colDotDuyet}`}>
                      {item.dotDuyet || '—'}
                    </div>
                    <div className={`${styles.cell} ${styles.colAmount} ${styles.amount}`}>
                      {formatCurrency(item.soTienYeuCau)}
                    </div>
                    <div
                      className={`${styles.cell} ${styles.colDate} ${
                        isOverdue ? styles.dateOverdue : styles.date
                      }`}
                    >
                      {isOverdue && (
                        <HiOutlineExclamationTriangle className={styles.overdueIcon} />
                      )}
                      <span>
                        {isOverdue ? `Chờ ${days} ngày` : formatDate(item.ngayNop)}
                      </span>
                    </div>
                    {showStatusColumn && (
                      <div className={`${styles.cell} ${styles.colStatus}`}>
                        <StatusBadge
                          status="pending"
                          label={STATUS_CONFIG[item.trangThai]?.label || item.trangThai}
                          variant={STATUS_CONFIG[item.trangThai]?.variant || 'default'}
                          showIcon={false}
                          size="sm"
                        />
                      </div>
                    )}
                    <div className={`${styles.cell} ${styles.colAction}`}>
                      <Button
                        variant="primary"
                        size="sm"
                        leftIcon={<HiOutlineEye />}
                        onClick={() => handleOpenDetail(item.requestId)}
                      >
                        {userRole === 2 ? 'Xem & Xử lý' : 'Xem & Duyệt'}
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className={styles.pagination}>
            <div className={styles.pageInfo}>
              {displayTotal === 0
                ? 'Không có đơn nào'
                : `Hiển thị ${fromItem}-${toItem} trong tổng ${displayTotal} đơn`}
            </div>
            <div className={styles.pageNav}>
              <Button
                variant="secondary"
                size="sm"
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                leftIcon={<HiOutlineChevronLeft />}
              >
                Trước
              </Button>
              <span className={styles.pageNum}>
                {page} / {totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={page >= totalPages || loading}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                rightIcon={<HiOutlineChevronRight />}
              >
                Tiếp
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

XetDuyetPage.propTypes = {
  userRole: PropTypes.oneOf([1, 2, 3]),
};

export default XetDuyetPage;
