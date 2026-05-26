# Dropdown Component

Component dropdown tái sử dụng với nhiều tính năng linh hoạt.

## Tính năng

- ✅ Single select và Multi select
- ✅ Tìm kiếm (searchable)
- ✅ Xóa lựa chọn (clearable)
- ✅ 3 kích thước: small, medium, large
- ✅ Custom render cho options và selected value
- ✅ Hỗ trợ icon, description cho mỗi option
- ✅ Validation và error message
- ✅ Keyboard navigation (ESC để đóng)
- ✅ Click outside để đóng
- ✅ Disabled state
- ✅ Responsive và accessible

## Cách sử dụng

### 1. Basic Dropdown

```jsx
import Dropdown from '@components/common/Dropdown';

const options = [
  { value: '1', label: 'Tùy chọn 1' },
  { value: '2', label: 'Tùy chọn 2' },
  { value: '3', label: 'Tùy chọn 3' },
];

function MyComponent() {
  const [value, setValue] = useState('1');

  return (
    <Dropdown
      options={options}
      value={value}
      onChange={setValue}
      placeholder="Chọn một tùy chọn"
    />
  );
}
```

### 2. Dropdown với Label và Required

```jsx
<Dropdown
  label="Chọn vai trò"
  required
  options={roleOptions}
  value={role}
  onChange={setRole}
  placeholder="Chọn vai trò..."
/>
```

### 3. Searchable Dropdown

```jsx
<Dropdown
  options={longOptionsList}
  searchable
  placeholder="Tìm kiếm..."
  value={value}
  onChange={setValue}
/>
```

### 4. Multi Select Dropdown

```jsx
const [selectedValues, setSelectedValues] = useState(['1', '2']);

<Dropdown
  options={options}
  multiple
  value={selectedValues}
  onChange={setSelectedValues}
  placeholder="Chọn nhiều tùy chọn"
/>
```

### 5. Dropdown với Icon

```jsx
const options = [
  { 
    value: 'user', 
    label: 'Người dùng',
    icon: <UserIcon />
  },
  { 
    value: 'admin', 
    label: 'Quản trị viên',
    icon: <AdminIcon />
  },
];

<Dropdown
  options={options}
  value={value}
  onChange={setValue}
/>
```

### 6. Dropdown với Description

```jsx
const options = [
  { 
    value: 'basic', 
    label: 'Gói cơ bản',
    description: 'Miễn phí'
  },
  { 
    value: 'pro', 
    label: 'Gói Pro',
    description: '99.000đ/tháng'
  },
];

<Dropdown
  options={options}
  value={value}
  onChange={setValue}
/>
```

### 7. Clearable Dropdown

```jsx
<Dropdown
  options={options}
  value={value}
  onChange={setValue}
  clearable
  placeholder="Chọn hoặc xóa"
/>
```

### 8. Dropdown với Validation

```jsx
const [value, setValue] = useState(null);
const [error, setError] = useState(false);

const handleSubmit = () => {
  if (!value) {
    setError(true);
  }
};

<Dropdown
  label="Chọn quỹ"
  required
  options={fundOptions}
  value={value}
  onChange={(val) => {
    setValue(val);
    setError(false);
  }}
  error={error}
  errorMessage="Vui lòng chọn một quỹ"
/>
```

### 9. Size Variants

```jsx
// Small
<Dropdown
  size="small"
  options={options}
  value={value}
  onChange={setValue}
/>

// Medium (default)
<Dropdown
  size="medium"
  options={options}
  value={value}
  onChange={setValue}
/>

// Large
<Dropdown
  size="large"
  options={options}
  value={value}
  onChange={setValue}
/>
```

### 10. Custom Render Option

```jsx
<Dropdown
  options={userOptions}
  value={value}
  onChange={setValue}
  renderOption={(option, isSelected) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <img 
        src={option.avatar} 
        alt={option.label}
        style={{ width: 32, height: 32, borderRadius: '50%' }}
      />
      <div>
        <div style={{ fontWeight: isSelected ? 600 : 400 }}>
          {option.label}
        </div>
        <div style={{ fontSize: '12px', color: '#64748B' }}>
          {option.email}
        </div>
      </div>
    </div>
  )}
/>
```

### 11. Custom Render Selected Value

