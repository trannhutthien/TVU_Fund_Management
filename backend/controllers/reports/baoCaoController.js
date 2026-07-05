import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import ExcelJS from "exceljs";
import pool from "../../config/db.js";

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
  danh_sach_nha_tai_tro: "DANH SÁCH NHÀ TÀI TRỢ",
  danh_sach_thu_huong: "DANH SÁCH SINH VIÊN THỤ HƯỞNG",
  bao_cao_quy: "BÁO CÁO TÌNH HÌNH CÁC QUỸ",
  bao_cao_nguoi_dung: "BÁO CÁO TỔNG HỢP NGƯỜI DÙNG",
  bao_cao_de_xuat: "BÁO CÁO ĐỀ XUẤT HỖ TRỢ",
};

const ALLOWED_TYPES = Object.keys(REPORT_LABELS);

// ═══════════════════════════════════════════════════════════════════════════════
// ─── DATA BUILDERS (TRUY VẤN DB CHO TỪNG LOẠI BÁO CÁO) ────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const getFundName = async (quyId) => {
  if (!quyId) return "Tất cả quỹ";
  const [rows] = await pool.query(
    `SELECT tenquy FROM quy WHERE quy_id = ? LIMIT 1`,
    [quyId]
  );
  return rows[0]?.tenquy || "Tất cả quỹ";
};

// Báo cáo Thu Chi Tổng hợp
const buildThuChiTongHop = async ({ quy_id, tu_ngay, den_ngay }) => {
  const fundFilter = quy_id ? "AND kt.quy_id = ?" : "";
  const fundFilterApp = quy_id ? "AND yc.quy_id = ?" : "";
  const params = quy_id ? [tu_ngay, den_ngay, quy_id] : [tu_ngay, den_ngay];

  // Tổng thu = SUM khoantaitro đã nhận
  const [[thuRow]] = await pool.query(
    `SELECT
       COALESCE(SUM(kt.sotien), 0) AS tong_thu,
       COUNT(*) AS so_khoan_thu
     FROM khoantaitro kt
     WHERE kt.trangthai = 'Da nhan'
       AND DATE(kt.ngaycapnhat) BETWEEN ? AND ?
       ${fundFilter}`,
    params
  );

  // Tổng chi = SUM yeucauhotro đã giải ngân
  const [[chiRow]] = await pool.query(
    `SELECT
       COALESCE(SUM(yc.sotiendenghi), 0) AS tong_chi,
       COUNT(*) AS so_don_giai_ngan
     FROM yeucauhotro yc
     WHERE yc.trangthai IN ('Da giai ngan', 'Da duyet cap 3')
       AND DATE(yc.ngaycapnhat) BETWEEN ? AND ?
       ${fundFilterApp}`,
    params
  );

  // Danh sách giải ngân chi tiết
  const [rows] = await pool.query(
    `SELECT
       yc.yeucauhotro_id,
       nd.hoten,
       nd.masodinhdanh AS mssv,
       q.tenquy,
       yc.sotiendenghi,
       yc.ngaycapnhat AS ngay_giai_ngan
     FROM yeucauhotro yc
     INNER JOIN nguoidung nd ON yc.nguoidung_id = nd.nguoidung_id
     INNER JOIN quy q ON yc.quy_id = q.quy_id
     WHERE yc.trangthai IN ('Da giai ngan', 'Da duyet cap 3')
       AND DATE(yc.ngaycapnhat) BETWEEN ? AND ?
       ${fundFilterApp}
     ORDER BY yc.ngaycapnhat DESC`,
    params
  );

  // Sinh viên duy nhất được hỗ trợ
  const [[svRow]] = await pool.query(
    `SELECT COUNT(DISTINCT yc.nguoidung_id) AS sinh_vien_ho_tro
     FROM yeucauhotro yc
     WHERE yc.trangthai IN ('Da giai ngan', 'Da duyet cap 3')
       AND DATE(yc.ngaycapnhat) BETWEEN ? AND ?
       ${fundFilterApp}`,
    params
  );

  const tenQuy = await getFundName(quy_id);
  const tongThu = parseFloat(thuRow.tong_thu || 0);
  const tongChi = parseFloat(chiRow.tong_chi || 0);

  // ─── THÊM TRUY VẤN CHO CÁC BIỂU ĐỒ MỚI ─────────────────────────────────────
  // 1. Lấy dữ liệu tăng trưởng người dùng 6 tháng gần đây
  const [growthRows] = await pool.query(
    `SELECT
       DATE_FORMAT(ngaytao, '%Y-%m') AS thang_key,
       MONTH(ngaytao) AS thang,
       YEAR(ngaytao) AS nam,
       COUNT(*) AS count
     FROM nguoidung
     WHERE ngaytao >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
     GROUP BY thang_key, thang, nam
     ORDER BY thang_key ASC`
  );

  const monthsCount = 6;
  const userGrowthList = [];
  const now = new Date();
  const growthMap = new Map(growthRows.map((r) => [r.thang_key, r.count]));
  for (let i = monthsCount - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    userGrowthList.push({
      stt: monthsCount - i,
      thang: `T${d.getMonth() + 1}/${d.getFullYear()}`,
      count: growthMap.get(key) || 0,
    });
  }

  // 2. Lấy dữ liệu chi tiết số dư các quỹ
  const [funds] = await pool.query(
    `SELECT tenquy, loaiquy_id, sodu FROM quy ORDER BY sodu DESC`
  );
  const totalBalance = funds.reduce((sum, f) => sum + parseFloat(f.sodu || 0), 0);
  const fundDistList = funds.map((f, idx) => ({
    stt: idx + 1,
    ten_quy: f.tenquy,
    loai_quy: f.loaiquy_id || "Khác",
    so_du: formatVND(f.sodu),
    ty_le: totalBalance > 0 ? `${((parseFloat(f.sodu) / totalBalance) * 100).toFixed(1)}%` : "0%",
  }));

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
      ho_ten: r.hoten || "",
      mssv: r.mssv || "—",
      ten_quy: r.tenquy || "",
      so_tien: formatVND(r.sotiendenghi),
      ngay_giai_ngan: formatDate(r.ngay_giai_ngan),
    })),
    user_growth_rows: userGrowthList,
    fund_distribution_rows: fundDistList,
  };
};

