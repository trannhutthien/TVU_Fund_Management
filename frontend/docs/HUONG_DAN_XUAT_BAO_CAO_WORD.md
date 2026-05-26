 # Hướng dẫn xuất Báo cáo Word (.docx) cho TVU Fund Management

> File này mô tả **kiến trúc thực tế** đã được triển khai trên project.
> Backend đã **chạy được** — chỉ cần đọc tài liệu này khi muốn **chỉnh template** hoặc **thêm loại báo cáo mới**.

---

## Mục lục

1. [Tổng quan kiến trúc](#1-tổng-quan-kiến-trúc)
2. [Các file đã tạo](#2-các-file-đã-tạo)
3. [Cách khởi tạo lại template](#3-cách-khởi-tạo-lại-template)
4. [Cách chỉnh sửa template đẹp hơn](#4-cách-chỉnh-sửa-template-đẹp-hơn)
5. [Thêm loại báo cáo mới](#5-thêm-loại-báo-cáo-mới)
6. [API endpoint](#6-api-endpoint)
7. [Test bằng curl/Postman](#7-test-bằng-curlpostman)
8. [Test trên giao diện](#8-test-trên-giao-diện)
9. [Cú pháp placeholder của docxtemplater](#9-cú-pháp-placeholder-của-docxtemplater)
10. [Troubleshooting — Lỗi thường gặp](#10-troubleshooting--lỗi-thường-gặp)

---

## 1. Tổng quan kiến trúc

```
┌─────────────────────────────┐         ┌──────────────────────────────┐
│       FRONTEND              │  POST   │       BACKEND                │
│ /can-bo/bao-cao             │ ──────▶ │ /api/bao-cao/xuat            │
│                             │         │                              │
│ - User chọn:                │         │ 1. Validate body             │
│   + Loại báo cáo            │         │ 2. Query DB lấy data         │
│   + Quỹ                     │         │ 3. Đọc template .docx        │
│   + Kỳ                      │         │ 4. Fill data bằng            │
│   + Định dạng (docx/xlsx)   │         │    docxtemplater             │
│ - Click "Xuất báo cáo"      │         │ 5. Trả về buffer binary      │
│                             │ ◀────── │                              │
│ - Browser tự download       │         │                              │
└─────────────────────────────┘         └──────────────────────────────┘
```

**Stack đã dùng:**

| Layer | Thư viện |
|---|---|
| Backend HTTP | Express |
| DB | MySQL (mysql2 pool) |
| Sinh file Word | `docxtemplater` + `pizzip` |
| Sinh file Excel | `exceljs` |
| Tạo template ban đầu | `docx` (chỉ chạy 1 lần) |

---

## 2. Các file đã tạo

### Backend

```
backend/
├── controllers/
│   └── baoCaoController.js          ⭐ Logic chính: build data + xuất file
├── routes/
│   └── baoCaoRoutes.js              Đăng ký POST /api/bao-cao/xuat
├── templates/
│   └── bao-cao/                     ⭐ Folder chứa 4 template .docx
│       ├── thu_chi_tong_hop.docx
│       ├── danh_sach_tai_tro.docx
│       ├── danh_sach_thu_huong.docx
│       └── bao_cao_quy.docx
├── utils/
│   └── generateBaoCaoTemplates.js   Script auto-sinh 4 template trên
└── server.js                        Đã thêm: app.use('/api/bao-cao', baoCaoRoutes)
```

### Frontend

```
frontend/src/pages/Staff/CanBo/BaoCaoPage/
├── BaoCaoPage.jsx                   Trang chính
├── XuatBaoCaoPanel/
│   └── XuatBaoCaoPanel.jsx          ⭐ Panel gọi API xuất báo cáo
└── ... (các component khác)
```

---

## 3. Cách khởi tạo lại template

Template đã được auto-generate lần đầu bằng script:

```bash
cd backend
node utils/generateBaoCaoTemplates.js
```

Output:

```
✓ Đã tạo: thu_chi_tong_hop.docx
✓ Đã tạo: danh_sach_tai_tro.docx
✓ Đã tạo: danh_sach_thu_huong.docx
✓ Đã tạo: bao_cao_quy.docx
```

**Khi nào cần chạy lại?**

- Khi muốn **reset** template về mẫu gốc
- Khi muốn **thêm placeholder mới** vào script và regenerate
- Khi nhận project trên máy khác và folder `templates/bao-cao/` bị thiếu

---

## 4. Cách chỉnh sửa template đẹp hơn

Template auto-sinh chỉ là **bộ khung tối thiểu**. Bạn có thể chỉnh sửa đẹp hơn:

### Bước 1: Mở file template trong Word

```
backend/templates/bao-cao/thu_chi_tong_hop.docx
```

Double-click để mở bằng Microsoft Word.

### Bước 2: Chỉnh sửa theo ý muốn

Có thể:
- Đổi font chữ (mặc định Calibri)
- Thêm logo trường ở header (Insert → Picture)
- Thêm watermark "BẢN NHÁP"
- Đổi màu, đường viền bảng
- Thêm phần ghi chú, chữ ký
- Thêm trang bìa

### Bước 3: **TUYỆT ĐỐI** giữ nguyên các placeholder

Các đoạn text dạng `{ten_quy}`, `{tu_ngay}`, `{#rows}...{/rows}` phải **giữ nguyên 100%**.

**Lưu ý quan trọng khi sửa:**

| ✅ Được phép | ❌ Không được phép |
|---|---|
| Thay đổi font/size/color của placeholder | Cắt placeholder làm 2: `{ten` và `_quy}` |
| Đổi vị trí placeholder | Sửa nội dung trong dấu `{}` |
| Thêm text xung quanh placeholder | Đổi `{ten_quy}` thành `{tenQuy}` |
| Bôi đậm/in nghiêng placeholder | Copy placeholder qua font khác làm tách run |

**Mẹo tránh bị tách run:**

1. Tắt smart quotes trong Word: **File → Options → Proofing → AutoCorrect Options → uncheck "Smart quotes"**
2. Sau khi sửa, **bôi đen toàn bộ placeholder** và nhấn `Ctrl + Space` để xóa custom format
3. Hoặc: bôi đen cả đoạn → chọn lại font/size cho đồng nhất

### Bước 4: Save lại file (vẫn định dạng .docx)

Test lại bằng cách xuất báo cáo trên giao diện — nếu lỗi `Multi error: ...` thì placeholder đã bị tách. Quay lại Bước 3.

---

## 5. Thêm loại báo cáo mới

Ví dụ thêm báo cáo `bao_cao_dot` (báo cáo theo đợt phát học bổng):

### Bước 1: Thêm vào `REPORT_LABELS` trong `baoCaoController.js`

```js
const REPORT_LABELS = {
  thu_chi_tong_hop: "BÁO CÁO THU CHI TỔNG HỢP",
  // ... các loại cũ
  bao_cao_dot: "BÁO CÁO ĐỢT PHÁT HỌC BỔNG",   // ← thêm
};
```

### Bước 2: Viết function build data

```js
const buildBaoCaoDot = async ({ quy_id, tu_ngay, den_ngay }) => {
  const [rows] = await pool.query(
    `SELECT ... FROM ... WHERE ngay BETWEEN ? AND ?`,
    [tu_ngay, den_ngay]
  );
  
  return {
    ten_bao_cao: REPORT_LABELS.bao_cao_dot,
    ten_quy: await getFundName(quy_id),
    ky_bao_cao: `${formatDate(tu_ngay)} → ${formatDate(den_ngay)}`,
    ngay_xuat: formatDate(new Date()),
    nguoi_xuat: "Cán bộ Quỹ",
    // ... các field placeholder của template
    rows: rows.map((r, idx) => ({
      stt: idx + 1,
      // ... các field trong row
    })),
  };
};
```

### Bước 3: Đăng ký vào `DATA_BUILDERS`

```js
const DATA_BUILDERS = {
  thu_chi_tong_hop: buildThuChiTongHop,
  // ... cũ
  bao_cao_dot: buildBaoCaoDot,   // ← thêm
};
```

### Bước 4: Thêm vào script auto-generate template

Mở `backend/utils/generateBaoCaoTemplates.js`, thêm function `buildBaoCaoDotTemplate()` tương tự các function đã có, và thêm vào array `TEMPLATES`:

```js
const TEMPLATES = [
  // ... cũ
  { name: "bao_cao_dot", builder: buildBaoCaoDotTemplate },
];
```

Sau đó chạy:

```bash
node utils/generateBaoCaoTemplates.js
```

### Bước 5: Thêm option vào frontend

Mở `frontend/src/pages/Staff/CanBo/BaoCaoPage/XuatBaoCaoPanel/XuatBaoCaoPanel.jsx`, thêm vào `BAO_CAO_TYPES`:

```js
{
  id: 'bao_cao_dot',
  label: 'Báo cáo Đợt',
  icon: HiOutlineCalendarDays,
  desc: 'Báo cáo phát học bổng theo đợt',
},
```

Done — restart backend và test.

---

## 6. API endpoint

### `POST /api/bao-cao/xuat`

**Request body:**

```json
{
  "loai_bao_cao": "thu_chi_tong_hop",
  "quy_id": null,
  "tu_ngay": "2025-01-01",
  "den_ngay": "2025-12-31",
  "dinh_dang": "docx"
}
```

| Trường | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| `loai_bao_cao` | string | ✅ | `'thu_chi_tong_hop' \| 'danh_sach_tai_tro' \| 'danh_sach_thu_huong' \| 'bao_cao_quy'` |
| `quy_id` | number\|null | ✅ | ID quỹ cụ thể, hoặc `null` = tất cả quỹ |
| `tu_ngay` | string | ✅ | Định dạng `YYYY-MM-DD` |
| `den_ngay` | string | ✅ | Định dạng `YYYY-MM-DD` |
| `dinh_dang` | string | ✅ | `'docx' \| 'xlsx'` |

**Response success:**

- Status: `200`
- Header `Content-Type`: `application/vnd.openxmlformats-officedocument.wordprocessingml.document` (cho .docx) hoặc `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` (cho .xlsx)
- Header `Content-Disposition`: `attachment; filename="BaoCao_xxx_yyy.docx"`
- Body: file binary

**Response error:**

- Status: `400` — body sai
- Status: `500` — DB error / template không tồn tại
- Body: `{ "success": false, "message": "...", "error": "..." }`

---

## 7. Test bằng curl/Postman

### Curl

```bash
curl -X POST http://localhost:5001/api/bao-cao/xuat \
  -H "Content-Type: application/json" \
  -d '{
    "loai_bao_cao": "thu_chi_tong_hop",
    "quy_id": null,
    "tu_ngay": "2025-01-01",
    "den_ngay": "2025-12-31",
    "dinh_dang": "docx"
  }' \
  --output BaoCao.docx
```

File `BaoCao.docx` sẽ được lưu tại thư mục hiện tại.

### Postman

1. Method: `POST`
2. URL: `http://localhost:5001/api/bao-cao/xuat`
3. Headers: `Content-Type: application/json`
4. Body → raw → JSON → paste payload mẫu
5. Click **Send and Download** (mũi tên xổ xuống cạnh nút Send)
6. Lưu file → mở bằng Word/Excel

---

## 8. Test trên giao diện

```bash
# Terminal 1 - backend
cd backend
npm run dev    # hoặc: node server.js

# Terminal 2 - frontend
cd frontend
npm run dev
```

1. Truy cập `http://localhost:5173/can-bo/bao-cao` (sau khi đăng nhập role Cán bộ Quỹ)
2. Chọn kỳ → ví dụ "Năm này"
3. Cuộn xuống panel **Xuất Báo cáo**
4. Chọn loại báo cáo → ví dụ "Thu Chi Tổng hợp"
5. Chọn quỹ → "Tất cả quỹ"
6. Định dạng → "Word (.docx)"
7. Click **Xuất báo cáo**
8. Browser tự download file → mở bằng Word

---

## 9. Cú pháp placeholder của docxtemplater

| Cú pháp | Ý nghĩa | Ví dụ |
|---|---|---|
| `{ten_bien}` | Thay thế bằng string | `{ten_quy}` → `Quỹ học bổng TVU` |
| `{#mang}...{/mang}` | Loop qua array | Tạo bảng động |
| `{$index}` | Số thứ tự trong loop (bắt đầu từ 0) | |
| `{#dieu_kien}...{/dieu_kien}` | Hiển thị nếu truthy | |
| `{^dieu_kien}...{/dieu_kien}` | Hiển thị nếu falsy (else) | |

### Ví dụ về loop trong bảng

Trong Word, đặt `{#rows}` ở **cell đầu tiên** của row mẫu và `{/rows}` ở **cell cuối cùng** cùng row:

| `{#rows}{stt}` | `{ho_ten}` | `{mssv}` | `{so_tien}` | `{ngay_giai_ngan}{/rows}` |

docxtemplater sẽ tự nhân row này lên cho mỗi item trong `data.rows`.

---

## 10. Troubleshooting — Lỗi thường gặp

### Lỗi 1: `Multi error: ...`

**Nguyên nhân:** Placeholder bị tách thành nhiều XML run do format không đồng nhất.

**Fix:**
1. Mở template trong Word
2. Chọn cả placeholder `{ten_bien}` bằng cách bôi đen
3. Nhấn `Ctrl + Space` để xóa custom format
4. Hoặc Format → Clear Formatting
5. Save lại file

### Lỗi 2: `Unknown column 'xxx' in 'field list'`

**Nguyên nhân:** Tên cột trong SQL không khớp với database thật.

**Fix:** Kiểm tra schema thực tế bằng cách query trực tiếp DB:

```sql
DESCRIBE khoantaitro;
DESCRIBE nhataitro;
DESCRIBE yeucauhotro;
```

Sau đó sửa lại `baoCaoController.js` cho khớp.

### Lỗi 3: `Template không tồn tại: thu_chi_tong_hop.docx`

**Fix:** Chạy lại script auto-generate:

```bash
cd backend
node utils/generateBaoCaoTemplates.js
```

### Lỗi 4: File `.docx` tải về không mở được, Word báo "corrupted"

**Nguyên nhân:** Response bị parse thành JSON ở frontend.

**Fix:** Kiểm tra `responseType: 'blob'` trong axios request (đã có sẵn trong `XuatBaoCaoPanel.jsx`).

### Lỗi 5: Tải về thì file rỗng / file `index.html`

**Nguyên nhân:** API endpoint không tồn tại, server trả về HTML 404.

**Fix:**
- Kiểm tra `backend/server.js` đã có dòng `app.use("/api/bao-cao", baoCaoRoutes);`
- Restart backend
- Kiểm tra URL frontend đang gọi tới đúng port backend (5001)

### Lỗi 6: Bảng `{#rows}...{/rows}` chỉ render 1 dòng / không lặp

**Nguyên nhân:** Đặt `{#rows}` và `{/rows}` không đúng vị trí trong bảng.

**Fix:**
- `{#rows}` phải đặt **trên cùng row** với data mẫu (trong cell đầu tiên)
- `{/rows}` phải đặt **cùng row** đó (trong cell cuối)
- KHÔNG được đặt ở row riêng

### Lỗi 7: Tiếng Việt bị lỗi (hiển thị `???`)

**Nguyên nhân:** Encoding sai khi đọc template.

**Fix:** Trong `exportToDocx`, đảm bảo dùng `fs.readFileSync(templatePath, "binary")` (đã đúng trong code).

### Lỗi 8: Backend không nhận thấy thay đổi code

**Fix:** Restart backend (`Ctrl+C` rồi `node server.js`), hoặc dùng `nodemon` (`npm run dev`).

---

## Tips nâng cao

### Cache template trong RAM

Đọc template 1 lần khi server khởi động:

```js
const TEMPLATE_CACHE = new Map();

const loadTemplates = () => {
  ALLOWED_TYPES.forEach((type) => {
    const tplPath = path.join(__dirname, "..", "templates", "bao-cao", `${type}.docx`);
    if (fs.existsSync(tplPath)) {
      TEMPLATE_CACHE.set(type, fs.readFileSync(tplPath, "binary"));
    }
  });
};
loadTemplates();  // gọi khi server start
```

### Thêm watermark "BẢN NHÁP"

Trong template Word: **Design → Watermark → Custom** → nhập "{watermark}".

Sau đó pass `watermark: "BẢN NHÁP"` từ controller.

### Background job với báo cáo lớn

Với báo cáo > 5000 dòng, nên đẩy vào queue (Bull + Redis) để xuất bất đồng bộ:

```js
// Pseudo code
const job = await reportQueue.add({ loai_bao_cao, filters });
return res.json({ job_id: job.id, status: "queued" });

// Frontend poll endpoint khác để lấy kết quả
GET /api/bao-cao/status/:job_id
```

### Audit log

Lưu mỗi lần xuất vào bảng `bao_cao_log`:

```sql
CREATE TABLE bao_cao_log (
  log_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  loai_bao_cao VARCHAR(50),
  quy_id INT NULL,
  tu_ngay DATE,
  den_ngay DATE,
  dinh_dang VARCHAR(10),
  ngay_xuat DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## Schema database đã dùng

| Bảng | Cột quan trọng |
|---|---|
| `Quy` | `quy_id`, `ten_quy`, `loai_quy`, `so_du`, `trang_thai`, `ngay_tao`, `ngay_cap_nhat` |
| `yeucauhotro` | `request_id`, `user_id`, `quy_id`, `so_tien_yeu_cau`, `trang_thai`, `ngay_tao`, `ngay_cap_nhat` |
| `nguoidung` | `user_id`, `ho_ten`, `email`, `ma_so_dinh_danh`, `khoa_phong` |
| `khoantaitro` | `khoan_tai_tro_id`, `nha_tai_tro_id`, `quy_id`, `so_tien`, `trang_thai`, `ngay_tai_tro` |
| `nhataitro` | `nha_tai_tro_id`, `ten_nha_tai_tro`, `user_id` |

Trạng thái áp dụng:

- Đơn đã giải ngân: `'Da giai ngan'`, `'Da duyet'`
- Khoản tài trợ đã nhận: `'Da nhan'`

---

> **Status: ✅ ĐÃ TEST HOẠT ĐỘNG**
> 
> Cả 4 loại báo cáo × 2 định dạng (8 tổ hợp) đều trả về file đúng format. File `.docx` mở được bằng Word, file `.xlsx` mở được bằng Excel.
