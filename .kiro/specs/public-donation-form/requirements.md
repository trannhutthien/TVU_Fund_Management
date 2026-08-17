# Requirements Document - Trang Tạo Đơn Tài Trợ Công Khai

## Introduction

Trang Tạo Đơn Tài Trợ Công Khai là một form web cho phép người dùng không cần đăng nhập có thể tạo khoản tài trợ cho hệ thống quỹ 3 cấp của trường Đại học Trà Vinh. Hệ thống hỗ trợ 4 trường hợp tài trợ: tài trợ vào Quỹ Mẹ, tài trợ vào Quỹ Thành phần, tài trợ vào Chương trình có sẵn, và đề xuất Chương trình mới.

## Glossary

- **Public_Donation_Form**: Form web công khai cho phép tạo khoản tài trợ không cần xác thực
- **Donor_Information_Section**: Phần form thu thập thông tin người tài trợ
- **Destination_Selection_Section**: Phần form cho phép chọn đích đến của khoản tài trợ
- **Program_Proposal_Section**: Phần form để đề xuất chương trình tài trợ mới
- **Donation_Details_Section**: Phần form nhập thông tin chi tiết khoản tài trợ
- **Bank_Transfer_Display**: Khu vực hiển thị thông tin tài khoản ngân hàng để chuyển khoản
- **Validation_Engine**: Bộ phận kiểm tra tính hợp lệ của dữ liệu nhập vào
- **File_Upload_Handler**: Bộ phận xử lý upload file chứng từ và tài liệu
- **API_Client**: Bộ phận gọi API backend
- **Success_Modal**: Cửa sổ hiển thị thông báo thành công
- **Email_Service**: Dịch vụ gửi email xác nhận
- **Rate_Limiter**: Bộ phận giới hạn số lượng request
- **Security_Module**: Bộ phận xử lý bảo mật (CSRF, sanitization)
- **Fund_Level_1**: Quỹ Mẹ (capdo = 1) - Quỹ Phát triển ĐH Trà Vinh
- **Fund_Level_2**: Quỹ Thành phần (capdo = 2) - Học bổng, Y tế, Từ thiện, Khẩn cấp
- **Fund_Level_3**: Chương trình cụ thể (capdo = 3)
- **Donor_Type**: Loại nhà tài trợ (Cá nhân hoặc Tổ chức)
- **Donation_Method**: Hình thức tài trợ (Chuyển khoản hoặc Tiền mặt)
- **Program_Type**: Loại hình chương trình (Trao tặng, Cho vay, Hỗ trợ một phần)
- **Transfer_Content**: Nội dung chuyển khoản theo format TAITRO-[MaQuy]-[Ten]
- **Quick_Amount_Button**: Nút chọn nhanh số tiền (100K, 500K, 1M, etc.)
- **Responsive_Layout**: Bố cục tự động điều chỉnh (Desktop: 2 cột, Mobile: 1 cột)

## Requirements

### Requirement 1: Thu thập thông tin Nhà tài trợ

**User Story:** As a nhà tài trợ, I want to nhập thông tin cá nhân của tôi vào form, so that hệ thống có thể lưu trữ và liên hệ với tôi về khoản tài trợ.

#### Acceptance Criteria

1. THE Donor_Information_Section SHALL display radio buttons for Donor_Type selection with exactly two options: "Cá nhân" and "Tổ chức"
2. THE Donor_Information_Section SHALL display input fields for họ tên, email, and số điện thoại
3. WHEN a user selects Donor_Type, THE Donor_Information_Section SHALL maintain the selection state
4. WHEN a user inputs họ tên, THE Validation_Engine SHALL verify the input is not empty and contains between 2 and 100 characters
5. WHEN a user inputs email, THE Validation_Engine SHALL verify the input matches the pattern `^[^\s@]+@[^\s@]+\.[^\s@]+$`
6. WHEN a user inputs số điện thoại, THE Validation_Engine SHALL verify the input contains exactly 10 digits and starts with 0
7. WHEN validation fails for any field, THE Donor_Information_Section SHALL display an error message below the invalid field within 100 milliseconds
8. FOR ALL valid donor information inputs, submitting and then parsing the stored data SHALL produce equivalent donor information (round-trip property)

