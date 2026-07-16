// ═══════════════════════════════════════════════════════════════════════════════
// SCRIPT TẠO 4 TEMPLATE .docx MẪU CHO XUẤT BÁO CÁO
// ═══════════════════════════════════════════════════════════════════════════════
//
// CÔNG DỤNG:
//   - Tự sinh ra 4 file template .docx với placeholder {ten_bien}, {#rows}...{/rows}
//   - Đặt vào backend/templates/bao-cao/
//   - Sau đó controllers/baoCaoController.js có thể đọc template để fill data
//
// CÁCH CHẠY:
//   cd backend
//   node utils/generateBaoCaoTemplates.js
//
// LƯU Ý:
//   - File template được sinh tự động chỉ là MẪU ĐƠN GIẢN
//   - Bạn có thể mở file .docx trong Word để chỉnh sửa đẹp hơn (thêm logo, đổi font...)
//   - QUAN TRỌNG: KHÔNG được tách placeholder thành 2 run khác nhau khi chỉnh sửa
//     (ví dụ format chữ {ten ở font khác và _quy} ở font khác sẽ làm placeholder hỏng)
//
// ═══════════════════════════════════════════════════════════════════════════════

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  WidthType,
  ShadingType,
} from "docx";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_DIR = path.join(__dirname, "..", "..", "templates", "bao-cao");

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER: tạo các loại paragraph/cell thường dùng
// ═══════════════════════════════════════════════════════════════════════════════

const COLOR_NAVY = "1A2F5E";
const COLOR_GOLD = "F0A500";

const heading = (text, size = 28, color = COLOR_NAVY) =>
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [
      new TextRun({
        text,
        bold: true,
        size,
        color,
      }),
    ],
  });

const subTitle = (text) =>
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text, bold: true, size: 32, color: COLOR_NAVY })],
    spacing: { before: 200, after: 100 },
  });

const sectionTitle = (text) =>
  new Paragraph({
    children: [
      new TextRun({ text, bold: true, size: 24, color: COLOR_GOLD }),
    ],
    spacing: { before: 240, after: 120 },
  });

const labelLine = (label, valuePlaceholder) =>
  new Paragraph({
    children: [
      new TextRun({ text: `${label}: `, bold: true, size: 22 }),
      // ⚠️ Placeholder phải nằm trong 1 TextRun duy nhất (không tách)
      new TextRun({ text: valuePlaceholder, size: 22 }),
    ],
    spacing: { after: 60 },
  });

const plainText = (text, opts = {}) =>
  new Paragraph({
    alignment: opts.align || AlignmentType.LEFT,
    children: [
      new TextRun({
        text,
        bold: opts.bold,
        italics: opts.italic,
        size: opts.size || 22,
        color: opts.color,
      }),
    ],
    spacing: opts.spacing || { after: 80 },
  });

const cellHeader = (text, width) =>
  new TableCell({
    width: { size: width, type: WidthType.PERCENTAGE },
    shading: {
      type: ShadingType.CLEAR,
      color: "auto",
      fill: COLOR_NAVY,
    },
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ text, bold: true, color: "FFFFFF", size: 22 }),
        ],
      }),
    ],
  });

// Cell có placeholder. Mỗi cell một text run duy nhất để không bị tách.
const cellData = (placeholder, align = AlignmentType.LEFT) =>
  new TableCell({
    children: [
      new Paragraph({
        alignment: align,
        children: [new TextRun({ text: placeholder, size: 22 })],
      }),
    ],
  });

// Cell chứa cú pháp loop {#rows} / {/rows} kết hợp với placeholder
// Phải đặt {#rows} và {/rows} trong cùng cell để docxtemplater hiểu đúng
const cellLoopStart = (placeholder) =>
  new TableCell({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: `{#rows}${placeholder}`, size: 22 })],
      }),
    ],
  });

const cellLoopEnd = (placeholder, align = AlignmentType.LEFT) =>
  new TableCell({
    children: [
      new Paragraph({
        alignment: align,
        children: [new TextRun({ text: `${placeholder}{/rows}`, size: 22 })],
      }),
    ],
  });

