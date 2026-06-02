import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import pool from "./config/db.js";
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


dotenv.config();

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


// Test route
app.get("/", (req, res) => {
    res.send("API đang chạy...");
});

// Chạy server
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`Server chạy tại http://localhost:${PORT}`);
});