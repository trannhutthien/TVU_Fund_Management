import TransactionModel from "../models/TransactionModel.js";
import ExcelJS from "exceljs";

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
      denNgay,
      keyword
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
      denNgay,
      keyword: keyword?.trim() || null
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

// ═══════════════════════════════════════════════════════════════════════════════
// ─── GET /api/transactions/summary (TỔNG HỢP THU/CHI/RÒNG/BẤT THƯỜNG) ─────────
// ═══════════════════════════════════════════════════════════════════════════════
export const getTransactionsSummary = async (req, res) => {
  try {
    const { loai, quyId, trangThai, tuNgay, denNgay, keyword } = req.query;
    const filters = {
      loai,
      quyId: quyId ? parseInt(quyId) : null,
      trangThai,
      tuNgay,
      denNgay,
      keyword: keyword?.trim() || null
    };

    const data = await TransactionModel.getTransactionsSummary(filters);

    return res.status(200).json({
      success: true,
      message: "Lấy tổng hợp giao dịch thành công",
      data
    });
  } catch (error) {
    console.error("Lỗi getTransactionsSummary:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau",
      error: error.message
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// ─── GET /api/transactions/export (XUẤT EXCEL TOÀN BỘ GIAO DỊCH ĐANG FILTER) ─
// ═══════════════════════════════════════════════════════════════════════════════
export const exportTransactions = async (req, res) => {
  try {
    const { loai, quyId, trangThai, tuNgay, denNgay, keyword } = req.query;
    const filters = {
      loai,
      quyId: quyId ? parseInt(quyId) : null,
      trangThai,
      tuNgay,
      denNgay,
      keyword: keyword?.trim() || null
    };

    // Lấy toàn bộ giao dịch (không phân trang)
    const result = await TransactionModel.getAllTransactions(
      filters,
      100000, // limit lớn
      0
    );

    const transactions = result.transactions;

    // Tạo Excel workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "TVU Fund Management";
    workbook.created = new Date();

    const sheet = workbook.addWorksheet("Lịch sử giao dịch");

    // Tiêu đề báo cáo
    sheet.mergeCells("A1:I1");
    const titleCell = sheet.getCell("A1");
    titleCell.value = "DANH SÁCH GIAO DỊCH THU CHI";
    titleCell.font = { size: 16, bold: true, color: { argb: "FF1A2F5E" } };
    titleCell.alignment = { horizontal: "center", vertical: "middle" };
    sheet.getRow(1).height = 30;

    sheet.getCell("A3").value = "Ngày xuất:";
    sheet.getCell("A3").font = { bold: true };
    sheet.getCell("B3").value = new Date().toLocaleString("vi-VN");

    sheet.getCell("A4").value = "Tổng số giao dịch:";
    sheet.getCell("A4").font = { bold: true };
    sheet.getCell("B4").value = transactions.length;

    // Header bảng
    const headers = [
      "Mã GD",
      "Loại",
      "Đối tượng",
      "Quỹ",
      "Số tiền",
      "Trạng thái",
      "Người tạo",
      "Ghi chú",
      "Ngày tạo"
    ];

    const headerRow = sheet.getRow(6);
    headerRow.values = headers;
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    headerRow.height = 24;
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF1A2F5E" }
      };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" }
      };
    });

    // Data rows
    transactions.forEach((tx, idx) => {
      const doiTuong =
        tx.loai === "Thu"
          ? tx.khoanTaiTro?.nhaTaiTro?.ten || "—"
          : tx.sinhVien
            ? `${tx.sinhVien.hoTen} (${tx.sinhVien.maSoDinhDanh || "—"})`
            : "—";

      const row = sheet.getRow(7 + idx);
      row.values = [
        `GD${tx.transactionId}`,
        tx.loai,
        doiTuong,
        tx.quy?.tenQuy || "—",
        Number(tx.soTien || 0),
        tx.trangThai,
        tx.nguoiTao?.hoTen || "—",
        tx.ghiChu || "",
        new Date(tx.ngayGiaoDich).toLocaleString("vi-VN")
      ];

      // Format số tiền
      row.getCell(5).numFmt = '#,##0" đ"';
      row.getCell(5).alignment = { horizontal: "right" };

      // Tô màu Thu/Chi
      const loaiCell = row.getCell(2);
      if (tx.loai === "Thu") {
        loaiCell.font = { color: { argb: "FFB45309" }, bold: true };
      } else {
        loaiCell.font = { color: { argb: "FFDC2626" }, bold: true };
      }
      loaiCell.alignment = { horizontal: "center" };

      // Highlight giao dịch bất thường
      if (tx.trangThai === "That bai" || tx.trangThai === "Hoan tien") {
        row.eachCell((cell) => {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFEE2E2" }
          };
        });
      }

      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin", color: { argb: "FFE2E8F0" } },
          left: { style: "thin", color: { argb: "FFE2E8F0" } },
          bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
          right: { style: "thin", color: { argb: "FFE2E8F0" } }
        };
      });
    });

    // Auto width
    sheet.columns.forEach((col, idx) => {
      let maxLength = headers[idx]?.length || 10;
      col.eachCell?.({ includeEmpty: false }, (cell) => {
        const v = String(cell.value ?? "");
        if (v.length > maxLength) maxLength = v.length;
      });
      col.width = Math.min(maxLength + 4, 45);
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const fileName = `LichSuGiaoDich_${Date.now()}.xlsx`;

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${fileName}"`
    );
    res.setHeader("Content-Length", buffer.length);
    return res.send(buffer);
  } catch (error) {
    console.error("Lỗi exportTransactions:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi xuất Excel",
      error: error.message
    });
  }
};

export default {
  getAllTransactions,
  getTransactionById,
  getTransactionsSummary,
  exportTransactions
};
