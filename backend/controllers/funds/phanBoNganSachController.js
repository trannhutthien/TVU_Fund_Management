import PhanBoNganSachModel from "../../models/funds/PhanBoNganSachModel.js";
import FundModel from "../../models/funds/FundModel.js";
import { logSystemActivity } from "../../utils/helpers/loggerHelper.js";

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/funds/allocate/request
// Cán bộ gửi đề xuất trích lập ngân sách từ Bể lớn -> Mục chi
// ─────────────────────────────────────────────────────────────────────────────
export const requestAllocation = async (req, res) => {
  try {
    const { quyNguonId, quyDichId, soTien, soQuyetDinh, fileQuyetDinh, ghiChu } = req.body;
    const nguoiDeXuatId = req.user.id;

    // 1. Validate các thông tin bắt buộc
    if (!quyNguonId || !quyDichId || !soTien || !soQuyetDinh) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ thông tin: Quỹ nguồn, Quỹ đích, Số tiền và Số quyết định",
      });
    }

    if (isNaN(soTien) || parseFloat(soTien) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Số tiền trích lập phải lớn hơn 0",
      });
    }

    // 2. Kiểm tra quỹ nguồn (Bể chung)
    const quyNguon = await FundModel.getFundById(quyNguonId);
    if (!quyNguon) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy quỹ nguồn",
      });
    }
    if (quyNguon.loai_dieu_hanh !== 'Tap trung - Be chung') {
      return res.status(400).json({
        success: false,
        message: "Quỹ nguồn phải là Quỹ tập trung (Bể tiền lớn)",
      });
    }
    if (parseFloat(quyNguon.so_du) < parseFloat(soTien)) {
      return res.status(400).json({
        success: false,
        message: `Số dư Quỹ nguồn (${parseFloat(quyNguon.so_du).toLocaleString('vi-VN')} VNĐ) không đủ để trích lập ${parseFloat(soTien).toLocaleString('vi-VN')} VNĐ`,
      });
    }

    // 3. Kiểm tra quỹ đích (Mục chi con)
    const quyDich = await FundModel.getFundById(quyDichId);
    if (!quyDich) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy quỹ đích (mục chi)",
      });
    }
    if (quyDich.loai_dieu_hanh !== 'Tap trung - Muc chi') {
      return res.status(400).json({
        success: false,
        message: "Quỹ đích phải thuộc loại Mục chi",
      });
    }
    if (quyDich.quy_cha_id !== parseInt(quyNguonId)) {
      return res.status(400).json({
        success: false,
        message: `Mục chi '${quyDich.ten_quy}' không thuộc Bể tiền chung '${quyNguon.ten_quy}'`,
      });
    }

    // 4. Lưu đề xuất
    const result = await PhanBoNganSachModel.createRequest({
      quyNguonId,
      quyDichId,
      soTien: parseFloat(soTien),
      soQuyetDinh,
      fileQuyetDinh,
      nguoiDeXuatId,
      ghiChu
    });

    // Ghi nhật ký
    await logSystemActivity(req, {
      hanhdong: "DE_XUAT_TRICH_LAP_NGAN_SACH",
      loaidoituong: "phanbongansach",
      doituong_id: result.insertId,
      mota: `Đề xuất trích lập ngân sách ${parseFloat(soTien).toLocaleString('vi-VN')} VNĐ từ '${quyNguon.ten_quy}' sang '${quyDich.ten_quy}' theo QĐ ${soQuyetDinh}`,
    });

    return res.status(201).json({
      success: true,
      message: "Gửi đề xuất trích lập ngân sách thành công. Đang chờ Admin phê duyệt.",
      requestId: result.insertId
    });
  } catch (error) {
    console.error("Lỗi requestAllocation:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau",
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/funds/allocate/:id/approve
// Admin duyệt đề xuất trích lập ngân sách
// ─────────────────────────────────────────────────────────────────────────────
export const approveAllocation = async (req, res) => {
  try {
    const { id } = req.params;
    const nguoiDuyetId = req.user.id;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "ID đề xuất không hợp lệ",
      });
    }

    const pb = await PhanBoNganSachModel.getRequestById(id);
    if (!pb) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đề xuất trích lập",
      });
    }
    if (pb.trangthai !== 'Cho duyet') {
      return res.status(400).json({
        success: false,
        message: `Đề xuất này đã được xử lý (Trạng thái hiện tại: ${pb.trangthai})`,
      });
    }

    // Thực thi duyệt trong transaction
    const data = await PhanBoNganSachModel.approveRequest(id, nguoiDuyetId);

    // Ghi nhật ký
    await logSystemActivity(req, {
      hanhdong: "DUYET_TRICH_LAP_NGAN_SACH",
      loaidoituong: "phanbongansach",
      doituong_id: parseInt(id),
      mota: `Duyệt trích lập ngân sách ${parseFloat(data.soTien).toLocaleString('vi-VN')} VNĐ từ '${pb.ten_quy_nguon}' sang '${pb.ten_quy_dich}'`,
      dulieucu: { trangthai: 'Cho duyet' },
      dulieumoi: { trangthai: 'Da duyet' }
    });

    return res.status(200).json({
      success: true,
      message: "Phê duyệt trích lập ngân sách thành công. Số dư các quỹ đã được cập nhật.",
      data
    });
  } catch (error) {
    console.error("Lỗi approveAllocation:", error);
    let status = 500;
    let message = "Lỗi server, vui lòng thử lại sau";

    if (error.message === 'INSUFFICIENT_SOURCE_FUND_BALANCE') {
      status = 400;
      message = "Số dư Quỹ nguồn (Bể chung) hiện tại không đủ để hoàn thành trích lập";
    } else if (error.message === 'ALLOCATION_REQUEST_ALREADY_PROCESSED') {
      status = 400;
      message = "Đề xuất này đã được xử lý bởi người khác";
    }

    return res.status(status).json({
      success: false,
      message
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/funds/allocate/:id/reject
// Admin từ chối đề xuất trích lập ngân sách
// ─────────────────────────────────────────────────────────────────────────────
export const rejectAllocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { lyDoTuChoi } = req.body;
    const nguoiDuyetId = req.user.id;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "ID đề xuất không hợp lệ",
      });
    }

    const pb = await PhanBoNganSachModel.getRequestById(id);
    if (!pb) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đề xuất trích lập",
      });
    }
    if (pb.trangthai !== 'Cho duyet') {
      return res.status(400).json({
        success: false,
        message: `Đề xuất này đã được xử lý (Trạng thái hiện tại: ${pb.trangthai})`,
      });
    }

    await PhanBoNganSachModel.rejectRequest(id, nguoiDuyetId, lyDoTuChoi);

    // Ghi nhật ký
    await logSystemActivity(req, {
      hanhdong: "TU_CHOI_TRICH_LAP_NGAN_SACH",
      loaidoituong: "phanbongansach",
      doituong_id: parseInt(id),
      mota: `Từ chối trích lập ngân sách từ '${pb.ten_quy_nguon}' sang '${pb.ten_quy_dich}' với số tiền ${parseFloat(pb.sotien).toLocaleString('vi-VN')} VNĐ. Lý do: ${lyDoTuChoi || 'Không có'}`,
      dulieucu: { trangthai: 'Cho duyet' },
      dulieumoi: { trangthai: 'Tu choi', lydotuchoi: lyDoTuChoi }
    });

    return res.status(200).json({
      success: true,
      message: "Từ chối đề xuất trích lập ngân sách thành công"
    });
  } catch (error) {
    console.error("Lỗi rejectAllocation:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau",
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/funds/allocate/:id/rollback
// Admin/Kế toán thu hồi ngân sách trích lập nhầm
// ─────────────────────────────────────────────────────────────────────────────
export const rollbackAllocation = async (req, res) => {
  try {
    const { id } = req.params;
    const nguoiDuyetId = req.user.id;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "ID đề xuất không hợp lệ",
      });
    }

    const pb = await PhanBoNganSachModel.getRequestById(id);
    if (!pb) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đề xuất trích lập",
      });
    }
    if (pb.trangthai !== 'Da duyet') {
      return res.status(400).json({
        success: false,
        message: `Chỉ có thể thu hồi đề xuất trích lập đã phê duyệt thành công (Trạng thái hiện tại: ${pb.trangthai})`,
      });
    }

    // Thực thi thu hồi trong transaction
    const data = await PhanBoNganSachModel.rollbackRequest(id, nguoiDuyetId);

    // Ghi nhật ký
    await logSystemActivity(req, {
      hanhdong: "THU_HOI_TRICH_LAP_NGAN_SACH",
      loaidoituong: "phanbongansach",
      doituong_id: parseInt(id),
      mota: `Thu hồi khoản trích lập ngân sách ${parseFloat(data.soTien).toLocaleString('vi-VN')} VNĐ của mục chi '${pb.ten_quy_dich}' trả lại bể lớn '${pb.ten_quy_nguon}'`,
      dulieucu: { trangthai: 'Da duyet' },
      dulieumoi: { trangthai: 'Da thu hoi' }
    });

    return res.status(200).json({
      success: true,
      message: "Thu hồi ngân sách đã trích lập thành công. Dòng tiền đã được điều chuyển hoàn trả.",
      data
    });
  } catch (error) {
    console.error("Lỗi rollbackAllocation:", error);
    let status = 500;
    let message = "Lỗi server, vui lòng thử lại sau";

    if (error.message === 'INSUFFICIENT_DESTINATION_FUND_BALANCE_FOR_ROLLBACK') {
      status = 400;
      message = "Số dư hiện tại của Mục chi con không đủ để thực hiện thu hồi ngân sách (tiền đã được chi tiêu cho sinh viên)";
    } else if (error.message === 'ALLOCATION_REQUEST_CANNOT_BE_ROLLED_BACK') {
      status = 400;
      message = "Đề xuất này không ở trạng thái hợp lệ để thu hồi";
    }

    return res.status(status).json({
      success: false,
      message
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/funds/allocate
// Lấy danh sách yêu cầu trích lập ngân sách (Filters + Pagination)
// ─────────────────────────────────────────────────────────────────────────────
export const getAllocationRequests = async (req, res) => {
  try {
    const { quy_nguon_id, quy_dich_id, trang_thai, page = 1, page_size = 15 } = req.query;

    const result = await PhanBoNganSachModel.listRequests({
      quy_nguon_id,
      quy_dich_id,
      trang_thai,
      page: parseInt(page),
      page_size: parseInt(page_size)
    });

    return res.status(200).json({
      success: true,
      total: result.total,
      data: result.rows.map(item => ({
        phanBoNganSachId: item.phanbongansach_id,
        quyNguonId: item.quy_nguon_id,
        tenQuyNguon: item.ten_quy_nguon,
        quyDichId: item.quy_dich_id,
        tenQuyDich: item.ten_quy_dich,
        soTien: item.sotien,
        soQuyetDinh: item.soquyetdinh,
        fileQuyetDinh: item.filequyetdinh,
        trangThai: item.trangthai,
        lyDoTuChoi: item.lydotuchoi,
        nguoiDeXuatId: item.nguoi_de_xuat_id,
        tenNguoiDeXuat: item.nguoi_de_xuat_ten,
        nguoiDuyetId: item.nguoi_duyet_id,
        tenNguoiDuyet: item.nguoi_duyet_ten,
        ngayDeXuat: item.ngaydexuat,
        ngayDuyet: item.ngayduyet,
        ghiChu: item.ghichu
      }))
    });
  } catch (error) {
    console.error("Lỗi getAllocationRequests:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau",
    });
  }
};
