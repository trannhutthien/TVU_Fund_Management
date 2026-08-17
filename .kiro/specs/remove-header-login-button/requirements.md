# Requirements Document

## Introduction

Feature này thực hiện việc xóa button "Đăng nhập" khỏi PublicHeader component và thêm các link/button đăng nhập ở các vị trí khác trong hệ thống để cải thiện trải nghiệm người dùng (UX). Thay vì hiển thị button đăng nhập trên mọi trang public, hệ thống sẽ chỉ hiển thị link đăng nhập ở các vị trí có bối cảnh phù hợp, nơi người dùng có nhu cầu thực hiện hành động yêu cầu xác thực.

## Glossary

- **PublicHeader**: Component header chung hiển thị trên tất cả các trang public của hệ thống
- **Login_Link**: Link hoặc button dẫn đến modal/trang đăng nhập
- **HeroBanner**: Component banner chính trên LandingPage
- **CombinedProcessSection**: Component section mô tả quy trình cho sinh viên và nhà tài trợ trên LandingPage
- **ApplyPage**: Trang nộp đơn xin hỗ trợ
- **TrackPage**: Trang tra cứu tiến độ hồ sơ
- **Authenticated_User**: Người dùng đã đăng nhập vào hệ thống
- **Guest_User**: Người dùng chưa đăng nhập (khách vãng lai)
- **Modal**: Cửa sổ popup hiển thị form đăng nhập
- **onLoginClick**: Callback function để mở modal đăng nhập

## Requirements

### Requirement 1: Xóa Button Đăng Nhập Khỏi PublicHeader

**User Story:** Là một người dùng truy cập hệ thống, tôi muốn header gọn gàng và chỉ hiển thị các chức năng cần thiết, để tôi không bị phân tâm bởi các button không liên quan đến trang hiện tại.

#### Acceptance Criteria

1. THE PublicHeader Component SHALL NOT render the login button when user is not authenticated
2. WHEN a Guest_User views any public page, THE PublicHeader SHALL NOT display any login-related UI elements in the header actions area
3. THE PublicHeader Component SHALL preserve all other functionality including navigation menu, search bar, and logo
4. WHEN the login button is removed, THE PublicHeader Component SHALL maintain proper spacing and alignment of remaining elements
5. THE PublicHeader Component SHALL continue to display HeaderActions component for Authenticated_User with their profile information

### Requirement 2: Thêm Login Link Trên LandingPage HeroBanner

**User Story:** Là một Guest_User trên trang chủ, tôi muốn thấy link đăng nhập ngay tại hero banner, để tôi có thể đăng nhập nhanh chóng khi muốn sử dụng các tính năng yêu cầu xác thực.

#### Acceptance Criteria

1. THE HeroBanner Component SHALL display a login link labeled "Đã có tài khoản? Đăng nhập ngay" when user is Guest_User
2. WHEN a Guest_User clicks the login link on HeroBanner, THE System SHALL open the login modal via onLoginClick callback
3. THE HeroBanner Component SHALL position the login link below the main CTA buttons with appropriate styling
4. THE HeroBanner Component SHALL NOT display the login link when user is Authenticated_User
5. THE Login_Link on HeroBanner SHALL use subtle text styling that complements the hero design without competing with primary CTA buttons

### Requirement 3: Thêm Login Link Trên CombinedProcessSection

**User Story:** Là một Guest_User đọc về quy trình nộp đơn, tôi muốn thấy link đăng nhập gần button "Bắt đầu ngay", để tôi biết rằng tôi có thể đăng nhập nếu đã có tài khoản.

#### Acceptance Criteria

1. THE CombinedProcessSection Component SHALL display text "Hoặc đăng nhập để tiếp tục" with a clickable link below the "Bắt đầu ngay" button when user is Guest_User
2. WHEN a Guest_User clicks the login link in CombinedProcessSection, THE System SHALL open the login modal via onLoginClick callback
3. THE CombinedProcessSection Component SHALL NOT display the login link when user is Authenticated_User
4. THE Login_Link SHALL use secondary text styling with font size 14px and appropriate spacing from the primary CTA button
5. THE Login_Link SHALL be placed within the columnCta section of the student column only

### Requirement 4: Thêm Login Prompt Trên ApplyPage

**User Story:** Là một Guest_User truy cập trang nộp đơn, tôi muốn thấy thông báo rõ ràng về việc tôi có thể đăng nhập nếu đã có tài khoản, để tôi không phải điền form dài dòng nếu đã có thông tin trong hệ thống.

#### Acceptance Criteria

