import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// Parse DATABASE_URL if provided (Aiven format), otherwise use individual env vars
function parseDatabaseConfig() {
  const databaseUrl = process.env.DATABASE_URL;

  if (databaseUrl) {
    // Parse Aiven MySQL URL: mysql://user:pass@host:port/dbname?ssl-mode=REQUIRED
    const url = new URL(databaseUrl);
    const sslParam = url.searchParams.get("ssl");
    const sslMode = url.searchParams.get("ssl-mode");
    const useSsl = sslParam || sslMode || process.env.DB_SSL === "true";

    return {
      host: url.hostname,
      user: url.username,
      password: url.password,
      database: url.pathname.replace("/", ""),
      port: parseInt(url.port) || 3306,
      ssl: useSsl ? { rejectUnauthorized: false } : undefined,
    };
  }

  return {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "tvu_fund_management",
    port: process.env.DB_PORT || 3306,
    ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : undefined,
  };
}

const dbConfig = parseDatabaseConfig();

// Tạo connection pool thay vì single connection
// Pool giúp tái sử dụng connection, tăng hiệu suất và tự động xử lý reconnect
const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: "+07:00",
  connectTimeout: 30000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
});

// Kiểm tra kết nối khi server khởi động
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log(
      `✅ Kết nối MySQL thành công! Database: ${dbConfig.database}`
    );
    connection.release(); // Trả connection về pool sau khi test xong
  } catch (error) {
    console.error("❌ Kết nối MySQL thất bại:", error.message);
    console.error("Config:", JSON.stringify({ host: dbConfig.host, port: dbConfig.port, database: dbConfig.database, ssl: !!dbConfig.ssl }));
  }
};

testConnection();

pool.on('connection', (connection) => {
  connection.on('error', (err) => {
    if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'ECONNRESET') {
      console.warn('⚠️ DB connection lost, pool will reconnect:', err.message);
    } else {
      console.error('❌ DB connection error:', err.message);
    }
  });
});

export default pool;
