import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import ExcelJS from "exceljs";
import pool from "../config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ═══════════════════════════════════════════════════════════════════════════════
// ─── HELPER FUNCTIONS ─────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const formatVND = (n) => {
  if (n === null || n === undefined) return "0";
  return Number(n).toLocaleString("vi-VN");
};

const formatDate = (d) => {
  if (!d) return "";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("vi-VN");
};

const REPORT_LABELS = {
  thu_chi_tong_hop: "BÁO CÁO THU CHI TỔNG HỢP",
  danh_sach_tai_tro: "DANH SÁCH KHOẢN TÀI TRỢ",
  danh_sach_thu_huong: "DANH SÁCH SINH VIÊN THỤ HƯỞNG",
  bao_cao_quy: "BÁO CÁO TÌNH HÌNH CÁC QUỸ",
};

const ALLOWED_TYPES = Object.keys(REPORT_LABELS);

// ═══════════════════════════════════════════════════════════════════════════════
// ─── DATA BUILDERS (TRUY VẤN DB CHO TỪNG LOẠI BÁO CÁO) ────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const getFundName = async (quyId) => {
  if (!quyId) return "Tất cả quỹ";
  const [rows] = await pool.query(
    `SELECT ten_quy FROM Quy WHERE quy_id = ? LIMIT 1`,
    [quyId]
  );
  return rows[0]?.ten_quy || "Tất cả quỹ";
};

// Báo cáo Thu Chi Tổng hợp
const buildThuChiTongHop = async ({ quy_id, tu_ngay, den_ngay }) => {
  const fundFilter = quy_id ? "AND kt.quy_id = ?" : "";
  const fundFilterApp = quy_id ? "AND yc.quy_id = ?" : "";
  const params = quy_id ? [tu_ngay, den_ngay, quy_id] : [tu_ngay, den_ngay];

  // Tổng thu = SUM khoantaitro đã nhận
  const [[thuRow]] = await pool.query(
    `SELECT
       COALESCE(SUM(kt.so_tien), 0) AS tong_thu,
       COUNT(*) AS so_khoan_thu
     FROM khoantaitro kt
     WHERE kt.trang_thai = 'Da nhan'
       AND DATE(kt.ngay_cap_nhat) BETWEEN ? AND ?
       ${fundFilter}`,
    params
  );

  // Tổng chi = SUM yeucauhotro đã giải ngân
  const [[chiRow]] = await pool.query(
    `SELECT
       COALESCE(SUM(yc.so_tien_yeu_cau), 0) AS tong_chi,
       COUNT(*) AS so_don_giai_ngan
     FROM yeucauhotro yc
     WHERE yc.trang_thai IN ('Da giai ngan', 'Da duyet')
       AND DATE(yc.ngay_cap_nhat) BETWEEN ? AND ?
       ${fundFilterApp}`,
    params
  );

  // Danh sách giải ngân chi tiết
  const [rows] = await pool.query(
    `SELECT
       yc.request_id,
       nd.ho_ten,
       nd.ma_so_dinh_danh AS mssv,
       q.ten_quy,
       yc.so_tien_yeu_cau,
       yc.ngay_cap_nhat AS ngay_giai_ngan
     FROM yeucauhotro yc
     INNER JOIN nguoidung nd ON yc.user_id = nd.user_id
     INNER JOIN Quy q ON yc.quy_id = q.quy_id
     WHERE yc.trang_thai IN ('Da giai ngan', 'Da duyet')
       AND DATE(yc.ngay_cap_nhat) BETWEEN ? AND ?
       ${fundFilterApp}
     ORDER BY yc.ngay_cap_nhat DESC`,
    params
  );

  // Sinh viên duy nhất được hỗ trợ
  const [[svRow]] = await pool.query(
    `SELECT COUNT(DISTINCT yc.user_id) AS sinh_vien_ho_tro
     FROM yeucauhotro yc
     WHERE yc.trang_thai IN ('Da giai ngan', 'Da duyet')
       AND DATE(yc.ngay_cap_nhat) BETWEEN ? AND ?
       ${fundFilterApp}`,
    params
  );

  const tenQuy = await getFundName(quy_id);
  const tongThu = parseFloat(thuRow.tong_thu || 0);
  const tongChi = parseFloat(chiRow.tong_chi || 0);

  return {
    ten_bao_cao: REPORT_LABELS.thu_chi_tong_hop,
    ten_quy: tenQuy,
    tu_ngay: formatDate(tu_ngay),
    den_ngay: formatDate(den_ngay),
    ky_bao_cao: `${formatDate(tu_ngay)} → ${formatDate(den_ngay)}`,
    ngay_xuat: formatDate(new Date()),
    nguoi_xuat: "Cán bộ Quỹ",
    tong_thu: formatVND(tongThu),
    so_khoan_thu: thuRow.so_khoan_thu,
    tong_chi: formatVND(tongChi),
    so_don_giai_ngan: chiRow.so_don_giai_ngan,
    so_du_dau_ky: formatVND(0),
    so_du_cuoi_ky: formatVND(tongThu - tongChi),
    sinh_vien_ho_tro: svRow.sinh_vien_ho_tro,
    rows: rows.map((r, idx) => ({
      stt: idx + 1,
      ho_ten: r.ho_ten || "",
      mssv: r.mssv || "—",
      ten_quy: r.ten_quy || "",
      so_tien: formatVND(r.so_tien_yeu_cau),
      ngay_giai_ngan: formatDate(r.ngay_giai_ngan),
    })),
  };
};