const cellLoopStartVar = (varName, placeholder) =>
  new TableCell({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: `{#${varName}}${placeholder}`, size: 22 })],
      }),
    ],
  });

const cellLoopEndVar = (varName, placeholder, align = AlignmentType.LEFT) =>
  new TableCell({
    children: [
      new Paragraph({
        alignment: align,
        children: [new TextRun({ text: `${placeholder}{/${varName}}`, size: 22 })],
      }),
    ],
  });

// ═══════════════════════════════════════════════════════════════════════════════
// TEMPLATE 1: Báo cáo Thu Chi Tổng hợp
// ═══════════════════════════════════════════════════════════════════════════════

const buildThuChiTongHop = () =>
  new Document({
    creator: "TVU Fund Management",
    title: "Template - Báo cáo Thu Chi Tổng hợp",
    sections: [
      {
        properties: {},
        children: [
          heading("TRƯỜNG ĐẠI HỌC TRÀ VINH", 26),
          heading("QUỸ PHÁT TRIỂN GIÁO DỤC TVU", 22, COLOR_GOLD),
          plainText("", { spacing: { after: 200 } }),

          subTitle("BÁO CÁO THU CHI TỔNG HỢP"),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "Kỳ báo cáo: {ky_bao_cao}",
                italics: true,
                size: 22,
              }),
            ],
            spacing: { after: 240 },
          }),

          sectionTitle("I. THÔNG TIN CHUNG"),
          labelLine("Tên báo cáo", "{ten_bao_cao}"),
          labelLine("Quỹ", "{ten_quy}"),
          labelLine("Từ ngày", "{tu_ngay}"),
          labelLine("Đến ngày", "{den_ngay}"),
          labelLine("Ngày xuất", "{ngay_xuat}"),
          labelLine("Người xuất", "{nguoi_xuat}"),

          sectionTitle("II. TỔNG QUAN"),
          labelLine("Tổng thu kỳ này", "{tong_thu} đ"),
          labelLine("Số khoản tài trợ", "{so_khoan_thu}"),
          labelLine("Tổng chi kỳ này", "{tong_chi} đ"),
          labelLine("Số đơn giải ngân", "{so_don_giai_ngan}"),
          labelLine("Số dư cuối kỳ", "{so_du_cuoi_ky} đ"),
          labelLine("Sinh viên được hỗ trợ", "{sinh_vien_ho_tro}"),

          sectionTitle("III. CHI TIẾT GIẢI NGÂN"),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
              bottom: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
              left: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
              right: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
              insideHorizontal: {
                style: BorderStyle.SINGLE,
                size: 2,
                color: "E2E8F0",
              },
              insideVertical: {
                style: BorderStyle.SINGLE,
                size: 2,
                color: "E2E8F0",
              },
            },
            rows: [
              new TableRow({
                tableHeader: true,
                children: [
                  cellHeader("STT", 8),
                  cellHeader("Họ tên", 22),
                  cellHeader("MSSV", 14),
                  cellHeader("Quỹ", 24),
                  cellHeader("Số tiền", 18),
                  cellHeader("Ngày", 14),
                ],
              }),
              new TableRow({
                children: [
                  cellLoopStart("{stt}"),
                  cellData("{ho_ten}"),
                  cellData("{mssv}"),
                  cellData("{ten_quy}"),
                  cellData("{so_tien}", AlignmentType.RIGHT),
                  cellLoopEnd("{ngay_giai_ngan}", AlignmentType.CENTER),
                ],
              }),
            ],
          }),

          sectionTitle("IV. TĂNG TRƯỞNG NGƯỜI DÙNG MỚI (6 THÁNG GẦN NHẤT)"),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
              bottom: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
              left: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
              right: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
              insideHorizontal: {
                style: BorderStyle.SINGLE,
                size: 2,
                color: "E2E8F0",
              },
              insideVertical: {
                style: BorderStyle.SINGLE,
                size: 2,
                color: "E2E8F0",
              },
            },
            rows: [
              new TableRow({
                tableHeader: true,
                children: [
                  cellHeader("STT", 15),
                  cellHeader("Kỳ thời gian", 55),
                  cellHeader("Số lượng đăng ký mới", 30),
                ],
              }),
              new TableRow({
                children: [
                  cellLoopStartVar("user_growth_rows", "{stt}"),
                  cellData("{thang}"),
                  cellLoopEndVar("user_growth_rows", "{count}", AlignmentType.CENTER),
                ],
              }),
            ],
          }),

          sectionTitle("V. PHÂN BỔ SỐ DƯ CHI TIẾT CỦA CÁC QUỸ"),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
              bottom: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
              left: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
              right: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
              insideHorizontal: {
                style: BorderStyle.SINGLE,
                size: 2,
                color: "E2E8F0",
              },
              insideVertical: {
                style: BorderStyle.SINGLE,
                size: 2,
                color: "E2E8F0",
              },
            },
            rows: [
              new TableRow({
                tableHeader: true,
                children: [
                  cellHeader("STT", 10),
                  cellHeader("Tên quỹ", 40),
                  cellHeader("Loại quỹ", 15),
                  cellHeader("Số dư hiện tại", 20),
                  cellHeader("Tỷ lệ chiếm", 15),
                ],
              }),
              new TableRow({
                children: [
                  cellLoopStartVar("fund_distribution_rows", "{stt}"),
                  cellData("{ten_quy}"),
                  cellData("{loai_quy}"),
                  cellData("{so_du}", AlignmentType.RIGHT),
                  cellLoopEndVar("fund_distribution_rows", "{ty_le}", AlignmentType.CENTER),
                ],
              }),
            ],
          }),

          plainText("", { spacing: { before: 400 } }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({
                text: "Trà Vinh, ngày {ngay_xuat}",
                italics: true,
                size: 22,
              }),
            ],
            spacing: { after: 100 },
          }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({ text: "NGƯỜI LẬP BÁO CÁO", bold: true, size: 22 }),
            ],
            spacing: { after: 800 },
          }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({ text: "{nguoi_xuat}", bold: true, size: 22 }),
            ],
          }),
        ],
      },
    ],
  });

