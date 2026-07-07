import React, { useState } from 'react';
import {
  BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  HiOutlineChartBar, HiOutlineCalendarDays,
  HiOutlineDocumentArrowDown, HiOutlinePrinter,
  HiOutlineLightBulb, HiOutlineCheckBadge
} from 'react-icons/hi2';
import Button from '@components/common/Button/Button';
import api from '@services/api';
import useAdminBaoCaoData from './useAdminBaoCaoData';
import styles from './AdminBaoCaoPage.module.scss';

const TABS = [
  { id: 'tong_quan', label: 'Tổng quan & Hiệu suất' },
  { id: 'so_sanh', label: 'So sánh Quỹ & Nhà tài trợ' },
  { id: 'ke_toan', label: 'Báo cáo Tài chính (Kế toán)' },
  { id: 'can_bo', label: 'Báo cáo Nghiệp vụ (Cán bộ)' },
  { id: 'chien_luoc', label: 'Chiến lược & Xuất bản' },
];

const CHART_COLORS = ['#1a2f5e', '#0891b2', '#7c3aed', '#f0a500', '#10b981', '#ef4444', '#64748b'];

const formatCurrency = (val) => {
  if (val === null || val === undefined) return '0 đ';
  return Number(val).toLocaleString('vi-VN') + ' đ';
};

