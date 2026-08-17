import DeXuatChuongTrinhModel from "../../models/donations/DeXuatChuongTrinhModel.js";
import DonationModel from "../../models/donations/DonationModel.js";
import FundModel from "../../models/funds/FundModel.js";
import { logSystemActivity } from "../../utils/helpers/loggerHelper.js";

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
    const proposalData = {
      quyThanhPhanId: quy_thanh_phan_id,
      khoanTaiTroId: khoan_tai_tro_id || null,
      nhaTaiTroId: nha_tai_tro_id || null,
      tenChuongTrinh: ten_chuong_trinh.trim(),
      moTa: mo_ta ? mo_ta.trim() : null,
      soLuongSuat: soLuong,
      soTienMoiSuat: soTien,
      loaiHoTro: loai_ho_tro || 'Tai tro khong hoan lai',
      ngayBatDau: ngay_bat_dau || null,
      ngayKetThuc: ngay_ket_thuc || null
    };

    const result = await DeXuatChuongTrinhModel.createProposal(proposalData);

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
      message: "Tạo đề xuất chương trình thành công. Chờ duyệt.",
      data: {
        de_xuat_id: result.insertId,
        quy_thanh_phan_id,
        ten_chuong_trinh: ten_chuong_trinh.trim(),
        so_luong_suat: soLuong,
        so_tien_moi_suat: soTien,
        tong_so_tien: soLuong * soTien,
        trang_thai: 'Cho duyet'
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
      quy_thanh_phan_id,
      ten_chuong_trinh,
      mo_ta,
      so_luong_suat,
      so_tien_moi_suat,
      loai_ho_tro,
      ngay_bat_dau,
      ngay_ket_thuc
    } = req.body;

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

    if (fund.trangthai !== 'Dang hoat dong') {
      return res.status(400).json({
        success: false,
        message: "Quỹ hiện không hoạt động"
      });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 3: TẠO ĐỀ XUẤT + GUEST TRACKING
    // ─────────────────────────────────────────────────────────────────────────
    const { v4: uuidv4 } = await import('uuid');
    const crypto = await import('crypto');

    const trackingUuid = uuidv4();
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpSecret = process.env.GUEST_OTP_SECRET || process.env.JWT_SECRET || 'fallback-secret';
    const otpHash = crypto.createHmac('sha256', otpSecret).update(`${guest_email.trim().toLowerCase()}:${trackingUuid}:${otpCode}`).digest('hex');

    const proposalData = {
      quyThanhPhanId: quy_thanh_phan_id,
      tenChuongTrinh: ten_chuong_trinh.trim(),
      moTa: mo_ta ? mo_ta.trim() : null,
      soLuongSuat: soLuong,
      soTienMoiSuat: soTien,
      loaiHoTro: loai_ho_tro || 'Tai tro khong hoan lai',
      ngayBatDau: ngay_bat_dau || null,
      ngayKetThuc: ngay_ket_thuc || null,
      guestHoTen: guest_ho_ten.trim(),
      guestEmail: guest_email.trim().toLowerCase(),
      guestSoDienThoai: guest_so_dien_thoai?.trim() || null,
      trackingUuid,
      otpHash
    };

    const result = await DeXuatChuongTrinhModel.createPublicProposal(proposalData);

    // Ghi nhật ký hệ thống (không có req.user)
    await logSystemActivity(req, {
      hanhdong: "TAO_DE_XUAT_CHUONG_TRINH_CONG_KHAI",
      loaidoituong: "dexuatchuongtrinh",
      doituong_id: result.insertId,
      mota: `Khách vãng lai "${guest_ho_ten.trim()}" tạo đề xuất chương trình "${ten_chuong_trinh.trim()}" cho quỹ "${fund.tenquy}"`,
      dulieumoi: { ...proposalData, guestHoTen: undefined, guestEmail: undefined, guestSoDienThoai: undefined }
    });

    return res.status(201).json({
      success: true,
      message: "Tạo đề xuất chương trình thành công. Vui lòng kiểm tra email để xác thực.",
      data: {
        de_xuat_id: result.insertId,
        quy_thanh_phan_id,
        ten_chuong_trinh: ten_chuong_trinh.trim(),
        so_luong_suat: soLuong,
        so_tien_moi_suat: soTien,
        tong_so_tien: soLuong * soTien,
        trang_thai: 'Cho duyet'
      }
    });
  } catch (error) {
    console.error("Lỗi createPublicProposal:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau"
    });
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
// ─── PUT /api/donations/propose-program/:id/approve (Protect 1) ───────────────
// MỤC ĐÍCH: Admin duyệt đề xuất → tạo quỹ cấp 3 + phân bổ ngân sách
// ═══════════════════════════════════════════════════════════════════════════════
export const approveProposal = async (req, res) => {
  try {
    const { id } = req.params;
    const nguoiDuyetId = req.user.id; // Lấy từ middleware protect

    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 1: VALIDATE ID
    // ─────────────────────────────────────────────────────────────────────────
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "ID đề xuất không hợp lệ"
      });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 2: KIỂM TRA ĐỀ XUẤT CÓ TỒN TẠI KHÔNG
    // ─────────────────────────────────────────────────────────────────────────
    const proposal = await DeXuatChuongTrinhModel.getProposalById(id);

    if (!proposal) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đề xuất chương trình"
      });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 3: KIỂM TRA TRẠNG THÁI HIỆN TẠI
    // ─────────────────────────────────────────────────────────────────────────
    if (proposal.trangthai === 'Da duyet') {
      return res.status(400).json({
        success: false,
        message: "Đề xuất này đã được duyệt trước đó"
      });
    }

    if (proposal.trangthai === 'Tu choi') {
      return res.status(400).json({
        success: false,
        message: "Không thể duyệt đề xuất đã bị từ chối"
      });
    }

    if (proposal.trangthai !== 'Cho duyet') {
      return res.status(400).json({
        success: false,
        message: "Chỉ có thể duyệt đề xuất đang ở trạng thái 'Chờ duyệt'"
      });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 4: KIỂM TRA SỐ DƯ QUỸ THÀNH PHẦN
    // ─────────────────────────────────────────────────────────────────────────
    const soTienCanPhanBo = parseFloat(proposal.soluongsuat) * parseFloat(proposal.sotienmoisuat);
    const soDuQuy = parseFloat(proposal.so_du_quy_thanh_phan) || 0;

    if (soDuQuy < soTienCanPhanBo) {
      return res.status(400).json({
        success: false,
        message: `Quỹ thành phần không đủ số dư. Cần ${soTienCanPhanBo.toLocaleString('vi-VN')} VNĐ, còn ${soDuQuy.toLocaleString('vi-VN')} VNĐ`
      });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 5: THỰC HIỆN DUYỆT VỚI TRANSACTION
    // ─────────────────────────────────────────────────────────────────────────
    // Model sẽ xử lý:
    // - Tạo quỹ cấp 3 mới
    // - Tạo bản ghi phân bổ ngân sách (auto-approve)
    // - Trừ tiền quỹ cấp 2, cộng tiền quỹ cấp 3
    // - Cập nhật trạng thái đề xuất
    const result = await DeXuatChuongTrinhModel.approveProposal(id, nguoiDuyetId);

    // Ghi nhật ký hệ thống
    await logSystemActivity(req, {
      hanhdong: "DUYET_DE_XUAT_CHUONG_TRINH",
      loaidoituong: "dexuatchuongtrinh",
      doituong_id: id,
      mota: `Duyệt đề xuất chương trình "${proposal.tenchuongtrinh}" → Tạo quỹ cấp 3 (ID: ${result.quyMoiId}) và phân bổ ${soTienCanPhanBo.toLocaleString('vi-VN')} VNĐ`,
      dulieucu: { trangthai: proposal.trangthai },
      dulieumoi: {
        trangthai: 'Da duyet',
        quy_ket_qua_id: result.quyMoiId,
        phan_bo_id: result.phanBoId
      }
    });

    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 6: TRẢ VỀ KẾT QUẢ
    // ─────────────────────────────────────────────────────────────────────────
    return res.status(200).json({
      success: true,
      message: "Duyệt đề xuất chương trình thành công",
      data: {
        de_xuat_id: id,
        ten_chuong_trinh: proposal.tenchuongtrinh,
        quy_moi_id: result.quyMoiId,
        phan_bo_id: result.phanBoId,
        so_tien_phan_bo: result.soTienPhanBo,
        trang_thai_cu: proposal.trangthai,
        trang_thai_moi: 'Da duyet',
        ngay_duyet: new Date(),
        nguoi_duyet: nguoiDuyetId
      }
    });
  } catch (error) {
    console.error("Lỗi approveProposal:", error);

    // Xử lý lỗi đặc biệt
    if (error.message === 'PROPOSAL_NOT_FOUND') {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đề xuất chương trình"
      });
    }

    if (error.message === 'PROPOSAL_ALREADY_PROCESSED') {
      return res.status(400).json({
        success: false,
        message: "Đề xuất đã được xử lý trước đó"
      });
    }

    if (error.message === 'PARENT_FUND_NOT_FOUND') {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy quỹ thành phần"
      });
    }

    if (error.message === 'PARENT_FUND_MUST_BE_LEVEL_2') {
      return res.status(400).json({
        success: false,
        message: "Chỉ có thể tạo chương trình từ quỹ thành phần (cấp 2)"
      });
    }

    if (error.message === 'INSUFFICIENT_PARENT_FUND_BALANCE') {
      return res.status(400).json({
        success: false,
        message: "Quỹ thành phần không đủ số dư"
      });
    }

    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// ─── PUT /api/donations/propose-program/:id/reject (Protect 1) ────────────────
