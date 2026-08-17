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

let cachedTransporter = null;

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
      connectionTimeout: 30000,
      greetingTimeout: 15000,
      socketTimeout: 30000,
    };
  }

  return {
    service: process.env.MAIL_SERVICE || "gmail",
    auth,
    connectionTimeout: 30000,
    greetingTimeout: 15000,
    socketTimeout: 30000,
  };
};

const getTransporter = () => {
  if (!cachedTransporter) {
    cachedTransporter = nodemailer.createTransport(createTransportConfig());
  }
  return cachedTransporter;
};

const sendMailWrapper = async (mailOptions) => {
  try {
    const transporter = getTransporter();
    await transporter.sendMail(mailOptions);
    return true;
  } catch (err) {
    if (err.code === EMAIL_NOT_CONFIGURED) {
      return false;
    }
    console.error("[Email Service] SMTP error:", err.message);
    cachedTransporter = null;
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

// 5. Gửi mật khẩu mới khi user quên mật khẩu
export const sendPasswordResetEmail = async (toEmail, hoTen, newPassword) => {
  const mailOptions = {
    from: process.env.MAIL_FROM || 'TVU Fund <no-reply@tvufund.com>',
    to: toEmail,
    subject: '[TVU Fund] Khôi phục mật khẩu',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px;">
        <h2 style="color: #1a2f5e; text-align: center;">KHÔI PHỤC MẬT KHẨU</h2>
        <p>Xin chào <strong>${hoTen}</strong>,</p>
        <p>Bạn đã yêu cầu khôi phục mật khẩu cho tài khoản TVU Fund. Mật khẩu mới của bạn là:</p>
        <div style="font-size: 24px; font-weight: bold; color: #d9534f;
                    letter-spacing: 6px; text-align: center; padding: 16px;
                    background: #fdf2f2; border-radius: 8px; margin: 16px 0; border: 1px dashed #d9534f;">
          ${newPassword}
        </div>
        <p style="color: #d9534f; font-size: 13px;">* Lưu ý: Vui lòng đăng nhập và đổi mật khẩu ngay để bảo mật tài khoản.</p>
        <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 20px 0;" />
        <p style="color: #888; font-size: 11px; text-align: center;">
          Đây là email tự động từ hệ thống TVU Fund, vui lòng không phản hồi email này.
        </p>
      </div>
    `,
  };

  await sendMailWrapper(mailOptions);
};

// 6. Thong bao ke toan: Sinh vien nop minh chung tra tien
export const sendPaymentProofNotificationEmail = async (toEmail, hoTen, kyThu, soTien, hopDongId) => {
  const mailOptions = {
    from: process.env.MAIL_FROM || 'TVU Fund <no-reply@tvufund.com>',
    to: toEmail,
    subject: `[TVU Fund] Sinh vien nop minh chung tra tien ky ${kyThu}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px;">
        <h2 style="color: #1a2f5e; text-align: center;">SINH VIEN NOP MINH CHUNG TRA TIEN</h2>
        <p>Xin chao <strong>${hoTen}</strong>,</p>
        <p>Sinh vien da nop minh chung thanh toan cho ky tra no:</p>
        <table style="width:100%; background:#f0f4ff; border-radius:8px; padding:16px; margin: 20px 0;">
          <tr>
            <td><strong>Ky thu:</strong></td>
            <td>Ky ${kyThu}</td>
          </tr>
          <tr>
            <td><strong>So tien:</strong></td>
            <td style="font-size:18px; color:#28a745;"><strong>${parseFloat(soTien).toLocaleString("vi-VN")} VNĐ</strong></td>
          </tr>
        </table>
        <p>Vui long dang nhap he thong de xem minh chung va xac nhan thanh toan.</p>
        <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 20px 0;" />
        <p style="color: #888; font-size: 11px; text-align: center;">
          Day la email tu dong tu he thong TVU Fund, vui long khong phan hoi email nay.
        </p>
      </div>
    `,
  };

  await sendMailWrapper(mailOptions);
};

// 7. Thong bao sinh vien: Ke toan xac nhan thanh toan
export const sendPaymentConfirmedEmail = async (toEmail, hoTen, kyThu, soTien) => {
  const mailOptions = {
    from: process.env.MAIL_FROM || 'TVU Fund <no-reply@tvufund.com>',
    to: toEmail,
    subject: `[TVU Fund] Xac nhan thanh toan ky ${kyThu} thanh cong`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px;">
        <h2 style="color: #28a745; text-align: center;">XAC NHAN THANH TOAN THANH CONG</h2>
        <p>Xin chao <strong>${hoTen}</strong>,</p>
        <p>Ke toan da xac nhan thanh toan cua ban cho ky tra no:</p>
        <table style="width:100%; background:#f4faf6; border-radius:8px; padding:16px; margin: 20px 0;">
          <tr>
            <td><strong>Ky thu:</strong></td>
            <td>Ky ${kyThu}</td>
          </tr>
          <tr>
            <td><strong>So tien da thanh toan:</strong></td>
            <td style="font-size:18px; color:#28a745;"><strong>${parseFloat(soTien).toLocaleString("vi-VN")} VNĐ</strong></td>
          </tr>
        </table>
        <p>Cam on ban da thanh toan dung han.</p>
        <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 20px 0;" />
        <p style="color: #888; font-size: 11px; text-align: center;">
          Day la email tu dong tu he thong TVU Fund, vui long khong phan hoi email nay.
        </p>
      </div>
    `,
  };

  await sendMailWrapper(mailOptions);
};

// 8. Thong bao sinh vien: Ke toan tu choi minh chung
export const sendPaymentRejectedEmail = async (toEmail, hoTen, kyThu, lyDo) => {
  const mailOptions = {
    from: process.env.MAIL_FROM || 'TVU Fund <no-reply@tvufund.com>',
    to: toEmail,
    subject: `[TVU Fund] Minh chung ky ${kyThu} bi tu choi`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px;">
        <h2 style="color: #d9534f; text-align: center;">MINH CHUNG BI TU CHOI</h2>
        <p>Xin chao <strong>${hoTen}</strong>,</p>
        <p>Ke toan da tu choi minh chung thanh toan cua ban cho ky tra no:</p>
        <table style="width:100%; background:#fdf2f2; border-radius:8px; padding:16px; margin: 20px 0;">
          <tr>
            <td><strong>Ky thu:</strong></td>
            <td>Ky ${kyThu}</td>
          </tr>
          <tr>
            <td><strong>Ly do tu choi:</strong></td>
            <td style="color:#d9534f;">${lyDo || 'Khong ro ly do'}</td>
          </tr>
        </table>
        <p>Vui long nop lai minh chung dung quy cach hoac lien he ke toan de biet them chi tiet.</p>
        <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 20px 0;" />
        <p style="color: #888; font-size: 11px; text-align: center;">
          Day la email tu dong tu he thong TVU Fund, vui long khong phan hoi email nay.
        </p>
      </div>
    `,
  };

  await sendMailWrapper(mailOptions);
};

// 9. Nhac truoc 7 ngay: Ky tra no sap den han
export const sendPaymentDueReminderEmail = async (toEmail, hoTen, kyThu, ngayDenHan, soTien) => {
  const mailOptions = {
    from: process.env.MAIL_FROM || 'TVU Fund <no-reply@tvufund.com>',
    to: toEmail,
    subject: `[TVU Fund] Nho tra tien ky ${kyThu} - con 7 ngay`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px;">
        <h2 style="color: #e67e22; text-align: center;">NHAC TRUOC THANH TOAN</h2>
        <p>Xin chao <strong>${hoTen}</strong>,</p>
        <p>Ban co ky tra no sap den han. Vui long thanh toan dung han de tranh bi tinh lai phat:</p>
        <table style="width:100%; background:#fef9f0; border-radius:8px; padding:16px; margin: 20px 0;">
          <tr>
            <td><strong>Ky thu:</strong></td>
            <td>Ky ${kyThu}</td>
          </tr>
          <tr>
            <td><strong>Ngay den han:</strong></td>
            <td style="font-size:16px; color:#e67e22;"><strong>${new Date(ngayDenHan).toLocaleDateString('vi-VN')}</strong></td>
          </tr>
          <tr>
            <td><strong>So tien phai tra:</strong></td>
            <td style="font-size:16px; color:#d9534f;"><strong>${parseFloat(soTien).toLocaleString("vi-VN")} VNĐ</strong></td>
          </tr>
        </table>
        <p>Sau ngay den han, he thong se tu dong tinh lai phat theo Dieu 19.3 Quy che.</p>
        <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 20px 0;" />
        <p style="color: #888; font-size: 11px; text-align: center;">
          Day la email tu dong tu he thong TVU Fund, vui long khong phan hoi email nay.
        </p>
      </div>
    `,
  };

  await sendMailWrapper(mailOptions);
};

// 11. Nghiem thu that bai: Don vay khong dat nghiem thu → can thu hoi von
export const sendNghiemThuThatBaiEmail = async (toEmail, hoTen, soTienCanThuHoi, thoiHan, loaiVay) => {
  const mailOptions = {
    from: process.env.MAIL_FROM || 'TVU Fund <no-reply@tvufund.com>',
    to: toEmail,
    subject: `[TVU Fund] Nghiem thu khong dat - Can thu hoi von`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px;">
        <h2 style="color: #d9534f; text-align: center;">NGHIEM THU KHONG DAT</h2>
        <p>Xin chao <strong>${hoTen}</strong>,</p>
        <p>Don ${loaiVay} cua ban chua dat kiem tra nghiem thu. Vui long lien he Khoa Tai Chinh de duoc huong dan thu hoi von:</p>
        <table style="width:100%; background:#fdf2f2; border-radius:8px; padding:16px; margin: 20px 0;">
          <tr>
            <td><strong>So tien can thu hoi:</strong></td>
            <td style="font-size:18px; color:#d9534f;"><strong>${parseFloat(soTienCanThuHoi).toLocaleString("vi-VN")} VNĐ</strong></td>
          </tr>
          <tr>
            <td><strong>Thoi han hoan tra:</strong></td>
            <td><strong>${thoiHan} thang</strong></td>
          </tr>
          <tr>
            <td><strong>Lai suat:</strong></td>
            <td><strong>0% (khong tinh lai)</strong></td>
          </tr>
        </table>
        <p>Vui long dang nhap he thong de xem chi tiet va nop tien thu hoi dung han.</p>
        <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 20px 0;" />
        <p style="color: #888; font-size: 11px; text-align: center;">
          Day la email tu dong tu he thong TVU Fund, vui long khong phan hoi email nay.
        </p>
      </div>
    `,
  };

  await sendMailWrapper(mailOptions);
};
export const sendPaymentOverdueEmail = async (toEmail, hoTen, kyThu, soNgayQuaHan, tienPhat) => {
  const mailOptions = {
    from: process.env.MAIL_FROM || 'TVU Fund <no-reply@tvufund.com>',
    to: toEmail,
    subject: `[TVU Fund] CANH BAO: Ky ${kyThu} da qua han ${soNgayQuaHan} ngay`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px;">
        <h2 style="color: #d9534f; text-align: center;">CANH BAO QUA HAN</h2>
        <p>Xin chao <strong>${hoTen}</strong>,</p>
        <p>Ky tra no cua ban da qua han. Vui long thanh toan ngay de tranh tich luy lai phat:</p>
        <table style="width:100%; background:#fdf2f2; border-radius:8px; padding:16px; margin: 20px 0;">
          <tr>
            <td><strong>Ky thu:</strong></td>
            <td>Ky ${kyThu}</td>
          </tr>
          <tr>
            <td><strong>So ngay qua han:</strong></td>
            <td style="color:#d9534f;"><strong>${soNgayQuaHan} ngay</strong></td>
          </tr>
          <tr>
            <td><strong>Lai phat:</strong></td>
            <td style="font-size:18px; color:#d9534f;"><strong>${parseFloat(tienPhat).toLocaleString("vi-VN")} VNĐ</strong></td>
          </tr>
        </table>
        <p style="color: #d9534f;">Lai phat duoc tinh theo Cong thuc: Goc con lai x 5.2%/nam x So ngay qua han / 365.</p>
        <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 20px 0;" />
        <p style="color: #888; font-size: 11px; text-align: center;">
          Day la email tu dong tu he thong TVU Fund, vui long khong phan hoi email nay.
        </p>
      </div>
    `,
  };

  await sendMailWrapper(mailOptions);
};
