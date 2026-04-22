import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// Tạo connection pool thay vì single connection
// Pool giúp tái sử dụng connection, tăng hiệu suất và tự động xử lý reconnect
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "tvu_fund_management",
  port: process.env.DB_PORT || 3307,
  waitForConnections: true,
  connectionLimit: 10,   // Số connection tối đa trong pool
  queueLimit: 0,         // 0 = không giới hạn hàng chờ
  timezone: "+07:00",    // Múi giờ Việt Nam
});

// Kiểm tra kết nối khi server khởi động
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log(
      `✅ Kết nối MySQL thành công! Database: ${process.env.DB_NAME}`
    );
    connection.release(); // Trả connection về pool sau khi test xong
  } catch (error) {
    console.error("❌ Kết nối MySQL thất bại:", error);
    process.exit(1); // Dừng server nếu không kết nối được DB
  }
};

testConnection();

export default pool;
