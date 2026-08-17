# Bugfix Requirements Document

## Introduction

Bug được phát hiện trong quy trình tạo đơn yêu cầu hỗ trợ đối với tài khoản loại "Nhà Khoa Học" (nha_khoa_hoc). Sau khi người dùng nhập đầy đủ thông tin ở các bước trước, khi đến section "Nội dung đề nghị" (Request Content Section - Bước 2), nút "Tiếp theo" bị vô hiệu hóa và không cho phép chuyển sang bước tiếp theo là "Kiểm tra" (Review Step).

Bug này ngăn cản người dùng có tài khoản "Nhà Khoa Học" hoàn thành quy trình nộp đơn yêu cầu hỗ trợ, dẫn đến trải nghiệm người dùng kém và mất khả năng sử dụng chức năng cốt lõi của hệ thống.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN tài khoản có loại "Nhà Khoa Học" (loaiTaiKhoan === 'NHA_KHOA_HOC') đã đăng nhập và điền đầy đủ thông tin ở Bước 1 (chọn quỹ, vai trò và thông tin cá nhân) THEN khi tiến đến Bước 2 "Nội dung đề nghị", nút "Tiếp theo" bị vô hiệu hóa (disabled)

1.2 WHEN người dùng với vai trò "nha_khoa_hoc" đã điền đầy đủ các trường bắt buộc ở RequestContentSection (tieu_de >= 10 ký tự, mo_ta >= 50 ký tự, so_tien_yeu_cau hợp lệ) THEN hệ thống vẫn đánh giá isStep2Valid = false khiến nút "Tiếp theo" không thể bấm được

1.3 WHEN isStep2Valid được tính toán cho userRole === 'nha_khoa_hoc' với isAuthenticated === true THEN logic validation kiểm tra điều kiện userFields.donViCongTac (field thuộc Bước 1) thay vì chỉ kiểm tra các trường của Bước 2

### Expected Behavior (Correct)

2.1 WHEN tài khoản "Nhà Khoa Học" đã đăng nhập và điền đầy đủ thông tin Bước 2 "Nội dung đề nghị" (tieu_de >= 10 ký tự, mo_ta >= 50 ký tự, so_tien_yeu_cau hợp lệ, và điều kiện tong_kinh_phi_du_an nếu loại hỗ trợ là TAI_TRO_CO_THU_HOI) THEN isStep2Valid SHALL trả về true và nút "Tiếp theo" được kích hoạt

2.2 WHEN validation logic cho isStep2Valid được thực thi THEN hệ thống SHALL chỉ kiểm tra các trường liên quan đến Bước 2 (nội dung đề nghị), không kiểm tra các trường thuộc Bước 1 (thông tin cá nhân)

2.3 WHEN tài khoản đã đăng nhập với userRole === 'nha_khoa_hoc' điền thông tin đơn THEN validation cho userFields.donViCongTac SHALL được thực hiện ở isStep1Valid thay vì isStep2Valid

### Unchanged Behavior (Regression Prevention)

3.1 WHEN tài khoản với userRole === 'sinh_vien' điền form yêu cầu hỗ trợ THEN hệ thống SHALL CONTINUE TO validate đúng như hiện tại (khoa và lop ở Bước 1, nội dung đề nghị ở Bước 2)

3.2 WHEN tài khoản với userRole === 'can_bo_truong' hoặc 'can_bo_nghi_huu' điền form THEN hệ thống SHALL CONTINUE TO validate donViCongTac ở Bước 1 và nội dung đề nghị ở Bước 2

3.3 WHEN khách vãng lai (guest user) chọn vai trò 'nha_khoa_hoc' và điền form THEN validation SHALL CONTINUE TO yêu cầu hoTen, maSoDinhDanh, email, soDienThoai ở Bước 1

3.4 WHEN validation isStep2Valid được thực thi cho các loại hỗ trợ khác nhau (TAI_TRO_KHONG_HOAN_LAI, CHO_VAY, TAI_TRO_CO_THU_HOI) THEN logic kiểm tra tong_kinh_phi_du_an cho TAI_TRO_CO_THU_HOI SHALL CONTINUE TO hoạt động đúng

3.5 WHEN người dùng là nhà tài trợ (isDonor === true) THEN validation logic SHALL CONTINUE TO hoạt động đúng cho các phương thức thanh toán khác nhau

3.6 WHEN nút "Tiếp theo" được hiển thị ở các bước khác nhau của form wizard THEN trạng thái disabled SHALL CONTINUE TO phụ thuộc vào giá trị tương ứng (isStep1Valid, isStep2Valid, isStep3Valid, isStep4Valid)
