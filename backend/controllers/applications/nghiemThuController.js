import NghiemThuModel from "../../models/applications/NghiemThuModel.js";
import ApplicationModel from "../../models/applications/ApplicationModel.js";
import pool from "../../config/db.js";
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
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;
    const { ketqua, nhanXet, soQuyetDinh, fileBienBan, ngayNghiemThu } = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "ID nghiệm thu không hợp lệ",
      });
    }

    // Validate ketqua
    const validKetQua = ['Cho danh gia', 'Dat', 'Dat co dieu chinh', 'Khong dat'];
    if (ketqua && !validKetQua.includes(ketqua)) {
      return res.status(400).json({
        success: false,
        message: "Kết quả không hợp lệ. Chỉ chấp nhận: 'Cho danh gia', 'Dat', 'Dat co dieu chinh', 'Khong dat'",
      });
    }

    // Kiểm tra nghiệm thu tồn tại
    const nt = await NghiemThuModel.getById(id);
    if (!nt) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy lượt nghiệm thu",
      });
    }

    // Role-based: 'Nghiem thu cuoi cung' chỉ Admin (role 1) hoặc Cán bộ Quỹ (role 3) mới được chốt kết quả
    if (nt.loaikiemtra === 'Nghiem thu cuoi cung' && req.user.vai_tro !== 1 && req.user.vai_tro !== 3) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền chốt kết quả nghiệm thu cuối cùng",
      });
    }

    // Transaction: cập nhật kết quả nghiệm thu + cập nhật trạng thái đơn
    await connection.beginTransaction();

    await NghiemThuModel.updateResult(id, {
      ketqua: ketqua || nt.ketqua,
      nhanXet,
      soQuyetDinh,
      fileBienBan,
      ngayNghiemThu
    }, connection);

    // Nếu nghiệm thu cuối cùng Đạt hoặc Đạt có điều chỉnh → đơn chuyển sang 'Da nghiem thu'
    if (nt.loaikiemtra === 'Nghiem thu cuoi cung' && (ketqua === 'Dat' || ketqua === 'Dat co dieu chinh')) {
      await ApplicationModel.updateApplicationStatus(nt.yeucauhotroId, 'Da nghiem thu', connection);
    } else if (ketqua === 'Khong dat') {
      await ApplicationModel.updateApplicationStatus(nt.yeucauhotroId, 'Nghiem thu khong dat', connection);
    }

    await connection.commit();

    // Ghi nhật ký
    await logSystemActivity(req, {
      hanhdong: "CAP_NHAT_KET_QUA_NGHIEM_THU",
      loaidoituong: "nghiemthu",
      doituong_id: parseInt(id),
      mota: `Cập nhật kết quả nghiệm thu lần ${nt.lanthu} → ${ketqua || nt.ketqua} cho đơn #${nt.yeucauhotroId}`,
      dulieucu: { ketqua: nt.ketqua },
      dulieumoi: { ketqua: ketqua || nt.ketqua }
    });

    return res.status(200).json({
      success: true,
      message: "Cập nhật kết quả nghiệm thu thành công"
    });
  } catch (error) {
    await connection.rollback();
    console.error("=== UPDATE INSPECTION RESULT ERROR ===");
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau",
    });
  } finally {
    connection.release();
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
