import bcrypt from "bcryptjs";
import UserModel from "../models/UserModel.js";
import RoleModel from "../models/RoleModel.js";

// ─── POST /api/users ──────────────────────────────────────────────────────────
// Yêu cầu: phải có access token hợp lệ (đã qua middleware protect)
// Tạo người dùng mới trong hệ thống
export const createUser = async (req, res) => {
  try {
    const { maSoDinhDanh, hoTen, email, matKhau, roleId, trangThai, khoaphong } = req.body;

    // 1. Validate dữ liệu đầu vào
    if (!maSoDinhDanh || !hoTen || !email || !matKhau || !roleId || !khoaphong) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ thông tin: mã số, họ tên, email, mật khẩu, vai trò, khoa phong",
      });
    }

    // 2. Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Email không đúng định dạng",
      });
    }

    // 3. Validate độ dài mật khẩu
    if (matKhau.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu phải có ít nhất 6 ký tự",
      });
    }

    // 4. Kiểm tra email đã tồn tại chưa
    const emailExists = await UserModel.checkEmailExists(email);
    if (emailExists) {
      return res.status(409).json({
        success: false,
        message: "Email đã được sử dụng",
      });
    }

    // 5. Kiểm tra role_id có hợp lệ không
    const role = await RoleModel.getRoleById(roleId);
    if (!role) {
      return res.status(400).json({
        success: false,
        message: "Vai trò không hợp lệ",
      });
    }

    // 6. Hash mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(matKhau, salt);

    // 7. Tạo user mới trong database
    const userData = {
      maSoDinhDanh: maSoDinhDanh.trim(),
      hoTen: hoTen.trim(),
      email: email.trim().toLowerCase(),
      matKhau: hashedPassword,
      roleId: roleId,
      khoaphong: khoaphong.trim(),
      trangThai: trangThai || 'HOAT_DONG'
    };

    await UserModel.createUser(userData);

    // 8. Lấy thông tin user vừa tạo (không bao gồm mật khẩu)
    const newUser = await UserModel.getUserById(maSoDinhDanh);

    return res.status(201).json({
      success: true,
      message: "Tạo người dùng thành công",
      user: {
        id: newUser.ma_so_dinh_danh,
        hoTen: newUser.ho_ten,
        email: newUser.email,
        vaiTro: newUser.role_id,
        trangThai: newUser.trang_thai,
        createdAt: newUser.created_at
      }
    });
  } catch (error) {
    console.error("Lỗi createUser:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau",
    });
  }
};
