import pool from "./config/db.js";

const runInspectGiaoDich = async () => {
  try {
    console.log("--- BẢNG giaodich ---");
    const [gdCols] = await pool.query("DESCRIBE giaodich");
    console.log(gdCols.map(c => `${c.Field} (${c.Type})`));

    console.log("\n--- LẤY 3 DÒNG DỮ LIỆU MẪU ---");
    const [gdData] = await pool.query("SELECT * FROM giaodich LIMIT 3");
    console.log(gdData);

  } catch (error) {
    console.error("Lỗi khi kiểm tra:", error);
  } finally {
    process.exit(0);
  }
};

runInspectGiaoDich();
