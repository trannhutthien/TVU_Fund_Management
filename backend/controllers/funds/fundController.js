import FundModel from "../../models/funds/FundModel.js";
import LoaiQuyModel from "../../models/funds/LoaiQuyModel.js";
import BankAccountModel from "../../models/funds/BankAccountModel.js";
import { buildFundImageUrl } from "../../utils/helpers/imageHelper.js";
import { logSystemActivity } from "../../utils/helpers/loggerHelper.js";

// ─── POST /api/funds ──────────────────────────────────────────────────────────
// Yêu cầu: phải có access token hợp lệ và quyền admin/giáo vụ (role_id: 1 hoặc 3)
// Tạo quỹ mới trong hệ thống
export const createFund = async (req, res) => {
  try {
    const {
      tenQuy,
      loaiQuy,
      moTa,
      hinhAnh,
      soTienToiThieu,
      soTienToiDa,
      soLuongChiTieu,
      hanNopDon,
      dieuKienTomTat,
      soDu,
      trangThai
    } = req.body;

    // 1. Validate dữ liệu đầu vào
    if (!tenQuy || !loaiQuy) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ thông tin: tên quỹ và loại quỹ",
      });
    }

    // 2. Validate loại quỹ
    const loaiQuyExists = await LoaiQuyModel.checkMaLoaiExists(loaiQuy);
    if (!loaiQuyExists) {
      return res.status(400).json({
        success: false,
        message: "Loại quỹ không hợp lệ hoặc không tồn tại trong hệ thống",
      });
    }

    // 3. Validate số dư (nếu có)
    if (soDu !== undefined && (isNaN(soDu) || soDu < 0)) {
      return res.status(400).json({
        success: false,
        message: "Số dư phải là số và lớn hơn hoặc bằng 0",
      });
    }

    // 4. Validate trạng thái (nếu có)
    if (trangThai) {
      const validStatuses = ['Dang hoat dong', 'Tam dung', 'Da dong'];
      if (!validStatuses.includes(trangThai)) {
        return res.status(400).json({
          success: false,
          message: "Trạng thái không hợp lệ. Chỉ chấp nhận: Dang hoat dong, Tam dung, Da dong",
        });
      }
    }

    // 5. Validate độ dài tên quỹ
    if (tenQuy.trim().length > 150) {
      return res.status(400).json({
        success: false,
        message: "Tên quỹ không được vượt quá 150 ký tự",
      });
    }

    // 6. Validate độ dài mô tả (nếu có)
    if (moTa && moTa.trim().length > 255) {
      return res.status(400).json({
        success: false,
        message: "Mô tả không được vượt quá 255 ký tự",
      });
    }

    // 7. Kiểm tra tên quỹ đã tồn tại chưa
    const nameExists = await FundModel.checkFundNameExists(tenQuy.trim());
    if (nameExists) {
      return res.status(409).json({
        success: false,
        message: "Tên quỹ đã tồn tại",
      });
    }

    // 8. Tạo quỹ mới trong database
    const fundData = {
      tenQuy: tenQuy.trim(),
      loaiQuy: loaiQuy,
      moTa: moTa ? moTa.trim() : null,
      hinhAnh: hinhAnh || null,
      soTienToiThieu: soTienToiThieu !== undefined && soTienToiThieu !== '' ? parseFloat(soTienToiThieu) : null,
      soTienToiDa: soTienToiDa !== undefined && soTienToiDa !== '' ? parseFloat(soTienToiDa) : null,
      soLuongChiTieu: soLuongChiTieu !== undefined && soLuongChiTieu !== '' ? parseInt(soLuongChiTieu, 10) : null,
      hanNopDon: hanNopDon || null,
      dieuKienTomTat: dieuKienTomTat ? dieuKienTomTat.trim() : null,
      soDu: soDu ? parseFloat(soDu) : 0.00,
      trangThai: trangThai || 'Dang hoat dong'
    };

    const result = await FundModel.createFund(fundData);

    // Ghi nhật ký hệ thống
    await logSystemActivity(req, {
      hanhdong: "THEM_MOI_QUY",
      loaidoituong: "quy",
      doituong_id: result.insertId,
      mota: `Thêm mới quỹ hỗ trợ: ${fundData.tenQuy}`,
      dulieumoi: fundData
    });

    // 9. Lấy thông tin quỹ vừa tạo
    const newFund = await FundModel.getFundById(result.insertId);

    return res.status(201).json({
      success: true,
      message: "Tạo quỹ thành công",
      fund: {
        quyId: newFund.quy_id,
        tenQuy: newFund.ten_quy,
        loaiQuy: newFund.loai_quy,
        moTa: newFund.mo_ta,
        hinhAnh: buildFundImageUrl(newFund.hinh_anh),
        soTienToiThieu: newFund.so_tien_toi_thieu,
        soTienToiDa: newFund.so_tien_toi_da,
        soLuongChiTieu: newFund.so_luong_chi_tieu,
        hanNopDon: newFund.han_nop_don,
        dieuKienTomTat: newFund.dieu_kien_tom_tat,
        soDu: newFund.so_du,
        ngayTao: newFund.ngay_tao,
        ngayCapNhat: newFund.ngay_cap_nhat,
        trangThai: newFund.trang_thai
      }
    });
  } catch (error) {
    console.error("Lỗi createFund:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau",
    });
  }
};


