# Kế Hoạch Triển Khai — Mô Hình Quản Lý Quỹ 3 Cấp

**Dự án:** TVU Fund Management
**Ngày lập:** 2026-08-15
**Trạng thái:** Chưa triển khai — chờ thực thi

---

## 0. Các quyết định đã chốt

| # | Quyết định | Nội dung |
|---|-----------|----------|
| 1 | Tên cấp 2 | **Quỹ thành phần** |
| 2 | Case 4 khi từ chối | Tiền **không di chuyển** — vì tiền đã nằm sẵn ở bể chung cấp 2 ngay từ lúc tài trợ được duyệt (xem mục 2) |
| 3 | Quy tắc đặt tên cột | Không dùng `_` trong tên cột, **trừ khi** ngay trước `id` (VD: `quythanhphan_id` ✅, `quy_thanhphan_id` ❌) |
| 4 | Backup dữ liệu cũ | **Không cần** — dữ liệu đã được dọn dẹp trước đó |
| 5 | Trigger / CHECK constraint ở DB | **Không thêm** — validate ở tầng Model (Node.js), giữ nhất quán với style hiện tại của dự án (schema gốc không có trigger nào) |
| 6 | Cột mới | Chỉ thêm cột thực sự cần cho luồng hoạt động, không thêm cột "phòng hờ" |

---

## 1. Làm rõ khái niệm "Bể tiền chung" theo từng cấp

**Không cần bảng hay cột mới cho khái niệm này.** Cột `quy.sodu` đã có sẵn ở mọi cấp — bản thân nó chính là "bể tiền chung" của quỹ đó:

```
Quỹ mẹ (cấp 1).sodu           → Bể tiền chung toàn hệ thống
  Quỹ thành phần (cấp 2).sodu → Bể tiền chung của 1 lĩnh vực (VD: Học bổng)
    Quỹ hoạt động (cấp 3).sodu → Tiền dành riêng cho 1 chương trình cụ thể
```

Việc cần làm không phải là thiết kế "bể tiền" — mà là đảm bảo **tiền tài trợ được ghi nhận (`khoantaitro.quy_id`) đúng vào cấp mà người tài trợ chọn**, và các luồng phân bổ/giải ngân tôn trọng đúng cây phả hệ 3 cấp.

---

## 2. Luồng dữ liệu 4 trường hợp tài trợ (đã tối giản)

| Case | Người tài trợ chọn | `khoantaitro.quy_id` trỏ vào | Code mới cần viết |
|------|---|---|---|
| 1 | Quỹ PT ĐHTV | Quỹ mẹ (cấp 1) | Không — luồng hiện tại |
| 2 | Quỹ Học bổng (không chọn chương trình) | Quỹ thành phần (cấp 2) | Không — luồng hiện tại, chỉ khác là quỹ đích giờ có `capdo=2` |
| 3 | Chương trình cụ thể có sẵn | Quỹ hoạt động (cấp 3) | Không — luồng hiện tại |
| 4 | Quỹ Từ thiện + đề xuất chương trình mới | **Quỹ thành phần (cấp 2)** — giống hệt Case 2 | Có — nhưng chỉ ở bảng `dexuatchuongtrinh` (metadata), **không đụng vào khoản tài trợ** |

### Điểm mấu chốt của thiết kế mới (đơn giản hơn bản đề xuất trước)

Case 4 = **Case 2 + 1 đề xuất đi kèm**. Khoản tài trợ được duyệt và cộng tiền vào `sodu` quỹ thành phần cấp 2 **ngay lập tức**, y hệt quy trình đã có, không chờ đề xuất được duyệt. Bảng `dexuatchuongtrinh` chỉ lưu **ý tưởng chương trình**, không giữ tiền.

```
Nhà tài trợ đề xuất "Trung thu cho SV khó khăn"
        │
        ▼
Khoản tài trợ được duyệt như Case 2 (tiền vào sodu cấp 2 "Từ thiện" ngay)
        │
        ▼
dexuatchuongtrinh được tạo song song (trangthai = 'Cho duyet')
        │
   ┌────┴────┐
   ▼         ▼
DUYỆT      TỪ CHỐI
   │         │
   ▼         ▼
Tạo quy   Không làm gì —
cấp 3     tiền đã ở sẵn
mới       trong bể cấp 2
   │       "Từ thiện" rồi
   ▼
Tạo 1 bản ghi phanbongansach
(quy_nguon = cấp 2, quy_dich = cấp 3 vừa tạo)
→ TÁI SỬ DỤNG nguyên luồng duyệt phân bổ đã có (bao gồm FOR UPDATE locking)
```

