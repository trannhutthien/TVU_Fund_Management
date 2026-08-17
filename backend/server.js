import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth/authRoutes.js";
import roleRoutes from "./routes/users/roleRoutes.js";
import userRoutes from "./routes/users/userRoutes.js";
import fundRoutes from "./routes/funds/fundRoutes.js";
import phanBoNganSachRoutes from "./routes/funds/phanBoNganSachRoutes.js";
import donorRoutes from "./routes/donations/donorRoutes.js";
import donationRoutes from "./routes/donations/donationRoutes.js";
import transactionRoutes from "./routes/transactions/transactionRoutes.js";
import duToanRoutes from "./routes/reports/duToanRoutes.js";
import applicationRoutes from "./routes/applications/applicationRoutes.js";
import statisticsRoutes from "./routes/reports/statisticsRoutes.js";
import bankAccountRoutes from "./routes/funds/bankAccountRoutes.js";
import uploadRoutes from "./routes/uploads/uploadRoutes.js";
import baoCaoRoutes from "./routes/reports/baoCaoRoutes.js";
import pheDuyetRoutes from "./routes/applications/pheDuyetRoutes.js";
// import studentShowcaseRoutes from "./routes/showcase/studentShowcaseRoutes.js"; // REMOVED: Feature không còn sử dụng
import danhGiaRoutes from "./routes/testimonials/danhGiaRoutes.js";
import loaiQuyRoutes from "./routes/funds/loaiQuyRoutes.js";
import { vaiTroRouter, nguoiDungRouter, nhatKyRouter, settingsRouter } from "./routes/system/systemRoutes.js";
import guestRoutes from "./routes/guest/guestRoutes.js";
import newsRoutes from "./routes/news/newsRoutes.js";
import disbursementRoundRoutes from "./routes/funds/disbursementRoundRoutes.js";
import nghiemThuRoutes from "./routes/applications/nghiemThuRoutes.js";
import chucVuRoutes from "./routes/system/chucVuRoutes.js";
import congNoRoutes from "./routes/finance/congNoRoutes.js";
import lichTraNoRoutes from "./routes/finance/lichTraNoRoutes.js";
import thongBaoRoutes from "./routes/common/thongBaoRoutes.js";
import thuHoiRoutes from "./routes/finance/thuHoiRoutes.js";
import ThongBaoModel from "./models/common/ThongBaoModel.js";
import { sendPaymentDueReminderEmail } from "./services/emailService.js";
import pool from "./config/db.js";
import { auditLogMiddleware } from "./middleware/auditLogMiddleware.js";
import laiPhatService from "./services/laiPhatService.js";

dotenv.config();

process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION:', err.message);
    console.error(err.stack);
});
process.on('unhandledRejection', (reason) => {
    console.error('UNHANDLED REJECTION:', reason);
});

const app = express();

// Get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());
app.use(auditLogMiddleware);