// Báo cáo Danh sách Nhà tài trợ
const buildDanhSachNhaTaiTro = async ({ quy_id, tu_ngay, den_ngay }) => {
  let query = `
    SELECT
      ntt.nhataitro_id,
      ntt.tennhataitro,
      ntt.loainhataitro,
      COALESCE(nd.email, ntt.email, '') AS email,
      COALESCE(nd.sodienthoai, ntt.sodienthoai, '') AS so_dien_thoai,
      COALESCE(nd.diachi, ntt.diachi, '') AS dia_chi,
      COALESCE((
        SELECT SUM(kt.sotien) FROM khoantaitro kt 
        WHERE kt.nhataitro_id = ntt.nhataitro_id AND kt.trangthai = 'Da nhan'
      ), 0) AS tong_so_tien_da_tai_tro,
      COALESCE((
        SELECT COUNT(*) FROM khoantaitro kt 
        WHERE kt.nhataitro_id = ntt.nhataitro_id AND kt.trangthai = 'Da nhan'
      ), 0) AS so_lan_tai_tro,
      ntt.ngaytao
    FROM nhataitro ntt
    LEFT JOIN nguoidung nd ON ntt.nguoidung_id = nd.nguoidung_id
  `;
  const params = [];
  if (quy_id) {
    query += `
      WHERE EXISTS (
        SELECT 1 FROM khoantaitro ktt 
        WHERE ktt.nhataitro_id = ntt.nhataitro_id 
          AND ktt.quy_id = ?
          AND DATE(ktt.ngaytaitro) BETWEEN ? AND ?
      )
    `;
    params.push(quy_id, tu_ngay, den_ngay);
  } else {
    query += `
      WHERE DATE(ntt.ngaytao) BETWEEN ? AND ?
    `;
    params.push(tu_ngay, den_ngay);
  }
  query += ` ORDER BY tong_so_tien_da_tai_tro DESC`;

  const [rows] = await pool.query(query, params);
  const tenQuy = await getFundName(quy_id);

  return {
    ten_bao_cao: REPORT_LABELS.danh_sach_nha_tai_tro,
    ten_quy: tenQuy,
    tu_ngay: formatDate(tu_ngay),
    den_ngay: formatDate(den_ngay),
    ky_bao_cao: `${formatDate(tu_ngay)} → ${formatDate(den_ngay)}`,
    ngay_xuat: formatDate(new Date()),
    nguoi_xuat: "Cán bộ Quỹ",
    tong_so_nha_tai_tro: rows.length,
    rows: rows.map((r, idx) => ({
      stt: idx + 1,
      ten_nha_tai_tro: r.tennhataitro || "",
      loai: r.loainhataitro === "Ca nhan"
        ? "Cá nhân"
        : r.loainhataitro === "To chuc"
          ? "Tổ chức"
          : r.loainhataitro === "Doi tac"
            ? "Đối tác"
            : "Doanh nghiệp",
      email: r.email || "—",
      so_dien_thoai: r.so_dien_thoai || "—",
      dia_chi: r.dia_chi || "—",
      so_lan_tai_tro: r.so_lan_tai_tro || 0,
      tong_tai_tro: formatVND(r.tong_so_tien_da_tai_tro),
    })),
  };
};