**Lợi ích của cách làm này:**
- Không cần logic "giữ tiền chờ duyệt" riêng cho Case 4
- Không cần logic hoàn tiền khi từ chối (đúng yêu cầu #2 ở mục 0)
- Bước duyệt đề xuất → tạo quỹ + chuyển tiền tái dùng 100% cơ chế `phanbongansach` đã viết và test rồi

---

## 3. Thay đổi Schema — Tối giản

### 3.1 Bảng `quy` — chỉ 2 thay đổi

```sql
-- Thay đổi 1: Mở rộng enum, thêm giá trị cấp 2
ALTER TABLE quy
  MODIFY COLUMN loaidieuhanh ENUM(
    'Tap trung - Be chung',    -- Cấp 1: Quỹ mẹ
    'Tap trung - Thanh phan',  -- Cấp 2: Quỹ thành phần (MỚI)
    'Tap trung - Muc chi'      -- Cấp 3: Quỹ hoạt động (giữ nguyên tên cũ)
  ) NOT NULL DEFAULT 'Tap trung - Be chung';

-- Thay đổi 2: Thêm 1 cột duy nhất — capdo (không dùng "_" vì không đứng trước "id")
ALTER TABLE quy
  ADD COLUMN capdo TINYINT(1) NOT NULL DEFAULT 1
    COMMENT '1=Quy me, 2=Quy thanh phan, 3=Quy hoat dong'
    AFTER loaidieuhanh;
```

> Không thêm index, không thêm CHECK constraint, không thêm trigger — nếu sau này cần tối ưu performance thì thêm sau, hiện tại dữ liệu ít (12 dòng `quy`) nên không cần.

### 3.2 Bảng mới `dexuatchuongtrinh` — chỉ metadata, không giữ tiền

```sql
CREATE TABLE dexuatchuongtrinh (
  dexuatchuongtrinh_id INT(11) NOT NULL AUTO_INCREMENT,
  quythanhphan_id INT(11) NOT NULL COMMENT 'FK -> quy cap 2, noi chuong trinh se truc thuoc',
  khoantaitro_id INT(11) DEFAULT NULL COMMENT 'FK -> khoan tai tro di kem de xuat (neu co)',
  nhataitro_id INT(11) DEFAULT NULL COMMENT 'FK -> nguoi de xuat',
  tenchuongtrinh VARCHAR(200) NOT NULL,
  mota TEXT,
  soluongsuat INT(11) NOT NULL COMMENT 'So suat/phan qua',
  sotienmoisuat DECIMAL(15,2) NOT NULL,
  loaihotro ENUM('Tai tro khong hoan lai','Tai tro co thu hoi','Cho vay')
    NOT NULL DEFAULT 'Tai tro khong hoan lai'
    COMMENT 'Dung chung enum voi yeucauhotro.loaihotro de tai su dung component/constants FE',
  ngaybatdau DATE,
  ngayketthuc DATE,
  trangthai ENUM('Cho duyet','Da duyet','Tu choi') NOT NULL DEFAULT 'Cho duyet',
  lydotuchoi TEXT,
  nguoiduyet_id INT(11) DEFAULT NULL COMMENT 'FK -> nguoidung, nguoi duyet cuoi cung',
  ngayduyet TIMESTAMP NULL DEFAULT NULL,
  quyketqua_id INT(11) DEFAULT NULL COMMENT 'FK -> quy cap 3 duoc tao sau khi duyet',
  ngaytao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (dexuatchuongtrinh_id),
  FOREIGN KEY (quythanhphan_id) REFERENCES quy(quy_id),
  FOREIGN KEY (khoantaitro_id) REFERENCES khoantaitro(khoantaitro_id),
  FOREIGN KEY (nhataitro_id) REFERENCES nhataitro(nhataitro_id),
  FOREIGN KEY (nguoiduyet_id) REFERENCES nguoidung(nguoidung_id),
  FOREIGN KEY (quyketqua_id) REFERENCES quy(quy_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**Không có** cột giữ tiền, không có cột trạng thái tiền — vì tiền không đi qua bảng này, chỉ đi qua `khoantaitro` (lúc tài trợ) và `phanbongansach` (lúc duyệt tạo quỹ cấp 3).

---

## 4. Migration dữ liệu hiện có (không backup)

```sql
-- Bước 1: Đánh dấu quỹ mẹ hiện tại là capdo = 1
UPDATE quy SET capdo = 1 WHERE loaidieuhanh = 'Tap trung - Be chung';

-- Bước 2: Tạo quỹ thành phần (cấp 2) cho mỗi loaiquy_id đang có quỹ con cấp 3
INSERT INTO quy (tenquy, loaiquy_id, quy_cha_id, loaidieuhanh, capdo, trangthai, nguoitao_id)
SELECT DISTINCT
  CONCAT('Quỹ thành phần - ', lq.tenloai),
  q.loaiquy_id,
  (SELECT quy_id FROM quy WHERE loaidieuhanh = 'Tap trung - Be chung' LIMIT 1),
  'Tap trung - Thanh phan',
  2,
  'Dang hoat dong',
  1
FROM quy q
JOIN loaiquy lq ON lq.loaiquy_id = q.loaiquy_id
WHERE q.loaidieuhanh = 'Tap trung - Muc chi';

-- Bước 3: Re-parent quỹ hoạt động (cấp 3) hiện tại về đúng quỹ thành phần vừa tạo
UPDATE quy q
JOIN quy thanhphan
  ON thanhphan.loaiquy_id = q.loaiquy_id
  AND thanhphan.loaidieuhanh = 'Tap trung - Thanh phan'
SET q.quy_cha_id = thanhphan.quy_id, q.capdo = 3
WHERE q.loaidieuhanh = 'Tap trung - Muc chi';

-- Bước 4 (verify nhanh — chỉ 1 câu SELECT, không tạo bảng phụ):
SELECT capdo, COUNT(*) AS soluong, SUM(sodu) AS tongsodu
FROM quy GROUP BY capdo ORDER BY capdo;
```

---

## 5. Logic tầng ứng dụng cần cập nhật

| File / Module | Thay đổi |
|---|---|
| `models/funds/FundModel.js` | Thêm hàm validate: quỹ đích của 1 phân bổ phải có `capdo = quỹ nguồn.capdo + 1` (thay thế logic trigger DB) |
| `controllers/applications/applicationController.js` | Đổi điều kiện chặn nộp đơn: từ `loaidieuhanh !== 'Tap trung - Muc chi'` → **`capdo !== 3`** |
| `controllers/donations/donationController.js` | Case 1–3: không đổi. Thêm route mới cho Case 4 (mục 5.1) |
| `controllers/funds/fundController.js` (allocate) | Generalize điều kiện "đích là con hợp lệ của nguồn" — vẫn dùng `quy_cha_id`, không đổi logic, chỉ cần đúng dữ liệu sau migration |
| `page_permissions.json` / route mới | Thêm quyền cho trang duyệt đề xuất chương trình (đề xuất: Cán bộ Quỹ tạo/xem, Admin duyệt) |

### 5.1 Route mới cho Case 4

```
POST /api/donations/propose-program     (Protect 3,4)  → tạo khoantaitro (như Case 2) + dexuatchuongtrinh
GET  /api/donations/propose-program     (Protect 1,3)  → danh sách đề xuất chờ duyệt
PUT  /api/donations/propose-program/:id/approve  (Protect 1)
  → tạo quy (capdo=3, quy_cha_id=quythanhphan_id)
  → tạo phanbongansach (quy_nguon=quythanhphan_id, quy_dich=quy vừa tạo, sotien=soluongsuat*sotienmoisuat)
    (có thể auto-approve bản ghi phanbongansach này luôn, không cần đợi duyệt lần 2,
     vì bản chất Admin đang thực hiện đúng hành động duyệt)
  → cập nhật dexuatchuongtrinh.quyketqua_id, trangthai='Da duyet'
PUT  /api/donations/propose-program/:id/reject   (Protect 1)
  → chỉ cập nhật trangthai='Tu choi' + lydotuchoi — KHÔNG động vào tiền
```

---

## 6. Việc KHÔNG làm ở đợt này (deferred — theo nguyên tắc minimize-first)

| Việc bị hoãn | Lý do |
|---|---|
| Trigger/CHECK constraint validate cấp độ ở DB | Validate ở Model là đủ cho quy mô hiện tại; đúng theo quyết định #5 mục 0 |
| View/stored procedure rollup số dư 3 cấp | Tính runtime bằng query JOIN đơn giản khi cần hiển thị là đủ cho demo bảo vệ |
| Cho phép phân bổ nhảy cấp (1→3 bỏ qua 2) | Không hỗ trợ — giữ nguyên tắc mỗi lần phân bổ chỉ đi đúng 1 cấp, để tính minh bạch phân tầng |
| Nghiệm thu cho chương trình Case 4 | Chỉ bật khi `dexuatchuongtrinh.loaihotro` = `Cho vay` hoặc `Tai tro co thu hoi` — làm sau khi Case 4 chạy ổn ở mức cơ bản |
| Hoàn tiền tự động khi từ chối | Không cần — theo quyết định #2 mục 0 |

---

## 8. Bổ sung — Loại hình hỗ trợ (`loaihotro`) chuyển xuống cấp 3

**Quyết định:** `loaiquy` chỉ còn mô tả lĩnh vực (Học bổng, NCKH...). Cơ chế hỗ trợ (Cho vay / Tài trợ có thu hồi / Tài trợ không hoàn lại) là thuộc tính riêng của từng **quỹ cấp 3** — vì 1 lĩnh vực có thể có nhiều chương trình với cơ chế khác nhau (VD: Khởi nghiệp vừa có chương trình cho vay, vừa có chương trình tài trợ không hoàn lại).

Một quỹ cấp 3 có thể hỗ trợ **nhiều loại hình cùng lúc** → dùng kiểu `SET`, không dùng `ENUM` đơn.

### 8.1 Bảng `quy`

```sql
ALTER TABLE quy
  ADD COLUMN loaihotro SET('Tai tro khong hoan lai','Tai tro co thu hoi','Cho vay') NULL
    COMMENT 'Chi dung khi capdo=3: cac loai hinh ho tro ma quy nay cho phep. NULL neu capdo=1 hoac 2'
    AFTER capdo;
```

### 8.2 Sửa lại bảng `dexuatchuongtrinh` (mục 3.2) — đổi ENUM → SET

```sql
-- Thay dòng loaihotro trong CREATE TABLE dexuatchuongtrinh bằng:
loaihotro SET('Tai tro khong hoan lai','Tai tro co thu hoi','Cho vay')
  NOT NULL DEFAULT 'Tai tro khong hoan lai',
```
Lý do: khi đề xuất được duyệt, giá trị này copy thẳng sang `quy.loaihotro` của quỹ cấp 3 vừa tạo, nên 2 cột phải cùng kiểu.

### 8.3 Logic tầng ứng dụng

| Việc | Vị trí |
|---|---|
| Tạo/sửa quỹ cấp 3: bắt buộc chọn ≥1 giá trị `loaihotro`; quỹ cấp 1/2 giữ NULL | `FundModel.js` / `fundController.js` |
| Nộp đơn: `yeucauhotro.loaihotro` chọn phải thuộc tập `quy.loaihotro` của quỹ đích | `applicationController.js` |
| ApplyPage: dropdown loại hình hỗ trợ chỉ hiện các lựa chọn có trong `quy.loaihotro`; nếu quỹ chỉ có 1 loại thì tự chọn sẵn + khóa field | FE `ApplyPage` |
| CanBoTaoQuyPage: thêm nhóm checkbox chọn loại hình hỗ trợ khi tạo/sửa quỹ cấp 3 | FE `CanBoTaoQuyPage` |
| Duyệt `dexuatchuongtrinh`: copy nguyên `loaihotro` sang `quy.loaihotro` của quỹ cấp 3 vừa tạo | `DeXuatChuongTrinhModel.js` |

**Không đổi:** `yeucauhotro.loaihotro`, `dieukhoanthuhoi`, `hopdongvayvon` — vẫn hoạt động nguyên như cũ, chỉ khác là giá trị chọn khi nộp đơn bị ràng buộc bởi quỹ cha thay vì tự do.

---

## 7. Checklist theo Sprint

**Sprint A — Schema & Migration**
- [ ] Chạy 2 lệnh `ALTER TABLE quy` (mục 3.1)
- [ ] Chạy thêm lệnh `ALTER TABLE quy ADD COLUMN loaihotro SET(...)` (mục 8.1)
- [ ] Tạo bảng `dexuatchuongtrinh` với cột `loaihotro` kiểu `SET` (mục 3.2 + 8.2)
- [ ] Chạy migration 4 bước (mục 4), verify bằng SELECT rollup

**Sprint B — Backend Case 1–3 (điều chỉnh nhỏ)**
- [ ] Sửa điều kiện chặn nộp đơn: `capdo !== 3`
- [ ] Sửa dropdown chọn quỹ khi tài trợ (FE) để hiển thị đủ 3 cấp, cho chọn tự do

**Sprint C — Backend Case 4**
- [ ] Model `DeXuatChuongTrinhModel.js`
- [ ] 3 endpoint: propose / list / approve / reject (mục 5.1)
- [ ] Tái sử dụng `PhanBoNganSachModel` cho bước tạo `phanbongansach` khi duyệt

**Sprint D — Frontend**
- [ ] Form tài trợ: thêm bước chọn "Đề xuất chương trình mới" khi tài trợ vào quỹ thành phần
- [ ] Trang Cán bộ Quỹ/Admin: danh sách đề xuất chờ duyệt + duyệt/từ chối
- [ ] Cây chọn quỹ 3 cấp (component dropdown/tree) dùng chung cho ApplyPage + DonationPage

**Sprint E — Tài liệu**
- [ ] Cập nhật `database.md` (thêm `capdo`, enum mới, bảng `dexuatchuongtrinh`)
- [ ] Cập nhật `TongQuan.md` (mục 5.2 Quy trình Tài trợ, mục 6 ERD)
- [ ] Viết mục lý thuyết Chương 2 KLTN về mô hình quỹ 3 cấp