// ─── GET /api/funds ───────────────────────────────────────────────────────────
// Yêu cầu: phải có access token hợp lệ và quyền admin/giáo vụ (role_id: 1 hoặc 3)
// Trả về danh sách tất cả quỹ trong hệ thống
export const getFunds = async (req, res) => {
  try {
    // Lấy danh sách quỹ từ database
    const funds = await FundModel.getAllFunds();

    return res.status(200).json({
      success: true,
      total: funds.length,
      funds: funds.map(fund => ({
        quyId: fund.quy_id,
        tenQuy: fund.ten_quy,
        loaiQuy: fund.loai_quy,
        moTa: fund.mo_ta,
        hinhAnh: buildFundImageUrl(fund.hinh_anh), // Build full URL
        soTienToiThieu: fund.so_tien_toi_thieu,
        soTienToiDa: fund.so_tien_toi_da,
        soLuongChiTieu: fund.so_luong_chi_tieu,
        hanNopDon: fund.han_nop_don,
        dieuKienTomTat: fund.dieu_kien_tom_tat,
        soDu: fund.so_du,
        ngayTao: fund.ngay_tao,
        ngayCapNhat: fund.ngay_cap_nhat,
        trangThai: fund.trang_thai,
        soDonDaNop: fund.so_don_da_nop,
        phanTramDaNhan: fund.phan_tram_da_nhan
      }))
    });
  } catch (error) {
    console.error("Lỗi getFunds:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau",
    });
  }
};

// ─── GET /api/funds/public ────────────────────────────────────────────────────
// API công khai - KHÔNG CẦN AUTHENTICATION
// Trả về danh sách quỹ đang hoạt động hoặc tạm dừng (để hiển thị trên trang công khai)
export const getPublicFunds = async (req, res) => {
  try {
    // Lấy danh sách quỹ công khai từ database
    const funds = await FundModel.getPublicFunds();

    return res.status(200).json({
      success: true,
      total: funds.length,
      funds: funds.map(fund => ({
        quyId: fund.quy_id,
        tenQuy: fund.ten_quy,
        loaiQuy: fund.loai_quy,
        moTa: fund.mo_ta,
        hinhAnh: buildFundImageUrl(fund.hinh_anh), // Build full URL
        soTienToiThieu: fund.so_tien_toi_thieu,
        soTienToiDa: fund.so_tien_toi_da,
        soLuongChiTieu: fund.so_luong_chi_tieu,
        hanNopDon: fund.han_nop_don,
        dieuKienTomTat: fund.dieu_kien_tom_tat,
        soDu: fund.so_du,
        soDuThucTe: fund.so_du_thuc_te, // Số dư thực tế sau khi trừ các khoản chờ giải ngân
        ngayTao: fund.ngay_tao,
        ngayCapNhat: fund.ngay_cap_nhat,
        trangThai: fund.trang_thai,
        soDonDaNop: fund.so_don_da_nop,
        phanTramDaNhan: fund.phan_tram_da_nhan
      }))
    });
  } catch (error) {
    console.error("Lỗi getPublicFunds:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau",
    });
  }
};

