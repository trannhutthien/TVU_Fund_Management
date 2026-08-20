import ProposalModel from "../../models/donations/ProposalModel.js";
import FundModel from "../../models/funds/FundModel.js";
import GuestModel from "../../models/guest/GuestModel.js";
import {
  sendProposalOTPEmail,
  sendProposalCreatedEmail
} from "../../services/emailService.js";
import {
  validateEmail,
  validatePhone,
  isEmailDeliveryError,
  GUEST_OTP_EXPIRY_MINUTES,
  generateRandomPassword,
  hashGuestOtp,
  createGuestOtpExpiresAt,
  signGuestOtpPayload,
  readGuestOtpPayload,
  timingSafeStringEqual,
} from "../../utils/otpUtils.js";

// ═══════════════════════════════════════════════════════════════════════════════
// ─── PROPOSAL CONTROLLER ───────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
// Handles public program proposal creation (Case 4)

/**
 * @route POST /api/donations/propose-program
 * @desc Create a new program proposal with donation
 * @access Public
 */
export const createProposal = async (req, res) => {
  try {
    const {
      // Donor information
      ten,
      email,
      soDienThoai,
      
      // Proposal information
      quyThanhPhanId,
      tenChuongTrinh,
      moTa,
      loaiHinh,
      thoiGianBatDau,
      thoiGianKetThuc,
      soLuongSuat,
      soTienMoiSuat,
      doiTuongNhan,
      yeuCauHocLuc,
      dieuKienHoanTra,
      taiLieuDinhKem,
      
      // Donation information
      soTien,
      hinhThuc,
      maGiaoDich,
      chungTu,
      ghiChu
    } = req.body;
    
    // ─────────────────────────────────────────────────────────────────────────
    // 1. VALIDATE REQUIRED FIELDS
    // ─────────────────────────────────────────────────────────────────────────
    if (!ten || !email || !quyThanhPhanId || !tenChuongTrinh || !soTien) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin bắt buộc: họ tên, email, quỹ thành phần, tên chương trình, số tiền'
      });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Email không hợp lệ'
      });
    }
    
    // Validate phone (if provided)
    if (soDienThoai) {
      const phoneRegex = /^0\d{9}$/;
      if (!phoneRegex.test(soDienThoai)) {
        return res.status(400).json({
          success: false,
          message: 'Số điện thoại phải có 10 chữ số và bắt đầu bằng 0'
        });
      }
    }
    
    // Validate amount
    if (soTien < 10000) {
      return res.status(400).json({
        success: false,
        message: 'Số tiền tài trợ tối thiểu là 10,000 VNĐ'
      });
    }
    
    // Validate program name length
    if (tenChuongTrinh.trim().length < 5 || tenChuongTrinh.trim().length > 200) {
      return res.status(400).json({
        success: false,
        message: 'Tên chương trình phải từ 5 đến 200 ký tự'
      });
    }
    
    // Validate dates (if provided)
    if (thoiGianBatDau && thoiGianKetThuc) {
      const startDate = new Date(thoiGianBatDau);
      const endDate = new Date(thoiGianKetThuc);
      
      if (startDate >= endDate) {
        return res.status(400).json({
          success: false,
          message: 'Thời gian bắt đầu phải trước thời gian kết thúc'
        });
      }
    }
    
    // Validate soLuongSuat (if provided)
    if (soLuongSuat && (soLuongSuat < 1 || soLuongSuat > 10000)) {
      return res.status(400).json({
        success: false,
        message: 'Số lượng suất phải từ 1 đến 10,000'
      });
    }
    
    // Validate soTienMoiSuat (if provided)
    if (soTienMoiSuat && soTienMoiSuat < 100000) {
      return res.status(400).json({
        success: false,
        message: 'Số tiền mỗi suất tối thiểu là 100,000 VNĐ'
      });
    }
    
    // ─────────────────────────────────────────────────────────────────────────
    // 2. VERIFY FUND EXISTS AND IS COMPONENT FUND (LEVEL 2)
    // ─────────────────────────────────────────────────────────────────────────
    const fund = await FundModel.getFundById(quyThanhPhanId);
    
    if (!fund) {
      return res.status(404).json({
        success: false,
        message: 'Quỹ thành phần không tồn tại'
      });
    }
    
    if (fund.capdo !== 2) {
      return res.status(400).json({
        success: false,
        message: 'Chỉ có thể đề xuất chương trình cho Quỹ Thành phần (cấp 2)'
      });
    }
    
    if (fund.trangthai !== 'Dang hoat dong') {
      return res.status(400).json({
        success: false,
        message: `Quỹ "${fund.tenquy}" hiện không hoạt động`
      });
    }
    
    // ─────────────────────────────────────────────────────────────────────────
    // 3. CREATE PROPOSAL WITH DONATION
    // ─────────────────────────────────────────────────────────────────────────
    const result = await ProposalModel.createProposalWithDonation({
      donorInfo: {
        ten: ten.trim(),
        email: email.trim().toLowerCase(),
        soDienThoai: soDienThoai?.trim()
      },
      proposalInfo: {
        quyThanhPhanId,
        tenChuongTrinh: tenChuongTrinh.trim(),
        moTa: moTa?.trim(),
        loaiHinh: loaiHinh || 'Tai tro khong hoan lai',
        thoiGianBatDau,
        thoiGianKetThuc,
        soLuongSuat,
        soTienMoiSuat,
        doiTuongNhan: doiTuongNhan?.trim(),
        yeuCauHocLuc: yeuCauHocLuc?.trim(),
        dieuKienHoanTra: dieuKienHoanTra?.trim(),
        taiLieuDinhKem: taiLieuDinhKem ? JSON.stringify(taiLieuDinhKem) : null
      },
      donationInfo: {
        soTien,
        hinhThuc: hinhThuc || 'Chuyen khoan',
        maGiaoDich: maGiaoDich?.trim(),
        chungTu: chungTu?.trim(),
        ghiChu: ghiChu?.trim()
      }
    });
    
    // ─────────────────────────────────────────────────────────────────────────
    // 4. SEND EMAIL NOTIFICATION (TODO: Implement in Task 14)
    // ─────────────────────────────────────────────────────────────────────────
    // await sendProposalNotificationEmail({
    //   to: email,
    //   donorName: ten,
    //   programName: tenChuongTrinh,
    //   amount: soTien
    // });
    
    // ─────────────────────────────────────────────────────────────────────────
    // 5. RETURN SUCCESS RESPONSE
    // ─────────────────────────────────────────────────────────────────────────
    return res.status(201).json({
      success: true,
      message: 'Đề xuất chương trình đã được gửi. Chúng tôi sẽ xét duyệt trong 3-5 ngày làm việc.',
      data: {
        deXuatId: result.deXuatId,
        khoanTaiTroId: result.khoanTaiTroId,
        nhaTaiTroId: result.nhaTaiTroId,
        trangThai: result.trangThai,
        tenQuy: fund.tenquy,
        email: email.trim().toLowerCase()
      }
    });
    
  } catch (error) {
    console.error('Error in createProposal:', error);
    
    // Check for specific database errors
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'Dữ liệu bị trùng lặp'
      });
    }
    
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({
        success: false,
        message: 'Quỹ thành phần không tồn tại'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi tạo đề xuất chương trình'
    });
  }
};

