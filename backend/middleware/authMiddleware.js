import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import pool from "../config/db.js";

const getMaintenanceMode = () => {
  try {
    const settingsPath = path.join(process.cwd(), "config/system_settings.json");
    const data = fs.readFileSync(settingsPath, "utf8");
    const settings = JSON.parse(data);
    return !!settings.maintenanceMode;
  } catch (error) {
    return false;
  }
};

// Middleware kiểm tra JWT token — dùng cho các route cần đăng nhập
export const protect = async (req, res, next) => {
  try {
    // Lấy token từ header: Authorization: Bearer <token>
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Không có token, vui lòng đăng nhập",
      });
    }

    const token = authHeader.split(" ")[1];

    // Giải mã và xác thực token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Kiểm tra chế độ bảo trì
    if (getMaintenanceMode() && decoded.vai_tro !== 1) {
      return res.status(503).json({
        success: false,
        message: "Hệ thống đang trong chế độ bảo trì. Chỉ Admin được phép truy cập.",
        maintenance: true
      });
    }

    // Kiểm tra vai trò có bị tạm dừng không
    const [roleRows] = await pool.query("SELECT trangthai FROM vaitro WHERE vaitro_id = ?", [decoded.vai_tro]);
    if (roleRows.length > 0 && roleRows[0].trangthai === 'TAM_DUNG') {
      return res.status(403).json({
        success: false,
        message: "Vai trò của bạn đã bị tạm dừng. Vui lòng liên hệ quản trị viên."
      });
    }

    // Gán thông tin user vào request để các route sau dùng
    // LƯU Ý: Schema database dùng "user_id" không phải "id"
    req.user = {
      id: decoded.user_id,  // Sửa từ decoded.id → decoded.user_id
      vai_tro: decoded.vai_tro,
      roleId: decoded.vai_tro  // Thêm roleId để dùng cho authorizeRoles
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Token không hợp lệ hoặc đã hết hạn",
    });
  }
};

// Middleware kiểm tra vai trò (phân quyền)
// Ví dụ dùng: router.get("/...", protect, requireRole("quan_tri"), controller)
export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.vai_tro)) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền thực hiện thao tác này",
      });
    }
    next();
  };
};

// Middleware kiểm tra JWT token tùy chọn — dùng cho các route cả khách vãng lai và user
export const optionalProtect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = {
        id: decoded.user_id,
        vai_tro: decoded.vai_tro,
        roleId: decoded.vai_tro
      };
    }
  } catch (error) {
    // Bỏ qua lỗi token, coi như khách vãng lai (không gán req.user)
  }
  next();
};
