# GuidelinesPage - Implementation Guide

## 📋 Tổng Quan

Trang **Hướng dẫn & Quy định** công khai cho TVU Fund Management.
- Không yêu cầu đăng nhập
- Hướng dẫn cho 3 nhóm: Sinh viên, Nhà tài trợ, Người mới

---

## ✅ Đã Hoàn Thành (40%)

### Main Page
- ✅ `GuidelinesPage.jsx` - Main container
- ✅ `GuidelinesPage.module.scss` - Main styles

### Sections Completed
- ✅ **HDHeroSection** - Hero banner với search
- ✅ **HDTabSection** - Sticky tabs (3 tabs)
- ✅ **HDSinhVienSection** - Hướng dẫn sinh viên (4 bước)

---

## ⏳ Cần Hoàn Thành (60%)

### 1. HDNhaTaiTroSection
**Path**: `frontend/src/pages/Public/GuidelinesPage/sections/HDNhaTaiTroSection/`

**Content**:
```javascript
const STEPS_NTT = [
  {
    step: 1,
    icon: HiOutlineBuildingOffice,
    title: 'Đăng ký tài khoản',
    desc: 'Đăng ký tài khoản Nhà tài trợ với thông tin tổ chức/cá nhân. Admin sẽ xác minh thông tin trước khi kích hoạt.',
    time: '~5 phút',
  },
  {
    step: 2,
    icon: HiOutlineCurrencyDollar,
    title: 'Tạo khoản tài trợ',
    desc: 'Chọn quỹ muốn hỗ trợ, nhập số tiền cam kết, tải ảnh minh chứng chuyển khoản. Cán bộ sẽ xác nhận trong 24h.',
    time: '~5 phút',
  },
  {
    step: 3,
    icon: HiOutlineChartBar,
    title: 'Theo dõi tác động',
    desc: 'Xem báo cáo sử dụng quỹ, danh sách sinh viên được hỗ trợ từ đóng góp của bạn. Xuất báo cáo tác động theo yêu cầu.',
    time: 'Realtime',
  },
];

const QUYEN_LOI = [
  'Tên và logo hiển thị trên Bảng Vàng Nhà tài trợ',
  'Nhận báo cáo sử dụng quỹ định kỳ hàng quý',
  'Giấy xác nhận đóng góp có chữ ký Ban Giám hiệu',
  'Được vinh danh tại các sự kiện của Nhà trường',
  'Tiếp cận nguồn nhân lực chất lượng cao từ TVU',
  'Hỗ trợ tư vấn chương trình hợp tác đào tạo',
];
```

**Layout**:
- 3 steps stepper (tương tự HDSinhVienSection)
- Card "Quyền lợi nhà tài trợ" với gradient Gold
- Grid 2 cột, 6 quyền lợi với icon HiOutlineCheckCircle Gold

---

### 2. HDQuyDinhSection
**Path**: `frontend/src/pages/Public/GuidelinesPage/sections/HDQuyDinhSection/`

**Content**: 5 accordion items
```javascript
const QUY_DINH = [
  {
    id: 'dieu_kien',
    icon: HiOutlineUserCheck,
    title: 'Điều kiện xét duyệt hỗ trợ',
    color: 'var(--color-primary)',
    content: [
      { 
        sub: 'Đối tượng được hỗ trợ', 
        items: [
          'Sinh viên hệ chính quy đang theo học tại TVU',
          'Có hoàn cảnh khó khăn được xác nhận bởi địa phương',
          'GPA tối thiểu theo quy định từng quỹ (thường ≥ 2.0)',
          'Không vi phạm kỷ luật trong năm học hiện tại'
        ] 
      },
      { 
        sub: 'Mức hỗ trợ', 
        items: [
          'Tùy theo từng quỹ, dao động từ 1 – 20 triệu đồng/suất',
          'Mỗi sinh viên chỉ được nhận 1 suất/kỳ từ cùng 1 quỹ',
          'Có thể nhận đồng thời từ nhiều quỹ khác nhau nếu đủ điều kiện'
        ] 
      },
    ]
  },
  // ... 4 items khác
];
```

**Features**:
- Accordion tự code với useState
- Click header toggle open/close
- Icon HiOutlineChevronDown rotate 180deg khi mở
- Animation slideDown

---

### 3. HDFAQSection
**Path**: `frontend/src/pages/Public/GuidelinesPage/sections/HDFAQSection/`

**Content**:
```javascript
const FAQ_TABS = ['Tất cả', 'Sinh viên', 'Nhà tài trợ', 'Tài khoản', 'Hồ sơ'];

const FAQ_DATA = [
  {
    group: 'Sinh viên',
    q: 'Tôi có thể nộp đơn cho nhiều quỹ cùng lúc không?',
    a: 'Có, bạn có thể nộp đơn cho nhiều quỹ khác nhau cùng lúc nếu đáp ứng điều kiện của từng quỹ...',
  },
  // ... 7 câu hỏi khác
];
```

**Features**:
- Filter tabs (chip buttons)
- Search filter theo `searchKeyword` từ props
- Accordion FAQ items
- Icon HiOutlineQuestionMarkCircle Gold

---

### 4. HDContactSection
**Path**: `frontend/src/pages/Public/GuidelinesPage/sections/HDContactSection/`

