import FundModel from "../models/FundModel.js";

// ─── POST /api/funds ──────────────────────────────────────────────────────────
// Yêu cầu: phải có access token hợp lệ và quyền admin/giáo vụ (role_id: 1 hoặc 3)
// Tạo quỹ mới trong hệ thống
export const createFund = async (req, res) => {
  try {
    const {
      tenQuy,
      loaiQuy,
      moTa,
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
    const validTypes = ['Tu thien', 'Hoc bong', 'Y te', 'Moi truong', 'Khac'];
    if (!validTypes.includes(loaiQuy)) {
      return res.status(400).json({
        success: false,
        message: "Loại quỹ không hợp lệ. Chỉ chấp nhận: Tu thien, Hoc bong, Y te, Moi truong, Khac",
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
    // Database tự động tạo quy_id (AUTO_INCREMENT)
    const fundData = {
      tenQuy: tenQuy.trim(),
      loaiQuy: loaiQuy,
      moTa: moTa ? moTa.trim() : null,
      soDu: soDu ? parseFloat(soDu) : 0.00,
      trangThai: trangThai || 'Dang hoat dong'
    };

    const result = await FundModel.createFund(fundData);

    // 9. Lấy thông tin quỹ vừa tạo (dùng insertId từ result)
    const newFund = await FundModel.getFundById(result.insertId);

    return res.status(201).json({
      success: true,
      message: "Tạo quỹ thành công",
      fund: {
        quyId: newFund.quy_id,
        tenQuy: newFund.ten_quy,
        loaiQuy: newFund.loai_quy,
        moTa: newFund.mo_ta,
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
        soDu: fund.so_du,
        ngayTao: fund.ngay_tao,
        ngayCapNhat: fund.ngay_cap_nhat,
        trangThai: fund.trang_thai
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