// Serve static files từ thư mục uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/users", userRoutes);
app.use("/api/funds/allocate", phanBoNganSachRoutes);
app.use("/api/funds", fundRoutes);
app.use("/api/quy", fundRoutes);
app.use("/api/donors", donorRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/du-toan", duToanRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/statistics", statisticsRoutes);
app.use("/api/bank-accounts", bankAccountRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/bao-cao", baoCaoRoutes);
app.use("/api/pheduyet", pheDuyetRoutes);
app.use("/api/nghiem-thu", nghiemThuRoutes);
// app.use("/api/student-showcase", studentShowcaseRoutes); // REMOVED: Feature không còn sử dụng
app.use("/api/danhgia", danhGiaRoutes);
app.use("/api/disbursement-rounds", disbursementRoundRoutes);
app.use("/api/loai-quy", loaiQuyRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/chuc-vu", chucVuRoutes);
app.use("/api/vaitro", vaiTroRouter);
app.use("/api/nguoidung", nguoiDungRouter);
app.use("/api/nhat-ky", nhatKyRouter);
app.use("/api/system/settings", settingsRouter);
app.use("/api/guest", guestRoutes);
app.use("/api/cong-no", congNoRoutes);
app.use("/api/lich-tra-no", lichTraNoRoutes);
app.use("/api/thong-bao", thongBaoRoutes);
app.use("/api/thu-hoi", thuHoiRoutes);

app.get("/", (req, res) => {
    res.send("API đang chạy...");
});

// Chạy server
const PORT = process.env.PORT || 5001;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server chạy tại http://0.0.0.0:${PORT}`);

    // ═══ Cron job: Kiem tra qua han moi ngay luc 00:05 ═══
    const chayKiemTraQuaHan = async () => {
        try {
            const result = await laiPhatService.capNhatTrangThaiQuaHan();
            if (result.soKyQuaHanMoi > 0) {
                console.log(`[CRON] Cap nhat qua han: ${result.soKyQuaHanMoi} ky, ${result.soHopDongQuaHan} hop dong`);
            }
        } catch (err) {
            console.error('[CRON] Loi cap nhat qua han:', err.message);
        }
    };

    // Chay luc 00:05 moi ngay
    const tinhThoiGianDenLanChayTiep = () => {
        const now = new Date();
        const target = new Date(now);
        target.setHours(0, 5, 0, 0);
        if (target <= now) target.setDate(target.getDate() + 1);
        return target - now;
    };

    const chayDinhKy = () => {
        chayKiemTraQuaHan();
        setTimeout(chayDinhKy, 24 * 60 * 60 * 1000); // 24h sau chay lai
    };

    setTimeout(chayDinhKy, tinhThoiGianDenLanChayTiep());
    console.log(`[CRON] Kiem tra qua han se chay luc 00:05 moi ngay`);

    // ═══ Cron job: Nhac no truoc 7 ngay - 08:00 moi ngay ═══
    const guiNhacTruoc7Ngay = async () => {
        let connection;
        try {
            connection = await pool.getConnection();
            const [rows] = await connection.query(`
                SELECT lt.*, nd.hoten, nd.email, nd.nguoidung_id, hd.yeucauhotro_id
                FROM lichtrano lt
                INNER JOIN hopdongvayvon hd ON lt.hopdongvayvon_id = hd.hopdongvayvon_id
                INNER JOIN yeucauhotro yc ON hd.yeucauhotro_id = yc.yeucauhotro_id
                INNER JOIN nguoidung nd ON yc.nguoidung_id = nd.nguoidung_id
                WHERE lt.trangthai IN ('Chua den han', 'Tra mot phan')
                  AND lt.ngaydenhan BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
                  AND lt.trangthaixacnhan != 'Da xac nhan'
            `);

            for (const row of rows) {
                const soNgayConLai = Math.ceil((new Date(row.ngaydenhan) - Date.now()) / 86400000);
                const soPhaiTra = Number(row.sotiengocphaitra) + Number(row.sotienlaiphaitra);

                // Gui email (fire-and-forget)
                if (row.email) {
                    sendPaymentDueReminderEmail(row.email, row.hoten, row.kythu, row.ngaydenhan, soPhaiTra, soNgayConLai).catch(() => {});
                }

                // Tao thong bao trong he thong
                await ThongBaoModel.create({
                    nguoidungId: row.nguoidung_id,
                    loai: 'nhacno',
                    tieude: `Sap den han tra no ky ${row.kythu}`,
                    noidung: `Con ${soNgayConLai} ngay nua den han tra no ky ${row.kythu}. So tien: ${soPhaiTra.toLocaleString('vi-VN')} VND`,
                    duongdan: `/cong-no/chi-tiet/${row.yeucauhotro_id}`
                });
            }

            if (rows.length > 0) {
                console.log(`[CRON] Da gui nhac no truoc 7 ngay cho ${rows.length} ky tra no`);
            }
        } catch (err) {
            console.error('[CRON] Loi gui nhac no truoc 7 ngay:', err.message);
        } finally {
            if (connection) connection.release();
        }
    };

    const tinhThoiGianDenNhacNo = () => {
        const now = new Date();
        const target = new Date(now);
        target.setHours(8, 0, 0, 0);
        if (target <= now) target.setDate(target.getDate() + 1);
        return target - now;
    };

    const chayNhacNo = () => {
        guiNhacTruoc7Ngay();
        setTimeout(chayNhacNo, 24 * 60 * 60 * 1000);
    };

    setTimeout(chayNhacNo, tinhThoiGianDenNhacNo());
    console.log(`[CRON] Nhac no truoc 7 ngay se chay luc 08:00 moi ngay`);
});
