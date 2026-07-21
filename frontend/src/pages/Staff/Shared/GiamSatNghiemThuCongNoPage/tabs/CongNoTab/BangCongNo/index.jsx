import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import {
  HiOutlineMagnifyingGlass,
  HiOutlineFunnel,
  HiOutlineArrowPath,
  HiOutlineCheckCircle,
  HiOutlineXMark,
  HiOutlineBellAlert,
} from 'react-icons/hi2';
import { formatCurrency } from '@utils/formatters';
import congNoService from '@services/congNoService';
import DuyetXacNhanModal from '../DuyetXacNhanModal/index.jsx';
import styles from './index.module.scss';

const TRANG_THAI_KY_OPTIONS = [
  { value: '', label: 'Tat ca' },
  { value: 'Chua den han', label: 'Chua den han' },
  { value: 'Qua han', label: 'Qua han' },
  { value: 'Tra mot phan', label: 'Tra mot phan' },
  { value: 'Da tra', label: 'Da tra' },
];

const LOAI_HOTRO_OPTIONS = [
  { value: '', label: 'Tat ca' },
  { value: 'Cho vay', label: 'Cho vay' },
  { value: 'Tai tro co thu hoi', label: 'Co thu hoi' },
];

const TRANG_THAI_BADGES = {
  'Chua den han': { label: 'Chua den han', color: '#64748b', bg: '#f1f5f9' },
  'Qua han': { label: 'Qua han', color: '#dc2626', bg: 'rgba(220, 38, 38, 0.08)' },
  'Tra mot phan': { label: 'Tra mot phan', color: '#d97706', bg: 'rgba(217, 119, 6, 0.08)' },
  'Da tra': { label: 'Da tra', color: '#16a34a', bg: 'rgba(22, 163, 74, 0.08)' },
};

const XAC_NHAN_BADGES = {
  'Cho xac nhan': { label: 'Cho xac nhan', color: '#7c3aed', bg: 'rgba(124, 58, 237, 0.08)' },
  'Da xac nhan': { label: 'Da xac nhan', color: '#16a34a', bg: 'rgba(22, 163, 74, 0.08)' },
  'Bi tu choi': { label: 'Tu choi', color: '#dc2626', bg: 'rgba(220, 38, 38, 0.08)' },
};

