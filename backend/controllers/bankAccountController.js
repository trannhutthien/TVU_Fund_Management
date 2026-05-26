import BankAccountModel from "../models/BankAccountModel.js";
import pool from "../config/db.js";

// ═══════════════════════════════════════════════════════════════════════════════
// ─── GET /api/bank-accounts (LẤY DANH SÁCH TÀI KHOẢN NGÂN HÀNG) ───────────────
// ═══════════════════════════════════════════════════════════════════════════════
export const getBankAccounts = async (req, res) => {
  try {
    const userId = req.user.id;

    const accounts = await BankAccountModel.getBankAccountsByUserId(userId);

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách tài khoản thành công",
      data: accounts.map(acc => ({
        taiKhoanId: acc.tai_khoan_id,
        soTaiKhoan: acc.so_tai_khoan,
        tenNganHang: acc.ten_ngan_hang,
        chuTaiKhoan: acc.chu_tai_khoan,
        laMacDinh: acc.la_mac_dinh,
        createdAt: acc.created_at
      }))
    });
  } catch (error) {
    console.error("Lỗi getBankAccounts:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau",
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// ─── POST /api/bank-accounts (THÊM TÀI KHOẢN NGÂN HÀNG) ───────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
export const createBankAccount = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const userId = req.user.id;
    const { soTaiKhoan, tenNganHang, chuTaiKhoan, laMacDinh } = req.body;

    // Validate
    if (!soTaiKhoan || !tenNganHang || !chuTaiKhoan) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ thông tin: số tài khoản, tên ngân hàng, chủ tài khoản",
      });
    }

    // Validate số tài khoản (chỉ số, 10-16 ký tự)
    if (!/^\d{10,16}$/.test(soTaiKhoan.trim())) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: "Số tài khoản không hợp lệ (10-16 chữ số)",
      });
    }

    // Nếu đặt làm mặc định, bỏ mặc định các tài khoản khác
    if (laMacDinh) {
      await BankAccountModel.setDefaultBankAccount(null, userId, connection);
    }

    // Tạo tài khoản mới
    const accountData = {
      userId,
      soTaiKhoan: soTaiKhoan.trim(),
      tenNganHang: tenNganHang.trim(),
      chuTaiKhoan: chuTaiKhoan.trim().toUpperCase(),
      laMacDinh: laMacDinh || false
    };

    const accountId = await BankAccountModel.createBankAccount(accountData);

    await connection.commit();

    // Lấy thông tin tài khoản vừa tạo
    const newAccount = await BankAccountModel.getBankAccountById(accountId);

    return res.status(201).json({
      success: true,
      message: "Thêm tài khoản ngân hàng thành công",
      data: {
        taiKhoanId: newAccount.tai_khoan_id,
        soTaiKhoan: newAccount.so_tai_khoan,
        tenNganHang: newAccount.ten_ngan_hang,
        chuTaiKhoan: newAccount.chu_tai_khoan,
        laMacDinh: newAccount.la_mac_dinh,
        createdAt: newAccount.created_at
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error("Lỗi createBankAccount:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau",
    });
  } finally {
    connection.release();
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// ─── DELETE /api/bank-accounts/:id (XÓA TÀI KHOẢN NGÂN HÀNG) ──────────────────
// ═══════════════════════════════════════════════════════════════════════════════
export const deleteBankAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "ID tài khoản không hợp lệ",
      });
    }

    // Kiểm tra tài khoản có tồn tại và thuộc về user không
    const isOwner = await BankAccountModel.checkAccountOwnership(id, userId);
    
    if (!isOwner) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tài khoản hoặc bạn không có quyền xóa",
      });
    }

    // Xóa tài khoản
    await BankAccountModel.deleteBankAccount(id);

    return res.status(200).json({
      success: true,
      message: "Xóa tài khoản ngân hàng thành công",
    });
  } catch (error) {
    console.error("Lỗi deleteBankAccount:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau",
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// ─── PUT /api/bank-accounts/:id/set-default (ĐẶT TÀI KHOẢN MẶC ĐỊNH) ──────────
// ═══════════════════════════════════════════════════════════════════════════════
export const setDefaultBankAccount = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const userId = req.user.id;

    if (!id || isNaN(id)) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: "ID tài khoản không hợp lệ",
      });
    }

    // Kiểm tra tài khoản có tồn tại và thuộc về user không
    const isOwner = await BankAccountModel.checkAccountOwnership(id, userId);
    
    if (!isOwner) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tài khoản hoặc bạn không có quyền thay đổi",
      });
    }

    // Đặt tài khoản mặc định
    await BankAccountModel.setDefaultBankAccount(id, userId, connection);

    await connection.commit();

    return res.status(200).json({
      success: true,
      message: "Đã đặt làm tài khoản mặc định",
    });
  } catch (error) {
    await connection.rollback();
    console.error("Lỗi setDefaultBankAccount:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau",
    });
  } finally {
    connection.release();
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// ─── GET /api/bank-accounts/user/:userId ──────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
//
// CÔNG DỤNG:
//   Cho Admin (role 1) hoặc Cán bộ Quỹ (role 3) lấy danh sách tài khoản ngân
//   hàng của MỘT user bất kỳ (theo userId trên URL).
//
// SỬ DỤNG:
//   Trang xét duyệt hồ sơ — cán bộ cần xem tài khoản nhận giải ngân của sinh
//   viên đã nộp đơn để xác minh trước khi chuyển duyệt.
//
// AUTH: protect + authorizeRoles(1, 3)
//
// RESPONSE: { success, message, data: [ { taiKhoanId, soTaiKhoan, tenNganHang,
//   chuTaiKhoan, laMacDinh, createdAt } ] }
// ═══════════════════════════════════════════════════════════════════════════════
export const getBankAccountsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId || isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: "userId không hợp lệ",
      });
    }

    const accounts = await BankAccountModel.getBankAccountsByUserId(parseInt(userId));

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách tài khoản thành công",
      data: accounts.map(acc => ({
        taiKhoanId: acc.tai_khoan_id,
        soTaiKhoan: acc.so_tai_khoan,
        tenNganHang: acc.ten_ngan_hang,
        chuTaiKhoan: acc.chu_tai_khoan,
        laMacDinh: acc.la_mac_dinh,
        createdAt: acc.created_at
      }))
    });
  } catch (error) {
    console.error("Lỗi getBankAccountsByUserId:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau",
    });
  }
};

export default {
  getBankAccounts,
  getBankAccountsByUserId,
  createBankAccount,
  deleteBankAccount,
  setDefaultBankAccount
};