// ═══════════════════════════════════════════════════════════════════════════════
// TEMPLATE 2: Danh sách Tài trợ
// ═══════════════════════════════════════════════════════════════════════════════

// TEMPLATE 2: Danh sách Nhà tài trợ
// ═══════════════════════════════════════════════════════════════════════════════

const buildDanhSachNhaTaiTro = () =>
  new Document({
    creator: "TVU Fund Management",
    title: "Template - Danh sách Nhà tài trợ",
    sections: [
      {
        children: [
          heading("TRƯỜNG ĐẠI HỌC TRÀ VINH", 26),
          heading("QUỸ PHÁT TRIỂN GIÁO DỤC TVU", 22, COLOR_GOLD),
          plainText("", { spacing: { after: 200 } }),

          subTitle("DANH SÁCH NHÀ TÀI TRỢ"),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "Kỳ báo cáo: {ky_bao_cao}",
                italics: true,
                size: 22,
              }),
            ],
            spacing: { after: 240 },
          }),

          sectionTitle("I. THÔNG TIN CHUNG"),
          labelLine("Quỹ", "{ten_quy}"),
          labelLine("Từ ngày", "{tu_ngay}"),
          labelLine("Đến ngày", "{den_ngay}"),
          labelLine("Ngày xuất", "{ngay_xuat}"),

          sectionTitle("II. TỔNG QUAN"),
          labelLine("Tổng số nhà tài trợ", "{tong_so_nha_tai_tro}"),

          sectionTitle("III. CHI TIẾT DANH SÁCH"),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
              bottom: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
              left: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
              right: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
              insideHorizontal: {
                style: BorderStyle.SINGLE,
                size: 2,
                color: "E2E8F0",
              },
              insideVertical: {
                style: BorderStyle.SINGLE,
                size: 2,
                color: "E2E8F0",
              },
            },
            rows: [
              new TableRow({
                tableHeader: true,
                children: [
                  cellHeader("STT", 6),
                  cellHeader("Tên nhà tài trợ", 22),
                  cellHeader("Phân loại", 12),
                  cellHeader("Email", 20),
                  cellHeader("Số điện thoại", 14),
                  cellHeader("Số lần", 8),
                  cellHeader("Tổng tài trợ", 18),
                ],
              }),
              new TableRow({
                children: [
                  cellLoopStart("{stt}"),
                  cellData("{ten_nha_tai_tro}"),
                  cellData("{loai}"),
                  cellData("{email}"),
                  cellData("{so_dien_thoai}"),
                  cellData("{so_lan_tai_tro}", AlignmentType.CENTER),
                  cellLoopEnd("{tong_tai_tro}", AlignmentType.RIGHT),
                ],
              }),
            ],
          }),

          plainText("", { spacing: { before: 400 } }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({
                text: "Trà Vinh, ngày {ngay_xuat}",
                italics: true,
                size: 22,
              }),
            ],
            spacing: { after: 100 },
          }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({ text: "NGƯỜI LẬP BÁO CÁO", bold: true, size: 22 }),
            ],
            spacing: { after: 800 },
          }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({ text: "{nguoi_xuat}", bold: true, size: 22 }),
            ],
          }),
        ],
      },
    ],
  });

