# BÁO CÁO LUỒNG HOẠT ĐỘNG HỆ THỐNG QUẢN LÝ QUỸ PHÁT TRIỂN TRƯỜNG ĐẠI HỌC TRÀ VINH

---

## MỤC ĐÍCH

Tài liệu này mô tả **toàn bộ luồng hoạt động** của hệ thống, bao gồm 8 luồng nghiệp vụ chính và 17 luồng hỗ trợ. Mỗi luồng được mô tả chi tiết từ bước đầu tiên đến bước cuối cùng, kèm flow diagram và các trạng thái liên quan.

**Đối tượng đọc:** Developer, Tester, Admin, Kế toán, Cán bộ Quỹ

**Nguồn gốc:** Trích xuất từ `TongQuan.md` — Section 5 và Section 5A

---

## PHẦN I: LUỒNG NGHIỆP VỤ CHÍNH

---

### 1. Quy Trình Đề Nghị Hỗ Trợ (3-Cấp Duyệt)

#### Mô Tả Tổng Quan

Đây là quy trình cốt lõi nhất của hệ thống. Khi một sinh viên cần được hỗ trợ tài chính (học bổng, trợ cấp, vay vốn), sinh viên sẽ nộp đơn đề nghị hỗ trợ vào một trong các quỹ có sẵn. Đơn đó sẽ đi qua quy trình duyệt 3 cấp để đảm bảo tính pháp lý và minh bạch:

1. **Cấp 1 — Cán bộ Quỹ:** Kiểm tra tính hợp lệ ban đầu, xác nhận sinh viên thuộc đối tượng được hỗ trợ
2. **Cấp 2 — Quản trị viên:** Duyệt mức độ phù hợp, kiểm tra điều kiện tài chính đặc biệt (đối với tài trợ có thu hồi)
3. **Cấp 3 — Kế toán:** Kiểm tra số dư quỹ, thực hiện giải ngân nếu đủ điều kiện

Quy trình này đảm bảo rằng mỗi đồng tiền hỗ trợ đều được kiểm soát chặt chẽ từ khi đề nghị đến khi giải ngân, tạo nên một chuỗi trách nhiệm rõ ràng.

#### Bước 1: Nộp Đơn Đề Nghị

**Cách 1 — Đã đăng nhập (Sinh viên):**

Sinh viên đăng nhập vào hệ thống, truy cập trang tạo đơn (`/apply`), điền đầy đủ thông tin:
- **Chọn quỹ:** Chọn quỹ đích từ danh sách các quỹ đang hoạt động (không thể chọn quỹ cha `Tap trung - Be chung`)
- **Tiêu đề đơn:** 10-200 ký tự, mô tả ngắn gọn mục đích
- **Mô tả chi tiết:** Tối thiểu 50 ký tự, giải thích rõ lý do cần hỗ trợ
- **Số tiền đề nghị:** Phải lớn hơn 0 và không vượt quá số tiền hỗ trợ tối đa của quỹ (`sotienhotrotoida`, nếu có cấu hình)
- **Loại hỗ trợ:** Chọn 1 trong 3 loại (xem mục "3 Loại Hình Hỗ Trợ")
- **File đính kèm:** Giấy tờ chứng minh (chấp nhận PDF, JPG, PNG)

Hệ thống sẽ kiểm tra tự động: quỹ tồn tại và đang hoạt động, số dư quỹ đủ để chi trả. Nếu hợp lệ, đơn sẽ được lưu vào hệ thống với trạng thái `Cho duyet cap 1`.

**Cách 2 — Khách (chưa đăng nhập):**

Đối với người chưa có tài khoản, hệ thống cung cấp quy trình OTP verification:
1. Khách điền thông tin qua form tại `/apply` (bao gồm: họ tên, email, số điện thoại, MSSV, khoa, lớp, tài khoản ngân hàng)
2. Hệ thống lưu tạm vào bảng `guest_yeucauhotro` kèm mã OTP 6 chữ số
3. Khách nhập mã OTP nhận được qua email
4. Hệ thống tự động: (a) tạo tài khoản người dùng với mật khẩu tạm thời, (b) tạo đơn đề nghị chính thức, (c) trả về UUID để theo dõi
5. Khách có thể theo dõi trạng thái đơn bằng UUID mà không cần đăng nhập

#### Bước 2: Phân Đợt Giải Ngân

Ngay sau khi đơn được nộp, hệ thống tự động gán đơn vào đợt giải ngân (`dotgiaingan`) phù hợp dựa trên ngày nộp đơn. Nếu quỹ chưa có đợt giải ngân nào, hệ thống sẽ tự tạo đợt mặc định với `thutu=1`. Mỗi quỹ có thể có nhiều đợt giải ngân, mỗi đợt tương ứng với một khoảng thời gian cụ thể.

#### Bước 3: Duyệt Cấp 1 — Cán Bộ Quỹ

Cán bộ Quỹ (role 3) sẽ xem danh sách các đơn chờ duyệt tại trang `/can-bo/xet-duyet`. Tại đây, cán bộ có thể xem chi tiết đơn, kiểm tra tính hợp lệ của thông tin, và thực hiện một trong hai hành động:

- **Duyệt:** Cập nhật `pheduyet` cấp 1 thành `Da duyet`, chuyển trạng thái đơn sang `Cho duyet cap 2`
- **Từ chối:** Nhập lý do từ chối (tối thiểu 10 ký tự), cập nhật `pheduyet` cấp 1 thành `Tu choi`, trạng thái đơn sang `Tu choi cap 1`

Lưu ý: Cán bộ Quỹ chỉ có thể duyệt các đơn đang ở trạng thái `Cho duyet cap 1` và phải là người có `capduyet = 1` trong bản ghi `pheduyet`.

#### Bước 4: Duyệt Cấp 2 — Quản Trị Viên

Quản trị viên (role 1) xem danh sách đơn chờ duyệt tại `/admin/xet-duyet`. Tại bước này, nếu đơn thuộc loại **Tài trợ có thu hồi**, quản trị viên phải nhập thêm 3 thông tin bắt buộc:
- **Mức thu hồi:** Số tiền phải thu hồi (> 0), không vượt quá 30% tổng kinh phí dự án
- **Thời hạn hoàn trả:** Số tháng
- **Số quyết định hợp đồng:** Mã quyết định

