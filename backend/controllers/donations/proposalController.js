import ProposalModel from "../../models/donations/ProposalModel.js";
import FundModel from "../../models/funds/FundModel.js";

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
        loaiHinh: loaiHinh || 'Trao tang',
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
