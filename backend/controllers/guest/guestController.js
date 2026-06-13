import crypto from "crypto";
import GuestModel from "../../models/guest/GuestModel.js";
import FundModel from "../../models/funds/FundModel.js";
import {
  sendOTPEmail,
  sendAccountCreatedEmail,
  sendDonationOTPEmail,
  sendDonationCreatedEmail
} from "../../services/emailService.js";

/**
 * Validates email format
 */
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates phone format (10-11 digits)
 */
const validatePhone = (phone) => {
  const phoneRegex = /^[0-9]{10,11}$/;
  return phoneRegex.test(phone.trim());
};

/**
 * Tạo mật khẩu ngẫu nhiên an toàn
 */
const generateRandomPassword = () => {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

/**
 * POST /api/guest/yeu-cau
 * Gửi đơn xin hỗ trợ vãng lai
 */
export const submitGuestApplication = async (req, res) => {
  try {
    const {
      guestHoTen,
      guestEmail,
      guestSoDienThoai,
      guestMssv,
      guestKhoa,
      guestLop,
      guestSoTaiKhoan,
      guestNganHang,
      guestChuTaiKhoan,
      quyId,
      lyDo,
      soTienDeNghi,
      taiLieuDinhKem
    } = req.body;

    // 1. Validate bắt buộc
    if (!guestHoTen || !guestEmail || !quyId || !lyDo || !soTienDeNghi || !taiLieuDinhKem) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ thông tin bắt buộc: Họ tên, Email, Quỹ, Lý do, Số tiền và File minh chứng"
      });
    }

    if (!validateEmail(guestEmail)) {
      return res.status(400).json({
        success: false,
        message: "Email không đúng định dạng"
      });
    }

    if (guestSoDienThoai && !validatePhone(guestSoDienThoai)) {
      return res.status(400).json({
        success: false,
        message: "Số điện thoại không đúng định dạng (10-11 số)"
      });
    }

    const amount = parseFloat(soTienDeNghi);
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Số tiền đề nghị phải lớn hơn 0"
      });
    }

    if (amount > 50000000) {
      return res.status(400).json({
        success: false,
        message: "Số tiền yêu cầu hỗ trợ tối đa là 50,000,000 VNĐ"
      });
    }

    // 2. Kiểm tra quỹ tồn tại và đang hoạt động
    const fund = await FundModel.getFundById(quyId);
    if (!fund) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy quỹ hỗ trợ này"
      });
    }

    if (fund.trang_thai !== "Dang hoat dong") {
      return res.status(400).json({
        success: false,
        message: "Quỹ hiện đang tạm đóng nhận đơn xin hỗ trợ"
      });
    }

    // 3. Tạo bảo mật và tracking
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString(); // OTP 6 số
    const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // Hết hạn sau 15 phút
    const trackingUuid = crypto.randomUUID();

    // 4. Lưu vào bảng tạm
    await GuestModel.createGuestApplication({
      guestHoTen: guestHoTen.trim(),
      guestEmail: guestEmail.trim().toLowerCase(),
      guestSoDienThoai: guestSoDienThoai ? guestSoDienThoai.trim() : null,
      guestMssv: guestMssv ? guestMssv.trim() : null,
      guestKhoa: guestKhoa ? guestKhoa.trim() : null,
      guestLop: guestLop ? guestLop.trim() : null,
      guestSoTaiKhoan: guestSoTaiKhoan ? guestSoTaiKhoan.trim() : null,
      guestNganHang: guestNganHang ? guestNganHang.trim() : null,
      guestChuTaiKhoan: guestChuTaiKhoan ? guestChuTaiKhoan.trim() : null,
      quyId,
      lyDo: lyDo.trim(),
      soTienDeNghi: amount,
      taiLieuDinhKem: taiLieuDinhKem.trim(),
      otpCode,
      otpExpiresAt,
      trackingUuid
    });

    // 5. Gửi email OTP
    await sendOTPEmail(
      guestEmail.trim().toLowerCase(),
      guestHoTen.trim(),
      otpCode,
      trackingUuid
    );

    return res.status(201).json({
      success: true,
      message: "Gửi yêu cầu thành công. Vui lòng kiểm tra email để nhận mã OTP xác thực.",
      data: {
        email: guestEmail.trim().toLowerCase(),
        trackingUuid
      }
    });

  } catch (error) {
    console.error("Lỗi submitGuestApplication:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi gửi đơn xin hỗ trợ"
    });
  }
};