### Requirement 2: Chọn đích đến tài trợ

**User Story:** As a nhà tài trợ, I want to chọn nơi mà khoản tài trợ của tôi sẽ được sử dụng, so that tôi có thể kiểm soát mục đích sử dụng tiền.

#### Acceptance Criteria

1. THE Destination_Selection_Section SHALL display four destination options: "Quỹ Mẹ", "Quỹ Thành phần", "Chương trình có sẵn", and "Đề xuất Chương trình mới"
2. WHEN a user selects "Quỹ Mẹ", THE Destination_Selection_Section SHALL store Fund_Level_1 identifier
3. WHEN a user selects "Quỹ Thành phần", THE Destination_Selection_Section SHALL display a dropdown containing all Fund_Level_2 options fetched from the backend
4. WHEN a user selects "Chương trình có sẵn", THE Destination_Selection_Section SHALL display a hierarchical selector showing Fund_Level_2 and their associated Fund_Level_3 programs
5. WHEN a user selects "Đề xuất Chương trình mới", THE Destination_Selection_Section SHALL display Program_Proposal_Section
6. WHEN a user changes destination selection, THE Destination_Selection_Section SHALL clear any previously selected fund or program within 100 milliseconds
7. THE Destination_Selection_Section SHALL require exactly one destination to be selected before form submission
8. FOR ALL destination selections, the selected fund identifier SHALL match an existing fund in the database (invariant property)

### Requirement 3: Form đề xuất Chương trình mới

**User Story:** As a nhà tài trợ, I want to đề xuất một chương trình tài trợ mới với thông tin chi tiết, so that tôi có thể tạo chương trình phù hợp với mục tiêu tài trợ của tôi.

#### Acceptance Criteria

1. WHEN "Đề xuất Chương trình mới" is selected, THE Program_Proposal_Section SHALL display input fields for tên chương trình, mô tả, loại hình, thời gian bắt đầu, thời gian kết thúc, số suất, tiền mỗi suất, đối tượng thụ hưởng, điều kiện nhận, and điều kiện hoàn trả
2. THE Program_Proposal_Section SHALL display Program_Type dropdown with exactly three options: "Trao tặng", "Cho vay", and "Hỗ trợ một phần"
3. WHEN a user inputs tên chương trình, THE Validation_Engine SHALL verify the input is not empty and contains between 5 and 200 characters
4. WHEN a user inputs mô tả, THE Validation_Engine SHALL verify the input is not empty and contains between 10 and 2000 characters
5. WHEN a user inputs số suất, THE Validation_Engine SHALL verify the input is a positive integer between 1 and 10000
6. WHEN a user inputs tiền mỗi suất, THE Validation_Engine SHALL verify the input is a positive number greater than or equal to 100000
7. WHEN a user selects thời gian bắt đầu and thời gian kết thúc, THE Validation_Engine SHALL verify thời gian bắt đầu is before thời gian kết thúc
8. WHEN Program_Type is "Cho vay", THE Program_Proposal_Section SHALL make điều kiện hoàn trả field required
9. WHEN Program_Type is not "Cho vay", THE Program_Proposal_Section SHALL make điều kiện hoàn trả field optional
10. THE Program_Proposal_Section SHALL provide file upload capability for supporting documents with maximum size 10MB per file
11. WHEN a user uploads a file, THE File_Upload_Handler SHALL verify the file extension is one of: pdf, doc, docx, jpg, jpeg, png
12. FOR ALL valid program proposals, converting proposal data to JSON and parsing back SHALL produce equivalent proposal data (round-trip property)

### Requirement 4: Nhập thông tin chi tiết khoản tài trợ