// ═══════════════════════════════════════════════════════════════════════════════
// TEMPLATE 5: Báo cáo Tổng hợp Người dùng
// ═══════════════════════════════════════════════════════════════════════════════

const buildBaoCaoNguoiDung = () =>
  new Document({
    creator: "TVU Fund Management",
    title: "Template - Báo cáo Tổng hợp Người dùng",
    sections: [
      {
        children: [
          heading("TRƯỜNG ĐẠI HỌC TRÀ VINH", 26),
          heading("QUỸ PHÁT TRIỂN GIÁO DỤC TVU", 22, COLOR_GOLD),
          plainText("", { spacing: { after: 200 } }),

          subTitle("BÁO CÁO TỔNG HỢP NGƯỜI DÙNG"),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "Kỳ báo cáo: {ky_bao_cao}",
                italics: true,
                size: 22,
              }),
            ],
            spacing: { after: 240 },
          }),

          sectionTitle("I. THÔNG TIN CHUNG"),
          labelLine("Từ ngày", "{tu_ngay}"),
          labelLine("Đến ngày", "{den_ngay}"),
          labelLine("Ngày xuất", "{ngay_xuat}"),

          sectionTitle("II. TỔNG QUAN HỆ THỐNG"),
          labelLine("Tổng số người dùng", "{tong_nguoi_dung}"),
          labelLine("Số lượng sinh viên", "{so_sinh_vien}"),
          labelLine("Số lượng nhà tài trợ", "{so_nha_tai_tro}"),
          labelLine("Số lượng cán bộ/nhân viên", "{so_nhan_vien}"),

          sectionTitle("III. CHI TIẾT NGƯỜI DÙNG MỚI ĐĂNG KÝ TRONG KỲ"),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
              bottom: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
              left: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
              right: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
              insideHorizontal: {
                style: BorderStyle.SINGLE,
                size: 2,
                color: "E2E8F0",
              },
              insideVertical: {
                style: BorderStyle.SINGLE,
                size: 2,
                color: "E2E8F0",
              },
            },
            rows: [
              new TableRow({
                tableHeader: true,
                children: [
                  cellHeader("STT", 6),
                  cellHeader("Họ tên", 20),
                  cellHeader("Mã định danh", 14),
                  cellHeader("Email", 22),
                  cellHeader("Số điện thoại", 14),
                  cellHeader("Loại TK", 12),
                  cellHeader("Ngày tạo", 12),
                ],
              }),
              new TableRow({
                children: [
                  cellLoopStart("{stt}"),
                  cellData("{ho_ten}"),
                  cellData("{ma_so_dinh_danh}"),
                  cellData("{email}"),
                  cellData("{so_dien_thoai}"),
                  cellData("{loai_tai_khoan}"),
                  cellLoopEnd("{ngay_tao}", AlignmentType.CENTER),
                ],
              }),
            ],
          }),

          plainText("", { spacing: { before: 400 } }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({
                text: "Trà Vinh, ngày {ngay_xuat}",
                italics: true,
                size: 22,
              }),
            ],
            spacing: { after: 100 },
          }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({ text: "NGƯỜI LẬP BÁO CÁO", bold: true, size: 22 }),
            ],
            spacing: { after: 800 },
          }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({ text: "{nguoi_xuat}", bold: true, size: 22 }),
            ],
          }),
        ],
      },
    ],
  });