// Báo cáo Danh sách Tài trợ
const buildDanhSachTaiTro = async ({ quy_id, tu_ngay, den_ngay }) => {
  const fundFilter = quy_id ? "AND kt.quy_id = ?" : "";
  const params = quy_id ? [tu_ngay, den_ngay, quy_id] : [tu_ngay, den_ngay];

  const [rows] = await pool.query(
    `SELECT
       kt.khoan_tai_tro_id,
       ntt.ten_nha_tai_tro AS ten_nha_tai_tro,
       nd.email,
       q.ten_quy,
       kt.so_tien,
       kt.trang_thai,
       kt.ngay_tai_tro,
       kt.ngay_cap_nhat
     FROM khoantaitro kt
     INNER JOIN nhataitro ntt ON kt.nha_tai_tro_id = ntt.nha_tai_tro_id
     LEFT JOIN nguoidung nd ON ntt.user_id = nd.user_id
     INNER JOIN Quy q ON kt.quy_id = q.quy_id
     WHERE DATE(kt.ngay_tai_tro) BETWEEN ? AND ?
       ${fundFilter}
     ORDER BY kt.ngay_tai_tro DESC`,
    params
  );

  const [[totalRow]] = await pool.query(
    `SELECT
       COUNT(*) AS tong_so_khoan,
       COALESCE(SUM(so_tien), 0) AS tong_tien
     FROM khoantaitro kt
     WHERE DATE(kt.ngay_tai_tro) BETWEEN ? AND ?
       ${fundFilter}`,
    params
  );

  const tenQuy = await getFundName(quy_id);

  return {
    ten_bao_cao: REPORT_LABELS.danh_sach_tai_tro,
    ten_quy: tenQuy,
    tu_ngay: formatDate(tu_ngay),
    den_ngay: formatDate(den_ngay),
    ky_bao_cao: `${formatDate(tu_ngay)} → ${formatDate(den_ngay)}`,
    ngay_xuat: formatDate(new Date()),
    nguoi_xuat: "Cán bộ Quỹ",
    tong_so_khoan: totalRow.tong_so_khoan,
    tong_tien_tai_tro: formatVND(totalRow.tong_tien),
    rows: rows.map((r, idx) => ({
      stt: idx + 1,
      ten_nha_tai_tro: r.ten_nha_tai_tro || "",
      email: r.email || "—",
      ten_quy: r.ten_quy || "",
      so_tien: formatVND(r.so_tien),
      trang_thai: r.trang_thai || "",
      ngay_tao: formatDate(r.ngay_tai_tro),
    })),
  };
};