1. THE ApplyPage SHALL display a prominent info alert at the top of the form when user is Guest_User
2. THE Info_Alert SHALL contain the message "Bạn đã có tài khoản? Đăng nhập để tự động điền thông tin và quản lý đơn của bạn" with a login link
3. WHEN a Guest_User clicks the login link on ApplyPage, THE System SHALL open the login modal via openLoginModal callback
4. THE Info_Alert SHALL use Ant Design Alert component with type "info" and showIcon prop set to true
5. THE ApplyPage SHALL NOT display the login prompt when user is Authenticated_User
6. THE Info_Alert SHALL be positioned above the FundTitleSection and below the breadcrumb navigation

### Requirement 5: Giữ Nguyên Login Button Trên TrackPage

**User Story:** Là một Guest_User đã hoàn thành xác thực OTP và nhận tài khoản tạm, tôi muốn thấy button "Đăng Nhập Ngay" để tôi có thể đăng nhập ngay lập tức với thông tin vừa nhận được.

#### Acceptance Criteria

1. THE TrackPage SHALL preserve the existing "Đăng Nhập Ngay" button in the success credential display section
2. WHEN tempCredentials state is set, THE TrackPage SHALL display the login button within the success Alert component
3. WHEN a Guest_User clicks the "Đăng Nhập Ngay" button, THE System SHALL open the login modal via openLoginModal callback
4. THE TrackPage Login_Button SHALL use Button component with type="primary" and size="small" props
5. THE TrackPage SHALL NOT modify or remove any existing login-related functionality

### Requirement 6: Đảm Bảo Callback onLoginClick Hoạt Động Đúng

**User Story:** Là một developer bảo trì hệ thống, tôi muốn tất cả các login link đều sử dụng callback onLoginClick một cách nhất quán, để tôi có thể dễ dàng quản lý và debug logic đăng nhập.

#### Acceptance Criteria

1. THE HeroBanner Component SHALL receive onLoginClick prop from LandingPage parent component
2. THE CombinedProcessSection Component SHALL receive onLoginClick prop from LandingPage parent component
3. WHEN onLoginClick is invoked, THE System SHALL execute the openLoginModal function which sets isLoginModalOpen state to true
4. THE Modal Component SHALL render when isLoginModalOpen state is true
5. THE Modal Component SHALL call closeLoginModal function when user closes the modal or successfully logs in

### Requirement 7: Xử Lý Responsive Design Cho Mobile

**User Story:** Là một người dùng truy cập hệ thống trên mobile, tôi muốn các login link hiển thị đúng cách trên màn hình nhỏ, để tôi có thể dễ dàng nhấn vào và đăng nhập.

#### Acceptance Criteria

1. WHEN viewport width is less than or equal to 768px, THE Login_Link SHALL maintain minimum touch target size of 44x44 pixels
2. THE Login_Link text SHALL remain readable on mobile with font size no smaller than 14px
3. WHEN viewed on mobile, THE HeroBanner Login_Link SHALL be center-aligned and positioned below stat cards
4. WHEN viewed on mobile, THE CombinedProcessSection Login_Link SHALL be center-aligned within the CTA section
5. WHEN viewed on mobile, THE ApplyPage Info_Alert SHALL render with full width and appropriate padding

### Requirement 8: Đảm Bảo Accessibility Standards

**User Story:** Là một người dùng khuyết tật sử dụng screen reader, tôi muốn tất cả các login link đều có label rõ ràng, để tôi hiểu được mục đích của từng link.

#### Acceptance Criteria

1. THE Login_Link SHALL have proper ARIA labels describing their purpose (e.g., "Mở form đăng nhập")
2. THE Login_Link SHALL be keyboard accessible with proper focus indicators
3. WHEN a keyboard user tabs through the page, THE Login_Link SHALL receive focus in logical order
4. THE Login_Link SHALL have color contrast ratio of at least 4.5:1 against background
5. THE Modal triggered by Login_Link SHALL have proper ARIA role="dialog" and aria-modal="true" attributes

### Requirement 9: Kiểm Tra Không Có Regression Bugs

**User Story:** Là một QA engineer, tôi muốn đảm bảo rằng việc xóa login button không làm hỏng các tính năng khác, để hệ thống vẫn hoạt động ổn định sau khi thay đổi.

#### Acceptance Criteria

1. THE System SHALL continue to render LoginForm modal correctly when any Login_Link is clicked
2. THE System SHALL preserve all existing authentication flows including login, logout, and session management
3. THE PublicHeader mobile menu SHALL continue to function properly without the login button
4. THE RegisterForm modal switching functionality SHALL work correctly from LoginForm
5. THE System SHALL not introduce any console errors or warnings related to prop passing or component rendering

### Requirement 10: Performance và Code Quality