// ═══════════════════════════════════════════════════════════════════════════════
// TEMPLATE 6: Báo cáo Đề xuất Hỗ trợ
// ═══════════════════════════════════════════════════════════════════════════════

const buildBaoCaoDeXuat = () =>
  new Document({
    creator: "TVU Fund Management",
    title: "Template - Báo cáo Đề xuất Hỗ trợ",
    sections: [
      {
        children: [
          heading("TRƯỜNG ĐẠI HỌC TRÀ VINH", 26),
          heading("QUỸ PHÁT TRIỂN GIÁO DỤC TVU", 22, COLOR_GOLD),
          plainText("", { spacing: { after: 200 } }),

          subTitle("BÁO CÁO ĐỀ XUẤT HỖ TRỢ"),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "Kỳ báo cáo: {ky_bao_cao}",
                italics: true,
                size: 22,
              }),
            ],
            spacing: { after: 240 },
          }),

          sectionTitle("I. THÔNG TIN CHUNG"),
          labelLine("Quỹ", "{ten_quy}"),
          labelLine("Từ ngày", "{tu_ngay}"),
          labelLine("Đến ngày", "{den_ngay}"),
          labelLine("Ngày xuất", "{ngay_xuat}"),

          sectionTitle("II. TỔNG QUAN ĐỀ XUẤT TRONG KỲ"),
          labelLine("Tổng số đơn tiếp nhận", "{tong_don}"),
          labelLine("Số đơn đã giải ngân", "{so_don_giai_ngan}"),
          labelLine("Số đơn từ chối", "{so_don_tu_choi}"),
          labelLine("Số đơn chờ xử lý", "{so_don_cho_xu_ly}"),
          labelLine("Tổng tiền đề nghị hỗ trợ", "{tong_tien_de_nghi} đ"),
          labelLine("Tổng tiền đã phê duyệt giải ngân", "{tong_tien_da_duyet} đ"),

          sectionTitle("III. CHI TIẾT CÁC ĐƠN ĐỀ XUẤT HỖ TRỢ"),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
              bottom: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
              left: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
              right: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
              insideHorizontal: {
                style: BorderStyle.SINGLE,
                size: 2,
                color: "E2E8F0",
              },
              insideVertical: {
                style: BorderStyle.SINGLE,
                size: 2,
                color: "E2E8F0",
              },
            },
            rows: [
              new TableRow({
                tableHeader: true,
                children: [
                  cellHeader("STT", 6),
                  cellHeader("Họ tên sinh viên", 20),
                  cellHeader("MSSV", 12),
                  cellHeader("Quỹ yêu cầu", 22),
                  cellHeader("Số tiền", 14),
                  cellHeader("Trạng thái", 14),
                  cellHeader("Ngày nộp", 12),
                ],
              }),
              new TableRow({
                children: [
                  cellLoopStart("{stt}"),
                  cellData("{ho_ten}"),
                  cellData("{mssv}"),
                  cellData("{ten_quy}"),
                  cellData("{so_tien}", AlignmentType.RIGHT),
                  cellData("{trang_thai}"),
                  cellLoopEnd("{ngay_nop}", AlignmentType.CENTER),
                ],
              }),
            ],
          }),

          plainText("", { spacing: { before: 400 } }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({
                text: "Trà Vinh, ngày {ngay_xuat}",
                italics: true,
                size: 22,
              }),
            ],
            spacing: { after: 100 },
          }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({ text: "NGƯỜI LẬP BÁO CÁO", bold: true, size: 22 }),
            ],
            spacing: { after: 800 },
          }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({ text: "{nguoi_xuat}", bold: true, size: 22 }),
            ],
          }),
        ],
      },
    ],
  });

// ═══════════════════════════════════════════════════════════════════════════════
// TEMPLATE 3: Danh sách Thụ hưởng
// ═══════════════════════════════════════════════════════════════════════════════

