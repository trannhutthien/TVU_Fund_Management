import { useState, useEffect } from 'react';
import { HiArrowUpTray, HiDocumentArrowDown } from 'react-icons/hi2';
import Button from '@components/common/Button/Button';
import DSStatsSection from './sections/DSStatsSection';
import DSFilterSection from './sections/DSFilterSection';
import DSTableSection from './sections/DSTableSection';
import DSDetailDrawer from './sections/DSDetailDrawer';
import DSImportModal from './sections/DSImportModal';
import DSExportModal from './sections/DSExportModal';
import styles from './DoiSoatChungTuPage.module.scss';

// ═══════════════════════════════════════════════════════════════════════════════
// ─── ĐỐI SOÁT CHỨNG TỪ PAGE ───────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
// CÔNG DỤNG: Kiểm tra và xác minh tính hợp lệ của các giao dịch
// ROUTE: /ke-toan/doi-soat-chung-tu
// ROLE: 2 (Kế toán)
// ═══════════════════════════════════════════════════════════════════════════════

const DoiSoatChungTuPage = () => {
  // ─── STATE ─────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('can_doi_soat'); // 'can_doi_soat' | 'da_doi_soat' | 'bat_thuong'
  const [filterLoai, setFilterLoai] = useState(''); // '' | 'Thu' | 'Chi'
  const [filterDateRange, setFilterDateRange] = useState({ from: '', to: '' });
  const [filterQuy, setFilterQuy] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [list, setList] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(15);
  const [isLoading, setIsLoading] = useState(true);
  const [statsData, setStatsData] = useState({
    chuaDoiSoat: 0,
    daDoiSoat: 0,
    batThuong: 0,
    tiLeHoanThanh: 0,
  });
  const [selectedGiaoDich, setSelectedGiaoDich] = useState(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quyOptions, setQuyOptions] = useState([]);

  // ─── FETCH QUY OPTIONS ─────────────────────────────────────────────────────
  useEffect(() => {
    const fetchQuyOptions = async () => {
      try {
        // TODO: Gọi API GET /api/quy
        // const response = await api.get('/api/quy');
        // setQuyOptions(response.data.data);
        
        // Mock data
        setQuyOptions([
          { quy_id: 1, ten_quy: 'Quỹ Học bổng' },
          { quy_id: 2, ten_quy: 'Quỹ Khó khăn' },
        ]);
      } catch (error) {
        console.error('Lỗi fetch quy options:', error);
      }
    };

    fetchQuyOptions();
  }, []);

  // ─── FETCH STATS ───────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // TODO: Gọi API GET /api/statistics/ketoan/doi-soat-stats
        // const response = await api.get('/api/statistics/ketoan/doi-soat-stats');
        // setStatsData(response.data.data);
        
        // Mock data
        setStatsData({
          chuaDoiSoat: 45,
          daDoiSoat: 120,
          batThuong: 8,
          tiLeHoanThanh: 72,
        });
      } catch (error) {
        console.error('Lỗi fetch stats:', error);
      }
    };

    fetchStats();
  }, []);

  // ─── FETCH LIST ────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchList = async () => {
      try {
        setIsLoading(true);
        
        // TODO: Gọi API GET /api/giaodich với params
        // const params = {
        //   doi_soat_trang_thai: activeTab === 'can_doi_soat' ? 'Chua_doi_soat' : activeTab === 'da_doi_soat' ? 'Da_doi_soat' : 'Bat_thuong',
        //   loai: filterLoai,
        //   quy_id: filterQuy,
        //   from: filterDateRange.from,
        //   to: filterDateRange.to,
        //   keyword: searchKeyword,
        //   page: currentPage,
        //   limit: pageSize,
        //   sort: 'created_at_desc',
        // };
        // const response = await api.get('/api/giaodich', { params });
        // setList(response.data.data);
        // setTotalCount(response.data.total);
        
        // Mock data
        setList([
          {
            transaction_id: 1,
            loai: 'Chi',
            so_tien: 5000000,
            ngay_giao_dich: '2025-05-20',
            ten_quy: 'Quỹ Học bổng',
            ho_ten: 'Nguyễn Văn A',
            ma_so_dinh_danh: '2021001',
            trang_thai: 'Thanh cong',
            doi_soat_trang_thai: 'Chua_doi_soat',
            minh_chung_url: null,
          },
          {
            transaction_id: 2,
            loai: 'Thu',
            so_tien: 10000000,
            ngay_giao_dich: '2025-05-18',
            ten_quy: 'Quỹ Khó khăn',
            ten_nha_tai_tro: 'Vingroup',
            trang_thai: 'Thanh cong',
            doi_soat_trang_thai: 'Chua_doi_soat',
            minh_chung_url: '/uploads/proofs/proof_123.pdf',
          },
        ]);
        setTotalCount(45);
      } catch (error) {
        console.error('Lỗi fetch list:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchList();
  }, [activeTab, filterLoai, filterDateRange, filterQuy, searchKeyword, currentPage, pageSize]);

  // ─── HANDLERS ──────────────────────────────────────────────────────────────
  const handleViewDetail = (giaoDich) => {
    setSelectedGiaoDich(giaoDich);
    setShowDrawer(true);
  };

  const handleDoiSoat = async (item) => {
    try {
      setIsSubmitting(true);
      // TODO: Gọi API PATCH /api/giaodich/:id/doi-soat
      console.log('Đối soát:', item.transaction_id);
      alert('Đã đối soát thành công');
      // Refresh list + stats
    } catch (error) {
      console.error('Lỗi đối soát:', error);
      alert('Có lỗi xảy ra');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGanCo = async (item) => {
    try {
      setIsSubmitting(true);
      // TODO: Gọi API PATCH /api/giaodich/:id/doi-soat
      console.log('Gắn cờ bất thường:', item.transaction_id);
      alert('Đã gắn cờ bất thường');
      // Refresh list + stats
    } catch (error) {
      console.error('Lỗi gắn cờ:', error);
      alert('Có lỗi xảy ra');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResolve = async (item) => {
    try {
      setIsSubmitting(true);
      // TODO: Gọi API PATCH /api/giaodich/:id/doi-soat
      console.log('Resolve bất thường:', item.transaction_id);
      alert('Đã xử lý, chuyển sang Đã đối soát');
      // Refresh list + stats
    } catch (error) {
      console.error('Lỗi resolve:', error);
      alert('Có lỗi xảy ra');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveFlag = async (item) => {
    try {
      setIsSubmitting(true);
      // TODO: Gọi API PATCH /api/giaodich/:id/doi-soat
      console.log('Xóa flag:', item.transaction_id);
      alert('Đã xóa flag bất thường');
      // Refresh list + stats
    } catch (error) {
      console.error('Lỗi xóa flag:', error);
      alert('Có lỗi xảy ra');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImportSaoKe = async (file) => {
    try {
      // TODO: Gọi API POST /api/giaodich/import-sao-ke
      // const formData = new FormData();
      // formData.append('file', file);
      // const response = await api.post('/api/giaodich/import-sao-ke', formData);
      // return response.data;
      
      console.log('Import sao kê:', file);
      return {
        matched: [],
        unmatched_in_file: [],
        unmatched_in_db: [],
      };
    } catch (error) {
      console.error('Lỗi import sao kê:', error);
      throw error;
    }
  };

  // ─── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div className={styles.page}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <h1 className={styles.pageTitle}>Đối soát chứng từ</h1>
          <p className={styles.pageSubtitle}>
            Kiểm tra và xác minh tính hợp lệ của các giao dịch
          </p>
        </div>
        <div className={styles.headerRight}>
          <Button
            variant="outline"
            leftIcon={<HiArrowUpTray />}
            onClick={() => setShowImportModal(true)}
          >
            Nhập sao kê
          </Button>
          <Button
            variant="primary"
            leftIcon={<HiDocumentArrowDown />}
            onClick={() => setShowExportModal(true)}
          >
            Xuất biên bản
          </Button>
        </div>
      </div>

      {/* Stats Section */}
      <DSStatsSection statsData={statsData} />

      {/* Filter Section */}
      <DSFilterSection
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        filterLoai={filterLoai}
        setFilterLoai={setFilterLoai}
        filterDateRange={filterDateRange}
        setFilterDateRange={setFilterDateRange}
        filterQuy={filterQuy}
        setFilterQuy={setFilterQuy}
        searchKeyword={searchKeyword}
        setSearchKeyword={setSearchKeyword}
        quyOptions={quyOptions}
        statsData={statsData}
      />

      {/* Table Section */}
      <DSTableSection
        list={list}
        isLoading={isLoading}
        totalCount={totalCount}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onViewDetail={handleViewDetail}
        activeTab={activeTab}
        onDoiSoat={handleDoiSoat}
        onGanCo={handleGanCo}
        onResolve={handleResolve}
        onRemoveFlag={handleRemoveFlag}
      />

      {/* Detail Drawer */}
      {showDrawer && (
        <DSDetailDrawer
          giaoDich={selectedGiaoDich}
          onClose={() => setShowDrawer(false)}
          onDoiSoat={handleDoiSoat}
          onGanCo={handleGanCo}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Import Modal */}
      {showImportModal && (
        <DSImportModal
          onClose={() => setShowImportModal(false)}
          onImport={handleImportSaoKe}
        />
      )}

      {/* Export Modal */}
      {showExportModal && (
        <DSExportModal
          onClose={() => setShowExportModal(false)}
          activeTab={activeTab}
          filterLoai={filterLoai}
          filterDateRange={filterDateRange}
          filterQuy={filterQuy}
        />
      )}
    </div>
  );
};

export default DoiSoatChungTuPage;
