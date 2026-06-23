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

const validateBankAccountNumber = (accountNumber) => {
  const accountRegex = /^[0-9]{6,20}$/;
  return accountRegex.test(accountNumber.trim());
};

const isEmailDeliveryError = (error) => {
  return error?.code === "EMAIL_NOT_CONFIGURED" || error?.code === "EMAIL_SEND_FAILED";
};
const GUEST_OTP_EXPIRY_MINUTES = 30;

const sendEmailErrorResponse = (res, action = "gửi mã OTP") => {
  return res.status(500).json({
    success: false,
    message: `Không thể ${action} qua email thật. Vui lòng kiểm tra cấu hình SMTP và thử lại.`
  });
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

const getGuestOtpSecret = () => (
  process.env.GUEST_OTP_SECRET ||
  process.env.JWT_SECRET ||
  "tvu-fund-management-guest-otp-secret"
);

const hashGuestOtp = (email, trackingUuid, otpCode) => (
  crypto
    .createHmac("sha256", getGuestOtpSecret())
    .update(`${email}:${trackingUuid}:${otpCode}`)
    .digest("hex")
);

const createGuestOtpExpiresAt = () => (
  new Date(Date.now() + GUEST_OTP_EXPIRY_MINUTES * 60 * 1000)
);

const signGuestOtpPayload = (payload) => {
  const encodedPayload = Buffer
    .from(JSON.stringify(payload), "utf8")
    .toString("base64url");
  const signature = crypto
    .createHmac("sha256", getGuestOtpSecret())
    .update(encodedPayload)
    .digest("base64url");
  return `${encodedPayload}.${signature}`;
};

const timingSafeStringEqual = (left, right) => {
  const leftBuffer = Buffer.from(left || "");
  const rightBuffer = Buffer.from(right || "");
  return leftBuffer.length === rightBuffer.length &&
    crypto.timingSafeEqual(leftBuffer, rightBuffer);
};

const readGuestOtpPayload = (token, options = {}) => {
  if (!token || typeof token !== "string" || !token.includes(".")) {
    throw new Error("OTP_INVALID_OR_NOT_FOUND");
  }

  const [encodedPayload, signature] = token.split(".");
  const expectedSignature = crypto
    .createHmac("sha256", getGuestOtpSecret())
    .update(encodedPayload)
    .digest("base64url");

  if (!timingSafeStringEqual(signature, expectedSignature)) {
    throw new Error("OTP_INVALID_OR_NOT_FOUND");
  }

  const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"));
  if (!options.allowExpired && (!payload.expiresAt || Date.now() > new Date(payload.expiresAt).getTime())) {
    throw new Error("OTP_EXPIRED");
  }

  return payload;
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

    const requiredApplicationFields = [
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
    ];
    const normalizedEmail = guestEmail ? guestEmail.trim().toLowerCase() : "";

    if (requiredApplicationFields.some((value) => value === undefined || value === null || String(value).trim() === "")) {
      return res.status(400).json({
        success: false,
        message: "Vui long nhap day du thong tin ca nhan, ngan hang, quy, ly do, so tien va file minh chung"
      });
    }

    // 1. Validate bắt buộc
    if (!guestHoTen || !guestEmail || !quyId || !lyDo || !soTienDeNghi || !taiLieuDinhKem) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ thông tin bắt buộc: Họ tên, Email, Quỹ, Lý do, Số tiền và File minh chứng"
      });
    }

    if (!validateEmail(normalizedEmail)) {
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

    if (!validateBankAccountNumber(guestSoTaiKhoan)) {
      return res.status(400).json({
        success: false,
        message: "So tai khoan ngan hang khong hop le"
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
    const otpExpiresAt = createGuestOtpExpiresAt();
    const trackingUuid = crypto.randomUUID();

    const pendingApplication = {
      guestHoTen: guestHoTen.trim(),
      guestEmail: normalizedEmail,
      guestSoDienThoai: guestSoDienThoai.trim(),
      guestMssv: guestMssv.trim(),
      guestKhoa: guestKhoa.trim(),
      guestLop: guestLop.trim(),
      guestSoTaiKhoan: guestSoTaiKhoan.trim(),
      guestNganHang: guestNganHang.trim(),
      guestChuTaiKhoan: guestChuTaiKhoan.trim().toUpperCase(),
      quyId,
      lyDo: lyDo.trim(),
      soTienDeNghi: amount,
      taiLieuDinhKem: taiLieuDinhKem.trim(),
      trackingUuid
    };
    const otpToken = signGuestOtpPayload({
      type: "application",
      email: normalizedEmail,
      trackingUuid,
      otpHash: hashGuestOtp(normalizedEmail, trackingUuid, otpCode),
      expiresAt: otpExpiresAt.toISOString(),
      application: pendingApplication
    });

    await sendOTPEmail(
      normalizedEmail,
      guestHoTen.trim(),
      otpCode,
      trackingUuid
    );

    return res.status(201).json({
      success: true,
      message: "Da gui ma OTP ve email. Ho so chi duoc luu sau khi xac thuc OTP thanh cong.",
      data: {
        email: normalizedEmail,
        trackingUuid,
        otpToken
      }
    });

  } catch (error) {
    console.error("Lỗi submitGuestApplication:", error);
    if (isEmailDeliveryError(error)) {
      return sendEmailErrorResponse(res, "gửi mã OTP xác thực");
    }

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

    if (!guestHoTen || !guestEmail || !quyId || !soTien) {
      return res.status(400).json({
        success: false,
        message: "Vui long nhap day du thong tin bat buoc: Ho ten, Email, Quy, So tien"
      });
    }

    const normalizedEmail = guestEmail.trim().toLowerCase();

    if (!validateEmail(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Email khong dung dinh dang"
      });
    }

    if (guestSoDienThoai && !validatePhone(guestSoDienThoai)) {
      return res.status(400).json({
        success: false,
        message: "So dien thoai khong dung dinh dang (10-11 so)"
      });
    }

    const amount = parseFloat(soTien);
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "So tien dong gop phai lon hon 0"
      });
    }

    const fund = await FundModel.getFundById(quyId);
    if (!fund) {
      return res.status(404).json({
        success: false,
        message: "Khong tim thay quy dong gop nay"
      });
    }

    if (fund.trang_thai !== "Dang hoat dong") {
      return res.status(400).json({
        success: false,
        message: "Quy dong gop hien dang tam dung tiep nhan dong gop"
      });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = createGuestOtpExpiresAt();
    const trackingUuid = crypto.randomUUID();
    const normalizedMethod = ["Tien mat", "Chuyen khoan", "Khac"].includes(hinhThuc) ? hinhThuc : "Khac";
    const pendingDonation = {
      guestHoTen: guestHoTen.trim(),
      guestEmail: normalizedEmail,
      guestSoDienThoai: guestSoDienThoai ? guestSoDienThoai.trim() : null,
      guestToChuc: guestToChuc ? guestToChuc.trim() : null,
      guestDiaChi: guestDiaChi ? guestDiaChi.trim() : null,
      quyId,
      soTien: amount,
      hinhThuc: normalizedMethod,
      maGiaoDich: maGiaoDich ? maGiaoDich.trim() : null,
      ngayTaiTro: new Date().toISOString().slice(0, 10),
      chungTu: chungTu ? chungTu.trim() : null,
      ghiChu: ghiChu ? ghiChu.trim() : null,
      trackingUuid
    };
    const otpToken = signGuestOtpPayload({
      type: "donation",
      email: normalizedEmail,
      trackingUuid,
      otpHash: hashGuestOtp(normalizedEmail, trackingUuid, otpCode),
      expiresAt: otpExpiresAt.toISOString(),
      donation: pendingDonation
    });

    await sendDonationOTPEmail(
      normalizedEmail,
      guestHoTen.trim(),
      otpCode,
      trackingUuid
    );

    return res.status(201).json({
      success: true,
      message: "Da gui ma OTP tai tro ve email. Khoan tai tro chi duoc luu sau khi xac thuc OTP thanh cong.",
      data: {
        email: normalizedEmail,
        trackingUuid,
        otpToken
      }
    });
  } catch (error) {
    console.error("Loi submitGuestDonation:", error);
    if (isEmailDeliveryError(error)) {
      return sendEmailErrorResponse(res, "gui ma OTP xac thuc");
    }

    return res.status(500).json({
      success: false,
      message: "Loi he thong khi dang ky dong gop tai tro"
    });
  }
};

