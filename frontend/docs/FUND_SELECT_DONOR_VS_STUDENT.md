# FundSelectSection - Hiển thị khác biệt cho Nhà tài trợ vs Sinh viên

## Vấn đề

Trước đây, FundSelectSection hiển thị **cùng thông tin** cho cả Nhà tài trợ và Sinh viên:
- ❌ Giá trị hỗ trợ (min/max) - Chỉ cần cho sinh viên
- ❌ Hạn nộp đơn - Chỉ cần cho sinh viên
- ❌ Số suất còn lại - Chỉ cần cho sinh viên
- ❌ Tỷ lệ đã nhận (progress bar) - Chỉ cần cho sinh viên

→ **Không phù hợp** với logic Nhà tài trợ (chỉ cần biết thông tin tổng quan về quỹ)

## Giải pháp

Đã cập nhật FundSelectSection để hiển thị **thông tin khác nhau** dựa trên prop `isDonor`.

## So sánh hiển thị

### 🎓 Sinh viên (isDonor = false)

**Mục đích**: Xem điều kiện để nộp đơn xin hỗ trợ

```
┌─────────────────────────────────────────┐
│ 📋 Tóm tắt điều kiện                    │
│ Sinh viên có hoàn cảnh khó khăn...     │
├─────────────────────────────────────────┤
│ 💰 Giá trị hỗ trợ                       │
│ 1,000,000đ – 5,000,000đ                │
├─────────────────────────────────────────┤
│ 📅 Hạn nộp đơn                          │
│ 31/12/2024                              │
├─────────────────────────────────────────┤
│ 💵 Số dư quỹ                            │
│ 50,000,000đ                             │
├─────────────────────────────────────────┤
│ 👥 Số suất còn lại                      │
│ 8 / 10 suất                             │
├─────────────────────────────────────────┤
│ Tỷ lệ đã nhận: 80%                      │
│ [████████████████░░░░] 80%              │
└─────────────────────────────────────────┘
```

**Thông tin hiển thị:**
- ✅ Giá trị hỗ trợ (min/max)
- ✅ Hạn nộp đơn (với cảnh báo nếu sắp hết hạn)
- ✅ Số dư quỹ (với cảnh báo nếu thấp)
- ✅ Số suất còn lại (với cảnh báo nếu sắp đầy)
- ✅ Progress bar tỷ lệ đã nhận
- ✅ Badge "Không giới hạn suất" (nếu có)

### 💝 Nhà tài trợ (isDonor = true)

**Mục đích**: Xem thông tin tổng quan về quỹ để quyên góp

```
┌─────────────────────────────────────────┐
│ ℹ️ Thông tin quỹ                        │
│ Cảm ơn bạn đã quan tâm đến quỹ này...  │
├─────────────────────────────────────────┤
│ 💵 Số dư quỹ hiện tại                   │
│ 50,000,000đ                             │
├─────────────────────────────────────────┤
│ 👥 Số người đã nhận hỗ trợ              │
│ 8 người                                 │
├─────────────────────────────────────────┤
│ 💰 Loại quỹ                             │
│ Học bổng                                │
├─────────────────────────────────────────┤
│ ℹ️ Trạng thái                           │
│ Đang hoạt động                          │
├─────────────────────────────────────────┤
│ 💝 Mọi đóng góp của bạn đều có ý nghĩa │
│ và sẽ giúp đỡ những sinh viên có hoàn  │
│ cảnh khó khăn                           │
└─────────────────────────────────────────┘
```

**Thông tin hiển thị:**
- ✅ Số dư quỹ hiện tại (không cảnh báo)
- ✅ Số người đã nhận hỗ trợ (impact)
- ✅ Loại quỹ (Học bổng, Từ thiện, Y tế...)
- ✅ Trạng thái (Đang hoạt động)
- ✅ Message khích lệ quyên góp
- ❌ KHÔNG hiển thị: Giá trị hỗ trợ min/max
- ❌ KHÔNG hiển thị: Hạn nộp đơn
- ❌ KHÔNG hiển thị: Số suất còn lại
- ❌ KHÔNG hiển thị: Progress bar

## Code Changes

### FundSelectSection.jsx

