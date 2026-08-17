import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import {
  HiOutlineMagnifyingGlass,
  HiOutlineFunnel,
  HiOutlineEye,
  HiOutlineClipboardDocumentCheck,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
} from 'react-icons/hi2';
import { StatCard } from '@components/common/Card';
import congNoService from '@services/congNoService';
import styles from './index.module.scss';

const TRANG_THAI_OPTIONS = [
  { value: '', label: 'Tất cả' },
  { value: 'Da giai ngan', label: 'Chưa nghiệm thu' },
  { value: 'Cho nghiem thu', label: 'Đang chờ' },
  { value: 'Da nghiem thu', label: 'Đạt' },
  { value: 'Nghiem thu khong dat', label: 'Không đạt' },
  { value: 'Dang thu hoi no', label: 'Đang thu hồi nợ' },
  { value: 'Da giai ngan dot 1', label: 'Chưa nghiệm thu đợt 1' },
  { value: 'Cho nghiem thu dot 1', label: 'Đang chờ đợt 1' },
  { value: 'Da nghiem thu dot 1', label: 'Đạt đợt 1' },
  { value: 'Cho giai ngan dot 2', label: 'Chờ giải ngân đợt 2' },
];

const LOAI_KIEM_TRA_OPTIONS = [
  { value: '', label: 'Tất cả' },
  { value: 'Kiem tra tien do', label: 'Kiểm tra tiến độ' },
  { value: 'Nghiem thu cuoi cung', label: 'Nghiệm thu cuối cùng' },
];

const KET_QUA_MAP = {
  'Cho danh gia': { label: 'Chờ đánh giá', color: '#94a3b8' },
  'Dat': { label: 'Đạt', color: '#16a34a' },
  'Dat co dieu chinh': { label: 'Đạt có điều chỉnh', color: '#2563eb' },
  'Khong dat': { label: 'Không đạt', color: '#dc2626' },
};

const TRANG_THAI_MAP = {
  'Da giai ngan': 'Chưa nghiệm thu',
  'Cho nghiem thu': 'Đang chờ',
  'Da nghiem thu': 'Đạt',
  'Nghiem thu khong dat': 'Không đạt',
  'Dang thu hoi no': 'Đang thu hồi nợ',
  'Da giai ngan dot 1': 'Chưa nghiệm thu đợt 1',
  'Cho nghiem thu dot 1': 'Đang chờ đợt 1',
  'Da nghiem thu dot 1': 'Đạt đợt 1',
  'Cho giai ngan dot 2': 'Chờ giải ngân đợt 2',
};

