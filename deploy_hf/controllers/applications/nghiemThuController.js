import NghiemThuModel from "../../models/applications/NghiemThuModel.js";
import ApplicationModel from "../../models/applications/ApplicationModel.js";
import HopDongVayVonModel from "../../models/applications/HopDongVayVonModel.js";
import DieuKhoanThuHoiModel from "../../models/applications/DieuKhoanThuHoiModel.js";
import ThongBaoModel from "../../models/common/ThongBaoModel.js";
import { sendNghiemThuThatBaiEmail } from "../../services/emailService.js";
import pool from "../../config/db.js";

import { logSystemActivity } from "../../utils/helpers/loggerHelper.js";

// ─── Helper: Tao dieukhoanthuhoi khi nghiem thu that bai ───────────────────
const taoDieuKhoanThuHoi = async (yeucauhotroId, don, dotgiaingan) => {
  try {
    const hopDong = don?.hopdongvayvon;

    let soTienCanThuHoi;
    let loaiVay;

    if (hopDong) {
      // Co hopdong → tinh theo dot giai ngan
      const hopDongFull = await HopDongVayVonModel.getByApplicationId(yeucauhotroId);
      const lichTra = hopDongFull?.lichTraNo || [];
      const tongDaTra = lichTra.reduce((sum, ky) => sum + Number(ky.sotienthuctra || 0), 0);

      if (dotgiaingan === 2) {
        soTienCanThuHoi = Number(hopDong.sotienvon) - tongDaTra;
      } else {
        soTienCanThuHoi = Number(hopDong.sotien_dot1 || 0) - tongDaTra;
      }
      loaiVay = dotgiaingan === 2 ? 'vay von (dot 2)' : `vay von (dot ${dotgiaingan})`;
    } else {
      // Khong co hopdong → fallback dung sotiendenghi (don cu truoc khi fix)
      console.warn(`[nghiemThu] Don #${yeucauhotroId} khong co hopdongvayvon, su dung sotiendenghi as fallback`);
      soTienCanThuHoi = Number(don?.sotiendenghi || 0);
      loaiVay = `vay von (dot ${dotgiaingan || 1})`;
    }

    if (soTienCanThuHoi <= 0) {
      await ApplicationModel.updateApplicationStatus(yeucauhotroId, 'Hoan thanh').catch(() => {});
      return;
    }

    // Kiem tra da co dieukhoanthuhoi chua
    const existingDKH = await DieuKhoanThuHoiModel.getByApplicationId(yeucauhotroId);
    if (existingDKH) return;

    await DieuKhoanThuHoiModel.createDieuKhoan({
      yeucauhotroId: yeucauhotroId,
      mucthuhoi: soTienCanThuHoi,
      laisuat: 0,
      thoihanhoantra: 3,
      trangthai: 'Chua thu',
      ngaybatdauthuhoi: new Date(),
      soQuyetDinh: null,
    });

    // Gui email thong bao cho nguoi vay
    const hoTen = don?.nguoi_nop_ho_ten || 'Nguoi dung';
    const email = don?.nguoi_nop_email;
    if (email) {
      sendNghiemThuThatBaiEmail(email, hoTen, soTienCanThuHoi, 3, loaiVay).catch(() => {});
    }

    // Tao thong bao trong he thong
    const nguoidungId = don?.nguoidung_id;
    if (nguoidungId && !isNaN(soTienCanThuHoi) && soTienCanThuHoi > 0) {
      const tieuDe = don?.tieu_de || 'Don vay von';
      ThongBaoModel.create({
        nguoidungId,
        loai: 'hethong',
        tieude: 'Nghiem thu khong dat',
        noidung: `Don "${tieuDe}" chua dat nghiem thu. Ban can thu hoi ${soTienCanThuHoi.toLocaleString('vi-VN')} VNĐ trong vong 3 thang.`,
        duongdan: '/nghia-vu-hoan-tra',
      }).catch(() => {});
    }
  } catch (err) {
    console.error("Loi tao dieukhoanthuhoi:", err);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// ─── POST /api/nghiem-thu (TẠO LƯỢT KIỂM TRA / NGHIỆM THU) ──────────────────
// ═══════════════════════════════════════════════════════════════════════════════

export const createInspection = async (req, res) => {
  try {
    const { yeucauhotroId, loaiKiemTra, dotgiaingan, soQuyetDinh, fileBienBan, nhanXet } = req.body;
    const nguoiNghiemThuId = req.user.id;

    if (!yeucauhotroId || !loaiKiemTra) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ: yeucauhotroId, loaiKiemTra",
      });
    }

    const validLoaiKiemTra = ['Kiem tra tien do', 'Nghiem thu cuoi cung'];
    if (!validLoaiKiemTra.includes(loaiKiemTra)) {
      return res.status(400).json({
        success: false,
        message: "Loại kiểm tra không hợp lệ. Chỉ chấp nhận: 'Kiem tra tien do' hoặc 'Nghiem thu cuoi cung'",
      });
    }

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

    const trangThaiHopLe = [
      'Da giai ngan', 'Cho nghiem thu',
      'Da giai ngan dot 1', 'Cho nghiem thu dot 1',
      'Cho giai ngan dot 2'
    ];
    if (!trangThaiHopLe.includes(don.trangthai)) {
      return res.status(400).json({
        success: false,
        message: `Đơn chưa đủ điều kiện để nghiệm thu. Trạng thái hiện tại: ${don.trangthai}`,
      });
    }

    if (req.user.vai_tro !== 3) {
      return res.status(403).json({
        success: false,
        message: "Chỉ Cán bộ Quỹ mới được tạo lượt nghiệm thu",
      });
    }

    // Xac dinh dot giai ngan
    let dotNT = dotgiaingan || 1;
    const isLoan = don?.loaihotro === 'Cho vay';
    // Dot 1 da co du 2/3 luot "Nghiem thu cuoi cung" dat thi day la dot 2
    const soDatDot1 = isLoan ? await NghiemThuModel.countApprovedByDot(yeucauhotroId, 1) : 0;
    const daNghiemThuDot1 = isLoan && soDatDot1 >= 2;

    if (don.trangthai === 'Da giai ngan' || don.trangthai === 'Cho nghiem thu') {
      // Neu la cho vay va da nghiem thu dot 1 thanh cong → dot 2
      dotNT = daNghiemThuDot1 ? 2 : 1;
    } else if (don.trangthai === 'Da giai ngan dot 1' || don.trangthai === 'Cho nghiem thu dot 1') {
      dotNT = 1;
    } else if (don.trangthai === 'Cho giai ngan dot 2') {
      dotNT = 2;
    }

    const result = await NghiemThuModel.createInspection({
      yeucauhotroId,
      loaiKiemTra,
      nguoiNghiemThuId,
      dotgiaingan: dotNT,
      soQuyetDinh,
      fileBienBan,
      nhanXet,
    });

    // Cap nhat trang thai don (chi cho dot 1, dot 2 giu nguyen 'Da giai ngan')
    if (don.trangthai === 'Da giai ngan' && !daNghiemThuDot1) {
      await ApplicationModel.updateApplicationStatus(yeucauhotroId, 'Cho nghiem thu');
    } else if (don.trangthai === 'Da giai ngan dot 1') {
      await ApplicationModel.updateApplicationStatus(yeucauhotroId, 'Cho nghiem thu dot 1');
    }

    await logSystemActivity(req, {
      hanhdong: "TAO_LUOT_NGHIEM_THU",
      loaidoituong: "nghiemthu",
      doituong_id: result.nghiemthuId,
      mota: `Tạo lượt nghiệm thu lần ${result.lanthu} (đợt ${dotNT}) cho đơn #${yeucauhotroId}`,
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
    if (!ketqua || !validKetQua.includes(ketqua)) {
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

    if (req.user.vai_tro !== 1) {
      return res.status(403).json({
        success: false,
        message: "Chỉ Admin mới được duyệt kết quả nghiệm thu",
      });
    }

    // ─── Lay thong tin don (read-only, khong can transaction) ───────────
    const don = await ApplicationModel.getApplicationById(nt.yeucauhotro_id);
    const isLoan = don?.loaihotro === 'Cho vay';
    const dotgiaingan = nt.dotgiaingan || 1;

    // ─── BAT DAU TRANSACTION ────────────────────────────────────────────
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      await NghiemThuModel.updateResult(id, {
        ketqua,
        nhanXet,
        soQuyetDinh,
        fileBienBan,
        ngayNghiemThu
      }, connection);

      // ─── LOGIC 2 PHA ───────────────────────────────────────────────────

      if (nt.loaikiemtra === 'Nghiem thu cuoi cung' && (ketqua === 'Dat' || ketqua === 'Dat co dieu chinh')) {
        const soLuotDat = await NghiemThuModel.countApprovedByDot(nt.yeucauhotro_id, dotgiaingan, connection);

        if (isLoan && dotgiaingan === 1) {
          const tongLuot = await NghiemThuModel.getByApplicationId(nt.yeucauhotro_id, connection);
          const tongCuoiCungTrongDot = tongLuot.filter(x => (x.dotgiaingan || 1) === 1 && x.loaikiemtra === 'Nghiem thu cuoi cung');

          if (soLuotDat >= 2) {
            await ApplicationModel.updateApplicationStatus(nt.yeucauhotro_id, 'Cho giai ngan dot 2', connection);
          } else if (tongCuoiCungTrongDot.length >= 3 && soLuotDat < 2) {
            await ApplicationModel.updateApplicationStatus(nt.yeucauhotro_id, 'Dang thu hoi no', connection);

            // Cap nhat lichtrano: xoa ky 2, cap nhat ky 1 voi ngay moi
            const hopDongId3 = don?.hopdongvayvon?.hopdongvayvon_id;
            if (hopDongId3) {
              const ngayNghiemThu3 = ngayNghiemThu || new Date().toISOString().slice(0, 10);
              await HopDongVayVonModel.capNhatLichTraNoKhiKhongDat({
                hopdongvayvonId: hopDongId3,
                ngayDuyet: ngayNghiemThu3,
                thoiHanThang: 3,
                dotgiaingan,
                laisuatphantram: don?.hopdongvayvon?.laisuatphantram || 0,
                sotienvon: don?.hopdongvayvon?.sotienvon || 0,
              }, connection);
            }

            // taoDieuKhoanThuHoi will be called AFTER commit (fire-and-forget)
          }
        } else if (isLoan && dotgiaingan === 2) {
          if (don?.hopdongvayvon?.hopdongvayvon_id) {
            await HopDongVayVonModel.tangLanNghiemThuDat(don.hopdongvayvon.hopdongvayvon_id, connection);
          }
          await ApplicationModel.updateApplicationStatus(nt.yeucauhotro_id, 'Hoan thanh', connection);
        } else {
          await ApplicationModel.updateApplicationStatus(nt.yeucauhotro_id, 'Da nghiem thu', connection);
        }
      } else if (ketqua === 'Khong dat') {
        if (nt.loaikiemtra === 'Nghiem thu cuoi cung') {
          if (isLoan) {
            await ApplicationModel.updateApplicationStatus(nt.yeucauhotro_id, 'Dang thu hoi no', connection);

            // Cap nhat lichtrano: xoa ky 2, cap nhat ky 1 voi ngay moi
            const hopDongId = don?.hopdongvayvon?.hopdongvayvon_id;
            if (hopDongId) {
              const ngayDuyetNT = ngayNghiemThu || new Date().toISOString().slice(0, 10);
              await HopDongVayVonModel.capNhatLichTraNoKhiKhongDat({
                hopdongvayvonId: hopDongId,
                ngayDuyet: ngayDuyetNT,
                thoiHanThang: 3,
                dotgiaingan,
                laisuatphantram: don?.hopdongvayvon?.laisuatphantram || 0,
                sotienvon: don?.hopdongvayvon?.sotienvon || 0,
              }, connection);
            }

            // taoDieuKhoanThuHoi will be called AFTER commit (fire-and-forget)
          } else {
            await ApplicationModel.updateApplicationStatus(nt.yeucauhotro_id, 'Nghiem thu khong dat', connection);
          }
        }
      }

      await connection.commit();
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }

    // ─── SAU TRANSACTION: thu hoi von (fire-and-forget, co the fail) ─────
    if (ketqua === 'Khong dat' && nt.loaikiemtra === 'Nghiem thu cuoi cung' && isLoan) {
      await taoDieuKhoanThuHoi(nt.yeucauhotro_id, don, dotgiaingan);
    }

    // Fire-and-forget: log sau response (khong block frontend)
    logSystemActivity(req, {
      hanhdong: "CAP_NHAT_KET_QUA_NGHIEM_THU",
      loaidoituong: "nghiemthu",
      doituong_id: parseInt(id),
      mota: `Cap nhat ket qua nghiem thu lan ${nt.lanthu} -> ${ketqua || nt.ketqua} cho don #${nt.yeucauhotro_id}`,
      dulieucu: { ketqua: nt.ketqua },
      dulieumoi: { ketqua: ketqua || nt.ketqua }
    }).catch(() => {});

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
      const app = await ApplicationModel.getApplicationById(nt.yeucauhotro_id);
      if (app?.loaihotro === 'Cho vay') {
        await ApplicationModel.updateApplicationStatus(nt.yeucauhotro_id, 'Da giai ngan dot 1');
      } else {
        await ApplicationModel.updateApplicationStatus(nt.yeucauhotro_id, 'Da giai ngan');
      }
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
          dotgiaingan: nt.dotgiaingan || 1,
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
