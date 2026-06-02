import bcrypt from "bcryptjs";
import UserModel from "../../models/auth/UserModel.js";
import RoleModel from "../../models/users/RoleModel.js";
import pool from "../../config/db.js";
import { buildUserAvatarUrl } from "../../utils/helpers/imageHelper.js";
import { logSystemActivity } from "../../utils/helpers/loggerHelper.js";

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
        `INSERT INTO nhataitro (nguoidung_id, tennhataitro, loainhataitro)
         VALUES (?, ?, ?)`,
        [userId, tenNhaTaiTro?.trim() || hoTen.trim(), loaiNhaTaiTro || 'Ca nhan']
      );
    }

    // 10. Lấy thông tin user vừa tạo (không bao gồm mật khẩu)
    const newUser = await UserModel.getUserById(userId);

    // Ghi nhật ký hệ thống
    await logSystemActivity(req, {
      hanhdong: "THEM_MOI_NGUOI_DUNG",
      loaidoituong: "nguoidung",
      doituong_id: userId,
      mota: `Tạo người dùng mới: ${userData.email} (Họ tên: ${userData.hoTen}, Vai trò ID: ${userData.roleId})`,
      dulieumoi: { ...userData, matKhau: undefined }
    });

    return res.status(201).json({
      success: true,
      message: "Tạo người dùng thành công",
      user: {
        id: newUser.nguoidung_id,
        maSoDinhDanh: newUser.masodinhdanh,
        hoTen: newUser.hoten,
        email: newUser.email,
        avatar: buildUserAvatarUrl(newUser.avatar), // ✅ Build full URL
        soDienThoai: newUser.sodienthoai,
        diaChi: newUser.diachi,
        vaiTro: newUser.vaitro_id,
        loaiTaiKhoan: newUser.loaitaikhoan,
        khoaPhong: newUser.khoaphong,
        trangThai: newUser.trangthai,
        createdAt: newUser.ngaytao
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
        user_id: user.nguoidung_id,
        ma_so_dinh_danh: user.masodinhdanh,
        ho_ten: user.hoten,
        email: user.email,
        avatar: buildUserAvatarUrl(user.avatar),
        so_dien_thoai: user.sodienthoai,
        dia_chi: user.diachi,
        role_id: user.vaitro_id,
        ten_vai_tro: user.tenvaitro,
        loai_tai_khoan: user.loaitaikhoan,
        khoa_phong: user.khoaphong,
        trang_thai: user.trangthai,
        created_at: user.ngaytao,
        ten_nha_tai_tro: user.tennhataitro,
        loai_nha_tai_tro: user.loainhataitro,
        tong_so_tien_da_tai_tro: Number(user.tongsotiendataitro) || 0,
        so_lan_tai_tro: Number(user.solantaitro) || 0,
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

// ─── GET /api/users/growth ────────────────────────────────────────────────────
export const getUserGrowth = async (req, res) => {
  try {
    const months = Math.min(Math.max(parseInt(req.query.months) || 6, 1), 12);
    const data = await UserModel.getUserGrowth(months);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Lỗi getUserGrowth:", error);
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

    if (Number(existing.vaitro_id) !== 4 && Number(req.user.id) !== Number(id)) {
      return res.status(403).json({
        success: false,
        message: "Chỉ có thể chỉnh sửa tài khoản người dùng (sinh viên / nhà tài trợ)",
      });
    }

    // Kiểm tra quyền sở hữu hoặc vai trò cán bộ/admin
    if (
      Number(req.user.role_id) !== 1 &&
      Number(req.user.role_id) !== 3 &&
      Number(req.user.id) !== Number(id)
    ) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền chỉnh sửa thông tin của tài khoản này",
      });
    }

    const {
      ho_ten,
      email,
      so_dien_thoai,
      dia_chi,
      khoa_phong,
      avatar,
      ten_nha_tai_tro,
      loai_ntt,
    } = req.body || {};

    // Xử lý kiểm tra email trùng lặp nếu có thay đổi email
    let finalEmail = undefined;
    if (email && email.trim() !== "") {
      const trimmedEmail = email.trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        return res.status(400).json({ success: false, message: "Email không đúng định dạng" });
      }

      if (trimmedEmail !== existing.email.toLowerCase()) {
        const duplicate = await UserModel.checkEmailExists(trimmedEmail);
        if (duplicate) {
          return res.status(400).json({
            success: false,
            message: "Email này đã được sử dụng bởi tài khoản khác",
          });
        }
        finalEmail = trimmedEmail;
      }
    }

    await UserModel.updateUserInfo(id, {
      ho_ten: ho_ten?.trim(),
      email: finalEmail,
      so_dien_thoai: so_dien_thoai?.trim(),
      dia_chi: dia_chi?.trim(),
      khoa_phong: khoa_phong?.trim(),
      avatar,
    });

    // Nếu là NHA_TAI_TRO và có gửi info riêng → update bảng nhataitro
    if (existing.loaitaikhoan === 'NHA_TAI_TRO' && (ten_nha_tai_tro || loai_ntt)) {
      const pool = (await import("../../config/db.js")).default;
      const sets = [];
      const params = [];
      if (ten_nha_tai_tro) { sets.push('tennhataitro = ?'); params.push(ten_nha_tai_tro.trim()); }
      if (loai_ntt) { sets.push('loainhataitro = ?'); params.push(loai_ntt); }
      if (sets.length) {
        params.push(id);
        await pool.execute(
          `UPDATE nhataitro SET ${sets.join(', ')} WHERE nguoidung_id = ?`,
          params
        );
      }
    }

    // Ghi nhật ký hệ thống
    await logSystemActivity(req, {
      hanhdong: "CAP_NHAT_THONG_TIN_NGUOI_DUNG",
      loaidoituong: "nguoidung",
      doituong_id: id,
      mota: `Cập nhật thông tin tài khoản cho người dùng ${existing.email} (Họ tên: ${existing.hoten})`,
      dulieucu: existing,
      dulieumoi: { ho_ten, email, so_dien_thoai, dia_chi, khoa_phong, avatar }
    });

    const updated = await UserModel.getUserByIdWithRole(id);
    return res.status(200).json({
      success: true,
      message: "Cập nhật người dùng thành công",
      data: {
        user_id: updated.nguoidung_id,
        ma_so_dinh_danh: updated.masodinhdanh,
        ho_ten: updated.hoten,
        email: updated.email,
        avatar: buildUserAvatarUrl(updated.avatar),
        so_dien_thoai: updated.sodienthoai,
        dia_chi: updated.diachi,
        role_id: updated.vaitro_id,
        ten_vai_tro: updated.tenvaitro,
        loai_tai_khoan: updated.loaitaikhoan,
        khoa_phong: updated.khoaphong,
        trang_thai: updated.trangthai,
        created_at: updated.ngaytao,
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
        id: user.nguoidung_id,
        maSoDinhDanh: user.masodinhdanh,
        hoTen: user.hoten,
        email: user.email,
        avatar: buildUserAvatarUrl(user.avatar), // ✅ Build full URL
        soDienThoai: user.sodienthoai,
        diaChi: user.diachi,
        vaiTro: {
          id: user.vaitro_id,
          ten: user.tenvaitro,
          moTa: user.mota_vaitro
        },
        loaiTaiKhoan: user.loaitaikhoan,
        khoaPhong: user.khoaphong,
        trangThai: user.trangthai,
        createdAt: user.ngaytao
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
    const callerRole = Number(req.user?.vaiTro ?? req.user?.role_id ?? req.user?.vai_tro);
    if (callerRole === 3 && Number(existingUser.vaitro_id) !== 4) {
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

    // Ghi nhật ký hệ thống
    await logSystemActivity(req, {
      hanhdong: "CAP_NHAT_TRANG_THAI_NGUOI_DUNG",
      loaidoituong: "nguoidung",
      doituong_id: id.trim(),
      mota: `Thay đổi trạng thái tài khoản ${existingUser.email} sang '${trangThai}'`,
      dulieucu: { trangthai: existingUser.trangthai },
      dulieumoi: { trangthai: trangThai }
    });

    // 7. Lấy thông tin user sau khi cập nhật
    const updatedUser = await UserModel.getUserByIdWithRole(id.trim());

    return res.status(200).json({
      success: true,
      message: `${trangThai === "KHOA" ? "Khóa" : "Kích hoạt"} tài khoản thành công`,
      user: {
        id: updatedUser.nguoidung_id,
        maSoDinhDanh: updatedUser.masodinhdanh,
        hoTen: updatedUser.hoten,
        email: updatedUser.email,
        avatar: buildUserAvatarUrl(updatedUser.avatar), // ✅ Build full URL
        soDienThoai: updatedUser.sodienthoai,
        diaChi: updatedUser.diachi,
        vaiTro: {
          id: updatedUser.vaitro_id,
          ten: updatedUser.tenvaitro
        },
        loaiTaiKhoan: updatedUser.loaitaikhoan,
        khoaPhong: updatedUser.khoaphong,
        trangThai: updatedUser.trangthai,
        createdAt: updatedUser.ngaytao
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