/**
 * @route GET /api/donations/proposals/:id
 * @desc Get proposal details by ID
 * @access Public (for tracking)
 */
export const getProposalById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const proposal = await ProposalModel.getProposalById(id);
    
    if (!proposal) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đề xuất chương trình'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: {
        deXuatId: proposal.dexuatchuongtrinh_id,
        tenChuongTrinh: proposal.tenchuongtrinh,
        moTa: proposal.mota,
        soLuongSuat: proposal.soluongsuat,
        soTienMoiSuat: proposal.sotienmoisuat,
        loaiHoTro: proposal.loaihotro,
        trangThai: proposal.trangthai,
        tenQuyThanhPhan: proposal.ten_quy_thanh_phan,
        nhaTaiTro: proposal.tennhataitro,
        email: proposal.nhataitro_email,
        soTienTaiTro: proposal.so_tien_tai_tro,
        ngayTao: proposal.ngaytao
      }
    });
    
  } catch (error) {
    console.error('Error in getProposalById:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy thông tin đề xuất'
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// POST /api/donations/public/propose-program — Gui de xuat chuong trinh (generate OTP)
// Task 5: Requirements 1.1-1.9, 6.1-6.10, 8.1-8.3, 12.1-12.6
// ═══════════════════════════════════════════════════════════════════════════════
export const submitPublicProposal = async (req, res) => {
  try {
    const {
      guest_ho_ten,
      guest_email,
      guest_so_dien_thoai,
      guest_dia_chi,
      quy_thanh_phan_id,
      ten_chuong_trinh,
      mo_ta,
      so_luong_suat,
      so_tien_moi_suat,
      loai_ho_tro,
      ngay_bat_dau,
      ngay_ket_thuc,
      formTimestamp,
    } = req.body;

    // ─────────────────────────────────────────────────────────────────────────
    // 1. ANTI-BOT PROTECTION (Requirement 12.1-12.3)
    // ─────────────────────────────────────────────────────────────────────────
    if (formTimestamp) {
      const elapsed = Date.now() - new Date(formTimestamp).getTime();
      if (elapsed < 3000) {
        return res.status(400).json({
          success: false,
          message: "Vui long doi it nhat 3 giay truoc khi gui form",
        });
      }
    }

    const normalizedEmail = guest_email ? guest_email.trim().toLowerCase() : "";

    // ─────────────────────────────────────────────────────────────────────────
    // 2. VALIDATE REQUIRED FIELDS (Requirements 6.1-6.6)
    // ─────────────────────────────────────────────────────────────────────────
    if (!guest_ho_ten || !guest_email || !quy_thanh_phan_id || !ten_chuong_trinh || !so_luong_suat || !so_tien_moi_suat) {
      return res.status(400).json({
        success: false,
        message: "Vui long nhap day du thong tin bat buoc",
      });
    }

    // Validate email format (Requirement 6.2)
    if (!validateEmail(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Email khong dung dinh dang",
      });
    }

    // Validate phone (if provided)
    if (guest_so_dien_thoai && !validatePhone(guest_so_dien_thoai)) {
      return res.status(400).json({
        success: false,
        message: "So dien thoai khong dung dinh dang (10-11 so)",
      });
    }

    // Validate numeric fields (Requirements 6.5, 6.6)
    const soLuongSuat = parseInt(so_luong_suat);
    const soTienMoiSuat = parseFloat(so_tien_moi_suat);

    if (isNaN(soLuongSuat) || soLuongSuat <= 0) {
      return res.status(400).json({
        success: false,
        message: "So luong suat phai lon hon 0",
      });
    }

    if (isNaN(soTienMoiSuat) || soTienMoiSuat <= 0) {
      return res.status(400).json({
        success: false,
        message: "So tien moi suat phai lon hon 0",
      });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 3. VERIFY FUND (Requirements 6.7-6.10)
    // ─────────────────────────────────────────────────────────────────────────
    const fund = await FundModel.getFundById(quy_thanh_phan_id);

    if (!fund) {
      return res.status(404).json({
        success: false,
        message: "Khong tim thay quy thanh phan nay",
      });
    }

    // Requirement 6.8: Verify fund level is 2 (component fund)
    if (fund.capdo !== 2) {
      return res.status(400).json({
        success: false,
        message: "Chi co the de xuat chuong trinh cho Quy Thanh phan (cap 2)",
        error_code: "FUND_WRONG_LEVEL",
      });
    }

    // Requirement 6.9: Verify fund status
    if (fund.trang_thai !== "Dang hoat dong") {
      return res.status(400).json({
        success: false,
        message: `Quy "${fund.ten_quy}" hien khong hoat dong`,
        error_code: "FUND_INACTIVE",
      });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 4. GENERATE OTP AND TRACKING UUID (Requirements 1.1-1.4)
    // ─────────────────────────────────────────────────────────────────────────
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString(); // Requirement 1.1
    const otpExpiresAt = createGuestOtpExpiresAt(); // Requirement 1.2 (30 minutes)
    const trackingUuid = crypto.randomUUID(); // Requirement 1.3

    const resolvedLoaiHoTro = loai_ho_tro || "Tai tro khong hoan lai";

    // Requirement 1.4: Compute OTP hash
    const otpHash = hashGuestOtp(normalizedEmail, trackingUuid, otpCode);

    // ─────────────────────────────────────────────────────────────────────────
    // 5. CREATE PENDING PROPOSAL OBJECT AND SIGN OTP TOKEN (Requirement 1.5)
    // ─────────────────────────────────────────────────────────────────────────
    const pendingProposal = {
      guestHoTen: guest_ho_ten.trim(),
      guestEmail: normalizedEmail,
      guestSoDienThoai: guest_so_dien_thoai ? guest_so_dien_thoai.trim() : null,
      guestDiaChi: guest_dia_chi ? guest_dia_chi.trim() : null,
      quyThanhPhanId: quy_thanh_phan_id,
      tenChuongTrinh: ten_chuong_trinh.trim(),
      moTa: mo_ta ? mo_ta.trim() : null,
      soLuongSuat,
      soTienMoiSuat,
      loaiHoTro: resolvedLoaiHoTro,
      ngayBatDau: ngay_bat_dau || null,
      ngayKetThuc: ngay_ket_thuc || null,
      trackingUuid,
    };

    const otpToken = signGuestOtpPayload({
      type: "proposal",
      email: normalizedEmail,
      trackingUuid,
      otpHash,
      expiresAt: otpExpiresAt.toISOString(),
      proposal: pendingProposal,
    });

    // ─────────────────────────────────────────────────────────────────────────
    // 6. CREATE GUEST_TRACKING RECORD (Requirement 1.6, 8.1-8.3)
    // ─────────────────────────────────────────────────────────────────────────
    await GuestModel.createProposalTracking({
      trackingUuid,
      hoten: guest_ho_ten.trim(),
      email: normalizedEmail,
      quyId: quy_thanh_phan_id,
      sotien: soLuongSuat * soTienMoiSuat,
      otpHash,
    });

    // ─────────────────────────────────────────────────────────────────────────
    // 7. SEND OTP EMAIL (Requirements 1.7-1.9)
    // ─────────────────────────────────────────────────────────────────────────
    sendProposalOTPEmail(normalizedEmail, guest_ho_ten.trim(), otpCode, trackingUuid).catch((err) =>
      console.error("Email OTP failed (non-blocking):", err.message)
    );

    // ─────────────────────────────────────────────────────────────────────────
    // 8. RETURN SUCCESS RESPONSE (Requirement 1.8)
    // ─────────────────────────────────────────────────────────────────────────
    return res.status(201).json({
      success: true,
      message: "Da gui ma OTP ve email. De xuat chi duoc luu sau khi xac thuc OTP thanh cong.",
      data: {
        email: normalizedEmail,
        trackingUuid,
        otpToken,
      },
    });
  } catch (error) {
    console.error("Loi submitPublicProposal:", error);
    if (isEmailDeliveryError(error)) {
      return res.status(500).json({
        success: false,
        message: "Khong the gui ma OTP xac thuc qua email. Vui long kiem tra SMTP.",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Loi server, vui long thu lai sau",
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// POST /api/donations/public/propose-program/verify-otp — Xac thuc OTP va tao de xuat
// Task 6: Requirements 4.1-4.11, 7.1-7.7, 8.4-8.6
// ═══════════════════════════════════════════════════════════════════════════════
export const verifyProposalOtp = async (req, res) => {
  try {
    const { email, otpCode, type, otpToken } = req.body;

    // ─────────────────────────────────────────────────────────────────────────
    // 1. VALIDATE INPUT (Requirement 4.1)
    // ─────────────────────────────────────────────────────────────────────────
    if (!email || !otpCode || !type || !otpToken) {
      return res.status(400).json({
        success: false,
        message: "Vui long cung cap day du: Email, ma OTP, loai, va token",
      });
    }

    // Requirement 4.1: Validate type
    if (type !== "proposal") {
      return res.status(400).json({
        success: false,
        message: "Loai khong hop le",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedOtp = otpCode.trim();

    // ─────────────────────────────────────────────────────────────────────────
    // 2. READ AND VALIDATE OTP TOKEN (Requirements 4.2, 4.3)
    // ─────────────────────────────────────────────────────────────────────────
    const pending = readGuestOtpPayload(otpToken); // Throws OTP_EXPIRED if expired

    // Requirement 4.3: Verify email and type match
    if (pending.type !== type || pending.email !== normalizedEmail) {
      return res.status(400).json({
        success: false,
        message: "Ma OTP khong dung",
      });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 3. VERIFY OTP HASH (Requirements 4.4, 4.5)
    // ─────────────────────────────────────────────────────────────────────────
    const expectedHash = hashGuestOtp(normalizedEmail, pending.trackingUuid, normalizedOtp);

    // Requirement 4.5: Timing-safe comparison
    if (!timingSafeStringEqual(pending.otpHash, expectedHash)) {
      return res.status(400).json({
        success: false,
        message: "Ma OTP khong dung hoac da het hieu luc",
        error_code: "OTP_INVALID_OR_NOT_FOUND",
      });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 4. GENERATE PASSWORD AND MIGRATE PROPOSAL (Requirements 4.6-4.9)
    // ─────────────────────────────────────────────────────────────────────────
    const plainPassword = generateRandomPassword(); // Requirement 4.6
    const proposalData = pending.proposal;

    // Requirement 4.7-4.9: Create user account and proposal record
    const result = await GuestModel.verifyAndMigrateProposal(proposalData, plainPassword);

    // ─────────────────────────────────────────────────────────────────────────
    // 5. SEND CONFIRMATION EMAIL (Requirements 4.10, 4.11)
    // ─────────────────────────────────────────────────────────────────────────
    sendProposalCreatedEmail(normalizedEmail, proposalData.guestHoTen, plainPassword, result.trackingUuid).catch((err) =>
      console.error("Email confirmation failed (non-blocking):", err.message)
    );

    // ─────────────────────────────────────────────────────────────────────────
    // 6. RETURN SUCCESS RESPONSE (Requirement 4.11, 7.1-7.7)
    // ─────────────────────────────────────────────────────────────────────────
    return res.status(200).json({
      success: true,
      message: "Xac thuc OTP thanh cong. De xuat chuong trinh da duoc luu va gui den bo phan duyet.",
      data: {
        trackingUuid: result.trackingUuid,
        email: normalizedEmail,
        tempPassword: plainPassword, // Requirement 7.4
        autoCreatedUser: true,
      },
    });
  } catch (error) {
    console.error("Loi verifyProposalOtp:", error);

    // ─────────────────────────────────────────────────────────────────────────
    // 7. ERROR HANDLING (Requirement 10.1-10.3)
    // ─────────────────────────────────────────────────────────────────────────
    if (error.message === "OTP_EXPIRED") {
      return res.status(400).json({
        success: false,
        message: "Ma OTP da het hieu luc",
        error_code: "OTP_EXPIRED",
      });
    }

    if (error.message === "OTP_ALREADY_VERIFIED") {
      return res.status(400).json({
        success: false,
        message: "Ma OTP nay da duoc xac thuc truoc do",
        error_code: "OTP_ALREADY_VERIFIED",
      });
    }

    if (isEmailDeliveryError(error)) {
      return res.status(500).json({
        success: false,
        message: "Khong the gui email xac nhan",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Loi he thong khi xac thuc ma OTP",
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// POST /api/donations/public/propose-program/resend-otp — Gui lai OTP
// Task 7: Requirements 5.1-5.10
// ═══════════════════════════════════════════════════════════════════════════════
export const resendProposalOtp = async (req, res) => {
  try {
    const { email, type, otpToken } = req.body;

    // ─────────────────────────────────────────────────────────────────────────
    // 1. VALIDATE INPUT (Requirement 5.1)
    // ─────────────────────────────────────────────────────────────────────────
    if (!email || !type || !otpToken) {
      return res.status(400).json({
        success: false,
        message: "Vui long cung cap email, loai, va ma phien OTP",
      });
    }

    if (type !== "proposal") {
      return res.status(400).json({
        success: false,
        message: "Loai khong hop le",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // ─────────────────────────────────────────────────────────────────────────
    // 2. READ OTP TOKEN WITH EXPIRED ALLOWED (Requirements 5.2, 5.3)
    // ─────────────────────────────────────────────────────────────────────────
    const pending = readGuestOtpPayload(otpToken, { allowExpired: true });

    // Requirement 5.4: Verify email and type match
    if (pending.type !== type || pending.email !== normalizedEmail) {
      return res.status(400).json({
        success: false,
        message: "Thong tin gui lai OTP khong khop voi phien dang xac thuc",
        error_code: "EMAIL_MISMATCH",
      });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 3. GENERATE NEW OTP (Requirements 5.5, 5.6)
    // ─────────────────────────────────────────────────────────────────────────
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString(); // Requirement 5.5
    const otpExpiresAt = createGuestOtpExpiresAt(); // Requirement 5.6 (+30 minutes)

    // ─────────────────────────────────────────────────────────────────────────
    // 4. CREATE NEW TOKEN (Requirement 5.7)
    // ─────────────────────────────────────────────────────────────────────────
    const nextPayload = {
      ...pending,
      otpHash: hashGuestOtp(normalizedEmail, pending.trackingUuid, otpCode),
      expiresAt: otpExpiresAt.toISOString(),
    };
    const nextOtpToken = signGuestOtpPayload(nextPayload);

    // ─────────────────────────────────────────────────────────────────────────
    // 5. SEND NEW OTP EMAIL (Requirement 5.8)
    // ─────────────────────────────────────────────────────────────────────────
    sendProposalOTPEmail(
      normalizedEmail,
      pending.proposal?.guestHoTen || "Nguoi de xuat",
      otpCode,
      pending.trackingUuid
    ).catch((err) => console.error("Email OTP failed (non-blocking):", err.message));

    // ─────────────────────────────────────────────────────────────────────────
    // 6. RETURN SUCCESS RESPONSE (Requirement 5.9)
    // ─────────────────────────────────────────────────────────────────────────
    return res.status(200).json({
      success: true,
      message: "Da gui lai ma OTP moi ve email",
      data: {
        email: normalizedEmail,
        trackingUuid: pending.trackingUuid,
        otpToken: nextOtpToken, // Requirement 5.10
        expiresInMinutes: GUEST_OTP_EXPIRY_MINUTES,
      },
    });
  } catch (error) {
    console.error("Loi resendProposalOtp:", error);

    // ─────────────────────────────────────────────────────────────────────────
    // 7. ERROR HANDLING (Requirement 10.8, 10.9)
    // ─────────────────────────────────────────────────────────────────────────
    if (error.message === "OTP_INVALID_OR_NOT_FOUND") {
      return res.status(400).json({
        success: false,
        message: "Phien xac thuc khong hop le, vui long gui lai form",
      });
    }

    if (isEmailDeliveryError(error)) {
      return res.status(500).json({
        success: false,
        message: "Khong the gui lai ma OTP",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Loi he thong khi gui lai ma OTP",
    });
  }
};