/**
 * POST /api/guest/tai-tro
 * Đăng ký tài trợ vãng lai
 */
export const submitGuestDonation = async (req, res) => {
  try {
    const {
      guestHoTen,
      guestEmail,
      guestSoDienThoai,
      guestToChuc,
      guestDiaChi,
      quyId,
      soTien,
      hinhThuc,
      maGiaoDich,
      chungTu,
      ghiChu
    } = req.body;

    // 1. Validate bắt buộc
    if (!guestHoTen || !guestEmail || !quyId || !soTien) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ thông tin bắt buộc: Họ tên, Email, Quỹ, Số tiền"
      });
    }

    if (!validateEmail(guestEmail)) {
      return res.status(400).json({
        success: false,
        message: "Email không đúng định dạng"
      });
    }

    if (guestSoDienThoai && !validatePhone(guestSoDienThoai)) {
      return res.status(400).json({
        success: false,
        message: "Số điện thoại không đúng định dạng (10-11 số)"
      });
    }

    const amount = parseFloat(soTien);
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Số tiền đóng góp phải lớn hơn 0"
      });
    }

    // 2. Kiểm tra quỹ
    const fund = await FundModel.getFundById(quyId);
    if (!fund) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy quỹ đóng góp này"
      });
    }

    if (fund.trang_thai !== "Dang hoat dong") {
      return res.status(400).json({
        success: false,
        message: "Quỹ đóng góp hiện đang tạm dừng tiếp nhận đóng góp"
      });
    }

    // 3. Tạo bảo mật và tracking
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
    const trackingUuid = crypto.randomUUID();

    // 4. Lưu vào bảng tạm
    await GuestModel.createGuestDonation({
      guestHoTen: guestHoTen.trim(),
      guestEmail: guestEmail.trim().toLowerCase(),
      guestSoDienThoai: guestSoDienThoai ? guestSoDienThoai.trim() : null,
      guestToChuc: guestToChuc ? guestToChuc.trim() : null,
      guestDiaChi: guestDiaChi ? guestDiaChi.trim() : null,
      quyId,
      soTien: amount,
      hinhThuc: hinhThuc || "Chuyen khoan",
      maGiaoDich: maGiaoDich ? maGiaoDich.trim() : null,
      ngayTaiTro: new Date(),
      chungTu: chungTu ? chungTu.trim() : null,
      ghiChu: ghiChu ? ghiChu.trim() : null,
      otpCode,
      otpExpiresAt,
      trackingUuid
    });

    // 5. Gửi OTP qua email
    await sendDonationOTPEmail(
      guestEmail.trim().toLowerCase(),
      guestHoTen.trim(),
      otpCode,
      trackingUuid
    );

    return res.status(201).json({
      success: true,
      message: "Gửi thông tin tài trợ thành công. Vui lòng kiểm tra email để nhận mã OTP xác thực.",
      data: {
        email: guestEmail.trim().toLowerCase(),
        trackingUuid
      }
    });

  } catch (error) {
    console.error("Lỗi submitGuestDonation:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi đăng ký đóng góp tài trợ"
    });
  }
};

/**
 * POST /api/guest/verify-otp
 * Xác thực mã OTP và kích hoạt luồng di chuyển dữ liệu
 */