// MỤC ĐÍCH: Admin từ chối đề xuất (tiền vẫn ở quỹ thành phần)
// ═══════════════════════════════════════════════════════════════════════════════
export const rejectProposal = async (req, res) => {
  try {
    const { id } = req.params;
    const { ly_do_tu_choi } = req.body;
    const nguoiTuChoiId = req.user.id;

    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 1: VALIDATE
    // ─────────────────────────────────────────────────────────────────────────
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "ID đề xuất không hợp lệ"
      });
    }

    if (!ly_do_tu_choi || ly_do_tu_choi.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập lý do từ chối"
      });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 2: KIỂM TRA ĐỀ XUẤT
    // ─────────────────────────────────────────────────────────────────────────
    const proposal = await DeXuatChuongTrinhModel.getProposalById(id);

    if (!proposal) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đề xuất chương trình"
      });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 3: KIỂM TRA TRẠNG THÁI
    // ─────────────────────────────────────────────────────────────────────────
    if (proposal.trangthai === 'Da duyet') {
      return res.status(400).json({
        success: false,
        message: "Không thể từ chối đề xuất đã được duyệt"
      });
    }

    if (proposal.trangthai === 'Tu choi') {
      return res.status(400).json({
        success: false,
        message: "Đề xuất này đã bị từ chối trước đó"
      });
    }

    if (proposal.trangthai !== 'Cho duyet') {
      return res.status(400).json({
        success: false,
        message: "Chỉ có thể từ chối đề xuất đang ở trạng thái 'Chờ duyệt'"
      });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 4: THỰC HIỆN TỪ CHỐI
    // ─────────────────────────────────────────────────────────────────────────
    const success = await DeXuatChuongTrinhModel.rejectProposal(
      id,
      nguoiTuChoiId,
      ly_do_tu_choi.trim()
    );

    if (!success) {
      return res.status(400).json({
        success: false,
        message: "Không thể từ chối đề xuất. Vui lòng thử lại"
      });
    }

    // Ghi nhật ký hệ thống
    await logSystemActivity(req, {
      hanhdong: "TU_CHOI_DE_XUAT_CHUONG_TRINH",
      loaidoituong: "dexuatchuongtrinh",
      doituong_id: id,
      mota: `Từ chối đề xuất chương trình "${proposal.tenchuongtrinh}". Lý do: ${ly_do_tu_choi.trim()}`,
      dulieucu: { trangthai: proposal.trangthai },
      dulieumoi: { trangthai: 'Tu choi', ly_do_tu_choi: ly_do_tu_choi.trim() }
    });

    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 5: TRẢ VỀ KẾT QUẢ
    // ─────────────────────────────────────────────────────────────────────────
    return res.status(200).json({
      success: true,
      message: "Từ chối đề xuất chương trình thành công",
      data: {
        de_xuat_id: id,
        ten_chuong_trinh: proposal.tenchuongtrinh,
        trang_thai_cu: proposal.trangthai,
        trang_thai_moi: 'Tu choi',
        ly_do_tu_choi: ly_do_tu_choi.trim(),
        ngay_tu_choi: new Date(),
        nguoi_tu_choi: nguoiTuChoiId
      }
    });
  } catch (error) {
    console.error("Lỗi rejectProposal:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau"
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
