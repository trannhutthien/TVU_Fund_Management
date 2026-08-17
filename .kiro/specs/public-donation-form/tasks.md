# Kế hoạch Triển khai: Trang Tạo Đơn Tài Trợ Công Khai

## Tổng quan

Tài liệu này mô tả các bước triển khai chi tiết cho tính năng Trang Tạo Đơn Tài Trợ Công Khai. Tính năng cho phép người dùng ẩn danh tạo khoản tài trợ cho hệ thống quỹ 3 cấp của trường Đại học Trà Vinh, hỗ trợ 4 kịch bản: tài trợ Quỹ Mẹ, Quỹ Thành phần, Chương trình có sẵn, và đề xuất Chương trình mới.

**Công nghệ sử dụng:**
- Frontend: React với custom hooks, React Hook Form, SCSS modules
- Backend: Node.js/Express, MySQL
- Security: Rate limiting, CSRF protection, file validation, input sanitization

## Danh sách Công việc

### 1. Thiết lập cấu trúc dự án và cơ sở dữ liệu

- [x] 1.1 Cập nhật database schema
  - Thêm cột `dexuat_id` vào bảng `khoantaitro`
  - Tạo foreign key constraint tới bảng `dexuatchuongtrinh`
  - Chạy migration script và verify schema changes
  - _Yêu cầu: 3.1, 8.2_

- [x] 1.2 Tạo cấu trúc thư mục frontend
  - Tạo `frontend/src/pages/PublicDonationPage/`
  - Tạo các thư mục con: `components/`, `hooks/`, `utils/`
  - Tạo các component folders: `DonorInfoSection/`, `DestinationSelector/`, `ProgramProposalForm/`, `DonationDetailsSection/`, `BankTransferInfo/`, `SuccessModal/`, `FileUpload/`
  - _Yêu cầu: 1.1, 2.1_

- [x] 1.3 Tạo cấu trúc thư mục backend
  - Tạo `backend/controllers/donations/proposalController.js`
  - Tạo `backend/models/donations/ProposalModel.js`
  - Tạo `backend/middleware/fileValidator.js`
  - Verify các file middleware hiện có: `rateLimiter.js`, `csrfProtection.js`, `inputSanitizer.js`
  - _Yêu cầu: 8.1, 8.2, 12.1, 13.1, 14.1, 15.1_

### 2. Triển khai Backend Models và Database Layer

- [x] 2.1 Tạo ProposalModel với transaction support
  - Implement method `createProposalWithDonation()` với transaction handling
  - Tạo record trong bảng `dexuatchuongtrinh`
  - Tạo record trong bảng `khoantaitro` với `dexuat_id` được liên kết
  - Xử lý rollback khi có lỗi
  - _Yêu cầu: 3.1-3.12, 8.2_

- [ ]* 2.2 Viết property test cho ProposalModel
  - **Property 1: Round-trip consistency cho proposal data**
  - **Validates: Yêu cầu 3.12**
  - Test: Tạo proposal → Query lại → So sánh dữ liệu
  - Verify: Tất cả trường dữ liệu phải khớp với input ban đầu

- [x] 2.3 Cập nhật DonationModel để hỗ trợ public donations
  - Verify method `createOrGetDonor()` tồn tại hoặc tạo mới
  - Implement logic tìm nhà tài trợ theo email hoặc tạo mới
  - Đảm bảo transaction-safe cho concurrent requests
  - _Yêu cầu: 1.1-1.8, 8.1_

- [ ]* 2.4 Viết property test cho donor information round-trip
  - **Property 2: Round-trip consistency cho donor information**
  - **Validates: Yêu cầu 1.8**
  - Test: Lưu donor info → Parse lại → So sánh
  - Verify: Không mất dữ liệu trong quá trình chuyển đổi

- [ ] 2.5 Cập nhật FundModel để hỗ trợ public API
  - Implement method `getPublicFunds(capDo, trangThai)`
  - Filter chỉ các quỹ có trạng thái "Đang hoạt động"
  - Organize hierarchical data cho Fund Level 2 và 3
  - _Yêu cầu: 16.1-16.9_

- [ ]* 2.6 Viết property test cho referential integrity
  - **Property 3: Referential integrity - Mọi fund capdo=3 phải có quy_cha_id hợp lệ**
  - **Validates: Yêu cầu 16.9**
  - Test: Fetch funds → Verify relationships
  - Verify: Mọi fund level 3 đều có parent fund level 2 tồn tại

