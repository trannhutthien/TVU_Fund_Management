import express from "express";
import {
  createApplication,
  getMyApplications,
  getApplicationById,
  getAllApplications,
  rejectApplication,
  staffApprove,
  adminApprove,
  disburseApplication
} from "../../controllers/applications/applicationController.js";
import { getAiSuggestion } from "../../controllers/applications/aiController.js";
import { protect } from "../../middleware/authMiddleware.js";
import { authorizeRoles } from "../../middleware/rolesMiddleware.js";
import { rateLimiter } from "../../middleware/rateLimiter.js";

const router = express.Router();

// ─── AI ASSISTANT ROUTES
// POST /api/applications/ai-suggest — Trợ lý AI gợi ý/tối ưu viết đơn (cần đăng nhập)
router.post("/ai-suggest", protect, getAiSuggestion);

// POST /api/applications/public/ai-suggest — AI gợi ý cho khách vãng lai (KHÔNG CẦN TOKEN)
// Rate limit: 20 requests/hour/IP
router.post("/public/ai-suggest", rateLimiter({ windowMs: 60 * 60 * 1000, max: 20, message: "Bạn đã gọi AI quá nhiều lần" }), getAiSuggestion);

// ─── APPLICATION ROUTES (ĐƠN XIN HỖ TRỢ) 
// POST /api/applications — Sinh viên nộp đơn xin hỗ trợ
// Middleware:
// - protect: Kiểm tra token hợp lệ
// - authorizeRoles(3, 4): Chỉ cho phép Cán bộ Quỹ (role_id = 3) hoặc Sinh viên (role_id = 4)
// Luồng:
// 1. Validate dữ liệu đầu vào
// 2. Kiểm tra quỹ tồn tại và đang hoạt động
// 3. Kiểm tra số dư quỹ đủ không
// 4. Tạo đơn với trạng thái "Chờ duyệt"
// 5. Trả về thông tin đơn vừa tạo
//
router.post("/", protect, authorizeRoles(3, 4), createApplication);


// GET /api/applications/my-applications — Người dùng xem đơn của mình
// Middleware:
// - protect: Kiểm tra token hợp lệ
// - authorizeRoles(4): Chỉ cho phép người dùng (role_id = 4)
//
// Query params:
// - page: Trang hiện tại (mặc định: 1)
// - limit: Số bản ghi/trang (mặc định: 20)
//
router.get("/my-applications", protect, authorizeRoles(4), getMyApplications);

// GET /api/applications — Admin/Giáo vụ xem tất cả đơn
// Middleware:
// - protect: Kiểm tra token hợp lệ
// - authorizeRoles(1, 3): Admin hoặc Giáo vụ
// Query params:
// - page, limit: Phân trang
// - trangThai: Lọc theo trạng thái
// - quyId: Lọc theo quỹ
// - userId: Lọc theo sinh viên
router.get("/", protect, authorizeRoles(1, 2, 3, 5), getAllApplications);

// GET /api/applications/:id — Xem chi tiết 1 đơn
// Middleware:
// - protect: Kiểm tra token hợp lệ
// - authorizeRoles(1, 3, 4): Admin, Giáo vụ, hoặc Sinh viên
// Quyền:
// - Sinh viên: Chỉ xem được đơn của mình
// - Admin/Giáo vụ: Xem được tất cả
//
router.get("/:id", protect, authorizeRoles(1, 2, 3, 4, 5), getApplicationById);

// PUT /api/applications/:id/reject — Từ chối đơn (bất kỳ cấp nào)
// Middleware:
// - protect: Kiểm tra token hợp lệ
// - authorizeRoles(1, 3): Chỉ Admin hoặc Giáo vụ
// Luồng:
// 1. Validate dữ liệu đầu vào (bắt buộc có lý do từ chối)
// 2. Kiểm tra đơn tồn tại và trạng thái hợp lệ
// 3. Lấy cấp độ duyệt hiện tại (cấp đang chờ duyệt)
// 4. Cập nhật PheDuyet: cấp hiện tại → ket_qua = 'Tu choi'
// 5. Cập nhật YeuCauHoTro: trang_thai = 'Tu choi', ly_do_tu_choi
// 6. Trả về kết quả
//
router.put("/:id/reject", protect, authorizeRoles(1, 2, 3), rejectApplication);

// PUT /api/applications/:id/staff-approve — Giáo vụ duyệt cấp 1
// Middleware:
// - protect: Kiểm tra token hợp lệ
// - authorizeRoles(3): Chỉ Giáo vụ (role_id = 3)
// Luồng:
// 1. Kiểm tra đơn tồn tại và trạng thái = 'Cho duyet'
// 2. Kiểm tra cấp độ duyệt hiện tại phải là cấp 1
// 3. Cập nhật PheDuyet cấp 1: ket_qua = 'Da duyet', nguoi_duyet_id, ngay_duyet
// 4. Cập nhật YeuCauHoTro: trang_thai = 'Dang xu ly'
// 5. Trả về kết quả
//
router.put("/:id/staff-approve", protect, authorizeRoles(3), staffApprove);

// PUT /api/applications/:id/admin-approve — Admin duyệt cấp 2
// Middleware:
// - protect: Kiểm tra token hợp lệ
// - authorizeRoles(1): Chỉ Admin (role_id = 1)
// Luồng:
// 1. Kiểm tra đơn tồn tại và trạng thái = 'Dang xu ly'
// 2. Kiểm tra cấp 1 đã duyệt (PheDuyet cấp 1 phải là 'Da duyet')
// 3. Kiểm tra cấp độ duyệt hiện tại phải là cấp 2
// 4. Cập nhật PheDuyet cấp 2: ket_qua = 'Da duyet', nguoi_duyet_id, ngay_duyet
// 5. YeuCauHoTro vẫn giữ: trang_thai = 'Dang xu ly'
// 6. Trả về kết quả
//
router.put("/:id/admin-approve", protect, authorizeRoles(1), adminApprove);

// POST /api/applications/:id/disburse — Kế toán duyệt cấp 3 và giải ngân
// Middleware:
// - protect: Kiểm tra token hợp lệ
// - authorizeRoles(2): Chỉ Kế toán (role_id = 2)
// Luồng:
// 1. Kiểm tra đơn tồn tại và trạng thái = 'Dang xu ly'
// 2. Kiểm tra cấp 1 và cấp 2 đã duyệt
// 3. Kiểm tra cấp độ duyệt hiện tại phải là cấp 3
// 4. Lấy số dư quỹ và số tiền yêu cầu
// 5. Kiểm tra số dư quỹ:
//    A. Đủ tiền:
//       - Trừ tiền quỹ
//       - Tạo giao dịch CHI
//       - Cập nhật PheDuyet cấp 3: ket_qua = 'Da duyet'
//       - Cập nhật YeuCauHoTro: trang_thai = 'Da giai ngan'
//    B. Thiếu tiền:
//       - Cập nhật PheDuyet cấp 3: ket_qua = 'Da duyet'
//       - Cập nhật YeuCauHoTro: trang_thai = 'Cho giai ngan'
// 6. Commit transaction
// 7. Trả về kết quả
//
router.post("/:id/disburse", protect, authorizeRoles(2), disburseApplication);

export default router;