**User Story:** As a nhà tài trợ, I want to nhập số tiền và thông tin giao dịch, so that hệ thống có thể xử lý khoản tài trợ của tôi chính xác.

#### Acceptance Criteria

1. THE Donation_Details_Section SHALL display an input field for số tiền with type number
2. THE Donation_Details_Section SHALL display Quick_Amount_Button options with values: 100000, 500000, 1000000, 5000000, 10000000
3. WHEN a user clicks any Quick_Amount_Button, THE Donation_Details_Section SHALL populate the số tiền field with the button value within 100 milliseconds
4. WHEN a user inputs số tiền, THE Validation_Engine SHALL verify the input is a positive number greater than or equal to 10000
5. THE Donation_Details_Section SHALL display radio buttons for Donation_Method selection with exactly two options: "Chuyển khoản" and "Tiền mặt"
6. WHEN Donation_Method is "Chuyển khoản", THE Donation_Details_Section SHALL make mã giao dịch field required
7. WHEN Donation_Method is "Tiền mặt", THE Donation_Details_Section SHALL make mã giao dịch field optional
8. WHEN a user inputs mã giao dịch, THE Validation_Engine SHALL verify the input contains between 6 and 50 alphanumeric characters
9. THE Donation_Details_Section SHALL provide file upload capability for chứng từ with maximum size 5MB
10. WHEN a user uploads chứng từ, THE File_Upload_Handler SHALL verify the file extension is one of: pdf, jpg, jpeg, png
11. THE Donation_Details_Section SHALL display an optional textarea for ghi chú with maximum length 500 characters
12. FOR ALL donation amounts, formatting the amount to currency string and parsing back SHALL produce the original numeric value within 0.01 VND tolerance (round-trip property)

### Requirement 5: Hiển thị thông tin chuyển khoản

**User Story:** As a nhà tài trợ, I want to xem thông tin tài khoản ngân hàng, so that tôi có thể chuyển khoản chính xác.

#### Acceptance Criteria

1. WHEN a user selects any destination (Quỹ Mẹ, Quỹ Thành phần, or Chương trình), THE Bank_Transfer_Display SHALL fetch bank account information from the backend API within 2 seconds
2. THE Bank_Transfer_Display SHALL display tên ngân hàng, số tài khoản, tên chủ tài khoản, and Transfer_Content
3. THE Bank_Transfer_Display SHALL generate Transfer_Content following the format "TAITRO-[MaQuy]-[Ten]" where MaQuy is the selected fund code and Ten is the first 20 characters of donor name
4. THE Bank_Transfer_Display SHALL provide a copy button for số tài khoản
5. THE Bank_Transfer_Display SHALL provide a copy button for Transfer_Content
6. WHEN a user clicks a copy button, THE Bank_Transfer_Display SHALL copy the associated text to clipboard and display a confirmation message within 200 milliseconds
7. IF backend API fails to return bank account information, THEN THE Bank_Transfer_Display SHALL display an error message and disable form submission
8. FOR ALL generated Transfer_Content strings, the string SHALL contain exactly two hyphens and start with "TAITRO" (invariant property)

### Requirement 6: Validate toàn bộ form trước khi submit

**User Story:** As a hệ thống, I want to kiểm tra tất cả dữ liệu nhập vào trước khi gửi lên server, so that tôi có thể ngăn chặn dữ liệu không hợp lệ và giảm tải cho backend.

#### Acceptance Criteria

1. WHEN a user attempts to submit the form, THE Validation_Engine SHALL verify all required fields in Donor_Information_Section are valid
2. WHEN a user attempts to submit the form, THE Validation_Engine SHALL verify exactly one destination is selected
3. WHEN "Đề xuất Chương trình mới" is selected, THE Validation_Engine SHALL verify all required fields in Program_Proposal_Section are valid
4. WHEN a user attempts to submit the form, THE Validation_Engine SHALL verify all fields in Donation_Details_Section are valid
5. IF any validation fails, THEN THE Validation_Engine SHALL prevent form submission and display all error messages within 200 milliseconds
6. IF any validation fails, THEN THE Validation_Engine SHALL scroll to the first invalid field within 300 milliseconds
7. WHEN all validations pass, THE Validation_Engine SHALL enable form submission
8. FOR ALL form inputs, validating the data twice SHALL produce identical validation results (idempotence property)

