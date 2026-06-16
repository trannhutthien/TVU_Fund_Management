import TransactionModel from "../../models/transactions/TransactionModel.js";
import ExcelJS from "exceljs";

// Helper to map DB row to frontend Transaction object structure
const mapTransactionRow = (tx) => {
  if (!tx) return null;
  
  // Xác định loại giao dịch:
  // - Giao dịch THU: yeucauhotro_id = NULL và nguoinhan_id = NULL (từ tài trợ vào quỹ)
  // - Giao dịch CHI: yeucauhotro_id != NULL và nguoinhan_id != NULL (từ quỹ ra sinh viên)
  const loai = (tx.yeucauhotro_id === null && tx.nguoinhan_id === null) ? 'Thu' : 'Chi';
  const nguoiTaoId = tx.yeucau_nguoitao_id || tx.donation_nguoitao_id || null;
  const nguoiTaoHoTen = tx.yeucau_nguoitao_hoten || tx.donation_nguoitao_hoten || null;
  const nguoiTaoVaiTro = tx.yeucau_nguoitao_vaitro || tx.donation_nguoitao_vaitro || null;
  
  return {
    transactionId: tx.giaodich_id,
    loai: loai,
    soTien: parseFloat(tx.sotien || 0),
    trangThai: tx.trangthai,
    doiSoatTrangThai: tx.doisoattrangthai,
    quy: {
      id: tx.quy_id,
      tenQuy: tx.tenquy,
      loaiQuy: tx.loaiquy_id
    },
    khoanTaiTro: tx.khoantaitro_id ? {
      id: tx.khoantaitro_id,
      nhaTaiTro: {
        id: tx.nhataitro_id,
        ten: tx.tennhataitro,
        loai: tx.loainhataitro
      }
    } : null,
    requestId: tx.yeucauhotro_id,
    sinhVien: tx.nguoinhan_id ? {
      id: tx.nguoinhan_id,
      hoTen: tx.nguoinhan_hoten,
      maSoDinhDanh: tx.nguoinhan_mssv,
      khoaPhong: tx.nguoinhan_khoaphong,
      tieuDeDon: tx.ghichu || ''
    } : null,
    doiTuong: {
      tenVaiTro: nguoiTaoVaiTro || tx.nguoithuchien_vaitro || null
    },
    nguoiDuyet: tx.nguoithuchien_id ? {
      id: tx.nguoithuchien_id,
      hoTen: tx.nguoithuchien_hoten,
      tenVaiTro: tx.nguoithuchien_vaitro || null
    } : null,
    nguoiTao: (nguoiTaoId || nguoiTaoHoTen) ? {
      id: nguoiTaoId,
      hoTen: nguoiTaoHoTen,
      tenVaiTro: nguoiTaoVaiTro
    } : null,
    minhChung: tx.chungtu,
    ghiChu: tx.ghichu,
    soTienThucTe: tx.sotienthucte ? parseFloat(tx.sotienthucte) : null,
    doiSoatLuc: tx.doisoatluc,
    doiSoatGhiChu: tx.doisoatghichu,
    doiSoatBoiTen: tx.doisoat_boi_ten || null,
    ngayGiaoDich: tx.ngaygiaodich,
    ngayCapNhat: tx.ngaycapnhat
  };
};

