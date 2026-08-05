import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  HiOutlineMagnifyingGlass,
  HiOutlineFunnel,
  HiOutlineArrowPath,
  HiOutlineEye,
} from 'react-icons/hi2';
import { formatCurrency } from '@utils/formatters';
import congNoService from '@services/congNoService';
import styles from './index.module.scss';

const LOAI_HOTRO_OPTIONS = [
  { value: '', label: 'Tat ca' },
  { value: 'Cho vay', label: 'Cho vay' },
  { value: 'Tai tro co thu hoi', label: 'Co thu hoi' },
];

const TRANG_THAI_KY_OPTIONS = [
  { value: '', label: 'Tat ca ky' },
  { value: 'Qua han', label: 'Co ky qua han' },
  { value: 'Cho xac nhan', label: 'Co ky cho xac nhan' },
];

const BangCongNo = ({ userRole }) => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    trangthaiKy: '', loaiHotro: '', search: '',
  });
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalRecords: 0 });

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

  const handleViewDetail = (row) => {
    navigate(`/giam-sat/cong-no/${row.yeucauhotro_id}`, {
      state: {
        hopdongId: row.hopdongvayvon_id,
        tenNguoiNhan: row.nguoi_nhan_ten,
      },
    });
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
              <th>Tien vay</th>
              <th>Tong no</th>
              <th>Ky qua han</th>
              <th>Ngay den han</th>
              <th>Trang thai</th>
              <th>Hanh dong</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} className={styles.loadingCell}>Dang tai...</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={9} className={styles.emptyCell}>Khong co hop dong cong no nao</td></tr>
            ) : data.map((row) => {
              const hasOverdue = Number(row.kyQuaHan) > 0;
              const hasPending = Number(row.kyChoXacNhan) > 0;
              const allPaid = Number(row.kyDaTra) === Number(row.tongSoKy);
              const ngayDenHan = row.ngayDenHanGanNhat
                ? new Date(row.ngayDenHanGanNhat).toLocaleDateString('vi-VN')
                : '--';

              return (
                <tr key={row.hopdongvayvon_id} className={hasOverdue ? styles.rowOverdue : ''}>
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
                  <td className={styles.cellAmount}>{formatCurrency(row.sotienvon)}</td>
                  <td className={styles.cellAmount}>
                    <span style={{ color: Number(row.tongNo) > 0 ? '#dc2626' : '#16a34a' }}>
                      {formatCurrency(row.tongNo)}
                    </span>
                  </td>
                  <td className={styles.cellCenter}>
                    {hasOverdue ? (
                      <span className={styles.textRed}>{row.kyQuaHan}/{row.tongSoKy}</span>
                    ) : (
                      <span>0/{row.tongSoKy}</span>
                    )}
                  </td>
                  <td className={styles.cellDate}>
                    <span className={hasOverdue ? styles.textRed : ''}>{ngayDenHan}</span>
                  </td>
                  <td>
                    <div className={styles.badgeCol}>
                      {allPaid ? (
                        <span className={styles.ttBadge} style={{ color: '#16a34a', background: 'rgba(22, 163, 74, 0.08)' }}>
                          Da tat toan
                        </span>
                      ) : hasOverdue ? (
                        <span className={styles.ttBadge} style={{ color: '#dc2626', background: 'rgba(22, 38, 38, 0.08)' }}>
                          Qua han
                        </span>
                      ) : hasPending ? (
                        <span className={styles.ttBadge} style={{ color: '#7c3aed', background: 'rgba(124, 58, 237, 0.08)' }}>
                          Cho xac nhan
                        </span>
                      ) : (
                        <span className={styles.ttBadge} style={{ color: '#64748b', background: '#f1f5f9' }}>
                          Dang tra
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className={styles.actionCol}>
                      <button
                        type="button"
                        className={styles.duyetBtn}
                        onClick={() => handleViewDetail(row)}
                      >
                        <HiOutlineEye size={13} />
                        <span>Chi tiet</span>
                      </button>
                    </div>
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

BangCongNo.propTypes = {
  userRole: PropTypes.number,
};

export default BangCongNo;