// ─── PUT /api/funds/:id/status ────────────────────────────────────────────────
// Yêu cầu: phải có access token hợp lệ và quyền admin/giáo vụ (role_id: 1 hoặc 3)
// Cập nhật trạng thái quỹ (Dang hoat dong, Tam dung, Da dong)
export const updateFundStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { trangThai } = req.body;

    // 1. Validate ID
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "ID quỹ không hợp lệ",
      });
    }

    // 2. Validate trạng thái
    const validStatuses = ['Dang hoat dong', 'Tam dung', 'Da dong'];
    if (!trangThai || !validStatuses.includes(trangThai)) {
      return res.status(400).json({
        success: false,
        message: "Trạng thái không hợp lệ. Chỉ chấp nhận: Dang hoat dong, Tam dung, Da dong",
      });
    }

    // 3. Kiểm tra quỹ có tồn tại không
    const fund = await FundModel.getFundById(id);
    if (!fund) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy quỹ",
      });
    }

    // 4. Kiểm tra nếu quỹ đã đóng thì không cho phép thay đổi
    if (fund.trang_thai === 'Da dong' && trangThai !== 'Da dong') {
      return res.status(400).json({
        success: false,
        message: "Không thể thay đổi trạng thái của quỹ đã đóng",
      });
    }

    // 5. Cập nhật trạng thái
    await FundModel.updateFundStatus(id, trangThai);

    // Ghi nhật ký hệ thống
    await logSystemActivity(req, {
      hanhdong: "CAP_NHAT_TRANG_THAI_QUY",
      loaidoituong: "quy",
      doituong_id: id,
      mota: `Thay đổi trạng thái quỹ ${fund.ten_quy} từ '${fund.trang_thai}' sang '${trangThai}'`,
      dulieucu: { trangThai: fund.trang_thai },
      dulieumoi: { trangThai: trangThai }
    });

    // 6. Lấy thông tin quỹ sau khi cập nhật
    const updatedFund = await FundModel.getFundById(id);

    return res.status(200).json({
      success: true,
      message: "Cập nhật trạng thái quỹ thành công",
      fund: {
        quyId: updatedFund.quy_id,
        tenQuy: updatedFund.ten_quy,
        trangThai: updatedFund.trang_thai,
        ngayCapNhat: updatedFund.ngay_cap_nhat
      }
    });
  } catch (error) {
    console.error("Lỗi updateFundStatus:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau",
    });
  }
};

// ─── GET /api/funds/:id ───────────────────────────────────────────────────────
export const getFundDetail = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "ID quỹ không hợp lệ",
      });
    }

    const fund = await FundModel.getFundById(id);
    if (!fund) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy quỹ",
      });
    }

    return res.status(200).json({
      success: true,
      fund: {
        quyId: fund.quy_id,
        tenQuy: fund.ten_quy,
        loaiQuy: fund.loai_quy,
        moTa: fund.mo_ta,
        hinhAnh: buildFundImageUrl(fund.hinh_anh),
        soTienToiThieu: fund.so_tien_toi_thieu,
        soTienToiDa: fund.so_tien_toi_da,
        soLuongChiTieu: fund.so_luong_chi_tieu,
        hanNopDon: fund.han_nop_don,
        dieuKienTomTat: fund.dieu_kien_tom_tat,
        soDu: fund.so_du,
        ngayTao: fund.ngay_tao,
        ngayCapNhat: fund.ngay_cap_nhat,
        trangThai: fund.trang_thai
      }
    });
  } catch (error) {
    console.error("Lỗi getFundDetail:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau",
    });
  }
};