> **Lưu ý:** Tài trợ thu hồi **không tính lãi** theo Điều lệ. Lãi suất chỉ áp dụng cho khoản vay.

Hệ thống tự động kiểm tra ràng buộc: mức thu hồi không được vượt quá **30% tổng kinh phí dự án**. Nếu hợp lệ, hệ thống sẽ tạo bản ghi `dieukhoanthuhoi` (1:1 với `yeucauhotro`).

Đối với các loại hỗ trợ khác (Tài trợ không hoàn lại, Cho vay), quản trị viên chỉ cần duyệt mà không cần nhập thêm thông tin.

#### Bước 5: Duyệt Cấp 3 và Giải Ngân

Kế toán (role 2) là người cuối cùng trong chuỗi duyệt. Tại trang `/ke-toan/giai-ngan`, kế toán sẽ thấy danh sách các đơn đã duyệt cấp 1 và 2, chờ giải ngân.

Khi kế toán nhấn "Giải ngân", hệ thống sẽ kiểm tra số dư quỹ:
- **Nếu đủ số dư:** Trừ tiền quỹ, tạo giao dịch `Chi` trong `giaodich`, trạng thái đơn chuyển sang `Da giai ngan`
- **Nếu thiếu số dư:** Trạng thái đơn chuyển sang `Cho giai ngan` — đơn sẽ được tự động giải ngân khi quỹ nhận được tiền (qua tài trợ hoặc phân bổ)

Đây là bước quan trọng nhất trong quy trình tài chính — mọi giao dịch giải ngân đều phải có đủ chứng từ và phê duyệt từ cả 3 cấp.

#### Bước 6: Nghiệm Thu (Đối Với Khoản Vay và Tài Trợ Có Thu Hồi)

Đối với các đơn thuộc loại "Cho vay" hoặc "Tài trợ có thu hồi", sau khi giải ngân cần thực hiện nghiệm thu để kiểm tra việc sử dụng vốn:

- Cán bộ Quỹ tạo đợt nghiệm thu qua `POST /api/nghiem-thu`
- Có 2 loại kiểm tra: **Kiểm tra tiến độ** (dọc quá trình) và **Nghiệm thu cuối cùng**
- Kết quả nghiệm thu: **Đạt**, **Đạt có điều chỉnh**, hoặc **Không đạt**
- Nếu "Không đạt": đơn bị đánh dấu `Nghiem thu khong dat`, không thể giải ngân lại

#### Flow Diagram

```
    Sinh viên/Khách nộp đơn
            │
            ▼
    ┌──────────────────┐
    │   Bước 1:         │
    │   Nộp đơn         │ → Kiểm tra quỹ, số dư, file đính kèm
    └────────┬─────────┘
             │
             ▼
    ┌──────────────────┐
    │   Bước 2:         │
    │   Phân đợt GN     │ → Tự động gán dotgiaingan
    └────────┬─────────┘
             │
             ▼
    ┌──────────────────┐
    │   Bước 3:         │
    │   Duyệt Cấp 1    │ ← Cán bộ Quỹ (role 3)
    │   Kiểm tra HL     │   Từ chối → "Tu choi cap 1"
    └────────┬─────────┘
             │ Duyệt
             ▼
    ┌──────────────────┐
    │   Bước 4:         │
    │   Duyệt Cấp 2    │ ← Quản trị viên (role 1)
    │   Kiểm tra TC     │   Nếu "Tai tro co thu hoi":
    │                   │   → Nhập mức LS, thời hạn
    │                   │   → Tạo dieukhoanthuhoi
    │                   │   Từ chối → "Tu choi cap 2"
    └────────┬─────────┘
             │ Duyệt
             ▼
    ┌──────────────────┐
    │   Bước 5:         │
    │   Duyệt Cấp 3    │ ← Kế toán (role 2)
    │   & Giải ngân     │   Đủ số dư → Trừ quỹ + tạo GD Chi
    │                   │   Thiếu → "Cho giai ngan"
    └────────┬─────────┘
             │
             ▼
    ┌──────────────────┐
    │   Bước 6:         │
    │   Nghiệm thu      │ ← Cán bộ Quỹ tạo (nếu yêu cầu)
    │   (nếu có)        │   Đạt / Đạt có điều chỉnh / Không đạt
    └──────────────────┘
```

#### Trạng Thái Đơn (StateMachine)

| Trạng Thái | Ý Nghĩa | Ai Thao Tác |
|------------|---------|------------|
| `Cho duyet cap 1` | Mới nộp, chờ Cán bộ Quỹ duyệt | — |
| `Da duyet cap 1` | Đã duyệt cấp 1, chờ chuyển cấp 2 | Cán bộ Quỹ |
| `Cho duyet cap 2` | Chờ Quản trị viên duyệt | — |
| `Da duyet cap 2` | Đã duyệt cấp 2, chờ chuyển cấp 3 | Quản trị viên |
| `Cho duyet cap 3` | Chờ Kế toán duyệt | — |
| `Da duyet cap 3` | Đã duyệt cấp 3, chờ giải ngân | Kế toán |
| `Cho giai ngan` | Đã duyệt, quỹ thiếu tiền, chờ bổ sung | Kế toán |
| `Da giai ngan` | Đã giải ngân thành công | Kế toán |
| `Cho nghiem thu` | Đã giải ngân, chờ nghiệm thu | — |
| `Da nghiem thu` | Đã nghiệm thu, hoàn tất | Cán bộ Quỹ |
| `Tu choi cap 1/2/3` | Bị từ chối tại cấp N | Cấp N |
| `Nghiem thu khong dat` | Nghiệm thu không đạt | Cán bộ Quỹ |

#### 3 Loại Hình Hỗ Trợ

| Loại | Mã | Đặc Điểm | Nghiem Thu |
|------|-----|---------|------------|
| **Tài trợ không hoàn lại** | `Tai tro khong hoan lai` | Không cần thu hồi, giải ngân xong là hoàn tất. Phù hợp cho học bổng, trợ cấp khó khăn. | Chỉ cần nếu đơn là đề tài/dự án (cờ `laidetac = 1`) |
| **Tài trợ có thu hồi** | `Tai tro co thu hoi` | Cần tạo `dieukhoanthuhoi` với mức thu hồi (≤ 30% kinh phí), thời hạn hoàn trả. Không tính lãi theo Điều lệ. Phù hợp cho quỹ quay vòng. | Cần nghiệm thu sau giải ngân |
| **Cho vay** | `Cho vay` | Tạo `hopdongvayvon` + `lichtrano`, có lịch trả nợ cụ thể. | Luôn cần nghiệm thu sau giải ngân |

