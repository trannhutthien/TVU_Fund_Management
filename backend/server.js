import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import pool from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import roleRoutes from "./routes/roleRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import fundRoutes from "./routes/fundRoutes.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/users", userRoutes);
app.use("/api/funds", fundRoutes);

// Test route
app.get("/", (req, res) => {
    res.send("API đang chạy...");
});

// Chạy server
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`Server chạy tại http://localhost:${PORT}`);
});