### Requirement 7: Upload file trước khi submit form

**User Story:** As a hệ thống, I want to upload các file chứng từ và tài liệu trước khi tạo khoản tài trợ, so that tôi có thể lưu trữ URL file và tham chiếu trong database.

#### Acceptance Criteria

1. WHEN form validation passes and user confirms submission, THE File_Upload_Handler SHALL upload chứng từ file (if provided) to the backend before submitting form data
2. WHEN Program_Proposal_Section contains uploaded documents, THE File_Upload_Handler SHALL upload all document files to the backend before submitting form data
3. WHEN a file upload is in progress, THE Public_Donation_Form SHALL display a loading indicator and disable all form controls
4. WHEN a file upload succeeds, THE File_Upload_Handler SHALL store the returned file URL
5. IF any file upload fails, THEN THE File_Upload_Handler SHALL display an error message, cancel the submission process, and re-enable form controls
6. WHEN all file uploads complete successfully, THE File_Upload_Handler SHALL proceed to form submission with file URLs included in the request payload
7. THE File_Upload_Handler SHALL enforce a maximum total upload size of 15MB across all files
8. FOR ALL uploaded files, downloading the file from the returned URL SHALL produce a file with identical content to the original upload (round-trip property)

### Requirement 8: Gọi API tạo donation hoặc proposal

**User Story:** As a hệ thống, I want to gửi dữ liệu form đến backend API, so that khoản tài trợ hoặc đề xuất chương trình được lưu vào database.

#### Acceptance Criteria

1. WHEN destination is Quỹ Mẹ, Quỹ Thành phần, or Chương trình có sẵn, THE API_Client SHALL call `POST /api/donations/public` with donor information, selected fund ID, donation amount, payment method, transaction code, proof document URL, and notes
2. WHEN destination is "Đề xuất Chương trình mới", THE API_Client SHALL call `POST /api/donations/propose-program` with donor information, program proposal details, donation amount, payment method, transaction code, proof document URL, and supporting document URLs
3. WHEN API call is in progress, THE Public_Donation_Form SHALL display a loading indicator and disable all form controls
4. WHEN API call succeeds with status 200 or 201, THE API_Client SHALL trigger Success_Modal display
5. IF API call fails with network error, THEN THE API_Client SHALL display error message "Không thể kết nối đến server. Vui lòng thử lại sau" and re-enable form controls
6. IF API call fails with status 4xx, THEN THE API_Client SHALL display the error message returned from backend and re-enable form controls
7. IF API call fails with status 5xx, THEN THE API_Client SHALL display error message "Lỗi server. Vui lòng thử lại sau" and re-enable form controls
8. THE API_Client SHALL include CSRF token in all API requests
9. THE API_Client SHALL set request timeout to 30 seconds
10. FOR ALL successful API calls creating donations, querying the donation by returned ID SHALL retrieve a donation with matching donor information and amount (model-based property)

### Requirement 9: Hiển thị thông báo thành công

**User Story:** As a nhà tài trợ, I want to nhận được xác nhận rằng khoản tài trợ của tôi đã được ghi nhận, so that tôi biết quá trình hoàn tất thành công.

#### Acceptance Criteria

