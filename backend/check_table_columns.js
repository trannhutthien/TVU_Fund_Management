import pool from "./config/db.js";

const runInspect = async () => {
  try {
    console.log("--- BẢNG quy ---");
    const [quyCols] = await pool.query("DESCRIBE quy");
    console.log(quyCols.map(c => `${c.Field} (${c.Type})`));

    console.log("\n--- BẢNG nhataitro ---");
    const [nttCols] = await pool.query("DESCRIBE nhataitro");
    console.log(nttCols.map(c => `${c.Field} (${c.Type})`));

    console.log("\n--- BẢNG khoantaitro ---");
    const [kttCols] = await pool.query("DESCRIBE khoantaitro");
    console.log(kttCols.map(c => `${c.Field} (${c.Type})`));

    console.log("\n--- BẢNG yeucauhotro ---");
    const [ychtCols] = await pool.query("DESCRIBE yeucauhotro");
    console.log(ychtCols.map(c => `${c.Field} (${c.Type})`));

  } catch (error) {
    console.error("Lỗi khi kiểm tra:", error);
  } finally {
    process.exit(0);
  }
};

runInspect();
