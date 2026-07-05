import pool from "../../config/db.js";
import BankAccountModel from "../../models/funds/BankAccountModel.js";

// ═══════════════════════════════════════════════════════════════════════════════
// ─── GET /api/bank-accounts/school (LẤY DANH SÁCH TK NHÀ TRƯỜNG) ──────────────
// ═══════════════════════════════════════════════════════════════════════════════
export const getSchoolBankAccounts = async (req, res) => {
  try {
    const accounts = await BankAccountModel.getSchoolBankAccounts();

    const data = accounts.map(acc => ({
      taiKhoanId: acc.taikhoannganhang_id,
      soTaiKhoan: acc.sotaikhoan,
      tenNganHang: acc.nganhang,
      chiNhanh: acc.chinhanh,
      chuTaiKhoan: acc.chutaikhoan,
      trangThai: acc.trangthai,
      ngayTao: acc.ngaytao,
    }));

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách tài khoản nhà trường thành công",
      data
    });
  } catch (error) {
    console.error("Lỗi getSchoolBankAccounts:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau",
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// ─── GET /api/bank-accounts (LẤY DANH SÁCH TÀI KHOẢN NGÂN HÀNG CỦA USER) ──────
// ═══════════════════════════════════════════════════════════════════════════════
export const getBankAccounts = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await pool.query(
      `SELECT tk.taikhoannganhang_id, tk.sotaikhoan, tk.nganhang, tk.chutaikhoan, tk.ngaytao 
       FROM nguoidung n
       INNER JOIN taikhoannganhang tk ON n.taikhoannganhang_id = tk.taikhoannganhang_id
       WHERE n.nguoidung_id = ? 
       LIMIT 1`,
      [userId]
    );

    const account = rows[0];
    const data = [];

    if (account) {
      data.push({
        taiKhoanId: account.taikhoannganhang_id,
        soTaiKhoan: account.sotaikhoan,
        tenNganHang: account.nganhang,
        chuTaiKhoan: account.chutaikhoan,
        laMacDinh: true,
        createdAt: account.ngaytao
      });
    }

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách tài khoản thành công",
      data
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
// ─── POST /api/bank-accounts (THÊM/CẬP NHẬT TÀI KHOẢN NGÂN HÀNG) ──────────────
// ═══════════════════════════════════════════════════════════════════════════════
export const createBankAccount = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const userId = req.user.id;
    const { soTaiKhoan, tenNganHang, chuTaiKhoan } = req.body;

    // Validate
    if (!soTaiKhoan || !tenNganHang || !chuTaiKhoan) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ thông tin: số tài khoản, tên ngân hàng, chủ tài khoản",
      });
    }

    // Validate số tài khoản (chỉ số, 10-16 ký tự)
    if (!/^\d{10,16}$/.test(soTaiKhoan.trim())) {
      return res.status(400).json({
        success: false,
        message: "Số tài khoản không hợp lệ (10-16 chữ số)",
      });
    }

    await connection.beginTransaction();

    // Check if user already has a bank account linked
    const [userRows] = await connection.query(
      `SELECT taikhoannganhang_id FROM nguoidung WHERE nguoidung_id = ? LIMIT 1`,
      [userId]
    );
    const existingAccountId = userRows[0]?.taikhoannganhang_id;

    let accountId;
    if (existingAccountId) {
      // Update existing bank account
      await connection.query(
        `UPDATE taikhoannganhang 
         SET sotaikhoan = ?, nganhang = ?, chutaikhoan = ? 
         WHERE taikhoannganhang_id = ?`,
        [soTaiKhoan.trim(), tenNganHang.trim(), chuTaiKhoan.trim().toUpperCase(), existingAccountId]
      );
      accountId = existingAccountId;
    } else {
      // Create new bank account (quy_id is NULL for user account)
      const [insertResult] = await connection.query(
        `INSERT INTO taikhoannganhang (quy_id, sotaikhoan, nganhang, chutaikhoan, trangthai) 
         VALUES (NULL, ?, ?, ?, 'Hoat dong')`,
        [soTaiKhoan.trim(), tenNganHang.trim(), chuTaiKhoan.trim().toUpperCase()]
      );
      accountId = insertResult.insertId;

      // Link to user
      await connection.query(
        `UPDATE nguoidung SET taikhoannganhang_id = ? WHERE nguoidung_id = ?`,
        [accountId, userId]
      );
    }

    await connection.commit();

    return res.status(201).json({
      success: true,
      message: "Cập nhật tài khoản ngân hàng thành công",
      data: {
        taiKhoanId: accountId,
        soTaiKhoan: soTaiKhoan.trim(),
        tenNganHang: tenNganHang.trim(),
        chuTaiKhoan: chuTaiKhoan.trim().toUpperCase(),
        laMacDinh: true,
        createdAt: new Date()
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
  const connection = await pool.getConnection();
  try {
    const userId = req.user.id;

    await connection.beginTransaction();

    // Get linked bank account
    const [userRows] = await connection.query(
      `SELECT taikhoannganhang_id FROM nguoidung WHERE nguoidung_id = ? LIMIT 1`,
      [userId]
    );
    const accountId = userRows[0]?.taikhoannganhang_id;

    if (accountId) {
      // Unlink from user
      await connection.query(
        `UPDATE nguoidung SET taikhoannganhang_id = NULL WHERE nguoidung_id = ?`,
        [userId]
      );
      // Delete record from taikhoannganhang
      await connection.query(
        `DELETE FROM taikhoannganhang WHERE taikhoannganhang_id = ?`,
        [accountId]
      );
    }

    await connection.commit();

    return res.status(200).json({
      success: true,
      message: "Xóa tài khoản ngân hàng thành công",
    });
  } catch (error) {
    await connection.rollback();
    console.error("Lỗi deleteBankAccount:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau",
    });
  } finally {
    connection.release();
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// ─── PUT /api/bank-accounts/:id/set-default (ĐẶT TÀI KHOẢN MẶC ĐỊNH) ──────────
// ═══════════════════════════════════════════════════════════════════════════════
export const setDefaultBankAccount = async (req, res) => {
  try {
    // Vì mỗi user chỉ có tối đa 1 tài khoản trong bảng nguoidung, tài khoản đó luôn là mặc định
    return res.status(200).json({
      success: true,
      message: "Đã đặt làm tài khoản mặc định",
    });
  } catch (error) {
    console.error("Lỗi setDefaultBankAccount:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau",
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// ─── GET /api/bank-accounts/user/:userId (CHO CÁN BỘ LẤY TK CỦA SINH VIÊN) ─────
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

    const [rows] = await pool.query(
      `SELECT tk.taikhoannganhang_id, tk.sotaikhoan, tk.nganhang, tk.chutaikhoan, tk.ngaytao 
       FROM nguoidung n
       INNER JOIN taikhoannganhang tk ON n.taikhoannganhang_id = tk.taikhoannganhang_id
       WHERE n.nguoidung_id = ? 
       LIMIT 1`,
      [parseInt(userId)]
    );

    const account = rows[0];
    const data = [];

    if (account) {
      data.push({
        taiKhoanId: account.taikhoannganhang_id,
        soTaiKhoan: account.sotaikhoan,
        tenNganHang: account.nganhang,
        chuTaiKhoan: account.chutaikhoan,
        laMacDinh: true,
        createdAt: account.ngaytao
      });
    }

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách tài khoản thành công",
      data
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
  getSchoolBankAccounts,
  getBankAccounts,
  getBankAccountsByUserId,
  createBankAccount,
  deleteBankAccount,
  setDefaultBankAccount
};
