import RoleModel from "../../models/users/RoleModel.js";

// ─── GET /api/roles ───────────────────────────────────────────────────────────
// Yêu cầu: phải có access token hợp lệ (đã qua middleware protect)
// Trả về danh sách tất cả vai trò trong hệ thống
export const getRoles = async (req, res) => {
  try {
    // Lấy danh sách vai trò từ database
    const roles = await RoleModel.getAllRoles();

    return res.status(200).json({
      success: true,
      roles: roles.map(role => ({
        id: role.vaitro_id,
        tenVaiTro: role.tenvaitro,
        moTa: role.mota,
        trangthai: role.trangthai || "Hoat dong"
      }))
    });
  } catch (error) {
    console.error("Lỗi getRoles:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau",
    });
  }
};

// ─── GET /api/roles/:id ───────────────────────────────────────────────────────
// Yêu cầu: phải có access token hợp lệ (đã qua middleware protect)
// Trả về thông tin chi tiết của một vai trò cụ thể
export const getRoleById = async (req, res) => {
  try {
    const { id } = req.params;

    // Kiểm tra id có được cung cấp không
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp ID vai trò",
      });
    }

    // Lấy thông tin vai trò từ database
    const role = await RoleModel.getRoleById(id);

    // Kiểm tra vai trò có tồn tại không
    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy vai trò",
      });
    }

    return res.status(200).json({
      success: true,
      role: {
        id: role.vaitro_id,
        tenVaiTro: role.tenvaitro,
        moTa: role.mota,
        trangThai: role.trangthai || "Hoat dong"
      }
    });
  } catch (error) {
    console.error("Lỗi getRoleById:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau",
    });
  }
};

// ─── PATCH /api/roles/:id ─────────────────────────────────────────────────────
// Yêu cầu: phải có access token hợp lệ (đã qua middleware protect)
// Cập nhật một phần thông tin của vai trò (partial update)
// Chỉ cập nhật các field được gửi lên, không bắt buộc gửi tất cả
export const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { tenVaiTro, moTa, trangThai } = req.body;

    // 1. Validate ID
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp ID vai trò",
      });
    }

    // 2. Kiểm tra có ít nhất một field để update
    if (tenVaiTro === undefined && moTa === undefined && trangThai === undefined) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp ít nhất một trường để cập nhật",
      });
    }

    // 3. Kiểm tra vai trò có tồn tại không
    const existingRole = await RoleModel.getRoleById(id);
    if (!existingRole) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy vai trò",
      });
    }

    // 4. Validate tên vai trò nếu có
    if (tenVaiTro !== undefined && tenVaiTro.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Tên vai trò không được để trống",
      });
    }

    // 5. Validate trạng thái nếu có
    if (trangThai !== undefined && !["HOAT_DONG", "KHOA"].includes(trangThai)) {
      return res.status(400).json({
        success: false,
        message: "Trạng thái không hợp lệ. Chỉ chấp nhận: HOAT_DONG, KHOA",
      });
    }

    // 6. Chuẩn bị dữ liệu cập nhật (chỉ các field được gửi lên)
    const updateData = {};
    if (tenVaiTro !== undefined) updateData.tenVaiTro = tenVaiTro.trim();
    if (moTa !== undefined) updateData.moTa = moTa.trim();
    if (trangThai !== undefined) updateData.trangThai = trangThai;

    // 7. Cập nhật vào database
    const result = await RoleModel.updateRole(id, updateData);

    // 8. Kiểm tra kết quả update
    if (result.affectedRows === 0) {
      return res.status(400).json({
        success: false,
        message: "Không có thay đổi nào được thực hiện",
      });
    }

    // 9. Lấy thông tin vai trò sau khi cập nhật
    const updatedRole = await RoleModel.getRoleById(id);

    return res.status(200).json({
      success: true,
      message: "Cập nhật vai trò thành công",
      role: {
        id: updatedRole.vaitro_id,
        tenVaiTro: updatedRole.tenvaitro,
        moTa: updatedRole.mota,
        trangThai: updatedRole.trangthai || "Hoat dong"
      }
    });
  } catch (error) {
    console.error("Lỗi updateRole:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau",
    });
  }
};

// ─── GET /api/roles/:id/users ─────────────────────────────────────────────────
// Yêu cầu: phải có access token hợp lệ (đã qua middleware protect)
// Trả về danh sách người dùng thuộc vai trò cụ thể
export const getUsersByRole = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Validate ID
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp ID vai trò",
      });
    }

    // 2. Kiểm tra vai trò có tồn tại không
    const role = await RoleModel.getRoleById(id);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy vai trò",
      });
    }

    // 3. Lấy danh sách người dùng theo vai trò
    const users = await RoleModel.getUsersByRoleId(id);

    // 4. Trả về kết quả
    return res.status(200).json({
      success: true,
      role: {
        id: role.vaitro_id,
        tenVaiTro: role.tenvaitro
      },
      total: users.length,
      users: users.map(user => ({
        id: user.masodinhdanh,
        hoTen: user.hoten,
        email: user.email,
        vaiTro: user.vaitro_id,
        trangThai: user.trangthai,
        createdAt: user.ngaytao
      }))
    });
  } catch (error) {
    console.error("Lỗi getUsersByRole:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau",
    });
  }
};