1. WHEN API call succeeds for regular donation, THE Success_Modal SHALL display a message "Cảm ơn bạn đã tài trợ! Khoản tài trợ của bạn đã được ghi nhận và đang chờ xác nhận từ quản trị viên."
2. WHEN API call succeeds for program proposal, THE Success_Modal SHALL display a message "Cảm ơn bạn đã đề xuất chương trình! Đề xuất của bạn đang chờ phê duyệt từ quản trị viên. Chúng tôi sẽ liên hệ với bạn qua email sau khi có kết quả."
3. THE Success_Modal SHALL display the donor's email address
4. THE Success_Modal SHALL display a "Đóng" button
5. THE Success_Modal SHALL display a "Tạo khoản tài trợ mới" button
6. WHEN a user clicks "Đóng" button, THE Success_Modal SHALL close and redirect to the homepage within 500 milliseconds
7. WHEN a user clicks "Tạo khoản tài trợ mới" button, THE Success_Modal SHALL close and reset the form to initial state within 500 milliseconds
8. THE Success_Modal SHALL automatically trigger email notification sending

### Requirement 10: Gửi email xác nhận

**User Story:** As a nhà tài trợ, I want to nhận email xác nhận về khoản tài trợ, so that tôi có thể lưu giữ thông tin và theo dõi.

#### Acceptance Criteria

1. WHEN a donation is created successfully, THE Email_Service SHALL send a confirmation email to the donor's email address within 5 seconds
2. THE Email_Service SHALL include in the email: donor name, donation amount, selected fund or program name, transaction code (if provided), donation date, and tracking information
3. WHEN a program proposal is created successfully, THE Email_Service SHALL send a confirmation email to the donor's email address within 5 seconds
4. THE Email_Service SHALL include in the program proposal email: donor name, proposed program name, donation amount, proposal status "Đang chờ phê duyệt", and expected review timeline
5. IF email sending fails, THEN THE Email_Service SHALL log the error but not prevent the donation creation from succeeding
6. THE Email_Service SHALL format the email using HTML template with university branding
7. THE Email_Service SHALL include a footer with contact information and unsubscribe link

### Requirement 11: Responsive design cho Desktop và Mobile

**User Story:** As a nhà tài trợ, I want to sử dụng form trên bất kỳ thiết bị nào, so that tôi có thể tài trợ một cách thuận tiện.

#### Acceptance Criteria

1. WHEN viewport width is greater than or equal to 768 pixels, THE Responsive_Layout SHALL display form sections in a 2-column grid layout
2. WHEN viewport width is less than 768 pixels, THE Responsive_Layout SHALL display form sections in a single-column stack layout
3. THE Responsive_Layout SHALL ensure all interactive elements (buttons, inputs, dropdowns) have a minimum touch target size of 44x44 pixels on mobile devices
4. THE Responsive_Layout SHALL ensure text remains readable without horizontal scrolling on viewport widths from 320 pixels to 2560 pixels
5. WHEN screen orientation changes, THE Responsive_Layout SHALL re-render the layout within 300 milliseconds
6. THE Responsive_Layout SHALL maintain form input state during layout transitions
7. THE Responsive_Layout SHALL ensure Bank_Transfer_Display remains visible without horizontal scrolling on all supported viewport widths
8. FOR ALL viewport width changes, the total number of form fields and their values SHALL remain unchanged (invariant property)

### Requirement 12: Rate limiting để ngăn chặn spam

**User Story:** As a hệ thống, I want to giới hạn số lượng request từ mỗi IP address, so that tôi có thể ngăn chặn spam và tấn công từ chối dịch vụ.

#### Acceptance Criteria

1. THE Rate_Limiter SHALL allow maximum 5 form submissions per IP address per 10-minute window
2. WHEN an IP address exceeds the rate limit, THE Rate_Limiter SHALL block subsequent requests and return HTTP status 429
3. WHEN rate limit is exceeded, THE Public_Donation_Form SHALL display error message "Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau 10 phút"
4. THE Rate_Limiter SHALL reset the request count for each IP address after the 10-minute window expires
5. THE Rate_Limiter SHALL store rate limit data in memory with automatic cleanup of expired entries
6. THE Rate_Limiter SHALL exclude requests from whitelisted IP addresses (administrative IPs) from rate limiting
7. FOR ALL blocked requests within the rate limit window, the request count SHALL not increment (idempotence property)