> **Quy tắc bật nghiệm thu (`canghiemthu`):**
> - Đơn là đề tài/dự án nghiên cứu (`laidetac = 1`) → **luôn** cần nghiệm thu, bất kể loại hình
> - `loaihotro = 'Cho vay'` → **luôn** cần nghiệm thu
> - Các trường hợp khác → không cần nghiệm thu

---

### 2. Quy Trình Tài Trợ (Donation)

#### Mô Tả Tổng Quan

Quy trình tài trợ là cơ chế để các nhà tài trợ (cá nhân, tổ chức, doanh nghiệp) đóng góp vào các quỹ của trường. Quy trình này đảm bảo rằng mọi khoản tài trợ đều được ghi nhận đầy đủ, xác minh nguồn gốc, và phân bổ đúng vào quỹ đích. Hệ thống hỗ trợ 3 cách tiếp nhận: tài trợ công khai (khách), tài trợ qua tài khoản đã đăng nhập, và cán bộ ghi nhận trực tiếp.

Khi một khoản tài trợ được duyệt, hệ thống sẽ tự động cộng tiền vào số dư quỹ và tạo giao dịch `Thu` trong sổ cái. Điều này đảm bảo rằng số dư quỹ luôn phản ánh đúng thực tế và mọi biến động đều có dấu vết.

#### Bước 1: Tiếp Nhận Khoản Tài Trợ

**Cách 1 — Khách công khai (chưa đăng nhập):**

Nhà tài trợ truy cập trang tài trợ công khai, điền thông tin: họ tên, email, số điện thoại, số tiền, chọn quỹ. Hệ thống sẽ:
1. Kiểm tra email trùng lặp trong `nguoidung`
2. Tạo hoặc liên kết bản ghi `nhataitro`
3. Tạo `khoantaitro` với trạng thái `Cho duyet`
4. Lưu thông tin chuyển khoản nếu có

**Cách 2 — Đã đăng nhập (role 4):**

Nhà tài trợ đã có tài khoản có thể tài trợ trực tiếp qua `/apply` với 3 hình thức thanh toán:
- **Chuyển khoản:** Hiển thị thông tin tài khoản ngân hàng trường
- **Trực tuyến (VNPay):** Tích hợp cổng thanh toán (chưa triển khai)
- **Tiền mặt:** Hiển thị địa chỉ văn phòng

**Cách 3 — Cán bộ ghi nhận:**

Cán bộ Quỹ hoặc Admin có thể ghi nhận khoản tài trợ từ nhà tài trợ đã có trong hệ thống hoặc tạo mới, qua `POST /api/donations`.

#### Bước 2: Duyệt Khoản Tài Trợ

Kế toán hoặc Admin sẽ xem danh sách khoản tài trợ chờ duyệt, kiểm tra tính hợp lệ của chứng từ (hình ảnh chuyển khoản), và duyệt. Khi duyệt:
- `khoantaitro.trangthai` chuyển sang `Da duyet`
- `quy.sodu` được cộng thêm số tiền tài trợ
- Một giao dịch `Thu` mới được tạo trong `giaodich`

#### Bước 3: Xác Nhận

Sau khi duyệt, Admin có thể thực hiện bước xác nhận cuối cùng (`confirm`), chuyển trạng thái sang `Da nhan`. Bước này xác nhận rằng khoản tài trợ đã thực sự đến tài khoản trường.

#### Flow Diagram

```
    Nhà tài trợ gửi khoản tài trợ
            │
            ▼
    ┌──────────────────┐
    │  "Cho duyet"     │ ← Chờ kế toán/admin duyệt
    └────────┬─────────┘
             │ Duyệt
             ▼
    ┌──────────────────┐
    │  "Da duyet"      │ → Cộng tiền quỹ + tạo GD Thu
    └────────┬─────────┘
             │ Xác nhận
             ▼
    ┌──────────────────┐
    │  "Da nhan"       │ → Hoàn tất
    └──────────────────┘
```

---

### 3. Quy Trình Trích Lập Ngân Sách (Budget Allocation)

#### Mô Tả Tổng Quan

Quy trình phân bổ ngân sách là cơ chế để chuyển tiền từ quỹ cha (quỹ tập trung - bê chung) sang các quỹ con (quỹ tập trung - mục chi). Đây là bước đầu tiên trong chuỗi cung cấp tài chính: tiền ban đầu nằm ở quỹ cha, sau đó được phân bổ xuống các quỹ con theo nhu cầu thực tế, và từ quỹ con mới giải ngân cho sinh viên.

Mỗi lần phân bổ đều cần có quyết định phê duyệt từ Admin để đảm bảo tính pháp lý. Hệ thống cũng hỗ trợ thu hồi phân bổ trong trường hợp cần điều chỉnh.

**Lưu ý quan trọng:** Chỉ quỹ con (`Tap trung - Muc chi`) mới nhận được phân bổ. Quỹ cha (`Tap trung - Be chung`) là nguồn tiền duy nhất.

#### Bước 1: Đề Xuất Phân Bổ

Cán bộ Quỹ tạo đề xuất phân bổ qua `POST /api/funds/allocate/request`, chỉ định:
- Quỹ nguồn (phải là `Tap trung - Be chung`)
- Quỹ đích (phải là `Tap trung - Muc chi` và là con của quỹ nguồn)
- Số tiền phân bổ
- Số quyết định

Hệ thống kiểm tra: quỹ nguồn tồn tại, số dư đủ, quỹ đích là con hợp lệ.

#### Bước 2: Duyệt Phân Bổ

Admin xem danh sách đề xuất chờ duyệt, kiểm tra tính hợp lệ, và duyệt qua `POST /api/funds/allocate/:id/approve`. Khi duyệt:
- `quy.sodu` quỹ nguồn bị trừ
- `quy.sodu` quỹ đích được cộng
- Trạng thái phân bổ chuyển sang `Da duyet`

**Bảo mật:** Dùng `SELECT ... FOR UPDATE` row-level locking trong transaction để tránh race condition khi 2 admin cùng thao tác trên cùng 1 quỹ.

#### Bước 3: Thu Hồi (Nếu Cần)

