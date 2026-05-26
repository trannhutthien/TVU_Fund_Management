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

const OUTPUT_DIR = path.join(__dirname, "..", "templates", "bao-cao");

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

const buildDanhSachTaiTro = () =>
  new Document({
    creator: "TVU Fund Management",
    title: "Template - Danh sách Tài trợ",
    sections: [
      {
        children: [
          heading("TRƯỜNG ĐẠI HỌC TRÀ VINH", 26),
          heading("QUỸ PHÁT TRIỂN GIÁO DỤC TVU", 22, COLOR_GOLD),
          plainText("", { spacing: { after: 200 } }),

          subTitle("DANH SÁCH KHOẢN TÀI TRỢ"),
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
          labelLine("Tổng số khoản tài trợ", "{tong_so_khoan}"),
          labelLine("Tổng số tiền", "{tong_tien_tai_tro} đ"),

          sectionTitle("III. CHI TIẾT CÁC KHOẢN"),
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
                  cellHeader("Nhà tài trợ", 24),
                  cellHeader("Email", 22),
                  cellHeader("Quỹ", 22),
                  cellHeader("Số tiền", 14),
                  cellHeader("Ngày", 12),
                ],
              }),
              new TableRow({
                children: [
                  cellLoopStart("{stt}"),
                  cellData("{ten_nha_tai_tro}"),
                  cellData("{email}"),
                  cellData("{ten_quy}"),
                  cellData("{so_tien}", AlignmentType.RIGHT),
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
// MAIN: ghi 4 file ra disk
// ═══════════════════════════════════════════════════════════════════════════════

const TEMPLATES = [
  { name: "thu_chi_tong_hop", builder: buildThuChiTongHop },
  { name: "danh_sach_tai_tro", builder: buildDanhSachTaiTro },
  { name: "danh_sach_thu_huong", builder: buildDanhSachThuHuong },
  { name: "bao_cao_quy", builder: buildBaoCaoQuy },
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

  console.log("\nHoàn tất! 4 template đã được tạo trong:");
  console.log(`  ${OUTPUT_DIR}`);
  console.log("\nBây giờ bạn có thể test xuất báo cáo từ giao diện.");
  console.log("Nếu muốn template đẹp hơn, hãy mở file .docx trong Word và chỉnh sửa,");
  console.log("nhưng GIỮ NGUYÊN các placeholder {ten_bien} và {#rows}...{/rows}.");
};

run().catch((err) => {
  console.error("Lỗi khi tạo template:", err);
  process.exit(1);
});
