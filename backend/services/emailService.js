import nodemailer from 'nodemailer';

const EMAIL_NOT_CONFIGURED = "EMAIL_NOT_CONFIGURED";
const EMAIL_SEND_FAILED = "EMAIL_SEND_FAILED";

// Helper to check if SMTP settings are valid and not placeholders
const isConfigured = () => {
  const user = process.env.MAIL_USER?.trim();
  const pass = process.env.MAIL_PASS?.trim();
  return (
    user &&
    pass &&
    user !== 'your_gmail@gmail.com' &&
    pass !== 'xxxx xxxx xxxx xxxx'
  );
};

const createEmailError = (code, message, cause = null) => {
  const error = new Error(message);
  error.code = code;
  if (cause) {
    error.cause = cause;
  }
  return error;
};

const createTransportConfig = () => {
  if (!isConfigured()) {
    throw createEmailError(
      EMAIL_NOT_CONFIGURED,
      "SMTP email is not configured. Please set MAIL_USER and MAIL_PASS."
    );
  }

  const auth = {
    user: process.env.MAIL_USER.trim(),
    pass: process.env.MAIL_PASS.trim(),
  };

  const host = process.env.MAIL_HOST?.trim();
  if (host) {
    const port = Number(process.env.MAIL_PORT || 587);
    return {
      host,
      port,
      secure: process.env.MAIL_SECURE === "true" || port === 465,
      auth,
    };
  }

  return {
    service: process.env.MAIL_SERVICE || "gmail",
    auth,
  };
};

const sendMailWrapper = async (mailOptions) => {
  const transporter = nodemailer.createTransport(createTransportConfig());

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (err) {
    console.error("[Email Service] SMTP error:", err.message);
    throw createEmailError(
      EMAIL_SEND_FAILED,
      "Could not send email through SMTP.",
      err
    );
  }
};

// 1. Gửi OTP xác minh email cho khách nộp đơn xin hỗ trợ
export const sendOTPEmail = async (toEmail, hoTen, otpCode, trackingUuid) => {
  const mailOptions = {
    from: process.env.MAIL_FROM || 'TVU Fund <no-reply@tvufund.com>',
    to: toEmail,
    subject: '[TVU Fund] Mã xác thực OTP nộp đơn xin hỗ trợ',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px;">
        <h2 style="color: #1a2f5e; text-align: center;">XÁC MINH GỬI ĐƠN HỖ TRỢ</h2>
        <p>Xin chào <strong>${hoTen}</strong>,</p>
        <p>Hệ thống Quỹ Phát triển Trà Vinh (TVU Fund) đã nhận được yêu cầu nộp đơn xin hỗ trợ của bạn.</p>
        <p>Để kích hoạt đơn và gửi tới hội đồng xét duyệt, vui lòng sử dụng mã xác thực OTP dưới đây:</p>
        <div style="font-size: 32px; font-weight: bold; color: #1a2f5e; 
                    letter-spacing: 8px; text-align: center; padding: 16px;
                    background: #f0f4ff; border-radius: 8px; margin: 16px 0; border: 1px dashed #1a2f5e;">
          ${otpCode}
        </div>
        <p>Mã có hiệu lực trong <strong>15 phút</strong>. Tuyệt đối không chia sẻ mã này cho người khác.</p>
        <p>Mã tra cứu đơn của bạn: <strong>${trackingUuid}</strong></p>
        <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 20px 0;" />
        <p style="color: #888; font-size: 11px; text-align: center;">
          Đây là email tự động từ hệ thống TVU Fund, vui lòng không phản hồi email này.
        </p>
      </div>
    `,
  };

  await sendMailWrapper(mailOptions);
};

// 2. Gửi thông báo tài khoản sau khi OTP đơn xin hỗ trợ xác minh thành công
export const sendAccountCreatedEmail = async (toEmail, hoTen, matKhau, trackingUuid) => {
  const mailOptions = {
    from: process.env.MAIL_FROM || 'TVU Fund <no-reply@tvufund.com>',
    to: toEmail,
    subject: '[TVU Fund] Đơn yêu cầu hỗ trợ đã được gửi thành công',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px;">
        <h2 style="color: #1a2f5e; text-align: center;">ĐƠN CỦA BẠN ĐÃ ĐƯỢC TIẾP NHẬN</h2>
        <p>Xin chào <strong>${hoTen}</strong>,</p>
        <p>Đơn yêu cầu hỗ trợ của bạn đã được chuyển tới Hội đồng xét duyệt ở trạng thái <strong>Chờ duyệt cấp 1</strong>.</p>
        <p>Để giúp bạn dễ dàng theo dõi tiến độ xét duyệt và bổ sung thông tin khi được yêu cầu, hệ thống đã tự động tạo cho bạn một tài khoản thành viên:</p>
        <table style="width:100%; background:#f0f4ff; border-radius:8px; padding:16px; margin: 20px 0;">
          <tr>
            <td><strong>Email đăng nhập:</strong></td>
            <td>${toEmail}</td>
          </tr>
          <tr>
            <td><strong>Mật khẩu tạm:</strong></td>
            <td style="font-size:18px; color:#d9534f;"><strong>${matKhau}</strong></td>
          </tr>
        </table>
        <p style="color: #d9534f; font-size: 13px;">* Lưu ý: Vui lòng đăng nhập và tiến hành thay đổi mật khẩu ngay trong lần đầu tiên để bảo mật tài khoản.</p>
        <p>Mã tra cứu đơn của bạn: <strong>${trackingUuid}</strong></p>
        <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 20px 0;" />
        <p style="color: #888; font-size: 11px; text-align: center;">
          Hệ thống TVU Fund chân thành cảm ơn bạn.
        </p>
      </div>
    `,
  };

  await sendMailWrapper(mailOptions);
};

