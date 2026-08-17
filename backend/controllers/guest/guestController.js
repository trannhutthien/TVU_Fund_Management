import crypto from "crypto";
import GuestModel from "../../models/guest/GuestModel.js";
import FundModel from "../../models/funds/FundModel.js";
import {
  sendOTPEmail,
  sendAccountCreatedEmail,
  sendDonationOTPEmail,
  sendDonationCreatedEmail
} from "../../services/emailService.js";

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePhone = (phone) => /^[0-9]{10,11}$/.test(phone.trim());
const validateBankAccountNumber = (n) => /^[0-9]{6,20}$/.test(n.trim());
const isEmailDeliveryError = (e) => e?.code === "EMAIL_NOT_CONFIGURED" || e?.code === "EMAIL_SEND_FAILED";
const GUEST_OTP_EXPIRY_MINUTES = 30;

const sendEmailErrorResponse = (res, action = "gui ma OTP") =>
  res.status(500).json({ success: false, message: `Khong the ${action} qua email. Vui long kiem tra SMTP.` });

const generateRandomPassword = () => {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let pw = "";
  for (let i = 0; i < 12; i++) pw += chars.charAt(Math.floor(Math.random() * chars.length));
  return pw;
};

const getGuestOtpSecret = () =>
  process.env.GUEST_OTP_SECRET || process.env.JWT_SECRET || "tvu-fund-management-guest-otp-secret";

const hashGuestOtp = (email, trackingUuid, otpCode) =>
  crypto.createHmac("sha256", getGuestOtpSecret()).update(`${email}:${trackingUuid}:${otpCode}`).digest("hex");

const createGuestOtpExpiresAt = () => new Date(Date.now() + GUEST_OTP_EXPIRY_MINUTES * 60 * 1000);

const signGuestOtpPayload = (payload) => {
  const encodedPayload = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const signature = crypto.createHmac("sha256", getGuestOtpSecret()).update(encodedPayload).digest("base64url");
  return `${encodedPayload}.${signature}`;
};

const timingSafeStringEqual = (left, right) => {
  const a = Buffer.from(left || "");
  const b = Buffer.from(right || "");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};

const readGuestOtpPayload = (token, options = {}) => {
  if (!token || typeof token !== "string" || !token.includes("."))
    throw new Error("OTP_INVALID_OR_NOT_FOUND");
  const [encodedPayload, signature] = token.split(".");
  const expected = crypto.createHmac("sha256", getGuestOtpSecret()).update(encodedPayload).digest("base64url");
  if (!timingSafeStringEqual(signature, expected)) throw new Error("OTP_INVALID_OR_NOT_FOUND");
  const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"));
  if (!options.allowExpired && (!payload.expiresAt || Date.now() > new Date(payload.expiresAt).getTime()))
    throw new Error("OTP_EXPIRED");
  return payload;
};

