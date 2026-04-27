import pool from "../config/db.js";

// Script kiểm tra cấu trúc bảng GiaoDich
const checkGiaoDichSchema = async () => {
  try {
    console.log("🔍 Đang kiểm tra cấu trúc bảng GiaoDich...\n");

    // Kiểm tra các cột trong bảng
    const [columns] = await pool.query(`DESCRIBE GiaoDich`);
    
    console.log("📋 CÁC CỘT TRONG BẢNG GIAODICH:");
    console.log("================================");
    columns.forEach((col, index) => {
      console.log(`${index + 1}. ${col.Field} (${col.Type}) ${col.Null === 'NO' ? '- BẮT BUỘC' : '- TÙY CHỌN'}`);
    });

    console.log("\n📝 DANH SÁCH TÊN CỘT:");
    const columnNames = columns.map(col => col.Field);
    console.log(columnNames.join(", "));

    console.log("\n✅ Kiểm tra hoàn tất!");
    
  } catch (error) {
    console.error("❌ Lỗi khi kiểm tra schema:", error.message);
  } finally {
    process.exit(0);
  }
};

checkGiaoDichSchema();
