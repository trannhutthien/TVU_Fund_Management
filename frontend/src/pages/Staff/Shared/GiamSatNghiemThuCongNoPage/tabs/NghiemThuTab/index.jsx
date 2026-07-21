import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { HiOutlineMagnifyingGlass, HiOutlineFunnel, HiOutlineEye } from 'react-icons/hi2';
import congNoService from '@services/congNoService';
import nghiemThuService from '@services/nghiemThuService';
import NghiemThuTimeline from '@pages/Staff/CanBo/XetDuyetPage/XetDuyetDetail/NghiemThuSection/NghiemThuTimeline';
import NghiemThuFormModal from '@pages/Staff/CanBo/XetDuyetPage/XetDuyetDetail/NghiemThuSection/NghiemThuFormModal';
import styles from './index.module.scss';

const TRANG_THAI_OPTIONS = [
  { value: '', label: 'Tat ca' },
  { value: 'Da giai ngan', label: 'Chua nghiem thu' },
  { value: 'Cho nghiem thu', label: 'Dang cho' },
  { value: 'Da nghiem thu', label: 'Dat' },
  { value: 'Nghiem thu khong dat', label: 'Khong dat' },
];

const LOAI_KIEM_TRA_OPTIONS = [
  { value: '', label: 'Tat ca' },
  { value: 'Kiem tra tien do', label: 'Kiem tra tien do' },
  { value: 'Nghiem thu cuoi cung', label: 'Nghiem thu cuoi cung' },
];

const KET_QUA_MAP = {
  'Cho danh gia': { label: 'Cho danh gia', color: '#94a3b8' },
  'Dat': { label: 'Dat', color: '#16a34a' },
  'Dat co dieu chinh': { label: 'Dat co dieu chinh', color: '#2563eb' },
  'Khong dat': { label: 'Khong dat', color: '#dc2626' },
};

const TRANG_THAI_MAP = {
  'Da giai ngan': 'Chua nghiem thu',
  'Cho nghiem thu': 'Dang cho',
  'Da nghiem thu': 'Dat',
  'Nghiem thu khong dat': 'Khong dat',
};

const NghiemThuTab = ({ userRole }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ trangthaiNT: '', loaiKiemTra: '', quyId: '', search: '' });
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalRecords: 0 });

  const [selectedApp, setSelectedApp] = useState(null);
  const [history, setHistory] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const isKeToan = userRole === 2;
  const isBKS = userRole === 5;
  const canThaoTac = !isKeToan && !isBKS;

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

  const handleViewDetail = async (item) => {
    setSelectedApp(item);
    try {
      const res = await nghiemThuService.getInspectionHistory(item.yeucauhotro_id);
      setHistory(res?.data?.lichSuNghiemThu || []);
    } catch {
      setHistory([]);
    }
    setShowModal(true);
  };

  return (
    <div className={styles.tabContent}>
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

      {/* Modal */}
      {showModal && selectedApp && (
        <NghiemThuFormModal
          yeucauhotroId={selectedApp.yeucauhotro_id}
          existingHistory={history}
          onClose={() => { setShowModal(false); setSelectedApp(null); }}
          onSuccess={() => {
            fetchData(pagination.currentPage);
            setShowModal(false);
            setSelectedApp(null);
          }}
        />
      )}
    </div>
  );
};

NghiemThuTab.propTypes = {
  userRole: PropTypes.number,
};

export default NghiemThuTab;
