import TransactionModel from "../../models/transactions/TransactionModel.js";
import PheDuyetModel from "../../models/applications/PheDuyetModel.js";
import DonationModel from "../../models/donations/DonationModel.js";
import DuToanModel from "../../models/reports/DuToanModel.js";
import ExcelJS from "exceljs";

const VALID_DOI_SOAT_STATUSES = ['Chua_doi_soat', 'Da_doi_soat', 'Bat_thuong'];

const DOI_SOAT_STATUS_LABELS = {
  Chua_doi_soat: 'Chưa đối soát',
  Da_doi_soat: 'Đã đối soát',
  Bat_thuong: 'Bất thường',
};

const TRANSACTION_STATUS_LABELS = {
  'Thanh cong': 'Thành công',
  'That bai': 'Thất bại',
  'Dang xu ly': 'Đang xử lý',
};

const parseDoiSoatStatuses = (value) => {
  if (!value) return [];
  const rawValues = Array.isArray(value) ? value : String(value).split(',');
  return [...new Set(
    rawValues
      .map((item) => String(item || '').trim())
      .filter(Boolean)
  )];
};

const formatDoiSoatFilter = (statuses) => {
  if (!statuses.length) return undefined;
  return statuses.length === 1 ? statuses[0] : statuses;
};

const formatDateTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleString('vi-VN');
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper to map DB row to frontend Transaction object structure
// Sử dụng cột loaigiaodich và hangmucchi (thêm ở C3) để phân biệt Thu/Chi.
// ─────────────────────────────────────────────────────────────────────────────
const mapTransactionRow = (tx) => {
  if (!tx) return null;

  // Ưu tiên cột loaigiaodich (C3); fallback suy luận cũ
  const loai = tx.loaigiaodich || ((tx.yeucauhotro_id === null && tx.nguoinhan_id === null) ? 'Thu' : 'Chi');
  const hangMucChi = tx.hangmucchi || (tx.yeucauhotro_id ? 'Tai_tro_cho_vay' : null);

  return {
    transactionId: tx.giaodich_id,
    loai,
    hangMucChi,
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
        ten: tx.ntt_ten,
        loai: tx.ntt_loai === 'Ca nhan'
          ? 'Cá nhân'
          : tx.ntt_loai === 'To chuc'
            ? 'Tổ chức'
            : tx.ntt_loai === 'Doanh nghiep'
              ? 'Doanh nghiệp'
              : tx.ntt_loai === 'Doi tac'
                ? 'Đối tác'
                : tx.ntt_loai || 'Tài trợ'
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
    nguoiTao: tx.nguoithuchien_id ? {
      id: tx.nguoithuchien_id,
      hoTen: tx.nguoithuchien_hoten
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
      nam,
      keyword
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    if (isNaN(pageNum) || pageNum < 1) {
      return res.status(400).json({ success: false, message: "Trang phải là số nguyên dương" });
    }
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({ success: false, message: "Limit phải từ 1 đến 100" });
    }
    if (loai && !['Thu', 'Chi'].includes(loai)) {
      return res.status(400).json({ success: false, message: "Loại giao dịch phải là 'Thu' hoặc 'Chi'" });
    }
    const validStatuses = ['Thanh cong', 'That bai', 'Dang xu ly'];
    if (trangThai && !validStatuses.includes(trangThai)) {
      return res.status(400).json({ success: false, message: "Trạng thái không hợp lệ" });
    }
    if (doiSoatTrangThai && !VALID_DOI_SOAT_STATUSES.includes(doiSoatTrangThai)) {
      return res.status(400).json({ success: false, message: "Trạng thái đối soát không hợp lệ" });
    }
    if (tuNgay && isNaN(Date.parse(tuNgay))) {
      return res.status(400).json({ success: false, message: "Từ ngày không đúng định dạng (YYYY-MM-DD)" });
    }
    if (denNgay && isNaN(Date.parse(denNgay))) {
      return res.status(400).json({ success: false, message: "Đến ngày không đúng định dạng (YYYY-MM-DD)" });
    }

    if (nam && isNaN(parseInt(nam))) {
      return res.status(400).json({ success: false, message: "Tham số năm không hợp lệ" });
    }
    if (nam && !tuNgay && !denNgay) {
      var effectiveTuNgay = `${nam}-01-01`;
      var effectiveDenNgay = `${nam}-12-31`;
    }

    const filters = {
      loai,
      quyId: quyId ? parseInt(quyId) : null,
      trangThai,
      doiSoatTrangThai,
      tuNgay: typeof effectiveTuNgay !== 'undefined' ? effectiveTuNgay : tuNgay,
      denNgay: typeof effectiveDenNgay !== 'undefined' ? effectiveDenNgay : denNgay,
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
        totalPages,
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
    return res.status(500).json({ success: false, message: "Lỗi server, vui lòng thử lại sau" });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// ─── GET /api/transactions/:id (CHI TIẾT GIAO DỊCH) ───────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
export const getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({ success: false, message: "ID giao dịch không hợp lệ" });
    }

    const transaction = await TransactionModel.getTransactionByIdDetailed(id);

    if (!transaction) {
      return res.status(404).json({ success: false, message: "Không tìm thấy giao dịch" });
    }

    const formatted = mapTransactionRow(transaction);

    let lichSuPheDuyet = [];
    if (formatted.requestId) {
      lichSuPheDuyet = await PheDuyetModel.getPheDuyetByRequestId(formatted.requestId);
    } else if (formatted.khoanTaiTro && formatted.khoanTaiTro.id) {
      lichSuPheDuyet = await DonationModel.getPheDuyetByKhoanTaiTro(formatted.khoanTaiTro.id);
    }

    formatted.lichSuPheDuyet = lichSuPheDuyet;

    return res.status(200).json({
      success: true,
      message: "Lấy thông tin giao dịch thành công",
      data: formatted
    });
  } catch (error) {
    console.error("Lỗi getTransactionById:", error);
    return res.status(500).json({ success: false, message: "Lỗi server, vui lòng thử lại sau" });
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
// ─── POST /api/transactions/chi-khac (GHI NHẬN CHI KHÁC - C3) ─────────────────
// Hạng mục:
//   - Tham_dinh_du_an  → phí thẩm định dự án, không cần dự toán năm
//   - Bo_may_hoat_dong → chi bộ máy, bắt buộc dự toán năm đã duyệt + kiểm tra hạn mức
//   - Nhiem_vu_khac    → nhiệm vụ khác, không cần dự toán năm
// ═══════════════════════════════════════════════════════════════════════════════
export const createChiKhac = async (req, res) => {
  try {
    const {
      quyId,
      sotien,
      hangmucchi,
      hinhthuc,
      ghichu,
      ngaygiaodich,
      chungtu
    } = req.body;
    const nguoiThucHienId = req.user.id;

    // ── Validate bắt buộc
    if (!quyId || !sotien || !hangmucchi) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin bắt buộc: quyId, sotien, hangmucchi"
      });
    }

    const VALID_HANG_MUC = ['Tham_dinh_du_an', 'Bo_may_hoat_dong', 'Nhiem_vu_khac'];
    if (!VALID_HANG_MUC.includes(hangmucchi)) {
      return res.status(400).json({
        success: false,
        message: `Hạng mục chi không hợp lệ. Chỉ chấp nhận: ${VALID_HANG_MUC.join(', ')}`
      });
    }

    const soTienNum = parseFloat(sotien);
    if (isNaN(soTienNum) || soTienNum <= 0) {
      return res.status(400).json({
        success: false,
        message: "Số tiền phải lớn hơn 0"
      });
    }

    // ── Nếu là Bo_may_hoat_dong: kiểm tra dự toán năm đã được duyệt và không vượt hạn mức
    if (hangmucchi === 'Bo_may_hoat_dong') {
      const ngay = ngaygiaodich ? new Date(ngaygiaodich) : new Date();
      const namTaiChinh = ngay.getFullYear();

      const limitCheck = await DuToanModel.checkLimit(namTaiChinh, soTienNum);

      if (!limitCheck.exists) {
        return res.status(400).json({
          success: false,
          message: `Chưa có dự toán bộ máy hoạt động năm ${namTaiChinh} được phê duyệt. Vui lòng đề xuất và duyệt dự toán trước.`,
          code: 'NO_APPROVED_BUDGET'
        });
      }

      if (!limitCheck.approved) {
        return res.status(400).json({
          success: false,
          message: `Dự toán năm ${namTaiChinh} chưa được duyệt. Vui lòng chờ Admin phê duyệt.`,
          code: 'BUDGET_NOT_APPROVED'
        });
      }

      if (limitCheck.vuotDuToan) {
        return res.status(400).json({
          success: false,
          message: `Chi vượt hạn mức dự toán năm ${namTaiChinh}. Đã chi: ${limitCheck.luyKeDaChi.toLocaleString('vi-VN')}đ / Dự toán: ${limitCheck.soTienDuToan.toLocaleString('vi-VN')}đ. Còn lại: ${limitCheck.conLai.toLocaleString('vi-VN')}đ`,
          code: 'BUDGET_EXCEEDED',
          data: {
            soTienDuToan: limitCheck.soTienDuToan,
            daChi: limitCheck.luyKeDaChi,
            conLai: limitCheck.conLai,
            soTienYeuCau: soTienNum
          }
        });
      }
    }

    // ── Tạo giao dịch
    const newTx = await TransactionModel.createTransaction({
      quyId: parseInt(quyId),
      yeucauhotroId: null,         // Không phải chi tài trợ sinh viên
      nguoiNhanId: null,           // Không có người nhận (chi vận hành)
      soTien: soTienNum,
      hinhThuc: hinhthuc || 'Chuyen khoan',
      maGiaoDich: null,
      chungTu: chungtu || null,
      ghiChu: ghichu || null,
      nguoiThucHienId,
      ngayGiaoDich: ngaygiaodich || null,
      loaiGiaoDich: 'Chi',
      hangMucChi: hangmucchi,
      trangThai: 'Thanh cong'
    });

    return res.status(201).json({
      success: true,
      message: `Ghi nhận chi "${hangmucchi.replace(/_/g, ' ')}" thành công`,
      data: {
        giaodich_id: newTx.insertId,
        hangmucchi,
        sotien: soTienNum,
        loaigiaodich: 'Chi',
        trangthai: 'Thanh cong'
      }
    });

  } catch (error) {
    console.error("Lỗi createChiKhac:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau",
      error: error.message
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// ─── GET /api/transactions/export (XUẤT EXCEL TOÀN BỘ GIAO DỊCH) ─────────────
// ═══════════════════════════════════════════════════════════════════════════════
export const exportTransactions = async (req, res) => {
  try {
    const {
      loai,
      quyId,
      trangThai,
      doiSoatTrangThai,
      tuNgay,
      denNgay,
      nam,
      keyword,
      reportType,
      includeSummary,
      nguoiLap,
      ghiChu,
      selectedMonth,
      selectedYear,
      transactionId,
    } = req.query;

    const parsedTransactionId = transactionId ? parseInt(transactionId, 10) : null;
    if (transactionId && (Number.isNaN(parsedTransactionId) || parsedTransactionId < 1)) {
      return res.status(400).json({ success: false, message: "ID giao dịch không hợp lệ" });
    }

    const doiSoatStatuses = parseDoiSoatStatuses(doiSoatTrangThai);
    const invalidDoiSoatStatuses = doiSoatStatuses.filter(
      (status) => !VALID_DOI_SOAT_STATUSES.includes(status)
    );
    if (invalidDoiSoatStatuses.length > 0) {
      return res.status(400).json({ success: false, message: "Trạng thái đối soát không hợp lệ" });
    }

    let effectiveTuNgay = tuNgay;
    let effectiveDenNgay = denNgay;
    if (nam && !tuNgay && !denNgay) {
      effectiveTuNgay = `${nam}-01-01`;
      effectiveDenNgay = `${nam}-12-31`;
    }

    const filters = {
      loai,
      quyId: quyId ? parseInt(quyId) : null,
      trangThai,
      doiSoatTrangThai: formatDoiSoatFilter(doiSoatStatuses),
      transactionId: parsedTransactionId,
      tuNgay: effectiveTuNgay,
      denNgay: effectiveDenNgay,
      keyword: keyword?.trim() || null
    };

    const result = await TransactionModel.getAllTransactions(filters, 100000, 0);
    const transactions = result.transactions.map(mapTransactionRow);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "TVU Fund Management";
    workbook.created = new Date();

    const isDoiSoatExport = reportType === 'doi-soat' || doiSoatStatuses.length > 0;
    const sheet = workbook.addWorksheet(isDoiSoatExport ? "Chứng từ đối soát" : "Lịch sử giao dịch");

    const columns = [
      { header: "Mã GD", width: 12 },
      { header: "Loại", width: 10 },
      { header: "Đối tượng", width: 28 },
      { header: "Quỹ", width: 28 },
      { header: "Số tiền hệ thống", width: 18 },
      { header: "Số tiền thực tế", width: 18 },
      { header: "Chênh lệch", width: 18 },
      { header: "Trạng thái GD", width: 16 },
      { header: "Trạng thái đối soát", width: 20 },
      { header: "Ghi chú giao dịch", width: 28 },
      { header: "Ghi chú đối soát", width: 28 },
      { header: "Người đối soát", width: 22 },
      { header: "Ngày giao dịch", width: 22 },
      { header: "Ngày đối soát", width: 22 },
      { header: "Minh chứng", width: 36 },
    ];

    columns.forEach((column, index) => {
      sheet.getColumn(index + 1).width = column.width;
    });

    sheet.mergeCells(1, 1, 1, columns.length);
    const titleCell = sheet.getCell("A1");
    titleCell.value = isDoiSoatExport ? "DANH SÁCH CHỨNG TỪ ĐỐI SOÁT" : "DANH SÁCH GIAO DỊCH";
    titleCell.font = { size: 16, bold: true, color: { argb: "FF1A2F5E" } };
    titleCell.alignment = { horizontal: "center", vertical: "middle" };
    sheet.getRow(1).height = 30;

    sheet.getCell("A3").value = "Ngày xuất:";
    sheet.getCell("A3").font = { bold: true };
    sheet.getCell("B3").value = new Date().toLocaleString("vi-VN");

    sheet.getCell("A4").value = "Tổng số giao dịch:";
    sheet.getCell("A4").font = { bold: true };
    sheet.getCell("B4").value = transactions.length;

    sheet.getCell("A5").value = "Trạng thái đối soát:";
    sheet.getCell("A5").font = { bold: true };
    sheet.getCell("B5").value = doiSoatStatuses.length
      ? doiSoatStatuses.map((status) => DOI_SOAT_STATUS_LABELS[status] || status).join(", ")
      : "Tất cả";

    sheet.getCell("A6").value = "Bộ lọc:";
    sheet.getCell("A6").font = { bold: true };
    sheet.getCell("B6").value = [
      parsedTransactionId ? `Mã GD: GD${parsedTransactionId}` : null,
      loai ? `Loại: ${loai}` : null,
      quyId ? `Quỹ ID: ${quyId}` : null,
      tuNgay ? `Từ ngày: ${tuNgay}` : null,
      denNgay ? `Đến ngày: ${denNgay}` : null,
      keyword ? `Từ khóa: ${keyword}` : null,
    ].filter(Boolean).join("; ") || "Không có";

    sheet.getCell("A7").value = "Người lập:";
    sheet.getCell("A7").font = { bold: true };
    sheet.getCell("B7").value = nguoiLap || req.user?.hoTen || req.user?.hoten || req.user?.name || "";

    if (selectedMonth && selectedYear) {
      sheet.getCell("D7").value = "Kỳ đối soát:";
      sheet.getCell("D7").font = { bold: true };
      sheet.getCell("E7").value = `Tháng ${selectedMonth}/${selectedYear}`;
    }

    const tableStartRow = ghiChu ? 10 : 9;
    if (ghiChu) {
      sheet.getCell("A8").value = "Ghi chú:";
      sheet.getCell("A8").font = { bold: true };
      sheet.mergeCells(8, 2, 8, columns.length);
      sheet.getCell("B8").value = ghiChu;
      sheet.getCell("B8").alignment = { wrapText: true };
    }

    const headerRow = sheet.getRow(tableStartRow);
    headerRow.values = columns.map((column) => column.header);
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    headerRow.height = 24;
    headerRow.eachCell((cell) => {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1A2F5E" } };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = {
        top: { style: "thin" }, left: { style: "thin" },
        bottom: { style: "thin" }, right: { style: "thin" }
      };
    });

    transactions.forEach((tx, idx) => {
      const doiTuong = tx.sinhVien
        ? `${tx.sinhVien.hoTen} (${tx.sinhVien.maSoDinhDanh || "—"})`
        : tx.nguoiTao?.hoTen || "—";
      const soTienThucTe = tx.soTienThucTe === null || tx.soTienThucTe === undefined
        ? null : Number(tx.soTienThucTe || 0);
      const chenhLech = soTienThucTe === null ? null : soTienThucTe - Number(tx.soTien || 0);

      const row = sheet.getRow(tableStartRow + 1 + idx);
      row.values = [
        `GD${tx.transactionId}`,
        tx.loai,
        doiTuong,
        tx.quy?.tenQuy || "—",
        Number(tx.soTien || 0),
        soTienThucTe === null ? "" : soTienThucTe,
        chenhLech === null ? "" : chenhLech,
        TRANSACTION_STATUS_LABELS[tx.trangThai] || tx.trangThai || "",
        DOI_SOAT_STATUS_LABELS[tx.doiSoatTrangThai] || tx.doiSoatTrangThai || "",
        tx.ghiChu || "",
        tx.doiSoatGhiChu || "",
        tx.doiSoatBoiTen || "",
        formatDateTime(tx.ngayGiaoDich),
        formatDateTime(tx.doiSoatLuc),
        tx.minhChung || ""
      ];

      row.getCell(5).numFmt = '#,##0" đ"';
      row.getCell(6).numFmt = '#,##0" đ"';
      row.getCell(7).numFmt = '#,##0" đ"';
      row.getCell(5).alignment = { horizontal: "right" };
      row.getCell(6).alignment = { horizontal: "right" };
      row.getCell(7).alignment = { horizontal: "right" };
      row.getCell(2).alignment = { horizontal: "center" };
      row.getCell(8).alignment = { horizontal: "center" };
      row.getCell(9).alignment = { horizontal: "center" };
      row.getCell(2).font = { color: { argb: "FFDC2626" }, bold: true };

      if (tx.trangThai === "That bai" || tx.doiSoatTrangThai === "Bat_thuong") {
        row.eachCell((cell) => {
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFEE2E2" } };
        });
      }

      row.eachCell((cell) => {
        cell.alignment = { ...(cell.alignment || {}), vertical: "middle", wrapText: true };
        cell.border = {
          top: { style: "thin", color: { argb: "FFE2E8F0" } },
          left: { style: "thin", color: { argb: "FFE2E8F0" } },
          bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
          right: { style: "thin", color: { argb: "FFE2E8F0" } }
        };
      });
    });

    sheet.views = [{ state: "frozen", ySplit: tableStartRow }];
    sheet.autoFilter = {
      from: { row: tableStartRow, column: 1 },
      to: { row: tableStartRow, column: columns.length }
    };

    if (includeSummary === 'true') {
      const summarySheet = workbook.addWorksheet("Tóm tắt");
      summarySheet.columns = [{ width: 28 }, { width: 18 }, { width: 20 }];
      summarySheet.mergeCells("A1:C1");
      summarySheet.getCell("A1").value = "TÓM TẮT ĐỐI SOÁT CHỨNG TỪ";
      summarySheet.getCell("A1").font = { size: 15, bold: true, color: { argb: "FF1A2F5E" } };
      summarySheet.getCell("A1").alignment = { horizontal: "center" };

      const tongTienHeThong = transactions.reduce((sum, tx) => sum + Number(tx.soTien || 0), 0);
      const tongTienThucTe = transactions.reduce((sum, tx) => sum + Number(tx.soTienThucTe || 0), 0);
      const statusCounts = VALID_DOI_SOAT_STATUSES.reduce((acc, status) => {
        acc[status] = transactions.filter((tx) => tx.doiSoatTrangThai === status).length;
        return acc;
      }, {});

      const summaryRows = [
        ["Tổng số chứng từ", transactions.length, ""],
        ["Tổng tiền hệ thống", tongTienHeThong, "đ"],
        ["Tổng tiền thực tế", tongTienThucTe, "đ"],
        ["Chênh lệch", tongTienThucTe - tongTienHeThong, "đ"],
        [DOI_SOAT_STATUS_LABELS.Chua_doi_soat, statusCounts.Chua_doi_soat, "chứng từ"],
        [DOI_SOAT_STATUS_LABELS.Da_doi_soat, statusCounts.Da_doi_soat, "chứng từ"],
        [DOI_SOAT_STATUS_LABELS.Bat_thuong, statusCounts.Bat_thuong, "chứng từ"],
      ];

      summaryRows.forEach((values, index) => {
        const row = summarySheet.getRow(3 + index);
        row.values = values;
        row.getCell(1).font = { bold: true };
        if (index >= 1 && index <= 3) row.getCell(2).numFmt = '#,##0" đ"';
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const fileName = `${isDoiSoatExport ? "DoiSoatChungTu" : "LichSuGiaoDich"}_${Date.now()}.xlsx`;
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.setHeader("Content-Length", buffer.length);
    return res.send(buffer);
  } catch (error) {
    console.error("Lỗi exportTransactions:", error);
    return res.status(500).json({ success: false, message: "Lỗi khi xuất Excel", error: error.message });
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
      return res.status(400).json({ success: false, message: "ID giao dịch không hợp lệ" });
    }

    const validStatuses = ['Chua_doi_soat', 'Da_doi_soat', 'Bat_thuong'];
    if (!doiSoatTrangThai || !validStatuses.includes(doiSoatTrangThai)) {
      return res.status(400).json({ success: false, message: "Trạng thái đối soát không hợp lệ" });
    }

    const transaction = await TransactionModel.getTransactionById(id);
    if (!transaction) {
      return res.status(404).json({ success: false, message: "Không tìm thấy giao dịch" });
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

    return res.status(200).json({ success: true, message: "Cập nhật trạng thái đối soát thành công" });
  } catch (error) {
    console.error("Lỗi updateDoiSoatStatus:", error);
    return res.status(500).json({ success: false, message: "Lỗi server, vui lòng thử lại sau" });
  }
};

export default {
  getAllTransactions,
  getTransactionById,
  getTransactionsSummary,
  createChiKhac,
  exportTransactions,
  updateDoiSoatStatus,
};
