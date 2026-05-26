import pool from "../config/db.js";

// ═══════════════════════════════════════════════════════════════════════════════
// ─── STATISTICS CONTROLLER (THỐNG KÊ) ─────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/statistics/public
// CÔNG DỤNG: Lấy thống kê tổng quan cho Landing Page (public, không cần auth)
// SỬ DỤNG Ở: HeroBanner, StatsSection
// ─────────────────────────────────────────────────────────────────────────────
export const getPublicStats = async (req, res) => {
  try {
    // ─────────────────────────────────────────────────────────────────────────
    // QUERY 1: Số yêu cầu đã hỗ trợ (trạng thái "Da giai ngan")
    // ─────────────────────────────────────────────────────────────────────────
    const [supportedRequestsResult] = await pool.query(
      `SELECT COUNT(*) as count 
       FROM YeuCauHoTro 
       WHERE trang_thai = 'Da giai ngan'`
    );
    const supportedRequests = supportedRequestsResult[0].count;

    // ─────────────────────────────────────────────────────────────────────────
    // QUERY 2: Tổng số tiền tất cả các quỹ
    // ─────────────────────────────────────────────────────────────────────────
    const [totalFundAmountResult] = await pool.query(
      `SELECT SUM(so_du) as total 
       FROM Quy`
    );
    const totalFundAmount = totalFundAmountResult[0].total || 0;

    // ─────────────────────────────────────────────────────────────────────────
    // QUERY 3: Tổng số nhà hỗ trợ (DISTINCT)
    // ─────────────────────────────────────────────────────────────────────────
    const [totalDonorsResult] = await pool.query(
      `SELECT COUNT(DISTINCT nha_tai_tro_id) as count 
       FROM NhaTaiTro`
    );
    const totalDonors = totalDonorsResult[0].count;

    // ─────────────────────────────────────────────────────────────────────────
    // QUERY 4: Tổng số quỹ đang hoạt động
    // ─────────────────────────────────────────────────────────────────────────
    const [totalFundsResult] = await pool.query(
      `SELECT COUNT(*) as count 
       FROM Quy 
       WHERE trang_thai = 'Dang hoat dong'`
    );
    const totalFunds = totalFundsResult[0].count;

    // ─────────────────────────────────────────────────────────────────────────
    // TRẢ VỀ KẾT QUẢ
    // ─────────────────────────────────────────────────────────────────────────
    return res.status(200).json({
      success: true,
      message: "Lấy thống kê thành công",
      data: {
        supportedRequests,
        totalFundAmount: parseFloat(totalFundAmount),
        totalDonors,
        totalFunds
      }
    });

  } catch (error) {
    console.error("Lỗi getPublicStats:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy thống kê",
      error: error.message
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/statistics/fund-breakdown
// CÔNG DỤNG: Lấy phân bổ ngân sách theo LOẠI QUỸ (GROUP BY loai_quy)
// SỬ DỤNG Ở: FundBreakdownSection
// ─────────────────────────────────────────────────────────────────────────────
export const getFundBreakdown = async (req, res) => {
  try {
    // ─────────────────────────────────────────────────────────────────────────
    // QUERY 1: Lấy tổng số dư tất cả quỹ đang hoạt động
    // ─────────────────────────────────────────────────────────────────────────
    const [totalResult] = await pool.query(
      `SELECT SUM(so_du) as total 
       FROM Quy 
       WHERE trang_thai = 'Dang hoat dong'`
    );
    const totalAmount = parseFloat(totalResult[0].total || 0);

    // ─────────────────────────────────────────────────────────────────────────
    // QUERY 2: Lấy tổng số dư theo LOẠI QUỸ (GROUP BY loai_quy)
    // Lấy TẤT CẢ, kể cả NULL hoặc rỗng
    // ─────────────────────────────────────────────────────────────────────────
    const [fundsByType] = await pool.query(
      `SELECT 
        COALESCE(loai_quy, 'Khac') as loai_quy,
        SUM(so_du) as total_so_du,
        COUNT(*) as so_luong_quy
       FROM Quy 
       WHERE trang_thai = 'Dang hoat dong'
       GROUP BY loai_quy
       ORDER BY total_so_du DESC`
    );

    // ─────────────────────────────────────────────────────────────────────────
    // Tính phần trăm cho từng loại quỹ
    // ─────────────────────────────────────────────────────────────────────────
    const fundsWithPercentage = fundsByType.map(fund => {
      const percentage = totalAmount > 0 
        ? Math.round((parseFloat(fund.total_so_du) / totalAmount) * 100) 
        : 0;
      
      return {
        loaiQuy: fund.loai_quy,
        soDu: parseFloat(fund.total_so_du),
        percentage: percentage,
        soLuongQuy: fund.so_luong_quy
      };
    });

    // ─────────────────────────────────────────────────────────────────────────
    // TRẢ VỀ KẾT QUẢ
    // ─────────────────────────────────────────────────────────────────────────
    return res.status(200).json({
      success: true,
      message: "Lấy thông tin phân bổ quỹ thành công",
      data: {
        totalAmount: totalAmount,
        funds: fundsWithPercentage
      }
    });

  } catch (error) {
    console.error("Lỗi getFundBreakdown:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy thông tin phân bổ quỹ",
      error: error.message
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/statistics/impact
// CÔNG DỤNG: Lấy thống kê tác động cho ImpactStatsSection (DonorsPage)
// ─────────────────────────────────────────────────────────────────────────────
export const getImpactStats = async (req, res) => {
  try {
    // ─────────────────────────────────────────────────────────────────────────
    // QUERY 1: Số sinh viên được hỗ trợ (COUNT DISTINCT user_id từ yeucauhotro với trang_thai = 'Da giai ngan')
    // ─────────────────────────────────────────────────────────────────────────
    const [studentsResult] = await pool.query(
      `SELECT COUNT(DISTINCT user_id) as count 
       FROM yeucauhotro 
       WHERE trang_thai = 'Da giai ngan'`
    );
    const totalStudents = studentsResult[0].count;

    // ─────────────────────────────────────────────────────────────────────────
    // QUERY 2: Tổng số tiền đã nhận (SUM so_tien từ khoantaitro với trang_thai = 'Da nhan')
    // ─────────────────────────────────────────────────────────────────────────
    const [disbursedResult] = await pool.query(
      `SELECT SUM(so_tien) as total 
       FROM khoantaitro 
       WHERE trang_thai = 'Da nhan'`
    );
    const totalDisbursed = parseFloat(disbursedResult[0].total || 0);

    // ─────────────────────────────────────────────────────────────────────────
    // QUERY 3: Tổng số nhà tài trợ (COUNT từ nhataitro)
    // ─────────────────────────────────────────────────────────────────────────
    const [donorsResult] = await pool.query(
      `SELECT COUNT(*) as count 
       FROM nhataitro`
    );
    const totalDonors = donorsResult[0].count;

    // ─────────────────────────────────────────────────────────────────────────
    // TRẢ VỀ KẾT QUẢ
    // ─────────────────────────────────────────────────────────────────────────
    return res.status(200).json({
      success: true,
      message: "Lấy thống kê tác động thành công",
      data: {
        totalStudents,
        totalDisbursed,
        totalDonors
      }
    });

  } catch (error) {
    console.error("Lỗi getImpactStats:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy thống kê tác động",
      error: error.message
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/statistics/ketoan/summary
// CÔNG DỤNG: 4 thẻ KPI cho KeToanDashboard
//  - tongThu: tổng giao dịch Thu thành công trong tháng hiện tại
//  - tongChi: tổng giao dịch Chi thành công trong tháng hiện tại
//  - choXacNhanThu: số khoản tài trợ trang_thai='Da duyet' chờ kế toán xác nhận
//  - choGiaiNgan: số đơn yeucauhotro trang_thai='Cho giai ngan'
// ─────────────────────────────────────────────────────────────────────────────
export const getKeToanSummary = async (req, res) => {
  try {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    const [[thuRow]] = await pool.query(
      `SELECT COALESCE(SUM(so_tien), 0) AS total
       FROM giaodich
       WHERE loai = 'Thu'
         AND trang_thai = 'Thanh cong'
         AND YEAR(ngay_giao_dich) = ?
         AND MONTH(ngay_giao_dich) = ?`,
      [year, month]
    );

    const [[chiRow]] = await pool.query(
      `SELECT COALESCE(SUM(so_tien), 0) AS total
       FROM giaodich
       WHERE loai = 'Chi'
         AND trang_thai = 'Thanh cong'
         AND YEAR(ngay_giao_dich) = ?
         AND MONTH(ngay_giao_dich) = ?`,
      [year, month]
    );

    const [[choXacNhanRow]] = await pool.query(
      `SELECT COUNT(*) AS total
       FROM khoantaitro
       WHERE trang_thai = 'Da duyet'`
    );

    const [[choGiaiNganRow]] = await pool.query(
      `SELECT COUNT(*) AS total
       FROM yeucauhotro
       WHERE trang_thai = 'Cho giai ngan'`
    );

    return res.status(200).json({
      success: true,
      message: "Lấy summary kế toán thành công",
      data: {
        tongThu: parseFloat(thuRow.total),
        tongChi: parseFloat(chiRow.total),
        choXacNhanThu: choXacNhanRow.total,
        choGiaiNgan: choGiaiNganRow.total,
        thang: month,
        nam: year,
      }
    });
  } catch (error) {
    console.error("Lỗi getKeToanSummary:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi lấy summary kế toán",
      error: error.message
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/statistics/ketoan/cashflow?months=6
// CÔNG DỤNG: dòng tiền N tháng gần nhất, mỗi tháng có thu + chi
// ─────────────────────────────────────────────────────────────────────────────
export const getKeToanCashflow = async (req, res) => {
  try {
    const months = Math.min(Math.max(parseInt(req.query.months) || 6, 1), 12);

    const [rows] = await pool.query(
      `SELECT
         DATE_FORMAT(ngay_giao_dich, '%Y-%m') AS thang_key,
         MONTH(ngay_giao_dich) AS thang,
         YEAR(ngay_giao_dich) AS nam,
         SUM(CASE WHEN loai = 'Thu' AND trang_thai = 'Thanh cong' THEN so_tien ELSE 0 END) AS thu,
         SUM(CASE WHEN loai = 'Chi' AND trang_thai = 'Thanh cong' THEN so_tien ELSE 0 END) AS chi
       FROM giaodich
       WHERE ngay_giao_dich >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
       GROUP BY thang_key, thang, nam
       ORDER BY thang_key ASC`,
      [months]
    );

    const map = new Map(rows.map((r) => [r.thang_key, r]));
    const result = [];
    const now = new Date();
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const r = map.get(key);
      result.push({
        thang: `T${d.getMonth() + 1}`,
        thangKey: key,
        thu: r ? parseFloat(r.thu) : 0,
        chi: r ? parseFloat(r.chi) : 0,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Lấy cashflow thành công",
      data: result,
    });
  } catch (error) {
    console.error("Lỗi getKeToanCashflow:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi lấy cashflow",
      error: error.message
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/statistics/ketoan/transaction-status
// CÔNG DỤNG: phân bổ giao dịch theo trạng thái (cho Donut chart)
// ─────────────────────────────────────────────────────────────────────────────
export const getKeToanTransactionStatus = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT trang_thai, COUNT(*) AS so_luong
       FROM giaodich
       GROUP BY trang_thai`
    );

    const COLOR_MAP = {
      'Thanh cong': '#f0a500',
      'Cho xu ly': '#93c5fd',
      'That bai': '#fca5a5',
      'Hoan tien': '#d1d5db',
    };
    const LABEL_MAP = {
      'Thanh cong': 'Thành công',
      'Cho xu ly': 'Chờ xử lý',
      'That bai': 'Thất bại',
      'Hoan tien': 'Hoàn tiền',
    };

    const data = rows.map((r) => ({
      key: r.trang_thai,
      name: LABEL_MAP[r.trang_thai] || r.trang_thai,
      value: r.so_luong,
      color: COLOR_MAP[r.trang_thai] || '#cbd5e1',
    }));

    return res.status(200).json({
      success: true,
      message: "Lấy phân bổ trạng thái giao dịch thành công",
      data,
    });
  } catch (error) {
    console.error("Lỗi getKeToanTransactionStatus:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi lấy phân bổ trạng thái",
      error: error.message
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/statistics/ketoan/recent-transactions?limit=10
// CÔNG DỤNG: 10 giao dịch gần nhất (đã format flat cho UI dashboard)
// ─────────────────────────────────────────────────────────────────────────────
export const getKeToanRecentTransactions = async (req, res) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 50);

    const [rows] = await pool.query(
      `SELECT
         gd.transaction_id,
         gd.loai,
         gd.so_tien,
         gd.trang_thai,
         gd.ghi_chu,
         gd.ngay_giao_dich,
         q.ten_quy
       FROM giaodich gd
       INNER JOIN quy q ON gd.quy_id = q.quy_id
       ORDER BY gd.ngay_giao_dich DESC
       LIMIT ?`,
      [limit]
    );

    const data = rows.map((tx) => ({
      transactionId: tx.transaction_id,
      loai: tx.loai,
      soTien: parseFloat(tx.so_tien),
      trangThai: tx.trang_thai,
      ghiChu: tx.ghi_chu,
      ngayGiaoDich: tx.ngay_giao_dich,
      tenQuy: tx.ten_quy,
    }));

    return res.status(200).json({
      success: true,
      message: "Lấy giao dịch gần nhất thành công",
      data,
    });
  } catch (error) {
    console.error("Lỗi getKeToanRecentTransactions:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi lấy giao dịch gần nhất",
      error: error.message
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/statistics/ketoan/fund-health
// CÔNG DỤNG: danh sách quỹ đang hoạt động kèm so_du, so_tien_toi_da
// ─────────────────────────────────────────────────────────────────────────────
export const getKeToanFundHealth = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
         quy_id,
         ten_quy,
         loai_quy,
         so_du,
         so_tien_toi_da,
         trang_thai
       FROM Quy
       WHERE trang_thai = 'Dang hoat dong'
       ORDER BY so_du ASC`
    );

    const data = rows.map((f) => ({
      quyId: f.quy_id,
      tenQuy: f.ten_quy,
      loaiQuy: f.loai_quy,
      soDu: parseFloat(f.so_du || 0),
      soTienToiDa: parseFloat(f.so_tien_toi_da || 0),
      trangThai: f.trang_thai,
    }));

    return res.status(200).json({
      success: true,
      message: "Lấy sức khỏe quỹ thành công",
      data,
    });
  } catch (error) {
    console.error("Lỗi getKeToanFundHealth:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi lấy sức khỏe quỹ",
      error: error.message
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/statistics/ketoan/pending-donations?limit=5
// CÔNG DỤNG: 5 khoản tài trợ trang_thai='Da duyet' đang chờ kế toán xác nhận
// ─────────────────────────────────────────────────────────────────────────────
export const getKeToanPendingDonations = async (req, res) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 5, 1), 20);

    const [rows] = await pool.query(
      `SELECT
         kt.khoan_tai_tro_id,
         kt.so_tien,
         kt.ngay_tai_tro,
         kt.trang_thai,
         ntt.ten_nha_tai_tro,
         q.ten_quy,
         q.quy_id
       FROM khoantaitro kt
       INNER JOIN nhataitro ntt ON kt.nha_tai_tro_id = ntt.nha_tai_tro_id
       INNER JOIN Quy q ON kt.quy_id = q.quy_id
       WHERE kt.trang_thai = 'Da duyet'
       ORDER BY kt.ngay_tai_tro DESC
       LIMIT ?`,
      [limit]
    );

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách chờ xác nhận thành công",
      data: rows,
    });
  } catch (error) {
    console.error("Lỗi getKeToanPendingDonations:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách chờ xác nhận",
      error: error.message
    });
  }
};

export default {
  getPublicStats,
  getFundBreakdown,
  getImpactStats,
  getKeToanSummary,
  getKeToanCashflow,
  getKeToanTransactionStatus,
  getKeToanRecentTransactions,
  getKeToanFundHealth,
  getKeToanPendingDonations,
};
