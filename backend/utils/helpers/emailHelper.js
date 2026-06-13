import fs from "fs";
import path from "path";

/**
 * Gửi email thông báo (mã OTP, thông tin tài khoản...)
 * Hỗ trợ chế độ gửi thực tế qua SMTP (nếu cấu hình) hoặc ghi log ra file trong development.
 * 
 * @param {Object} options
 * @param {string} options.to - Địa chỉ email người nhận
 * @param {string} options.subject - Tiêu đề email
 * @param {string} options.html - Nội dung email định dạng HTML
 * @returns {Promise<boolean>}
 */
export const sendEmail = async ({ to, subject, html }) => {
  const timestamp = new Date().toLocaleString("vi-VN");
  console.log(`\n================= EMAIL LOG (${timestamp}) =================`);
  console.log(`TO: ${to}`);
  console.log(`SUBJECT: ${subject}`);
  console.log(`===========================================================`);

  // Tạo thư mục logs nếu chưa tồn tại
  const logsDir = path.join(process.cwd(), "logs");
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }

  // Nội dung ghi log file
  const logContent = `
===========================================================
TIME: ${timestamp}
TO: ${to}
SUBJECT: ${subject}
BODY:
${html}
===========================================================\n`;

  try {
    fs.appendFileSync(path.join(logsDir, "emails.log"), logContent, "utf8");
    console.log(`[Email Helper] Nội dung email đã được lưu tại: logs/emails.log`);
  } catch (err) {
    console.error("[Email Helper] Lỗi khi ghi log email ra file:", err.message);
  }

  // Nếu có đủ thông tin SMTP, thử gửi thực tế bằng nodemailer
  if (
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  ) {
    try {
      const nodemailer = await import("nodemailer");
      const transporter = nodemailer.default.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === "true", // true cho port 465, false cho 587
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const fromName = process.env.SMTP_FROM_NAME || "TVU Development Fund";
      const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;

      await transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to,
        subject,
        html,
      });

      console.log(`[Email Helper] Gửi email qua SMTP đến ${to} thành công!`);
      return true;
    } catch (err) {
      console.error("[Email Helper] Lỗi gửi email qua SMTP Nodemailer:", err.message);
    }
  } else {
    console.log("[Email Helper] Chưa cấu hình đầy đủ SMTP trong .env. Sử dụng log file.");
  }

  return true;
};