// Báo cáo Danh sách Thụ hưởng
const buildDanhSachThuHuong = async ({ quy_id, tu_ngay, den_ngay }) => {
  const fundFilter = quy_id ? "AND yc.quy_id = ?" : "";
  const params = quy_id ? [tu_ngay, den_ngay, quy_id] : [tu_ngay, den_ngay];

  const [rows] = await pool.query(
    `SELECT
       yc.request_id,
       nd.ho_ten,
       nd.ma_so_dinh_danh AS mssv,
       nd.khoa_phong,
       nd.email,
       q.ten_quy,
       yc.so_tien_yeu_cau,
       yc.trang_thai,
       yc.ngay_cap_nhat AS ngay_giai_ngan
     FROM yeucauhotro yc
     INNER JOIN nguoidung nd ON yc.user_id = nd.user_id
     INNER JOIN Quy q ON yc.quy_id = q.quy_id
     WHERE yc.trang_thai IN ('Da giai ngan', 'Da duyet')
       AND DATE(yc.ngay_cap_nhat) BETWEEN ? AND ?
       ${fundFilter}
     ORDER BY yc.ngay_cap_nhat DESC`,
    params
  );

  const [[totalRow]] = await pool.query(
    `SELECT
       COUNT(DISTINCT yc.user_id) AS tong_sv,
       COALESCE(SUM(yc.so_tien_yeu_cau), 0) AS tong_tien
     FROM yeucauhotro yc
     WHERE yc.trang_thai IN ('Da giai ngan', 'Da duyet')
       AND DATE(yc.ngay_cap_nhat) BETWEEN ? AND ?
       ${fundFilter}`,
    params
  );

  const tenQuy = await getFundName(quy_id);

  return {
    ten_bao_cao: REPORT_LABELS.danh_sach_thu_huong,
    ten_quy: tenQuy,
    tu_ngay: formatDate(tu_ngay),
    den_ngay: formatDate(den_ngay),
    ky_bao_cao: `${formatDate(tu_ngay)} → ${formatDate(den_ngay)}`,
    ngay_xuat: formatDate(new Date()),
    nguoi_xuat: "Cán bộ Quỹ",
    tong_sv: totalRow.tong_sv,
    tong_tien_giai_ngan: formatVND(totalRow.tong_tien),
    rows: rows.map((r, idx) => ({
      stt: idx + 1,
      ho_ten: r.ho_ten || "",
      mssv: r.mssv || "—",
      khoa_phong: r.khoa_phong || "—",
      ten_quy: r.ten_quy || "",
      so_tien: formatVND(r.so_tien_yeu_cau),
      ngay_giai_ngan: formatDate(r.ngay_giai_ngan),
    })),
  };
};

// Báo cáo theo Quỹ
const buildBaoCaoQuy = async ({ quy_id, tu_ngay, den_ngay }) => {
  const fundFilter = quy_id ? "AND q.quy_id = ?" : "";
  const params = quy_id ? [tu_ngay, den_ngay, tu_ngay, den_ngay, quy_id] : [tu_ngay, den_ngay, tu_ngay, den_ngay];

  const [rows] = await pool.query(
    `SELECT
       q.quy_id,
       q.ten_quy,
       q.loai_quy,
       q.so_du,
       q.trang_thai,
       COALESCE((
         SELECT SUM(kt.so_tien)
         FROM khoantaitro kt
         WHERE kt.quy_id = q.quy_id
           AND kt.trang_thai = 'Da nhan'
           AND DATE(kt.ngay_cap_nhat) BETWEEN ? AND ?
       ), 0) AS tong_thu,
       COALESCE((
         SELECT SUM(yc.so_tien_yeu_cau)
         FROM yeucauhotro yc
         WHERE yc.quy_id = q.quy_id
           AND yc.trang_thai IN ('Da giai ngan', 'Da duyet')
           AND DATE(yc.ngay_cap_nhat) BETWEEN ? AND ?
       ), 0) AS tong_chi,
       (SELECT COUNT(*) FROM yeucauhotro yc WHERE yc.quy_id = q.quy_id) AS so_don
     FROM Quy q
     WHERE 1=1
       ${fundFilter}
     ORDER BY q.so_du DESC`,
    params
  );

  const tenQuy = await getFundName(quy_id);

  return {
    ten_bao_cao: REPORT_LABELS.bao_cao_quy,
    ten_quy: tenQuy,
    tu_ngay: formatDate(tu_ngay),
    den_ngay: formatDate(den_ngay),
    ky_bao_cao: `${formatDate(tu_ngay)} → ${formatDate(den_ngay)}`,
    ngay_xuat: formatDate(new Date()),
    nguoi_xuat: "Cán bộ Quỹ",
    tong_so_quy: rows.length,
    rows: rows.map((r, idx) => ({
      stt: idx + 1,
      ten_quy: r.ten_quy || "",
      loai_quy: r.loai_quy || "Khác",
      so_du: formatVND(r.so_du),
      tong_thu: formatVND(r.tong_thu),
      tong_chi: formatVND(r.tong_chi),
      so_don: r.so_don,
      trang_thai: r.trang_thai || "",
    })),
  };
};

