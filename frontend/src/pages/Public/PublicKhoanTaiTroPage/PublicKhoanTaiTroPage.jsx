import { useState, useEffect, useCallback, useMemo } from 'react';
import api from '@services/api';
import PublicHeader from '@components/layout/PublicHeader/PublicHeader';
import PublicFooter from '@components/layout/PublicFooter/PublicFooter';
import { formatCurrency, formatDate } from '@utils/formatters';
import styles from './PublicKhoanTaiTroPage.module.scss';

const PAGE_SIZE = 15;

const DONOR_TYPE_LABELS = {
  'Ca nhan': 'Cá nhân',
  'To chuc': 'Tổ chức',
  'Doanh nghiep': 'Doanh nghiệp',
  'Doi tac': 'Đối tác',
};

const DONOR_TYPE_KEYS = ['Ca nhan', 'To chuc', 'Doanh nghiep', 'Doi tac'];

const DONOR_TYPE_CLASS = {
  'Ca nhan': styles.caNhan,
  'To chuc': styles.toChuc,
  'Doanh nghiep': styles.doanhNghiep,
  'Doi tac': styles.doiTac,
};

const PublicKhoanTaiTroPage = () => {
  const [list, setList] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const [searchKeyword, setSearchKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [filterQuy, setFilterQuy] = useState('');
  const [filterLoaiNTT, setFilterLoaiNTT] = useState('');

  const [quyOptions, setQuyOptions] = useState([]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedKeyword(searchKeyword.trim()), 500);
    return () => clearTimeout(t);
  }, [searchKeyword]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedKeyword, filterQuy, filterLoaiNTT]);

  useEffect(() => {
    let mounted = true;
    api
      .get('/funds/public')
      .then((res) => {
        if (!mounted) return;
        const funds = res.data?.funds || res.data?.data?.funds || res.data?.data || [];
        setQuyOptions(
          funds.map((f) => ({
            value: String(f.quyId || f.quy_id),
            label: f.tenQuy || f.ten_quy,
          })),
        );
      })
      .catch(() => setQuyOptions([]));
    return () => {
      mounted = false;
    };
  }, []);

  const filterParams = useMemo(
    () => ({
      keyword: debouncedKeyword || undefined,
      quy_id: filterQuy || undefined,
      loai_ntt: filterLoaiNTT || undefined,
    }),
    [debouncedKeyword, filterQuy, filterLoaiNTT],
  );

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/donations/public', {
        params: {
          ...filterParams,
          page: currentPage,
          page_size: PAGE_SIZE,
        },
      });
      setList(res.data?.data || []);
      setTotalCount(res.data?.pagination?.totalRecords || 0);
    } catch (err) {
      console.error('Lỗi tải khoản tài trợ công khai:', err);
      setList([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [filterParams, currentPage]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleClearFilters = () => {
    setSearchKeyword('');
    setFilterQuy('');
    setFilterLoaiNTT('');
  };

  const hasFilter = !!debouncedKeyword || !!filterQuy || !!filterLoaiNTT;

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalCount / PAGE_SIZE)),
    [totalCount],
  );

  const pageNumbers = useMemo(() => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = start + maxVisible - 1;
    if (end > totalPages) {
      end = totalPages;
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }, [currentPage, totalPages]);

  return (
    <div className={styles.page}>
      <PublicHeader />
      <div className={styles.container}>
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.title}>Khoản tài trợ đã phê duyệt</h1>
            <p className={styles.subtitle}>
              Danh sách các khoản tài trợ đã được Ban Cán sự phê duyệt
            </p>
          </div>
        </div>

        <div className={styles.filters}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Tìm nhà tài trợ..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
          <select
            className={styles.select}
            value={filterQuy}
            onChange={(e) => setFilterQuy(e.target.value)}
          >
            <option value="">Tất cả quỹ</option>
            {quyOptions.map((q) => (
              <option key={q.value} value={q.value}>
                {q.label}
              </option>
            ))}
          </select>
          <select
            className={styles.select}
            value={filterLoaiNTT}
            onChange={(e) => setFilterLoaiNTT(e.target.value)}
          >
            <option value="">Tất cả loại</option>
            {DONOR_TYPE_KEYS.map((key) => (
              <option key={key} value={key}>
                {DONOR_TYPE_LABELS[key]}
              </option>
            ))}
          </select>
          {hasFilter && (
            <button className={styles.clearBtn} onClick={handleClearFilters}>
              Xoá bộ lọc
            </button>
          )}
        </div>

        <div className={styles.tableWrapper}>
          {isLoading ? (
            <div className={styles.loadingWrapper}>
              <div className={styles.spinner} />
            </div>
          ) : list.length === 0 ? (
            <div className={styles.empty}>Không có khoản tài trợ nào</div>
          ) : (
            <>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th style={{ width: 50 }}>STT</th>
                    <th>Nhà tài trợ</th>
                    <th>Loại</th>
                    <th>Số tiền</th>
                    <th>Quỹ</th>
                    <th>Ngày</th>
                    <th>Trạng thái</th>
                    <th>Ghi chú</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((item, index) => (
                    <tr key={item.id}>
                      <td className={styles.stt}>
                        {(currentPage - 1) * PAGE_SIZE + index + 1}
                      </td>
                      <td>
                        <div className={styles.donorCell}>
                          {item.logo && (
                            <img
                              src={item.logo}
                              alt={item.tenNhaTaiTro}
                              className={styles.logo}
                            />
                          )}
                          <span className={styles.donorName}>{item.tenNhaTaiTro}</span>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`${styles.typeBadge} ${DONOR_TYPE_CLASS[item.loaiNhaTaiTro] || ''}`}
                        >
                          {DONOR_TYPE_LABELS[item.loaiNhaTaiTro] || item.loaiNhaTaiTro}
                        </span>
                      </td>
                      <td className={styles.amount}>{formatCurrency(item.soTien)}</td>
                      <td>
                        <span className={styles.fundBadge}>{item.tenQuy}</span>
                      </td>
                      <td className={styles.date}>
                        {formatDate(item.ngayQuyenGop)}
                      </td>
                      <td>
                        <span className={styles.statusBadge}>Đã phê duyệt</span>
                      </td>
                      <td className={styles.note}>{item.ghiChu}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {totalPages > 1 && (
                <div className={styles.pagination}>
                  <button
                    className={styles.pageBtn}
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    &lsaquo;
                  </button>
                  {pageNumbers.map((p) => (
                    <button
                      key={p}
                      className={`${styles.pageBtn} ${p === currentPage ? styles.active : ''}`}
                      onClick={() => setCurrentPage(p)}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    className={styles.pageBtn}
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    &rsaquo;
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <PublicFooter />
    </div>
  );
};

export default PublicKhoanTaiTroPage;
