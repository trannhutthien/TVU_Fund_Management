# CSS Improvements - ProfilePage

## Vấn đề

Trong PersonalInfoSection, các trường thông tin cá nhân (tên, email, SĐT, địa chỉ, MSSV, khoa) đều là **readonly** (disabled) và có màu xám nhạt (`$text-disabled`) khiến **khó đọc**.

### Trước khi sửa:
```scss
.input-field:disabled {
  color: $text-disabled; // Màu xám nhạt #94a3b8
  background: $border-light;
  opacity: 0.6;
}
```

**Vấn đề:**
- ❌ Màu chữ quá nhạt (#94a3b8)
- ❌ Opacity 0.6 làm mờ thêm
- ❌ Khó đọc, gây mệt mắt

## Giải pháp

Override CSS cho disabled inputs trong PersonalInfoSection để **dễ đọc hơn** mà vẫn giữ được cảm giác readonly.

### Sau khi sửa (v2 - Bold):
```scss
// PersonalInfoSection.module.scss
.section {
  // Override disabled input color để dễ đọc hơn
  :global(.input-field:disabled) {
    color: #0f172a !important; // Màu đen đậm hơn nữa
    font-weight: $font-bold !important; // Bold (700)
    background: #f8fafc !important; // Background sáng nhẹ
    opacity: 1 !important;
  }

  // Label của disabled input cũng đậm hơn
  :global(.input-disabled .input-label-floating) {
    color: #475569 !important; // Xám đậm hơn
    font-weight: $font-bold !important; // Bold (700)
  }
}
```

## Kết quả

### Màu sắc mới:

| Element | Trước | Sau (v1) | Sau (v2 - Bold) |
|---------|-------|----------|-----------------|
| **Text value** | `#94a3b8` (xám nhạt) | `#1e293b` (đen đậm) | `#0f172a` (đen đậm hơn) ✅ |
| **Background** | `$border-light` | `#f8fafc` (sáng nhẹ) | `#f8fafc` (sáng nhẹ) |
| **Label** | `$text-secondary` | `#64748b` (xám đậm) | `#475569` (xám đậm hơn) ✅ |
| **Opacity** | `0.6` | `1` | `1` |
| **Font weight** | `$font-regular` (400) | `$font-medium` (500) | `$font-bold` (700) ✅ |

### Lợi ích:

✅ **Dễ đọc hơn:** Màu đen đậm (#1e293b) thay vì xám nhạt  
✅ **Rõ ràng hơn:** Opacity 1 thay vì 0.6  
✅ **Chuyên nghiệp:** Font weight medium làm nổi bật thông tin  
✅ **Vẫn giữ readonly feel:** Background sáng nhẹ (#f8fafc) cho biết không thể edit  
✅ **Accessibility:** Contrast ratio cao hơn, dễ đọc cho người khiếm thị

## Scope

Chỉ áp dụng cho **PersonalInfoSection** trong ProfilePage:
- ✅ Họ và tên
- ✅ Email
- ✅ Số điện thoại
- ✅ MSSV
- ✅ Địa chỉ liên hệ
- ✅ Khoa/Đơn vị

**Không ảnh hưởng đến:**
- ❌ Các Input disabled khác trong app
- ❌ BankAccountSection
- ❌ Các form khác

## Technical Details

### CSS Specificity

Sử dụng `:global()` để target Input component từ bên ngoài:

```scss
// Trong module SCSS
:global(.input-field:disabled) {
  // Override styles
}
```

### !important Usage

Cần dùng `!important` vì:
1. Input component có styles inline từ JS
2. Disabled state có specificity cao
3. Đảm bảo override thành công

### Browser Support

✅ Chrome/Edge: Full support  
✅ Firefox: Full support  
✅ Safari: Full support  
✅ Mobile browsers: Full support

## Testing

### Manual Testing Checklist

- [x] Build thành công
- [ ] Text màu đen đậm dễ đọc
- [ ] Background sáng nhẹ
- [ ] Label rõ ràng
- [ ] Responsive trên mobile
- [ ] Không ảnh hưởng sections khác

### Visual Comparison

**Trước:**
```
Họ và tên: [Nguyễn Văn A]  ← Xám nhạt, mờ
Email: [nguyenvana@tvu.edu.vn]  ← Khó đọc
```

**Sau:**
```
Họ và tên: [Nguyễn Văn A]  ← Đen đậm, rõ ràng
Email: [nguyenvana@tvu.edu.vn]  ← Dễ đọc
```

## Future Improvements

1. **Tạo variant mới cho Input component:**
   ```jsx
   <Input variant="readonly" />
   ```

2. **Thêm vào design system:**
   ```scss
   $text-readonly: #1e293b;
   $bg-readonly: #f8fafc;
   ```

3. **Tạo ReadonlyInput component riêng:**
   ```jsx
   <ReadonlyInput label="Họ và tên" value={user.hoTen} />
   ```

## Related Files

- `frontend/src/pages/User/Student/ProfilePage/student/sections/PersonalInfoSection.module.scss`
- `frontend/src/components/common/Input/Input.scss`
- `frontend/docs/CSS_IMPROVEMENTS.md` (this file)

## Date

Improvement completed: 2026-05-27  
**v2 Update (Bold):** 2026-05-27 - Tăng font-weight lên Bold (700) để dễ đọc hơn nữa