```jsx
<Dropdown
  options={options}
  value={value}
  onChange={setValue}
  renderValue={(selected) => {
    if (!selected) return 'Chọn...';
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ 
          width: 8, 
          height: 8, 
          borderRadius: '50%', 
          background: selected.color 
        }} />
        {selected.label}
      </div>
    );
  }}
/>
```

### 12. Disabled State

```jsx
<Dropdown
  options={options}
  value={value}
  onChange={setValue}
  disabled
/>
```

### 13. Disabled Options

```jsx
const options = [
  { value: '1', label: 'Tùy chọn 1' },
  { value: '2', label: 'Tùy chọn 2', disabled: true },
  { value: '3', label: 'Tùy chọn 3' },
];

<Dropdown
  options={options}
  value={value}
  onChange={setValue}
/>
```

### 14. Custom Max Height

```jsx
<Dropdown
  options={longOptionsList}
  value={value}
  onChange={setValue}
  maxHeight="200px"
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `options` | `Array<Option>` | `[]` | **Required.** Danh sách các tùy chọn |
| `value` | `string \| number \| Array` | `null` | Giá trị được chọn (array nếu multiple) |
| `onChange` | `function` | - | Callback khi giá trị thay đổi |
| `placeholder` | `string` | `'Chọn...'` | Placeholder text |
| `disabled` | `boolean` | `false` | Vô hiệu hóa dropdown |
| `searchable` | `boolean` | `false` | Cho phép tìm kiếm |
| `multiple` | `boolean` | `false` | Cho phép chọn nhiều |
| `clearable` | `boolean` | `false` | Hiển thị nút xóa |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Kích thước dropdown |
| `className` | `string` | `''` | Custom CSS class |
| `error` | `boolean` | `false` | Hiển thị trạng thái lỗi |
| `errorMessage` | `string` | `''` | Thông báo lỗi |
| `label` | `string` | `''` | Label cho dropdown |
| `required` | `boolean` | `false` | Hiển thị dấu * bắt buộc |
| `maxHeight` | `string` | `'300px'` | Chiều cao tối đa của menu |
| `renderOption` | `function` | `null` | Custom render cho option |
| `renderValue` | `function` | `null` | Custom render cho selected value |

### Option Object

```typescript
{
  value: string | number;      // Required - Giá trị duy nhất
  label: string;               // Required - Nhãn hiển thị
  icon?: ReactNode;            // Optional - Icon
  description?: string;        // Optional - Mô tả phụ
  disabled?: boolean;          // Optional - Vô hiệu hóa option
}
```

## Ví dụ thực tế

### Chọn vai trò người dùng

```jsx
const roleOptions = [
  { value: '1', label: 'Sinh viên' },
  { value: '2', label: 'Giáo vụ' },
  { value: '3', label: 'Kế toán' },
  { value: '4', label: 'Nhà tài trợ' },
  { value: '5', label: 'Admin' },
];

<Dropdown
  label="Vai trò"
  required
  options={roleOptions}
  value={role}
  onChange={setRole}
  placeholder="Chọn vai trò..."
/>
```

### Chọn quỹ học bổng

```jsx
const fundOptions = [
  { 
    value: '1', 
    label: 'Quỹ học bổng TVU',
    description: 'Còn 50 triệu'
  },
  { 
    value: '2', 
    label: 'Quỹ hỗ trợ sinh viên',
    description: 'Còn 30 triệu'
  },
];

<Dropdown
  label="Chọn quỹ"
  searchable
  options={fundOptions}
  value={fund}
  onChange={setFund}
/>
```

### Chọn nhiều sinh viên

```jsx
<Dropdown
  label="Chọn sinh viên"
  multiple
  searchable
  options={studentOptions}
  value={selectedStudents}
  onChange={setSelectedStudents}
  placeholder="Tìm và chọn sinh viên..."
/>
```

## Styling

Component sử dụng CSS Modules và design tokens từ `_variables.scss`. Bạn có thể override styles bằng cách:

```jsx
<Dropdown
  className="my-custom-dropdown"
  options={options}
  value={value}
  onChange={setValue}
/>
```

```scss
.my-custom-dropdown {
  :global(.dropdown) {
    // Custom styles
  }
}
```

## Accessibility

- ✅ Keyboard navigation (Tab, Enter, ESC)
- ✅ ARIA attributes (role, aria-expanded, aria-selected)
- ✅ Focus management
- ✅ Screen reader friendly

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