Nếu có sai sót hoặc cần điều chỉnh, Admin có thể thu hồi phân bổ đã duyệt:

**Luồng thu hồi (`POST /api/funds/allocate/:id/rollback`):**

1. Kiểm tra phân bổ tồn tại và trạng thái = `Da duyet`
2. **Row-level locking trong transaction:**
   - `SELECT ... FOR UPDATE` trên bản ghi phân bổ
   - `SELECT ... FOR UPDATE` trên quỹ đích (lock hàng)
   - `SELECT ... FOR UPDATE` trên quỹ nguồn (lock hàng)
3. Kiểm tra số dư quỹ đích **còn đủ** (tiền chưa bị giải ngân)
4. Thực hiện đảo giao dịch:
   - Trừ `quy.sodu` quỹ đích (lấy lại tiền)
   - Cộng `quy.sodu` quỹ nguồn (hoàn tiền)
5. Cập nhật trạng thái phân bổ → `Da thu hoi`
6. Commit transaction. Nếu lỗi → rollback toàn bộ

**Lỗi thường gặp:**
- `INSUFFICIENT_DESTINATION_FUND_BALANCE_FOR_ROLLBACK` (400) — tiền đã bị giải ngân, không thể thu hồi

---

### 4. Quy Trình Giải Ngân Đợt (Disbursement Round)

#### Mô Tả Tổng Quan

Giải ngân đợt là cách tổ chức việc chi tiền theo từng giai đoạn. Mỗi quỹ có thể có nhiều đợt giải ngân, mỗi đợt tương ứng với một khoảng thời gian cụ thể. Khi tất cả các đợt của một quỹ đã hoàn thành, quỹ đó sẽ tự động chuyển sang trạng thái `Da dong`.

Cơ chế này giúp quản lý dòng tiền theo từng giai đoạn, tránh tình trạng giải ngân hết tiền quỹ trong một lần duy nhất.

#### Quản Lý Đợt Giải Ngân

- **Xem công khai:** Công khai trên trang chi tiết quỹ
- **Tự cập nhật trạng thái:** Khi xem danh sách đợt (đăng nhập), hệ thống tự động kiểm tra ngày và cập nhật trạng thái `chuatoi` → `dangchodutien` → `hoanthanh`
- **Hoàn thành đợt:** Khi nhấn "Hoàn thành", hệ thống kiểm tra số tiền đã chi, và nếu tất cả đợt đều hoàn thành → đóng quỹ

---

### 5. Quy Trình Xử Lý Khách (Guest Flow)

#### Mô Tả Tổng Quan

Quy trình khách là cơ chế đặc biệt cho phép người chưa có tài khoản trên hệ thống có thể nộp đơn đề nghị hỗ trợ hoặc tài trợ. Đây là tính năng quan trọng giúp mở rộng đối tượng tiếp cận quỹ — không chỉ sinh viên đang học mà còn cả cựu sinh viên, phụ huynh, hoặc các mạnh thường quân chưa quen với hệ thống.

Quy trình sử dụng phương pháp xác thực OTP (One-Time Password) qua email: sau khi khách điền form, hệ thống sẽ gửi mã 6 chữ số qua email, khách nhập mã để xác thực. Sau xác thực thành công, hệ thống tự động tạo tài khoản và chuyển dữ liệu từ bảng tạm (staging) sang các bảng chính thức.

#### Bước 1: Gửi Form

Khách truy cập trang `/apply`, chọn "Tôi là Nhà tài trợ" hoặc "Tôi là Sinh viên", điền đầy đủ thông tin. Dữ liệu được mã hoá và ký bằng HMAC-SHA256, lưu trong `otpToken` (signed JWT-like token, không dùng DB staging).

#### Bước 2: Xác Thực OTP

Khách nhận mã OTP 6 chữ số qua email, nhập vào form xác thực. Hệ thống kiểm tra mã OTP (timing-safe comparison), sau đó:
1. Tạo tài khoản người dùng mới (email = email khách, mật khẩu tạm thời 12 ký tự)
2. Tạo bản ghi chính thức trong `nguoidung` + `nhataitro`/`yeucauhotro`
3. Gửi email thông báo tài khoản đã tạo + mật khẩu tạm
4. Trả về UUID + mật khẩu tạm thời cho khách

#### Bước 3: Theo Dõi Trạng Thái

Khách có thể theo dõi trạng thái đơn hoặc khoản tài trợ bằng cách truy cập `/track` và nhập UUID. Hệ thống trả về trạng thái hiện tại mà không yêu cầu đăng nhập.

#### Flow Diagram

```
    Khách điền form
        │
        ▼
    ┌──────────────────┐
    │  Mã hoá + Ký     │ → otpToken (signed JWT-like)
    └────────┬─────────┘
             │ Gửi OTP email
             ▼
    ┌──────────────────┐
    │  Nhập mã OTP     │ ← 6 chữ số, hết hạn 30 phút
    └────────┬─────────┘
             │ Xác thực (timing-safe)
             ▼
    ┌──────────────────┐
    │  Tạo tài khoản   │ → UUID + mật khẩu tạm 12 ký tự
    │  + Đơn/Khoản TT  │
    └────────┬─────────┘
             │
             ▼
    ┌──────────────────┐
    │  Theo dõi UUID   │ → Tra cứu trạng thái
    └──────────────────┘
```

---

### 6. Quy Trình Ngân Sách Hoạt Động (Du Toan)

#### Mô Tả Tổng Quan

Ngân sách hoạt động (dự toán hàng năm) là cơ chế kiểm soát chi tiêu cho các hoạt động vận hành hệ thống quỹ (tham dự án, bộ máy hoạt động, nhiệm vụ khác). Kế toán đề xuất ngân sách cho một năm tài chính, Admin duyệt, và sau đó mọi giao dịch `Chi` thuộc nhóm `Bo_may_hoat_dong` đều phải nằm trong giới hạn ngân sách đã duyệt.

Điều này đảm bảo rằng chi tiêu vận hành không vượt quá dự toán, tạo cơ chế kiểm soát tài chính nội bộ hiệu quả.

#### Bước 1: Đề Xuất

Kế toán nhập năm tài chính và số tiền dự toán qua `POST /api/du-toan`.

#### Bước 2: Duyệt

Admin xem và duyệt/từ chối qua `PUT /api/du-toan/:id`.

#### Bước 3: Kiểm Tra Giới Hạn