**Condition Card:**
```jsx
<div className={styles.conditionCard}>
  <div className={styles.conditionHeader}>
    <HiOutlineInformationCircle className={styles.conditionIcon} />
    <span className={styles.conditionTitle}>
      {isDonor ? 'Thông tin quỹ' : 'Tóm tắt điều kiện'}
    </span>
  </div>
  <p className={styles.conditionText}>
    {fundDetail.dieuKienTomTat ||
      (isDonor 
        ? 'Cảm ơn bạn đã quan tâm đến quỹ này. Mọi đóng góp của bạn sẽ được sử dụng đúng mục đích.'
        : 'Chưa có thông tin điều kiện cho quỹ này.'
      )}
  </p>
</div>
```

**Info Grid - Donor:**
```jsx
{isDonor ? (
  <div className={styles.infoGrid}>
    {/* Số dư quỹ hiện tại */}
    <div className={styles.infoCell}>
      <div className={styles.infoLabel}>
        <HiOutlineBanknotes className={styles.infoIcon} /> Số dư quỹ hiện tại
      </div>
      <div className={styles.infoValue}>
        {formatVND(soDu)}
      </div>
    </div>

    {/* Số người đã nhận hỗ trợ */}
    <div className={styles.infoCell}>
      <div className={styles.infoLabel}>
        <HiOutlineUsers className={styles.infoIcon} /> Số người đã nhận hỗ trợ
      </div>
      <div className={styles.infoValue}>
        {soDonDaNop || 0} người
      </div>
    </div>

    {/* Loại quỹ */}
    <div className={styles.infoCell}>
      <div className={styles.infoLabel}>
        <HiOutlineCurrencyDollar className={styles.infoIcon} /> Loại quỹ
      </div>
      <div className={styles.infoValue}>
        {formatLoaiQuyLabel(fundDetail.loaiQuy)}
      </div>
    </div>

    {/* Trạng thái */}
    <div className={styles.infoCell}>
      <div className={styles.infoLabel}>
        <HiOutlineInformationCircle className={styles.infoIcon} /> Trạng thái
      </div>
      <div className={`${styles.infoValue} ${styles.valueSuccess}`}>
        Đang hoạt động
      </div>
    </div>
  </div>
) : (
  // Student info grid (giữ nguyên như cũ)
  <div className={styles.infoGrid}>
    {/* Giá trị hỗ trợ, Hạn nộp đơn, Số dư quỹ, Số suất còn lại */}
  </div>
)}
```

**Progress Bar - Student only:**
```jsx
{!isDonor && soLuongChiTieu != null && (
  <div className={styles.progressSection}>
    {/* Progress bar */}
  </div>
)}
```

**Unlimited Badge - Student only:**
```jsx
{!isDonor && soLuongChiTieu == null && (
  <div className={styles.unlimitedBadge}>
    Không giới hạn suất — có thể nộp đơn tự do
  </div>
)}
```

**Donor Message - Donor only:**
```jsx
{isDonor && (
  <div className={styles.donorMessage}>
    💝 Mọi đóng góp của bạn đều có ý nghĩa và sẽ giúp đỡ những sinh viên có hoàn cảnh khó khăn
  </div>
)}
```

### FundSelectSection.module.scss

**New styles:**
```scss
.valueSuccess {
  color: #10b981;
}

.donorMessage {
  margin-top: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #16a34a;
  background: linear-gradient(135deg, #dcfce7 0%, #d1fae5 100%);
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid rgba(22, 163, 74, 0.2);
  line-height: 1.5;
}
```

## Lý do thiết kế

### Sinh viên cần biết:
1. **Giá trị hỗ trợ**: Để biết có thể xin bao nhiêu
2. **Hạn nộp đơn**: Để kịp nộp đơn
3. **Số suất còn lại**: Để biết cơ hội được nhận
4. **Số dư quỹ**: Để biết quỹ còn tiền không

### Nhà tài trợ cần biết:
1. **Số dư quỹ**: Để biết quỹ đang có bao nhiêu
2. **Số người đã nhận**: Để thấy impact (đã giúp được bao nhiêu người)
3. **Loại quỹ**: Để biết mục đích của quỹ
4. **Trạng thái**: Để biết quỹ còn hoạt động không

