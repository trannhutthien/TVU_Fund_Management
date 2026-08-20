/**
 * Proposal Approval Controller - Luồng duyệt đề xuất chương trình 3 cấp
 * 
 * Luồng:
 * 1. Cán bộ duyệt nội dung
 * 2. Kế toán xác nhận tiền + cộng vào Quỹ Thành Phần
 * 3. Admin duyệt tạo hoạt động (auto-tạo quỹ cấp 3)
 */

import DeXuatChuongTrinhModel from '../../models/donations/DeXuatChuongTrinhModel.js';
import PheDuyetModel from '../../models/applications/PheDuyetModel.js';
import pool from '../../config/db.js';
import { sendSponsorshipReceiptEmail } from '../../services/emailService.js';

// ═══════════════════════════════════════════════════════════════════════════════
// BƯỚC 1: CÁN BỘ DUYỆT NỘI DUNG
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * POST /api/proposals/:id/approve-by-canbo
 * Cán bộ duyệt nội dung đề xuất
 * 
 * Body: {
 *   ghiChu?: string,
 *   quyThanhPhanId?: number  // Cho phép cán bộ sửa quỹ thành phần nếu nhà tài trợ chọn sai
 * }
 */
export const approveByCanBo = async (req, res) => {
  try {
    const { id } = req.params;
    const { ghiChu, quyThanhPhanId } = req.body;
    const canBoId = req.user.id;

    // Kiểm tra quyền: Chỉ cán bộ (vai trò 3) mới được duyệt
    if (req.user.vai_tro !== 3) {
      return res.status(403).json({
        success: false,
        message: 'Chỉ cán bộ mới có quyền duyệt đề xuất'
      });
    }

    const result = await DeXuatChuongTrinhModel.approveByCanBo(
      id,
      canBoId,
      ghiChu || null,
      quyThanhPhanId || null
    );

    res.json({
      success: true,
      message: 'Đã duyệt đề xuất thành công. Chuyển sang bước xác nhận tiền bởi kế toán.',
      data: result
    });
  } catch (error) {
    console.error('Error in approveByCanBo:', error);
    
    if (error.message === 'PROPOSAL_NOT_FOUND') {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đề xuất'
      });
    }
    if (error.message === 'PROPOSAL_ALREADY_PROCESSED') {
      return res.status(400).json({
        success: false,
        message: 'Đề xuất này đã được xử lý'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Lỗi khi duyệt đề xuất',
      error: error.message
    });
  }
};

/**
 * POST /api/proposals/:id/reject-by-canbo
 * Cán bộ từ chối đề xuất
 * 
 * Body: {
 *   lyDoTuChoi: string (required),
 *   ghiChu?: string
 * }
 */
