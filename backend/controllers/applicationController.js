import ApplicationModel from "../models/ApplicationModel.js";
import FundModel from "../models/FundModel.js";
import PheDuyetModel from "../models/PheDuyetModel.js";
import pool from "../config/db.js";

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

    // Validate URL file (phải là URL hợp lệ)
    const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    if (!urlRegex.test(fileDinhKem.trim())) {
      return res.status(400).json({
        success: false,
        message: "URL file đính kèm không hợp lệ",
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
      userId,
      quyId,
      tieuDe: tieuDe.trim(),
      moTa: moTa.trim(),
      soTienYeuCau: parseFloat(soTienYeuCau),
      fileDinhKem: fileDinhKem.trim() // Bắt buộc, đã validate ở trên
    };

    const result = await ApplicationModel.createApplication(applicationData);

    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 4: TẠO 3 DÒNG PHÊ DUYỆT (Cấp 1, Cấp 2, Cấp 3)
    // ─────────────────────────────────────────────────────────────────────────
    
    await PheDuyetModel.createPheDuyet(result.requestId);

    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 5: TRẢ VỀ KẾT QUẢ
    // ─────────────────────────────────────────────────────────────────────────
    
    return res.status(201).json({
      success: true,
      message: "Nộp đơn xin hỗ trợ thành công. Đơn của bạn đang chờ duyệt.",
      data: {
        requestId: result.requestId,
        tieuDe: applicationData.tieuDe,
        soTienYeuCau: applicationData.soTienYeuCau,
        quy: {
          id: fund.quy_id,
          tenQuy: fund.ten_quy,
          loaiQuy: fund.loai_quy
        },
        trangThai: 'Cho duyet',
        ngayNop: new Date(),
        thongBao: "Đơn của bạn đã được tạo thành công và đang chờ Giáo vụ xét duyệt. Bạn sẽ nhận được thông báo qua email khi đơn được xử lý."
      }
    });
  } catch (error) {
    console.error("Lỗi createApplication:", error);
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

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách đơn thành công",
      data: applications.map(app => ({
        requestId: app.request_id,
        tieuDe: app.tieu_de,
        soTienYeuCau: parseFloat(app.so_tien_yeu_cau),
        trangThai: app.trang_thai,
        quy: {
          id: app.quy_id,
          tenQuy: app.ten_quy
        },
        ngayNop: app.ngay_tao
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
    if (userRole === 4 && application.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền xem đơn này",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Lấy thông tin đơn thành công",
      data: {
        requestId: application.request_id,
        tieuDe: application.tieu_de,
        moTa: application.mo_ta,
        soTienYeuCau: parseFloat(application.so_tien_yeu_cau),
        fileDinhKem: application.file_dinh_kem,
        trangThai: application.trang_thai,
        nguoiNop: {
          id: application.user_id,
          hoTen: application.nguoi_nop_ho_ten,
          email: application.nguoi_nop_email,
          maSoDinhDanh: application.ma_so_dinh_danh
        },
        quy: {
          id: application.quy_id,
          tenQuy: application.ten_quy,
          loaiQuy: application.loai_quy
        },
        nguoiDuyet: application.nguoi_duyet_id ? {
          id: application.nguoi_duyet_id,
          hoTen: application.nguoi_duyet_ho_ten,
          email: application.nguoi_duyet_email
        } : null,
        ngayDuyet: application.ngay_duyet,
        lyDoTuChoi: application.ly_do_tu_choi,
        ngayNop: application.ngay_tao,
        ngayCapNhat: application.ngay_cap_nhat
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

    const filters = {
      trangThai,
      quyId: quyId ? parseInt(quyId) : null,
      userId: userId ? parseInt(userId) : null
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
        requestId: app.request_id,
        tieuDe: app.tieu_de,
        soTienYeuCau: parseFloat(app.so_tien_yeu_cau),
        trangThai: app.trang_thai,
        nguoiNop: {
          id: app.user_id,
          hoTen: app.nguoi_nop_ho_ten,
          email: app.nguoi_nop_email,
          maSoDinhDanh: app.ma_so_dinh_danh
        },
        quy: {
          id: app.quy_id,
          tenQuy: app.ten_quy
        },
        ngayNop: app.ngay_tao
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
    
    const currentStatus = application.trang_thai;

    // Không cho phép từ chối đơn đã giải ngân
    if (currentStatus === 'Da giai ngan') {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: "Không thể từ chối đơn đã được giải ngân",
      });
    }

    // Không cho phép từ chối đơn đã bị từ chối trước đó
    if (currentStatus === 'Tu choi') {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: "Đơn này đã bị từ chối trước đó",
      });
    }

    // Chỉ cho phép từ chối đơn ở trạng thái "Cho duyet", "Dang xu ly", hoặc "Cho giai ngan"
    if (!['Cho duyet', 'Dang xu ly', 'Cho giai ngan'].includes(currentStatus)) {
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
      capDuyet = capHienTai.cap_do_duyet;
    } else {
      // Nếu không có cấp nào đang chờ, tìm cấp cuối cùng đã duyệt
      const danhSachPheDuyet = await PheDuyetModel.getPheDuyetByRequestId(id);
      const capDaDuyet = danhSachPheDuyet.filter(pd => pd.ket_qua === 'Da duyet');
      if (capDaDuyet.length > 0) {
        // Lấy cấp cao nhất đã duyệt
        capDuyet = Math.max(...capDaDuyet.map(pd => pd.cap_do_duyet));
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
    
    await ApplicationModel.updateTuChoi(id, lyDoTuChoi.trim(), connection);

    await connection.commit();

    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 7: TRẢ VỀ KẾT QUẢ
    // ─────────────────────────────────────────────────────────────────────────

    return res.status(200).json({
      success: true,
      message: `Từ chối đơn xin hỗ trợ tại cấp ${capDuyet} thành công`,
      data: {
        requestId: parseInt(id),
        tieuDe: application.tieu_de,
        soTienYeuCau: parseFloat(application.so_tien_yeu_cau),
        capDuyet: capDuyet,
        trangThaiCu: currentStatus,
        trangThaiMoi: 'Tu choi',
        lyDoTuChoi: lyDoTuChoi.trim(),
        nguoiTuChoi: {
          id: nguoiDuyetId,
          hoTen: req.user.hoTen,
          email: req.user.email
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

export default {
  createApplication,
  getMyApplications,
  getApplicationById,
  getAllApplications,
  rejectApplication
};