export const resendGuestOtp = async (req, res) => {
  try {
    const { email, type, otpToken } = req.body;

    if (!email || !type || !otpToken) {
      return res.status(400).json({
        success: false,
        message: "Vui long cung cap email, loai don va ma phien OTP"
      });
    }

    if (type !== "application" && type !== "donation") {
      return res.status(400).json({
        success: false,
        message: "Loai don khong hop le"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const pending = readGuestOtpPayload(otpToken, { allowExpired: true });

    if (pending.type !== type || pending.email !== normalizedEmail) {
      return res.status(400).json({
        success: false,
        message: "Thong tin gui lai OTP khong khop voi phien dang xac thuc"
      });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = createGuestOtpExpiresAt();
    const nextPayload = {
      ...pending,
      otpHash: hashGuestOtp(normalizedEmail, pending.trackingUuid, otpCode),
      expiresAt: otpExpiresAt.toISOString()
    };
    const nextOtpToken = signGuestOtpPayload(nextPayload);

    if (type === "application") {
      await sendOTPEmail(
        normalizedEmail,
        pending.application?.guestHoTen || "Khach vang lai",
        otpCode,
        pending.trackingUuid
      );
    } else {
      await sendDonationOTPEmail(
        normalizedEmail,
        pending.donation?.guestHoTen || "Nha tai tro",
        otpCode,
        pending.trackingUuid
      );
    }

    return res.status(200).json({
      success: true,
      message: "Da gui lai ma OTP moi ve email",
      data: {
        email: normalizedEmail,
        trackingUuid: pending.trackingUuid,
        otpToken: nextOtpToken,
        expiresInMinutes: GUEST_OTP_EXPIRY_MINUTES
      }
    });
  } catch (error) {
    console.error("Loi resendGuestOtp:", error);

    if (error.message === "OTP_INVALID_OR_NOT_FOUND") {
      return res.status(400).json({
        success: false,
        message: "Phien xac thuc OTP khong hop le. Vui long gui lai form."
      });
    }

    if (isEmailDeliveryError(error)) {
      return sendEmailErrorResponse(res, "gui lai ma OTP");
    }

    return res.status(500).json({
      success: false,
      message: "Loi he thong khi gui lai ma OTP"
    });
  }
};
/**
 * POST /api/guest/verify-otp
 * Xác thực mã OTP và kích hoạt luồng di chuyển dữ liệu
 */
export const verifyOtp = async (req, res) => {
  try {
    const { email, otpCode, type, otpToken } = req.body;

    if (!email || !otpCode || !type) {
      return res.status(400).json({
        success: false,
        message: "Vui long cung cap day du thong tin: Email, ma OTP va loai don"
      });
    }

    if (type !== "application" && type !== "donation") {
      return res.status(400).json({
        success: false,
        message: "Loai don khong hop le"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedOtp = otpCode.trim();
    const plainPassword = generateRandomPassword();

    if (type === "application") {
      let result;
      let guestName;

      if (otpToken) {
        const pending = readGuestOtpPayload(otpToken);

        if (pending.type !== "application" || pending.email !== normalizedEmail) {
          return res.status(400).json({
            success: false,
            message: "Ma xac thuc OTP khong dung hoac thong tin email khong khop"
          });
        }

        const expectedHash = hashGuestOtp(normalizedEmail, pending.trackingUuid, normalizedOtp);
        if (!timingSafeStringEqual(pending.otpHash, expectedHash)) {
          return res.status(400).json({
            success: false,
            message: "Ma xac thuc OTP khong dung hoac da het hieu luc"
          });
        }

        result = await GuestModel.verifyOTPAndCreateApplication(
          pending.application,
          plainPassword
        );
        guestName = pending.application.guestHoTen;
      } else {
        const guestApp = await GuestModel.findApplicationByEmailAndOtp(normalizedEmail, normalizedOtp);
        if (!guestApp) {
          return res.status(400).json({
            success: false,
            message: "Ma xac thuc OTP khong dung hoac don da duoc xac minh truoc do"
          });
        }

        result = await GuestModel.verifyOTPAndMigrateApplication(
          normalizedEmail,
          normalizedOtp,
          plainPassword
        );
        guestName = guestApp.guest_hoten;
      }

      await sendAccountCreatedEmail(
        normalizedEmail,
        guestName,
        plainPassword,
        result.trackingUuid
      );

      return res.status(200).json({
        success: true,
        message: "Xac thuc OTP thanh cong. Ho so da duoc luu va gui den bo phan duyet.",
        data: {
          trackingUuid: result.trackingUuid,
          email: normalizedEmail,
          tempPassword: plainPassword,
          autoCreatedUser: true
        }
      });
    }

    let result;
    let guestName;
    let donationAmount;

    if (otpToken) {
      const pending = readGuestOtpPayload(otpToken);

      if (pending.type !== "donation" || pending.email !== normalizedEmail) {
        return res.status(400).json({
          success: false,
          message: "Ma xac thuc OTP khong dung hoac thong tin email khong khop"
        });
      }

      const expectedHash = hashGuestOtp(normalizedEmail, pending.trackingUuid, normalizedOtp);
      if (!timingSafeStringEqual(pending.otpHash, expectedHash)) {
        return res.status(400).json({
          success: false,
          message: "Ma xac thuc OTP khong dung hoac da het hieu luc"
        });
      }

      result = await GuestModel.verifyOTPAndCreateDonation(
        pending.donation,
        plainPassword
      );
      guestName = pending.donation.guestHoTen;
      donationAmount = pending.donation.soTien;
    } else {
      const guestDon = await GuestModel.findDonationByEmailAndOtp(normalizedEmail, normalizedOtp);
      if (!guestDon) {
        return res.status(400).json({
          success: false,
          message: "Ma xac thuc OTP khong dung hoac khoan dong gop da duoc xac minh truoc do"
        });
      }

      result = await GuestModel.verifyOTPAndMigrateDonation(
        normalizedEmail,
        normalizedOtp,
        plainPassword
      );
      guestName = guestDon.guest_hoten;
      donationAmount = guestDon.sotien;
    }

    await sendDonationCreatedEmail(
      normalizedEmail,
      guestName,
      plainPassword,
      donationAmount,
      result.trackingUuid
    );

    return res.status(200).json({
      success: true,
      message: "Xac thuc OTP tai tro thanh cong. Khoan tai tro da duoc luu va chuyen qua he thong duyet giao dich.",
      data: {
        trackingUuid: result.trackingUuid,
        email: normalizedEmail,
        tempPassword: plainPassword,
        autoCreatedUser: true
      }
    });
  } catch (error) {
    console.error("Loi verifyOtp:", error);
    if (error.message === "OTP_EXPIRED") {
      return res.status(400).json({
        success: false,
        message: "Ma OTP da het hieu luc"
      });
    }

    if (error.message === "OTP_ALREADY_VERIFIED") {
      return res.status(400).json({
        success: false,
        message: "Ma OTP nay da duoc xac thuc truoc do"
      });
    }

    if (isEmailDeliveryError(error)) {
      return sendEmailErrorResponse(res, "gui email xac nhan");
    }

    return res.status(500).json({
      success: false,
      message: "Loi he thong khi xac thuc ma OTP"
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