const DATA_BUILDERS = {
  thu_chi_tong_hop: buildThuChiTongHop,
  danh_sach_tai_tro: buildDanhSachTaiTro,
  danh_sach_thu_huong: buildDanhSachThuHuong,
  bao_cao_quy: buildBaoCaoQuy,
};

// ═══════════════════════════════════════════════════════════════════════════════
// ─── EXPORT TO DOCX (DÙNG TEMPLATE) ───────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const exportToDocx = (loaiBaoCao, data) => {
  const templatePath = path.join(
    __dirname,
    "..",
    "templates",
    "bao-cao",
    `${loaiBaoCao}.docx`
  );

  if (!fs.existsSync(templatePath)) {
    throw new Error(
      `Template không tồn tại: ${loaiBaoCao}.docx. Vui lòng chạy "node utils/generateBaoCaoTemplates.js" để tạo template mẫu.`
    );
  }

  const content = fs.readFileSync(templatePath, "binary");
  const zip = new PizZip(content);

  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
  });

  doc.render(data);

  return doc.getZip().generate({
    type: "nodebuffer",
    compression: "DEFLATE",
  });
};

// ═══════════════════════════════════════════════════════════════════════════════
// ─── EXPORT TO XLSX (KHÔNG CẦN TEMPLATE) ──────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const exportToXlsx = async (loaiBaoCao, data) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "TVU Fund Management";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet(REPORT_LABELS[loaiBaoCao]);

  // Tiêu đề báo cáo
  sheet.mergeCells("A1:G1");
  const titleCell = sheet.getCell("A1");
  titleCell.value = REPORT_LABELS[loaiBaoCao];
  titleCell.font = { size: 16, bold: true, color: { argb: "FF1A2F5E" } };
  titleCell.alignment = { horizontal: "center", vertical: "middle" };
  sheet.getRow(1).height = 30;

  // Thông tin chung
  sheet.getCell("A3").value = "Quỹ:";
  sheet.getCell("A3").font = { bold: true };
  sheet.getCell("B3").value = data.ten_quy;

  sheet.getCell("A4").value = "Kỳ báo cáo:";
  sheet.getCell("A4").font = { bold: true };
  sheet.getCell("B4").value = data.ky_bao_cao;

  sheet.getCell("A5").value = "Ngày xuất:";
  sheet.getCell("A5").font = { bold: true };
  sheet.getCell("B5").value = data.ngay_xuat;

  // Header bảng (tùy loại báo cáo)
  let headers = [];
  let dataMapper = null;

  if (loaiBaoCao === "thu_chi_tong_hop") {
    sheet.getCell("A7").value = "Tổng thu:";
    sheet.getCell("A7").font = { bold: true };
    sheet.getCell("B7").value = `${data.tong_thu} đ`;
    sheet.getCell("A8").value = "Tổng chi:";
    sheet.getCell("A8").font = { bold: true };
    sheet.getCell("B8").value = `${data.tong_chi} đ`;
    sheet.getCell("A9").value = "Số dư cuối kỳ:";
    sheet.getCell("A9").font = { bold: true };
    sheet.getCell("B9").value = `${data.so_du_cuoi_ky} đ`;

    headers = ["STT", "Họ tên", "MSSV", "Quỹ", "Số tiền", "Ngày giải ngân"];
    dataMapper = (r) => [
      r.stt,
      r.ho_ten,
      r.mssv,
      r.ten_quy,
      r.so_tien,
      r.ngay_giai_ngan,
    ];
  } else if (loaiBaoCao === "danh_sach_tai_tro") {
    sheet.getCell("A7").value = "Tổng số khoản:";
    sheet.getCell("A7").font = { bold: true };
    sheet.getCell("B7").value = data.tong_so_khoan;
    sheet.getCell("A8").value = "Tổng tiền tài trợ:";
    sheet.getCell("A8").font = { bold: true };
    sheet.getCell("B8").value = `${data.tong_tien_tai_tro} đ`;

    headers = ["STT", "Nhà tài trợ", "Email", "Quỹ", "Số tiền", "Trạng thái", "Ngày tạo"];
    dataMapper = (r) => [
      r.stt,
      r.ten_nha_tai_tro,
      r.email,
      r.ten_quy,
      r.so_tien,
      r.trang_thai,
      r.ngay_tao,
    ];
  } else if (loaiBaoCao === "danh_sach_thu_huong") {
    sheet.getCell("A7").value = "Tổng sinh viên:";
    sheet.getCell("A7").font = { bold: true };
    sheet.getCell("B7").value = data.tong_sv;
    sheet.getCell("A8").value = "Tổng tiền giải ngân:";
    sheet.getCell("A8").font = { bold: true };
    sheet.getCell("B8").value = `${data.tong_tien_giai_ngan} đ`;

    headers = ["STT", "Họ tên", "MSSV", "Khoa/Phòng", "Quỹ", "Số tiền", "Ngày giải ngân"];
    dataMapper = (r) => [
      r.stt,
      r.ho_ten,
      r.mssv,
      r.khoa_phong,
      r.ten_quy,
      r.so_tien,
      r.ngay_giai_ngan,
    ];
  } else if (loaiBaoCao === "bao_cao_quy") {
    sheet.getCell("A7").value = "Tổng số quỹ:";
    sheet.getCell("A7").font = { bold: true };
    sheet.getCell("B7").value = data.tong_so_quy;

    headers = ["STT", "Tên quỹ", "Loại quỹ", "Số dư", "Tổng thu", "Tổng chi", "Số đơn", "Trạng thái"];
    dataMapper = (r) => [
      r.stt,
      r.ten_quy,
      r.loai_quy,
      r.so_du,
      r.tong_thu,
      r.tong_chi,
      r.so_don,
      r.trang_thai,
    ];
  }

  // Bảng dữ liệu
  const headerRowIdx = 11;
  const headerRow = sheet.getRow(headerRowIdx);
  headerRow.values = headers;
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF1A2F5E" },
    };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });
  headerRow.height = 24;

  if (dataMapper) {
    data.rows.forEach((row, idx) => {
      const dataRow = sheet.getRow(headerRowIdx + 1 + idx);
      dataRow.values = dataMapper(row);
      dataRow.eachCell((cell) => {
        cell.border = {
          top: { style: "thin", color: { argb: "FFE2E8F0" } },
          left: { style: "thin", color: { argb: "FFE2E8F0" } },
          bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
          right: { style: "thin", color: { argb: "FFE2E8F0" } },
        };
      });
    });
  }

  // Auto width cho columns
  sheet.columns.forEach((col, idx) => {
    let maxLength = headers[idx]?.length || 10;
    col.eachCell?.({ includeEmpty: false }, (cell) => {
      const v = String(cell.value ?? "");
      if (v.length > maxLength) maxLength = v.length;
    });
    col.width = Math.min(maxLength + 4, 40);
  });

  return await workbook.xlsx.writeBuffer();
};