// Báo cáo Tổng hợp Người dùng
const buildBaoCaoNguoiDung = async ({ quy_id, tu_ngay, den_ngay }) => {
  const [rows] = await pool.query(
    `SELECT
       nd.nguoidung_id AS user_id,
       nd.hoten AS ho_ten,
       nd.masodinhdanh AS ma_so_dinh_danh,
       nd.email,
       nd.sodienthoai AS so_dien_thoai,
       nd.loaitaikhoan AS loai_tai_khoan,
       vt.tenvaitro AS ten_vai_tro,
       nd.trangthai AS trang_thai,
       nd.ngaytao AS created_at
     FROM nguoidung nd
     INNER JOIN vaitro vt ON nd.vaitro_id = vt.vaitro_id
     WHERE DATE(nd.ngaytao) BETWEEN ? AND ?
     ORDER BY nd.ngaytao DESC`,
    [tu_ngay, den_ngay]
  );

  const [[statsRow]] = await pool.query(
    `SELECT
       COUNT(*) AS tong_nguoi_dung,
       SUM(CASE WHEN loaitaikhoan = 'SINH_VIEN' THEN 1 ELSE 0 END) AS so_sinh_vien,
       SUM(CASE WHEN loaitaikhoan = 'NHA_TAI_TRO' THEN 1 ELSE 0 END) AS so_nha_tai_tro,
       SUM(CASE WHEN vaitro_id IN (1, 2, 3) THEN 1 ELSE 0 END) AS so_nhan_vien
     FROM nguoidung`
  );

  return {
    ten_bao_cao: REPORT_LABELS.bao_cao_nguoi_dung,
    ten_quy: "Tất cả quỹ",
    tu_ngay: formatDate(tu_ngay),
    den_ngay: formatDate(den_ngay),
    ky_bao_cao: `${formatDate(tu_ngay)} → ${formatDate(den_ngay)}`,
    ngay_xuat: formatDate(new Date()),
    nguoi_xuat: "Cán bộ Quỹ",
    tong_nguoi_dung: statsRow.tong_nguoi_dung,
    so_sinh_vien: statsRow.so_sinh_vien,
    so_nha_tai_tro: statsRow.so_nha_tai_tro,
    so_nhan_vien: statsRow.so_nhan_vien,
    rows: rows.map((r, idx) => ({
      stt: idx + 1,
      ho_ten: r.ho_ten || "",
      ma_so_dinh_danh: r.ma_so_dinh_danh || "—",
      email: r.email || "",
      so_dien_thoai: r.so_dien_thoai || "—",
      loai_tai_khoan: r.loai_tai_khoan === "SINH_VIEN" ? "Sinh viên" : (r.loai_tai_khoan === "NHA_TAI_TRO" ? "Nhà tài trợ" : "Nhân viên"),
      ten_vai_tro: r.ten_vai_tro || "",
      trang_thai: r.trang_thai || "",
      ngay_tao: formatDate(r.created_at),
    })),
  };
};

