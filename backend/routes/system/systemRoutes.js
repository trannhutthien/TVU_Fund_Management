import express from "express";
import { protect } from "../../middleware/authMiddleware.js";
import { authorizeRoles } from "../../middleware/rolesMiddleware.js";
import {
  getVaiTro,
  updateVaiTro,
  getNguoiDung,
  getNhatKy,
  getNhatKyDetail,
  getNhatKyStats,
  exportNhatKy,
  getSystemSettings,
  getPublicSystemSettings,
  updateSystemSettings,
  getPagePermissions,
  updatePagePermissions
} from "../../controllers/system/systemController.js";

// Vai trò 1 = Admin
const isAdmin = authorizeRoles(1);
// Admin + Ban Kiem Soat (chỉ cho GET routes)
const isAdminOrSupervisor = authorizeRoles(1, 5);

// 1. Router Quản lý vai trò (vaitro)
const vaiTroRouter = express.Router();
vaiTroRouter.get("/", protect, isAdminOrSupervisor, getVaiTro);
vaiTroRouter.patch("/:role_id", protect, isAdmin, updateVaiTro);

// 2. Router Quản lý người dùng (nguoidung)
const nguoiDungRouter = express.Router();
nguoiDungRouter.get("/", protect, isAdminOrSupervisor, getNguoiDung);

// 3. Router Nhật ký hệ thống (nhat-ky)
const nhatKyRouter = express.Router();
nhatKyRouter.get("/stats", protect, isAdminOrSupervisor, getNhatKyStats);
nhatKyRouter.get("/export", protect, isAdmin, exportNhatKy);
nhatKyRouter.get("/:log_id", protect, isAdminOrSupervisor, getNhatKyDetail);
nhatKyRouter.get("/", protect, isAdminOrSupervisor, getNhatKy);

// 4. Router Cài đặt hệ thống (system/settings)
const settingsRouter = express.Router();
settingsRouter.get("/permissions", getPagePermissions); // Expose publicly for guest header visibility checking
settingsRouter.patch("/permissions", protect, isAdmin, updatePagePermissions);
settingsRouter.get("/public", getPublicSystemSettings);
settingsRouter.get("/", protect, isAdminOrSupervisor, getSystemSettings);
settingsRouter.patch("/", protect, isAdmin, updateSystemSettings);

export {
  vaiTroRouter,
  nguoiDungRouter,
  nhatKyRouter,
  settingsRouter
};