// ═══════════════════════════════════════════════════════════════════════════════
// ─── POST /api/bao-cao/xuat ───────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

export const xuatBaoCao = async (req, res) => {
  try {
    const { loai_bao_cao, quy_id, tu_ngay, den_ngay, dinh_dang } = req.body;

    // Validate
    if (!loai_bao_cao || !tu_ngay || !den_ngay || !dinh_dang) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin bắt buộc: loai_bao_cao, tu_ngay, den_ngay, dinh_dang",
      });
    }

    if (!ALLOWED_TYPES.includes(loai_bao_cao)) {
      return res.status(400).json({
        success: false,
        message: `Loại báo cáo không hợp lệ. Cho phép: ${ALLOWED_TYPES.join(", ")}`,
      });
    }

    if (!["docx", "xlsx"].includes(dinh_dang)) {
      return res.status(400).json({
        success: false,
        message: "Định dạng không hỗ trợ. Chỉ chấp nhận 'docx' hoặc 'xlsx'.",
      });
    }

    // Build data
    const builder = DATA_BUILDERS[loai_bao_cao];
    const data = await builder({ quy_id, tu_ngay, den_ngay });

    // Generate file
    let buffer;
    let contentType;

    if (dinh_dang === "docx") {
      buffer = exportToDocx(loai_bao_cao, data);
      contentType =
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    } else {
      buffer = await exportToXlsx(loai_bao_cao, data);
      contentType =
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    }

    const fileName = `BaoCao_${loai_bao_cao}_${Date.now()}.${dinh_dang}`;

    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.setHeader("Content-Length", buffer.length);
    return res.send(buffer);
  } catch (error) {
    console.error("Lỗi xuatBaoCao:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi xuất báo cáo",
      error: error.message,
    });
  }
};

export default {
  xuatBaoCao,
};
