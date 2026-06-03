import pool from "../../config/db.js";

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
       FROM yeucauhotro 
       WHERE trangthai = 'Da giai ngan'`
    );
    const supportedRequests = supportedRequestsResult[0].count;

    // ─────────────────────────────────────────────────────────────────────────
    // QUERY 2: Tổng số tiền tất cả các quỹ
    // ─────────────────────────────────────────────────────────────────────────
    const [totalFundAmountResult] = await pool.query(
      `SELECT SUM(sodu) as total 
       FROM quy`
    );
    const totalFundAmount = totalFundAmountResult[0].total || 0;

    // ─────────────────────────────────────────────────────────────────────────
    // QUERY 3: Tổng số nhà hỗ trợ (DISTINCT)
    // ─────────────────────────────────────────────────────────────────────────
    const [totalDonorsResult] = await pool.query(
      `SELECT COUNT(DISTINCT nhataitro_id) as count 
       FROM nhataitro`
    );
    const totalDonors = totalDonorsResult[0].count;

    // ─────────────────────────────────────────────────────────────────────────
    // QUERY 4: Tổng số quỹ đang hoạt động
    // ─────────────────────────────────────────────────────────────────────────
    const [totalFundsResult] = await pool.query(
      `SELECT COUNT(*) as count 
       FROM quy 
       WHERE trangthai = 'Dang hoat dong'`
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
      `SELECT SUM(sodu) as total 
       FROM quy 
       WHERE trangthai = 'Dang hoat dong'`
    );
    const totalAmount = parseFloat(totalResult[0].total || 0);

    // ─────────────────────────────────────────────────────────────────────────
    // QUERY 2: Lấy tổng số dư theo LOẠI QUỸ (GROUP BY loai_quy)
    // Lấy TẤT CẢ, kể cả NULL hoặc rỗng
    // ─────────────────────────────────────────────────────────────────────────
    const [fundsByType] = await pool.query(
      `SELECT 
        COALESCE(lq.tenloai, 'Khac') as loai_quy,
        SUM(q.sodu) as total_so_du,
        COUNT(*) as so_luong_quy
       FROM quy q
       LEFT JOIN loaiquy lq ON q.loaiquy_id = lq.loaiquy_id
       WHERE q.trangthai = 'Dang hoat dong'
       GROUP BY lq.tenloai
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
    // QUERY 1: Số sinh viên được hỗ trợ (COUNT DISTINCT nguoidung_id từ yeucauhotro với trangthai = 'Da giai ngan')
    // ─────────────────────────────────────────────────────────────────────────
    const [studentsResult] = await pool.query(
      `SELECT COUNT(DISTINCT nguoidung_id) as count 
       FROM yeucauhotro 
       WHERE trangthai = 'Da giai ngan'`
    );
    const totalStudents = studentsResult[0].count;

    // ─────────────────────────────────────────────────────────────────────────
    // QUERY 2: Tổng số tiền đã nhận (SUM sotien từ khoantaitro với trangthai = 'Da nhan')
    // ─────────────────────────────────────────────────────────────────────────
    const [disbursedResult] = await pool.query(
      `SELECT SUM(sotien) as total 
       FROM khoantaitro 
       WHERE trangthai = 'Da nhan'`
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
// CÔNG DỤNG: KPI cho KeToanDashboard và Admin Dashboard
//  - tongThu: tổng giao dịch Thu thành công trong tháng hiện tại
//  - tongChi: tổng giao dịch Chi thành công trong tháng hiện tại
//  - choXacNhanThu: số khoản tài trợ trang_thai='Da duyet' chờ kế toán xác nhận
//  - choGiaiNgan: số đơn yeucauhotro trang_thai='Cho giai ngan'
//  - tongGiaiNgan: tổng số đơn đã giải ngân (Da giai ngan) - cho Admin Dashboard
// ─────────────────────────────────────────────────────────────────────────────
export const getKeToanSummary = async (req, res) => {
  try {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    // Tổng THU: Lấy từ bảng giaodich (giao dịch THU từ tài trợ)
    const [[thuRow]] = await pool.query(
      `SELECT COALESCE(SUM(sotien), 0) AS total
       FROM giaodich
       WHERE trangthai = 'Thanh cong'
         AND yeucauhotro_id IS NULL
         AND nguoinhan_id IS NULL
         AND YEAR(ngaygiaodich) = ?
         AND MONTH(ngaygiaodich) = ?`,
      [year, month]
    );

    // Tổng CHI: Lấy từ bảng giaodich (giao dịch CHI cho sinh viên)
    const [[chiRow]] = await pool.query(
      `SELECT COALESCE(SUM(sotien), 0) AS total
       FROM giaodich
       WHERE trangthai = 'Thanh cong'
         AND (yeucauhotro_id IS NOT NULL OR nguoinhan_id IS NOT NULL)
         AND YEAR(ngaygiaodich) = ?
         AND MONTH(ngaygiaodich) = ?`,
      [year, month]
    );

    const [[choXacNhanRow]] = await pool.query(
      `SELECT COUNT(*) AS total
       FROM khoantaitro
       WHERE trangthai = 'Da duyet'`
    );

    const [[choGiaiNganRow]] = await pool.query(
      `SELECT COUNT(*) AS total
       FROM yeucauhotro
       WHERE trangthai = 'Cho giai ngan'`
    );

    // Thêm: Tổng số đơn đã giải ngân (cho Admin Dashboard)
    const [[tongGiaiNganRow]] = await pool.query(
      `SELECT COUNT(*) AS total
       FROM yeucauhotro
       WHERE trangthai = 'Da giai ngan'`
    );

    return res.status(200).json({
      success: true,
      message: "Lấy summary kế toán thành công",
      data: {
        tongThu: parseFloat(thuRow.total),
        tongChi: parseFloat(chiRow.total),
        choXacNhanThu: choXacNhanRow.total,
        choGiaiNgan: choGiaiNganRow.total,
        tongGiaiNgan: tongGiaiNganRow.total, // Thêm field mới
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
         DATE_FORMAT(ngay_date, '%Y-%m') AS thang_key,
         MONTH(ngay_date) AS thang,
         YEAR(ngay_date) AS nam,
         SUM(thu) AS thu,
         SUM(chi) AS chi
       FROM (
         -- Giao dịch THU: từ tài trợ vào quỹ
         SELECT ngaygiaodich AS ngay_date, sotien AS thu, 0 AS chi
         FROM giaodich
         WHERE trangthai = 'Thanh cong'
           AND yeucauhotro_id IS NULL
           AND nguoinhan_id IS NULL
         UNION ALL
         -- Giao dịch CHI: từ quỹ ra sinh viên
         SELECT ngaygiaodich AS ngay_date, 0 AS thu, sotien AS chi
         FROM giaodich
         WHERE trangthai = 'Thanh cong'
           AND (yeucauhotro_id IS NOT NULL OR nguoinhan_id IS NOT NULL)
       ) AS combined
       WHERE ngay_date >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
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
      `SELECT trangthai AS trang_thai, COUNT(*) AS so_luong
       FROM giaodich
       GROUP BY trangthai`
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
         transaction_id,
         loai,
         so_tien,
         trang_thai,
         ghi_chu,
         ngay_giao_dich,
         ten_quy
       FROM (
         SELECT
            kt.khoantaitro_id AS transaction_id,
            'Thu' AS loai,
            kt.sotien AS so_tien,
            kt.trangthai AS trang_thai,
            kt.ghichu AS ghi_chu,
            kt.ngaycapnhat AS ngay_giao_dich,
            q.tenquy AS ten_quy
         FROM khoantaitro kt
         INNER JOIN quy q ON kt.quy_id = q.quy_id
         UNION ALL
         SELECT
            gd.giaodich_id AS transaction_id,
            'Chi' AS loai,
            gd.sotien AS so_tien,
            gd.trangthai AS trang_thai,
            gd.ghichu AS ghi_chu,
            gd.ngaygiaodich AS ngay_giao_dich,
            q.tenquy AS ten_quy
         FROM giaodich gd
         INNER JOIN quy q ON gd.quy_id = q.quy_id
       ) AS combined
       ORDER BY ngay_giao_dich DESC
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
         q.quy_id,
         q.tenquy AS ten_quy,
         lq.tenloai AS loai_quy,
         q.sodu AS so_du,
         q.sotienmuctieu AS so_tien_toi_da,
         q.trangthai AS trang_thai
       FROM quy q
       LEFT JOIN loaiquy lq ON q.loaiquy_id = lq.loaiquy_id
       ORDER BY q.sodu ASC`
    );

    // Trả về data với snake_case keys như frontend expect
    const data = rows.map((f) => ({
      quy_id: f.quy_id,
      ten_quy: f.ten_quy,
      loai_quy: f.loai_quy,
      so_du: parseFloat(f.so_du || 0),
      so_tien_toi_da: parseFloat(f.so_tien_toi_da || 0),
      trang_thai: f.trang_thai,
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
         kt.khoantaitro_id AS khoan_tai_tro_id,
         kt.sotien AS so_tien,
         kt.ngaytaitro AS ngay_tai_tro,
         kt.trangthai AS trang_thai,
         ntt.tennhataitro AS ten_nha_tai_tro,
         q.tenquy AS ten_quy,
         q.quy_id
       FROM khoantaitro kt
       INNER JOIN nhataitro ntt ON kt.nhataitro_id = ntt.nhataitro_id
       INNER JOIN quy q ON kt.quy_id = q.quy_id
       WHERE kt.trangthai = 'Da duyet'
       ORDER BY kt.ngaytaitro DESC
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

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/statistics/applications/stats
// CÔNG DỤNG: Lấy thống kê đơn xin hỗ trợ theo trạng thái (cho Admin Dashboard)
// ─────────────────────────────────────────────────────────────────────────────
export const getApplicationStats = async (req, res) => {
  try {
    // Đếm tổng số đơn
    const [[{ tongDon }]] = await pool.query(
      `SELECT COUNT(*) AS tongDon FROM yeucauhotro`
    );

    // Đếm đơn chờ duyệt (Cho duyet cap 1)
    const [[{ choDuyet }]] = await pool.query(
      `SELECT COUNT(*) AS choDuyet FROM yeucauhotro WHERE trangthai = 'Cho duyet cap 1'`
    );

    // Đếm đơn đang xử lý (Dang xu ly)
    const [[{ dangXuLy }]] = await pool.query(
      `SELECT COUNT(*) AS dangXuLy FROM yeucauhotro WHERE trangthai IN ('Da duyet cap 1', 'Cho duyet cap 2', 'Da duyet cap 2', 'Cho duyet cap 3', 'Da duyet cap 3')`
    );

    // Đếm đơn chờ giải ngân (Cho giai ngan)
    const [[{ choGiaiNgan }]] = await pool.query(
      `SELECT COUNT(*) AS choGiaiNgan FROM yeucauhotro WHERE trangthai = 'Cho giai ngan'`
    );

    // Đếm đơn đã hoàn thành (Da giai ngan)
    const [[{ daHoanThanh }]] = await pool.query(
      `SELECT COUNT(*) AS daHoanThanh FROM yeucauhotro WHERE trangthai = 'Da giai ngan'`
    );

    // Đếm đơn từ chối (Tu choi)
    const [[{ tuChoi }]] = await pool.query(
      `SELECT COUNT(*) AS tuChoi FROM yeucauhotro WHERE trangthai IN ('Tu choi', 'Tu choi cap 1', 'Tu choi cap 2', 'Tu choi cap 3')`
    );

    return res.status(200).json({
      success: true,
      message: "Lấy thống kê đơn xin hỗ trợ thành công",
      data: {
        tongDon: Number(tongDon) || 0,
        choDuyet: Number(choDuyet) || 0,
        dangXuLy: Number(dangXuLy) || 0,
        choGiaiNgan: Number(choGiaiNgan) || 0,
        daHoanThanh: Number(daHoanThanh) || 0,
        tuChoi: Number(tuChoi) || 0,
      }
    });
  } catch (error) {
    console.error("Lỗi getApplicationStats:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thống kê đơn xin hỗ trợ",
      error: error.message
    });
  }
};

export const getKeToanReportStats = async (req, res) => {
  try {
    const type = req.query.type || 'month'; // 'month' | 'quarter' | 'year'
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const month = parseInt(req.query.month) || (new Date().getMonth() + 1);
    const quarter = parseInt(req.query.quarter) || Math.ceil((new Date().getMonth() + 1) / 3);
    const compareMode = req.query.compareMode === 'true' || req.query.compareMode === true;

    // Helper functions
    const getPeriodCondition = (fieldName) => {
      if (type === 'month') {
        return {
          sql: `YEAR(${fieldName}) = ? AND MONTH(${fieldName}) = ?`,
          params: [year, month]
        };
      } else if (type === 'quarter') {
        return {
          sql: `YEAR(${fieldName}) = ? AND QUARTER(${fieldName}) = ?`,
          params: [year, quarter]
        };
      } else {
        return {
          sql: `YEAR(${fieldName}) = ?`,
          params: [year]
        };
      }
    };

    const getPreviousPeriod = () => {
      let prevYear = year;
      let prevMonth = month;
      let prevQuarter = quarter;

      if (type === 'month') {
        if (prevMonth > 1) {
          prevMonth -= 1;
        } else {
          prevMonth = 12;
          prevYear -= 1;
        }
      } else if (type === 'quarter') {
        if (prevQuarter > 1) {
          prevQuarter -= 1;
        } else {
          prevQuarter = 4;
          prevYear -= 1;
        }
      } else {
        prevYear -= 1;
      }
      return { year: prevYear, month: prevMonth, quarter: prevQuarter };
    };

    const getPrevPeriodCondition = (fieldName) => {
      const prev = getPreviousPeriod();
      if (type === 'month') {
        return {
          sql: `YEAR(${fieldName}) = ? AND MONTH(${fieldName}) = ?`,
          params: [prev.year, prev.month]
        };
      } else if (type === 'quarter') {
        return {
          sql: `YEAR(${fieldName}) = ? AND QUARTER(${fieldName}) = ?`,
          params: [prev.year, prev.quarter]
        };
      } else {
        return {
          sql: `YEAR(${fieldName}) = ?`,
          params: [prev.year]
        };
      }
    };

    const currentCondGD = getPeriodCondition('ngaygiaodich');
    const currentCondKT = getPeriodCondition('ngaytaitro');

    // 1. KPI Summary Data
    const [[thuRow]] = await pool.query(
      `SELECT COALESCE(SUM(sotien), 0) AS total
       FROM khoantaitro
       WHERE trangthai = 'Da nhan' AND ${currentCondKT.sql}`,
      currentCondKT.params
    );

    const [[chiRow]] = await pool.query(
      `SELECT COALESCE(SUM(sotien), 0) AS total
       FROM giaodich
       WHERE trangthai = 'Thanh cong' AND ${currentCondGD.sql}`,
      currentCondGD.params
    );

    const [[gdRow]] = await pool.query(
      `SELECT COUNT(*) AS total
       FROM (
         SELECT ngaycapnhat AS ngaygiaodich FROM khoantaitro WHERE trangthai = 'Da nhan'
         UNION ALL
         SELECT ngaygiaodich FROM giaodich WHERE trangthai = 'Thanh cong'
       ) AS combined
       WHERE ${currentCondGD.sql}`,
      currentCondGD.params
    );

    const [[quyRow]] = await pool.query(
      `SELECT COUNT(*) AS total
       FROM quy
       WHERE trangthai = 'Dang hoat dong'`
    );

    const summaryData = {
      tongThu: parseFloat(thuRow.total),
      tongChi: parseFloat(chiRow.total),
      soQuy: quyRow.total,
      soGiaoDich: gdRow.total
    };

    // 2. Comparison Summary Data (if compareMode = true)
    let compareSummaryData = null;
    if (compareMode) {
      const prevCondGD = getPrevPeriodCondition('ngaygiaodich');
      const prevCondKT = getPrevPeriodCondition('ngaytaitro');
      
      const [[prevThuRow]] = await pool.query(
        `SELECT COALESCE(SUM(sotien), 0) AS total
         FROM khoantaitro
         WHERE trangthai = 'Da nhan' AND ${prevCondKT.sql}`,
        prevCondKT.params
      );

      const [[prevChiRow]] = await pool.query(
        `SELECT COALESCE(SUM(sotien), 0) AS total
         FROM giaodich
         WHERE trangthai = 'Thanh cong' AND ${prevCondGD.sql}`,
        prevCondGD.params
      );

      const [[prevGdRow]] = await pool.query(
        `SELECT COUNT(*) AS total
         FROM (
           SELECT ngaycapnhat AS ngaygiaodich FROM khoantaitro WHERE trangthai = 'Da nhan'
           UNION ALL
           SELECT ngaygiaodich FROM giaodich WHERE trangthai = 'Thanh cong'
         ) AS combined
         WHERE ${prevCondGD.sql}`,
        prevCondGD.params
      );

      compareSummaryData = {
        tongThu: parseFloat(prevThuRow.total),
        tongChi: parseFloat(prevChiRow.total),
        soQuy: quyRow.total,
        soGiaoDich: prevGdRow.total
      };
    }

    // 3. Cashflow data
    const cashflowData = [];
    if (type === 'month') {
      const selectedDate = new Date(year, month - 1, 1);
      for (let i = 5; i >= 0; i--) {
        const d = new Date(selectedDate.getFullYear(), selectedDate.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        
        const [[row]] = await pool.query(
          `SELECT
             SUM(thu) AS thu,
             SUM(chi) AS chi
           FROM (
             SELECT ngaycapnhat AS ngay_date, sotien AS thu, 0 AS chi
             FROM khoantaitro
             WHERE trangthai = 'Da nhan'
             UNION ALL
             SELECT ngaygiaodich AS ngay_date, 0 AS thu, sotien AS chi
             FROM giaodich
             WHERE trangthai = 'Thanh cong'
           ) AS combined
           WHERE YEAR(ngay_date) = ? AND MONTH(ngay_date) = ?`,
          [d.getFullYear(), d.getMonth() + 1]
        );

        cashflowData.push({
          thang: `T${d.getMonth() + 1}`,
          thangKey: key,
          thu: parseFloat(row.thu || 0),
          chi: parseFloat(row.chi || 0)
        });
      }
    } else if (type === 'quarter') {
      for (let q = 1; q <= 4; q++) {
        const [[row]] = await pool.query(
          `SELECT
             SUM(thu) AS thu,
             SUM(chi) AS chi
           FROM (
             SELECT ngaycapnhat AS ngay_date, sotien AS thu, 0 AS chi
             FROM khoantaitro
             WHERE trangthai = 'Da nhan'
             UNION ALL
             SELECT ngaygiaodich AS ngay_date, 0 AS thu, sotien AS chi
             FROM giaodich
             WHERE trangthai = 'Thanh cong'
           ) AS combined
           WHERE YEAR(ngay_date) = ? AND QUARTER(ngay_date) = ?`,
          [year, q]
        );
        cashflowData.push({
          thang: `Q${q}`,
          thangKey: `${year}-Q${q}`,
          thu: parseFloat(row.thu || 0),
          chi: parseFloat(row.chi || 0)
        });
      }
    } else { // year
      for (let m = 1; m <= 12; m++) {
        const [[row]] = await pool.query(
          `SELECT
             SUM(thu) AS thu,
             SUM(chi) AS chi
           FROM (
             SELECT ngaycapnhat AS ngay_date, sotien AS thu, 0 AS chi
             FROM khoantaitro
             WHERE trangthai = 'Da nhan'
             UNION ALL
             SELECT ngaygiaodich AS ngay_date, 0 AS thu, sotien AS chi
             FROM giaodich
             WHERE trangthai = 'Thanh cong'
           ) AS combined
           WHERE YEAR(ngay_date) = ? AND MONTH(ngay_date) = ?`,
          [year, m]
        );
        cashflowData.push({
          thang: `T${m}`,
          thangKey: `${year}-${String(m).padStart(2, '0')}`,
          thu: parseFloat(row.thu || 0),
          chi: parseFloat(row.chi || 0)
        });
      }
    }

    // 4. Comparison Cashflow Data (if compareMode = true)
    const compareCashflowData = [];
    if (compareMode) {
      const prev = getPreviousPeriod();
      if (type === 'month') {
        const prevDate = new Date(prev.year, prev.month - 1, 1);
        for (let i = 5; i >= 0; i--) {
          const d = new Date(prevDate.getFullYear(), prevDate.getMonth() - i, 1);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          
          const [[row]] = await pool.query(
            `SELECT
               SUM(thu) AS thu,
               SUM(chi) AS chi
             FROM (
               SELECT ngaycapnhat AS ngay_date, sotien AS thu, 0 AS chi
               FROM khoantaitro
               WHERE trangthai = 'Da nhan'
               UNION ALL
               SELECT ngaygiaodich AS ngay_date, 0 AS thu, sotien AS chi
               FROM giaodich
               WHERE trangthai = 'Thanh cong'
             ) AS combined
             WHERE YEAR(ngay_date) = ? AND MONTH(ngay_date) = ?`,
            [d.getFullYear(), d.getMonth() + 1]
          );

          compareCashflowData.push({
            thang: `T${d.getMonth() + 1}`,
            thangKey: key,
            thu: parseFloat(row.thu || 0),
            chi: parseFloat(row.chi || 0)
          });
        }
      } else if (type === 'quarter') {
        const prevYear = prev.year;
        for (let q = 1; q <= 4; q++) {
          const [[row]] = await pool.query(
            `SELECT
               SUM(thu) AS thu,
               SUM(chi) AS chi
             FROM (
               SELECT ngaycapnhat AS ngay_date, sotien AS thu, 0 AS chi
               FROM khoantaitro
               WHERE trangthai = 'Da nhan'
               UNION ALL
               SELECT ngaygiaodich AS ngay_date, 0 AS thu, sotien AS chi
               FROM giaodich
               WHERE trangthai = 'Thanh cong'
             ) AS combined
             WHERE YEAR(ngay_date) = ? AND QUARTER(ngay_date) = ?`,
            [prevYear, q]
          );
          compareCashflowData.push({
            thang: `Q${q}`,
            thangKey: `${prevYear}-Q${q}`,
            thu: parseFloat(row.thu || 0),
            chi: parseFloat(row.chi || 0)
          });
        }
      } else { // year
        const prevYear = prev.year;
        for (let m = 1; m <= 12; m++) {
          const [[row]] = await pool.query(
            `SELECT
               SUM(thu) AS thu,
               SUM(chi) AS chi
             FROM (
               SELECT ngaycapnhat AS ngay_date, sotien AS thu, 0 AS chi
               FROM khoantaitro
               WHERE trangthai = 'Da nhan'
               UNION ALL
               SELECT ngaygiaodich AS ngay_date, 0 AS thu, sotien AS chi
               FROM giaodich
               WHERE trangthai = 'Thanh cong'
             ) AS combined
             WHERE YEAR(ngay_date) = ? AND MONTH(ngay_date) = ?`,
            [prevYear, m]
          );
          compareCashflowData.push({
            thang: `T${m}`,
            thangKey: `${prevYear}-${String(m).padStart(2, '0')}`,
            thu: parseFloat(row.thu || 0),
            chi: parseFloat(row.chi || 0)
          });
        }
      }
    }

    // 5. Breakdown Thu (Top Nhà tài trợ)
    const [thuBreakdownRows] = await pool.query(
      `SELECT ntt.tennhataitro AS name, SUM(kt.sotien) AS value
       FROM khoantaitro kt
       INNER JOIN nhataitro ntt ON kt.nhataitro_id = ntt.nhataitro_id
       WHERE kt.trangthai = 'Da nhan' AND ${currentCondKT.sql}
       GROUP BY ntt.tennhataitro
       ORDER BY value DESC
       LIMIT 5`,
      currentCondKT.params
    );

    const totalThuVal = thuBreakdownRows.reduce((sum, r) => sum + parseFloat(r.value), 0);
    const breakdownThuData = thuBreakdownRows.map(r => ({
      name: r.name,
      value: parseFloat(r.value),
      percentage: totalThuVal > 0 ? Math.round((parseFloat(r.value) / totalThuVal) * 100) : 0
    }));

    // 6. Breakdown Chi (Phân bổ chi theo quỹ)
    const [chiBreakdownRows] = await pool.query(
      `SELECT q.tenquy AS name, SUM(gd.sotien) AS value
       FROM giaodich gd
       INNER JOIN quy q ON gd.quy_id = q.quy_id
       WHERE gd.trangthai = 'Thanh cong' AND ${currentCondGD.sql}
       GROUP BY q.tenquy
       ORDER BY value DESC
       LIMIT 5`,
      currentCondGD.params
    );

    const totalChiVal = chiBreakdownRows.reduce((sum, r) => sum + parseFloat(r.value), 0);
    const breakdownChiData = chiBreakdownRows.map(r => ({
      name: r.name,
      value: parseFloat(r.value),
      percentage: totalChiVal > 0 ? Math.round((parseFloat(r.value) / totalChiVal) * 100) : 0
    }));

    // 7. Fund Table data
    const [activeFunds] = await pool.query(
      `SELECT quy_id, tenquy AS ten_quy, sodu AS so_du, sotienhotrotoida AS so_tien_toi_da, trangthai AS trang_thai
       FROM quy
       WHERE trangthai = 'Dang hoat dong'`
    );

    const fundTableData = [];
    for (const f of activeFunds) {
      // successful Thu in period for this fund
      const [[fundThuRow]] = await pool.query(
        `SELECT COALESCE(SUM(sotien), 0) AS total
         FROM khoantaitro
         WHERE quy_id = ? AND trangthai = 'Da nhan' AND ${currentCondKT.sql}`,
        [f.quy_id, ...currentCondKT.params]
      );

      // successful Chi in period for this fund
      const [[fundChiRow]] = await pool.query(
        `SELECT COALESCE(SUM(sotien), 0) AS total
         FROM giaodich
         WHERE quy_id = ? AND trangthai = 'Thanh cong' AND ${currentCondGD.sql}`,
        [f.quy_id, ...currentCondGD.params]
      );

      // transaction count
      const [[fundGdRow]] = await pool.query(
        `SELECT COUNT(*) AS total
         FROM (
           SELECT quy_id, ngaycapnhat AS ngaygiaodich, trangthai FROM khoantaitro
           UNION ALL
           SELECT quy_id, ngaygiaodich, trangthai FROM giaodich
         ) AS combined
         WHERE quy_id = ? AND trangthai IN ('Thanh cong', 'Da nhan') AND ${currentCondGD.sql}`,
        [f.quy_id, ...currentCondGD.params]
      );

      // trend data (last 6 transactions)
      const [trendRows] = await pool.query(
        `SELECT sotien AS value
         FROM giaodich
         WHERE quy_id = ? AND trangthai = 'Thanh cong'
         ORDER BY ngaygiaodich DESC
         LIMIT 6`,
        [f.quy_id]
      );

      const trendData = trendRows.reverse().map(tr => ({ value: parseFloat(tr.value) }));

      fundTableData.push({
        quyId: f.quy_id,
        tenQuy: f.ten_quy,
        thu: parseFloat(fundThuRow.total),
        chi: parseFloat(fundChiRow.total),
        soDu: parseFloat(f.so_du),
        soTienToiDa: parseFloat(f.so_tien_toi_da || 0),
        soGiaoDich: fundGdRow.total,
        trangThai: f.trang_thai === 'Dang hoat dong' ? 'Đang hoạt động' : f.trang_thai,
        trendData
      });
    }

    // 8. Chi tiết các giao dịch chi giải ngân (transaction rows)
    const [transactionRows] = await pool.query(
      `SELECT
         gd.giaodich_id AS id,
         nd.hoten AS ho_ten,
         nd.masodinhdanh AS mssv,
         q.tenquy AS ten_quy,
         gd.sotien AS so_tien,
         gd.ngaygiaodich AS ngay_giai_ngan
       FROM giaodich gd
       INNER JOIN yeucauhotro yc ON gd.yeucauhotro_id = yc.yeucauhotro_id
       INNER JOIN nguoidung nd ON yc.nguoidung_id = nd.nguoidung_id
       INNER JOIN quy q ON gd.quy_id = q.quy_id
       WHERE gd.trangthai = 'Thanh cong' AND ${currentCondGD.sql}
       ORDER BY gd.ngaygiaodich DESC`,
      currentCondGD.params
    );

    const rows = transactionRows.map((r, idx) => ({
      stt: idx + 1,
      ho_ten: r.ho_ten || 'Sinh viên',
      mssv: r.mssv || '—',
      ten_quy: r.ten_quy || '',
      so_tien: parseFloat(r.so_tien || 0),
      ngay_giai_ngan: r.ngay_giai_ngan ? new Date(r.ngay_giai_ngan).toLocaleDateString('vi-VN') : '—'
    }));

    return res.status(200).json({
      success: true,
      message: "Lấy báo cáo thống kê thu chi kế toán thành công",
      data: {
        summaryData,
        compareSummaryData,
        cashflowData,
        compareCashflowData,
        breakdownThuData,
        breakdownChiData,
        fundTableData,
        rows
      }
    });

  } catch (error) {
    console.error("Lỗi getKeToanReportStats:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi lấy báo cáo thống kê thu chi",
      error: error.message
    });
  }
};

// ─── GET /api/statistics/admin/advanced ───────────────────────────────────────
export const getAdminAdvancedStats = async (req, res) => {
  try {
    // 1. Tỷ lệ duyệt hồ sơ thành công & Thời gian xử lý trung bình
    // Chỉ tính cho các đơn đã ở trạng thái cuối (Da giai ngan hoặc Tu choi)
    const [[hieuSuatRow]] = await pool.query(
      `SELECT
         COUNT(*) AS tong_don_da_xu_ly,
         SUM(CASE WHEN trangthai = 'Da giai ngan' THEN 1 ELSE 0 END) AS so_don_thanh_cong,
         COALESCE(AVG(TIMESTAMPDIFF(DAY, ngaynop, ngaycapnhat)), 0) AS thoi_gian_xu_ly_trung_binh
       FROM yeucauhotro
       WHERE trangthai IN ('Da giai ngan', 'Tu choi')`
    );

    const tongDaXuLy = Number(hieuSuatRow.tong_don_da_xu_ly) || 0;
    const soThanhCong = Number(hieuSuatRow.so_don_thanh_cong) || 0;
    const tyLeThanhCong = tongDaXuLy > 0 ? Math.round((soThanhCong / tongDaXuLy) * 100) : 0;
    const thoiGianXuLy = Math.round((parseFloat(hieuSuatRow.thoi_gian_xu_ly_trung_binh) || 0) * 10) / 10;

    // 2. Thống kê theo Khoa/Ngành (Hỗ trợ nhiều nhất)
    const [khoaRows] = await pool.query(
      `SELECT
         COALESCE(dv.tenkhoa, 'Khác') AS khoa,
         COUNT(*) AS so_don_nhan,
         SUM(yc.sotiendenghi) AS tong_tien_giai_ngan
       FROM yeucauhotro yc
       INNER JOIN nguoidung nd ON yc.nguoidung_id = nd.nguoidung_id
       LEFT JOIN donvihoc dv ON nd.donvihoc_id = dv.donvihoc_id
       WHERE yc.trangthai = 'Da giai ngan'
       GROUP BY dv.tenkhoa
       ORDER BY tong_tien_giai_ngan DESC`
    );

    const khoaStats = khoaRows.map(r => ({
      khoa: r.khoa,
      soDonNhan: Number(r.so_don_nhan) || 0,
      tongTien: parseFloat(r.tong_tien_giai_ngan || 0)
    }));

    // 3. Phân tích Nhà tài trợ đóng góp nhiều nhất (Top 10)
    const [donorRows] = await pool.query(
      `SELECT
         ntt.tennhataitro AS ten_nha_tai_tro,
         ntt.loainhataitro AS loai,
         COALESCE(SUM(kt.sotien), 0) AS tong_tai_tro,
         COUNT(kt.khoantaitro_id) AS so_lan_tai_tro
       FROM nhataitro ntt
       LEFT JOIN khoantaitro kt ON ntt.nhataitro_id = kt.nhataitro_id AND kt.trangthai = 'Da nhan'
       GROUP BY ntt.nhataitro_id, ntt.tennhataitro, ntt.loainhataitro
       ORDER BY tong_tai_tro DESC
       LIMIT 10`
    );

    const topDonors = donorRows.map(r => ({
      ten: r.ten_nha_tai_tro,
      loai: r.loai,
      tongTien: parseFloat(r.tong_tai_tro || 0),
      soLan: Number(r.so_lan_tai_tro) || 0
    }));

    // 4. So sánh hiệu quả giữa các Quỹ
    const [fundComparisonRows] = await pool.query(
      `SELECT
         q.quy_id,
         q.tenquy AS ten_quy,
         q.sodu AS so_du,
         COALESCE((
           SELECT SUM(kt.sotien)
           FROM khoantaitro kt
           WHERE kt.quy_id = q.quy_id AND kt.trangthai = 'Da nhan'
         ), 0) AS tong_thu,
         COALESCE((
           SELECT SUM(yc.sotiendenghi)
           FROM yeucauhotro yc
           WHERE yc.quy_id = q.quy_id AND yc.trangthai = 'Da giai ngan'
         ), 0) AS tong_chi,
         (
           SELECT COUNT(*)
           FROM yeucauhotro yc
           WHERE yc.quy_id = q.quy_id AND yc.trangthai = 'Da giai ngan'
         ) AS so_don_ho_tro
       FROM quy q
       ORDER BY tong_chi DESC`
    );

    const fundComparison = fundComparisonRows.map(r => {
      const totalIncome = parseFloat(r.tong_thu) || 0;
      const totalExpense = parseFloat(r.tong_chi) || 0;
      const rate = totalIncome > 0 ? Math.round((totalExpense / totalIncome) * 100) : 0;
      return {
        id: r.quy_id,
        ten: r.ten_quy,
        soDu: parseFloat(r.so_du) || 0,
        tongThu: totalIncome,
        tongChi: totalExpense,
        soDonHoTro: Number(r.so_don_ho_tro) || 0,
        tyLeGiaiNgan: rate
      };
    });

    // 5. Dự báo tài chính & đề xuất chính sách (Báo cáo chiến lược)
    // Tính toán số tiền trung bình giải ngân mỗi tháng trong 3 tháng gần nhất
    const [[monthlySpendRow]] = await pool.query(
      `SELECT COALESCE(SUM(sotiendenghi) / 3, 0) AS avg_monthly_spend
       FROM yeucauhotro
       WHERE trangthai = 'Da giai ngan'
         AND ngaycapnhat >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)`
    );

    // Tổng số dư các quỹ hiện tại
    const [[totalBalanceRow]] = await pool.query(
      `SELECT COALESCE(SUM(sodu), 0) AS total_balance FROM quy`
    );

    const avgSpend = parseFloat(monthlySpendRow.avg_monthly_spend) || 0;
    const totalBalance = parseFloat(totalBalanceRow.total_balance) || 0;
    const remainingMonths = avgSpend > 0 ? Math.round((totalBalance / avgSpend) * 10) / 10 : 99;

    // Gợi ý chính sách
    let recommendation = "";
    let warningLevel = "normal";
    if (remainingMonths < 3) {
      recommendation = "Cảnh báo: Ngân sách dự trữ còn lại dưới 3 tháng. Đề xuất: (1) Tạm thời siết chặt định mức hỗ trợ mỗi hồ sơ hoặc giảm số lượng chỉ tiêu; (2) Đẩy mạnh kêu gọi tài trợ từ các doanh nghiệp/tổ chức lớn; (3) Tạm dừng phê duyệt các đơn xin hỗ trợ không khẩn cấp.";
      warningLevel = "danger";
    } else if (remainingMonths < 6) {
      recommendation = "Cảnh báo nhẹ: Ngân sách dự trữ chỉ đủ hoạt động từ 3 đến 6 tháng tiếp theo. Đề xuất: Tiếp tục mở rộng kêu gọi tài trợ và duy trì định mức chi trả hiện tại, chưa nên tăng định mức.";
      warningLevel = "warning";
    } else {
      recommendation = "An toàn: Quỹ hoạt động rất khỏe mạnh, ngân sách dự trữ đủ chi trả trên 6 tháng. Đề xuất: Có thể cân nhắc mở rộng quy mô hỗ trợ, tăng số lượng sinh viên được thụ hưởng hoặc nâng định mức hỗ trợ tối đa cho mỗi hồ sơ của những quỹ có số dư dồi dào.";
      warningLevel = "normal";
    }

    return res.status(200).json({
      success: true,
      message: "Lấy thống kê nâng cao cho Admin thành công",
      data: {
        hieuSuat: {
          tongDaXuLy,
          soThanhCong,
          tyLeThanhCong,
          thoiGianXuLy
        },
        khoaStats,
        topDonors,
        fundComparison,
        duBao: {
          avgSpend,
          totalBalance,
          remainingMonths,
          recommendation,
          warningLevel
        }
      }
    });
  } catch (error) {
    console.error("Lỗi getAdminAdvancedStats:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy thống kê nâng cao cho Admin",
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
  getApplicationStats,
  getKeToanReportStats,
  getAdminAdvancedStats,
};