const buildDanhSachThuHuong = () =>
  new Document({
    creator: "TVU Fund Management",
    title: "Template - Danh sách Thụ hưởng",
    sections: [
      {
        children: [
          heading("TRƯỜNG ĐẠI HỌC TRÀ VINH", 26),
          heading("QUỸ PHÁT TRIỂN GIÁO DỤC TVU", 22, COLOR_GOLD),
          plainText("", { spacing: { after: 200 } }),

          subTitle("DANH SÁCH SINH VIÊN THỤ HƯỞNG"),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "Kỳ báo cáo: {ky_bao_cao}",
                italics: true,
                size: 22,
              }),
            ],
            spacing: { after: 240 },
          }),

          sectionTitle("I. THÔNG TIN CHUNG"),
          labelLine("Quỹ", "{ten_quy}"),
          labelLine("Từ ngày", "{tu_ngay}"),
          labelLine("Đến ngày", "{den_ngay}"),
          labelLine("Ngày xuất", "{ngay_xuat}"),

          sectionTitle("II. TỔNG QUAN"),
          labelLine("Tổng số sinh viên thụ hưởng", "{tong_sv}"),
          labelLine("Tổng số tiền giải ngân", "{tong_tien_giai_ngan} đ"),

          sectionTitle("III. DANH SÁCH SINH VIÊN"),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
              bottom: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
              left: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
              right: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
              insideHorizontal: {
                style: BorderStyle.SINGLE,
                size: 2,
                color: "E2E8F0",
              },
              insideVertical: {
                style: BorderStyle.SINGLE,
                size: 2,
                color: "E2E8F0",
              },
            },
            rows: [
              new TableRow({
                tableHeader: true,
                children: [
                  cellHeader("STT", 6),
                  cellHeader("Họ tên", 20),
                  cellHeader("MSSV", 12),
                  cellHeader("Khoa/Phòng", 18),
                  cellHeader("Quỹ", 20),
                  cellHeader("Số tiền", 12),
                  cellHeader("Ngày", 12),
                ],
              }),
              new TableRow({
                children: [
                  cellLoopStart("{stt}"),
                  cellData("{ho_ten}"),
                  cellData("{mssv}"),
                  cellData("{khoa_phong}"),
                  cellData("{ten_quy}"),
                  cellData("{so_tien}", AlignmentType.RIGHT),
                  cellLoopEnd("{ngay_giai_ngan}", AlignmentType.CENTER),
                ],
              }),
            ],
          }),

          plainText("", { spacing: { before: 400 } }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({
                text: "Trà Vinh, ngày {ngay_xuat}",
                italics: true,
                size: 22,
              }),
            ],
            spacing: { after: 100 },
          }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({ text: "NGƯỜI LẬP BÁO CÁO", bold: true, size: 22 }),
            ],
            spacing: { after: 800 },
          }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({ text: "{nguoi_xuat}", bold: true, size: 22 }),
            ],
          }),
        ],
      },
    ],
  });

// ═══════════════════════════════════════════════════════════════════════════════
// TEMPLATE 4: Báo cáo theo Quỹ
// ═══════════════════════════════════════════════════════════════════════════════

