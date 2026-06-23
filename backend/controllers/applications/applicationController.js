import ApplicationModel from "../../models/applications/ApplicationModel.js";
import FundModel from "../../models/funds/FundModel.js";
import PheDuyetModel from "../../models/applications/PheDuyetModel.js";
import TransactionModel from "../../models/transactions/TransactionModel.js";
import pool from "../../config/db.js";
import { logSystemActivity } from "../../utils/helpers/loggerHelper.js";


// ═══════════════════════════════════════════════════════════════════════════════
// ─── POST /api/applications (SINH VIÊN NỘP ĐơN XIN HỖ TRỢ) ───────────────────
// ═══════════════════════════════════════════════════════════════════════════════
// 
// CÔNG DỤNG: Sinh viên tạo đơn xin hỗ trợ từ quỹ
// 
// LUỒNG HOẠT ĐỘNG:
// 1. Sinh viên đăng nhập → Lấy user_id từ token
// 2. Validate dữ liệu đầu vào (tiêu đề, mô tả, số tiền, quỹ)
// 3. Kiểm tra quỹ có tồn tại và đang hoạt động
// 4. Tạo đơn xin hỗ trợ với trạng thái "Chờ duyệt"
// 5. Trả về thông tin đơn vừa tạo
//
// YÊU CẦU:
// - Token hợp lệ (protect middleware)
// - Role = 4 (Sinh viên) - authorizeRoles(4)
//
export const createApplication = async (req, res) => {
  try {
    const {
      quyId,
      tieuDe,
      moTa,
      soTienYeuCau,
      fileDinhKem
    } = req.body;

    // Lấy user_id từ token (đã được set bởi protect middleware)
    const userId = req.user.id;

    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 1: VALIDATE DỮ LIỆU ĐẦU VÀO
    // ─────────────────────────────────────────────────────────────────────────
    
    if (!quyId || !tieuDe || !moTa || !soTienYeuCau || !fileDinhKem) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ thông tin: quỹ, tiêu đề, mô tả, số tiền yêu cầu, file đính kèm",
      });
    }

    // Validate file đính kèm (bắt buộc)
    if (!fileDinhKem || fileDinhKem.trim() === '') {
      return res.status(400).json({
        success: false,
        message: "Vui lòng đính kèm file minh chứng (PDF, JPG, PNG)",
      });
    }

    // Validate định dạng file (chỉ chấp nhận pdf, jpg, jpeg, png)
    const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png'];
    const fileExtension = fileDinhKem.toLowerCase().substring(fileDinhKem.lastIndexOf('.'));
    
    if (!allowedExtensions.includes(fileExtension)) {
      return res.status(400).json({
        success: false,
        message: "File đính kèm chỉ chấp nhận định dạng: PDF, JPG, PNG",
      });
    }

    // Validate file path (phải có định dạng hợp lệ)
    // Chấp nhận cả URL đầy đủ hoặc đường dẫn tương đối
    const isValidPath = fileDinhKem.trim().length > 0 && 
                        (fileDinhKem.includes('/') || fileDinhKem.includes('\\'));
    
    if (!isValidPath) {
      return res.status(400).json({
        success: false,
        message: "Đường dẫn file đính kèm không hợp lệ",
      });
    }

    // Validate tiêu đề (không quá dài)
    if (tieuDe.trim().length < 10 || tieuDe.trim().length > 200) {
      return res.status(400).json({
        success: false,
        message: "Tiêu đề phải từ 10 đến 200 ký tự",
      });
    }

    // Validate mô tả (phải có nội dung)
    if (moTa.trim().length < 50) {
      return res.status(400).json({
        success: false,
        message: "Mô tả phải có ít nhất 50 ký tự",
      });
    }

    // Validate số tiền (phải > 0 và <= 50 triệu)
    if (isNaN(soTienYeuCau) || soTienYeuCau <= 0) {
      return res.status(400).json({
        success: false,
        message: "Số tiền yêu cầu phải lớn hơn 0",
      });
    }

    if (soTienYeuCau > 50000000) {
      return res.status(400).json({
        success: false,
        message: "Số tiền yêu cầu không được vượt quá 50 triệu đồng",
      });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 2: KIỂM TRA QUỸ CÓ TỒN TẠI VÀ ĐANG HOẠT ĐỘNG
    // ─────────────────────────────────────────────────────────────────────────
    
    const fund = await FundModel.getFundById(quyId);
    
    if (!fund) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy quỹ",
      });
    }

    // Chỉ cho phép nộp đơn vào quỹ đang hoạt động
    if (fund.trang_thai !== 'Dang hoat dong') {
      return res.status(400).json({
        success: false,
        message: "Quỹ hiện không nhận đơn xin hỗ trợ",
      });
    }

    // Kiểm tra số dư quỹ có đủ không
    if (fund.so_du < soTienYeuCau) {
      return res.status(400).json({
        success: false,
        message: `Quỹ không đủ số dư. Số dư hiện tại: ${fund.so_du.toLocaleString('vi-VN')} VNĐ`,
      });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 3: TẠO ĐƠN XIN HỖ TRỢ
    // ─────────────────────────────────────────────────────────────────────────
    
    const applicationData = {
      nguoiDungId: userId,
      quyId,
      lyDo: moTa.trim(),
      soTienDeNghi: parseFloat(soTienYeuCau),
      taiLieuDinhKem: fileDinhKem.trim() // Bắt buộc, đã validate ở trên
    };

    const result = await ApplicationModel.createApplication(applicationData);

    // Ghi nhật ký hệ thống
    await logSystemActivity(req, {
      hanhdong: "NOP_YEU_CAU_HO_TRO",
      loaidoituong: "yeucauhotro",
      doituong_id: result.yeucauhotroId,
      mota: `Nộp đơn xin hỗ trợ từ quỹ '${fund.ten_quy}' với số tiền đề nghị: ${parseFloat(soTienYeuCau).toLocaleString('vi-VN')} VNĐ`,
      dulieumoi: applicationData
    });

    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 4: TẠO 3 DÒNG PHÊ DUYỆT (Cấp 1, Cấp 2, Cấp 3)
    // ─────────────────────────────────────────────────────────────────────────
    
    await PheDuyetModel.createPheDuyet(result.yeucauhotroId);

    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 5: TRẢ VỀ KẾT QUẢ
    // ─────────────────────────────────────────────────────────────────────────
    
    return res.status(201).json({
      success: true,
      message: "Nộp đơn xin hỗ trợ thành công. Đơn của bạn đang chờ duyệt.",
      data: {
        requestId: result.yeucauhotroId,
        tieuDe: tieuDe || (moTa ? moTa.substring(0, 50) : ""),
        soTienYeuCau: applicationData.soTienDeNghi,
        quy: {
          id: fund.quy_id,
          tenQuy: fund.ten_quy,
          loaiQuy: fund.loai_quy
        },
        trangThai: 'Cho duyet cap 1',
        ngayNop: new Date(),
        thongBao: "Đơn của bạn đã được tạo thành công và đang chờ Giáo vụ xét duyệt. Bạn sẽ nhận được thông báo qua email khi đơn được xử lý."
      }
    });
  } catch (error) {
    console.error("=== CREATE APPLICATION ERROR ===");
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    console.error("Error details:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau",
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// ─── GET /api/applications/my (SINH VIÊN XEM ĐƠN CỦA MÌNH) ────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
//
// CÔNG DỤNG: Sinh viên xem danh sách đơn đã nộp
//
export const getMyApplications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    const applications = await ApplicationModel.getApplicationsByUser(
      userId,
      limitNum,
      offset
    );
    const total = await ApplicationModel.countApplicationsByUser(userId);

    // Helper function to normalize status
    const normalizeStatus = (status) => {
      const statusMap = {
        'Cho duyet cap 1': 'CHO_DUYET',
        'Da duyet cap 1': 'DANG_XU_LY',
        'Tu choi cap 1': 'TU_CHOI',
        'Cho duyet cap 2': 'DANG_XU_LY',
        'Da duyet cap 2': 'DANG_XU_LY',
        'Tu choi cap 2': 'TU_CHOI',
        'Cho duyet cap 3': 'DANG_XU_LY',
        'Da duyet cap 3': 'CHO_GIAI_NGAN',
        'Tu choi cap 3': 'TU_CHOI',
        'Cho giai ngan': 'CHO_GIAI_NGAN',
        'Da giai ngan': 'DA_GIAI_NGAN',
        'Tu choi': 'TU_CHOI',
        
        // old values fallback
        'Cho duyet': 'CHO_DUYET',
        'Dang xu ly': 'DANG_XU_LY',
      };
      return statusMap[status] || status || 'CHO_DUYET';
    };

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách đơn thành công",
      total,
      page: pageNum,
      limit: limitNum,
      data: applications.map(app => ({
        requestId: app.yeucauhotro_id,
        tieuDe: app.lydo ? (app.lydo.substring(0, 50) + (app.lydo.length > 50 ? '...' : '')) : '',
        moTa: app.lydo,
        soTienYeuCau: parseFloat(app.sotiendenghi),
        trangThai: normalizeStatus(app.trangthai),
        quy: {
          id: app.quy_id,
          tenQuy: app.tenquy
        },
        ngayNop: app.ngaynop
      }))
    });
  } catch (error) {
    console.error("Lỗi getMyApplications:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau",
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// ─── GET /api/applications/:id (XEM CHI TIẾT ĐƠN) ─────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
//
// CÔNG DỤNG: Xem chi tiết 1 đơn xin hỗ trợ
// - Sinh viên chỉ xem được đơn của mình
// - Admin/Giáo vụ xem được tất cả
//
export const getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.roleId;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "ID đơn không hợp lệ",
      });
    }

    const application = await ApplicationModel.getApplicationById(id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn xin hỗ trợ",
      });
    }

    // Kiểm tra quyền: Sinh viên chỉ xem được đơn của mình
    if (userRole === 4 && application.nguoidung_id !== userId) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền xem đơn này",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Lấy thông tin đơn thành công",
      data: {
        requestId: application.yeucauhotro_id,
        tieuDe: application.lydo ? (application.lydo.substring(0, 50) + (application.lydo.length > 50 ? '...' : '')) : '',
        moTa: application.lydo,
        lyDo: application.lydo,
        soTienYeuCau: parseFloat(application.sotiendenghi),
        fileDinhKem: application.tailieudinhkem,
        trangThai: application.trangthai,
        nguoiNop: {
          id: application.nguoidung_id,
          hoTen: application.nguoi_nop_ho_ten,
          email: application.nguoi_nop_email,
          maSoDinhDanh: application.masodinhdanh
        },
        quy: {
          id: application.quy_id,
          tenQuy: application.tenquy,
          loaiQuy: application.loaiquy_id,
          soDu: parseFloat(application.quy_so_du || 0)
        },
        nguoiDuyet: application.nguoiduyet_id ? {
          id: application.nguoiduyet_id,
          hoTen: application.nguoi_duyet_ho_ten,
          email: application.nguoi_duyet_email
        } : null,
        ngayDuyet: application.ngayduyet,
        lyDoTuChoi: application.ghichu,
        ghichu: application.ghichu,
        ngayNop: application.ngaynop,
        ngayCapNhat: application.ngaycapnhat
      }
    });
  } catch (error) {
    console.error("Lỗi getApplicationById:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau",
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// ─── GET /api/applications (ADMIN/GIÁO VỤ XEM TẤT CẢ ĐƠN) ────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
//
// CÔNG DỤNG: Admin/Giáo vụ xem tất cả đơn xin hỗ trợ với filters
//
export const getAllApplications = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      trangThai,
      quyId,
      userId
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    let trangThaiFilter = null;
    if (trangThai) {
      const parts = String(trangThai)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      if (parts.length > 1) {
        trangThaiFilter = parts;
      } else if (parts.length === 1) {
        trangThaiFilter = parts[0];
      }
    }

    const filters = {
      trangThai: trangThaiFilter,
      quyId: quyId ? parseInt(quyId) : null,
      nguoiDungId: userId ? parseInt(userId) : null
    };

    const result = await ApplicationModel.getAllApplications(
      filters,
      limitNum,
      offset
    );

    const totalPages = Math.ceil(result.total / limitNum);

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách đơn thành công",
      data: result.applications.map(app => ({
        requestId: app.yeucauhotro_id,
        tieuDe: app.lydo ? (app.lydo.substring(0, 50) + (app.lydo.length > 50 ? '...' : '')) : '',
        moTa: app.lydo,
        soTienYeuCau: parseFloat(app.sotiendenghi),
        trangThai: app.trangthai,
        nguoiNop: {
          id: app.nguoidung_id,
          hoTen: app.nguoi_nop_ho_ten,
          email: app.nguoi_nop_email,
          maSoDinhDanh: app.masodinhdanh
        },
        quy: {
          id: app.quy_id,
          tenQuy: app.tenquy,
          soDu: parseFloat(app.quy_so_du || 0)
        },
        ngayNop: app.ngaynop
      })),
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalRecords: result.total,
        limit: limitNum
      }
    });
  } catch (error) {
    console.error("Lỗi getAllApplications:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau",
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// ─── PUT /api/applications/:id/reject (TỪ CHỐI ĐƠN) ──────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
//
// CÔNG DỤNG: Admin/Giáo vụ từ chối đơn xin hỗ trợ tại bất kỳ cấp nào
// 
// LUỒNG HOẠT ĐỘNG:
// 1. Validate lý do từ chối (bắt buộc)
// 2. Kiểm tra đơn tồn tại
// 3. Kiểm tra trạng thái hiện tại (chỉ từ chối đơn đang chờ duyệt hoặc đang xử lý)
// 4. Lấy cấp độ duyệt hiện tại
// 5. Cập nhật PheDuyet: cấp hiện tại → ket_qua = 'Tu choi'
// 6. Cập nhật YeuCauHoTro: trang_thai = 'Tu choi', ly_do_tu_choi
// 7. Trả về kết quả
//
export const rejectApplication = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const { lyDoTuChoi, ghiChu } = req.body;
    const nguoiDuyetId = req.user.id;

    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 1: VALIDATE DỮ LIỆU ĐẦU VÀO
    // ─────────────────────────────────────────────────────────────────────────
    
    if (!id || isNaN(id)) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: "ID đơn không hợp lệ",
      });
    }

    // Bắt buộc phải có lý do từ chối
    if (!lyDoTuChoi || lyDoTuChoi.trim() === '') {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp lý do từ chối",
      });
    }

    // Validate độ dài lý do từ chối
    if (lyDoTuChoi.trim().length < 10) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: "Lý do từ chối phải có ít nhất 10 ký tự",
      });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 2: KIỂM TRA ĐƠN TỒN TẠI
    // ─────────────────────────────────────────────────────────────────────────
    
    const application = await ApplicationModel.getApplicationById(id);
    
    if (!application) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn xin hỗ trợ",
      });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 3: KIỂM TRA TRẠNG THÁI HIỆN TẠI
    // ─────────────────────────────────────────────────────────────────────────
    
    const currentStatus = application.trangthai;

    // Không cho phép từ chối đơn đã giải ngân
    if (currentStatus === 'Da giai ngan') {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: "Không thể từ chối đơn đã được giải ngân",
      });
    }

    // Không cho phép từ chối đơn đã bị từ chối trước đó
    if (['Tu choi', 'Tu choi cap 1', 'Tu choi cap 2', 'Tu choi cap 3'].includes(currentStatus)) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: "Đơn này đã bị từ chối trước đó",
      });
    }

    // Chỉ cho phép từ chối đơn ở trạng thái chờ duyệt hoặc chờ giải ngân
    if (!['Cho duyet', 'Cho duyet cap 1', 'Cho duyet cap 2', 'Cho duyet cap 3', 'Dang xu ly', 'Cho giai ngan'].includes(currentStatus)) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: `Không thể từ chối đơn ở trạng thái "${currentStatus}"`,
      });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 4: LẤY CẤP ĐỘ DUYỆT HIỆN TẠI
    // ─────────────────────────────────────────────────────────────────────────
    
    const capHienTai = await PheDuyetModel.getCapDoDuyetHienTai(id);
    
    // Nếu không tìm thấy cấp đang chờ duyệt, có thể đơn đã duyệt đủ 3 cấp và đang chờ giải ngân
    // Trong trường hợp này, vẫn cho phép từ chối (ví dụ: phát hiện gian lận sau khi duyệt)
    let capDuyet = 0;
    if (capHienTai) {
      capDuyet = capHienTai.capduyet;
    } else {
      // Nếu không có cấp nào đang chờ, tìm cấp cuối cùng đã duyệt
      const danhSachPheDuyet = await PheDuyetModel.getPheDuyetByRequestId(id);
      const capDaDuyet = danhSachPheDuyet.filter(pd => pd.ketqua === 'Da duyet');
      if (capDaDuyet.length > 0) {
        // Lấy cấp cao nhất đã duyệt
        capDuyet = Math.max(...capDaDuyet.map(pd => pd.capduyet));
      } else {
        capDuyet = 1; // Mặc định là cấp 1 nếu chưa có cấp nào duyệt
      }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 5: CẬP NHẬT PHÊ DUYỆT CẤP HIỆN TẠI
    // ─────────────────────────────────────────────────────────────────────────
    
    await PheDuyetModel.updatePheDuyet(
      id,
      capDuyet,
      nguoiDuyetId,
      'Tu choi',
      ghiChu || null,
      lyDoTuChoi.trim(),
      connection
    );

    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 6: CẬP NHẬT TRẠNG THÁI ĐƠN
    // ─────────────────────────────────────────────────────────────────────────
    
    const targetRejectStatus = `Tu choi cap ${capDuyet}`;
    await ApplicationModel.updateTuChoi(id, targetRejectStatus, lyDoTuChoi.trim(), connection);

    // Ghi nhật ký hệ thống
    await logSystemActivity(req, {
      hanhdong: "TU_CHOI_YEU_CAU_HO_TRO",
      loaidoituong: "yeucauhotro",
      doituong_id: id,
      mota: `Từ chối đơn xin hỗ trợ ID ${id} ở cấp duyệt ${capDuyet}. Lý do: ${lyDoTuChoi.trim()}`,
      dulieucu: { trangthai: currentStatus },
      dulieumoi: { trangthai: targetRejectStatus, lydotuchoi: lyDoTuChoi.trim() }
    });

    await connection.commit();

    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 7: TRẢ VỀ KẾT QUẢ
    // ─────────────────────────────────────────────────────────────────────────

    return res.status(200).json({
      success: true,
      message: `Từ chối đơn xin hỗ trợ tại cấp ${capDuyet} thành công`,
      data: {
        requestId: parseInt(id),
        tieuDe: application.lydo ? (application.lydo.substring(0, 50) + (application.lydo.length > 50 ? '...' : '')) : '',
        soTienYeuCau: parseFloat(application.sotiendenghi),
        capDuyet: capDuyet,
        trangThaiCu: currentStatus,
        trangThaiMoi: targetRejectStatus,
        lyDoTuChoi: lyDoTuChoi.trim(),
        nguoiTuChoi: {
          id: nguoiDuyetId,
          hoTen: req.user.hoten || req.user.hoTen || "",
          email: req.user.email || ""
        },
        ngayTuChoi: new Date(),
        thongBao: "Đơn đã bị từ chối. Sinh viên sẽ nhận được thông báo qua email."
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error("Lỗi rejectApplication:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau",
    });
  } finally {
    connection.release();
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// ─── PUT /api/applications/:id/staff-approve (GIÁO VỤ DUYỆT CẤP 1) ───────────
// ═══════════════════════════════════════════════════════════════════════════════
//
// CÔNG DỤNG: Giáo vụ duyệt đơn xin hỗ trợ ở cấp 1
// 
// LUỒNG HOẠT ĐỘNG:
// 1. Kiểm tra đơn tồn tại
// 2. Kiểm tra trạng thái đơn = 'Cho duyet' (chỉ duyệt đơn mới)
// 3. Kiểm tra cấp độ duyệt hiện tại phải là cấp 1
// 4. Cập nhật PheDuyet cấp 1: ket_qua = 'Da duyet', nguoi_duyet_id, ngay_duyet
// 5. Cập nhật YeuCauHoTro: trang_thai = 'Dang xu ly'
// 6. Trả về kết quả
//
export const staffApprove = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const { ghiChu } = req.body;
    const nguoiDuyetId = req.user.id;

    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 1: VALIDATE DỮ LIỆU ĐẦU VÀO
    // ─────────────────────────────────────────────────────────────────────────
    
    if (!id || isNaN(id)) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: "ID đơn không hợp lệ",
      });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 2: KIỂM TRA ĐƠN TỒN TẠI
    // ─────────────────────────────────────────────────────────────────────────
    
    const application = await ApplicationModel.getApplicationById(id);
    
    if (!application) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn xin hỗ trợ",
      });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 3: KIỂM TRA TRẠNG THÁI HIỆN TẠI
    // ─────────────────────────────────────────────────────────────────────────
    
    const currentStatus = application.trangthai;

    // Chỉ cho phép duyệt đơn ở trạng thái "Cho duyet cap 1" hoặc "Cho duyet"
    if (currentStatus !== 'Cho duyet' && currentStatus !== 'Cho duyet cap 1') {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: `Không thể duyệt đơn ở trạng thái "${currentStatus}".
         Chỉ duyệt được đơn ở trạng thái "Chờ duyệt cấp 1".`,
      });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 4: KIỂM TRA CẤP ĐỘ DUYỆT HIỆN TẠI
    // ─────────────────────────────────────────────────────────────────────────
    
    const capHienTai = await PheDuyetModel.getCapDoDuyetHienTai(id);
    
    if (!capHienTai) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: "Không tìm thấy thông tin phê duyệt hoặc đơn đã được duyệt hết",
      });
    }

    // Giáo vụ chỉ duyệt cấp 1
    if (capHienTai.capduyet !== 1) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: `Đơn này đang ở cấp ${capHienTai.capduyet}. Giáo vụ chỉ duyệt được cấp 1.`,
      });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 5: CẬP NHẬT PHÊ DUYỆT CẤP 1
    // ─────────────────────────────────────────────────────────────────────────
    
    await PheDuyetModel.updatePheDuyet(
      id,
      1, // cấp 1
      nguoiDuyetId,
      'Da duyet',
      ghiChu || null,
      null, // không có lý do từ chối
      connection
    );

    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 6: CẬP NHẬT TRẠNG THÁI ĐƠN
    // ─────────────────────────────────────────────────────────────────────────
    
    await ApplicationModel.updateApplicationStatus(id, 'Cho duyet cap 2', connection);

    // Ghi nhật ký hệ thống
    await logSystemActivity(req, {
      hanhdong: "DUYET_YEU_CAU_HO_TRO_CAP_1",
      loaidoituong: "yeucauhotro",
      doituong_id: id,
      mota: `Duyệt đơn xin hỗ trợ ID ${id} ở cấp 1 (Cán bộ Quỹ/Giáo vụ). Trạng thái đổi thành 'Chờ duyệt cấp 2'`,
      dulieucu: { trangthai: 'Cho duyet cap 1' },
      dulieumoi: { trangthai: 'Cho duyet cap 2' }
    });

    await connection.commit();

    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 7: TRẢ VỀ KẾT QUẢ
    // ─────────────────────────────────────────────────────────────────────────

    return res.status(200).json({
      success: true,
      message: "Duyệt đơn xin hỗ trợ cấp 1 thành công",
      data: {
        requestId: parseInt(id),
        tieuDe: application.lydo ? (application.lydo.substring(0, 50) + (application.lydo.length > 50 ? '...' : '')) : '',
        soTienYeuCau: parseFloat(application.sotiendenghi),
        capDuyet: 1,
        trangThaiCu: 'Cho duyet cap 1',
        trangThaiMoi: 'Cho duyet cap 2',
        nguoiDuyet: {
          id: nguoiDuyetId,
          hoTen: req.user.hoten || req.user.hoTen || "",
          email: req.user.email || "",
          vaiTro: 'Giáo vụ'
        },
        ngayDuyet: new Date(),
        thongBao: "Đơn đã được Giáo vụ duyệt cấp 1. Chờ cấp 2 duyệt tiếp."
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error("Lỗi staffApprove:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau",
    });
  } finally {
    connection.release();
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// ─── PUT /api/applications/:id/admin-approve (ADMIN DUYỆT CẤP 2) ─────────────
// ═══════════════════════════════════════════════════════════════════════════════
//
// CÔNG DỤNG: Admin duyệt đơn xin hỗ trợ ở cấp 2
// 
// LUỒNG HOẠT ĐỘNG:
// 1. Kiểm tra đơn tồn tại
// 2. Kiểm tra trạng thái đơn = 'Dang xu ly' (đã qua cấp 1)
// 3. Kiểm tra cấp 1 đã duyệt (PheDuyet cấp 1 phải là 'Da duyet')
// 4. Kiểm tra cấp độ duyệt hiện tại phải là cấp 2
// 5. Cập nhật PheDuyet cấp 2: ket_qua = 'Da duyet', nguoi_duyet_id, ngay_duyet
// 6. YeuCauHoTro vẫn giữ: trang_thai = 'Dang xu ly'
// 7. Trả về kết quả
//
export const adminApprove = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const { ghiChu } = req.body;
    const nguoiDuyetId = req.user.id;

    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 1: VALIDATE DỮ LIỆU ĐẦU VÀO
    // ─────────────────────────────────────────────────────────────────────────
    
    if (!id || isNaN(id)) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: "ID đơn không hợp lệ",
      });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 2: KIỂM TRA ĐƠN TỒN TẠI
    // ─────────────────────────────────────────────────────────────────────────
    
    const application = await ApplicationModel.getApplicationById(id);
    
    if (!application) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn xin hỗ trợ",
      });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 3: KIỂM TRA TRẠNG THÁI HIỆN TẠI
    // ─────────────────────────────────────────────────────────────────────────
    const currentStatus = application.trangthai;
    // Chỉ cho phép duyệt đơn ở trạng thái "Cho duyet cap 2" (hoặc "Dang xu ly" cho tương thích cũ)
    if (currentStatus !== 'Cho duyet cap 2' && currentStatus !== 'Dang xu ly') {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: `Không thể duyệt đơn ở trạng thái "${currentStatus}". 
        Admin chỉ duyệt được đơn ở trạng thái "Chờ duyệt cấp 2".`,
      });
    }
    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 4: KIỂM TRA CẤP 1 ĐÃ DUYỆT
    // ─────────────────────────────────────────────────────────────────────────
    const danhSachPheDuyet = await PheDuyetModel.getPheDuyetByRequestId(id);
    const cap1 = danhSachPheDuyet.find(pd => pd.capduyet === 1);
    
    if (!cap1 || cap1.ketqua !== 'Da duyet') {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: "Cấp 1 chưa duyệt. Admin chỉ duyệt được sau khi Giáo vụ duyệt cấp 1.",
      });
    }
    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 5: KIỂM TRA CẤP ĐỘ DUYỆT HIỆN TẠI
    // ─────────────────────────────────────────────────────────────────────────
    const capHienTai = await PheDuyetModel.getCapDoDuyetHienTai(id);
    if (!capHienTai) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: "Không tìm thấy thông tin phê duyệt hoặc đơn đã được duyệt hết",
      });
    }
    // Admin chỉ duyệt cấp 2
    if (capHienTai.capduyet !== 2) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: `Đơn này đang ở cấp ${capHienTai.capduyet}. Admin chỉ duyệt được cấp 2.`,
      });
    }
    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 6: CẬP NHẬT PHÊ DUYỆT CẤP 2
    // ─────────────────────────────────────────────────────────────────────────
    
    await PheDuyetModel.updatePheDuyet(
      id,
      2, // cấp 2
      nguoiDuyetId,
      'Da duyet',
      ghiChu || null,
      null, // không có lý do từ chối
      connection
    );

    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 7: CẬP NHẬT TRẠNG THÁI ĐƠN THÀNH "Cho duyet cap 3"
    // ─────────────────────────────────────────────────────────────────────────
    
    await connection.query(
      `UPDATE yeucauhotro 
       SET trangthai = 'Cho duyet cap 3', 
           ngaycapnhat = NOW() 
       WHERE yeucauhotro_id = ?`,
      [id]
    );

    // Ghi nhật ký hệ thống
    await logSystemActivity(req, {
      hanhdong: "DUYET_YEU_CAU_HO_TRO_CAP_2",
      loaidoituong: "yeucauhotro",
      doituong_id: id,
      mota: `Duyệt đơn xin hỗ trợ ID ${id} ở cấp 2 (Admin). Trạng thái đổi thành 'Chờ duyệt cấp 3'`,
      dulieucu: { trangthai: 'Cho duyet cap 2' },
      dulieumoi: { trangthai: 'Cho duyet cap 3' }
    });

    await connection.commit();

    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 8: TRẢ VỀ KẾT QUẢ
    // ─────────────────────────────────────────────────────────────────────────

    return res.status(200).json({
      success: true,
      message: "Duyệt đơn xin hỗ trợ cấp 2 thành công. Đơn đã chuyển sang trạng thái chờ duyệt cấp 3.",
      data: {
        requestId: parseInt(id),
        tieuDe: application.lydo ? (application.lydo.substring(0, 50) + (application.lydo.length > 50 ? '...' : '')) : '',
        soTienYeuCau: parseFloat(application.sotiendenghi),
        capDuyet: 2,
        trangThaiCu: 'Cho duyet cap 2',
        trangThaiMoi: 'Cho duyet cap 3',
        nguoiDuyet: {
          id: nguoiDuyetId,
          hoTen: req.user.hoten || req.user.hoTen || "",
          email: req.user.email || "",
          vaiTro: 'Admin'
        },
        ngayDuyet: new Date(),
        thongBao: "Đơn đã được Admin duyệt cấp 2. Đơn bây giờ xuất hiện trên màn hình Kế toán để duyệt cấp 3."
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error("Lỗi adminApprove:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau",
    });
  } finally {
    connection.release();
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// ─── POST /api/applications/:id/disburse (KẾ TOÁN DUYỆT CẤP 3 & GIẢI NGÂN) ───
// ═══════════════════════════════════════════════════════════════════════════════
//
// CÔNG DỤNG: Kế toán duyệt đơn xin hỗ trợ ở cấp 3 (cấp cuối) và giải ngân
// 
// LUỒNG HOẠT ĐỘNG:
// 1. Kiểm tra đơn tồn tại
// 2. Kiểm tra trạng thái đơn = 'Dang xu ly' (đã qua cấp 1 và 2)
// 3. Kiểm tra cấp 1 và cấp 2 đã duyệt
// 4. Kiểm tra cấp độ duyệt hiện tại phải là cấp 3
// 5. Lấy số dư quỹ và số tiền yêu cầu
// 6. Kiểm tra số dư quỹ:
//    A. Đủ tiền:
//       - Trừ tiền quỹ
//       - Tạo giao dịch CHI
//       - Cập nhật PheDuyet cấp 3: ket_qua = 'Da duyet'
//       - Cập nhật YeuCauHoTro: trang_thai = 'Da giai ngan'
//    B. Thiếu tiền:
//       - Cập nhật PheDuyet cấp 3: ket_qua = 'Da duyet'
//       - Cập nhật YeuCauHoTro: trang_thai = 'Cho giai ngan'
// 7. Commit transaction
// 8. Trả về kết quả
//
export const disburseApplication = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const { ghiChu, minhChungChuyenKhoan } = req.body;
    const nguoiDuyetId = req.user.id;

    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 1: VALIDATE DỮ LIỆU ĐẦU VÀO
    // ─────────────────────────────────────────────────────────────────────────
    
    if (!id || isNaN(id)) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: "ID đơn không hợp lệ",
      });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 2: KIỂM TRA ĐƠN TỒN TẠI
    // ─────────────────────────────────────────────────────────────────────────
    
    const application = await ApplicationModel.getApplicationById(id);
    
    if (!application) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn xin hỗ trợ",
      });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 3: KIỂM TRA TRẠNG THÁI HIỆN TẠI
    const currentStatus = application.trangthai;
    if (!['Cho duyet cap 3', 'Dang xu ly', 'Cho giai ngan'].includes(currentStatus)) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: `Không thể giải ngân đơn ở trạng thái "${currentStatus}".
         Chỉ chấp nhận "Chờ duyệt cấp 3" hoặc "Chờ giải ngân".`,
      });
    }
    // BƯỚC 4: KIỂM TRA CẤP 1 VÀ CẤP 2 ĐÃ DUYỆT
    const danhSachPheDuyet = await PheDuyetModel.getPheDuyetByRequestId(id);
    const cap1 = danhSachPheDuyet.find(pd => pd.capduyet === 1);
    const cap2 = danhSachPheDuyet.find(pd => pd.capduyet === 2);
    if (!cap1 || cap1.ketqua !== 'Da duyet') {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: "Cấp 1 chưa duyệt. Kế toán chỉ duyệt được sau khi Giáo vụ duyệt cấp 1.",
      });
    }
    if (!cap2 || cap2.ketqua !== 'Da duyet') {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: "Cấp 2 chưa duyệt. Kế toán chỉ duyệt được sau khi Admin duyệt cấp 2.",
      });
    }
    // BƯỚC 5: KIỂM TRA CẤP ĐỘ DUYỆT HIỆN TẠI
    const isRetryDisbursement = currentStatus === 'Cho giai ngan';
    let capHienTai = null;
    if (!isRetryDisbursement) {
      capHienTai = await PheDuyetModel.getCapDoDuyetHienTai(id);
      if (!capHienTai) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: "Không tìm thấy thông tin phê duyệt hoặc đơn đã được duyệt hết",
        });
      }
      // Kế toán chỉ duyệt cấp 3
      if (capHienTai.capduyet !== 3) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: `Đơn này đang ở cấp ${capHienTai.capduyet}. Kế toán chỉ duyệt được cấp 3.`,
        });
      }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 6: LẤY THÔNG TIN QUỸ VÀ SỐ TIỀN YÊU CẦU
    // ─────────────────────────────────────────────────────────────────────────
    
    const fund = await FundModel.getFundById(application.quy_id);
    
    if (!fund) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy quỹ",
      });
    }

    const soDuQuy = parseFloat(fund.so_du);
    const soTienYeuCau = parseFloat(application.sotiendenghi);

    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 7: KIỂM TRA SỐ DƯ QUỸ VÀ XỬ LÝ
    // ─────────────────────────────────────────────────────────────────────────
    
    let trangThaiMoi;
    let transactionId = null;
    let isDisbursed = false;

    if (soDuQuy >= soTienYeuCau) {
      // ═══════════════════════════════════════════════════════════════════════
      // TRƯỜNG HỢP A: ĐỦ TIỀN GIẢI NGÂN
      // ═══════════════════════════════════════════════════════════════════════
      
      // A1. Trừ tiền quỹ
      await connection.execute(
        `UPDATE quy 
         SET sodu = sodu - ?,
             ngaycapnhat = NOW()
         WHERE quy_id = ?`,
        [soTienYeuCau, application.quy_id]
      );

      // A2. Tạo giao dịch CHI
      const transactionResult = await TransactionModel.createTransaction({
        yeucauhotroId: parseInt(id),
        quyId: application.quy_id,
        nguoiNhanId: application.nguoidung_id,
        soTien: soTienYeuCau,
        hinhThuc: 'Chuyen khoan',
        maGiaoDich: null,
        chungTu: minhChungChuyenKhoan || null,
        trangThai: 'Thanh cong',
        ghiChu: ghiChu || `Giải ngân đơn xin hỗ trợ #${id}`,
        nguoiThucHienId: nguoiDuyetId
      }, connection);

      transactionId = transactionResult.insertId;

      // A3. Cập nhật trạng thái đơn
      trangThaiMoi = 'Da giai ngan';
      isDisbursed = true;

    } else {
      // ═══════════════════════════════════════════════════════════════════════
      // TRƯỜNG HỢP B: THIẾU TIỀN, CHỜ GIẢI NGÂN
      // ═══════════════════════════════════════════════════════════════════════
      
      trangThaiMoi = 'Cho giai ngan';
      isDisbursed = false;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 8: CẬP NHẬT PHÊ DUYỆT CẤP 3 (chỉ khi giải ngân lần đầu)
    // ─────────────────────────────────────────────────────────────────────────
    // Nếu đang retry giải ngân (trang_thai='Cho giai ngan'), cấp 3 đã được duyệt
    // trong lần trước → bỏ qua để tránh ghi đè dữ liệu

    if (!isRetryDisbursement) {
      await PheDuyetModel.updatePheDuyet(
        id,
        3, // cấp 3
        nguoiDuyetId,
        'Da duyet',
        ghiChu || null,
        null, // không có lý do từ chối
        connection
      );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 9: CẬP NHẬT TRẠNG THÁI ĐƠN
    // ─────────────────────────────────────────────────────────────────────────
    
    await ApplicationModel.updateApplicationStatus(id, trangThaiMoi, connection);

    // Ghi nhật ký hệ thống
    await logSystemActivity(req, {
      hanhdong: "CAP_NHAT_YEU_CAU_HO_TRO",
      loaidoituong: "yeucauhotro",
      doituong_id: id,
      mota: isDisbursed
        ? `Phê duyệt cấp 3 và giải ngân thành công số tiền ${soTienYeuCau.toLocaleString('vi-VN')} VNĐ từ quỹ '${fund.ten_quy}' cho đơn hỗ trợ ID ${id}`
        : `Phê duyệt cấp 3 thành công đơn hỗ trợ ID ${id}. Chờ giải ngân khi quỹ đủ tiền.`,
      dulieucu: { trangthai: currentStatus },
      dulieumoi: { trangthai: trangThaiMoi }
    });

    await connection.commit();

    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 10: TRẢ VỀ KẾT QUẢ
    // ─────────────────────────────────────────────────────────────────────────

    return res.status(200).json({
      success: true,
      message: isDisbursed 
        ? "Duyệt đơn xin hỗ trợ cấp 3 và giải ngân thành công"
        : "Duyệt đơn xin hỗ trợ cấp 3 thành công. Đơn chờ giải ngân khi quỹ có đủ tiền.",
      data: {
        requestId: parseInt(id),
        tieuDe: application.lydo ? (application.lydo.substring(0, 50) + (application.lydo.length > 50 ? '...' : '')) : '',
        soTienYeuCau: soTienYeuCau,
        capDuyet: 3,
        trangThaiCu: currentStatus,
        trangThaiMoi: trangThaiMoi,
        isDisbursed: isDisbursed,
        quy: {
          id: fund.quy_id,
          tenQuy: fund.ten_quy,
          soDuCu: soDuQuy,
          soDuMoi: isDisbursed ? soDuQuy - soTienYeuCau : soDuQuy
        },
        giaoDich: isDisbursed ? {
          transactionId: transactionId,
          loai: 'Chi',
          soTien: soTienYeuCau,
          trangThai: 'Thanh cong'
        } : null,
        nguoiDuyet: {
          id: nguoiDuyetId,
          hoTen: req.user.hoten || req.user.hoTen || "",
          email: req.user.email || "",
          vaiTro: 'Ke toan'
        },
        ngayDuyet: new Date(),
        thongBao: isDisbursed
          ? "Đơn đã được duyệt đủ 3 cấp và giải ngân thành công. Giao dịch CHI đã được tạo và số dư quỹ đã được cập nhật."
          : `Đơn đã được duyệt đủ 3 cấp nhưng quỹ thiếu ${(soTienYeuCau - soDuQuy).toLocaleString('vi-VN')} VNĐ. Đơn sẽ được giải ngân tự động khi quỹ có đủ tiền.`
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error("Lỗi disburseApplication:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau",
    });
  } finally {
    connection.release();
  }
};

export default {
  createApplication,
  getMyApplications,
  getApplicationById,
  getAllApplications,
  rejectApplication,
  staffApprove,
  adminApprove,
  disburseApplication
};
