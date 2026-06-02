import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import api from '@services/api';
import PheDuyetStats from './sections/PheDuyetStats';
import PheDuyetFilter from './sections/PheDuyetFilter';
import PheDuyetTable from './sections/PheDuyetTable';
import PheDuyetDetailModal from './sections/PheDuyetDetailModal';
import styles from './PheDuyetPage.module.scss';

const PAGE_SIZE = 15;

const PheDuyetPage = () => {
  // State
  const [stats, setStats] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    keyword: '',
    loai_nguon: '',
    cap_do_duyet: '',
    ket_qua: '',
    nguoi_duyet_id: '',
    tu_ngay: '',
    den_ngay: '',
  });
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [approverOptions, setApproverOptions] = useState([]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const res = await api.get('/pheduyet/stats');
      setStats(res.data.data);
    } catch (error) {
      console.error('Lỗi fetch stats:', error);
      toast.error('Không tải được thống kê');
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Fetch approvers
  const fetchApprovers = useCallback(async () => {
    try {
      const res = await api.get('/pheduyet/approvers');
      setApproverOptions(
        res.data.data.map((a) => ({
          value: a.user_id,
          label: `${a.ho_ten} — ${a.ten_vai_tro}`,
        }))
      );
    } catch (error) {
      console.error('Lỗi fetch approvers:', error);
    }
  }, []);

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/pheduyet', {
        params: { ...filters, page, limit: PAGE_SIZE },
      });
      setData(res.data.data);
      setTotal(res.data.pagination.totalRecords);
    } catch (error) {
      console.error('Lỗi fetch data:', error);
      toast.error('Không tải được danh sách phê duyệt');
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  // Initial load
  useEffect(() => {
    Promise.all([fetchStats(), fetchApprovers()]);
  }, [fetchStats, fetchApprovers]);

  // Fetch data when filters/page change
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [filters]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className={styles.page}>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>Trang chủ / Lịch sử phê duyệt</div>

      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Lịch sử phê duyệt</h1>
          <p className={styles.subtitle}>
            Tra cứu toàn bộ chuỗi xét duyệt của hệ thống
          </p>
        </div>
        <div className={styles.badge}>{total.toLocaleString('vi-VN')} bản ghi</div>
      </div>

      {/* Stats Cards */}
      <PheDuyetStats stats={stats} loading={statsLoading} />

      {/* Filters */}
      <PheDuyetFilter
        filters={filters}
        approverOptions={approverOptions}
        onChange={setFilters}
      />

      {/* Table */}
      <PheDuyetTable
        data={data}
        loading={loading}
        onViewDetail={setSelectedRecord}
      />

      {/* Pagination */}
      <div className={styles.pagination}>
        <p>
          Trang {page} / {totalPages} - Tổng {total.toLocaleString('vi-VN')} bản ghi
        </p>
      </div>

      {/* Detail Modal */}
      {selectedRecord && (
        <PheDuyetDetailModal
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
        />
      )}
    </div>
  );
};

export default PheDuyetPage;
