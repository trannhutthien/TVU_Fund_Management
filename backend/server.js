import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import pool from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import roleRoutes from "./routes/roleRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import fundRoutes from "./routes/fundRoutes.js";
import donorRoutes from "./routes/donorRoutes.js";
import donationRoutes from "./routes/donationRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import statisticsRoutes from "./routes/statisticsRoutes.js";
import bankAccountRoutes from "./routes/bankAccountRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import baoCaoRoutes from "./routes/baoCaoRoutes.js";

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

// Test route
app.get("/", (req, res) => {
    res.send("API đang chạy...");
});

// Chạy server
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`Server chạy tại http://localhost:${PORT}`);
});