const NghiemThuTab = ({ userRole }) => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ trangthaiNT: '', loaiKiemTra: '', quyId: '', search: '' });
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalRecords: 0 });

  const [tongQuan, setTongQuan] = useState(null);
  const [loadingTongQuan, setLoadingTongQuan] = useState(true);

  const isKeToan = userRole === 2;
  const isBKS = userRole === 5;
  const canThaoTac = !isKeToan && !isBKS;

  useEffect(() => {
    let mounted = true;
    setLoadingTongQuan(true);
    congNoService.getNghiemThuTongQuan()
      .then((res) => {
        if (mounted) setTongQuan(res.data?.data || null);
      })
      .catch(() => {
        if (mounted) toast.error('Khong tai duoc tong quan nghiem thu');
      })
      .finally(() => {
        if (mounted) setLoadingTongQuan(false);
      });
    return () => { mounted = false; };
  }, []);

  const fetchData = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await congNoService.getNghiemThuList({ ...filters, page, limit: 15 });
      setData(res.data?.data || []);
      setPagination(res.data?.pagination || { currentPage: 1, totalPages: 1, totalRecords: 0 });
    } catch {
      toast.error('Khong tai duoc danh sach nghiem thu');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleViewDetail = (item) => {
    navigate(`/giam-sat/nghiem-thu/${item.yeucauhotro_id}`);
  };

  const SUMMARY_CARDS = tongQuan ? [
    { key: 'tongDon', label: 'Tong don nghiem thu', icon: HiOutlineClipboardDocumentCheck, iconBgColor: 'blue', value: tongQuan.tongDon },
    { key: 'dangCho', label: 'Dang cho nghiem thu', icon: HiOutlineClock, iconBgColor: 'yellow', value: tongQuan.dangCho },
    { key: 'dat', label: 'Da dat nghiem thu', icon: HiOutlineCheckCircle, iconBgColor: 'green', value: tongQuan.dat },
    { key: 'khongDat', label: 'Khong dat', icon: HiOutlineXCircle, iconBgColor: 'red', value: tongQuan.khongDat },
  ] : [];

  return (
    <div className={styles.tabContent}>
      {/* Summary cards */}
      {loadingTongQuan ? (
        <div className={styles.loadingBox}>Dang tai tong quan...</div>
      ) : tongQuan && (
        <div className={styles.summaryGrid}>
          {SUMMARY_CARDS.map((card) => (
            <StatCard
              key={card.key}
              title={card.label}
              value={card.value}
              icon={<card.icon size={28} />}
              iconBgColor={card.iconBgColor}
            />
          ))}
        </div>
      )}

      {/* Filters */}
      <div className={styles.filterBar}>
        <div className={styles.filterGroup}>
          <HiOutlineFunnel size={14} className={styles.filterIcon} />
          <select
            className={styles.filterSelect}
            value={filters.trangthaiNT}
            onChange={(e) => setFilters((f) => ({ ...f, trangthaiNT: e.target.value }))}
          >
            {TRANG_THAI_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <select
            className={styles.filterSelect}
            value={filters.loaiKiemTra}
            onChange={(e) => setFilters((f) => ({ ...f, loaiKiemTra: e.target.value }))}
          >
            {LOAI_KIEM_TRA_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div className={styles.searchBox}>
          <HiOutlineMagnifyingGlass size={14} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Tim kiem ten nguoi nhan..."
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
          />
        </div>
      </div>

      {/* Table */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nguoi nhan</th>
              <th>Quy</th>
              <th>Loai hinh</th>
              <th>Lan nghiem thu</th>
              <th>Ket qua</th>
              <th>Ngay</th>
              <th>Hanh dong</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className={styles.loadingCell}>Dang tai...</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={7} className={styles.emptyCell}>Khong co don nao can nghiem thu</td></tr>
            ) : data.map((item) => {
              const trangThai = TRANG_THAI_MAP[item.trangthai] || item.trangthai;
              const ketQuaCfg = KET_QUA_MAP[item.ket_qua_gan_nhat] || KET_QUA_MAP['Cho danh gia'];
              return (
                <tr key={item.yeucauhotro_id}>
                  <td>
                    <div className={styles.cellBold}>{item.nguoi_nhan_ten}</div>
                    <div className={styles.cellSub}>{item.nguoi_nhan_email}</div>
                  </td>
                  <td><span className={styles.cellQuy}>{item.tenquy}</span></td>
                  <td>
                    <span className={`${styles.loaiBadge} ${item.loaihotro === 'Cho vay' ? styles.loaiVay : item.loaihotro === 'Tai tro co thu hoi' ? styles.loaiThuHoi : ''}`}>
                      {item.loaihotro === 'Tai tro khong hoan lai' ? 'Khong hoan lai' : item.loaihotro === 'Tai tro co thu hoi' ? 'Co thu hoi' : 'Cho vay'}
                    </span>
                  </td>
                  <td className={styles.cellCenter}>
                    {item.lan_gan_nhat ? `${item.lan_gan_nhat}/${item.tong_lan_nghiem_thu}` : '—'}
                  </td>
                  <td>
                    <span className={styles.ketQuaBadge} style={{ color: ketQuaCfg.color, background: `${ketQuaCfg.color}12` }}>
                      {ketQuaCfg.label}
                    </span>
                  </td>
                  <td className={styles.cellDate}>
                    {item.ngay_nghiem_thu_gan_nhat
                      ? new Date(item.ngay_nghiem_thu_gan_nhat).toLocaleDateString('vi-VN')
                      : item.ngaynop ? new Date(item.ngaynop).toLocaleDateString('vi-VN') : '—'}
                  </td>
                  <td>
                    <button
                      type="button"
                      className={styles.viewBtn}
                      onClick={() => handleViewDetail(item)}
                    >
                      <HiOutlineEye size={14} />
                      <span>Xem</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className={styles.pagination}>
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              type="button"
              className={`${styles.pageBtn} ${p === pagination.currentPage ? styles.pageBtnActive : ''}`}
              onClick={() => fetchData(p)}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

NghiemThuTab.propTypes = {
  userRole: PropTypes.number,
};

export default NghiemThuTab;
