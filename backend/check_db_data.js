import pool from "./config/db.js";

const runInspectData = async () => {
  try {
    console.log("--- DỮ LIỆU BẢNG quy ---");
    const [quyData] = await pool.query("SELECT quy_id, ten_quy, so_du, trang_thai FROM quy");
    console.log(quyData);

    console.log("\n--- DỮ LIỆU BẢNG nhataitro ---");
    const [nttData] = await pool.query("SELECT nha_tai_tro_id, ten_nha_tai_tro, tong_so_tien_da_tai_tro FROM nhataitro LIMIT 5");
    console.log(nttData);

    console.log("\n--- THỐNG KÊ SỐ LƯỢNG DÒNG ---");
    const [[{ count: cQuy }]] = await pool.query("SELECT COUNT(*) AS count FROM quy");
    const [[{ count: cNtt }]] = await pool.query("SELECT COUNT(*) AS count FROM nhataitro");
    const [[{ count: cKtt }]] = await pool.query("SELECT COUNT(*) AS count FROM khoantaitro");
    const [[{ count: cYc }]] = await pool.query("SELECT COUNT(*) AS count FROM yeucauhotro");
    const [[{ count: cGd }]] = await pool.query("SELECT COUNT(*) AS count FROM giaodich");

    console.log({
      quy: cQuy,
      nhataitro: cNtt,
      khoantaitro: cKtt,
      yeucauhotro: cYc,
      giaodich: cGd
    });

  } catch (error) {
    console.error("Lỗi khi kiểm tra dữ liệu:", error);
  } finally {
    process.exit(0);
  }
};

runInspectData();