**User Story:** Là một developer bảo trì hệ thống, tôi muốn code thay đổi tuân theo best practices, để code dễ đọc và maintain trong tương lai.

#### Acceptance Criteria

1. THE Modified components SHALL use React hooks (useState, useCallback) appropriately to prevent unnecessary re-renders
2. THE Login_Link components SHALL be implemented as reusable components or styled elements to avoid code duplication
3. THE Code changes SHALL maintain consistent naming conventions with existing codebase (camelCase for JS, kebab-case for CSS)
4. THE PropTypes validation SHALL be updated for components receiving new onLoginClick prop
5. THE System SHALL not increase bundle size by more than 5KB after adding new login links

## Correctness Properties

### Property 1: Login Button Visibility Invariant

**Property Type:** Invariant

**Description:** FOR ALL pages in the public site, the PublicHeader SHALL NOT display a login button in the header actions area when the user is not authenticated. This property ensures consistency across the entire application.

**Test Strategy:** Property-based test that iterates through all public pages and verifies that the PublicHeader does not render any element with className containing "btnLogin" or "login-button" when isAuthenticated is false.

### Property 2: Login Link Availability Property

**Property Type:** Metamorphic Property

**Description:** The number of available login access points for Guest_User SHALL be greater than or equal to 2 (counting HeroBanner + CombinedProcessSection on LandingPage, ApplyPage prompt, and TrackPage button after OTP verification). This ensures users always have a way to access login functionality.

**Test Strategy:** Render each page component with isAuthenticated=false and count the number of clickable elements that trigger onLoginClick or openLoginModal. Assert count >= 2 across the application.

### Property 3: Authentication State Idempotence

**Property Type:** Idempotence

**Description:** WHEN a user is already Authenticated_User, clicking any remaining Login_Link SHALL have no effect (links should not be visible). Applying authentication check multiple times produces the same result as applying it once.

**Test Strategy:** Property-based test that verifies when isAuthenticated=true, no Login_Link elements are rendered on any page. Running the check twice should yield identical results.

### Property 4: Modal Invocation Consistency

**Property Type:** Round-trip Property

**Description:** FOR ALL Login_Link components, clicking the link SHALL invoke onLoginClick callback which SHALL set isLoginModalOpen to true, and the modal's onClose SHALL set isLoginModalOpen to false, returning to the initial state.

**Test Strategy:** Simulate click on Login_Link → verify onLoginClick called → verify isLoginModalOpen=true → simulate modal close → verify isLoginModalOpen=false. This round-trip should work for all login links.

### Property 5: Responsive Layout Preservation

**Property Type:** Invariant

**Description:** FOR ALL viewport widths between 320px and 3840px, the Login_Link SHALL remain visible and clickable without overlapping other UI elements.

**Test Strategy:** Property-based test that renders each page at random viewport widths and verifies Login_Link elements have proper bounding box dimensions and do not overlap with other interactive elements.

### Property 6: Accessibility Compliance

**Property Type:** Error Condition Property

**Description:** WHEN any Login_Link is rendered, it SHALL have proper ARIA attributes and keyboard accessibility. Missing accessibility attributes should be treated as an error.

**Test Strategy:** For each Login_Link rendered in the DOM, verify presence of aria-label, tabIndex, and proper focus handler. Generate test cases with various component states and verify accessibility properties hold.

### Property 7: PropTypes Validation

**Property Type:** Error Condition Property

**Description:** WHEN onLoginClick prop is passed to HeroBanner or CombinedProcessSection, it SHALL be a valid function. Passing non-function values should trigger PropTypes warning.

**Test Strategy:** Unit tests that pass invalid prop types (null, undefined, string, number) to components and verify PropTypes warnings are triggered in development mode.

### Property 8: No Dead Links Property

**Property Type:** Error Condition Property

**Description:** WHEN a Guest_User clicks any Login_Link, the link SHALL successfully open the login modal. Dead links (links that don't trigger onLoginClick) are errors.

**Test Strategy:** Integration test that clicks every Login_Link in the application and verifies the LoginForm modal is rendered after each click.

### Property 9: Code Change Minimality

**Property Type:** Metamorphic Property

**Description:** The number of lines changed in PublicHeader SHALL be less than or equal to 10 lines, ensuring minimal disruption to existing code.

**Test Strategy:** Use git diff to count lines changed in PublicHeader.jsx and assert the count is <= 10. This ensures the refactor is focused and minimal.

### Property 10: Bundle Size Property

**Property Type:** Metamorphic Property

**Description:** The production bundle size increase SHALL be less than or equal to 5KB after implementing all login links, ensuring performance is not negatively impacted.

**Test Strategy:** Compare production build size before and after feature implementation. Assert sizeAfter - sizeBefore <= 5120 bytes.