### Requirement 13: File validation để đảm bảo an toàn

**User Story:** As a hệ thống, I want to kiểm tra các file được upload, so that tôi có thể ngăn chặn file độc hại và đảm bảo an toàn hệ thống.

#### Acceptance Criteria

1. WHEN a user uploads a file, THE File_Upload_Handler SHALL verify the file MIME type matches one of the allowed types: application/pdf, image/jpeg, image/png, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document
2. WHEN a user uploads a file, THE File_Upload_Handler SHALL verify the file extension matches the declared MIME type
3. WHEN a user uploads a file, THE File_Upload_Handler SHALL scan the first 512 bytes to verify file signature matches the declared type
4. IF file validation fails for any reason, THEN THE File_Upload_Handler SHALL reject the upload, display error message "File không hợp lệ hoặc không được hỗ trợ", and allow the user to select a different file
5. THE File_Upload_Handler SHALL reject files with executable extensions (.exe, .bat, .sh, .cmd, .com, .scr, .vbs, .js, .jar)
6. THE File_Upload_Handler SHALL sanitize uploaded filenames by removing special characters and limiting length to 100 characters
7. THE File_Upload_Handler SHALL store uploaded files with generated unique names to prevent filename collision and directory traversal attacks
8. FOR ALL successfully validated files, the MIME type SHALL match the file extension (consistency property)

### Requirement 14: Input sanitization để ngăn chặn XSS

**User Story:** As a hệ thống, I want to làm sạch dữ liệu nhập vào từ người dùng, so that tôi có thể ngăn chặn tấn công XSS và injection.

#### Acceptance Criteria

1. WHEN a user inputs text into any form field, THE Security_Module SHALL sanitize the input by escaping HTML special characters: <, >, &, ", '
2. WHEN form data is submitted, THE Security_Module SHALL validate that no field contains script tags or javascript: protocol
3. WHEN form data is submitted, THE Security_Module SHALL validate that no field contains SQL keywords in suspicious patterns (e.g., "'; DROP TABLE")
4. IF suspicious content is detected in any field, THEN THE Security_Module SHALL reject the submission and display error message "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin"
5. THE Security_Module SHALL apply sanitization to all text inputs: họ tên, email, số điện thoại, tên chương trình, mô tả, ghi chú, mã giao dịch, đối tượng, điều kiện nhận, điều kiện hoàn trả
6. THE Security_Module SHALL preserve Vietnamese characters (UTF-8) during sanitization
7. WHEN displaying user-submitted content back to users, THE Public_Donation_Form SHALL apply output encoding to prevent stored XSS
8. FOR ALL sanitized inputs, applying sanitization multiple times SHALL produce the same result as applying it once (idempotence property)

### Requirement 15: CSRF protection cho form submission

**User Story:** As a hệ thống, I want to bảo vệ form khỏi tấn công CSRF, so that chỉ các request hợp lệ từ form thực sự mới được xử lý.

#### Acceptance Criteria

1. WHEN the Public_Donation_Form loads, THE Security_Module SHALL fetch a CSRF token from the backend
2. THE Security_Module SHALL store the CSRF token in memory (not in localStorage or cookies)
3. WHEN form is submitted, THE Security_Module SHALL include the CSRF token in the request header "X-CSRF-Token"
4. WHEN backend receives a form submission, THE Security_Module SHALL verify the CSRF token matches the token issued for the current session
5. IF CSRF token is missing or invalid, THEN THE Security_Module SHALL reject the request with HTTP status 403 and message "Invalid CSRF token"
6. THE Security_Module SHALL rotate CSRF tokens after each successful form submission
7. THE Security_Module SHALL expire CSRF tokens after 1 hour of inactivity
8. WHEN CSRF token expires or becomes invalid, THE Public_Donation_Form SHALL automatically fetch a new token and allow the user to resubmit

### Requirement 16: Fetch danh sách quỹ công khai

