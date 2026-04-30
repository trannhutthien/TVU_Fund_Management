import express from "express";
import {
  createApplication,
  getMyApplications,
  getApplicationById,
  getAllApplications,
  updateApplicationStatus
} from "../controllers/applicationController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/rolesMiddleware.js";

const router = express.Router();

// ─── APPLICATION ROUTES (ĐƠN XIN HỖ TRỢ) 
// POST /api/applications — Sinh viên nộp đơn xin hỗ trợ
// Middleware:
// - protect: Kiểm tra token hợp lệ
// - authorizeRoles(2, 3, 4): Chỉ cho phép Admin (role_id = 2), Giáo vụ (role_id = 3), hoặc Sinh viên (role_id = 4)
// Luồng:
// 1. Validate dữ liệu đầu vào
// 2. Kiểm tra quỹ tồn tại và đang hoạt động
// 3. Kiểm tra số dư quỹ đủ không
// 4. Tạo đơn với trạng thái "Chờ duyệt"
// 5. Trả về thông tin đơn vừa tạo
//
router.post("/", protect, authorizeRoles(2, 3, 4), createApplication);


// GET /api/applications/my — Sinh viên xem đơn của mình
// Middleware:
// - protect: Kiểm tra token hợp lệ
// - authorizeRoles(4): Chỉ cho phép Sinh viên
//
// Query params:
// - page: Trang hiện tại (mặc định: 1)
// - limit: Số bản ghi/trang (mặc định: 20)
//
router.get("/my", protect, authorizeRoles(4), getMyApplications);

// GET /api/applications — Admin/Giáo vụ xem tất cả đơn
// Middleware:
// - protect: Kiểm tra token hợp lệ
// - authorizeRoles(1, 3): Admin hoặc Giáo vụ
// Query params:
// - page, limit: Phân trang
// - trangThai: Lọc theo trạng thái
// - quyId: Lọc theo quỹ
// - userId: Lọc theo sinh viên
router.get("/", protect, authorizeRoles(1, 3), getAllApplications);

// GET /api/applications/:id — Xem chi tiết 1 đơn
// Middleware:
// - protect: Kiểm tra token hợp lệ
// - authorizeRoles(1, 3, 4): Admin, Giáo vụ, hoặc Sinh viên
// Quyền:
// - Sinh viên: Chỉ xem được đơn của mình
// - Admin/Giáo vụ: Xem được tất cả
//
router.get("/:id", protect, authorizeRoles(1, 3, 4), getApplicationById);

// PUT /api/applications/:id/status — Admin/Giáo vụ chuyển trạng thái đơn
// Middleware:
// - protect: Kiểm tra token hợp lệ
// - authorizeRoles(1, 3): Chỉ Admin hoặc Giáo vụ
// Luồng:
// 1. Validate trạng thái mới
// 2. Kiểm tra đơn tồn tại
// 3. Kiểm tra trạng thái hiện tại có hợp lệ để chuyển không
// 4. Cập nhật trạng thái + người duyệt + ngày duyệt
// 5. Nếu duyệt: Tạo giao dịch CHI và trừ tiền quỹ
// 6. Trả về kết quả
//
router.put("/:id/status", protect, authorizeRoles(1, 3), updateApplicationStatus);

export default router;