// ═══════════════════════════════════════════════════════════════════════════════
// ─── GET /api/transactions (LỊCH SỬ GIAO DỊCH) ────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
export const getAllTransactions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      loai,
      quyId,
      trangThai,
      doiSoatTrangThai,
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
    const validStatuses = ['Thanh cong', 'That bai', 'Dang xu ly'];
    if (trangThai && !validStatuses.includes(trangThai)) {
      return res.status(400).json({
        success: false,
        message: "Trạng thái không hợp lệ",
      });
    }

    // Validate doiSoatTrangThai (nếu có)
    const validDoiSoatStatuses = ['Chua_doi_soat', 'Da_doi_soat', 'Bat_thuong'];
    if (doiSoatTrangThai && !validDoiSoatStatuses.includes(doiSoatTrangThai)) {
      return res.status(400).json({
        success: false,
        message: "Trạng thái đối soát không hợp lệ",
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

    const filters = {
      loai,
      quyId: quyId ? parseInt(quyId) : null,
      trangThai,
      doiSoatTrangThai,
      tuNgay,
      denNgay,
      keyword: keyword?.trim() || null
    };

    const offset = (pageNum - 1) * limitNum;
    const result = await TransactionModel.getAllTransactions(filters, limitNum, offset);
    const totalPages = Math.ceil(result.total / limitNum);

    const formatted = result.transactions.map(mapTransactionRow);

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách giao dịch thành công",
      data: formatted,
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
        doiSoatTrangThai: doiSoatTrangThai || 'Tất cả',
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
export const getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "ID giao dịch không hợp lệ",
      });
    }

    const transaction = await TransactionModel.getTransactionByIdDetailed(id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy giao dịch",
      });
    }

    const formatted = mapTransactionRow(transaction);

    return res.status(200).json({
      success: true,
      message: "Lấy thông tin giao dịch thành công",
      data: formatted
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
// ─── GET /api/transactions/summary (TỔNG HỢP GIAO DỊCH ĐỐI SOÁT) ──────────────
// ═══════════════════════════════════════════════════════════════════════════════
export const getTransactionsSummary = async (req, res) => {
  try {
    const { loai, quyId, trangThai, doiSoatTrangThai, tuNgay, denNgay, keyword } = req.query;
    const filters = {
      loai,
      quyId: quyId ? parseInt(quyId) : null,
      trangThai,
      doiSoatTrangThai,
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
    const { loai, quyId, trangThai, doiSoatTrangThai, tuNgay, denNgay, keyword } = req.query;
    const filters = {
      loai,
      quyId: quyId ? parseInt(quyId) : null,
      trangThai,
      doiSoatTrangThai,
      tuNgay,
      denNgay,
      keyword: keyword?.trim() || null
    };

    const result = await TransactionModel.getAllTransactions(filters, 100000, 0);
    const transactions = result.transactions.map(mapTransactionRow);

    // Tạo Excel workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "TVU Fund Management";
    workbook.created = new Date();

    const sheet = workbook.addWorksheet("Lịch sử giao dịch");

    // Tiêu đề báo cáo
    sheet.mergeCells("A1:J1");
    const titleCell = sheet.getCell("A1");
    titleCell.value = "DANH SÁCH GIAO DỊCH GIẢI NGÂN";
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
      "Trạng thái GD",
      "Trạng thái đối soát",
      "Người duyệt",
      "Người tạo",
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
      const row = sheet.getRow(7 + idx);
      row.values = [
        `GD${tx.transactionId}`,
        tx.loai,
        tx.doiTuong?.tenVaiTro || tx.nguoiTao?.tenVaiTro || tx.nguoiDuyet?.tenVaiTro || "—",
        tx.quy?.tenQuy || "—",
        Number(tx.soTien || 0),
        tx.trangThai,
        tx.doiSoatTrangThai,
        tx.nguoiDuyet?.hoTen || "—",
        tx.nguoiTao?.hoTen || "—",
        new Date(tx.ngayGiaoDich).toLocaleString("vi-VN")
      ];

      // Format số tiền
      row.getCell(5).numFmt = '#,##0" đ"';
      row.getCell(5).alignment = { horizontal: "right" };

      // Căn giữa loại và đối soát
      row.getCell(2).alignment = { horizontal: "center" };
      row.getCell(7).alignment = { horizontal: "center" };

      // Tô màu đỏ cột loại Chi
      row.getCell(2).font = { color: { argb: "FFDC2626" }, bold: true };

      // Highlight giao dịch bất thường
      if (tx.trangThai === "That bai" || tx.doiSoatTrangThai === "Bat_thuong") {
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

// ═══════════════════════════════════════════════════════════════════════════════
// ─── PATCH /api/transactions/:id/doi-soat (CẬP NHẬT TRẠNG THÁI ĐỐI SOÁT) ─────
// ═══════════════════════════════════════════════════════════════════════════════
export const updateDoiSoatStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { doiSoatTrangThai, ghiChu, soTienThucTe } = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "ID giao dịch không hợp lệ",
      });
    }

    const validStatuses = ['Chua_doi_soat', 'Da_doi_soat', 'Bat_thuong'];
    if (!doiSoatTrangThai || !validStatuses.includes(doiSoatTrangThai)) {
      return res.status(400).json({
        success: false,
        message: "Trạng thái đối soát không hợp lệ",
      });
    }

    const transaction = await TransactionModel.getTransactionById(id);
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy giao dịch",
      });
    }

    let finalSoTienThucTe = soTienThucTe !== undefined ? soTienThucTe : transaction.sotienthucte;
    let finalGhiChu = ghiChu !== undefined ? ghiChu : transaction.doisoatghichu;
    let finalDoiSoatBoiId = req.user.id;

    if (doiSoatTrangThai === 'Chua_doi_soat') {
      finalSoTienThucTe = null;
      finalGhiChu = null;
      finalDoiSoatBoiId = null;
    } else if (doiSoatTrangThai === 'Da_doi_soat' && finalSoTienThucTe === null) {
      finalSoTienThucTe = transaction.sotien;
    }

    await TransactionModel.updateDoiSoatStatus(id, doiSoatTrangThai, finalSoTienThucTe, finalDoiSoatBoiId, finalGhiChu);

    return res.status(200).json({
      success: true,
      message: "Cập nhật trạng thái đối soát thành công",
    });
  } catch (error) {
    console.error("Lỗi updateDoiSoatStatus:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau",
    });
  }
};

export default {
  getAllTransactions,
  getTransactionById,
  getTransactionsSummary,
  exportTransactions,
  updateDoiSoatStatus,
};
