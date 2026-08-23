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

export const isEmailConfigured = isConfigured;

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

// 16. Thông báo quỹ mới cho tất cả người dùng vai trò 4
export const sendNewFundNotificationEmail = async (toEmail, hoTen, fundData) => {
  const { tenQuy, moTa, soTienMucTieu, loaiHoTro, hanNopDon, dieuKienTomTat } = fundData;

  const formatMoney = (val) => {
    if (!val) return 'Chưa xác định';
    return parseFloat(val).toLocaleString('vi-VN') + ' VNĐ';
  };

  const loaiHoTroLabels = {
    'Tai tro khong hoan lai': 'Tài trợ không hoàn lại',
    'Tai tro co thu hoi': 'Tài trợ có thu hồi',
    'Cho vay': 'Cho vay',
  };

  const mailOptions = {
    from: process.env.MAIL_FROM || 'TVU Fund <no-reply@tvufund.com>',
    to: toEmail,
    subject: `[TVU Fund] Quỹ mới "${tenQuy}" vừa được khởi tạo`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 550px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px;">
        <h2 style="color: #1a5276; text-align: center;">QUỸ MỚI ĐƯỢC KHỞI TẠO</h2>
        <p>Xin chào <strong>${hoTen}</strong>,</p>
        <p>Hệ thống vừa tiếp nhận một quỹ hỗ trợ mới. Dưới đây là thông tin chi tiết:</p>
        <table style="width:100%; background:#eaf2f8; border-radius:8px; padding:16px; margin: 20px 0; border-collapse: collapse;">
          <tr>
            <td style="padding: 6px 8px;"><strong>Tên quỹ:</strong></td>
            <td style="padding: 6px 8px; color: #1a5276; font-weight: bold;">${tenQuy}</td>
          </tr>
          ${moTa ? `<tr>
            <td style="padding: 6px 8px;"><strong>Mô tả:</strong></td>
            <td style="padding: 6px 8px;">${moTa}</td>
          </tr>` : ''}
          <tr>
            <td style="padding: 6px 8px;"><strong>Mục tiêu:</strong></td>
            <td style="padding: 6px 8px; color: #27ae60; font-weight: bold;">${formatMoney(soTienMucTieu)}</td>
          </tr>
          <tr>
            <td style="padding: 6px 8px;"><strong>Hình thức hỗ trợ:</strong></td>
            <td style="padding: 6px 8px;">${loaiHoTroLabels[loaiHoTro] || loaiHoTro || 'Chưa xác định'}</td>
          </tr>
          ${hanNopDon ? `<tr>
            <td style="padding: 6px 8px;"><strong>Hạn nộp đơn:</strong></td>
            <td style="padding: 6px 8px;">${hanNopDon}</td>
          </tr>` : ''}
          ${dieuKienTomTat ? `<tr>
            <td style="padding: 6px 8px;"><strong>Điều kiện:</strong></td>
            <td style="padding: 6px 8px;">${dieuKienTomTat}</td>
          </tr>` : ''}
        </table>
        <p>Bạn có thể truy cập hệ thống để xem chi tiết và nộp đơn đăng ký hỗ trợ.</p>
        <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 20px 0;" />
        <p style="color: #888; font-size: 11px; text-align: center;">
          Đây là email tự động từ hệ thống TVU Fund, vui lòng không phản hồi email này.
        </p>
      </div>
    `,
  };

  await sendMailWrapper(mailOptions);
};

// 13. Gửi email biên lai xác nhận tài trợ khi kế toán duyệt
export const sendSponsorshipReceiptEmail = async (toEmail, data) => {
  const {
    soBienLai,
    ngayXacNhan,
    tenNhaTaiTro,
    loaiNhaTaiTro,
    email: donorEmail,
    soDienThoai,
    diaChi,
    soTien,
    hinhThuc,
    maGiaoDich,
    ngayTaiTro,
    tenQuy,
    tenNguoiXacNhan,
  } = data;

  const formatCurrency = (val) =>
    parseFloat(val).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }).replace(/\s/g, ' ');

  const formatDate = (d) => {
    if (!d) return 'N/A';
    const date = new Date(d);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const loiCamOn = `Quỹ Phát triển Đại học Trà Vinh xin chân thành cảm ơn sự đóng góp quý báu của Quý vị. Đây không chỉ là một khoản hỗ trợ tài chính, mà còn là niềm tin và động lực để nhà trường tiếp tục hành trình ươm mầm tri thức, đồng hành cùng sinh viên trên con đường học tập và nghiên cứu.`;

  const mailOptions = {
    from: process.env.MAIL_FROM || 'TVU Fund <no-reply@tvufund.com>',
    to: toEmail,
    subject: `[TVU Fund] Biên lai xác nhận tài trợ ${soBienLai}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 0; overflow: hidden;">

        <!-- HEADER -->
        <div style="background: #1a2f5e; color: #fff; padding: 24px 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 20px; letter-spacing: 1px;">BIÊN LAI XÁC NHẬN TÀI TRỢ</h1>
          <p style="margin: 6px 0 0; font-size: 13px; opacity: 0.85;">Quỹ Phát triển Đại học Trà Vinh</p>
        </div>

        <div style="padding: 24px 20px;">

          <!-- SO BIEN LAI & NGAY -->
          <div style="text-align: center; margin-bottom: 20px;">
            <p style="margin: 0; font-size: 13px; color: #888;">Số biên lai</p>
            <p style="margin: 4px 0 0; font-size: 20px; font-weight: bold; color: #1a2f5e; letter-spacing: 2px;">${soBienLai}</p>
            <p style="margin: 8px 0 0; font-size: 13px; color: #555;">Ngày xác nhận: <strong>${formatDate(ngayXacNhan)}</strong></p>
          </div>

          <hr style="border: 0; border-top: 1px dashed #ccc; margin: 16px 0;" />

          <!-- THONG TIN NHA TAI TRO -->
          <h3 style="margin: 0 0 12px; font-size: 14px; color: #1a2f5e; text-transform: uppercase; letter-spacing: 1px;">Thông tin nhà tài trợ</h3>
          <table style="width: 100%; font-size: 13px; margin-bottom: 20px;">
            <tr>
              <td style="padding: 4px 0; color: #666; width: 130px;">Họ tên / Tổ chức</td>
              <td style="padding: 4px 0; font-weight: bold;">${tenNhaTaiTro || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #666;">Loại</td>
              <td style="padding: 4px 0;">${loaiNhaTaiTro || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #666;">Email</td>
              <td style="padding: 4px 0;">${donorEmail || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #666;">SĐT</td>
              <td style="padding: 4px 0;">${soDienThoai || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #666;">Địa chỉ</td>
              <td style="padding: 4px 0;">${diaChi || 'N/A'}</td>
            </tr>
          </table>

          <hr style="border: 0; border-top: 1px dashed #ccc; margin: 16px 0;" />

          <!-- CHI TIET KHOAN TAI TRO -->
          <h3 style="margin: 0 0 12px; font-size: 14px; color: #1a2f5e; text-transform: uppercase; letter-spacing: 1px;">Chi tiết khoản tài trợ</h3>
          <table style="width: 100%; font-size: 13px; margin-bottom: 20px;">
            <tr>
              <td style="padding: 4px 0; color: #666; width: 130px;">Số tiền</td>
              <td style="padding: 4px 0; font-size: 16px; font-weight: bold; color: #28a745;">${formatCurrency(soTien)}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #666;">Hình thức</td>
              <td style="padding: 4px 0;">${hinhThuc || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #666;">Mã GD ngân hàng</td>
              <td style="padding: 4px 0;">${maGiaoDich || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #666;">Ngày tài trợ</td>
              <td style="padding: 4px 0;">${formatDate(ngayTaiTro)}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #666;">Quỹ nhận</td>
              <td style="padding: 4px 0; font-weight: bold;">${tenQuy || 'N/A'}</td>
            </tr>
          </table>

          <hr style="border: 0; border-top: 1px dashed #ccc; margin: 16px 0;" />

          <!-- LOI CAM ON -->
          <h3 style="margin: 0 0 12px; font-size: 14px; color: #1a2f5e; text-transform: uppercase; letter-spacing: 1px;">Lời cảm ơn</h3>
          <p style="font-size: 13px; line-height: 1.7; color: #333; font-style: italic; background: #f9f9f9; padding: 14px 16px; border-radius: 6px; border-left: 3px solid #1a2f5e;">
            ${loiCamOn}
          </p>

          <hr style="border: 0; border-top: 1px dashed #ccc; margin: 16px 0;" />

          <!-- XAC NHAN -->
          <h3 style="margin: 0 0 12px; font-size: 14px; color: #1a2f5e; text-transform: uppercase; letter-spacing: 1px;">Xác nhận</h3>
          <table style="width: 100%; font-size: 13px;">
            <tr>
              <td style="padding: 4px 0; color: #666; width: 130px;">Người xác nhận</td>
              <td style="padding: 4px 0; font-weight: bold;">${tenNguoiXacNhan || 'Kế toán'}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #666;">Trạng thái</td>
              <td style="padding: 4px 0;"><span style="background: #28a745; color: #fff; padding: 2px 10px; border-radius: 4px; font-size: 12px;">Đã duyệt</span></td>
            </tr>
          </table>

        </div>

        <!-- FOOTER -->
        <div style="background: #f5f5f5; padding: 16px 20px; text-align: center; border-top: 1px solid #e0e0e0;">
          <p style="margin: 0; font-size: 11px; color: #888;">
            Đây là biên lai điện tử, không cần đóng dấu.<br/>
            Mọi thắc mắc liên hệ: <a href="mailto:quyphattrien@tvu.edu.vn" style="color: #1a2f5e;">quyphattrien@tvu.edu.vn</a>
          </p>
        </div>

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

// 4b. Gửi OTP xác minh email cho khách đề xuất chương trình
export const sendProposalOTPEmail = async (toEmail, hoTen, otpCode, trackingUuid) => {
  const mailOptions = {
    from: process.env.MAIL_FROM || 'TVU Fund <no-reply@tvufund.com>',
    to: toEmail,
    subject: '[TVU Fund] Mã xác thực OTP đề xuất chương trình',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px;">
        <h2 style="color: #28a745; text-align: center;">XÁC MINH ĐỀ XUẤT CHƯƠNG TRÌNH</h2>
        <p>Xin chào <strong>${hoTen}</strong>,</p>
        <p>Hệ thống Quỹ Phát triển Trà Vinh (TVU Fund) đã nhận được đề xuất chương trình của bạn.</p>
        <p>Để gửi đề xuất tới hội đồng xét duyệt, vui lòng sử dụng mã xác thực OTP dưới đây:</p>
        <div style="font-size: 32px; font-weight: bold; color: #28a745; 
                    letter-spacing: 8px; text-align: center; padding: 16px;
                    background: #f4faf6; border-radius: 8px; margin: 16px 0; border: 1px dashed #28a745;">
          ${otpCode}
        </div>
        <p>Mã có hiệu lực trong <strong>30 phút</strong>. Tuyệt đối không chia sẻ mã này cho người khác.</p>
        <p>Mã tra cứu đề xuất của bạn: <strong>${trackingUuid}</strong></p>
        <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 20px 0;" />
        <p style="color: #888; font-size: 11px; text-align: center;">
          Hệ thống TVU Fund chân thành cảm ơn sự đóng góp của quý nhà tài trợ.
        </p>
      </div>
    `,
  };

  await sendMailWrapper(mailOptions);
};

// 4c. Gửi thông báo tài khoản sau khi OTP đề xuất xác minh thành công
export const sendProposalCreatedEmail = async (toEmail, hoTen, matKhau, trackingUuid) => {
  const mailOptions = {
    from: process.env.MAIL_FROM || 'TVU Fund <no-reply@tvufund.com>',
    to: toEmail,
    subject: '[TVU Fund] Đề xuất chương trình đã được gửi thành công',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px;">
        <h2 style="color: #28a745; text-align: center;">ĐỀ XUẤT CỦA BẠN ĐÃ ĐƯỢC TIẾP NHẬN</h2>
        <p>Xin chào <strong>${hoTen}</strong>,</p>
        <p>Đề xuất chương trình của bạn đã được xác minh email và chuyển tới Hội đồng xét duyệt ở trạng thái <strong>Chờ duyệt</strong>.</p>
        <p>Hệ thống đã tự động tạo cho bạn tài khoản để theo dõi đề xuất:</p>
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
          Hệ thống TVU Fund chân thành cảm ơn sự đóng góp của quý nhà tài trợ.
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
