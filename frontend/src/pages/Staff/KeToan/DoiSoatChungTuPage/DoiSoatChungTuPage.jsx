import { useState, useEffect } from 'react';
import { HiArrowUpTray, HiDocumentArrowDown } from 'react-icons/hi2';
import Button from '@components/common/Button/Button';
import transactionService from '@services/transactionService';
import fundService from '@services/fundService';
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
        const response = await fundService.getPublicFunds();
        if (response.success && response.data) {
          setQuyOptions(response.data);
        }
      } catch (error) {
        console.error('Lỗi fetch quy options:', error);
        setQuyOptions([]);
      }
    };

    fetchQuyOptions();
  }, []);

  // ─── FETCH STATS ───────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await transactionService.getTransactionsSummary({
          loai: filterLoai || undefined,
          quyId: filterQuy || undefined,
          tuNgay: filterDateRange.from || undefined,
          denNgay: filterDateRange.to || undefined,
          keyword: searchKeyword || undefined,
        });
        
        if (response.success && response.data) {
          setStatsData({
            chuaDoiSoat: response.data.chuaDoiSoat || 0,
            daDoiSoat: response.data.daDoiSoat || 0,
            batThuong: response.data.batThuong || 0,
            tiLeHoanThanh: response.data.tiLeHoanThanh || 0,
          });
        }
      } catch (error) {
        console.error('Lỗi fetch stats:', error);
        setStatsData({
          chuaDoiSoat: 0,
          daDoiSoat: 0,
          batThuong: 0,
          tiLeHoanThanh: 0,
        });
      }
    };

    fetchStats();
  }, [filterLoai, filterQuy, filterDateRange, searchKeyword]);

  // ─── FETCH LIST ────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchList = async () => {
      try {
        setIsLoading(true);
        
        // Map activeTab to doi_soat_trang_thai
        let doiSoatTrangThai;
        if (activeTab === 'can_doi_soat') {
          doiSoatTrangThai = 'Chua_doi_soat';
        } else if (activeTab === 'da_doi_soat') {
          doiSoatTrangThai = 'Da_doi_soat';
        } else if (activeTab === 'bat_thuong') {
          doiSoatTrangThai = 'Bat_thuong';
        }
        
        const params = {
          doiSoatTrangThai,
          loai: filterLoai || undefined,
          quyId: filterQuy || undefined,
          tuNgay: filterDateRange.from || undefined,
          denNgay: filterDateRange.to || undefined,
          keyword: searchKeyword || undefined,
          page: currentPage,
          limit: pageSize,
        };
        
        const response = await transactionService.getAllTransactions(params);
        
        if (response.success) {
          // Map dữ liệu từ API sang format component expect
          const mappedData = (response.data || []).map(item => ({
            transaction_id: item.transactionId,
            loai: item.loai,
            so_tien: item.soTien,
            ngay_giao_dich: item.ngayGiaoDich,
            ten_quy: item.quy?.tenQuy,
            ho_ten: item.sinhVien?.hoTen,
            ma_so_dinh_danh: item.sinhVien?.maSoDinhDanh,
            ten_nha_tai_tro: item.khoanTaiTro?.nhaTaiTro?.ten,
            trang_thai: item.trangThai,
            doi_soat_trang_thai: item.doiSoatTrangThai,
            minh_chung_url: item.minhChung,
            ghi_chu: item.ghiChu,
            so_tien_thuc_te: item.soTienThucTe,
            doi_soat_luc: item.doiSoatLuc,
            doi_soat_ghi_chu: item.doiSoatGhiChu,
            doi_soat_boi_ten: item.doiSoatBoiTen,
          }));
          
          setList(mappedData);
          setTotalCount(response.pagination?.totalRecords || 0);
        }
      } catch (error) {
        console.error('Lỗi fetch list:', error);
        setList([]);
        setTotalCount(0);
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
      const transactionId = item.transaction_id || item.transactionId;
      await transactionService.updateDoiSoatStatus(transactionId, {
        doiSoatTrangThai: 'Da_doi_soat',
        soTienThucTe: item.so_tien_thuc_te !== undefined ? item.so_tien_thuc_te : (item.soTienThucTe !== undefined ? item.soTienThucTe : null),
        ghiChu: item.ghi_chu || item.ghiChu || '',
      });
      alert('Đã đối soát thành công');
      // Refresh list + stats
      window.location.reload();
    } catch (error) {
      console.error('Lỗi đối soát:', error);
      alert('Có lỗi xảy ra khi đối soát');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGanCo = async (item) => {
    try {
      setIsSubmitting(true);
      const transactionId = item.transaction_id || item.transactionId;
      await transactionService.updateDoiSoatStatus(transactionId, {
        doiSoatTrangThai: 'Bat_thuong',
        ghiChu: item.ghi_chu || item.ghiChu || '',
      });
      alert('Đã gắn cờ bất thường');
      // Refresh list + stats
      window.location.reload();
    } catch (error) {
      console.error('Lỗi gắn cờ:', error);
      alert('Có lỗi xảy ra khi gắn cờ');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResolve = async (item) => {
    try {
      setIsSubmitting(true);
      const transactionId = item.transaction_id || item.transactionId;
      await transactionService.updateDoiSoatStatus(transactionId, {
        doiSoatTrangThai: 'Da_doi_soat',
        ghiChu: item.ghi_chu || item.ghiChu || 'Đã xử lý bất thường',
      });
      alert('Đã xử lý, chuyển sang Đã đối soát');
      // Refresh list + stats
      window.location.reload();
    } catch (error) {
      console.error('Lỗi resolve:', error);
      alert('Có lỗi xảy ra khi xử lý');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveFlag = async (item) => {
    try {
      setIsSubmitting(true);
      const transactionId = item.transaction_id || item.transactionId;
      await transactionService.updateDoiSoatStatus(transactionId, {
        doiSoatTrangThai: 'Chua_doi_soat',
        ghiChu: '',
      });
      alert('Đã xóa flag bất thường');
      // Refresh list + stats
      window.location.reload();
    } catch (error) {
      console.error('Lỗi xóa flag:', error);
      alert('Có lỗi xảy ra khi xóa flag');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImportSaoKe = async (file) => {
    try {
      const response = await transactionService.importSaoKe(file);
      return response.data || {
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
            variant="secondary"
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
