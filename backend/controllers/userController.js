import bcrypt from "bcryptjs";
import UserModel from "../models/UserModel.js";
import RoleModel from "../models/RoleModel.js";
import pool from "../config/db.js";
import { buildUserAvatarUrl } from "../utils/imageHelper.js";

// ─── POST /api/users ──────────────────────────────────────────────────────────
// Yêu cầu: phải có access token hợp lệ (đã qua middleware protect)
// Tạo người dùng mới trong hệ thống
export const createUser = async (req, res) => {
  try {
    const {
      maSoDinhDanh,
      hoTen,
      email,
      matKhau,
      roleId,
      trangThai,
      khoaphong,
      soDienThoai,
      diaChi,
      loaiTaiKhoan,
      avatar,
      tenNhaTaiTro,
      loaiNhaTaiTro,
    } = req.body;

    // 1. Validate dữ liệu đầu vào
    if (!maSoDinhDanh || !hoTen || !email || !matKhau || !roleId) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ thông tin: mã số, họ tên, email, mật khẩu, vai trò",
      });
    }

    // 2. Validate loaiTaiKhoan chỉ được set khi roleId = 4
    if (loaiTaiKhoan && roleId !== 4) {
      return res.status(400).json({
        success: false,
        message: "Loại tài khoản chỉ được set khi vai trò là người dùng (role_id = 4)",
      });
    }

    // 3. Validate giá trị loaiTaiKhoan nếu có
    if (loaiTaiKhoan && !['SINH_VIEN', 'NHA_TAI_TRO'].includes(loaiTaiKhoan)) {
      return res.status(400).json({
        success: false,
        message: "Loại tài khoản chỉ được là SINH_VIEN hoặc NHA_TAI_TRO",
      });
    }

    // 4. Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Email không đúng định dạng",
      });
    }

    // 5. Validate độ dài mật khẩu
    if (matKhau.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu phải có ít nhất 6 ký tự",
      });
    }

    // 6. Kiểm tra email đã tồn tại chưa
    const emailExists = await UserModel.checkEmailExists(email);
    if (emailExists) {
      return res.status(409).json({
        success: false,
        message: "Email đã được sử dụng",
      });
    }

    // 7. Kiểm tra role_id có hợp lệ không
    const role = await RoleModel.getRoleById(roleId);
    if (!role) {
      return res.status(400).json({
        success: false,
        message: "Vai trò không hợp lệ",
      });
    }

    // 8. Hash mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(matKhau, salt);

    // 9. Tạo user mới trong database
    const userData = {
      maSoDinhDanh: maSoDinhDanh.trim(),
      hoTen: hoTen.trim(),
      email: email.trim().toLowerCase(),
      matKhau: hashedPassword,
      roleId: roleId,
      khoaphong: khoaphong ? khoaphong.trim() : null,
      trangThai: trangThai || 'HOAT_DONG',
      soDienThoai: soDienThoai || null,
      diaChi: diaChi || null,
      loaiTaiKhoan: (roleId === 4 && loaiTaiKhoan) ? loaiTaiKhoan : null,
      avatar: avatar || null
    };

    const userId = await UserModel.createUser(userData);

    // Nếu là NHA_TAI_TRO, tự tạo record trong nhataitro (FK user_id UNIQUE NOT NULL)
    if (Number(roleId) === 4 && loaiTaiKhoan === 'NHA_TAI_TRO') {
      await pool.execute(
        `INSERT INTO nhataitro (user_id, ten_nha_tai_tro, loai)
         VALUES (?, ?, ?)`,
        [userId, tenNhaTaiTro?.trim() || hoTen.trim(), loaiNhaTaiTro || 'Ca nhan']
      );
    }

    // 10. Lấy thông tin user vừa tạo (không bao gồm mật khẩu)
    const newUser = await UserModel.getUserById(userId);

    return res.status(201).json({
      success: true,
      message: "Tạo người dùng thành công",
      user: {
        id: newUser.user_id,
        maSoDinhDanh: newUser.ma_so_dinh_danh,
        hoTen: newUser.ho_ten,
        email: newUser.email,
        avatar: buildUserAvatarUrl(newUser.avatar), // ✅ Build full URL
        soDienThoai: newUser.so_dien_thoai,
        diaChi: newUser.dia_chi,
        vaiTro: newUser.role_id,
        loaiTaiKhoan: newUser.loai_tai_khoan,
        khoaPhong: newUser.khoa_phong,
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

// ─── GET /api/users ───────────────────────────────────────────────────────────
// Hỗ trợ filter + pagination
//   Query: tab, keyword, trang_thai, khoa_phong, loai_ntt, page, page_size
export const getUsers = async (req, res) => {
  try {
    const {
      tab = 'tat_ca',
      keyword = '',
      trang_thai = '',
      khoa_phong = '',
      loai_ntt = '',
      page = 1,
      page_size = 15,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(page_size, 10) || 15));

    const { rows, total } = await UserModel.getUserList({
      tab: String(tab).trim(),
      keyword: String(keyword).trim(),
      trang_thai: String(trang_thai).trim(),
      khoa_phong: String(khoa_phong).trim(),
      loai_ntt: String(loai_ntt).trim(),
      page: pageNum,
      page_size: pageSize,
    });

    return res.status(200).json({
      success: true,
      data: rows.map(user => ({
        user_id: user.user_id,
        ma_so_dinh_danh: user.ma_so_dinh_danh,
        ho_ten: user.ho_ten,
        email: user.email,
        avatar: buildUserAvatarUrl(user.avatar),
        so_dien_thoai: user.so_dien_thoai,
        dia_chi: user.dia_chi,
        role_id: user.role_id,
        ten_vai_tro: user.ten_vai_tro,
        loai_tai_khoan: user.loai_tai_khoan,
        khoa_phong: user.khoa_phong,
        trang_thai: user.trang_thai,
        created_at: user.created_at,
        ten_nha_tai_tro: user.ten_nha_tai_tro,
        loai_nha_tai_tro: user.loai_nha_tai_tro,
        tong_so_tien_da_tai_tro: Number(user.tong_so_tien_da_tai_tro) || 0,
        so_lan_tai_tro: Number(user.so_lan_tai_tro) || 0,
      })),
      pagination: {
        page: pageNum,
        page_size: pageSize,
        total,
        total_pages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("Lỗi getUsers:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau",
    });
  }
};

// ─── GET /api/users/stats ─────────────────────────────────────────────────────
export const getUserStats = async (_req, res) => {
  try {
    const stats = await UserModel.getStats();
    return res.status(200).json({ success: true, data: stats });
  } catch (error) {
    console.error("Lỗi getUserStats:", error);
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// ─── PATCH /api/users/:id ─────────────────────────────────────────────────────
// Cập nhật thông tin user — chỉ cho phép sửa user role_id = 4
//   Body: ho_ten, so_dien_thoai, dia_chi, khoa_phong, avatar
//   Cho NHA_TAI_TRO: ten_nha_tai_tro, loai_ntt (cập nhật bảng nhataitro)
export const updateUserInfo = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(id)) {
      return res.status(400).json({ success: false, message: "ID không hợp lệ" });
    }

    const existing = await UserModel.getUserByIdWithRole(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Không tìm thấy người dùng" });
    }

    if (Number(existing.role_id) !== 4) {
      return res.status(403).json({
        success: false,
        message: "Chỉ có thể chỉnh sửa tài khoản người dùng (sinh viên / nhà tài trợ)",
      });
    }

    const {
      ho_ten,
      so_dien_thoai,
      dia_chi,
      khoa_phong,
      avatar,
      ten_nha_tai_tro,
      loai_ntt,
    } = req.body || {};

    await UserModel.updateUserInfo(id, {
      ho_ten: ho_ten?.trim(),
      so_dien_thoai: so_dien_thoai?.trim(),
      dia_chi: dia_chi?.trim(),
      khoa_phong: khoa_phong?.trim(),
      avatar,
    });

    // Nếu là NHA_TAI_TRO và có gửi info riêng → update bảng nhataitro
    if (existing.loai_tai_khoan === 'NHA_TAI_TRO' && (ten_nha_tai_tro || loai_ntt)) {
      const pool = (await import("../config/db.js")).default;
      const sets = [];
      const params = [];
      if (ten_nha_tai_tro) { sets.push('ten_nha_tai_tro = ?'); params.push(ten_nha_tai_tro.trim()); }
      if (loai_ntt) { sets.push('loai = ?'); params.push(loai_ntt); }
      if (sets.length) {
        params.push(id);
        await pool.execute(
          `UPDATE nhataitro SET ${sets.join(', ')} WHERE user_id = ?`,
          params
        );
      }
    }

    const updated = await UserModel.getUserByIdWithRole(id);
    return res.status(200).json({
      success: true,
      message: "Cập nhật người dùng thành công",
      data: {
        user_id: updated.user_id,
        ma_so_dinh_danh: updated.ma_so_dinh_danh,
        ho_ten: updated.ho_ten,
        email: updated.email,
        avatar: buildUserAvatarUrl(updated.avatar),
        so_dien_thoai: updated.so_dien_thoai,
        dia_chi: updated.dia_chi,
        role_id: updated.role_id,
        ten_vai_tro: updated.ten_vai_tro,
        loai_tai_khoan: updated.loai_tai_khoan,
        khoa_phong: updated.khoa_phong,
        trang_thai: updated.trang_thai,
        created_at: updated.created_at,
      },
    });
  } catch (error) {
    console.error("Lỗi updateUserInfo:", error);
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// ─── GET /api/users/:id ───────────────────────────────────────────────────────
// Yêu cầu: phải có access token hợp lệ và quyền admin/giáo vụ (role_id: 1 hoặc 3)
// Trả về thông tin chi tiết của một người dùng cụ thể
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Validate ID
    if (!id || id.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp ID người dùng",
      });
    }

    // 2. Lấy thông tin user từ database
    const user = await UserModel.getUserByIdWithRole(id.trim());

    // 3. Kiểm tra user có tồn tại không
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    // 4. Trả về thông tin user (không bao gồm mật khẩu)
    return res.status(200).json({
      success: true,
      user: {
        id: user.user_id,
        maSoDinhDanh: user.ma_so_dinh_danh,
        hoTen: user.ho_ten,
        email: user.email,
        avatar: buildUserAvatarUrl(user.avatar), // ✅ Build full URL
        soDienThoai: user.so_dien_thoai,
        diaChi: user.dia_chi,
        vaiTro: {
          id: user.role_id,
          ten: user.ten_vai_tro,
          moTa: user.mo_ta_vai_tro
        },
        loaiTaiKhoan: user.loai_tai_khoan,
        khoaPhong: user.khoa_phong,
        trangThai: user.trang_thai,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error("Lỗi getUserById:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau",
    });
  }
};

// ─── PUT /api/users/:id/status ────────────────────────────────────────────────
// Yêu cầu: phải có access token hợp lệ và quyền admin (role_id: 1)
// Cập nhật trạng thái người dùng (kích hoạt/khóa tài khoản)
export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { trangThai } = req.body;

    // 1. Validate ID
    if (!id || id.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp ID người dùng",
      });
    }

    // 2. Validate trạng thái
    if (!trangThai) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp trạng thái",
      });
    }

    // 3. Kiểm tra giá trị trạng thái hợp lệ
    const validStatuses = ["HOAT_DONG", "KHOA"];
    if (!validStatuses.includes(trangThai)) {
      return res.status(400).json({
        success: false,
        message: "Trạng thái không hợp lệ. Chỉ chấp nhận: HOAT_DONG, KHOA",
      });
    }

    // 4. Kiểm tra user có tồn tại không
    const existingUser = await UserModel.getUserById(id.trim());
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    // 4b. Cán bộ Quỹ (role 3) chỉ được khóa/mở user role_id = 4
    const callerRole = Number(req.user?.vaiTro ?? req.user?.role_id);
    if (callerRole === 3 && Number(existingUser.role_id) !== 4) {
      return res.status(403).json({
        success: false,
        message: "Bạn chỉ có thể khóa/mở khóa tài khoản sinh viên hoặc nhà tài trợ",
      });
    }

    // 5. Không cho phép tự khóa tài khoản của chính mình
    if (String(req.user.id) === id.trim() && trangThai === "KHOA") {
      return res.status(400).json({
        success: false,
        message: "Bạn không thể khóa tài khoản của chính mình",
      });
    }

    // 6. Cập nhật trạng thái
    await UserModel.updateUserStatus(id.trim(), trangThai);

    // 7. Lấy thông tin user sau khi cập nhật
    const updatedUser = await UserModel.getUserByIdWithRole(id.trim());

    return res.status(200).json({
      success: true,
      message: `${trangThai === "KHOA" ? "Khóa" : "Kích hoạt"} tài khoản thành công`,
      user: {
        id: updatedUser.user_id,
        maSoDinhDanh: updatedUser.ma_so_dinh_danh,
        hoTen: updatedUser.ho_ten,
        email: updatedUser.email,
        avatar: buildUserAvatarUrl(updatedUser.avatar), // ✅ Build full URL
        soDienThoai: updatedUser.so_dien_thoai,
        diaChi: updatedUser.dia_chi,
        vaiTro: {
          id: updatedUser.role_id,
          ten: updatedUser.ten_vai_tro
        },
        loaiTaiKhoan: updatedUser.loai_tai_khoan,
        khoaPhong: updatedUser.khoa_phong,
        trangThai: updatedUser.trang_thai,
        createdAt: updatedUser.created_at
      }
    });
  } catch (error) {
    console.error("Lỗi updateUserStatus:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau",
    });
  }
};
