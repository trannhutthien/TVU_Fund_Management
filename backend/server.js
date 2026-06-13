import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth/authRoutes.js";
import roleRoutes from "./routes/users/roleRoutes.js";
import userRoutes from "./routes/users/userRoutes.js";
import fundRoutes from "./routes/funds/fundRoutes.js";
import donorRoutes from "./routes/donations/donorRoutes.js";
import donationRoutes from "./routes/donations/donationRoutes.js";
import transactionRoutes from "./routes/transactions/transactionRoutes.js";
import applicationRoutes from "./routes/applications/applicationRoutes.js";
import statisticsRoutes from "./routes/reports/statisticsRoutes.js";
import bankAccountRoutes from "./routes/funds/bankAccountRoutes.js";
import uploadRoutes from "./routes/uploads/uploadRoutes.js";
import baoCaoRoutes from "./routes/reports/baoCaoRoutes.js";
import pheDuyetRoutes from "./routes/applications/pheDuyetRoutes.js";
import studentShowcaseRoutes from "./routes/showcase/studentShowcaseRoutes.js";
import loaiQuyRoutes from "./routes/funds/loaiQuyRoutes.js";
import { vaiTroRouter, nguoiDungRouter, nhatKyRouter, settingsRouter } from "./routes/system/systemRoutes.js";
import guestRoutes from "./routes/guest/guestRoutes.js";

dotenv.config();

console.log("🚀 Server starting...");
console.log("PORT:", process.env.PORT);
console.log("DATABASE_URL:", process.env.DATABASE_URL ? "SET (length=" + process.env.DATABASE_URL.length + ")" : "NOT SET");

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

// Serve static files từ thư mục uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/users", userRoutes);
app.use("/api/funds", fundRoutes);
app.use("/api/donors", donorRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/statistics", statisticsRoutes);
app.use("/api/bank-accounts", bankAccountRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/bao-cao", baoCaoRoutes);
app.use("/api/pheduyet", pheDuyetRoutes);
app.use("/api/student-showcase", studentShowcaseRoutes);
app.use("/api/loai-quy", loaiQuyRoutes);
app.use("/api/vaitro", vaiTroRouter);
app.use("/api/nguoidung", nguoiDungRouter);
app.use("/api/nhat-ky", nhatKyRouter);
app.use("/api/system/settings", settingsRouter);
app.use("/api/guest", guestRoutes);

// Test route
app.get("/", (req, res) => {
    res.send("API đang chạy...");
});

// Debug route - check DB connection
app.get("/debug", async (req, res) => {
    try {
        const pool = (await import("./config/db.js")).default;
        const conn = await pool.getConnection();
        const [rows] = await conn.query("SELECT COUNT(*) as cnt FROM nguoidung");
        conn.release();
        res.json({ status: "ok", users: rows[0].cnt, port: process.env.PORT });
    } catch (e) {
        res.status(500).json({ status: "error", message: e.message, code: e.code });
    }
});

// Chạy server
const PORT = process.env.PORT || 5001;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server chạy tại http://0.0.0.0:${PORT}`);
});