Khi tạo giao dịch `Chi` với `hangmucchi = 'Bo_may_hoat_dong'`, hệ thống tự động kiểm tra `DuToanModel.checkLimit`: phải có ngân sách đã duyệt cho năm đó, và tổng chi tích lũy + số tiền hiện tại ≤ số tiền duyệt.

---

### 7. Quy Trình Đối Soát Giao Dịch (Reconciliation)

#### Mô Tả Tổng Quan

Đối soát giao dịch là quá trình kiểm tra và xác minh rằng số tiền thực tế trong giao dịch ngân hàng khớp với số tiền ghi nhận trong hệ thống. Đây là bước quan trọng trong kiểm soát tài chính, giúp phát hiện các giao dịch bất thường hoặc sai lệch.

#### Cách 1: Đối Soát Thủ Công

Mỗi giao dịch trong hệ thống đều có thể được đánh dấu là: **Chưa đối soát** (mặc định), **Đã đối soát** (khớp), hoặc **Bất thường** (cần xem xét).

Kế toán hoặc Admin cập nhật trạng thái đối soát qua `PATCH /api/transactions/:id/doi-soat`:
- `Chua_doi_soat` → Đặt lại mọi trường đối soát về null
- `Da_doi_soat` → Ghi nhận số tiền thực tế (mặc định = số tiền hệ thống)
- `Bat_thuong` → Đánh dấu cần xem xét, ghi nhận số tiền thực tế nếu khác

#### Cách 2: Đối Soát Tự Động (Upload File Sao Kê)

Kế toán upload file sao kê ngân hàng (hỗ trợ CSV, Excel, TXT), hệ thống tự động:

**Bước 1 — Upload & Parse:**
- File được upload qua `POST /api/upload` (loại `documents`)
- Hệ thống parse nội dung file, extract các dòng giao dịch
- Mỗi dòng bao gồm: ngày GD, số tiền, nội dung/Mô tả, số tài khoản

**Bước 2 — So Khớp Tự Động:**
- So khớp từng giao dịch trong file với dữ liệu `giaodich` trong hệ thống
- Tiêu chí khớp: **số tiền**, **ngày**, **nội dung** (fuzzy match)
- Phân loại kết quả:
  - **Đã khớp** (xanh lá) — giao dịch trong hệ thống khớp hoàn toàn với sao kê
  - **Chưa khớp** (vàng) — có trong hệ thống nhưng không tìm thấy trong sao kê
  - **Sai lệch** (đỏ) — có trong cả hai nhưng khác biệt về số tiền hoặc thông tin

**Bước 3 — Xử Lý:**
- Kế toán xem danh sách kết quả trên UI
- Xác nhận các khoản đã khớp
- Xem xét và xử lý các khoản sai lệch (liên hệ đối tác, điều chỉnh)
- Đánh dấu trạng thái đối soát cho từng giao dịch

---

### 8. Quy Trình Xuất Báo Cáo

#### Mô Tả Tổng Quan

Hệ thống cung cấp chức năng xuất báo cáo tài chính dưới 2 định dạng: DOCX (Word) và XLSX (Excel). Báo cáo được xây dựng dựa trên template có sẵn với dữ liệu thời gian thực từ database.

Đặc biệt, báo cáo năm tài chính tuân thủ theo **Điều 17.2 và Điều 18** của Điều lệ Quỹ Phát triển, đảm bảo tính pháp lý khi trình lên cấp trên hoặc công khai.

#### 7 Loại Báo Cáo

| # | Loại Báo Cáo | Nội Dung |
|---|-------------|---------|
| 1 | `thu_chi_tong_hop` | Tổng hợp thu chi theo quỹ, thời gian |
| 2 | `danh_sach_nha_tai_tro` | Danh sách và mức đóng góp của nhà tài trợ |
| 3 | `danh_sach_thu_huong` | Danh sách sinh viên nhận hỗ trợ |
| 4 | `bao_cao_quy` | Báo cáo tình hình quỹ theo từng loại |
| 5 | `bao_cao_nguoi_dung` | Thống kê người dùng theo vai trò |
| 6 | `bao_cao_de_xuat` | Báo cáo đề xuất phân bổ |
| 7 | `bao_cao_nam_tai_chinh` | **Điều 17.2, 18** — 4 block tài chính |

#### Báo Cáo Năm Tài Chính (4 Block)

1. **Block 1 — Thu/Chi thực tế:** Phân theo loại giao dịch và loại hình hỗ trợ
2. **Block 2 — Phải thu:** Từ các điều khoản thu hồi (`dieukhoanthuhoi`)
3. **Block 3 — Ngân sách nội bộ:** Phân bổ từ quỹ cha xuống quỹ con (`phanbongansach`)
4. **Block 4 — Ngân sách hoạt động:** Dự toán hàng năm và thực chi (`dutoanhangnam`)

---

## PHẦN II: LUỒNG HỖ TRỢ & TIỆN ÍCH

---

### 9. Đăng Ký Tài Khoản

Hệ thống hỗ trợ 3 loại tài khoản khi đăng ký: **Sinh viên**, **Nhà tài trợ**, **Cán bộ**.

**Luồng thực thi:**

1. Kiểm tra **chế độ bảo trì** — nếu bật, trả 503 block mọi đăng ký mới
2. Validate theo loại tài khoản:
   - **Sinh viên:** `hoTen`, `mssv`, `khoaPhong`, `lop`, `email`, `password` (bắt buộc)
   - **Nhà tài trợ:** `tenToChuc`, `email`, `soDienThoai`, `password` (bắt buộc)
   - **Cán bộ:** `hoTen`, `email`, `password` (bắt buộc)
3. Validate email (regex), password (>= 8 ký tự)
4. Kiểm tra email trùng trong DB → 409 nếu đã tồn tại
5. Hash password bằng bcrypt (salt rounds: 10)
6. Tạo user mới:
   - `roleId` = 4 (Nguoi dung) — mọi đăng ký đều nhận role mặc định
   - `maSoDinhDanh`: `mssv` (SV), `CB{timestamp}` (CB), `NTT{timestamp}` (NTT)
   - `trangthai` = `HOAT_DONG`
7. Nếu loại Nhà tài trợ → tự động tạo bản ghi trong `nhataitro` (failure không rollback user)
8. Tạo JWT token pair (access + refresh)
9. Log sự kiện đăng ký
10. Trả về `accessToken`, `refreshToken`, `user` (không chứa password)

