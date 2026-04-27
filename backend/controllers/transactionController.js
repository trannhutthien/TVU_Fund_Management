import TransactionModel from "../models/TransactionModel.js";

// ═══════════════════════════════════════════════════════════════════════════════
// ─── GET /api/transactions (LỊCH SỬ DÒNG TIỀN) ────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
// 
// MỤC ĐÍCH: Admin xem lại tất cả giao dịch thu/chi để đối soát
// 
// THÔNG TIN TRẢ VỀ:
// - ID giao dịch
// - Loại giao dịch (Thu/Chi)
// - Số tiền
// - Quỹ liên quan
// - Khoản tài trợ (nếu là Thu) hoặc Yêu cầu hỗ trợ (nếu là Chi)
// - Người tạo giao dịch (người duyệt)
// - Thời gian tạo
// - Trạng thái
// - Minh chứng chuyển khoản
// - Ghi chú
//
// QUERY PARAMETERS:
// - page: Trang hiện tại (mặc định: 1)
// - limit: Số bản ghi mỗi trang (mặc định: 20)
// - loai: Lọc theo loại ('Thu' hoặc 'Chi')
// - quyId: Lọc theo quỹ
// - trangThai: Lọc theo trạng thái
// - tuNgay: Lọc từ ngày (YYYY-MM-DD)
// - denNgay: Lọc đến ngày (YYYY-MM-DD)
//
// LUỒNG HOẠT ĐỘNG:
// 1. Validate query parameters
// 2. Xây dựng điều kiện lọc
// 3. Lấy danh sách giao dịch từ database với JOIN:
//    - Bảng Quy (lấy tên quỹ)
//    - Bảng KhoanTaiTro (nếu là Thu - lấy thông tin nhà tài trợ)
//    - Bảng NguoiDung (lấy tên người tạo giao dịch)
// 4. Đếm tổng số bản ghi
// 5. Tính toán thông tin phân trang
// 6. Trả về danh sách + metadata
//
export const getAllTransactions = async (req, res) => {
  try {
    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 1: LẤY VÀ VALIDATE QUERY PARAMETERS
    // ─────────────────────────────────────────────────────────────────────────
    const {
      page = 1,
      limit = 20,
      loai,
      quyId,
      trangThai,
      tuNgay,
      denNgay
    } = req.query;

    // Validate page và limit
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    if (isNaN(pageNum) || pageNum < 1) {
      return res.status(400).json({
        success: false,
        message: "Trang phải là số nguyên dương",
      });
    }

    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        success: false,
        message: "Limit phải từ 1 đến 100",
      });
    }

    // Validate loai (nếu có)
    if (loai && !['Thu', 'Chi'].includes(loai)) {
      return res.status(400).json({
        success: false,
        message: "Loại giao dịch phải là 'Thu' hoặc 'Chi'",
      });
    }

    // Validate trangThai (nếu có)
    const validStatuses = ['Cho xu ly', 'Thanh cong', 'That bai', 'Hoan tien'];
    if (trangThai && !validStatuses.includes(trangThai)) {
      return res.status(400).json({
        success: false,
        message: "Trạng thái không hợp lệ",
      });
    }

    // Validate ngày (nếu có)
    if (tuNgay && isNaN(Date.parse(tuNgay))) {
      return res.status(400).json({
        success: false,
        message: "Từ ngày không đúng định dạng (YYYY-MM-DD)",
      });
    }

    if (denNgay && isNaN(Date.parse(denNgay))) {
      return res.status(400).json({
        success: false,
        message: "Đến ngày không đúng định dạng (YYYY-MM-DD)",
      });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 2: XÂY DỰNG FILTERS
    // ─────────────────────────────────────────────────────────────────────────
    const filters = {
      loai,
      quyId: quyId ? parseInt(quyId) : null,
      trangThai,
      tuNgay,
      denNgay
    };

    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 3: LẤY DANH SÁCH GIAO DỊCH TỪ MODEL
    // ─────────────────────────────────────────────────────────────────────────
    const offset = (pageNum - 1) * limitNum;
    const result = await TransactionModel.getAllTransactions(filters, limitNum, offset);

    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 4: TÍNH TOÁN THÔNG TIN PHÂN TRANG
    // ─────────────────────────────────────────────────────────────────────────
    const totalPages = Math.ceil(result.total / limitNum);

    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 5: TRẢ VỀ KẾT QUẢ
    // ─────────────────────────────────────────────────────────────────────────
    return res.status(200).json({
      success: true,
      message: "Lấy danh sách giao dịch thành công",
      data: result.transactions,
      pagination: {
        currentPage: pageNum,
        totalPages: totalPages,
        totalRecords: result.total,
        limit: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      },
      filters: {
        loai: loai || 'Tất cả',
        quyId: quyId || 'Tất cả',
        trangThai: trangThai || 'Tất cả',
        tuNgay: tuNgay || null,
        denNgay: denNgay || null
      }
    });
  } catch (error) {
    console.error("Lỗi getAllTransactions:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau",
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// ─── GET /api/transactions/:id (CHI TIẾT GIAO DỊCH) ───────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
// 
// MỤC ĐÍCH: Xem chi tiết 1 giao dịch cụ thể
//
export const getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;

    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 1: VALIDATE ID
    // ─────────────────────────────────────────────────────────────────────────
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "ID giao dịch không hợp lệ",
      });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 2: LẤY THÔNG TIN GIAO DỊCH
    // ─────────────────────────────────────────────────────────────────────────
    const transaction = await TransactionModel.getTransactionByIdDetailed(id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy giao dịch",
      });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 3: TRẢ VỀ KẾT QUẢ
    // ─────────────────────────────────────────────────────────────────────────
    return res.status(200).json({
      success: true,
      message: "Lấy thông tin giao dịch thành công",
      data: transaction
    });
  } catch (error) {
    console.error("Lỗi getTransactionById:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau",
    });
  }
};

export default {
  getAllTransactions,
  getTransactionById
};