// 3. Gửi OTP xác minh email cho khách đăng ký đóng góp tài trợ
export const sendDonationOTPEmail = async (toEmail, hoTen, otpCode, trackingUuid) => {
  const mailOptions = {
    from: process.env.MAIL_FROM || 'TVU Fund <no-reply@tvufund.com>',
    to: toEmail,
    subject: '[TVU Fund] Mã xác thực OTP đăng ký tài trợ',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px;">
        <h2 style="color: #28a745; text-align: center;">XÁC MINH THÔNG TIN TÀI TRỢ</h2>
        <p>Xin chào <strong>${hoTen}</strong>,</p>
        <p>Cảm ơn tấm lòng vàng của bạn đã quan tâm đóng góp tài trợ cho hệ thống TVU Fund.</p>
        <p>Để hoàn tất đăng ký thông tin tài trợ, vui lòng nhập mã xác thực OTP dưới đây:</p>
        <div style="font-size: 32px; font-weight: bold; color: #28a745; 
                    letter-spacing: 8px; text-align: center; padding: 16px;
                    background: #f4faf6; border-radius: 8px; margin: 16px 0; border: 1px dashed #28a745;">
          ${otpCode}
        </div>
        <p>Mã có hiệu lực trong <strong>15 phút</strong>. Tuyệt đối không chia sẻ mã này cho người khác.</p>
        <p>Mã tra cứu khoản tài trợ của bạn: <strong>${trackingUuid}</strong></p>
        <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 20px 0;" />
        <p style="color: #888; font-size: 11px; text-align: center;">
          Hệ thống TVU Fund chân thành cảm ơn sự đóng góp của quý nhà tài trợ.
        </p>
      </div>
    `,
  };

  await sendMailWrapper(mailOptions);
};

// 4. Gửi thông báo tài khoản sau khi OTP tài trợ xác minh thành công
export const sendDonationCreatedEmail = async (toEmail, hoTen, matKhau, soTien, trackingUuid) => {
  const mailOptions = {
    from: process.env.MAIL_FROM || 'TVU Fund <no-reply@tvufund.com>',
    to: toEmail,
    subject: '[TVU Fund] Xác nhận đăng ký đóng góp tài trợ thành công',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px;">
        <h2 style="color: #28a745; text-align: center;">ĐĂNG KÝ ĐÓNG GÓP THÀNH CÔNG</h2>
        <p>Xin chào <strong>${hoTen}</strong>,</p>
        <p>Mã OTP xác thực thành công. Khoản quyên góp tài trợ số tiền <strong>${parseFloat(soTien).toLocaleString("vi-VN")} VNĐ</strong> của bạn đã được ghi nhận trên hệ thống ở trạng thái <strong>Chờ xác nhận giao dịch</strong>.</p>
        <p>Chúng tôi đã tự động khởi tạo cho bạn tài khoản Nhà tài trợ để bạn có thể xem lại lịch sử đóng góp và cập nhật thông tin vinh danh:</p>
        <table style="width:100%; background:#f4faf6; border-radius:8px; padding:16px; margin: 20px 0;">
          <tr>
            <td><strong>Email đăng nhập:</strong></td>
            <td>${toEmail}</td>
          </tr>
          <tr>
            <td><strong>Mật khẩu tạm:</strong></td>
            <td style="font-size:18px; color:#d9534f;"><strong>${matKhau}</strong></td>
          </tr>
        </table>
        <p style="color: #d9534f; font-size: 13px;">* Lưu ý: Vui lòng đăng nhập và đổi mật khẩu trong lần đầu tiên truy cập.</p>
        <p>Mã tra cứu của bạn: <strong>${trackingUuid}</strong></p>
        <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 20px 0;" />
        <p style="color: #888; font-size: 11px; text-align: center;">
          Hội đồng quản lý TVU Fund xin chân thành cảm ơn tấm lòng hảo tâm của quý vị.
        </p>
      </div>
    `,
  };

  await sendMailWrapper(mailOptions);
};
