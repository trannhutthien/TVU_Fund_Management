import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import path from 'path';

// Load env variables
dotenv.config({ path: path.join(process.cwd(), '.env') });

const testEmail = async () => {
  const user = process.env.MAIL_USER;
  const pass = process.env.MAIL_PASS;
  const from = process.env.MAIL_FROM || 'TVU Fund <no-reply@tvufund.com>';

  console.log('====== KIỂM TRA SMTP GMAIL ======');
  console.log(`MAIL_USER: ${user}`);
  console.log(`MAIL_PASS: ${pass ? '****' + pass.slice(-4) : 'Chưa thiết lập'}`);
  console.log(`MAIL_FROM: ${from}`);

  if (!user || !pass || user === 'your_gmail@gmail.com' || pass === 'xxxx xxxx xxxx xxxx') {
    console.error('\n❌ LỖI: Bạn chưa cấu hình tài khoản Gmail hoặc App Password thật trong file backend/.env!');
    console.log('\nVui lòng mở file backend/.env và cập nhật:');
    console.log('MAIL_USER=email_cua_ban@gmail.com');
    console.log('MAIL_PASS=ma_app_password_16_ky_tu_khong_co_khoang_trang');
    return;
  }

  try {
    console.log('\n🔄 Đang kết nối tới Gmail SMTP...');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user,
        pass,
      },
    });

    // Xác thực cấu hình
    await transporter.verify();
    console.log('✅ Kết nối SMTP thành công!');

    // Gửi email thử nghiệm
    console.log(`🔄 Đang gửi email test thử nghiệm tới ${user}...`);
    const info = await transporter.sendMail({
      from,
      to: user,
      subject: 'Kiểm tra cấu hình SMTP TVU Fund',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px;">
          <h2 style="color: #28a745; text-align: center;">KẾT NỐI SMTP THÀNH CÔNG!</h2>
          <p>Xin chào,</p>
          <p>Hệ thống TVU Fund đã kết nối thành công tới Gmail của bạn qua SMTP.</p>
          <p>Từ bây giờ, hệ thống có thể gửi mã OTP và thông tin tài khoản đến các email của người dùng thật.</p>
          <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 20px 0;" />
          <p style="color: #888; font-size: 11px; text-align: center;">
            Đây là email tự động gửi đến chính bạn để xác minh cấu hình.
          </p>
        </div>
      `,
    });

    console.log(`✅ Đã gửi email test thành công! Message ID: ${info.messageId}`);
    console.log(`Vui lòng kiểm tra hộp thư của email ${user} để xác nhận.`);
  } catch (error) {
    console.error('\n❌ Gửi email thất bại!');
    console.error('Chi tiết lỗi:', error);
    console.log('\n--- Hướng dẫn khắc phục ---');
    console.log('1. Đảm bảo bạn đã bật "Xác minh 2 bước" (2-Step Verification) trên tài khoản Google.');
    console.log('2. Đảm bảo bạn đang sử dụng "Mật khẩu ứng dụng" (App Password) gồm 16 ký tự, KHÔNG phải mật khẩu đăng nhập Gmail thông thường.');
    console.log('3. Kiểm tra kết nối mạng của bạn.');
  }
};

testEmail();