---

### 10. Đăng Nhập & JWT

**Luồng đăng nhập:**

1. Validate `email` + `matKhau` không rỗng
2. Tìm user theo email — trả 401 chung (không tiết lộ email có tồn tại không)
3. Kiểm tra **chế độ bảo trì**: nếu ON và user không phải Admin → 503
4. Kiểm tra tài khoản bị khóa (`KHOA`) → 403
5. Kiểm tra vai trò bị tạm dừng (`TAM_DUNG`) → 403
6. So sánh password với bcrypt.compare → 401 nếu sai
7. Tạo JWT token pair:
   - **Access token**: `JWT_SECRET`, hết hạn `JWT_EXPIRES_IN` (mặc định 2h)
   - **Refresh token**: `JWT_REFRESH_SECRET` (secret riêng), hết hạn `JWT_REFRESH_EXPIRES_IN` (mặc định 30d)
   - Payload: `{ user_id, vai_tro }`
8. Trả về `accessToken`, `refreshToken`, `user`

**Refresh Token (rotation):**

1. Client gửi `refreshToken`
2. Verify với `JWT_REFRESH_SECRET` → 401 nếu hết hạn/sai
3. Tìm user theo decoded `user_id` → 401 nếu không tồn tại
4. Kiểm tra account locked → 403
5. **Rotate** — tạo token pair MỚI HOÀN TOÀN (cả access + refresh)
6. Trả về token mới

---

### 11. Quên Mật Khẩu

1. Client gửi `{ email }`
2. Tìm user theo email → 404 nếu không tồn tại
3. Kiểm tra account locked → 403
4. Tạo password random **8 ký tự** (A-Z, a-z, 0-9)
5. Hash password mới bằng bcrypt
6. Ghi đè password cũ trong DB (mật khẩu cũ bị thay vĩnh viễn)
7. Gửi email chứa password mới (plaintext) cho user
8. Trả về thông báo thành công (không trả password trong response)

> **Lưu ý:** Không có cơ chế token/link, không có expiry. Password cũ bị thay thế ngay lập tức. Sử dụng `Math.random()` (không cryptographically secure).

---

### 12. Đổi Mật Khẩu

1. Client gửi `{ oldPassword, newPassword, confirmPassword }`
2. Validate: `newPassword` >= 6 ký tự, `newPassword` == `confirmPassword`
3. Lấy password hash hiện tại từ DB
4. **Nếu user đã có password** (`matkhau !== null`):
   - `oldPassword` là bắt buộc
   - So sánh `oldPassword` với hash → 401 nếu sai
   - Kiểm tra `newPassword` != `oldPassword` → 400 nếu trùng
5. **Nếu user chưa có password** (Google OAuth account, `matkhau === null`):
   - `oldPassword` **không bắt buộc** — cho phép set password lần đầu
6. Hash password mới, ghi vào DB
7. Trả về thông báo thành công

---

### 13. Google OAuth

**Bước 1 — Redirect Google:**
1. Tạo URL authorization với `access_type: "offline"`, scope: `userinfo.profile` + `userinfo.email`, `prompt: "select_account"`
2. Redirect browser đến Google

**Bước 2 — Callback:**
1. Nhận `code` từ Google query params
2. Nếu user huỷ → redirect `${FRONTEND_URL}/login?error=google_cancelled`
3. Exchange `code` lấy Google tokens
4. Verify ID token → extract `email`, `name`, `picture`
5. Tìm user theo email:
   - **Chưa có** → tạo user mới từ Google (password = null, avatar = picture)
   - **Đã có** → check locked/suspended
6. Tạo JWT pair của ứng dụng
7. Redirect về frontend: `${FRONTEND_URL}/auth/google/callback?accessToken=...&refreshToken=...&user=...`

> **Lưu ý:** User Google lần đầu có `matkhau = null`, có thể set password sau qua `updatePassword`.

---

### 14. Upload File

Hệ thống hỗ trợ **6 loại upload** + **xóa file**, tất cả dùng Multer disk storage.

**Cấu trúc thư mục:**
```
backend/uploads/
├── avatars/donor/      # Avatar nhà tài trợ
├── avatars/fund/       # Ảnh bìa quỹ
├── avatars/staffs/     # Avatar cán bộ + admin
├── avatars/students/   # Avatar sinh viên
├── documents/         # File đính kèm (PDF, DOC)
├── proofs/            # minh chứng
└── tintuc/            # Ảnh tin tức
```

| Loại | Endpoint | Giới hạn | Thư mục lưu | Auth |
|------|----------|----------|-------------|------|
| Chung | `POST /api/upload` | PDF/JPG/PNG/DOC, ≤5MB | `documents/` | Có |
| Công khai | `POST /api/upload/public` | PDF/JPG/PNG/DOC, ≤5MB | `documents/` | Không |
| Nhiều file | `POST /api/upload/multiple` | Max 5 files, mỗi file ≤10MB | `documents/` | Có |
| Avatar | `POST /api/upload/avatar` | JPG/PNG, ≤5MB | `avatars/{folder}/` | Có |
| Ảnh quỹ | `POST /api/upload/fund` | JPG/PNG, ≤5MB | `avatars/fund/` | Có |
| Ảnh SV | `POST /api/upload/student` | JPG/PNG, ≤5MB | `avatars/students/` | Có |
| Ảnh tin | `POST /api/upload/news` | JPG/PNG, ≤5MB | `tintuc/` | Có |

**Avatar folder phân loại theo role:**
- Role 1, 2, 3 → `avatars/staffs/`
- Role 4 + `SINH_VIEN` → `avatars/students/`
- Role 4 + `NHA_TAI_TRO` → `avatars/staffs/`

**Xóa file:** `DELETE /api/upload/:filename` — chỉ xóa được file trong `documents/`, không xóa được avatar/ảnh quỹ/ảnh tin.

**Định dạng tên file:** `{tenGoc}_{timestamp}_{9soNgauNhau}{extension}` — ký tự đặc biệt bị thay bằng `_`.

---

### 15. Quản Lý Tin Tức

**Quy trình trạng thái:**
```
Ban nhap (Draft) → Da xuat ban (Published) → Da an (Hidden)
```