// Báo cáo Đề xuất Hỗ trợ
const buildBaoCaoDeXuat = async ({ quy_id, tu_ngay, den_ngay }) => {
  const fundFilter = quy_id ? "AND yc.quy_id = ?" : "";
  const params = quy_id ? [tu_ngay, den_ngay, quy_id] : [tu_ngay, den_ngay];

  const [rows] = await pool.query(
    `SELECT
       yc.yeucauhotro_id AS request_id,
       nd.hoten AS ho_ten,
       nd.masodinhdanh AS mssv,
       q.tenquy AS ten_quy,
       yc.sotiendenghi AS so_tien_yeu_cau,
       yc.trangthai AS trang_thai,
       yc.ngaynop AS ngay_tao
     FROM yeucauhotro yc
     INNER JOIN nguoidung nd ON yc.nguoidung_id = nd.nguoidung_id
     INNER JOIN quy q ON yc.quy_id = q.quy_id
     WHERE DATE(yc.ngaynop) BETWEEN ? AND ?
       ${fundFilter}
     ORDER BY yc.ngaynop DESC`,
    params
  );

  const [[statsRow]] = await pool.query(
    `SELECT
       COUNT(*) AS tong_don,
       SUM(CASE WHEN trangthai = 'Da giai ngan' THEN 1 ELSE 0 END) AS so_don_giai_ngan,
       SUM(CASE WHEN trangthai = 'Tu choi' THEN 1 ELSE 0 END) AS so_don_tu_choi,
       SUM(CASE WHEN trangthai IN ('Cho duyet cap 1', 'Da duyet cap 1', 'Tu choi cap 1', 'Cho duyet cap 2', 'Da duyet cap 2', 'Tu choi cap 2', 'Cho duyet cap 3', 'Cho giai ngan') THEN 1 ELSE 0 END) AS so_don_cho_xu_ly,
       COALESCE(SUM(sotiendenghi), 0) AS tong_tien_de_nghi,
       COALESCE(SUM(CASE WHEN trangthai = 'Da giai ngan' THEN sotiendenghi ELSE 0 END), 0) AS tong_tien_da_duyet
     FROM yeucauhotro yc
     WHERE DATE(yc.ngaynop) BETWEEN ? AND ?
       ${fundFilter}`,
    params
  );

  const tenQuy = await getFundName(quy_id);

  return {
    ten_bao_cao: REPORT_LABELS.bao_cao_de_xuat,
    ten_quy: tenQuy,
    tu_ngay: formatDate(tu_ngay),
    den_ngay: formatDate(den_ngay),
    ky_bao_cao: `${formatDate(tu_ngay)} → ${formatDate(den_ngay)}`,
    ngay_xuat: formatDate(new Date()),
    nguoi_xuat: "Cán bộ Quỹ",
    tong_don: statsRow.tong_don,
    so_don_giai_ngan: statsRow.so_don_giai_ngan,
    so_don_tu_choi: statsRow.so_don_tu_choi,
    so_don_cho_xu_ly: statsRow.so_don_cho_xu_ly,
    tong_tien_de_nghi: formatVND(statsRow.tong_tien_de_nghi),
    tong_tien_da_duyet: formatVND(statsRow.tong_tien_da_duyet),
    rows: rows.map((r, idx) => ({
      stt: idx + 1,
      ho_ten: r.ho_ten || "",
      mssv: r.mssv || "—",
      ten_quy: r.ten_quy || "",
      so_tien: formatVND(r.so_tien_yeu_cau),
      trang_thai: r.trang_thai === "Da giai ngan" ? "Đã giải ngân" : (r.trang_thai === "Tu choi" ? "Từ chối" : "Đang xử lý"),
      ngay_nop: formatDate(r.ngay_tao),
    })),
  };
};

