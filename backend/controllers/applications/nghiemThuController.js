import NghiemThuModel from "../../models/applications/NghiemThuModel.js";
import ApplicationModel from "../../models/applications/ApplicationModel.js";

import { logSystemActivity } from "../../utils/helpers/loggerHelper.js";

// ═══════════════════════════════════════════════════════════════════════════════
// ─── POST /api/nghiem-thu (TẠO LƯỢT KIỂM TRA / NGHIỆM THU) ──────────────────
// ═══════════════════════════════════════════════════════════════════════════════
//
// CÔNG DỤNG: Cán bộ (role 3) hoặc Admin (role 1) tạo 1 lượt kiểm tra/nghiệm thu
// cho đơn xin hỗ trợ đã giải ngân.
//
// Điều kiện: don.trangthai IN ('Da giai ngan','Cho nghiem thu') AND don.canghiemthu = 1
//
export const createInspection = async (req, res) => {
  try {
    const { yeucauhotroId, loaiKiemTra } = req.body;
    const nguoiNghiemThuId = req.user.id;

    // Validate
    if (!yeucauhotroId || !loaiKiemTra) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ: yeucauhotroId, loaiKiemTra",
      });
    }

    // Validate enum
    const validLoaiKiemTra = ['Kiem tra tien do', 'Nghiem thu cuoi cung'];
    if (!validLoaiKiemTra.includes(loaiKiemTra)) {
      return res.status(400).json({
        success: false,
        message: "Loại kiểm tra không hợp lệ. Chỉ chấp nhận: 'Kiem tra tien do' hoặc 'Nghiem thu cuoi cung'",
      });
    }

    // Kiểm tra đơn có tồn tại và đủ điều kiện
    const don = await NghiemThuModel.checkEligibility(yeucauhotroId);
    if (!don) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn xin hỗ trợ",
      });
    }

    if (!don.canghiemthu) {
      return res.status(400).json({
        success: false,
        message: "Đơn này không yêu cầu nghiệm thu (loại hình tài trợ không hoàn lại)",
      });
    }

    const trangThaiHopLe = ['Da giai ngan', 'Cho nghiem thu'];
    if (!trangThaiHopLe.includes(don.trangthai)) {
      return res.status(400).json({
        success: false,
        message: `Đơn chưa đủ điều kiện để nghiệm thu. Trạng thái hiện tại: ${don.trangthai}`,
      });
    }

    // Nếu là nghiệm thu cuối cùng, chỉ Admin (role 1) hoặc Cán bộ Quỹ (role 3) mới được phép
    if (loaiKiemTra === 'Nghiem thu cuoi cung' && req.user.vai_tro !== 1 && req.user.vai_tro !== 3) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền thực hiện nghiệm thu cuối cùng",
      });
    }

    // Tạo lượt nghiệm thu mới
    const result = await NghiemThuModel.createInspection({
      yeucauhotroId,
      loaiKiemTra,
      nguoiNghiemThuId
    });

    // Cập nhật trạng thái đơn → 'Cho nghiem thu' (nếu chưa phải)
    if (don.trangthai === 'Da giai ngan') {
      await ApplicationModel.updateApplicationStatus(yeucauhotroId, 'Cho nghiem thu');
    }

    // Ghi nhật ký hệ thống
    await logSystemActivity(req, {
      hanhdong: "TAO_LUOT_NGHIEM_THU",
      loaidoituong: "nghiemthu",
      doituong_id: result.nghiemthuId,
      mota: `Tạo lượt nghiệm thu lần ${result.lanthu} (${loaiKiemTra === 'Kiem tra tien do' ? 'Kiểm tra tiến độ' : 'Nghiệm thu cuối cùng'}) cho đơn #${yeucauhotroId}`,
    });

    return res.status(201).json({
      success: true,
      message: "Tạo lượt nghiệm thu thành công",
      data: result
    });
  } catch (error) {
    console.error("=== CREATE INSPECTION ERROR ===");
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau",
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// ─── PUT /api/nghiem-thu/:id (CẬP NHẬT KẾT QUẢ NGHIỆM THU) ──────────────────
// ═══════════════════════════════════════════════════════════════════════════════
//
// CÔNG DỤNG: Cập nhật kết quả, nhân xét, số quyết định, file biên bản
//
// Nếu loaikiemtra = 'Nghiem thu cuoi cung' AND ketqua = 'Dat':
//   → capnhat yeucauhotro.trangthai = 'Da nghiem thu'
//
export const updateResult = async (req, res) => {
  try {
    const { id } = req.params;
    const { ketqua, nhanXet, soQuyetDinh, fileBienBan, ngayNghiemThu } = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "ID nghiệm thu không hợp lệ",
      });
    }

    const validKetQua = ['Cho danh gia', 'Dat', 'Dat co dieu chinh', 'Khong dat'];
    if (ketqua && !validKetQua.includes(ketqua)) {
      return res.status(400).json({
        success: false,
        message: "Kết quả không hợp lệ",
      });
    }

    const nt = await NghiemThuModel.getById(id);
    if (!nt) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy lượt nghiệm thu",
      });
    }

    // Chỉ Admin (role 1) mới được duyệt kết quả nghiệm thu (cả 2 loại)
    if (req.user.vai_tro !== 1) {
      return res.status(403).json({
        success: false,
        message: "Chỉ Admin mới được duyệt kết quả nghiệm thu",
      });
    }

    await NghiemThuModel.updateResult(id, {
      ketqua,
      nhanXet,
      soQuyetDinh,
      fileBienBan,
      ngayNghiemThu
    });

    if (nt.loaikiemtra === 'Nghiem thu cuoi cung' && (ketqua === 'Dat' || ketqua === 'Dat co dieu chinh')) {
      await ApplicationModel.updateApplicationStatus(nt.yeucauhotro_id, 'Da nghiem thu');
    } else if (ketqua === 'Khong dat') {
      await ApplicationModel.updateApplicationStatus(nt.yeucauhotro_id, 'Nghiem thu khong dat');
    }

    await logSystemActivity(req, {
      hanhdong: "CAP_NHAT_KET_QUA_NGHIEM_THU",
      loaidoituong: "nghiemthu",
      doituong_id: parseInt(id),
      mota: `Cập nhật kết quả nghiệm thu lần ${nt.lanthu} → ${ketqua || nt.ketqua} cho đơn #${nt.yeucauhotro_id}`,
      dulieucu: { ketqua: nt.ketqua },
      dulieumoi: { ketqua: ketqua || nt.ketqua }
    });

    return res.status(200).json({
      success: true,
      message: "Cập nhật kết quả nghiệm thu thành công"
    });
  } catch (error) {
    console.error("=== UPDATE INSPECTION RESULT ERROR ===");
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau",
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// ─── PUT /api/nghiem-thu/:id/edit (SỬA THÔNG TIN NGHIỆM THU CHƯA DUYỆT) ─────
// ═══════════════════════════════════════════════════════════════════════════════
//
// CÔNG DỤNG: Sửa nhanXet, soQuyetDinh, fileBienBan khi chưa duyệt
// ĐIỀU KIỆN: ketqua = 'Cho danh gia' (chưa duyệt)
//
export const updateInspection = async (req, res) => {
  try {
    const { id } = req.params;
    const { nhanXet, soQuyetDinh, fileBienBan } = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "ID nghiệm thu không hợp lệ",
      });
    }

    const nt = await NghiemThuModel.getById(id);
    if (!nt) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy lượt nghiệm thu",
      });
    }

    if (nt.ketqua !== 'Cho danh gia') {
      return res.status(400).json({
        success: false,
        message: "Không thể sửa nghiệm thu đã được duyệt",
      });
    }

    if (req.user.vai_tro !== 1 && nt.nguoinghiemthu_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền sửa nghiệm thu này",
      });
    }

    await NghiemThuModel.updateResult(id, {
      ketqua: nt.ketqua,
      nhanXet,
      soQuyetDinh,
      fileBienBan,
      ngayNghiemThu: nt.ngaynghiemthu
    });

    await logSystemActivity(req, {
      hanhdong: "SUA_THONG_TIN_NGHIEM_THU",
      loaidoituong: "nghiemthu",
      doituong_id: parseInt(id),
      mota: `Sửa thông tin nghiệm thu lần ${nt.lanthu} cho đơn #${nt.yeucauhotro_id}`,
    });

    return res.status(200).json({
      success: true,
      message: "Cập nhật thông tin nghiệm thu thành công"
    });
  } catch (error) {
    console.error("=== UPDATE INSPECTION INFO ERROR ===");
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau",
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// ─── DELETE /api/nghiem-thu/:id (XÓA NGHIỆM THU CHƯA DUYỆT) ─────────────────
// ═══════════════════════════════════════════════════════════════════════════════
//
// CÔNG DỤNG: Xóa lượt nghiệm thu khi chưa duyệt
// ĐIỀU KIỆN: ketqua = 'Cho danh gia' (chưa duyệt)
//
export const deleteInspection = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "ID nghiệm thu không hợp lệ",
      });
    }

    const nt = await NghiemThuModel.getById(id);
    if (!nt) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy lượt nghiệm thu",
      });
    }

    if (nt.ketqua !== 'Cho danh gia') {
      return res.status(400).json({
        success: false,
        message: "Không thể xóa nghiệm thu đã được duyệt",
      });
    }

    if (req.user.vai_tro !== 1 && nt.nguoinghiemthu_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền xóa nghiệm thu này",
      });
    }

    await NghiemThuModel.deleteById(id);

    const remaining = await NghiemThuModel.getByApplicationId(nt.yeucauhotro_id);
    if (remaining.length === 0) {
      await ApplicationModel.updateApplicationStatus(nt.yeucauhotro_id, 'Da giai ngan');
    }

    await logSystemActivity(req, {
      hanhdong: "XOA_NGHIEM_THU",
      loaidoituong: "nghiemthu",
      doituong_id: parseInt(id),
      mota: `Xóa nghiệm thu lần ${nt.lanthu} (chưa duyệt) cho đơn #${nt.yeucauhotro_id}`,
    });

    return res.status(200).json({
      success: true,
      message: "Xóa nghiệm thu thành công"
    });
  } catch (error) {
    console.error("=== DELETE INSPECTION ERROR ===");
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau",
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// ─── GET /api/nghiem-thu/application/:yeucauhotroId (LỊCH SỬ NGHIỆM THU) ─────
// ═══════════════════════════════════════════════════════════════════════════════
//
// CÔNG DỤNG: Lấy toàn bộ lịch sử nghiệm thu của 1 đơn xin hỗ trợ
//
export const getInspectionHistory = async (req, res) => {
  try {
    const { yeucauhotroId } = req.params;

    if (!yeucauhotroId || isNaN(yeucauhotroId)) {
      return res.status(400).json({
        success: false,
        message: "ID đơn xin hỗ trợ không hợp lệ",
      });
    }

    // Kiểm tra đơn tồn tại
    const don = await NghiemThuModel.checkEligibility(yeucauhotroId);
    if (!don) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn xin hỗ trợ",
      });
    }

    const history = await NghiemThuModel.getByApplicationId(yeucauhotroId);

    return res.status(200).json({
      success: true,
      data: {
        yeucauhotroId: parseInt(yeucauhotroId),
        trangThai: don.trangthai,
        loaiHoTro: don.loaihotro,
        canNghiemThu: don.canghiemthu === 1,
        lichSuNghiemThu: history.map(nt => ({
          nghiemthuId: nt.nghiemthu_id,
          lanthu: nt.lanthu,
          loaiKiemTra: nt.loaikiemtra,
          ketqua: nt.ketqua,
          soQuyetDinh: nt.soquyetdinh,
          fileBienBan: nt.filebienban,
          nguoiNghiemThuId: nt.nguoinghiemthu_id,
          tenNguoiNghiemThu: nt.nguoi_nghiem_thu_ten,
          nhanXet: nt.nhanxet,
          ngayNghiemThu: nt.ngaynghiemthu,
          ngayTao: nt.ngaytao
        }))
      }
    });
  } catch (error) {
    console.error("=== GET INSPECTION HISTORY ERROR ===");
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau",
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// ─── GET /api/nghiem-thu/application/:yeucauhotroId/detail ───────────────────
// ═══════════════════════════════════════════════════════════════════════════════
//
// MỤC ĐÍCH: Lấy đầy đủ thông tin đơn + lịch sử nghiệm thu + tổng quan
// DÙNG CHO: Trang chi tiết nghiệm thu (NghiemThuDetailPage)
//
export const getDetail = async (req, res) => {
  try {
    const { yeucauhotroId } = req.params;
    console.log("=== GET NGHIEM THU DETAIL === yeucauhotroId:", yeucauhotroId);

    if (!yeucauhotroId || isNaN(yeucauhotroId)) {
      return res.status(400).json({
        success: false,
        message: "ID đơn xin hỗ trợ không hợp lệ",
      });
    }

    const detail = await NghiemThuModel.getDetailByApplicationId(parseInt(yeucauhotroId));
    console.log("=== DETAIL RESULT ===", detail ? "FOUND" : "NULL");

    if (!detail) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn xin hỗ trợ",
      });
    }

    return res.status(200).json({
      success: true,
      data: detail,
    });
  } catch (error) {
    console.error("=== GET NGHIEM THU DETAIL ERROR ===");
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau",
    });
  }
};
