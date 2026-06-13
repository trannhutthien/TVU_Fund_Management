import crypto from "crypto";
import GuestModel from "../../models/guest/GuestModel.js";
import FundModel from "../../models/funds/FundModel.js";
import { sendEmail } from "../../utils/helpers/emailHelper.js";

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
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #0056b3; text-align: center;">XÁC MINH GỬI ĐƠN HỖ TRỢ</h2>
        <p>Xin chào <strong>${guestHoTen}</strong>,</p>
        <p>Hệ thống Quỹ Phát triển Trà Vinh (TVU Fund) đã nhận được yêu cầu nộp đơn hỗ trợ của bạn vào quỹ <strong>${fund.tenquy || fund.ten_quy}</strong>.</p>
        <p>Để kích hoạt đơn và gửi tới hội đồng xét duyệt, vui lòng nhập mã xác thực (OTP) dưới đây trên trang web:</p>
        <div style="background-color: #f8f9fa; padding: 15px; text-align: center; border-radius: 4px; border: 1px dashed #cccccc; margin: 20px 0;">
          <span style="font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #d9534f;">${otpCode}</span>
        </div>
        <p style="color: #666666; font-size: 13px;">* Mã OTP này có giá trị trong vòng <strong>15 phút</strong>. Tuyệt đối không chia sẻ mã này cho người khác.</p>
        <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #999999; text-align: center;">Đây là email tự động từ hệ thống TVU Fund, vui lòng không phản hồi email này.</p>
      </div>
    `;

    await sendEmail({
      to: guestEmail.trim().toLowerCase(),
      subject: "[TVU Fund] Mã xác thực OTP nộp đơn xin hỗ trợ",
      html: emailHtml
    });

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
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #28a745; text-align: center;">XÁC MINH THÔNG TIN TÀI TRỢ</h2>
        <p>Xin chào <strong>${guestHoTen}</strong>,</p>
        <p>Cảm ơn tấm lòng vàng của bạn đã quan tâm đóng góp tài trợ cho quỹ <strong>${fund.tenquy || fund.ten_quy}</strong> thuộc hệ thống TVU Fund.</p>
        <p>Để hoàn tất đăng ký thông tin tài trợ, vui lòng nhập mã xác thực (OTP) dưới đây:</p>
        <div style="background-color: #f8f9fa; padding: 15px; text-align: center; border-radius: 4px; border: 1px dashed #cccccc; margin: 20px 0;">
          <span style="font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #28a745;">${otpCode}</span>
        </div>
        <p style="color: #666666; font-size: 13px;">* Mã OTP này có giá trị trong vòng <strong>15 phút</strong>. Tuyệt đối không chia sẻ mã này cho người khác.</p>
        <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #999999; text-align: center;">Hệ thống TVU Fund chân thành cảm ơn sự đóng góp của quý nhà tài trợ.</p>
      </div>
    `;

    await sendEmail({
      to: guestEmail.trim().toLowerCase(),
      subject: "[TVU Fund] Mã xác thực OTP đăng ký tài trợ",
      html: emailHtml
    });

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
      const loginUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/login`;
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #0056b3; text-align: center;">ĐƠN CỦA BẠN ĐÃ ĐƯỢC TIẾP NHẬN THÀNH CÔNG</h2>
          <p>Xin chào <strong>${guestApp.guest_hoten}</strong>,</p>
          <p>Mã OTP đã được xác minh thành công. Đơn yêu cầu hỗ trợ của bạn đã được chuyển tới Hội đồng xét duyệt ở trạng thái <strong>Chờ duyệt cấp 1</strong>.</p>
          <p>Để giúp bạn dễ dàng theo dõi tiến độ xét duyệt và bổ sung thông tin khi được yêu cầu, hệ thống đã tự động tạo cho bạn một tài khoản thành viên:</p>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; border: 1px solid #e0e0e0; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Email đăng nhập:</strong> ${email.trim().toLowerCase()}</p>
            <p style="margin: 5px 0;"><strong>Mật khẩu tạm thời:</strong> <span style="font-family: monospace; font-size: 16px; color: #d9534f; font-weight: bold;">${plainPassword}</span></p>
          </div>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${loginUrl}" style="background-color: #0056b3; color: white; padding: 12px 25px; text-decoration: none; border-radius: 4px; font-weight: bold;">ĐĂNG NHẬP THEO DÕI ĐƠN</a>
          </p>
          <p style="color: #d9534f; font-size: 13px;">* Lưu ý: Vui lòng đăng nhập và tiến hành thay đổi mật khẩu ngay trong lần đầu tiên để đảm bảo bảo mật tài khoản.</p>
          <p>Bạn cũng có thể tra cứu nhanh trạng thái đơn mà không cần đăng nhập bằng mã UUID sau: <br/><strong>${result.trackingUuid}</strong></p>
          <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #999999; text-align: center;">Chân thành cảm ơn bạn đã sử dụng hệ thống TVU Fund.</p>
        </div>
      `;

      await sendEmail({
        to: email.trim().toLowerCase(),
        subject: "[TVU Fund] Đơn yêu cầu hỗ trợ đã được gửi thành công",
        html: emailHtml
      });

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
      const loginUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/login`;
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #28a745; text-align: center;">ĐĂNG KÝ ĐÓNG GÓP THÀNH CÔNG</h2>
          <p>Xin chào <strong>${guestDon.guest_hoten}</strong>,</p>
          <p>Mã OTP xác thực thành công. Khoản quyên góp tài trợ số tiền <strong>${parseFloat(guestDon.sotien).toLocaleString("vi-VN")} VNĐ</strong> của bạn đã được ghi nhận trên hệ thống ở trạng thái <strong>Chờ xác nhận giao dịch</strong>.</p>
          <p>Chúng tôi đã tự động khởi tạo cho bạn tài khoản Nhà tài trợ để bạn có thể xem lại lịch sử đóng góp và cập nhật thông tin vinh danh:</p>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; border: 1px solid #e0e0e0; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Email đăng nhập:</strong> ${email.trim().toLowerCase()}</p>
            <p style="margin: 5px 0;"><strong>Mật khẩu tạm thời:</strong> <span style="font-family: monospace; font-size: 16px; color: #d9534f; font-weight: bold;">${plainPassword}</span></p>
          </div>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${loginUrl}" style="background-color: #28a745; color: white; padding: 12px 25px; text-decoration: none; border-radius: 4px; font-weight: bold;">ĐĂNG NHẬP HỆ THỐNG</a>
          </p>
          <p style="color: #d9534f; font-size: 13px;">* Lưu ý: Vui lòng đăng nhập và đổi mật khẩu trong lần đầu tiên truy cập.</p>
          <p>Mã tra cứu UUID của bạn: <strong>${result.trackingUuid}</strong></p>
          <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #999999; text-align: center;">Hội đồng quản lý TVU Fund xin chân thành cảm ơn tấm lòng hảo tâm của quý vị.</p>
        </div>
      `;

      await sendEmail({
        to: email.trim().toLowerCase(),
        subject: "[TVU Fund] Xác nhận đăng ký đóng góp tài trợ thành công",
        html: emailHtml
      });

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