**Content**:
```javascript
const LIEN_HE = [
  {
    icon: HiOutlinePhone,
    title: 'Gọi điện trực tiếp',
    info: '(0294) 3855 246',
    sub: 'Thứ 2 – Thứ 6: 7:30 – 17:00',
    href: 'tel:02943855246',
    btnLabel: 'Gọi ngay',
  },
  {
    icon: HiOutlineEnvelope,
    title: 'Gửi email',
    info: 'phongctsv@tvu.edu.vn',
    sub: 'Phản hồi trong vòng 24h làm việc',
    href: 'mailto:phongctsv@tvu.edu.vn',
    btnLabel: 'Gửi email',
  },
  {
    icon: HiOutlineMapPin,
    title: 'Đến trực tiếp',
    info: 'Phòng Công tác sinh viên',
    sub: '126 Nguyễn Thiện Thành, TP. Trà Vinh',
    href: '#',
    btnLabel: 'Xem bản đồ',
  },
];
```

**Layout**:
- Nền var(--color-primary)
- Grid 3 cột
- Card nền rgba(255,255,255,0.1)
- Button variant outline màu trắng

---

## 📁 File Structure

```
frontend/src/pages/Public/GuidelinesPage/
├── GuidelinesPage.jsx                          ✅
├── GuidelinesPage.module.scss                  ✅
└── sections/
    ├── HDHeroSection/
    │   ├── index.jsx                           ✅
    │   └── HDHeroSection.module.scss           ✅
    ├── HDTabSection/
    │   ├── index.jsx                           ✅
    │   └── HDTabSection.module.scss            ✅
    ├── HDSinhVienSection/
    │   ├── index.jsx                           ✅
    │   └── HDSinhVienSection.module.scss       ✅
    ├── HDNhaTaiTroSection/
    │   ├── index.jsx                           ⏳ TODO
    │   └── HDNhaTaiTroSection.module.scss      ⏳ TODO
    ├── HDQuyDinhSection/
    │   ├── index.jsx                           ⏳ TODO
    │   └── HDQuyDinhSection.module.scss        ⏳ TODO
    ├── HDFAQSection/
    │   ├── index.jsx                           ⏳ TODO
    │   └── HDFAQSection.module.scss            ⏳ TODO
    └── HDContactSection/
        ├── index.jsx                           ⏳ TODO
        └── HDContactSection.module.scss        ⏳ TODO
```

---

## 🎨 Design Tokens

### Colors
```scss
--color-primary: #1a2f5e;  // Navy Blue
--color-gold: #f0a500;     // Gold
--color-white: #ffffff;    // White
```

### Typography
```scss
font-family: 'Be Vietnam Pro', sans-serif;  // Headings
font-family: 'Inter', sans-serif;           // Body text
```

### Spacing
```scss
--section-padding: 64px 24px;
--container-max-width: 1200px;
--gap-large: 48px;
--gap-medium: 24px;
--gap-small: 12px;
```

---

## 🔧 Technical Requirements

### State Management
```javascript
const [activeTab, setActiveTab] = useState('sinh_vien');
const [activeFAQ, setActiveFAQ] = useState(null);
const [searchKeyword, setSearchKeyword] = useState('');
```

### Accordion Logic
```javascript
const [openAccordion, setOpenAccordion] = useState(null);

const toggleAccordion = (id) => {
  setOpenAccordion(openAccordion === id ? null : id);
};
```

### Search Filter
```javascript
const filteredFAQ = FAQ_DATA.filter(faq => {
  const matchKeyword = !searchKeyword || 
    faq.q.toLowerCase().includes(searchKeyword.toLowerCase()) ||
    faq.a.toLowerCase().includes(searchKeyword.toLowerCase());
  
  const matchGroup = activeGroup === 'Tất cả' || faq.group === activeGroup;
  
  return matchKeyword && matchGroup;
});
```

---

## 📱 Responsive Breakpoints

```scss
// Desktop
@media (min-width: 992px) { ... }

// Tablet
@media (max-width: 991px) { ... }

// Mobile
@media (max-width: 768px) { ... }

// Small Mobile
@media (max-width: 576px) { ... }
```

---

## 🚀 Next Steps

### Step 1: Create HDNhaTaiTroSection
- Copy structure from HDSinhVienSection
- Update STEPS_NTT data
- Add QUYEN_LOI card with Gold gradient

### Step 2: Create HDQuyDinhSection
- Implement accordion component
- Add 5 QUY_DINH items
- Style with different colors per item

### Step 3: Create HDFAQSection
- Add filter tabs
- Implement search filter
- Create FAQ accordion

### Step 4: Create HDContactSection
- Grid 3 contact cards
- Add href links
- Style with Navy background

### Step 5: Add Route
Update `App.jsx`:
```javascript
import GuidelinesPage from './pages/Public/GuidelinesPage/GuidelinesPage';

// In PublicLayoutWithSidebar routes:
<Route path="/guidelines" element={<GuidelinesPage />} />
```

### Step 6: Test
- Test all tabs
- Test accordions
- Test search
- Test responsive
- Test navigation

---

## ✅ Checklist

- [x] Main page structure
- [x] HDHeroSection
- [x] HDTabSection
- [x] HDSinhVienSection
- [ ] HDNhaTaiTroSection
- [ ] HDQuyDinhSection
- [ ] HDFAQSection
- [ ] HDContactSection
- [ ] Add route to App.jsx
- [ ] Test all features
- [ ] Responsive testing

---

## 📊 Progress: 40% Complete

**Completed**: 3/7 sections  
**Remaining**: 4 sections + routing + testing

**Estimated time**: 2-3 hours for remaining work

---

**Created**: 27/05/2026  
**Status**: In Progress 🚧  
**Next**: Implement HDNhaTaiTroSection