**Tạo tin (`POST /api/news`):**
1. Validate `title` (không rỗng) và `content` (không rỗng)
2. Nếu status = `Da xuat ban` và không có `publishDate` → tự động set ngày hiện tại
3. `phanloai` được normalize: `Tin moi`, `Tin noi bat`, `baocaohoatdong`, `chuongtrinh`, `cuusinhvien`
4. `lanoibat` mặc định = 0 (không nổi bật)
5. Lưu vào DB, trả về tin vừa tạo với URL ảnh

**Sửa tin (`PUT /api/news/:id`):**
- Nếu chuyển sang `Da xuat ban` mà chưa có ngày → tự set ngày
- Nếu chuyển sang `Ban nhap` → xóa ngày xuất bản (null)

**Đổi trạng thái (`PUT /api/news/:id/status`):**
- Chỉ 3 trạng thái: `Ban nhap`, `Da xuat ban`, `Da an`
- Tự động xử lý ngày xuất bản theo logic trên

**Xóa tin (`DELETE /api/news/:id`):**
- Chỉ Admin mới xóa được
- **Không xóa file ảnh** trên disk (chỉ xóa bản ghi DB)

**Xem công khai:**
- `GET /api/news/landing` — tin cho landing page (featured + recent)
- `GET /api/news/public` — danh sách phân trang, filter theo `phanloai`
- `GET /api/news/:id` — chỉ trả tin `Da xuat ban`, 404 cho draft/hidden

**Xây dựng URL ảnh:** Dùng `process.env.BASE_URL` + relative path → trả về URL tuyệt đối cho production.

---

### 16. Cảm Nhận Sinh Viên (Testimonials)

**Quy trình trạng thái:**
```
Gửi → Cho duyet → Da duyet / Tu choi
```

**Gửi đánh giá (`POST /api/danhgia`):**
1. Yêu cầu đăng nhập (`optionalProtect` — phải có token)
2. Validate `noiDung` (bắt buộc, tối đa 500 ký tự)
3. Lưu với trạng thái `Cho duyet`
4. Trả về thông báo "đã gửi, chờ duyệt"

**Duyệt (`PATCH /api/danhgia/:id/trangthai`):**
- Admin/Cán bộ chọn: `Da duyet` hoặc `Tu choi`
- Nếu từ chối phải nhập lý do

**Đặt nổi bật (`PATCH /api/danhgia/:id/noi-bat`):**
- Chỉ đặt nổi bật được khi trạng thái đã `Da duyet`
- Có thứ tự hiển thị (`thuTu`)

**Xem công khai:**
- `GET /api/danhgia/landing` — top 6 đánh giá đã duyệt (hiển thị trên landing page)
- `GET /api/danhgia` — phân trang, filter theo khoa/từ khóa

> **Bug đã biết:** `getBodyField()` chưa được define trong `danhGiaController.js` → 2 PATCH endpoint sẽ gặp `ReferenceError` khi chạy.

---

### 17. Sinh Viên Nổi Bật

**Quy trình:**
```
Thêm/Sửa → Hien thi / An
```

**Tạo (`POST /api/student-showcase`):**
1. Admin/Cán bộ nhập: `nguoiDungId`, `namHoc`, `thanhTich`, `thuTu`, `trangThai`
2. Validate `nguoiDungId` (bắt buộc, số)
3. `trangThai` mặc định = `Hien thi`
4. Avatar được tự động lấy từ `nguoidung.avatar`

**Đổi trạng thái (`PUT /api/student-showcase/:id/status`):**
- `Hien thi` (hiển thị trên trang công khai) hoặc `An` (ẩn)

**Xem công khai:** `GET /api/student-showcase/public` — chỉ trả SV có `Hien thi`

---

### 18. Chức Vụ Tổ Chức

**4 nhóm chức vụ:**
| Nhóm | Mô tả |
|------|-------|
| Hội đồng Quỹ | Ban lãnh đạo cao nhất |
| Ban Điều hành | Quản lý vận hành hàng ngày |
| Ban Kiểm soát | Giám sát độc lập (Điều 8 Điều lệ) |
| Văn phòng Thường trực | Hành chính, hỗ trợ |

**CRUD (Admin only):**
- `POST /api/chuc-vu` — tạo mới (yêu cầu `chucDanh`, `nhom`)
- `PUT /api/chuc-vu/:id` — cập nhật
- `DELETE /api/chuc-vu/:id` — **soft delete** (chuyển `trangthai` = `Het nhiem ky`)
- `PUT /api/chuc-vu/reorder` — sắp xếp lại thứ tự (dùng MySQL transaction)

**Xem công khai:** `GET /api/chuc-vu/public` — chỉ hiển thị `Dang nhiem`, sắp xếp theo nhóm và `thuTu`

---

### 19. Cài Đặt Hệ Thống

**60 trường cấu hình** trong `system_settings.json`, chia thành các nhóm:

| Nhóm | Fields |
|------|--------|
| Nhận diện | `ten_he_thong`, `don_vi_quan_ly` |
| Liên hệ | `email_lien_he`, `email_ho_tro`, `so_dien_thoai`, `dia_chi_lien_he`, `gio_lam_viec` |
| Social | `facebook_url`, `youtube_url`, `linkedin_url` |
| TK nhận TT | `ngan_hang`, `chi_nhanh`, `so_tai_khoan`, `chu_tai_khoan` |
| Quy tắc | `thoi_han_xu_ly_ngay`, `so_cap_duyet`, `ky_tu_ly_do_toi_thieu` |
| Upload | `kich_thuoc_toi_da_mb`, `so_file_toi_da`, `dinh_dang_cho_phep` |
| Hệ thống | `maintenanceMode`, `laisuatnganhangthamchieu` |
| Landing page | `hero_*`, `process_*`, `donor_wall_*`, `ai_*`, `testimonials_*`, `progress_*`, `footer_*`, `guidelines_*` |

**Flow cập nhật:**
1. Admin gọi `PATCH /api/system/settings` với các field cần thay
2. Validate `so_cap_duyet` (1-5) nếu có
3. Merge vào settings hiện tại, ghi file JSON
4. Audit log với action `CAP_NHAT_CAI_DAT_HE_THONG`

**Flow xem:**
- `GET /api/system/settings` — Admin/BKS xem đầy đủ (bao gồm internal config)
- `GET /api/system/public` — Công khai, chỉ trả các trường public (bỏ sensitive)

---

### 20. Phân Quyền Trang (Page Permissions)