const BangCongNo = ({ userRole }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    trangthaiKy: '', loaiHotro: '', quyId: '', search: '',
  });
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalRecords: 0 });

  const [selectedRow, setSelectedRow] = useState(null);
  const [showDuyetModal, setShowDuyetModal] = useState(false);

  const isKeToan = userRole === 2;

  const fetchData = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await congNoService.getDanhSach({ ...filters, page, limit: 15 });
      setData(res.data?.data || []);
      setPagination(res.data?.pagination || { currentPage: 1, totalPages: 1, totalRecords: 0 });
    } catch {
      toast.error('Khong tai duoc danh sach cong no');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDuyet = (row) => {
    setSelectedRow(row);
    setShowDuyetModal(true);
  };

  const handleReminder = async (row) => {
    try {
      await congNoService.sendReminder(row.lichtrano_id);
      toast.success(`Da gui nhac no toi ${row.nguoi_nhan_ten}`);
    } catch {
      toast.error('Khong gui duoc nhac no');
    }
  };

  const handleDuyetSuccess = () => {
    setShowDuyetModal(false);
    setSelectedRow(null);
    fetchData(pagination.currentPage);
  };

  return (
    <div className={styles.section}>
      {/* Filters */}
      <div className={styles.filterBar}>
        <div className={styles.filterGroup}>
          <HiOutlineFunnel size={14} className={styles.filterIcon} />
          <select
            className={styles.filterSelect}
            value={filters.trangthaiKy}
            onChange={(e) => setFilters((f) => ({ ...f, trangthaiKy: e.target.value }))}
          >
            {TRANG_THAI_KY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <select
            className={styles.filterSelect}
            value={filters.loaiHotro}
            onChange={(e) => setFilters((f) => ({ ...f, loaiHotro: e.target.value }))}
          >
            {LOAI_HOTRO_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div className={styles.searchBox}>
          <HiOutlineMagnifyingGlass size={14} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Tim theo ten nguoi nhan..."
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
          />
        </div>

        <button
          type="button"
          className={styles.refreshBtn}
          onClick={() => fetchData(pagination.currentPage)}
        >
          <HiOutlineArrowPath size={14} />
        </button>
      </div>

      {/* Table */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nguoi nhan</th>
              <th>Quy</th>
              <th>Loai</th>
              <th>Ky</th>
              <th>Ngay den han</th>
              <th>So tien phai tra</th>
              <th>Trang thai</th>
              <th>Minh chung</th>
              {isKeToan && <th>Hanh dong</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={isKeToan ? 9 : 8} className={styles.loadingCell}>Dang tai...</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={isKeToan ? 9 : 8} className={styles.emptyCell}>Khong co ky tra no nao</td></tr>
            ) : data.map((row) => {
              const ttBadge = TRANG_THAI_BADGES[row.trangthai] || TRANG_THAI_BADGES['Chua den han'];
              const xnBadge = XAC_NHAN_BADGES[row.trangthaixacnhan] || XAC_NHAN_BADGES['Cho xac nhan'];
              const soPhaiTra = Number(row.sotiengocphaitra) + Number(row.sotienlaiphaitra);
              const isOverdue = row.trangthai === 'Qua han';

              return (
                <tr key={row.lichtrano_id} className={isOverdue ? styles.rowOverdue : ''}>
                  <td>
                    <div className={styles.cellBold}>{row.nguoi_nhan_ten}</div>
                    <div className={styles.cellSub}>{row.nguoi_nhan_email}</div>
                  </td>
                  <td><span className={styles.cellQuy}>{row.tenquy}</span></td>
                  <td>
                    <span className={`${styles.loaiBadge} ${row.loaihotro === 'Cho vay' ? styles.loaiVay : styles.loaiThuHoi}`}>
                      {row.loaihotro === 'Cho vay' ? 'Vay von' : 'Co thu hoi'}
                    </span>
                  </td>
                  <td className={styles.cellCenter}>
                    <span className={styles.kyText}>{row.kythu}/{row.kyhandothang}</span>
                  </td>
                  <td className={styles.cellDate}>
                    <span className={isOverdue ? styles.textRed : ''}>
                      {new Date(row.ngaydenhan).toLocaleDateString('vi-VN')}
                    </span>
                  </td>
                  <td className={styles.cellAmount}>{formatCurrency(soPhaiTra)}</td>
                  <td>
                    <div className={styles.badgeCol}>
                      <span className={styles.ttBadge} style={{ color: ttBadge.color, background: ttBadge.bg }}>
                        {ttBadge.label}
                      </span>
                      <span className={styles.xnBadge} style={{ color: xnBadge.color, background: xnBadge.bg }}>
                        {xnBadge.label}
                      </span>
                    </div>
                  </td>
                  <td className={styles.cellCenter}>
                    {row.minhchungtrano ? (
                      <a href={row.minhchungtrano} target="_blank" rel="noopener noreferrer" className={styles.fileLink}>
                        Xem
                      </a>
                    ) : (
                      <span className={styles.noFile}>Chua nop</span>
                    )}
                  </td>
                  {isKeToan && (
                    <td>
                      <div className={styles.actionCol}>
                        {row.trangthaixacnhan === 'Cho xac nhan' && row.minhchungtrano && (
                          <button
                            type="button"
                            className={styles.duyetBtn}
                            onClick={() => handleDuyet(row)}
                          >
                            <HiOutlineCheckCircle size={13} />
                            <span>Duyet</span>
                          </button>
                        )}
                        {row.trangthaixacnhan === 'Cho xac nhan' && !row.minhchungtrano && row.trangthai === 'Qua han' && (
                          <button
                            type="button"
                            className={styles.nhacBtn}
                            onClick={() => handleReminder(row)}
                          >
                            <HiOutlineBellAlert size={13} />
                            <span>Nhac no</span>
                          </button>
                        )}
                      </div>
                    </td>
                  )}
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

      {/* Duyet modal */}
      {showDuyetModal && selectedRow && (
        <DuyetXacNhanModal
          data={selectedRow}
          onConfirm={handleDuyetSuccess}
          onClose={() => { setShowDuyetModal(false); setSelectedRow(null); }}
        />
      )}
    </div>
  );
};

BangCongNo.propTypes = {
  userRole: PropTypes.number,
};

export default BangCongNo;
