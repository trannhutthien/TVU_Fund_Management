# Bugfix Requirements Document

## Introduction

This document outlines the requirements for fixing a date format mismatch bug in the user personal information update feature. When users attempt to update their personal information including their birth date (ngaySinh), the system fails with a 500 Internal Server Error. The root cause is a format mismatch: the frontend sends date values in ISO 8601 format (e.g., '1978-05-10T17:00:00.000Z') while the HTML5 date input field expects and the backend likely expects the standard 'yyyy-MM-dd' format. This causes validation errors and prevents users from successfully updating their personal information.

**Impact:** Users cannot update their personal information when the birth date field contains data, effectively blocking a core user profile management feature.

**Location:** 
- Frontend: `frontend/src/pages/User/Student/ProfilePage/student/sections/PersonalInfoSection.jsx`
- Service: `frontend/src/services/userService.js`
- Backend: `backend/controllers/users/userController.js` (PATCH `/api/users/:id`)

## Bug Analysis

### Current Behavior (Defect)

**1.1** WHEN a user loads their profile with an existing birth date stored in the database THEN the system displays the date in ISO 8601 format (e.g., '1978-05-10T17:00:00.000Z') in the date input field, which triggers the browser validation error: "The specified value does not conform to the required format, 'yyyy-MM-dd'"

**1.2** WHEN a user attempts to save personal information with a birth date field containing an ISO 8601 formatted date THEN the system sends the date to the backend API in ISO 8601 format (e.g., '1978-05-10T17:00:00.000Z'), causing the backend to fail with a 500 Internal Server Error

**1.3** WHEN the date format validation error occurs THEN the user sees an error message "Cập nhật thông tin lỗi: AxiosError: Request failed with status code 500" and the personal information update fails

### Expected Behavior (Correct)

**2.1** WHEN a user loads their profile with an existing birth date stored in the database THEN the system SHALL convert and display the date in 'yyyy-MM-dd' format in the date input field without triggering browser validation errors

**2.2** WHEN a user attempts to save personal information with a birth date field THEN the system SHALL send the date to the backend API in 'yyyy-MM-dd' format, allowing the backend to successfully process the update request

**2.3** WHEN the date format is correctly converted THEN the user SHALL see a success message "Cập nhật thông tin thành công!" and the personal information SHALL be successfully updated in the database

### Unchanged Behavior (Regression Prevention)

**3.1** WHEN a user updates personal information WITHOUT a birth date (ngaySinh is empty/null) THEN the system SHALL CONTINUE TO successfully save the information without date-related validation errors

**3.2** WHEN a user updates other personal information fields (hoTen, email, soDienThoai, diaChi, khoaPhong, lop, gioiTinh, tinhTrangCongTac, donViCongTac) while also updating the birth date THEN the system SHALL CONTINUE TO update all fields correctly

**3.3** WHEN a user cancels editing without saving THEN the system SHALL CONTINUE TO discard changes and revert to the original values without making any API calls

**3.4** WHEN the PersonalInfoSection component uses the `formatDateForInput` helper function for display purposes THEN the system SHALL CONTINUE TO correctly format dates from ISO 8601 to 'yyyy-MM-dd' for display in the date input field

**3.5** WHEN a user views their profile in read-only mode (not editing) THEN the system SHALL CONTINUE TO display the formatted birth date correctly without allowing modifications