**Ma trận 26 trang × 6 vai trò:**

| Trang | Admin | Cán bộ | Kế toán | SV | NTT | BKS |
|-------|:-----:|:------:|:-------:|:--:|:---:|:---:|
| Trang chủ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Danh mục quỹ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Hướng dẫn | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Vinh danh | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Cá nhân | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Tạo đơn | ✗ | ✗ | ✗ | ✓ | ✓ | ✗ |
| Tra cứu | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Dashboard | ✓ | ✓ | ✓ | ✗ | ✗ | ✓ |
| Quản lý NN | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| Xét duyệt | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| Danh sách Quỹ | ✓ | ✓ | ✗ | ✗ | ✗ | ✓ |
| Nhà tài trợ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| SV nổi bật | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| Tin tức | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| Báo cáo | ✓ | ✓ | ✓ | ✗ | ✗ | ✓ |
| Khoản TT | ✓ | ✗ | ✓ | ✗ | ✗ | ✓ |
| Lịch sử GD | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Về Quỹ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Cựu SV | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Giao dịch | ✓ | ✗ | ✓ | ✗ | ✗ | ✓ |
| Giải ngân | ✗ | ✗ | ✓ | ✗ | ✗ | ✗ |
| Đối soát CT | ✓ | ✗ | ✓ | ✗ | ✗ | ✗ |
| Phê duyệt | ✓ | ✗ | ✗ | ✗ | ✗ | ✓ |
| Phân quyền | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Nhật ký | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Nhân sự | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Giám sát | ✓ | ✓ | ✓ | ✗ | ✗ | ✓ |
| Phân bổ | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| Cảm nhận | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |

**Flow cập nhật:**
1. Admin gọi `PATCH /api/system/permissions` với ma trận mới
2. Merge vào `page_permissions.json`, ghi file
3. Audit log (fire-and-forget)
4. Frontend đọc permissions → lọc sidebar + menu theo vai trò

---

### 21. Quản Lý Vai Trò

- `PATCH /api/vaitro/:role_id` — cập nhật mô tả/trạng thái
- **Bảo vệ:** Không cho sửa Admin (role_id=1) và Nguoi dung (role_id=4)
- Trạng thái: `Hoat dong` hoặc `Tam dung`
- Khi `Tam dung`: user có role đó bị block khi login hoặc gọi API
- Audit log với action `CAP_NHAT_VAI_TRO`

---

### 22. Chế Độ Bảo Trì (Maintenance Mode)

**Kích hoạt:** Admin set `maintenanceMode: true` trong `system_settings.json`

**Ảnh hưởng:**

| Vị trí | Hành vi |
|--------|---------|
| `POST /api/auth/register` | Trả 503 — block đăng ký mới |
| `POST /api/auth/login` | Trả 503 nếu user không phải Admin (role_id=1) |
| `protect` middleware | Trả 503 nếu decoded token không phải Admin |

**Đặc điểm kỹ thuật:**
- Đọc file JSON **đồng bộ** (`readFileSync`) trên MỖI request → toggle có hiệu lực ngay lập tức, không cần restart
- Admin **luôn được miễn** — có thể đăng nhập và truy cập mọi endpoint
- File default: `maintenanceMode: false`

---

### 23. Audit Log Tự Động

**Hệ thống ghi log 2 lớp:**

**Lớp 1 — Middleware tự động (`auditLogMiddleware.js`):**
1. Bắt mọi request `POST/PUT/PATCH/DELETE` có prefix `/api/`
2. Skip: `/api/nhat-ky`, `/api/auth/refresh-token`, `/api/applications/ai-suggest`, `/api/bao-cao/xuat`
3. Trên response `finish` event:
   - Skip nếu `req._systemLogWritten = true` (controller đã log trước)
   - Skip nếu status < 200 hoặc >= 400
   - Extract route params, URL path
4. Map URL prefix → resource type (17 mapping: `/api/news` → `tintuc`, `/api/funds` → `quy`, ...)
5. Sanitize data: mask password/token, convert Date, detect circular refs, truncate JSON > 6000 chars
6. Ghi log async với: action (`API_TAO_MOI/CAP_NHAT/XOA`), user ID, IP, method, path, status, duration, body

**Lớp 2 — Controller explicit log:**
- Các controller quan trọng tự gọi `logSystemActivity()` với action cụ thể (VD: `NOP_YEU_CAU_HO_TRO`, `DUYET_PHAN_BO`)
- Dùng `req._systemLogWritten = true` để báo middleware không log trùng

**Xem nhật ký:**
- `GET /api/nhat-ky` — phân trang, filter: keyword, hành động, đối tượng, ngày
- `GET /api/nhat-ky/stats` — thống kê tổng, hôm nay, tuần này, user hôm nay
- `GET /api/nhat-ky/export` — xuất Excel (.xlsx) với filter

---

### 24. Rate Limiting

**Triển khai:** In-memory, per-IP, dùng `Map`.

**Cấu hình:**
- `windowMs`: cửa sổ thời gian (mặc định 1 giờ)
- `max`: số request tối đa trong cửa sổ (mặc định 3)
- Message lỗi khi bị limit

**Flow:**
1. Extract IP từ `x-forwarded-for` hoặc `req.socket.remoteAddress`
2. Nếu IP mới → tạo entry `{count: 1, resetTime: now + windowMs}`
3. Nếu window hết hạn → reset count
4. Nếu count >= max → trả 429 với thông báo còn bao nhiêu phút
5. Cleanup tự động mỗi 5 phút (xóa entries hết hạn)

> **Lưu ý:** Rate limiter là per-process (reset khi server restart), không distributed.

---

### 25. Đối Soát Chứng Từ Chi

Kế toán upload file sao kê ngân hàng (CSV/Excel/TXT), hệ thống tự động:

1. Parse file → extract các giao dịch
2. So khớp với dữ liệu trong `giaodich` theo: số tiền, ngày, nội dung
3. Phân loại kết quả:
   - **Đã khớp** — giao dịch trong hệ thống khớp với sao kê
   - **Chưa khớp** — có trong hệ thống nhưng không tìm thấy trong sao kê
   - **Sai lệch** — có trong cả hai nhưng số tiền/khác biệt
4. Hiển thị kết quả trên UI để kế toán xem xét

---

*Tài liệu trích xuất từ `TongQuan.md` — Cập nhật lần cuối: 2026-08-02*