const AdminBaoCaoPage = () => {
  const [activeTab, setActiveTab] = useState('tong_quan');
  const {
    loading,
    advancedStats,
    financialStats,
    funds,
    year,
    setYear,
  } = useAdminBaoCaoData('year');

  const [selectedTypes, setSelectedTypes] = useState(['thu_chi_tong_hop']);
  const [exportFormat, setExportFormat] = useState('xlsx');
  const [exporting, setExporting] = useState(false);

  const EXPORT_REPORT_TYPES = [
    { id: 'thu_chi_tong_hop', label: 'Báo cáo Thu Chi Tổng hợp' },
    { id: 'danh_sach_nha_tai_tro', label: 'Danh sách Nhà tài trợ' },
    { id: 'danh_sach_thu_huong', label: 'Danh sách Sinh viên Thụ hưởng' },
    { id: 'bao_cao_quy', label: 'Báo cáo Tình hình các Quỹ' },
    { id: 'bao_cao_nguoi_dung', label: 'Báo cáo Tổng hợp Người dùng' },
    { id: 'bao_cao_de_xuat', label: 'Báo cáo Đề xuất Hỗ trợ' },
  ];

  const handleTypeToggle = (type) => {
    setSelectedTypes(prev => {
      if (prev.includes(type)) {
        if (prev.length === 1) return prev; // Yêu cầu chọn ít nhất 1 loại
        return prev.filter(t => t !== type);
      } else {
        return [...prev, type];
      }
    });
  };

  // Xử lý tải báo cáo Word/Excel từ backend
  const handleExport = async () => {
    if (selectedTypes.length === 0) {
      alert("Vui lòng chọn ít nhất một loại báo cáo!");
      return;
    }
    try {
      setExporting(true);
      const isMulti = selectedTypes.length > 1;
      const res = await api.post('/bao-cao/xuat', {
        loai_bao_cao: selectedTypes,
        quy_id: null,
        tu_ngay: `${year}-01-01`,
        den_ngay: `${year}-12-31`,
        dinh_dang: exportFormat
      }, { responseType: 'blob' });

      let blobType;
      let fileExtension;

      if (isMulti) {
        blobType = 'application/zip';
        fileExtension = 'zip';
      } else {
        blobType = exportFormat === 'docx' 
          ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        fileExtension = exportFormat;
      }

      const blob = new Blob([res.data], { type: blobType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const fileName = isMulti
        ? `BaoCao_TongHop_${year}.${fileExtension}`
        : `BaoCao_${selectedTypes[0]}_${year}.${fileExtension}`;
        
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Lỗi xuất báo cáo:', error);
    } finally {
      setExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading && !advancedStats) {
    return <div className={styles.loading}>Đang tải dữ liệu thống kê toàn hệ thống...</div>;
  }

  // Chuẩn bị dữ liệu cho biểu đồ tròn Phân bổ Quỹ
  const fundPieData = funds.map(f => ({
    name: f.tenQuy || f.ten_quy || 'Quỹ',
    value: parseFloat(f.soDu || f.so_du || 0)
  })).filter(item => item.value > 0);

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        {/* Breadcrumb */}
        <div className={styles.breadcrumb}>
          <span>Trang chủ</span>
          <span className={styles.breadcrumbSep}>/</span>
          <span className={styles.breadcrumbActive}>Thống kê & Báo cáo nâng cao</span>
        </div>

        {/* Page Header */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>
              <HiOutlineChartBar />
            </div>
            <div>
              <h1 className={styles.title}>Thống kê & Báo cáo nâng cao</h1>
              <p className={styles.subtitle}>
                Báo cáo tổng hợp tài chính, phê duyệt hồ sơ và phân tích chiến lược năm {year}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <div className={styles.yearSelector}>
              <HiOutlineCalendarDays />
              <label htmlFor="year-select">Năm báo cáo:</label>
              <select
                id="year-select"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
              >
                <option value={2026}>2026</option>
                <option value={2025}>2025</option>
                <option value={2024}>2024</option>
              </select>
            </div>
            
            <Button variant="outline" onClick={handlePrint} leftIcon={<HiOutlinePrinter size={16} />}>
              In báo cáo (PDF)
            </Button>
          </div>
        </header>

        {/* Tab Controls */}
        <div className={styles.tabBar}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`${styles.tabBtn} ${activeTab === tab.id ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ─── TAB 1: TỔNG QUAN & HIỆU SUẤT (ADMIN) ─────────────────────────────────── */}
        {activeTab === 'tong_quan' && (
          <div>
            {/* KPIs Grid */}
            <div className={styles.kpiGrid}>
              <div className={styles.kpiCard} style={{ '--theme-color': '#1a2f5e' }}>
                <span className={styles.kpiLabel}>Quỹ phát triển ĐH Trà Vinh</span>
                <span className={styles.kpiVal}>{formatCurrency(advancedStats?.duBao?.quyPhatTrien)}</span>
                <span className={styles.kpiSub}>Quỹ mẹ - Tap trung - Be chung</span>
              </div>
              <div className={styles.kpiCard} style={{ '--theme-color': '#f0a500' }}>
                <span className={styles.kpiLabel}>Quỹ hoạt động</span>
                <span className={styles.kpiVal}>{formatCurrency(advancedStats?.duBao?.hoatDong)}</span>
                <span className={styles.kpiSub}>Các quỹ con - Tap trung - Muc chi</span>
              </div>
              <div className={styles.kpiCard} style={{ '--theme-color': '#0891b2' }}>
                <span className={styles.kpiLabel}>Doanh thu tài trợ (Thu)</span>
                <span className={styles.kpiVal}>{formatCurrency(financialStats?.summaryData?.tongThu)}</span>
                <span className={styles.kpiSub}>Tổng thu trong năm {year}</span>
              </div>
              <div className={styles.kpiCard} style={{ '--theme-color': '#ef4444' }}>
                <span className={styles.kpiLabel}>Giải ngân hỗ trợ (Chi)</span>
                <span className={styles.kpiVal}>{formatCurrency(financialStats?.summaryData?.tongChi)}</span>
                <span className={styles.kpiSub}>Tổng chi trong năm {year}</span>
              </div>
              <div className={styles.kpiCard} style={{ '--theme-color': '#7c3aed' }}>
                <span className={styles.kpiLabel}>Tỷ lệ duyệt thành công</span>
                <span className={styles.kpiVal}>{advancedStats?.hieuSuat?.tyLeThanhCong || 0}%</span>
                <span className={styles.kpiSub}>Thời gian xử lý: {advancedStats?.hieuSuat?.thoiGianXuLy || 0} ngày/hồ sơ</span>
              </div>
            </div>

            {/* Charts Section */}
            <div className={styles.chartRow}>
              {/* Dòng tiền Thu Chi */}
              <div className={styles.chartCard}>
                <h3 className={styles.chartTitle}>Biểu đồ Xu hướng Dòng tiền (Thu - Chi)</h3>
                <div className={styles.chartContent}>
                  <ResponsiveContainer width="100%" height={320}>
                    <AreaChart data={financialStats?.cashflowData || []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorThu" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0891b2" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#0891b2" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorChi" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="thang" />
                      <YAxis tickFormatter={(val) => `${(val / 1000000).toFixed(0)}M`} />
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                      <Legend />
                      <Area type="monotone" dataKey="thu" name="Doanh thu (Thu)" stroke="#0891b2" fillOpacity={1} fill="url(#colorThu)" />
                      <Area type="monotone" dataKey="chi" name="Giải ngân (Chi)" stroke="#ef4444" fillOpacity={1} fill="url(#colorChi)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Cơ cấu loại Quỹ */}
              <div className={styles.chartCard}>
                <h3 className={styles.chartTitle}>Cơ cấu Số dư các Quỹ</h3>
                <div className={styles.chartContent}>
                  <ResponsiveContainer width="100%" height={320}>
                    <PieChart>
                      <Pie
                        data={fundPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {fundPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Báo cáo theo Khoa/Ngành */}
            <div className={styles.tableCard}>
              <div className={styles.tableHeader}>
                <h3 className={styles.tableTitle}>Báo cáo Thống kê Hỗ trợ theo Khoa / Ngành</h3>
              </div>
              <div className={styles.chartRow}>
                <div style={{ minHeight: '300px', display: 'flex', alignItems: 'center' }}>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={advancedStats?.khoaStats || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="khoa" />
                      <YAxis tickFormatter={(val) => `${(val / 1000000).toFixed(0)}M`} />
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                      <Legend />
                      <Bar dataKey="tongTien" name="Tổng tiền giải ngân" fill="#1a2f5e" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className={styles.tableWrapper}>
                  <table className={styles.reportTable}>
                    <thead>
                      <tr>
                        <th>STT</th>
                        <th>Khoa / Phòng Ban</th>
                        <th>Số đơn nhận</th>
                        <th>Tổng tiền hỗ trợ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(advancedStats?.khoaStats || []).map((k, idx) => (
                        <tr key={idx}>
                          <td>{idx + 1}</td>
                          <td><strong>{k.khoa}</strong></td>
                          <td>{k.soDonNhan} đơn</td>
                          <td style={{ color: '#dc2626', fontWeight: 600 }}>{formatCurrency(k.tongTien)}</td>
                        </tr>
                      ))}
                      {(advancedStats?.khoaStats || []).length === 0 && (
                        <tr>
                          <td colSpan={4} style={{ textAlign: 'center' }}>Chưa ghi nhận số liệu hỗ trợ theo khoa nào</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 2: SO SÁNH QUỸ & NHÀ TÀI TRỢ (ADMIN) ─────────────────────────────── */}
        {activeTab === 'so_sanh' && (
          <div>
            {/* So sánh Quỹ */}
            <div className={styles.tableCard}>
              <div className={styles.tableHeader}>
                <h3 className={styles.tableTitle}>So sánh hiệu quả vận hành giữa các Quỹ chủ quản</h3>
              </div>
              <div className={styles.tableWrapper}>
                <table className={styles.reportTable}>
                  <thead>
                    <tr>
                      <th>STT</th>
                      <th>Tên quỹ hỗ trợ</th>
                      <th>Số dư còn lại</th>
                      <th>Tổng nhận tài trợ</th>
                      <th>Tổng chi giải ngân</th>
                      <th>Số đơn hoàn thành</th>
                      <th>Tỷ lệ giải ngân</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(advancedStats?.fundComparison || []).map((f, idx) => (
                      <tr key={idx}>
                        <td>{idx + 1}</td>
                        <td><strong>{f.ten}</strong></td>
                        <td>{formatCurrency(f.soDu)}</td>
                        <td style={{ color: '#16a34a', fontWeight: 500 }}>{formatCurrency(f.tongThu)}</td>
                        <td style={{ color: '#dc2626', fontWeight: 500 }}>{formatCurrency(f.tongChi)}</td>
                        <td>{f.soDonHoTro} sinh viên</td>
                        <td>
                          <span style={{ 
                            fontWeight: 600, 
                            color: f.tyLeGiaiNgan > 70 ? '#dc2626' : (f.tyLeGiaiNgan > 40 ? '#d97706' : '#16a34a')
                          }}>
                            {f.tyLeGiaiNgan}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Phân tích Nhà tài trợ */}
            <div className={styles.twoColRow}>
              {/* Bảng Top nhà tài trợ */}
              <div className={styles.tableCard}>
                <h3 className={styles.tableTitle}>Top 10 Nhà tài trợ đóng góp lớn nhất</h3>
                <div className={styles.tableWrapper} style={{ marginTop: '16px' }}>
                  <table className={styles.reportTable}>
                    <thead>
                      <tr>
                        <th>STT</th>
                        <th>Tên nhà tài trợ</th>
                        <th>Phân loại</th>
                        <th>Số lần đóng góp</th>
                        <th>Tổng tiền đóng góp</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(advancedStats?.topDonors || []).map((d, idx) => (
                        <tr key={idx}>
                          <td>{idx + 1}</td>
                          <td><strong>{d.ten}</strong></td>
                          <td>{d.loai === 'To chuc' ? 'Tổ chức' : (d.loai === 'Ca nhan' ? 'Cá nhân' : 'Doanh nghiệp')}</td>
                          <td>{d.soLan} lần</td>
                          <td style={{ color: '#16a34a', fontWeight: 600 }}>{formatCurrency(d.tongTien)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Biểu đồ xu hướng tài trợ */}
              <div className={styles.chartCard}>
                <h3 className={styles.chartTitle}>Cơ cấu quy mô tài trợ (Top Nhà tài trợ)</h3>
                <div className={styles.chartContent}>
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={advancedStats?.topDonors || []} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" tickFormatter={(val) => `${(val / 1000000).toFixed(0)}M`} />
                      <YAxis dataKey="ten" type="category" width={80} />
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                      <Bar dataKey="tongTien" name="Đóng góp" fill="#0891b2" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 3: BÁO CÁO TÀI CHÍNH (KẾ TOÁN) ───────────────────────────────────── */}
        {activeTab === 'ke_toan' && (
          <div>
            {/* Thu chi Breakdown */}
            <div className={styles.twoColRow}>
              <div className={styles.tableCard}>
                <h3 className={styles.tableTitle} style={{ color: '#16a34a' }}>Cơ cấu các khoản Thu (Nhận tài trợ)</h3>
                <div className={styles.tableWrapper} style={{ marginTop: '16px' }}>
                  <table className={styles.reportTable}>
                    <thead>
                      <tr>
                        <th>STT</th>
                        <th>Danh mục / Nguồn thu</th>
                        <th>Số giao dịch</th>
                        <th>Tổng tiền thu</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(financialStats?.breakdownThuData || []).map((t, idx) => (
                        <tr key={idx}>
                          <td>{idx + 1}</td>
                          <td><strong>{t.name || t.loaiQuy}</strong></td>
                          <td>{t.soLuongQuy || t.count || 1} khoản</td>
                          <td style={{ color: '#16a34a', fontWeight: 600 }}>{formatCurrency(t.soDu || t.value || t.tien)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className={styles.tableCard}>
                <h3 className={styles.tableTitle} style={{ color: '#dc2626' }}>Cơ cấu các khoản Chi (Giải ngân hỗ trợ)</h3>
                <div className={styles.tableWrapper} style={{ marginTop: '16px' }}>
                  <table className={styles.reportTable}>
                    <thead>
                      <tr>
                        <th>STT</th>
                        <th>Danh mục quỹ chi trả</th>
                        <th>Số lượng đơn</th>
                        <th>Tổng tiền chi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(financialStats?.breakdownChiData || []).map((c, idx) => (
                        <tr key={idx}>
                          <td>{idx + 1}</td>
                          <td><strong>{c.name || c.tenQuy}</strong></td>
                          <td>{c.count || c.soDon || 0} đơn</td>
                          <td style={{ color: '#dc2626', fontWeight: 600 }}>{formatCurrency(c.value || c.soTien || c.tongChi)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Chi tiết từng giao dịch */}
            <div className={styles.tableCard}>
              <div className={styles.tableHeader}>
                <h3 className={styles.tableTitle}>Sổ quỹ & Chi tiết từng giao dịch giải ngân</h3>
              </div>
              <div className={styles.tableWrapper}>
                <table className={styles.reportTable}>
                  <thead>
                    <tr>
                      <th>STT</th>
                      <th>Họ tên sinh viên</th>
                      <th>Mã sinh viên</th>
                      <th>Quỹ hỗ trợ</th>
                      <th>Số tiền giải ngân</th>
                      <th>Ngày giải ngân</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(financialStats?.rows || []).map((r, idx) => (
                      <tr key={idx}>
                        <td>{idx + 1}</td>
                        <td><strong>{r.ho_ten}</strong></td>
                        <td>{r.mssv}</td>
                        <td>{r.ten_quy}</td>
                        <td style={{ color: '#dc2626', fontWeight: 600 }}>{r.so_tien}</td>
                        <td>{r.ngay_giai_ngan}</td>
                      </tr>
                    ))}
                    {(financialStats?.rows || []).length === 0 && (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center' }}>Không ghi nhận giao dịch tài chính nào trong kỳ này</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 4: BÁO CÁO NGHIỆP VỤ (CÁN BỘ) ────────────────────────────────────── */}
        {activeTab === 'can_bo' && (
          <div>
            {/* Tiến độ phê duyệt */}
            <div className={styles.tableCard}>
              <h3 className={styles.tableTitle}>Tiến độ phê duyệt hồ sơ hỗ trợ sinh viên</h3>
              <div className={styles.row2} style={{ marginTop: '20px' }}>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={[
                    { name: 'Chờ duyệt', value: advancedStats?.trangThaiDon?.choDuyet || 0 },
                    { name: 'Đang xử lý', value: advancedStats?.trangThaiDon?.dangXuLy || 0 },
                    { name: 'Chờ giải ngân', value: advancedStats?.trangThaiDon?.choGiaiNgan || 0 },
                    { name: 'Đã giải ngân', value: advancedStats?.trangThaiDon?.daGiaiNgan || 0 },
                    { name: 'Từ chối', value: advancedStats?.trangThaiDon?.tuChoi || 0 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" name="Số lượng đơn" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Danh sách sinh viên được hỗ trợ */}
            <div className={styles.tableCard}>
              <div className={styles.tableHeader}>
                <h3 className={styles.tableTitle}>Danh sách sinh viên được hỗ trợ gần đây</h3>
              </div>
              <div className={styles.tableWrapper}>
                <table className={styles.reportTable}>
                  <thead>
                    <tr>
                      <th>STT</th>
                      <th>Họ tên sinh viên</th>
                      <th>Mã sinh viên</th>
                      <th>Quỹ hỗ trợ</th>
                      <th>Số tiền giải ngân</th>
                      <th>Ngày giải ngân</th>
                      <th>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(financialStats?.rows || []).slice(0, 10).map((r, idx) => (
                      <tr key={idx}>
                        <td>{idx + 1}</td>
                        <td><strong>{r.ho_ten}</strong></td>
                        <td>{r.mssv}</td>
                        <td>{r.ten_quy}</td>
                        <td style={{ color: '#dc2626', fontWeight: 600 }}>{r.so_tien}</td>
                        <td>{r.ngay_giai_ngan}</td>
                        <td>
                          <span style={{ 
                            padding: '4px 8px', 
                            borderRadius: '20px', 
                            fontSize: '12px',
                            fontWeight: 500,
                            backgroundColor: '#e0f2fe',
                            color: '#0369a1' 
                          }}>
                            Đã giải ngân
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 5: CHIẾN LƯỢC & XUẤT BẢN ────────────────────────────────────────── */}
        {activeTab === 'chien_luoc' && (
          <div>
            {/* Báo cáo chiến lược */}
            <div className={styles.strategyCard}>
              <div className={styles.cardHeader}>
                <HiOutlineLightBulb size={24} style={{ color: '#f0a500' }} />
                <h3 className={styles.cardTitle}>Phân tích chiến lược & Đề xuất chính sách quỹ</h3>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Tổng số dư quỹ toàn hệ thống:</span>
                <span className={styles.statVal}>{formatCurrency(advancedStats?.duBao?.totalBalance)}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>- Quỹ phát triển ĐH Trà Vinh:</span>
                <span className={styles.statVal}>{formatCurrency(advancedStats?.duBao?.quyPhatTrien)}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>- Quỹ hoạt động:</span>
                <span className={styles.statVal}>{formatCurrency(advancedStats?.duBao?.hoatDong)}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Chi tiêu trung bình mỗi tháng (3 tháng qua):</span>
                <span className={styles.statVal}>{formatCurrency(advancedStats?.duBao?.avgSpend)}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Thời gian dự trữ ngân sách còn lại:</span>
                <span className={styles.statVal} style={{ 
                  color: advancedStats?.duBao?.remainingMonths < 3 ? '#dc2626' : (advancedStats?.duBao?.remainingMonths < 6 ? '#d97706' : '#16a34a')
                }}>
                  {advancedStats?.duBao?.remainingMonths === 99 ? 'Không xác định' : `${advancedStats?.duBao?.remainingMonths} tháng`}
                </span>
              </div>

              {/* Hộp khuyến nghị */}
              <div className={`${styles.recBox} ${styles[advancedStats?.duBao?.warningLevel || 'normal']}`}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px', fontWeight: 700 }}>
                  <HiOutlineCheckBadge size={20} />
                  <span>KHUYẾN NGHỊ CHÍNH SÁCH</span>
                </div>
                <p>{advancedStats?.duBao?.recommendation}</p>
              </div>
            </div>

            {/* Bảng điều khiển xuất báo cáo */}
            <div className={styles.exportPanel}>
              <div className={styles.exportLeft}>
                <h3 className={styles.exportTitle}>Lập báo cáo & Xuất bản tài liệu chính thức</h3>
                <p className={styles.exportDesc}>
                  Chọn loại dữ liệu và định dạng để trích xuất báo cáo trình lên Ban Giám hiệu trường Đại học Trà Vinh. Dữ liệu sẽ tự động điền theo các mẫu hành chính có sẵn.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '24px', width: '100%' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#94a3b8' }}>1. Chọn các loại báo cáo cần xuất (tải file ZIP nếu chọn nhiều loại)</span>
                    <div className={styles.checkboxGrid}>
                      {EXPORT_REPORT_TYPES.map((item) => (
                        <label key={item.id} className={styles.checkboxLabel}>
                          <input
                            type="checkbox"
                            checked={selectedTypes.includes(item.id)}
                            onChange={() => handleTypeToggle(item.id)}
                          />
                          <span>{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxWidth: '280px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#94a3b8' }}>2. Định dạng tệp tin</span>
                    <select
                      value={exportFormat}
                      onChange={(e) => setExportFormat(e.target.value)}
                      style={{ 
                        padding: '10px 14px', 
                        borderRadius: '8px', 
                        border: '1px solid #4b5d86', 
                        backgroundColor: '#1e293b', 
                        color: '#ffffff',
                        fontSize: '14px',
                        width: '100%',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="xlsx">Microsoft Excel (.xlsx)</option>
                      <option value="docx">Microsoft Word (.docx)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className={styles.exportActions}>
                <Button 
                  variant="primary" 
                  onClick={handleExport} 
                  disabled={exporting}
                  leftIcon={<HiOutlineDocumentArrowDown size={18} />}
                  style={{ backgroundColor: '#f0a500', color: '#1a2f5e', border: 'none', fontWeight: 700 }}
                >
                  {exporting ? 'Đang trích xuất...' : 'Tải xuống Báo cáo'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBaoCaoPage;