const buildBaoCaoQuy = () =>
  new Document({
    creator: "TVU Fund Management",
    title: "Template - Báo cáo theo Quỹ",
    sections: [
      {
        children: [
          heading("TRƯỜNG ĐẠI HỌC TRÀ VINH", 26),
          heading("QUỸ PHÁT TRIỂN GIÁO DỤC TVU", 22, COLOR_GOLD),
          plainText("", { spacing: { after: 200 } }),

          subTitle("BÁO CÁO TÌNH HÌNH CÁC QUỸ"),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "Kỳ báo cáo: {ky_bao_cao}",
                italics: true,
                size: 22,
              }),
            ],
            spacing: { after: 240 },
          }),

          sectionTitle("I. THÔNG TIN CHUNG"),
          labelLine("Quỹ", "{ten_quy}"),
          labelLine("Từ ngày", "{tu_ngay}"),
          labelLine("Đến ngày", "{den_ngay}"),
          labelLine("Ngày xuất", "{ngay_xuat}"),
          labelLine("Tổng số quỹ trong báo cáo", "{tong_so_quy}"),

          sectionTitle("II. CHI TIẾT TỪNG QUỸ"),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
              bottom: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
              left: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
              right: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
              insideHorizontal: {
                style: BorderStyle.SINGLE,
                size: 2,
                color: "E2E8F0",
              },
              insideVertical: {
                style: BorderStyle.SINGLE,
                size: 2,
                color: "E2E8F0",
              },
            },
            rows: [
              new TableRow({
                tableHeader: true,
                children: [
                  cellHeader("STT", 5),
                  cellHeader("Tên quỹ", 22),
                  cellHeader("Loại", 12),
                  cellHeader("Số dư", 14),
                  cellHeader("Thu", 14),
                  cellHeader("Chi", 14),
                  cellHeader("Đơn", 8),
                  cellHeader("Trạng thái", 11),
                ],
              }),
              new TableRow({
                children: [
                  cellLoopStart("{stt}"),
                  cellData("{ten_quy}"),
                  cellData("{loai_quy}"),
                  cellData("{so_du}", AlignmentType.RIGHT),
                  cellData("{tong_thu}", AlignmentType.RIGHT),
                  cellData("{tong_chi}", AlignmentType.RIGHT),
                  cellData("{so_don}", AlignmentType.CENTER),
                  cellLoopEnd("{trang_thai}", AlignmentType.CENTER),
                ],
              }),
            ],
          }),

          plainText("", { spacing: { before: 400 } }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({
                text: "Trà Vinh, ngày {ngay_xuat}",
                italics: true,
                size: 22,
              }),
            ],
            spacing: { after: 100 },
          }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({ text: "NGƯỜI LẬP BÁO CÁO", bold: true, size: 22 }),
            ],
            spacing: { after: 800 },
          }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({ text: "{nguoi_xuat}", bold: true, size: 22 }),
            ],
          }),
        ],
      },
    ],
  });

// ═══════════════════════════════════════════════════════════════════════════════
// TEMPLATE: BÁO CÁO TỔNG HỢP NĂM TÀI CHÍNH (Điều 17.2, 18)
// ═══════════════════════════════════════════════════════════════════════════════