**User Story:** As a hệ thống, I want to lấy danh sách các quỹ công khai từ backend, so that người dùng có thể chọn đích đến tài trợ.

#### Acceptance Criteria

1. WHEN the Public_Donation_Form loads, THE API_Client SHALL call `GET /api/funds/public` to fetch the list of active funds
2. THE API_Client SHALL filter the returned funds to separate Fund_Level_1, Fund_Level_2, and Fund_Level_3 based on capdo value
3. THE API_Client SHALL store Fund_Level_1 data (capdo = 1) for the "Quỹ Mẹ" option
4. THE API_Client SHALL populate the Quỹ Thành phần dropdown with Fund_Level_2 data (capdo = 2)
5. THE API_Client SHALL organize Fund_Level_3 data (capdo = 3) hierarchically under their parent Fund_Level_2 based on quy_cha_id
6. IF API call to fetch funds fails, THEN THE Public_Donation_Form SHALL display error message "Không thể tải danh sách quỹ. Vui lòng tải lại trang" and disable destination selection
7. THE API_Client SHALL cache the funds list for 5 minutes to reduce backend load
8. WHEN funds data is refreshed, THE Destination_Selection_Section SHALL preserve any previously selected destination if it still exists in the new data
9. FOR ALL fetched funds, each fund with capdo = 3 SHALL have a quy_cha_id that references a fund with capdo = 2 (referential integrity property)

### Requirement 17: Parse và format số tiền

**User Story:** As a nhà tài trợ, I want to nhập và xem số tiền ở định dạng dễ đọc, so that tôi có thể dễ dàng hiểu giá trị tiền tệ.

#### Acceptance Criteria

1. WHEN a user types a number into the số tiền field, THE Donation_Details_Section SHALL format the number with thousands separators (e.g., 1000000 displays as "1,000,000")
2. WHEN a user focuses on the số tiền field, THE Donation_Details_Section SHALL remove formatting to allow easy editing
3. WHEN a user blurs from the số tiền field, THE Donation_Details_Section SHALL reapply number formatting within 100 milliseconds
4. THE Donation_Details_Section SHALL append "VND" suffix after the formatted number when field is not focused
5. WHEN Quick_Amount_Button is clicked, THE Donation_Details_Section SHALL populate the field with formatted value
6. THE Donation_Details_Section SHALL parse formatted input back to numeric value before form submission
7. THE Donation_Details_Section SHALL handle decimal input by rounding to the nearest integer
8. FOR ALL numeric inputs, formatting then parsing SHALL produce a value within 1 VND of the original input (round-trip with tolerance)

### Requirement 18: Lazy loading cho dropdown options

**User Story:** As a hệ thống, I want to tải dropdown options chỉ khi cần thiết, so that tôi có thể cải thiện hiệu suất tải trang ban đầu.

#### Acceptance Criteria

1. WHEN the Public_Donation_Form loads initially, THE Destination_Selection_Section SHALL only fetch Fund_Level_1 data
2. WHEN a user selects "Quỹ Thành phần", THE Destination_Selection_Section SHALL fetch Fund_Level_2 data if not already cached
3. WHEN a user selects "Chương trình có sẵn", THE Destination_Selection_Section SHALL fetch both Fund_Level_2 and Fund_Level_3 data if not already cached
4. WHEN fetching additional data, THE Destination_Selection_Section SHALL display a loading spinner within the dropdown area
5. THE Destination_Selection_Section SHALL cache fetched data for the duration of the page session
6. IF lazy-loaded data fetch fails, THEN THE Destination_Selection_Section SHALL display an error message within the dropdown and provide a retry button
7. WHEN retry button is clicked, THE Destination_Selection_Section SHALL re-attempt the data fetch

### Requirement 19: Form reset functionality

**User Story:** As a nhà tài trợ, I want to reset form về trạng thái ban đầu, so that tôi có thể bắt đầu lại nếu muốn thay đổi hoàn toàn thông tin.

