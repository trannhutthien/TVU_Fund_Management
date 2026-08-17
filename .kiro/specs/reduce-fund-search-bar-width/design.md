# Design Document: Reduce Fund Search Bar Width

## Overview

Thiết kế này mô tả việc thu nhỏ chiều rộng thanh tìm kiếm trong `FundSelectSection` component từ full-width sang max-width 800px với căn giữa, nhằm cải thiện bố cục giao diện và tạo sự cân đối trực quan hơn. Thay đổi này chỉ ảnh hưởng đến CSS styling mà không làm thay đổi cấu trúc DOM hay logic nghiệp vụ.

### Design Goals

- Thu nhỏ search bar xuống max-width 800px trên desktop để tạo bố cục cân đối hơn
- Căn giữa search bar trong container để tạo focal point rõ ràng
- Bảo toàn tất cả chức năng hiện có (search callback, icons, placeholder, hover/focus effects)
- Duy trì responsive behavior trên mobile và tablet
- Giữ nguyên animation và transition effects hiện có

### Non-Goals

- Không thay đổi cấu trúc HTML/JSX của component
- Không thay đổi logic xử lý search
- Không thay đổi layout hoặc styling của Filters Row
- Không thêm tính năng mới

## Architecture

### Component Structure

```
FundSelectSection (React Component)
├── Container (max-width: 1400px)
│   └── SearchRow (flex column, centered)
│       ├── SearchWrapper (max-width: 800px) ← MODIFIED
│       │   └── Input (search bar)
│       └── FiltersRow (full width, 4 columns)
│           ├── Sort Filter
│           ├── Fund Type Filter
│           ├── Level Filter
│           └── Status Filter
```

### Architectural Pattern

- **Component-based architecture**: FundSelectSection là một presentational component
- **CSS Modules**: Styling được encapsulated trong `FundSelectSection.module.scss`
- **SCSS Variables**: Sử dụng design tokens từ `frontend/src/styles/variables`
- **Responsive Design**: Mobile-first approach với breakpoints

### Technology Stack

- **React 18**: Component framework
- **SCSS Modules**: Styling với CSS Modules
- **Design System**: Sử dụng shared variables (`$space-*`, `$radius-*`, `$text-*`, `$z-*`)

## Components and Interfaces

### Modified SCSS Classes

#### 1. `.searchWrapper`

**Current Implementation:**
```scss
.searchWrapper {
  width: 100%;
  position: relative;
  // ... other styles
}
```

**Proposed Changes:**
```scss
.searchWrapper {
  width: 100%;
  max-width: 800px; // NEW: Limit maximum width
  margin: 0 auto;    // NEW: Center horizontally
  position: relative;
  // ... other styles remain unchanged
}
```

**Rationale:**
- `max-width: 800px` giới hạn chiều rộng tối đa trên màn hình lớn
- `margin: 0 auto` căn giữa search bar trong container
- `width: 100%` đảm bảo responsive trên màn hình nhỏ hơn 800px

#### 2. `.searchRow`

**Current Implementation:**
```scss
.searchRow {
  display: flex;
  flex-direction: column;
  gap: $space-4; // 16px
  width: 100%;
  align-items: center; // Already centered
}
```

**Status:** No changes needed. Already configured for center alignment.

#### 3. Responsive Breakpoints

**Current Implementation:** Maintained as-is
- Desktop (>1024px): 56px height
- Tablet (≤1024px): 52px height
- Mobile (≤640px): 50px height, adjusted icon positioning

**Status:** No changes needed. All responsive styles will work with the new max-width constraint.

### Component Interface (No Changes)

```typescript
interface FundSelectSectionProps {
  onSearch?: (keyword: string) => void;
  onSortChange?: (value: string) => void;
  loaiQuyData?: Array<{
    maLoai?: string;
    ma_loai?: string;
    tenLoai?: string;
    ten_loai?: string;
  }>;
  activeMaLoai?: string;
  onMaLoaiChange?: (value: string | null) => void;
  onCapDoChange?: (value: string | null) => void;
  onTrangThaiChange?: (value: string | null) => void;
  activeCapDo?: string;
  activeTrangThai?: string;
}
```

**Impact:** None. Props interface remains unchanged.

## Data Models

### No Data Model Changes

Tính năng này chỉ ảnh hưởng đến presentation layer (CSS styling) và không có thay đổi về data models, state management, hoặc data flow.

**Existing Data Flow (Unchanged):**
1. User types in search bar → `handleSearchChange` → `onSearch(keyword)`
2. User changes filters → respective handlers → callback props
3. Component receives `loaiQuyData` → transforms to dropdown options
4. Component receives active filter values → controls dropdown values

## Error Handling

### CSS Fallback Strategy

**Browser Compatibility:**
- `max-width`: Supported in all modern browsers
- `margin: 0 auto`: Standard CSS centering technique
- `backdrop-filter`: Has fallback via background opacity

**No JavaScript Error Handling Needed:**
- Pure CSS changes không tạo ra runtime errors
- Không có conditional rendering logic changes
- Existing error boundaries remain sufficient

### Responsive Behavior Edge Cases

1. **Viewport width < 800px:**
   - `width: 100%` takes precedence over `max-width`
   - Search bar fills available space
   - No horizontal overflow

2. **Container padding interaction:**
   - Container has `padding: 0 $space-4` (32px total)
   - Search bar `max-width: 800px` calculated within padded area
   - No layout issues expected

