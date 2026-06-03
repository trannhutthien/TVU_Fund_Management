import { useState, useEffect, useCallback } from 'react';
import { HiOutlineClipboardDocumentList, HiOutlineArrowDownTray } from 'react-icons/hi2';
import Button from '@components/common/Button';
import api from '@services/api';
import NhatKyStats from './NhatKyStats';
import NhatKyFilter from './NhatKyFilter';
import NhatKyTable from './NhatKyTable';
import NhatKyDetailDrawer from './NhatKyDetailDrawer';
import styles from './NhatKyPage.module.scss';

const PAGE_SIZE = 20;

const NhatKyPage = () => {
  // ─── STATE ─────────────────────────────────────────────────────────────────
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    keyword: '',
    hanh_dong: '',
    loai_doi_tuong: '',
    nguoi_dung_id: '',
    tu_ngay: '',
    den_ngay: '',
  });
  const [staffOptions, setStaffOptions] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);

  // ─── FETCH ON MOUNT (STATS & STAFF OPTIONS) ───────────────────────────────
  useEffect(() => {
    const fetchMetadata = async () => {
      setLoadingStats(true);
      try {
        const [statsRes, staffRes] = await Promise.all([
          api.get('/nhat-ky/stats').catch(() => ({ data: { success: false } })),
          api.get('/nguoidung?role_id=1,2,3').catch(() => ({ data: { success: false } })),
        ]);

        if (statsRes.data?.success) {
          setStats(statsRes.data.stats);
        }
        if (staffRes.data?.success) {
          setStaffOptions(
            (staffRes.data.data || []).map((staff) => ({
              value: staff.user_id || staff.id || staff.nguoidung_id,
              label: `${staff.ho_ten} — ${staff.ten_vai_tro || 'Nhân viên'}`,
            }))
          );
        }
      } catch (error) {
        console.error('Lỗi tải dữ liệu metadata nhật ký:', error);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchMetadata();
  }, []);

  // ─── FETCH LOGS ON FILTER OR PAGE CHANGE ───────────────────────────────────
  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/nhat-ky', {
        params: {
          keyword: filters.keyword,
          hanh_dong: filters.hanh_dong,
          loai_doi_tuong: filters.loai_doi_tuong,
          nguoi_dung_id: filters.nguoi_dung_id,
          tu_ngay: filters.tu_ngay,
          den_ngay: filters.den_ngay,
          page: page,
          page_size: PAGE_SIZE,
          sort: 'createdat_desc',
        },
      });

      if (response.data?.success) {
        setLogs(response.data.logs || []);
        // API response format has pagination meta:
        const totalRecords = response.data.pagination?.total || response.data.logs?.length || 0;
        setTotal(totalRecords);
      }
    } catch (error) {
      console.error('Lỗi tải danh sách nhật ký:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // ─── EXCEL EXPORT ─────────────────────────────────────────────────────────
  const handleExportExcel = async () => {
    try {
      const response = await api.get('/nhat-ky/export', {
        params: {
          keyword: filters.keyword,
          hanh_dong: filters.hanh_dong,
          loai_doi_tuong: filters.loai_doi_tuong,
          nguoi_dung_id: filters.nguoi_dung_id,
          tu_ngay: filters.tu_ngay,
          den_ngay: filters.den_ngay,
        },
        responseType: 'blob',
      });

      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `NhatKyHeThong_${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error('Lỗi khi xuất Excel nhật ký:', error);
    }
  };

  // ─── PAGINATION VALUES ────────────────────────────────────────────────────
  const startRecord = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const endRecord = Math.min(page * PAGE_SIZE, total);
  const totalPages = Math.ceil(total / PAGE_SIZE) || 1;

  return (
    <div className={styles.container}>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <span>Trang chủ</span>
        <span className={styles.divider}>/</span>
        <span>Hệ thống & Phân quyền</span>
        <span className={styles.divider}>/</span>
        <span className={styles.active}>Nhật ký hệ thống</span>
      </div>

      {/* Page Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.iconBox}>
            <HiOutlineClipboardDocumentList size={24} />
          </div>
          <div>
            <h1 className={styles.title}>Nhật ký hệ thống</h1>
            <p className={styles.subtitle}>Theo dõi toàn bộ hoạt động trong hệ thống</p>
          </div>
        </div>
        <div className={styles.headerRight}>
          <Button
            variant="outline"
            leftIcon={<HiOutlineArrowDownTray size={16} />}
            onClick={handleExportExcel}
            className={styles.exportBtn}
          >
            Xuất Excel
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <NhatKyStats stats={stats} loading={loadingStats} />

      {/* Filters */}
      <NhatKyFilter
        filters={filters}
        staffOptions={staffOptions}
        onChange={(newFilters) => {
          setFilters(newFilters);
          setPage(1); // Reset to page 1 on filter
        }}
      />

      {/* Logs Table */}
      <NhatKyTable logs={logs} loading={loading} onViewDetail={setSelectedLog} />

      {/* Pagination */}
      {total > 0 && (
        <div className={styles.pagination}>
          <div className={styles.paginationInfo}>
            Hiển thị <strong>{startRecord}</strong>–<strong>{endRecord}</strong> trong{' '}
            <strong>{total}</strong> bản ghi
          </div>
          <div className={styles.paginationActions}>
            <Button
              variant="outline"
              size="small"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              ◀ Trước
            </Button>
            <span className={styles.pageNumber}>
              Trang {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="small"
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Tiếp ▶
            </Button>
          </div>
        </div>
      )}

      {/* Detail Drawer */}
      <NhatKyDetailDrawer log={selectedLog} onClose={() => setSelectedLog(null)} />
    </div>
  );
};

export default NhatKyPage;