export const verifyOtp = async (req, res) => {
  try {
    const { email, otpCode, type } = req.body;

    if (!email || !otpCode || !type) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp đầy đủ thông tin: Email, Mã OTP và Loại đơn"
      });
    }

    if (type !== "application" && type !== "donation") {
      return res.status(400).json({
        success: false,
        message: "Loại đơn không hợp lệ (chỉ chấp nhận 'application' hoặc 'donation')"
      });
    }

    // Sinh mật khẩu ngẫu nhiên để cung cấp cho tài khoản tự tạo
    const plainPassword = generateRandomPassword();

    if (type === "application") {
      // 1. Kiểm tra đơn vãng lai tồn tại
      const guestApp = await GuestModel.findApplicationByEmailAndOtp(email.trim().toLowerCase(), otpCode.trim());
      if (!guestApp) {
        return res.status(400).json({
          success: false,
          message: "Mã xác thực OTP không đúng hoặc đơn đã được xác minh trước đó"
        });
      }

      // 2. Chạy transaction migrate
      const result = await GuestModel.verifyOTPAndMigrateApplication(
        email.trim().toLowerCase(),
        otpCode.trim(),
        plainPassword
      );

      // 3. Gửi email xác nhận kèm tài khoản mới
      await sendAccountCreatedEmail(
        email.trim().toLowerCase(),
        guestApp.guest_hoten,
        plainPassword,
        result.trackingUuid
      );

      return res.status(200).json({
        success: true,
        message: "Xác thực OTP thành công. Đơn đã được kích hoạt và gửi đến bộ phận duyệt.",
        data: {
          trackingUuid: result.trackingUuid,
          email: email.trim().toLowerCase(),
          tempPassword: plainPassword,
          autoCreatedUser: true
        }
      });

    } else {
      // Quy trình cho đơn tài trợ vãng lai
      const guestDon = await GuestModel.findDonationByEmailAndOtp(email.trim().toLowerCase(), otpCode.trim());
      if (!guestDon) {
        return res.status(400).json({
          success: false,
          message: "Mã xác thực OTP không đúng hoặc khoản đóng góp đã được xác minh trước đó"
        });
      }

      // Kích hoạt migrate tài trợ
      const result = await GuestModel.verifyOTPAndMigrateDonation(
        email.trim().toLowerCase(),
        otpCode.trim(),
        plainPassword
      );

      // Gửi email xác nhận
      await sendDonationCreatedEmail(
        email.trim().toLowerCase(),
        guestDon.guest_hoten,
        plainPassword,
        guestDon.sotien,
        result.trackingUuid
      );

      return res.status(200).json({
        success: true,
        message: "Xác thực OTP tài trợ thành công. Đơn đã được chuyển qua hệ thống duyệt giao dịch.",
        data: {
          trackingUuid: result.trackingUuid,
          email: email.trim().toLowerCase(),
          tempPassword: plainPassword,
          autoCreatedUser: true
        }
      });
    }

  } catch (error) {
    console.error("Lỗi verifyOtp:", error);
    if (error.message === "OTP_EXPIRED") {
      return res.status(400).json({
        success: false,
        message: "Mã OTP đã hết hiệu lực (vượt quá 15 phút)"
      });
    }
    return res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi xác thực mã OTP"
    });
  }
};

/**
 * GET /api/guest/track/:uuid
 * Tra cứu trạng thái đơn/khoản tài trợ vãng lai qua UUID
 */
export const trackGuestStatus = async (req, res) => {
  try {
    const { uuid } = req.params;

    if (!uuid) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp mã UUID tra cứu"
      });
    }

    const data = await GuestModel.trackStatusByUuid(uuid);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy dữ liệu đơn với mã tra cứu UUID này"
      });
    }

    return res.status(200).json({
      success: true,
      data
    });

  } catch (error) {
    console.error("Lỗi trackGuestStatus:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi tra cứu trạng thái đơn"
    });
  }
};