// ─── PUT /api/funds/:id ───────────────────────────────────────────────────────
export const updateFund = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      tenQuy,
      loaiQuy,
      moTa,
      hinhAnh,
      soTienToiThieu,
      soTienToiDa,
      soLuongChiTieu,
      hanNopDon,
      dieuKienTomTat,
      soDu,
      trangThai
    } = req.body;

    // 1. Validate ID
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "ID quỹ không hợp lệ",
      });
    }

    // 2. Kiểm tra quỹ tồn tại
    const fund = await FundModel.getFundById(id);
    if (!fund) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy quỹ",
      });
    }

    // 3. Validate tên và loại
    if (!tenQuy || !loaiQuy) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ thông tin: tên quỹ và loại quỹ",
      });
    }

    // 4. Validate loại quỹ
    const loaiQuyExists = await LoaiQuyModel.checkMaLoaiExists(loaiQuy);
    if (!loaiQuyExists) {
      return res.status(400).json({
        success: false,
        message: "Loại quỹ không hợp lệ hoặc không tồn tại trong hệ thống",
      });
    }

    // 5. Validate số dư
    if (soDu !== undefined && (isNaN(soDu) || soDu < 0)) {
      return res.status(400).json({
        success: false,
        message: "Số dư phải là số và lớn hơn hoặc bằng 0",
      });
    }

    // 6. Kiểm tra trùng tên với quỹ khác
    const nameExists = await FundModel.checkFundNameExistsForOther(tenQuy.trim(), id);
    if (nameExists) {
      return res.status(409).json({
        success: false,
        message: "Tên quỹ đã tồn tại ở quỹ khác",
      });
    }

    // 7. Cập nhật quỹ
    const fundData = {
      tenQuy: tenQuy.trim(),
      loaiQuy: loaiQuy,
      moTa: moTa ? moTa.trim() : null,
      hinhAnh: hinhAnh || null,
      soTienToiThieu: soTienToiThieu !== undefined && soTienToiThieu !== '' ? parseFloat(soTienToiThieu) : null,
      soTienToiDa: soTienToiDa !== undefined && soTienToiDa !== '' ? parseFloat(soTienToiDa) : null,
      soLuongChiTieu: soLuongChiTieu !== undefined && soLuongChiTieu !== '' ? parseInt(soLuongChiTieu, 10) : null,
      hanNopDon: hanNopDon || null,
      dieuKienTomTat: dieuKienTomTat ? dieuKienTomTat.trim() : null,
      soDu: soDu ? parseFloat(soDu) : 0.00,
      trangThai: trangThai || fund.trang_thai
    };

    await FundModel.updateFund(id, fundData);

    // Ghi nhật ký hệ thống
    await logSystemActivity(req, {
      hanhdong: "CAP_NHAT_QUY",
      loaidoituong: "quy",
      doituong_id: id,
      mota: `Cập nhật thông tin quỹ: ${fundData.tenQuy}`,
      dulieucu: fund,
      dulieumoi: fundData
    });

    // 8. Lấy thông tin sau khi cập nhật
    const updatedFund = await FundModel.getFundById(id);

    return res.status(200).json({
      success: true,
      message: "Cập nhật quỹ thành công",
      fund: {
        quyId: updatedFund.quy_id,
        tenQuy: updatedFund.ten_quy,
        loaiQuy: updatedFund.loai_quy,
        moTa: updatedFund.mo_ta,
        hinhAnh: buildFundImageUrl(updatedFund.hinh_path || updatedFund.hinh_anh),
        soTienToiThieu: updatedFund.so_tien_toi_thieu,
        soTienToiDa: updatedFund.so_tien_toi_da,
        soLuongChiTieu: updatedFund.so_luong_chi_tieu,
        hanNopDon: updatedFund.han_nop_don,
        dieuKienTomTat: updatedFund.dieu_kien_tom_tat,
        soDu: updatedFund.so_du,
        ngayTao: updatedFund.ngay_tao,
        ngayCapNhat: updatedFund.ngay_cap_nhat,
        trangThai: updatedFund.trang_thai
      }
    });
  } catch (error) {
    console.error("Lỗi updateFund:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau",
    });
  }
};

// ─── GET /api/funds/:id/bank-accounts ─────────────────────────────────────────
// Yêu cầu: API công khai - KHÔNG CẦN AUTHENTICATION (cho trang donation)
// Lấy danh sách tài khoản ngân hàng của quỹ
export const getFundBankAccounts = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Validate ID
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "ID quỹ không hợp lệ",
      });
    }

    // 2. Kiểm tra quỹ có tồn tại không
    const fund = await FundModel.getFundById(id);
    if (!fund) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy quỹ",
      });
    }

    // 3. Lấy danh sách tài khoản ngân hàng của quỹ
    const bankAccounts = await BankAccountModel.getBankAccountsByFundId(id);

    // 4. Lọc chỉ lấy tài khoản đang hoạt động
    const activeAccounts = bankAccounts.filter(acc => acc.trangthai === 'Hoat dong');

    // 5. Trả về danh sách tài khoản
    return res.status(200).json({
      success: true,
      message: "Lấy danh sách tài khoản ngân hàng thành công",
      fund: {
        quyId: fund.quy_id,
        tenQuy: fund.ten_quy,
      },
      bankAccounts: activeAccounts.map(acc => ({
        taiKhoanNganHangId: acc.taikhoannganhang_id,
        soTaiKhoan: acc.sotaikhoan,
        nganHang: acc.nganhang,
        chiNhanh: acc.chinhanh,
        chuTaiKhoan: acc.chutaikhoan,
        trangThai: acc.trangthai,
      })),
      total: activeAccounts.length
    });
  } catch (error) {
    console.error("Lỗi getFundBankAccounts:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau",
    });
  }
};
