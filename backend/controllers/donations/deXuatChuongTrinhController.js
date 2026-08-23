import crypto from "crypto";
import DeXuatChuongTrinhModel from "../../models/donations/DeXuatChuongTrinhModel.js";
import DonationModel from "../../models/donations/DonationModel.js";
import FundModel from "../../models/funds/FundModel.js";
import GuestModel from "../../models/guest/GuestModel.js";
import { logSystemActivity } from "../../utils/helpers/loggerHelper.js";
import { sendProposalOTPEmail, sendProposalCreatedEmail } from "../../services/emailService.js";
import {
  hashGuestOtp,
  createGuestOtpExpiresAt,
  signGuestOtpPayload,
  readGuestOtpPayload,
  timingSafeStringEqual,
  generateRandomPassword,
  isEmailDeliveryError,
} from "../../utils/otpUtils.js";

// ═══════════════════════════════════════════════════════════════════════════════
// ─── ĐỀ XUẤT CHƯƠNG TRÌNH CONTROLLER ──────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
// Xử lý Case 4: Nhà tài trợ tài trợ vào quỹ thành phần (cấp 2) + đề xuất chương trình mới

// ═══════════════════════════════════════════════════════════════════════════════
// ─── POST /api/donations/propose-program (Protect 3,4) ────────────────────────
// MỤC ĐÍCH: Tạo đề xuất chương trình mới (cho Cán bộ/Nhà tài trợ đã đăng nhập)
// ═══════════════════════════════════════════════════════════════════════════════
export const createProposal = async (req, res) => {
  try {
    const {
      quy_thanh_phan_id,
      khoan_tai_tro_id,
      nha_tai_tro_id,
      ten_chuong_trinh,
      mo_ta,
      so_luong_suat,
      so_tien_moi_suat,
      loai_ho_tro,
      tilethuhoi,
      kyhantrano,
      ngay_bat_dau,
      ngay_ket_thuc
    } = req.body;

    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 1: VALIDATE DỮ LIỆU ĐẦU VÀO
    // ─────────────────────────────────────────────────────────────────────────
    if (!quy_thanh_phan_id || isNaN(quy_thanh_phan_id)) {
      return res.status(400).json({
        success: false,
        message: "Thiếu hoặc sai quy_thanh_phan_id"
      });
    }

    if (!ten_chuong_trinh || !ten_chuong_trinh.trim()) {
      return res.status(400).json({
        success: false,
        message: "Thiếu tên chương trình"
      });
    }

    const soLuong = parseInt(so_luong_suat);
    const soTien = parseFloat(so_tien_moi_suat);

    if (isNaN(soLuong) || soLuong <= 0) {
      return res.status(400).json({
        success: false,
        message: "Số lượng suất phải lớn hơn 0"
      });
    }

    if (isNaN(soTien) || soTien <= 0) {
      return res.status(400).json({
        success: false,
        message: "Số tiền mỗi suất phải lớn hơn 0"
      });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 2: KIỂM TRA QUỸ THÀNH PHẦN CÓ TỒN TẠI VÀ ĐÚNG CẤP ĐỘ
    // ─────────────────────────────────────────────────────────────────────────
    const fund = await FundModel.getFundById(quy_thanh_phan_id);
    if (!fund) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy quỹ thành phần"
      });
    }

    if (fund.capdo !== 2) {
      return res.status(400).json({
        success: false,
        message: "Chỉ có thể đề xuất chương trình cho quỹ thành phần (cấp 2)"
      });
    }

    if (fund.trang_thai !== 'Dang hoat dong') {
      return res.status(400).json({
        success: false,
        message: "Quỹ hiện không hoạt động"
      });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 3: KIỂM TRA KHOẢN TÀI TRỢ (NẾU CÓ)
    // ─────────────────────────────────────────────────────────────────────────
    if (khoan_tai_tro_id) {
      const donation = await DonationModel.getDonationById(khoan_tai_tro_id);
      if (!donation) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy khoản tài trợ"
        });
      }

      // Kiểm tra khoản tài trợ phải trỏ vào đúng quỹ thành phần
      if (donation.quy_id !== quy_thanh_phan_id) {
        return res.status(400).json({
          success: false,
          message: "Khoản tài trợ không thuộc quỹ thành phần này"
        });
      }

      // Khoản tài trợ phải đã được duyệt
      if (donation.trangthai !== 'Da duyet' && donation.trangthai !== 'Da nhan') {
        return res.status(400).json({
          success: false,
          message: "Khoản tài trợ chưa được duyệt"
        });
      }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 4: TẠO ĐỀ XUẤT
    // ─────────────────────────────────────────────────────────────────────────
    const soTienTaiTro = soLuong * soTien;
    const finalLoaiHoTro = loai_ho_tro || 'Tai tro khong hoan lai';
    let mucThuHoi = null;
    let tileThuHoiNum = null;
    if (finalLoaiHoTro === 'Tai tro co thu hoi' && tilethuhoi) {
      tileThuHoiNum = parseFloat(tilethuhoi);
      if (!isNaN(tileThuHoiNum) && tileThuHoiNum > 0 && tileThuHoiNum <= 100) {
        mucThuHoi = Math.min(soTienTaiTro * tileThuHoiNum / 100, soTienTaiTro);
      }
    }

    const proposalData = {
      quyThanhPhanId: quy_thanh_phan_id,
      khoanTaiTroId: khoan_tai_tro_id || null,
      nhaTaiTroId: nha_tai_tro_id || null,
      nguoiTaoId: req.user?.id || null,
      tuDongDuyetCap1: Number(req.user?.vai_tro) === 3,
      tenChuongTrinh: ten_chuong_trinh.trim(),
      moTa: mo_ta ? mo_ta.trim() : null,
      soLuongSuat: soLuong,
      soTienMoiSuat: soTien,
      loaiHoTro: finalLoaiHoTro,
      tileThuHoi: tileThuHoiNum,
      kyHanTraNo: kyhantrano ? parseInt(kyhantrano) : null,
      ngayBatDau: ngay_bat_dau || null,
      ngayKetThuc: ngay_ket_thuc || null,
      mucThuHoi
    };

    const result = await DeXuatChuongTrinhModel.createProposal(proposalData);
    const tuDongDuyet = Number(req.user?.vai_tro) === 3;

    // Ghi nhật ký hệ thống
    await logSystemActivity(req, {
      hanhdong: "TAO_DE_XUAT_CHUONG_TRINH",
      loaidoituong: "dexuatchuongtrinh",
      doituong_id: result.insertId,
      mota: `Tạo đề xuất chương trình "${ten_chuong_trinh.trim()}" cho quỹ thành phần "${fund.ten_quy}"`,
      dulieumoi: proposalData
    });

    return res.status(201).json({
      success: true,
      message: tuDongDuyet
        ? "Tạo đề xuất chương trình thành công. Cán bộ đã tự động duyệt, đang chờ Kế toán xác nhận tiền."
        : "Tạo đề xuất chương trình thành công. Chờ duyệt.",
      data: {
        de_xuat_id: result.insertId,
        quy_thanh_phan_id,
        ten_chuong_trinh: ten_chuong_trinh.trim(),
        so_luong_suat: soLuong,
        so_tien_moi_suat: soTien,
        tong_so_tien: soLuong * soTien,
        trang_thai: result.trangThai || (tuDongDuyet ? 'Can bo da duyet' : 'Cho duyet')
      }
    });
  } catch (error) {
    console.error("Lỗi createProposal:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau"
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// ─── POST /api/donations/public/propose-program (KHÔNG CẦN TOKEN) ────────────
// MỤC ĐÍCH: Khách vãng lai tạo đề xuất chương trình mới (không cần đăng nhập)
// ═══════════════════════════════════════════════════════════════════════════════
export const createPublicProposal = async (req, res) => {
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
      tilethuhoi,
      ngay_bat_dau,
      ngay_ket_thuc,
      formTimestamp
    } = req.body;

    // Anti-bot
    if (formTimestamp) {
      const elapsed = Date.now() - new Date(formTimestamp).getTime();
      if (elapsed < 3000)
        return res.status(400).json({ success: false, message: "Vui lòng đợi ít nhất 3 giây trước khi gửi form." });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 1: VALIDATE DỮ LIỆU ĐẦU VÀO
    // ─────────────────────────────────────────────────────────────────────────
    if (!guest_ho_ten || !guest_ho_ten.trim()) {
      return res.status(400).json({
        success: false,
        message: "Thiếu họ tên nhà tài trợ"
      });
    }

    if (!guest_email || !guest_email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Thiếu email nhà tài trợ"
      });
    }

    const normalizedEmail = guest_email.trim().toLowerCase();

    if (!quy_thanh_phan_id || isNaN(quy_thanh_phan_id)) {
      return res.status(400).json({
        success: false,
        message: "Thiếu hoặc sai quy_thanh_phan_id"
      });
    }

    if (!ten_chuong_trinh || !ten_chuong_trinh.trim()) {
      return res.status(400).json({
        success: false,
        message: "Thiếu tên chương trình"
      });
    }

    const soLuong = parseInt(so_luong_suat);
    const soTien = parseFloat(so_tien_moi_suat);

    if (isNaN(soLuong) || soLuong <= 0) {
      return res.status(400).json({
        success: false,
        message: "Số lượng suất phải lớn hơn 0"
      });
    }

    if (isNaN(soTien) || soTien <= 0) {
      return res.status(400).json({
        success: false,
        message: "Số tiền mỗi suất phải lớn hơn 0"
      });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 2: KIỂM TRA QUỸ THÀNH PHẦN CÓ TỒN TẠI VÀ ĐÚNG CẤP ĐỘ
    // ─────────────────────────────────────────────────────────────────────────
    const fund = await FundModel.getFundById(quy_thanh_phan_id);
    if (!fund) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy quỹ thành phần"
      });
    }

    if (fund.capdo !== 2) {
      return res.status(400).json({
        success: false,
        message: "Chỉ có thể đề xuất chương trình cho quỹ thành phần (cấp 2)"
      });
    }

    if (fund.trang_thai !== 'Dang hoat dong') {
      return res.status(400).json({
        success: false,
        message: "Quỹ hiện không hoạt động"
      });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 3: TẠO GUEST TRACKING + OTP TOKEN (chưa tạo proposal)
    // ─────────────────────────────────────────────────────────────────────────
    const trackingUuid = crypto.randomUUID();
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = createGuestOtpExpiresAt();

    // Tính mucthuhoi từ tilethuhoi do nhà tài trợ nhập
    const soTienTaiTro = soLuong * soTien;
    const finalLoaiHoTro = loai_ho_tro || 'Tai tro khong hoan lai';
    let mucThuHoi = null;
    let tileThuHoiNum = null;
    if (finalLoaiHoTro === 'Tai tro co thu hoi' && tilethuhoi) {
      tileThuHoiNum = parseFloat(tilethuhoi);
      if (!isNaN(tileThuHoiNum) && tileThuHoiNum > 0 && tileThuHoiNum <= 100) {
        mucThuHoi = Math.min(soTienTaiTro * tileThuHoiNum / 100, soTienTaiTro);
      }
    }

    const pendingProposal = {
      guestHoTen: guest_ho_ten.trim(),
      guestEmail: normalizedEmail,
      guestSoDienThoai: guest_so_dien_thoai?.trim() || null,
      guestDiaChi: guest_dia_chi?.trim() || null,
      quyThanhPhanId: quy_thanh_phan_id,
      tenChuongTrinh: ten_chuong_trinh.trim(),
      moTa: mo_ta ? mo_ta.trim() : null,
      soLuongSuat: soLuong,
      soTienMoiSuat: soTien,
      loaiHoTro: finalLoaiHoTro,
      tileThuHoi: tileThuHoiNum,
      ngayBatDau: ngay_bat_dau || null,
      ngayKetThuc: ngay_ket_thuc || null,
      mucThuHoi,
      trackingUuid
    };

    const otpToken = signGuestOtpPayload({
      type: "proposal",
      email: normalizedEmail,
      trackingUuid,
      otpHash: hashGuestOtp(normalizedEmail, trackingUuid, otpCode),
      expiresAt: otpExpiresAt.toISOString(),
      proposal: pendingProposal
    });

    // Lưu vào guest_tracking (chỉ tracking, chưa tạo proposal)
    const tongTien = soLuong * soTien;
    await GuestModel.createTracking({
      trackingUuid,
      hoten: guest_ho_ten.trim(),
      email: normalizedEmail,
      loai: 'dexuatchuongtrinh',
      quyId: quy_thanh_phan_id,
      sotien: tongTien,
      otpHash: hashGuestOtp(normalizedEmail, trackingUuid, otpCode),
    });

    // Gửi OTP email (non-blocking)
    sendProposalOTPEmail(normalizedEmail, guest_ho_ten.trim(), otpCode, trackingUuid)
      .catch(err => console.error("Email OTP proposal failed (non-blocking):", err.message));

    return res.status(201).json({
      success: true,
      message: "Đã gửi mã OTP xác thực về email. Đề xuất chỉ được lưu sau khi xác thực OTP thành công.",
      data: { email: normalizedEmail, trackingUuid, otpToken }
    });
  } catch (error) {
    console.error("Lỗi createPublicProposal:", error);
    if (isEmailDeliveryError(error))
      return res.status(500).json({ success: false, message: "Không thể gửi mã OTP qua email. Vui lòng kiểm tra SMTP." });
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau"
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// ─── POST /api/donations/public/propose-program/verify-otp ────────────────────
// MỤC ĐÍCH: Xác thực OTP và tạo đề xuất chương trình + tài khoản khách
// ═══════════════════════════════════════════════════════════════════════════════
export const verifyProposalOtp = async (req, res) => {
  try {
    const { email, otpCode, type, otpToken } = req.body;

    if (!email || !otpCode || !type)
      return res.status(400).json({ success: false, message: "Vui lòng cung cấp đầy đủ: Email, mã OTP, loại đơn" });
    if (type !== "proposal")
      return res.status(400).json({ success: false, message: "Loại đơn không hợp lệ" });

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedOtp = otpCode.trim();
    const plainPassword = generateRandomPassword();

    if (!otpToken)
      return res.status(400).json({ success: false, message: "Thiếu mã phiên OTP" });

    // ── Đọc và validate OTP token ──────────────────────────────────────────────
    const pending = readGuestOtpPayload(otpToken);
    if (pending.type !== type || pending.email !== normalizedEmail)
      return res.status(400).json({ success: false, message: "Mã xác thực OTP không đúng hoặc email không khớp" });

    const expectedHash = hashGuestOtp(normalizedEmail, pending.trackingUuid, normalizedOtp);
    if (!timingSafeStringEqual(pending.otpHash, expectedHash))
      return res.status(400).json({ success: false, message: "Mã OTP không đúng hoặc đã hết hiệu lực" });

    // ── Tạo user + proposal ────────────────────────────────────────────────────
    const proposalData = pending.proposal;
    const result = await GuestModel.verifyAndMigrateProposal(proposalData, plainPassword);

    // Gửi email thông báo tài khoản (non-blocking)
    sendProposalCreatedEmail(normalizedEmail, proposalData.guestHoTen, plainPassword, result.trackingUuid)
      .catch(err => console.error("Email proposal created failed (non-blocking):", err.message));

    // Ghi nhật ký hệ thống
    await logSystemActivity(req, {
      hanhdong: "XAC_THUC_OTP_DE_XUAT_CHUONG_TRINH",
      loaidoituong: "dexuatchuongtrinh",
      doituong_id: result.proposalId,
      mota: `Khách "${proposalData.guestHoTen}" xác thực OTP và tạo đề xuất "${proposalData.tenChuongTrinh}"`,
      dulieumoi: {
        tenChuongTrinh: proposalData.tenChuongTrinh,
        quyThanhPhanId: proposalData.quyThanhPhanId,
        tongSoTien: proposalData.soLuongSuat * proposalData.soTienMoiSuat,
      }
    });

    return res.status(200).json({
      success: true,
      message: "Xác thực OTP thành công. Đề xuất chương trình đã được lưu và chờ duyệt.",
      data: { trackingUuid: result.trackingUuid, email: normalizedEmail, tempPassword: plainPassword, autoCreatedUser: true }
    });
  } catch (error) {
    console.error("Lỗi verifyProposalOtp:", error);
    if (error.message === "OTP_EXPIRED")
      return res.status(400).json({ success: false, message: "Mã OTP đã hết hiệu lực" });
    if (error.message === "OTP_ALREADY_VERIFIED")
      return res.status(400).json({ success: false, message: "Mã OTP này đã được xác thực trước đó" });
    if (error.message === "OTP_INVALID_OR_NOT_FOUND")
      return res.status(400).json({ success: false, message: "Phiên xác thực OTP không hợp lệ" });
    if (isEmailDeliveryError(error))
      return res.status(500).json({ success: false, message: "Không thể gửi email xác nhận. Vui lòng kiểm tra SMTP." });
    return res.status(500).json({ success: false, message: "Lỗi hệ thống khi xác thực mã OTP" });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// ─── GET /api/donations/propose-program (Protect 1,3) ─────────────────────────
// MỤC ĐÍCH: Danh sách đề xuất chờ duyệt (cho Admin/Cán bộ Quỹ)
// ═══════════════════════════════════════════════════════════════════════════════
export const listProposals = async (req, res) => {
  try {
    const {
      quy_thanh_phan_id = '',
      trang_thai = '',
      keyword = '',
      page = 1,
      page_size = 15
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(page_size, 10) || 15));

    const { rows, total } = await DeXuatChuongTrinhModel.listProposals({
      quy_thanh_phan_id: String(quy_thanh_phan_id).trim(),
      trang_thai: String(trang_thai).trim(),
      keyword: String(keyword).trim(),
      page: pageNum,
      page_size: pageSize
    });

    const data = rows.map((r) => ({
      de_xuat_id: r.dexuatchuongtrinh_id,
      quy_thanh_phan_id: r.quythanhphan_id,
      ten_quy_thanh_phan: r.ten_quy_thanh_phan,
      khoan_tai_tro_id: r.khoantaitro_id,
      so_tien_tai_tro: r.so_tien_tai_tro ? parseFloat(r.so_tien_tai_tro) : null,
      nha_tai_tro_id: r.nhataitro_id,
      ten_nha_tai_tro: r.tennhataitro,
      loai_nha_tai_tro: r.loainhataitro,
      ten_chuong_trinh: r.tenchuongtrinh,
      mo_ta: r.mota,
      so_luong_suat: r.soluongsuat,
      so_tien_moi_suat: parseFloat(r.sotienmoisuat) || 0,
      tong_so_tien: parseFloat(r.soluongsuat) * parseFloat(r.sotienmoisuat),
      loai_ho_tro: r.loaihotro,
      tilethuhoi: r.tilethuhoi ? parseFloat(r.tilethuhoi) : null,
      mucthuhoi: r.mucthuhoi ? parseFloat(r.mucthuhoi) : null,
      kyhantrano: r.kyhantrano ? parseInt(r.kyhantrano) : null,
      ngay_bat_dau: r.ngaybatdau,
      ngay_ket_thuc: r.ngayketthuc,
      trang_thai: r.trangthai,
      nguoi_duyet_id: r.nguoiduyet_id,
      nguoi_duyet_ten: r.nguoi_duyet_ten,
      ngay_duyet: r.ngayduyet,
      quy_ket_qua_id: r.quyketqua_id,
      ten_quy_ket_qua: r.ten_quy_ket_qua,
      ngay_tao: r.ngaytao
    }));

    return res.status(200).json({
      success: true,
      data,
      pagination: {
        page: pageNum,
        page_size: pageSize,
        total,
        total_pages: Math.ceil(total / pageSize)
      }
    });
  } catch (error) {
    console.error("Lỗi listProposals:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server"
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// ─── GET /api/donations/propose-program/:id (Protect 1,3) ─────────────────────
// MỤC ĐÍCH: Chi tiết đề xuất chương trình
// ═══════════════════════════════════════════════════════════════════════════════
export const getProposalDetail = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "ID không hợp lệ"
      });
    }

    const proposal = await DeXuatChuongTrinhModel.getProposalById(id);

    if (!proposal) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đề xuất chương trình"
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        de_xuat_id: proposal.dexuatchuongtrinh_id,
        quy_thanh_phan_id: proposal.quythanhphan_id,
        ten_quy_thanh_phan: proposal.ten_quy_thanh_phan,
        so_du_quy_thanh_phan: parseFloat(proposal.so_du_quy_thanh_phan) || 0,
        loai_quy_id: proposal.loaiquy_id,
        khoan_tai_tro_id: proposal.khoantaitro_id,
        so_tien_tai_tro: proposal.so_tien_tai_tro ? parseFloat(proposal.so_tien_tai_tro) : null,
        nha_tai_tro_id: proposal.nhataitro_id,
        ten_nha_tai_tro: proposal.tennhataitro,
        loai_nha_tai_tro: proposal.loainhataitro,
        nha_tai_tro_email: proposal.nhataitro_email,
        nha_tai_tro_so_dien_thoai: proposal.nhataitro_sodienthoai,
        ten_chuong_trinh: proposal.tenchuongtrinh,
        mo_ta: proposal.mota,
        so_luong_suat: proposal.soluongsuat,
        so_tien_moi_suat: parseFloat(proposal.sotienmoisuat) || 0,
        tong_so_tien: parseFloat(proposal.soluongsuat) * parseFloat(proposal.sotienmoisuat),
        loai_ho_tro: proposal.loaihotro,
        tilethuhoi: proposal.tilethuhoi ? parseFloat(proposal.tilethuhoi) : null,
        kyhantrano: proposal.kyhantrano ? parseInt(proposal.kyhantrano) : null,
        mucthuhoi: proposal.mucthuhoi ? parseFloat(proposal.mucthuhoi) : null,
        ngay_bat_dau: proposal.ngaybatdau,
        ngay_ket_thuc: proposal.ngayketthuc,
        trang_thai: proposal.trangthai,
        ly_do_tu_choi: proposal.lydotuchoi,
        nguoi_duyet_id: proposal.nguoiduyet_id,
        nguoi_duyet_ten: proposal.nguoi_duyet_ten,
        ngay_duyet: proposal.ngayduyet,
        quy_ket_qua_id: proposal.quyketqua_id,
        ten_quy_ket_qua: proposal.ten_quy_ket_qua,
        ngay_tao: proposal.ngaytao
      }
    });
  } catch (error) {
    console.error("Lỗi getProposalDetail:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server"
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// ─── GET /api/donations/propose-program/stats (Protect 1,3) ───────────────────
// MỤC ĐÍCH: Thống kê đề xuất chương trình (cho Dashboard)
// ═══════════════════════════════════════════════════════════════════════════════
export const getProposalStats = async (_req, res) => {
  try {
    const stats = await DeXuatChuongTrinhModel.getProposalStats();
    return res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error("Lỗi getProposalStats:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server"
    });
  }
};