export const rejectByCanBo = async (req, res) => {
  try {
    const { id } = req.params;
    const { lyDoTuChoi, ghiChu } = req.body;
    const canBoId = req.user.id;

    if (!lyDoTuChoi || !lyDoTuChoi.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập lý do từ chối'
      });
    }

    if (req.user.vai_tro !== 3) {
      return res.status(403).json({
        success: false,
        message: 'Chỉ cán bộ mới có quyền từ chối đề xuất'
      });
    }

    const success = await DeXuatChuongTrinhModel.rejectByCanBo(
      id,
      canBoId,
      lyDoTuChoi,
      ghiChu || null
    );

    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đề xuất hoặc đề xuất đã được xử lý'
      });
    }

    res.json({
      success: true,
      message: 'Đã từ chối đề xuất'
    });
  } catch (error) {
    console.error('Error in rejectByCanBo:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi từ chối đề xuất',
      error: error.message
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// BƯỚC 2: KẾ TOÁN XÁC NHẬN TIỀN
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * POST /api/proposals/:id/confirm-money
 * Kế toán xác nhận đã nhận tiền + cộng vào Quỹ Thành Phần
 * 
 * Body: {
 *   soTienThucTe?: number  // Số tiền thực tế nhận được (nếu khác với đề xuất)
 * }
 */
export const confirmMoneyByKeToan = async (req, res) => {
  try {
    const { id } = req.params;
    const { soTienThucTe } = req.body;
    const keToanId = req.user.id;

    // Kiểm tra quyền: Chỉ kế toán (vai trò 2) mới được xác nhận
    if (req.user.vai_tro !== 2) {
      return res.status(403).json({
        success: false,
        message: 'Chỉ kế toán mới có quyền xác nhận tiền'
      });
    }

    // Validate số tiền nếu có
    if (soTienThucTe && (isNaN(soTienThucTe) || soTienThucTe <= 0)) {
      return res.status(400).json({
        success: false,
        message: 'Số tiền thực tế không hợp lệ'
      });
    }

    const result = await DeXuatChuongTrinhModel.confirmMoneyByKeToan(
      id,
      keToanId,
      soTienThucTe || null
    );

    // ─────────────────────────────────────────────────────────────────────────
    // GỬI EMAIL BIÊN LAI (fire-and-forget)
    // ─────────────────────────────────────────────────────────────────────────
    try {
      const proposal = await DeXuatChuongTrinhModel.getProposalById(id);

      const [keToanRows] = await pool.query(
        'SELECT hoten FROM nguoidung WHERE nguoidung_id = ?', [keToanId]
      );
      const tenKeToan = keToanRows[0]?.hoten || 'Kế toán';

      if (proposal) {
        const receiptData = {
          soBienLai: `TVU-BL-${String(id).padStart(6, '0')}`,
          ngayXacNhan: new Date(),
          tenNhaTaiTro: proposal.tennhataitro || 'N/A',
          loaiNhaTaiTro: proposal.loainhataitro || 'N/A',
          email: proposal.nhataitro_email || null,
          soDienThoai: proposal.nhataitro_sodienthoai || null,
          diaChi: proposal.nhataitro_diachi || null,
          soTien: result.soTienDaCong,
          hinhThuc: proposal.hinh_thuc_tai_tro || 'Chuyen khoan',
          maGiaoDich: proposal.ma_giao_dich || null,
          ngayTaiTro: proposal.ngay_tai_tro || proposal.ngaytao,
          tenQuy: proposal.ten_quy_thanh_phan || 'N/A',
          tenNguoiXacNhan: tenKeToan,
        };
        const donorEmail = proposal.nhataitro_email;
        if (donorEmail) {
          sendSponsorshipReceiptEmail(donorEmail, receiptData)
            .catch(err => console.error('[Email] Lỗi gửi biên lai đề xuất:', err.message));
        }
      }
    } catch (emailErr) {
      console.error('[Email] Lỗi chuẩn bị dữ liệu biên lai đề xuất:', emailErr.message);
    }

    res.json({
      success: true,
      message: `Đã xác nhận tiền và cộng ${result.soTienDaCong.toLocaleString('vi-VN')} đ vào Quỹ Thành Phần. Chuyển sang bước duyệt tạo hoạt động bởi admin.`,
      data: result
    });
  } catch (error) {
    console.error('Error in confirmMoneyByKeToan:', error);
    
    if (error.message === 'PROPOSAL_NOT_FOUND') {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đề xuất'
      });
    }
    if (error.message === 'PROPOSAL_NOT_APPROVED_BY_CANBO') {
      return res.status(400).json({
        success: false,
        message: 'Đề xuất chưa được cán bộ duyệt'
      });
    }
    if (error.message === 'FUND_NOT_FOUND') {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy quỹ thành phần'
      });
    }
    if (error.message === 'FUND_MUST_BE_LEVEL_2') {
      return res.status(400).json({
        success: false,
        message: 'Quỹ phải là cấp 2 (Quỹ Thành Phần)'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xác nhận tiền',
      error: error.message
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// BƯỚC 3: ADMIN DUYỆT TẠO HOẠT ĐỘNG
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * POST /api/proposals/:id/create-activity
 * Admin duyệt và tạo hoạt động/chương trình (Quỹ Cấp 3)
 * Trích tiền từ Quỹ Thành Phần → Hoạt động mới
 * 
 * Body: {
 *   ghiChu?: string
 * }
 */
export const createActivityByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { ghiChu } = req.body;
    const adminId = req.user.id;  // Sửa: req.user.nguoidung_id → req.user.id

    // Kiểm tra quyền: Chỉ admin (vai trò 1) mới được tạo hoạt động
    if (req.user.vai_tro !== 1) {  // Sửa: req.user.vaitro → req.user.vai_tro
      return res.status(403).json({
        success: false,
        message: 'Chỉ admin mới có quyền tạo hoạt động'
      });
    }

    const result = await DeXuatChuongTrinhModel.createActivityByAdmin(
      id,
      adminId,
      ghiChu || null
    );

    res.json({
      success: true,
      message: `Đã tạo hoạt động/chương trình thành công! ID hoạt động: ${result.activityId}`,
      data: result
    });
  } catch (error) {
    console.error('Error in createActivityByAdmin:', error);
    
    if (error.message === 'PROPOSAL_NOT_FOUND') {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đề xuất'
      });
    }
    if (error.message === 'PROPOSAL_MONEY_NOT_CONFIRMED') {
      return res.status(400).json({
        success: false,
        message: 'Đề xuất chưa được kế toán xác nhận tiền'
      });
    }
    if (error.message === 'ACTIVITY_ALREADY_CREATED') {
      return res.status(400).json({
        success: false,
        message: 'Hoạt động đã được tạo rồi'
      });
    }
    if (error.message === 'PARENT_FUND_NOT_FOUND') {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy quỹ thành phần'
      });
    }
    if (error.message === 'PARENT_FUND_MUST_BE_LEVEL_2') {
      return res.status(400).json({
        success: false,
        message: 'Quỹ cha phải là cấp 2'
      });
    }
    if (error.message === 'INSUFFICIENT_PARENT_FUND_BALANCE') {
      return res.status(400).json({
        success: false,
        message: 'Ngân sách Quỹ Thành Phần không đủ để tạo hoạt động'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo hoạt động',
      error: error.message
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER: GET PROPOSAL STATUS INFO
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * GET /api/proposals/:id/status
 * Lấy trạng thái chi tiết của đề xuất (để hiển thị timeline)
 */
export const getProposalStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const proposal = await DeXuatChuongTrinhModel.getProposalById(id);

    if (!proposal) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đề xuất'
      });
    }

    // Lấy chuỗi phê duyệt từ bảng pheduyet (Cap 1 = Cán bộ, Cap 2 = Kế toán, Cap 3 = Admin)
    const approvals = await PheDuyetModel.getPheDuyetByProposalId(id);

    // Build timeline
    const timeline = [];

    // Hàm map 1 cấp phê duyệt
    const pushStep = (cap, title, statusKey, pendingDefaultTitle) => {
      const approval = approvals.find(a => a.capduyet === cap);

      if (approval && approval.ketqua === 'Da duyet') {
        timeline.push({
          step: cap,
          title,
          status: 'completed',
          date: approval.ngayduyet,
          user: approval.nguoi_duyet_ho_ten,
          note: approval.ghichu
        });
      } else if (approval && approval.ketqua === 'Tu choi') {
        timeline.push({
          step: cap,
          title: `${title} (từ chối)`,
          status: 'rejected',
          date: approval.ngayduyet,
          user: approval.nguoi_duyet_ho_ten,
          note: approval.lydo || approval.ghichu
        });
      } else if (proposal.trangthai === statusKey) {
        timeline.push({
          step: cap,
          title: pendingDefaultTitle,
          status: 'pending',
          date: null,
          user: null,
          note: null
        });
      }
    };

    pushStep(1, 'Cán bộ duyệt', 'Cho duyet', 'Chờ cán bộ duyệt');
    pushStep(2, 'Kế toán xác nhận tiền', 'Can bo da duyet', 'Chờ kế toán xác nhận tiền');
    pushStep(3, 'Admin tạo hoạt động', 'Da nhan tien', 'Chờ admin duyệt tạo hoạt động');

    res.json({
      success: true,
      data: {
        proposalId: proposal.dexuatchuongtrinh_id,
        currentStatus: proposal.trangthai,
        timeline,
        proposal,
        approvals
      }
    });
  } catch (error) {
    console.error('Error in getProposalStatus:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy trạng thái đề xuất',
      error: error.message
    });
  }
};