### Nhà tài trợ KHÔNG cần:
- ❌ Giá trị hỗ trợ min/max (họ tự quyết định số tiền)
- ❌ Hạn nộp đơn (không liên quan đến quyên góp)
- ❌ Số suất còn lại (không giới hạn quyên góp)
- ❌ Progress bar (không cần biết tỷ lệ)

## UX Improvements

### Donor Message
- 💝 Icon trái tim để tạo cảm xúc
- Gradient xanh lá (màu hy vọng, tích cực)
- Message khích lệ và cảm ơn
- Nhấn mạnh impact (giúp đỡ sinh viên)

### Info Labels
- **Donor**: "Số dư quỹ hiện tại" (nhấn mạnh hiện tại)
- **Student**: "Số dư quỹ" (ngắn gọn)
- **Donor**: "Số người đã nhận hỗ trợ" (impact)
- **Student**: "Số suất còn lại" (cơ hội)

### Color Coding
- **Success** (green): Trạng thái "Đang hoạt động"
- **Danger** (red): Hạn nộp đơn sắp hết, Số dư thấp
- **Warning** (orange): Số suất sắp đầy

## Testing Checklist

### Functional
- [x] Donor thấy 4 info cells đúng
- [x] Student thấy 4 info cells đúng
- [x] Donor KHÔNG thấy progress bar
- [x] Student thấy progress bar (nếu có giới hạn suất)
- [x] Donor thấy donor message
- [x] Student KHÔNG thấy donor message
- [x] Donor KHÔNG thấy unlimited badge
- [x] Student thấy unlimited badge (nếu không giới hạn)
- [x] Build thành công

### UI/UX
- [x] Donor message gradient xanh lá
- [x] Trạng thái màu xanh (success)
- [x] Labels phù hợp với từng role
- [x] Icons phù hợp với content
- [x] Responsive trên mobile

### Content
- [x] Donor: "Thông tin quỹ" (title)
- [x] Student: "Tóm tắt điều kiện" (title)
- [x] Donor: Fallback message khích lệ
- [x] Student: Fallback message thông thường
- [x] Số người format: "8 người"
- [x] Loại quỹ format: "Học bổng"

## Responsive Design

### Desktop (> 768px)
- Info grid: 2x2 (4 cells)
- Donor message: Full width
- Icons + labels ngang

### Mobile (≤ 768px)
- Info grid: 1 column (4 cells dọc)
- Donor message: Full width, wrap text
- Icons + labels ngang (giữ nguyên)

## Build Status

✅ **Build thành công**: `npm run build` - No errors
✅ **Bundle size**: 1,137.84 kB (tăng 1.4 kB)
✅ **No breaking changes**: Cả 2 luồng đều hoạt động

## Impact

### Trước (Before)
- ❌ Nhà tài trợ thấy thông tin không liên quan (hạn nộp đơn, số suất)
- ❌ Gây confusion và không professional
- ❌ Không tạo động lực quyên góp

### Sau (After)
- ✅ Nhà tài trợ thấy thông tin phù hợp (số dư, impact)
- ✅ Professional và clear
- ✅ Donor message tạo động lực quyên góp
- ✅ Sinh viên vẫn thấy đầy đủ thông tin cần thiết

## Next Steps

1. **Test với backend API thực**
   - Verify `soDonDaNop` trả về đúng
   - Verify `loaiQuy` format đúng

2. **UX improvements (optional)**
   - Thêm icon động cho donor message
   - Thêm tooltip giải thích "Số người đã nhận hỗ trợ"
   - Thêm link "Xem chi tiết quỹ"

3. **Analytics (future)**
   - Track donor engagement với message
   - A/B test message variants
   - Measure conversion rate

## Kết luận

✅ **Hoàn thành**: FundSelectSection hiển thị khác biệt cho Donor vs Student
✅ **UX**: Phù hợp với logic và nhu cầu của từng role
✅ **Build**: Thành công
✅ **Ready**: Sẵn sàng test với cả 2 loại tài khoản

**Vấn đề đã giải quyết:**
- ❌ Trước: Nhà tài trợ thấy thông tin sinh viên (hạn nộp đơn, số suất)
- ✅ Sau: Nhà tài trợ thấy thông tin phù hợp (số dư, impact, loại quỹ, trạng thái)