3. **Filters Row independence:**
   - Filters Row maintains separate `width: 100%`
   - No cascading effects from search bar changes

## Testing Strategy

### PBT Applicability Assessment

**Property-Based Testing is NOT appropriate for this feature** because:

1. **Pure CSS/Styling Changes:**
   - Changes are limited to `max-width` and `margin` properties
   - No algorithmic logic or data transformations
   - Visual/layout behavior that cannot be expressed as universal properties

2. **No Input Variation:**
   - Behavior doesn't vary meaningfully with different inputs
   - Layout is deterministic based on viewport width only
   - 100 iterations would provide no more value than 1-2 manual checks

3. **Better Testing Approaches:**
   - Visual regression testing (screenshot comparison)
   - Responsive design testing across breakpoints
   - Manual QA for visual balance and aesthetics

**Therefore, the Correctness Properties section is omitted from this design.**

### Testing Approach

#### 1. Visual Regression Tests (Recommended)

**Tool:** Playwright with screenshot comparison or Chromatic

**Test Cases:**
- Capture screenshots at key breakpoints: 1920px, 1024px, 768px, 640px, 375px
- Compare before/after to verify:
  - Search bar is centered
  - Max-width constraint applies on desktop
  - Full-width behavior on mobile
  - Filters Row layout unchanged

#### 2. Unit Tests (Component)

**Framework:** Jest + React Testing Library

**Test Cases:**

```javascript
describe('FundSelectSection - Search Bar Width', () => {
  it('should render search wrapper with correct CSS class', () => {
    render(<FundSelectSection />);
    const wrapper = screen.getByRole('textbox').parentElement;
    expect(wrapper).toHaveClass('searchWrapper');
  });

  it('should maintain search functionality with new layout', () => {
    const onSearch = jest.fn();
    render(<FundSelectSection onSearch={onSearch} />);
    
    const input = screen.getByPlaceholderText(/Tìm kiếm quỹ/i);
    fireEvent.change(input, { target: { value: 'test' } });
    
    expect(onSearch).toHaveBeenCalledWith('test');
  });

  it('should render search icon on the left', () => {
    render(<FundSelectSection />);
    const input = screen.getByPlaceholderText(/Tìm kiếm quỹ/i);
    const icon = input.previousElementSibling;
    expect(icon).toBeInTheDocument();
  });
});
```

#### 3. CSS Module Tests

**Tool:** Jest with identity-obj-proxy for CSS modules

**Test Cases:**

```javascript
describe('FundSelectSection.module.scss', () => {
  it('should have searchWrapper class defined', () => {
    const styles = require('./FundSelectSection.module.scss');
    expect(styles.searchWrapper).toBeDefined();
  });

  it('should have searchRow class defined', () => {
    const styles = require('./FundSelectSection.module.scss');
    expect(styles.searchRow).toBeDefined();
  });
});
```

#### 4. Integration Tests

**Scenario:** Full page rendering with search bar interaction

```javascript
describe('FundSelectSection Integration', () => {
  it('should render search bar and filters in correct layout', () => {
    render(<FundSelectSection loaiQuyData={mockData} />);
    
    const searchWrapper = screen.getByRole('textbox').parentElement;
    const filtersRow = screen.getByText('Sắp xếp').closest('.filtersRow');
    
    expect(searchWrapper).toBeInTheDocument();
    expect(filtersRow).toBeInTheDocument();
  });

  it('should not affect filters row when search bar changes', () => {
    const { container } = render(<FundSelectSection />);
    const filtersRow = container.querySelector('.filtersRow');
    
    expect(filtersRow).toHaveStyle({ width: '100%' });
  });
});
```

#### 5. Manual QA Checklist

- [ ] Search bar centered on desktop (>1024px)
- [ ] Search bar max-width 800px visible on large screens (>1400px)
- [ ] Search bar full-width on mobile (<800px)
- [ ] Hover effects work correctly
- [ ] Focus effects work correctly
- [ ] Animation on mount plays smoothly
- [ ] Filters Row layout unchanged
- [ ] No horizontal overflow at any breakpoint
- [ ] Icons positioned correctly
- [ ] Backdrop blur effects working

#### 6. Responsive Design Tests

**Tool:** Browser DevTools or automated responsive testing

**Breakpoints to Test:**
- 1920px (Large desktop)
- 1440px (Desktop)
- 1024px (Tablet landscape)
- 768px (Tablet portrait)
- 640px (Mobile landscape)
- 375px (Mobile portrait)

**Verification:**
- Search bar width behavior at each breakpoint
- Height changes: 56px → 52px → 50px
- Icon positioning adjustments
- Gap spacing maintains consistency

### Test Configuration

**Jest Configuration (Existing):**
```javascript
// jest.config.js
module.exports = {
  moduleNameMapper: {
    '\\.(css|scss)$': 'identity-obj-proxy',
    '@components/(.*)': '<rootDir>/src/components/$1',
  },
  testEnvironment: 'jsdom',
};
```

**No additional test infrastructure needed.**

### Testing Priority

1. **High Priority:** Manual QA and visual regression (core feature validation)
2. **Medium Priority:** Unit tests for component rendering and functionality
3. **Low Priority:** CSS module existence tests (low risk)

### Success Criteria

- All unit tests pass
- Visual regression tests show expected changes only to search bar width
- Manual QA confirms centering and max-width behavior
- No layout issues reported at standard breakpoints
- Search functionality unchanged