// Báo cáo Danh sách Thụ hưởng
const buildDanhSachThuHuong = async ({ quy_id, tu_ngay, den_ngay }) => {
  const fundFilter = quy_id ? "AND yc.quy_id = ?" : "";
  const params = quy_id ? [tu_ngay, den_ngay, quy_id] : [tu_ngay, den_ngay];

  const [rows] = await pool.query(
    `SELECT
       yc.yeucauhotro_id AS request_id,
       nd.hoten AS ho_ten,
       nd.masodinhdanh AS mssv,
       dv.tenkhoa AS khoa_phong,
       nd.email,
       q.tenquy AS ten_quy,
       yc.sotiendenghi AS so_tien_yeu_cau,
       yc.trangthai AS trang_thai,
       yc.ngaycapnhat AS ngay_giai_ngan
     FROM yeucauhotro yc
     INNER JOIN nguoidung nd ON yc.nguoidung_id = nd.nguoidung_id
     LEFT JOIN donvihoc dv ON nd.donvihoc_id = dv.donvihoc_id
     INNER JOIN quy q ON yc.quy_id = q.quy_id
     WHERE yc.trangthai IN ('Da giai ngan', 'Da duyet cap 3')
       AND DATE(yc.ngaycapnhat) BETWEEN ? AND ?
       ${fundFilter}
     ORDER BY yc.ngaycapnhat DESC`,
    params
  );

  const [[totalRow]] = await pool.query(
    `SELECT
       COUNT(DISTINCT yc.nguoidung_id) AS tong_sv,
       COALESCE(SUM(yc.sotiendenghi), 0) AS tong_tien
     FROM yeucauhotro yc
     WHERE yc.trangthai IN ('Da giai ngan', 'Da duyet cap 3')
       AND DATE(yc.ngaycapnhat) BETWEEN ? AND ?
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
       q.tenquy AS ten_quy,
       lq.tenloai AS loai_quy,
       q.sodu AS so_du,
       q.trangthai AS trang_thai,
       COALESCE((
         SELECT SUM(kt.sotien)
         FROM khoantaitro kt
         WHERE kt.quy_id = q.quy_id
           AND kt.trangthai = 'Da nhan'
           AND DATE(kt.ngaycapnhat) BETWEEN ? AND ?
       ), 0) AS tong_thu,
       COALESCE((
         SELECT SUM(yc.sotiendenghi)
         FROM yeucauhotro yc
         WHERE yc.quy_id = q.quy_id
           AND yc.trangthai IN ('Da giai ngan', 'Da duyet cap 3')
           AND DATE(yc.ngaycapnhat) BETWEEN ? AND ?
       ), 0) AS tong_chi,
       (SELECT COUNT(*) FROM yeucauhotro yc WHERE yc.quy_id = q.quy_id) AS so_don
     FROM quy q
     LEFT JOIN loaiquy lq ON q.loaiquy_id = lq.loaiquy_id
     WHERE 1=1
       ${fundFilter}
     ORDER BY q.sodu DESC`,
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
  danh_sach_nha_tai_tro: buildDanhSachNhaTaiTro,
  danh_sach_thu_huong: buildDanhSachThuHuong,
  bao_cao_quy: buildBaoCaoQuy,
  bao_cao_nguoi_dung: buildBaoCaoNguoiDung,
  bao_cao_de_xuat: buildBaoCaoDeXuat,
};

// ═══════════════════════════════════════════════════════════════════════════════
// ─── EXPORT TO DOCX (DÙNG TEMPLATE) ───────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const exportToDocx = (loaiBaoCao, data) => {
  const templatePath = path.join(
    __dirname,
    "..",
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
  let headerRowIdx = 11;

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
  } else if (loaiBaoCao === "danh_sach_nha_tai_tro") {
    sheet.getCell("A7").value = "Tổng số nhà tài trợ:";
    sheet.getCell("A7").font = { bold: true };
    sheet.getCell("B7").value = data.tong_so_nha_tai_tro;

    headers = ["STT", "Tên nhà tài trợ", "Loại", "Email", "Số điện thoại", "Địa chỉ", "Số lần tài trợ", "Tổng tiền đã tài trợ"];
    dataMapper = (r) => [
      r.stt,
      r.ten_nha_tai_tro,
      r.loai,
      r.email,
      r.so_dien_thoai,
      r.dia_chi,
      r.so_lan_tai_tro,
      `${r.tong_tai_tro} đ`,
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
  } else if (loaiBaoCao === "bao_cao_nguoi_dung") {
    sheet.getCell("A7").value = "Tổng số người dùng:";
    sheet.getCell("A7").font = { bold: true };
    sheet.getCell("B7").value = data.tong_nguoi_dung;
    sheet.getCell("A8").value = "Số sinh viên:";
    sheet.getCell("A8").font = { bold: true };
    sheet.getCell("B8").value = data.so_sinh_vien;
    sheet.getCell("A9").value = "Số nhà tài trợ:";
    sheet.getCell("A9").font = { bold: true };
    sheet.getCell("B9").value = data.so_nha_tai_tro;
    sheet.getCell("A10").value = "Số nhân viên:";
    sheet.getCell("A10").font = { bold: true };
    sheet.getCell("B10").value = data.so_nhan_vien;

    headerRowIdx = 13;
    headers = ["STT", "Họ tên", "Mã định danh (MSSV/MSCB)", "Email", "Số điện thoại", "Loại tài khoản", "Vai trò", "Trạng thái", "Ngày đăng ký"];
    dataMapper = (r) => [
      r.stt,
      r.ho_ten,
      r.ma_so_dinh_danh,
      r.email,
      r.so_dien_thoai,
      r.loai_tai_khoan,
      r.ten_vai_tro,
      r.trang_thai,
      r.ngay_tao,
    ];
  } else if (loaiBaoCao === "bao_cao_de_xuat") {
    sheet.getCell("A7").value = "Tổng số đơn đề xuất:";
    sheet.getCell("A7").font = { bold: true };
    sheet.getCell("B7").value = data.tong_don;
    sheet.getCell("A8").value = "Đã giải ngân:";
    sheet.getCell("A8").font = { bold: true };
    sheet.getCell("B8").value = data.so_don_giai_ngan;
    sheet.getCell("A9").value = "Từ chối:";
    sheet.getCell("A9").font = { bold: true };
    sheet.getCell("B9").value = data.so_don_tu_choi;
    sheet.getCell("A10").value = "Đang chờ xử lý:";
    sheet.getCell("A10").font = { bold: true };
    sheet.getCell("B10").value = data.so_don_cho_xu_ly;
    sheet.getCell("A11").value = "Tổng tiền đề nghị:";
    sheet.getCell("A11").font = { bold: true };
    sheet.getCell("B11").value = `${data.tong_tien_de_nghi} đ`;
    sheet.getCell("A12").value = "Tổng tiền đã duyệt:";
    sheet.getCell("A12").font = { bold: true };
    sheet.getCell("B12").value = `${data.tong_tien_da_duyet} đ`;

    headerRowIdx = 15;
    headers = ["STT", "Họ tên sinh viên", "MSSV", "Quỹ đề xuất", "Số tiền yêu cầu", "Trạng thái", "Ngày nộp đơn"];
    dataMapper = (r) => [
      r.stt,
      r.ho_ten,
      r.mssv,
      r.ten_quy,
      `${r.so_tien} đ`,
      r.trang_thai,
      r.ngay_nop,
    ];
  }

  // Bảng dữ liệu
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

  if (loaiBaoCao === "thu_chi_tong_hop") {
    // ─── THÊM WORKSHEET TĂNG TRƯỞNG NGƯỜI DÙNG ────────────────────────────────
    const growthSheet = workbook.addWorksheet("Tăng Trưởng Người Dùng");
    growthSheet.mergeCells("A1:C1");
    const growthTitle = growthSheet.getCell("A1");
    growthTitle.value = "TĂNG TRƯỞNG NGƯỜI DÙNG MỚI (6 THÁNG GẦN NHẤT)";
    growthTitle.font = { size: 14, bold: true, color: { argb: "FF1A2F5E" } };
    growthTitle.alignment = { horizontal: "center", vertical: "middle" };
    growthSheet.getRow(1).height = 28;

    const growthHeaders = ["STT", "Tháng/Năm", "Số lượng đăng ký mới"];
    const growthHeaderRow = growthSheet.getRow(3);
    growthHeaderRow.values = growthHeaders;
    growthHeaderRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    growthHeaderRow.eachCell((cell) => {
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
    growthHeaderRow.height = 22;

    if (data.user_growth_rows) {
      data.user_growth_rows.forEach((row, idx) => {
        const dataRow = growthSheet.getRow(4 + idx);
        dataRow.values = [row.stt, row.thang, row.count];
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

    growthSheet.columns.forEach((col, idx) => {
      let maxLength = growthHeaders[idx]?.length || 10;
      col.eachCell?.({ includeEmpty: false }, (cell) => {
        const v = String(cell.value ?? "");
        if (v.length > maxLength) maxLength = v.length;
      });
      col.width = Math.min(maxLength + 4, 40);
    });

    // ─── THÊM WORKSHEET PHÂN BỔ CHI TIẾT CÁC QUỸ ──────────────────────────────
    const distSheet = workbook.addWorksheet("Chi Tiết Các Quỹ");
    distSheet.mergeCells("A1:E1");
    const distTitle = distSheet.getCell("A1");
    distTitle.value = "PHÂN BỔ SỐ DƯ CHI TIẾT CỦA CÁC QUỸ CHỦ QUẢN";
    distTitle.font = { size: 14, bold: true, color: { argb: "FF1A2F5E" } };
    distTitle.alignment = { horizontal: "center", vertical: "middle" };
    distSheet.getRow(1).height = 28;

    const distHeaders = ["STT", "Tên quỹ", "Loại quỹ", "Số dư hiện tại", "Tỷ lệ chiếm"];
    const distHeaderRow = distSheet.getRow(3);
    distHeaderRow.values = distHeaders;
    distHeaderRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    distHeaderRow.eachCell((cell) => {
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
    distHeaderRow.height = 22;

    if (data.fund_distribution_rows) {
      data.fund_distribution_rows.forEach((row, idx) => {
        const dataRow = distSheet.getRow(4 + idx);
        dataRow.values = [row.stt, row.ten_quy, row.loai_quy, `${row.so_du} đ`, row.ty_le];
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

    distSheet.columns.forEach((col, idx) => {
      let maxLength = distHeaders[idx]?.length || 10;
      col.eachCell?.({ includeEmpty: false }, (cell) => {
        const v = String(cell.value ?? "");
        if (v.length > maxLength) maxLength = v.length;
      });
      col.width = Math.min(maxLength + 4, 40);
    });
  }

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

    if (!["docx", "xlsx"].includes(dinh_dang)) {
      return res.status(400).json({
        success: false,
        message: "Định dạng không hỗ trợ. Chỉ chấp nhận 'docx' hoặc 'xlsx'.",
      });
    }

    // Chuẩn hóa loai_bao_cao thành mảng
    let types = [];
    if (Array.isArray(loai_bao_cao)) {
      types = loai_bao_cao;
    } else if (typeof loai_bao_cao === "string") {
      types = [loai_bao_cao];
    }

    if (types.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Không tìm thấy loại báo cáo nào được yêu cầu",
      });
    }

    // Kiểm tra tính hợp lệ của tất cả loại báo cáo
    for (const t of types) {
      if (!ALLOWED_TYPES.includes(t)) {
        return res.status(400).json({
          success: false,
          message: `Loại báo cáo '${t}' không hợp lệ. Cho phép: ${ALLOWED_TYPES.join(", ")}`,
        });
      }
    }

    // Xuất báo cáo
    if (types.length === 1) {
      const loai = types[0];
      const builder = DATA_BUILDERS[loai];
      const data = await builder({ quy_id, tu_ngay, den_ngay });

      let buffer;
      let contentType;

      if (dinh_dang === "docx") {
        buffer = exportToDocx(loai, data);
        contentType =
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      } else {
        buffer = await exportToXlsx(loai, data);
        contentType =
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      }

      const fileName = `BaoCao_${loai}_${Date.now()}.${dinh_dang}`;

      res.setHeader("Content-Type", contentType);
      res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
      res.setHeader("Content-Length", buffer.length);
      return res.send(buffer);
    } else {
      // Xuất nhiều báo cáo cùng lúc dưới dạng file ZIP
      const zip = new PizZip();

      for (const loai of types) {
        const builder = DATA_BUILDERS[loai];
        const data = await builder({ quy_id, tu_ngay, den_ngay });

        const fileBuffer = (dinh_dang === "docx")
          ? exportToDocx(loai, data)
          : await exportToXlsx(loai, data);

        zip.file(`BaoCao_${loai}_${Date.now()}.${dinh_dang}`, fileBuffer);
      }

      const zipBuffer = zip.generate({
        type: "nodebuffer",
        compression: "DEFLATE",
      });

      const zipName = `BaoCao_TongHop_${Date.now()}.zip`;

      res.setHeader("Content-Type", "application/zip");
      res.setHeader("Content-Disposition", `attachment; filename="${zipName}"`);
      res.setHeader("Content-Length", zipBuffer.length);
      return res.send(zipBuffer);
    }
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