// ═══════════════════════════════════════════════════════════════════════════════
// POST /api/guest/yeu-cau — Gui don ho tro vang lai
// ═══════════════════════════════════════════════════════════════════════════════
export const submitGuestApplication = async (req, res) => {
  try {
    const {
      guestHoTen, guestEmail, guestSoDienThoai, guestMssv, guestKhoa, guestLop,
      guestSoTaiKhoan, guestNganHang, guestChuTaiKhoan,
      quyId, tieuDe, lyDo, soTienDeNghi, taiLieuDinhKem, loaiHoTro, tongKinhPhiDuAn,
      laDeTai, formTimestamp, userRole, donViCongTac, soNamCongTac,
    } = req.body;

    // Anti-bot
    if (formTimestamp) {
      const elapsed = Date.now() - new Date(formTimestamp).getTime();
      if (elapsed < 3000)
        return res.status(400).json({ success: false, message: "Vui long doi it nhat 3 giay truoc khi gui form." });
    }

    const normalizedEmail = guestEmail ? guestEmail.trim().toLowerCase() : "";

    // Validate
    const required = [guestHoTen, guestEmail, quyId, lyDo, soTienDeNghi, taiLieuDinhKem];
    const isStudent = userRole === 'sinh_vien' || !userRole;
    if (isStudent) required.push(guestMssv, guestKhoa, guestLop, guestSoTaiKhoan, guestNganHang, guestChuTaiKhoan);
    else required.push(guestSoTaiKhoan, guestNganHang, guestChuTaiKhoan);

    if (required.some(v => v === undefined || v === null || String(v).trim() === ""))
      return res.status(400).json({ success: false, message: "Vui long nhap day du thong tin bat buoc" });
    if (!validateEmail(normalizedEmail))
      return res.status(400).json({ success: false, message: "Email khong dung dinh dang" });
    if (guestSoDienThoai && !validatePhone(guestSoDienThoai))
      return res.status(400).json({ success: false, message: "So dien thoai khong dung dinh dang (10-11 so)" });
    if (!validateBankAccountNumber(guestSoTaiKhoan))
      return res.status(400).json({ success: false, message: "So tai khoan ngan hang khong hop le" });

    const amount = parseFloat(soTienDeNghi);
    if (isNaN(amount) || amount <= 0)
      return res.status(400).json({ success: false, message: "So tien de nghi phai lon hon 0" });

    const validLoaiHoTro = ['Tai tro khong hoan lai', 'Tai tro co thu hoi', 'Cho vay'];
    const resolvedLoaiHoTro = loaiHoTro || 'Tai tro khong hoan lai';
    if (!validLoaiHoTro.includes(resolvedLoaiHoTro))
      return res.status(400).json({ success: false, message: "Loai hinh ho tro khong hop le" });

    let resolvedTongKinhPhiDuAn = tongKinhPhiDuAn ? parseFloat(tongKinhPhiDuAn) : null;
    if (resolvedLoaiHoTro === 'Tai tro co thu hoi') {
      if (!resolvedTongKinhPhiDuAn || isNaN(resolvedTongKinhPhiDuAn) || resolvedTongKinhPhiDuAn <= 0)
        return res.status(400).json({ success: false, message: "Don tai tro thu hoi phai co Tong kinh phi du an > 0", error_code: "THIEU_TONG_KINH_PHI" });
      if (resolvedTongKinhPhiDuAn < amount)
        return res.status(400).json({ success: false, message: "Tong kinh phi du an phai lon hon hoac bang so tien de nghi" });
    }

    // Kiem tra quy
    const fund = await FundModel.getFundById(quyId);
    if (!fund) return res.status(404).json({ success: false, message: "Khong tim thay quy ho tro nay" });
    if (fund.trang_thai !== "Dang hoat dong")
      return res.status(400).json({ success: false, message: "Quy hien dang tam dong nhan don" });
    if (fund.sotienhotrotoida && amount > parseFloat(fund.sotienhotrotoida))
      return res.status(400).json({ success: false, message: `So tien vuot qua muc ho tro toi da cua quy` });
    if (fund.loai_dieu_hanh === "Tap trung - Be chung")
      return res.status(400).json({ success: false, message: "Khong duoc nop don vao Bao tien chung phat trien" });

    // Tao OTP + tracking
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = createGuestOtpExpiresAt();
    const trackingUuid = crypto.randomUUID();

    const validRoles = ['sinh_vien', 'can_bo_truong', 'can_bo_nghi_huu', 'nha_khoa_hoc'];
    const resolvedUserRole = validRoles.includes(userRole) ? userRole : 'sinh_vien';
    let resolvedKhoa = guestKhoa ? guestKhoa.trim() : null;
    let resolvedLop = guestLop ? guestLop.trim() : null;
    if (resolvedUserRole !== 'sinh_vien') {
      resolvedKhoa = donViCongTac ? donViCongTac.trim() : resolvedKhoa;
      resolvedLop = soNamCongTac ? String(soNamCongTac).trim() : null;
    }

    const pendingApplication = {
      guestHoTen: guestHoTen.trim(),
      guestEmail: normalizedEmail,
      guestSoDienThoai: guestSoDienThoai.trim(),
      vaitro: resolvedUserRole,
      guestMssv: guestMssv ? guestMssv.trim() : null,
      guestKhoa: resolvedKhoa,
      guestLop: resolvedLop,
      guestSoTaiKhoan: guestSoTaiKhoan.trim(),
      guestNganHang: guestNganHang.trim(),
      guestChuTaiKhoan: guestChuTaiKhoan.trim().toUpperCase(),
      quyId,
      tieuDe: tieuDe ? tieuDe.trim() : null,
      lyDo: lyDo.trim(),
      soTienDeNghi: amount,
      taiLieuDinhKem: taiLieuDinhKem.trim(),
      loaiHoTro: resolvedLoaiHoTro,
      tongKinhPhiDuAn: resolvedTongKinhPhiDuAn,
      laDeTai: laDeTai ? 1 : 0,
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

    // LUU VAO guest_tracking (de tracking truoc khi verify OTP)
    await GuestModel.createTracking({
      trackingUuid,
      hoten: guestHoTen.trim(),
      email: normalizedEmail,
      loai: 'yeucauhotro',
      quyId,
      sotien: amount,
      otpHash: hashGuestOtp(normalizedEmail, trackingUuid, otpCode),
    });

    // Gui OTP email
    sendOTPEmail(normalizedEmail, guestHoTen.trim(), otpCode, trackingUuid)
      .catch(err => console.error("Email OTP failed (non-blocking):", err.message));

    return res.status(201).json({
      success: true,
      message: "Da gui ma OTP ve email. Ho so chi duoc luu sau khi xac thuc OTP thanh cong.",
      data: { email: normalizedEmail, trackingUuid, otpToken }
    });
  } catch (error) {
    console.error("Loi submitGuestApplication:", error);
    if (isEmailDeliveryError(error)) return sendEmailErrorResponse(res, "gui ma OTP xac thuc");
    return res.status(500).json({ success: false, message: "Loi he thong khi gui don ho tro" });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// POST /api/guest/tai-tro — Dang ky tai tro vang lai
// ═══════════════════════════════════════════════════════════════════════════════
export const submitGuestDonation = async (req, res) => {
  try {
    const {
      guestHoTen, guestEmail, guestSoDienThoai, guestToChuc, guestDiaChi,
      quyId, soTien, hinhThuc, maGiaoDich, chungTu, ghiChu, formTimestamp,
      loaiNhaTaiTro,
    } = req.body;

    if (formTimestamp) {
      const elapsed = Date.now() - new Date(formTimestamp).getTime();
      if (elapsed < 3000)
        return res.status(400).json({ success: false, message: "Vui long doi it nhat 3 giay truoc khi gui form." });
    }

    if (!guestHoTen || !guestEmail || !quyId || !soTien)
      return res.status(400).json({ success: false, message: "Vui long nhap day du: Ho ten, Email, Quy, So tien" });

    const normalizedEmail = guestEmail.trim().toLowerCase();
    if (!validateEmail(normalizedEmail))
      return res.status(400).json({ success: false, message: "Email khong dung dinh dang" });
    if (guestSoDienThoai && !validatePhone(guestSoDienThoai))
      return res.status(400).json({ success: false, message: "So dien thoai khong dung dinh dang (10-11 so)" });

    const amount = parseFloat(soTien);
    if (isNaN(amount) || amount <= 0)
      return res.status(400).json({ success: false, message: "So tien dong gop phai lon hon 0" });

    const fund = await FundModel.getFundById(quyId);
    if (!fund) return res.status(404).json({ success: false, message: "Khong tim thay quy dong gop nay" });
    if (fund.trang_thai !== "Dang hoat dong")
      return res.status(400).json({ success: false, message: "Quy hien dang tam dung tiep nhan dong gop" });

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
      loaiNhaTaiTro: loaiNhaTaiTro || 'Ca nhan',
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

    // LUU VAO guest_tracking
    await GuestModel.createTracking({
      trackingUuid,
      hoten: guestHoTen.trim(),
      email: normalizedEmail,
      loai: 'khoantaitro',
      quyId,
      sotien: amount,
      otpHash: hashGuestOtp(normalizedEmail, trackingUuid, otpCode),
    });

    sendDonationOTPEmail(normalizedEmail, guestHoTen.trim(), otpCode, trackingUuid)
      .catch(err => console.error("Email OTP failed (non-blocking):", err.message));

    return res.status(201).json({
      success: true,
      message: "Da gui ma OTP tai tro ve email. Khoan tai tro chi duoc luu sau khi xac thuc OTP thanh cong.",
      data: { email: normalizedEmail, trackingUuid, otpToken }
    });
  } catch (error) {
    console.error("Loi submitGuestDonation:", error);
    if (isEmailDeliveryError(error)) return sendEmailErrorResponse(res, "gui ma OTP xac thuc");
    return res.status(500).json({ success: false, message: "Loi he thong khi dang ky dong gop tai tro" });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// POST /api/guest/resend-otp — Gui lai OTP
// ═══════════════════════════════════════════════════════════════════════════════
export const resendGuestOtp = async (req, res) => {
  try {
    const { email, type, otpToken } = req.body;
    if (!email || !type || !otpToken)
      return res.status(400).json({ success: false, message: "Vui long cung cap email, loai don va ma phien OTP" });
    if (type !== "application" && type !== "donation")
      return res.status(400).json({ success: false, message: "Loai don khong hop le" });

    const normalizedEmail = email.trim().toLowerCase();
    const pending = readGuestOtpPayload(otpToken, { allowExpired: true });
    if (pending.type !== type || pending.email !== normalizedEmail)
      return res.status(400).json({ success: false, message: "Thong tin gui lai OTP khong khop voi phien dang xac thuc" });

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = createGuestOtpExpiresAt();
    const nextPayload = {
      ...pending,
      otpHash: hashGuestOtp(normalizedEmail, pending.trackingUuid, otpCode),
      expiresAt: otpExpiresAt.toISOString()
    };
    const nextOtpToken = signGuestOtpPayload(nextPayload);

    if (type === "application") {
      sendOTPEmail(normalizedEmail, pending.application?.guestHoTen || "Khach vang lai", otpCode, pending.trackingUuid)
        .catch(err => console.error("Email OTP failed (non-blocking):", err.message));
    } else {
      sendDonationOTPEmail(normalizedEmail, pending.donation?.guestHoTen || "Nha tai tro", otpCode, pending.trackingUuid)
        .catch(err => console.error("Email OTP failed (non-blocking):", err.message));
    }

    return res.status(200).json({
      success: true,
      message: "Da gui lai ma OTP moi ve email",
      data: { email: normalizedEmail, trackingUuid: pending.trackingUuid, otpToken: nextOtpToken, expiresInMinutes: GUEST_OTP_EXPIRY_MINUTES }
    });
  } catch (error) {
    console.error("Loi resendGuestOtp:", error);
    if (error.message === "OTP_INVALID_OR_NOT_FOUND")
      return res.status(400).json({ success: false, message: "Phien xac thuc OTP khong hop le. Vui long gui lai form." });
    if (isEmailDeliveryError(error)) return sendEmailErrorResponse(res, "gui lai ma OTP");
    return res.status(500).json({ success: false, message: "Loi he thong khi gui lai ma OTP" });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// POST /api/guest/verify-otp — Xac thuc OTP va tao du lieu chinh
// Ho tro 2 luong: token-based (ApplyPage) va DB-based (TrackPage)
// ═══════════════════════════════════════════════════════════════════════════════
export const verifyOtp = async (req, res) => {
  try {
    const { email, otpCode, type, otpToken, trackingUuid } = req.body;
    if (!email || !otpCode || !type)
      return res.status(400).json({ success: false, message: "Vui long cung cap day du: Email, ma OTP, loai don" });
    if (type !== "application" && type !== "donation")
      return res.status(400).json({ success: false, message: "Loai don khong hop le" });

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedOtp = otpCode.trim();
    const plainPassword = generateRandomPassword();

    // ── Luong 1: Token-based (tu ApplyPage, co otpToken) ──────────────────────
    if (otpToken) {
      const pending = readGuestOtpPayload(otpToken);
      if (pending.type !== type || pending.email !== normalizedEmail)
        return res.status(400).json({ success: false, message: "Ma xac thuc OTP khong dung hoac email khong khop" });

      const expectedHash = hashGuestOtp(normalizedEmail, pending.trackingUuid, normalizedOtp);
      if (!timingSafeStringEqual(pending.otpHash, expectedHash))
        return res.status(400).json({ success: false, message: "Ma OTP khong dung hoac da het hieu luc" });

      if (type === "application") {
        const appData = pending.application;
        const result = await GuestModel.verifyAndMigrateApplication(appData, plainPassword);
        sendAccountCreatedEmail(normalizedEmail, appData.guestHoTen, plainPassword, result.trackingUuid)
          .catch(err => console.error("Email created failed (non-blocking):", err.message));
        return res.status(200).json({
          success: true,
          message: "Xac thuc OTP thanh cong. Ho so da duoc luu va gui den bo phan duyet.",
          data: { trackingUuid: result.trackingUuid, email: normalizedEmail, tempPassword: plainPassword, autoCreatedUser: true }
        });
      } else {
        const donData = pending.donation;
        const result = await GuestModel.verifyAndMigrateDonation(donData, plainPassword);
        sendDonationCreatedEmail(normalizedEmail, donData.guestHoTen, plainPassword, donData.soTien, result.trackingUuid)
          .catch(err => console.error("Email created failed (non-blocking):", err.message));
        return res.status(200).json({
          success: true,
          message: "Xac thuc OTP tai tro thanh cong. Khoan tai tro da duoc luu va chuyen qua he thong duyet.",
          data: { trackingUuid: result.trackingUuid, email: normalizedEmail, tempPassword: plainPassword, autoCreatedUser: true }
        });
      }
    }

    // ── Luong 2: DB-based (tu TrackPage, khong co otpToken) ───────────────────
    if (!trackingUuid)
      return res.status(400).json({ success: false, message: "Thieu ma phien OTP hoac ma tra cuu" });

    const expectedHash = hashGuestOtp(normalizedEmail, trackingUuid, normalizedOtp);
    const guestRecord = await GuestModel.findByTrackingUuidAndOtpHash(trackingUuid, expectedHash);
    if (!guestRecord)
      return res.status(400).json({ success: false, message: "Ma OTP khong dung, da het hieu luc, hoac da duoc xac thuc" });

    // Tao password va thuc hien migrate
    if (guestRecord.loai === 'yeucauhotro') {
      // Can du lieu day du tu token de tao nguoidung + yeucauhotro
      // Neu khong co token, chi co the cap nhat trang thai
      return res.status(400).json({
        success: false,
        message: "Vui long su dung form nop don de hoan tat xac thuc OTP"
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Vui long su dung form nop don de hoan tat xac thuc OTP"
      });
    }
  } catch (error) {
    console.error("Loi verifyOtp:", error);
    if (error.message === "OTP_EXPIRED")
      return res.status(400).json({ success: false, message: "Ma OTP da het hieu luc" });
    if (error.message === "OTP_ALREADY_VERIFIED")
      return res.status(400).json({ success: false, message: "Ma OTP nay da duoc xac thuc truoc do" });
    if (isEmailDeliveryError(error)) return sendEmailErrorResponse(res, "gui email xac nhan");
    return res.status(500).json({ success: false, message: "Loi he thong khi xac thuc ma OTP" });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/guest/track/:uuid — Tra cuu trang thai
// ═══════════════════════════════════════════════════════════════════════════════
export const trackGuestStatus = async (req, res) => {
  try {
    const { uuid } = req.params;
    if (!uuid) return res.status(400).json({ success: false, message: "Vui long cung cap ma UUID tra cuu" });

    const data = await GuestModel.trackStatusByUuid(uuid);
    if (!data) return res.status(404).json({ success: false, message: "Khong tim thay don voi ma tra cuu nay" });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Loi trackGuestStatus:", error);
    return res.status(500).json({ success: false, message: "Loi he thong khi tra cuu trang thai" });
  }
};