#### Acceptance Criteria

1. THE Public_Donation_Form SHALL display a "Làm mới" button at the bottom of the form
2. WHEN a user clicks "Làm mới" button, THE Public_Donation_Form SHALL display a confirmation dialog with message "Bạn có chắc muốn xóa toàn bộ thông tin đã nhập?"
3. WHEN a user confirms reset in the dialog, THE Public_Donation_Form SHALL clear all form fields within 200 milliseconds
4. WHEN form is reset, THE Public_Donation_Form SHALL remove all uploaded files from the file input fields
5. WHEN form is reset, THE Public_Donation_Form SHALL clear all validation error messages
6. WHEN form is reset, THE Public_Donation_Form SHALL collapse Program_Proposal_Section if it was expanded
7. WHEN form is reset, THE Public_Donation_Form SHALL maintain the fetched funds data in cache (not re-fetch)
8. WHEN a user cancels reset in the dialog, THE Public_Donation_Form SHALL maintain all current form state
9. FOR ALL form resets, submitting immediately after reset without entering new data SHALL fail validation (empty form property)

### Requirement 20: Accessibility compliance

**User Story:** As a người dùng khuyết tật, I want to sử dụng form với công nghệ hỗ trợ, so that tôi có thể tạo khoản tài trợ độc lập.

#### Acceptance Criteria

1. THE Public_Donation_Form SHALL provide descriptive labels for all form inputs using `<label>` elements with `for` attributes
2. THE Public_Donation_Form SHALL ensure all interactive elements are keyboard navigable with logical tab order
3. THE Public_Donation_Form SHALL provide visible focus indicators for all focusable elements with minimum 2-pixel outline
4. THE Public_Donation_Form SHALL use ARIA attributes (aria-label, aria-describedby, aria-invalid, aria-required) appropriately for all form controls
5. WHEN validation errors occur, THE Public_Donation_Form SHALL announce errors to screen readers using aria-live regions
6. THE Public_Donation_Form SHALL ensure color is not the only means of conveying information (e.g., error states also use icons)
7. THE Public_Donation_Form SHALL maintain a color contrast ratio of at least 4.5:1 for normal text and 3:1 for large text
8. THE Public_Donation_Form SHALL provide text alternatives for all non-text content using alt attributes
9. THE Public_Donation_Form SHALL ensure form is fully operable using keyboard only (no mouse required)
10. THE Public_Donation_Form SHALL support screen reader announcements for dynamic content changes (e.g., showing/hiding sections)

## Notes

### Parser and Serializer Requirements

Đặc biệt lưu ý các requirements liên quan đến parsing và serialization:

- **Requirement 1 (AC 8)**: Round-trip property cho donor information
- **Requirement 3 (AC 12)**: Round-trip property cho program proposal JSON
- **Requirement 4 (AC 12)**: Round-trip property cho donation amount formatting
- **Requirement 7 (AC 8)**: Round-trip property cho file upload/download
- **Requirement 8 (AC 10)**: Model-based property cho API data persistence
- **Requirement 17**: Toàn bộ requirement về parsing và formatting số tiền

Các requirements này đều cần property-based testing với round-trip properties để đảm bảo không mất dữ liệu trong quá trình chuyển đổi.

### Testing Priorities

Priority cao cho property-based testing:
1. Form validation logic (Req 6, 14)
2. Number formatting và parsing (Req 17)
3. Data serialization (Req 1, 3, 8)
4. File upload/validation (Req 7, 13)

Priority cao cho integration testing:
1. API calls (Req 8, 16)
2. Email service (Req 10)
3. Rate limiting (Req 12)
4. CSRF protection (Req 15)

### Security Considerations

Các requirements về security cần được ưu tiên cao:
- Requirement 12: Rate limiting
- Requirement 13: File validation
- Requirement 14: Input sanitization
- Requirement 15: CSRF protection

Tất cả đều cần được test kỹ lưỡng với cả unit tests và integration tests.
