import express from "express";
import { getAllTransactions, getTransactionById } from "../controllers/transactionController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/rolesMiddleware.js";

const router = express.Router();

// ═══════════════════════════════════════════════════════════════════════════════
// ─── TRANSACTION ROUTES (LỊCH SỬ DÒNG TIỀN) ───────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/transactions — Lấy danh sách tất cả giao dịch (Admin/Kế toán)
// ─────────────────────────────────────────────────────────────────────────────
// Middleware:
// - protect: Kiểm tra token hợp lệ
// - authorizeRoles(1, 2): Chỉ cho phép role_id = 1 (Admin) hoặc 2 (Kế toán)
//
// Mục đích:
// - Admin/Kế toán xem lại tất cả giao dịch thu/chi để đối soát
// - Trả về thông tin chi tiết: ai duyệt, vào quỹ nào, lúc mấy giờ
// - Hỗ trợ filter theo: loại, quỹ, trạng thái, khoảng thời gian
// - Hỗ trợ phân trang
//
// Query Parameters:
// - page: Trang hiện tại (mặc định: 1)
// - limit: Số bản ghi mỗi trang (mặc định: 20, max: 100)
// - loai: Lọc theo loại ('Thu' hoặc 'Chi')
// - quyId: Lọc theo ID quỹ
// - trangThai: Lọc theo trạng thái ('Cho xu ly', 'Thanh cong', 'That bai', 'Hoan tien')
// - tuNgay: Lọc từ ngày (YYYY-MM-DD)
// - denNgay: Lọc đến ngày (YYYY-MM-DD)
//
// Ví dụ:
// GET /api/transactions?page=1&limit=20
// GET /api/transactions?loai=Thu&quyId=1
// GET /api/transactions?tuNgay=2026-01-01&denNgay=2026-04-27
// GET /api/transactions?trangThai=Thanh cong
//
router.get("/", protect, authorizeRoles(1, 2), getAllTransactions);

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/transactions/:id — Xem chi tiết 1 giao dịch (Admin/Kế toán)
// ─────────────────────────────────────────────────────────────────────────────
// Middleware:
// - protect: Kiểm tra token hợp lệ
// - authorizeRoles(1, 2): Chỉ cho phép role_id = 1 (Admin) hoặc 2 (Kế toán)
//
// Mục đích:
// - Xem chi tiết đầy đủ của 1 giao dịch cụ thể
// - Bao gồm thông tin quỹ, nhà tài trợ, người duyệt, minh chứng
//
// Ví dụ:
// GET /api/transactions/123
//
router.get("/:id", protect, authorizeRoles(1, 2), getTransactionById);

export default router;
