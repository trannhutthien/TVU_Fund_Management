import pool from "../config/db.js";

// ═══════════════════════════════════════════════════════════════════════════════
// ─── STATISTICS CONTROLLER (THỐNG KÊ) ─────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/statistics/public
// CÔNG DỤNG: Lấy thống kê tổng quan cho Landing Page (public, không cần auth)
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
// GET /api/statistics/supported-requests
// CÔNG DỤNG: Lấy số yêu cầu đã hỗ trợ (trạng thái "Da giai ngan")
// ─────────────────────────────────────────────────────────────────────────────
export const getSupportedRequestsCount = async (req, res) => {
  try {
    const [result] = await pool.query(
      `SELECT COUNT(*) as count 
       FROM YeuCauHoTro 
       WHERE trang_thai = 'Da giai ngan'`
    );

    return res.status(200).json({
      success: true,
      data: {
        count: result[0].count
      }
    });

  } catch (error) {
    console.error("Lỗi getSupportedRequestsCount:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/statistics/total-fund-amount
// CÔNG DỤNG: Lấy tổng số tiền tất cả các quỹ
// ─────────────────────────────────────────────────────────────────────────────
export const getTotalFundAmount = async (req, res) => {
  try {
    const [result] = await pool.query(
      `SELECT SUM(so_du_hien_tai) as total 
       FROM Quy`
    );

    return res.status(200).json({
      success: true,
      data: {
        total: parseFloat(result[0].total || 0)
      }
    });

  } catch (error) {
    console.error("Lỗi getTotalFundAmount:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/statistics/total-donors
// CÔNG DỤNG: Lấy tổng số nhà hỗ trợ
// ─────────────────────────────────────────────────────────────────────────────
export const getTotalDonorsCount = async (req, res) => {
  try {
    const [result] = await pool.query(
      `SELECT COUNT(DISTINCT nha_tai_tro_id) as count 
       FROM NhaTaiTro`
    );

    return res.status(200).json({
      success: true,
      data: {
        count: result[0].count
      }
    });

  } catch (error) {
    console.error("Lỗi getTotalDonorsCount:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/statistics/total-funds
// CÔNG DỤNG: Lấy tổng số quỹ đang hoạt động
// ─────────────────────────────────────────────────────────────────────────────
export const getTotalFundsCount = async (req, res) => {
  try {
    const [result] = await pool.query(
      `SELECT COUNT(*) as count 
       FROM Quy 
       WHERE trang_thai = 'Dang hoat dong'`
    );

    return res.status(200).json({
      success: true,
      data: {
        count: result[0].count
      }
    });

  } catch (error) {
    console.error("Lỗi getTotalFundsCount:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message
    });
  }
};

export default {
  getPublicStats,
  getSupportedRequestsCount,
  getTotalFundAmount,
  getTotalDonorsCount,
  getTotalFundsCount
};