### 3. Triển khai Backend Middleware và Security

- [ ] 3.1 Implement rate limiter middleware
  - Cấu hình 5 requests/10 phút mỗi IP
  - Implement key generator dựa trên IP address
  - Return HTTP 429 khi vượt limit
  - Implement cleanup cho expired entries
  - _Yêu cầu: 12.1-12.7_

- [ ]* 3.2 Viết property test cho rate limiter idempotence
  - **Property 4: Idempotence - Blocked requests không tăng counter**
  - **Validates: Yêu cầu 12.7**
  - Test: Gửi requests vượt limit → Verify counter không tăng

- [ ] 3.3 Implement file validator middleware
  - Validate MIME type và file extension
  - Check file signature (magic bytes) cho 512 bytes đầu
  - Reject các file executable
  - Sanitize filename và generate unique names
  - _Yêu cầu: 13.1-13.8_

- [ ]* 3.4 Viết property test cho file validation consistency
  - **Property 5: Consistency - MIME type phải khớp với extension**
  - **Validates: Yêu cầu 13.8**
  - Test: Validate files → Verify MIME/extension matching

- [ ] 3.5 Implement input sanitizer middleware
  - Escape HTML special characters (<, >, &, ", ')
  - Detect và reject script tags và javascript: protocol
  - Detect SQL injection patterns
  - Preserve Vietnamese UTF-8 characters
  - _Yêu cầu: 14.1-14.8_

- [ ]* 3.6 Viết property test cho sanitization idempotence
  - **Property 6: Idempotence - Sanitize nhiều lần = sanitize 1 lần**
  - **Validates: Yêu cầu 14.8**
  - Test: Sanitize(Sanitize(input)) === Sanitize(input)

- [ ] 3.7 Implement CSRF protection middleware
  - Setup csrf middleware với cookie configuration
  - Implement endpoint `GET /api/csrf-token`
  - Validate token trong request headers
  - Implement token rotation sau mỗi submission
  - _Yêu cầu: 15.1-15.8_

### 4. Triển khai Backend Controllers

- [ ] 4.1 Tạo proposalController với endpoint POST /api/donations/propose-program
  - Validate required fields (donor info, proposal info, donation info)
  - Call ProposalModel.createProposalWithDonation()
  - Xử lý errors và return appropriate status codes
  - Integrate với email service
  - _Yêu cầu: 8.2, 3.1-3.12_

- [ ]* 4.2 Viết integration test cho proposal creation
  - Test successful proposal creation với valid data
  - Test validation errors với invalid data
  - Test transaction rollback khi database error
  - _Yêu cầu: 8.2, 8.4_

- [ ] 4.3 Cập nhật donationController để hỗ trợ public endpoint
  - Verify hoặc tạo endpoint `POST /api/donations/public`
  - Implement logic cho 3 trường hợp: Quỹ Mẹ, Quỹ Thành phần, Chương trình
  - Return bank transfer information
  - _Yêu cầu: 8.1, 5.1-5.8_

- [ ]* 4.4 Viết property test cho model-based persistence
  - **Property 7: Model-based property - Query sau khi create phải trả về dữ liệu khớp**
  - **Validates: Yêu cầu 8.10**
  - Test: Create donation → Query by ID → Compare data

- [ ] 4.5 Tạo fundController với endpoint GET /api/funds/public
  - Implement filtering theo capDo và trangThai
  - Return hierarchical data structure
  - Implement caching với 5 phút TTL
  - _Yêu cầu: 16.1-16.8_

- [ ]* 4.6 Viết integration test cho fund API
  - Test fetching funds theo từng level
  - Test hierarchical organization
  - Test caching behavior
  - _Yêu cầu: 16.1-16.8_

- [ ] 4.7 Implement upload endpoint POST /api/upload
  - Accept multipart/form-data
  - Integrate với fileValidator middleware
  - Store files với unique names
  - Return file URL
  - _Yêu cầu: 7.1-7.8_

- [ ]* 4.8 Viết property test cho file upload round-trip
  - **Property 8: Round-trip consistency - Download file phải giống upload file**
  - **Validates: Yêu cầu 7.8**
  - Test: Upload → Get URL → Download → Compare content

### 5. Checkpoint - Backend hoàn chỉnh

- [ ] 5.1 Verify tất cả endpoints hoạt động
  - Test POST /api/donations/public với 3 scenarios
  - Test POST /api/donations/propose-program
  - Test GET /api/funds/public
  - Test POST /api/upload
  - Test GET /api/csrf-token
  - Đảm bảo tất cả tests pass, hỏi user nếu có vấn đề

### 6. Triển khai Frontend Utilities và Services

- [ ] 6.1 Tạo validation utilities
  - File: `validationRules.js`
  - Implement validators: email, phone, name, amount, program fields
  - Regex patterns cho email, phone validation
  - _Yêu cầu: 1.4-1.7, 3.3-3.7, 4.4, 4.8_

- [ ]* 6.2 Viết unit tests cho validation functions
  - Test email validation với valid/invalid cases
  - Test phone validation (10 digits, bắt đầu bằng 0)
  - Test amount validation (≥ 10000)
  - _Yêu cầu: 1.4-1.7, 4.4_

- [ ] 6.3 Tạo formatter utilities
  - File: `formatters.js`
  - Implement `formatCurrency()` với thousands separator
  - Implement `parseCurrency()` để convert về number
  - Implement `formatTransferContent()` theo format TAITRO-[MaQuy]-[Ten]
  - _Yêu cầu: 4.12, 5.3, 17.1-17.8_

- [ ]* 6.4 Viết property test cho currency round-trip
  - **Property 9: Round-trip với tolerance - Format → Parse trong vòng 1 VND**
  - **Validates: Yêu cầu 4.12, 17.8**
  - Test: parseCurrency(formatCurrency(amount)) ≈ amount

- [ ]* 6.5 Viết property test cho transfer content format
  - **Property 10: Invariant - Transfer content luôn có format đúng**
  - **Validates: Yêu cầu 5.8**
  - Test: Generate transfer content → Verify 2 hyphens và starts with "TAITRO"

- [ ] 6.6 Tạo API service layer
  - Files: `donationService.js`, `proposalService.js`, `fundService.js`, `uploadService.js`
  - Implement axios instances với CSRF token headers
  - Implement error handling wrapper
  - Set timeout 30 seconds
  - _Yêu cầu: 8.3, 8.5-8.9, 16.1-16.7_

- [ ]* 6.7 Viết integration tests cho API services
  - Test successful API calls
  - Test error handling cho network errors
  - Test error handling cho 4xx và 5xx responses
  - _Yêu cầu: 8.5-8.7_

### 7. Triển khai Frontend Custom Hooks

- [ ] 7.1 Tạo useDonationForm hook
  - Manage form state cho donor info, destination, proposal, donation details
  - Manage errors state
  - Manage UI state (isSubmitting, showBankInfo, showProposalForm)
  - Return state và updater functions
  - _Yêu cầu: 1.1-1.8, 2.1-2.8, 3.1-3.12, 4.1-4.12_

- [ ] 7.2 Tạo useFormValidation hook
  - Implement `validateForm()` function
  - Validate tất cả required fields dựa trên destination type
  - Return errors object
  - Scroll to first invalid field
  - _Yêu cầu: 6.1-6.8_

- [ ]* 7.3 Viết property test cho validation idempotence
  - **Property 11: Idempotence - Validate 2 lần phải cho kết quả giống nhau**
  - **Validates: Yêu cầu 6.8**
  - Test: validate(data) === validate(data)

- [ ] 7.3 Tạo useFileUpload hook
  - Implement file upload logic
  - Handle multiple files sequentially
  - Return uploaded file URLs
  - Handle upload errors
  - _Yêu cầu: 7.1-7.7_

- [ ] 7.4 Tạo useDestinationSelector hook
  - Fetch funds data từ API
  - Implement lazy loading cho Fund Level 2 và 3
  - Cache fetched data
  - Handle destination change và clear previous selections
  - _Yêu cầu: 2.1-2.8, 16.1-16.8, 18.1-18.7_

- [ ]* 7.5 Viết unit tests cho custom hooks
  - Test useDonationForm state management
  - Test useDestinationSelector lazy loading
  - Test useFileUpload error handling
  - _Yêu cầu: 2.6, 7.5, 18.6_

### 8. Triển khai Frontend Components - Core Form Sections

- [ ] 8.1 Implement DonorInfoSection component
  - Radio buttons cho donor type (Cá nhân/Tổ chức)
  - Input fields: họ tên, email, số điện thoại
  - Display validation errors
  - Integrate với form state
  - _Yêu cầu: 1.1-1.8_

- [ ]* 8.2 Viết unit tests cho DonorInfoSection
  - Test radio button selection
  - Test input validation display
  - Test error message rendering
  - _Yêu cầu: 1.3, 1.7_

- [ ] 8.3 Implement DestinationSelector component
  - 4 radio options với descriptions
  - Conditional dropdowns dựa trên selection
  - Integrate FundLevelRadio và ProgramSelector sub-components
  - Clear previous selections khi thay đổi destination
  - _Yêu cầu: 2.1-2.8_

- [ ] 8.4 Implement ProgramSelector sub-component
  - Hierarchical selector cho Fund Level 2 và 3
  - Display loading state
  - Handle fetch errors với retry button
  - _Yêu cầu: 2.4, 18.3, 18.6_

- [ ]* 8.5 Viết unit tests cho DestinationSelector
  - Test destination type changes
  - Test dropdown population
  - Test selection clearing behavior
  - _Yêu cầu: 2.3, 2.6_

- [ ] 8.6 Implement DonationDetailsSection component
  - Input field cho số tiền với number formatting
  - QuickAmountButtons (100K, 500K, 1M, 5M, 10M)
  - Radio buttons cho hình thức (Chuyển khoản/Tiền mặt)
  - Conditional mã giao dịch field
  - FileUpload component cho chứng từ
  - Textarea cho ghi chú
  - _Yêu cầu: 4.1-4.12_

- [ ] 8.7 Implement AmountInput sub-component với formatting
  - Format number với thousands separator
  - Remove formatting on focus
  - Reapply formatting on blur
  - Append "VND" suffix
  - _Yêu cầu: 17.1-17.7_

- [ ]* 8.8 Viết unit tests cho amount formatting
  - Test formatting behavior
  - Test focus/blur transitions
  - Test quick amount button clicks
  - _Yêu cầu: 17.2-17.5_

### 9. Triển khai Frontend Components - Program Proposal Form

- [ ] 9.1 Implement ProgramProposalForm container
  - Conditional rendering dựa trên destination type
  - Integrate 3 sub-sections: Basic Info, Financial Info, Requirements
  - File upload cho tài liệu đính kèm
  - _Yêu cầu: 3.1-3.12_

- [ ] 9.2 Implement ProposalBasicInfo sub-component
  - Input: tên chương trình, mô tả
  - Dropdown: loại hình (Trao tặng, Cho vay, Hỗ trợ một phần)
  - Date pickers: thời gian bắt đầu, kết thúc
  - Validation errors display
  - _Yêu cầu: 3.1-3.7_

- [ ] 9.3 Implement ProposalFinancialInfo sub-component
  - Input: số suất, tiền mỗi suất
  - Auto-calculate và display tổng tiền mục tiêu
  - Validation cho số suất (1-10000) và tiền mỗi suất (≥100K)
  - _Yêu cầu: 3.5-3.6_

- [ ] 9.4 Implement ProposalRequirements sub-component
  - Textarea: đối tượng thụ hưởng, yêu cầu học lực
  - Conditional textarea: điều kiện hoàn trả (required khi loại hình = "Cho vay")
  - _Yêu cầu: 3.1, 3.8-3.9_

- [ ]* 9.5 Viết unit tests cho ProgramProposalForm
  - Test conditional rendering
  - Test loại hình change behavior
  - Test date validation
  - _Yêu cầu: 3.5, 3.7-3.9_

### 10. Triển khai Frontend Components - Supporting Components

- [ ] 10.1 Implement FileUpload component
  - File input với drag-and-drop support
  - Display selected file name và size
  - Validate file type và size trước khi upload
  - Display upload progress
  - Handle upload errors
  - _Yêu cầu: 3.10-3.11, 4.9-4.10, 7.1-7.7, 13.1-13.4_

- [ ]* 10.2 Viết unit tests cho FileUpload
  - Test file type validation
  - Test file size validation
  - Test error message display
  - _Yêu cầu: 3.11, 4.10, 13.4_

- [ ] 10.3 Implement BankTransferInfo component
  - Fetch bank info từ API dựa trên selected fund
  - Display: tên ngân hàng, số tài khoản, chủ tài khoản, nội dung chuyển khoản
  - Generate transfer content theo format
  - Copy buttons với clipboard API
  - Show confirmation toast khi copy
  - Handle API errors
  - _Yêu cầu: 5.1-5.8_

- [ ]* 10.4 Viết integration test cho BankTransferInfo
  - Test API fetch thành công
  - Test transfer content generation
  - Test copy functionality
  - Test error handling
  - _Yêu cầu: 5.1, 5.6-5.7_

- [ ] 10.5 Implement SuccessModal component
  - Conditional message dựa trên donation type
  - Display donor email
  - "Đóng" button → redirect homepage
  - "Tạo khoản tài trợ mới" button → reset form
  - _Yêu cầu: 9.1-9.8_

- [ ]* 10.6 Viết unit tests cho SuccessModal
  - Test message rendering dựa trên donation type
  - Test button behaviors
  - Test modal close timing
  - _Yêu cầu: 9.1-9.2, 9.6-9.7_

### 11. Triển khai Frontend Main Container và Form Logic

- [ ] 11.1 Implement PublicDonationPage container
  - Integrate tất cả form sections
  - Setup form state management
  - Implement handleSubmit logic
  - Coordinate file uploads trước API call
  - Handle submission errors
  - Show/hide SuccessModal
  - _Yêu cầu: 1.1-20.10 (tất cả)_

- [ ] 11.2 Implement form reset functionality
  - "Làm mới" button
  - Confirmation dialog
  - Clear all fields
  - Remove uploaded files
  - Clear validation errors
  - Maintain funds cache
  - _Yêu cầu: 19.1-19.9_

- [ ]* 11.3 Viết property test cho form reset
  - **Property 12: Empty form property - Form sau reset phải fail validation**
  - **Validates: Yêu cầu 19.9**
  - Test: Reset form → Submit without data → Verify validation fails

- [ ] 11.4 Implement form submission flow
  - Validate form trước khi submit
  - Upload files nếu có
  - Call appropriate API (public donation hoặc propose program)
  - Handle loading states
  - Display errors hoặc success modal
  - _Yêu cầu: 6.1-6.8, 7.1-7.8, 8.1-8.10_

- [ ]* 11.5 Viết integration tests cho form submission
  - Test submission flow cho 4 scenarios
  - Test validation preventing submission
  - Test file upload integration
  - Test error handling
  - _Yêu cầu: 6.5-6.7, 8.4-8.7_

### 12. Checkpoint - Frontend hoàn chỉnh

- [ ] 12.1 Verify tất cả components render đúng
  - Test trên Chrome, Firefox, Safari
  - Test tất cả 4 scenarios: Quỹ Mẹ, Quỹ Thành phần, Chương trình, Đề xuất
  - Verify validation hoạt động
  - Verify file uploads hoạt động
  - Đảm bảo không có console errors, hỏi user nếu có vấn đề

### 13. Triển khai Responsive Design và Accessibility

- [ ] 13.1 Implement responsive layout
  - SCSS modules với breakpoints (768px)
  - Desktop: 2-column grid layout
  - Mobile: single-column stack layout
  - Minimum touch target 44x44px
  - _Yêu cầu: 11.1-11.4_

- [ ] 13.2 Test responsive behavior
  - Test viewport widths: 320px, 768px, 1024px, 1920px
  - Test orientation changes
  - Verify form state preserved during layout transitions
  - _Yêu cầu: 11.5-11.6_

- [ ]* 13.3 Viết property test cho responsive invariant
  - **Property 13: Invariant - Số lượng fields không thay đổi khi resize**
  - **Validates: Yêu cầu 11.8**
  - Test: Resize viewport → Count fields → Verify unchanged

- [ ] 13.4 Implement accessibility features
  - Add `<label>` elements với `for` attributes
  - Add ARIA attributes (aria-label, aria-describedby, aria-invalid, aria-required)
  - Implement visible focus indicators (2px outline)
  - Ensure logical tab order
  - _Yêu cầu: 20.1-20.4_

- [ ] 13.5 Implement accessibility - Dynamic content
  - ARIA live regions cho validation errors
  - Screen reader announcements cho dynamic changes
  - Alt text cho images
  - Color contrast ratio ≥ 4.5:1 (normal text), ≥ 3:1 (large text)
  - _Yêu cầu: 20.5-20.8_

- [ ]* 13.6 Viết manual accessibility tests
  - Test keyboard-only navigation
  - Test với screen reader (NVDA/JAWS/VoiceOver)
  - Verify focus indicators visible
  - Verify error announcements
  - _Yêu cầu: 20.9-20.10_

### 14. Triển khai Email Service

- [ ] 14.1 Implement email templates
  - HTML template cho donation confirmation email
  - HTML template cho proposal notification email
  - Include university branding
  - Include contact information và unsubscribe link
  - _Yêu cầu: 10.6_

- [ ] 14.2 Implement email service
  - Setup SMTP configuration
  - Implement `sendDonationConfirmation()` function
  - Implement `sendProposalNotification()` function
  - Include all required information (donor name, amount, fund/program, transaction code, date)
  - Log errors nếu email fails (không block donation creation)
  - _Yêu cầu: 10.1-10.5_

- [ ]* 14.3 Viết integration tests cho email service
  - Test email sending thành công
  - Test email content correctness
  - Test error handling không block donation creation
  - _Yêu cầu: 10.1, 10.5_

### 15. Triển khai Routes và Middleware Integration

- [ ] 15.1 Setup routes cho donations
  - Add route: `POST /api/donations/public`
  - Apply middleware: csrfProtection, inputSanitizer, donationRateLimiter
  - Link tới donationController.createPublicDonation
  - _Yêu cầu: 8.1, 12.1, 14.1, 15.3_

- [ ] 15.2 Setup routes cho proposals
  - Add route: `POST /api/donations/propose-program`
  - Apply middleware: csrfProtection, inputSanitizer, donationRateLimiter
  - Link tới proposalController.createProposal
  - _Yêu cầu: 8.2, 12.1, 14.1, 15.3_

- [ ] 15.3 Setup routes cho uploads
  - Add route: `POST /api/upload`
  - Apply middleware: fileValidator, multer for multipart
  - Link tới uploadController.uploadFile
  - _Yêu cầu: 7.1-7.7, 13.1-13.7_

- [ ] 15.4 Setup routes cho public funds
  - Add route: `GET /api/funds/public`
  - Apply middleware: none (public endpoint)
  - Link tới fundController.getPublicFunds
  - _Yêu cầu: 16.1-16.7_

- [ ] 15.5 Setup route cho CSRF token
  - Add route: `GET /api/csrf-token`
  - Apply middleware: csrfProtection
  - Return CSRF token
  - _Yêu cầu: 15.1_

- [ ]* 15.6 Viết integration tests cho routes
  - Test middleware application order
  - Test rate limiting trên routes
  - Test CSRF protection blocking invalid tokens
  - Test file validation rejection
  - _Yêu cầu: 12.1-12.2, 13.4, 15.4_

### 16. Triển khai Error Handling và Logging

- [ ] 16.1 Implement frontend error handler
  - Utility function `handleApiError()`
  - Map HTTP status codes to user-friendly messages
  - Handle network errors
  - Display errors trong UI
  - _Yêu cầu: 8.5-8.7_

- [ ] 16.2 Implement backend error handler middleware
  - Global error handler
  - Handle CSRF errors (403)
  - Handle validation errors (400)
  - Handle database errors (500)
  - Log errors với context
  - _Yêu cầu: 8.5-8.7_

- [ ] 16.3 Implement logging
  - Log mọi donation/proposal creation
  - Log rate limit violations
  - Log file upload errors
  - Log API errors với stack traces
  - _Yêu cầu: General monitoring_

- [ ]* 16.4 Viết tests cho error handling
  - Test error messages display correctly
  - Test error logging
  - Test error recovery flows
  - _Yêu cầu: 8.5-8.7_

### 17. Testing End-to-End Flows

- [ ]* 17.1 Viết E2E test cho Scenario 1: Tài trợ Quỹ Mẹ
  - User chọn "Quỹ Mẹ"
  - Nhập đầy đủ thông tin
  - Upload chứng từ
  - Submit successfully
  - Verify email sent
  - Verify database records created
  - _Yêu cầu: 1.1-1.8, 2.2, 4.1-4.12, 8.1_

- [ ]* 17.2 Viết E2E test cho Scenario 2: Tài trợ Quỹ Thành phần
  - User chọn "Quỹ Thành phần"
  - Select fund từ dropdown
  - Complete form
  - Verify bank info displays
  - Submit successfully
  - _Yêu cầu: 2.3-2.4, 5.1-5.8_

- [ ]* 17.3 Viết E2E test cho Scenario 3: Tài trợ Chương trình
  - User chọn "Chương trình có sẵn"
  - Select program từ hierarchical selector
  - Complete form
  - Submit successfully
  - _Yêu cầu: 2.4-2.5, 18.1-18.3_

- [ ]* 17.4 Viết E2E test cho Scenario 4: Đề xuất Chương trình mới
  - User chọn "Đề xuất Chương trình mới"
  - Fill program proposal form
  - Upload supporting documents
  - Complete donation info
  - Submit successfully
  - Verify proposal record created
  - Verify notification email sent
  - _Yêu cầu: 3.1-3.12, 7.1-7.8, 8.2_

- [ ]* 17.5 Viết E2E test cho error scenarios
  - Test validation errors display
  - Test rate limiting behavior
  - Test network error handling
  - Test file upload errors
  - _Yêu cầu: 6.5-6.6, 7.5, 12.3_

### 18. Performance Optimization

- [ ] 18.1 Implement frontend optimizations
  - Code splitting cho PublicDonationPage route
  - Lazy load ProgramProposalForm component
  - Memoize expensive validation computations
  - Debounce form validation (300ms)
  - _Yêu cầu: Performance_

- [ ] 18.2 Implement backend optimizations
  - Setup database connection pooling
  - Implement Redis cache cho funds list (5 min TTL)
  - Setup gzip compression
  - _Yêu cầu: 16.7, Performance_

- [ ] 18.3 Measure và verify performance
  - Initial page load < 3 seconds
  - API response time < 2 seconds
  - Form validation response < 200ms
  - File upload feedback < 100ms
  - _Yêu cầu: 1.7, 2.6, 5.1, 5.6_

### 19. Deployment Preparation

- [ ] 19.1 Setup environment variables
  - Create `.env.production` với tất cả required variables
  - Document environment variables trong README
  - _Yêu cầu: Deployment_

- [ ] 19.2 Create deployment scripts
  - Database migration script
  - Build scripts cho frontend và backend
  - Health check endpoint
  - _Yêu cầu: Deployment_

- [ ] 19.3 Setup monitoring và logging
  - Configure logging levels
  - Setup error tracking
  - Configure metrics collection (donations/day, success rate, avg response time)
  - _Yêu cầu: Monitoring_

### 20. Final Testing và Documentation

- [ ] 20.1 Conduct comprehensive testing
  - Run tất cả unit tests
  - Run tất cả integration tests
  - Run tất cả E2E tests
  - Run tất cả property-based tests
  - Manual testing trên multiple browsers/devices
  - Đảm bảo test coverage ≥ 80%

- [ ] 20.2 Create user documentation
  - Hướng dẫn sử dụng form cho nhà tài trợ (Vietnamese)
  - FAQ về quy trình tài trợ
  - Troubleshooting guide
  - _Yêu cầu: User documentation_

- [ ] 20.3 Create technical documentation
  - API documentation (Swagger/OpenAPI)
  - Database schema documentation
  - Deployment guide
  - Maintenance guide
  - _Yêu cầu: Technical documentation_

- [ ] 20.4 Final verification checkpoint
  - Verify tất cả requirements được implement
  - Verify tất cả tests pass
  - Verify tất cả security measures hoạt động
  - Verify tất cả accessibility features hoạt động
  - Hỏi user nếu cần clarification hoặc có vấn đề

## Ghi chú

- **Tasks đánh dấu `*`** là optional và có thể skip để triển khai MVP nhanh hơn
- **Property-based tests** validate correctness properties định nghĩa trong design document
- **Integration tests** validate tương tác giữa các components/services
- **E2E tests** validate toàn bộ user flows từ đầu đến cuối
- Mỗi checkpoint task đảm bảo incremental validation và user feedback
- Tất cả tasks reference đến requirements cụ thể để traceability