const buildBaoCaoNamTaiChinh = () =>
  new Document({
    creator: "TVU Fund Management",
    title: "Template - Báo cáo Tổng hợp Năm Tài chính",
    sections: [
      {
        children: [
          heading("TRƯỜNG ĐẠI HỌC TRÀ VINH", 26),
          heading("QUỸ PHÁT TRIỂN GIÁO DỤC TVU", 22, COLOR_GOLD),
          plainText("", { spacing: { after: 200 } }),

          subTitle("BÁO CÁO TỔNG HỢP NĂM TÀI CHÍNH"),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "{ky_bao_cao}",
                italics: true,
                size: 22,
              }),
            ],
            spacing: { after: 240 },
          }),

          // ── THÔNG TIN CHUNG ────────────────────────────────────────────────
          sectionTitle("I. THÔNG TIN CHUNG"),
          labelLine("Năm tài chính", "{nam_tai_chinh}"),
          labelLine("Ngày xuất", "{ngay_xuat}"),

          // ── KHỐI 1: THU / CHI THỰC TẾ ─────────────────────────────────────
          sectionTitle("II. THU CHI THỰC TẾ"),
          labelLine("Tổng thu", "{tong_thu}"),
          plainText("", { spacing: { after: 40 } }),
          plainText("Chi tiết chi:", { bold: true, spacing: { after: 40 } }),
          labelLine("  + Tài trợ cho vay (tổng)", "{chi_tai_tro_tong}"),
          labelLine("    · Không hoàn lại", "{chi_tai_tro_khong_hoan_lai}"),
          labelLine("    · Có thu hồi", "{chi_tai_tro_co_thu_hoi}"),
          labelLine("  + Thẩm định dự án", "{chi_tham_dinh}"),
          labelLine("  + Bộ máy hoạt động", "{chi_bo_may}"),
          labelLine("  + Nhiệm vụ khác", "{chi_nhiem_vu_khac}"),
          labelLine("Tổng chi", "{tong_chi_cong}"),
          labelLine("Số dư cuối năm", "{so_du_cuoi_nam}"),

          // ── KHỐI 2: CÔNG NỢ PHẢI THU ─────────────────────────────────────
          sectionTitle("III. CÔNG NỢ PHẢI THU"),
          labelLine("Tổng mục thu hồi đang chờ", "{tong_muc_thu_hoi_dang_cho}"),
          new Paragraph({
            children: [
              new TextRun({
                text: "({ghi_chu_cong_no})",
                italics: true,
                size: 20,
                color: "666666",
              }),
            ],
            spacing: { after: 120 },
          }),

          // ── KHỐI 3: PHÂN BỔ NGÂN SÁCH NỘI BỘ ────────────────────────────
          sectionTitle("IV. PHÂN BỔ NGÂN SÁCH NỘI BỘ"),
          labelLine("Tổng đã phân bổ", "{tong_da_phan_bo}"),
          new Paragraph({
            children: [
              new TextRun({
                text: "({ghi_chu_phan_bo})",
                italics: true,
                size: 20,
                color: "666666",
              }),
            ],
            spacing: { after: 120 },
          }),

          // ── KHỐI 4: DỰ TOÁN BỘ MÁY HOẠT ĐỘNG ────────────────────────────
          sectionTitle("V. DỰ TOÁN BỘ MÁY HOẠT ĐỘNG"),
          labelLine("Số tiền dự toán", "{du_toan_bo_may}"),
          labelLine("Đã chi", "{da_chi_bo_may}"),
          labelLine("Còn lại", "{con_lai_bo_may}"),
          labelLine("Trạng thái dự toán", "{trang_thai_du_toan}"),

          // ── KÝ KẾT ────────────────────────────────────────────────────────
          plainText("", { spacing: { before: 400 } }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({
                text: "Trà Vinh, ngày {ngay_xuat}",
                italics: true,
                size: 22,
              }),
            ],
            spacing: { after: 100 },
          }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({ text: "NGƯỜI LẬP BÁO CÁO", bold: true, size: 22 }),
            ],
            spacing: { after: 800 },
          }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({ text: "{nguoi_xuat}", bold: true, size: 22 }),
            ],
          }),
        ],
      },
    ],
  });

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN: ghi 4 file ra disk
// ═══════════════════════════════════════════════════════════════════════════════

const TEMPLATES = [
  { name: "thu_chi_tong_hop", builder: buildThuChiTongHop },
  { name: "danh_sach_nha_tai_tro", builder: buildDanhSachNhaTaiTro },
  { name: "danh_sach_thu_huong", builder: buildDanhSachThuHuong },
  { name: "bao_cao_quy", builder: buildBaoCaoQuy },
  { name: "bao_cao_nguoi_dung", builder: buildBaoCaoNguoiDung },
  { name: "bao_cao_de_xuat", builder: buildBaoCaoDeXuat },
  { name: "bao_cao_nam_tai_chinh", builder: buildBaoCaoNamTaiChinh },
];

const run = async () => {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`Đã tạo thư mục: ${OUTPUT_DIR}`);
  }

  for (const tpl of TEMPLATES) {
    const doc = tpl.builder();
    const buffer = await Packer.toBuffer(doc);
    const outPath = path.join(OUTPUT_DIR, `${tpl.name}.docx`);
    fs.writeFileSync(outPath, buffer);
    console.log(`✓ Đã tạo: ${tpl.name}.docx`);
  }

  console.log("\nHoàn tất! Các template đã được tạo trong:");
  console.log(`  ${OUTPUT_DIR}`);
  console.log("\nBây giờ bạn có thể test xuất báo cáo từ giao diện.");
  console.log("Nếu muốn template đẹp hơn, hãy mở file .docx trong Word và chỉnh sửa,");
  console.log("nhưng GIỮ NGUYÊN các placeholder {ten_bien} và {#rows}...{/rows}.");
};

run().catch((err) => {
  console.error("Lỗi khi tạo template:", err);
  process.exit(1);
});
