import pool from "../config/db.js";

const checkSchema = async () => {
  try {
    console.log("🔍 Kiểm tra bảng NguoiDung...\n");
    
    const [columns] = await pool.query(`DESCRIBE NguoiDung`);
    
    console.log("📋 CÁC CỘT TRONG BẢNG NGUOIDUNG:");
    console.log("================================");
    columns.forEach((col, index) => {
      console.log(`${index + 1}. ${col.Field} (${col.Type})`);
    });
    
    console.log("\n✅ Hoàn tất!");
  } catch (error) {
    console.error("❌ Lỗi:", error.message);
  } finally {
    process.exit(0);
  }
};

checkSchema();
