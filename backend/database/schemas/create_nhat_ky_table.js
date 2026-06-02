import pool from "../../config/db.js";

async function run() {
  try {
    console.log("Checking and creating table nhat_ky_he_thong...");
    
    // Create the table
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS nhat_ky_he_thong (
        log_id        INT AUTO_INCREMENT PRIMARY KEY,
        nguoi_dung_id INT NULL,
        hanh_dong     VARCHAR(100),
        loai_doi_tuong VARCHAR(50),
        doi_tuong_id  INT NULL,
        mo_ta         TEXT NULL,
        du_lieu_cu    JSON NULL,
        du_lieu_moi   JSON NULL,
        ip_address    VARCHAR(45) NULL,
        created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (nguoi_dung_id) REFERENCES nguoidung(user_id) ON DELETE SET NULL ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await pool.query(createTableQuery);
    console.log("✅ Table nhat_ky_he_thong check/creation complete!");

    // Let's insert a couple of dummy entries for logs so that the Admin can see something when loading the page
    const [rows] = await pool.query("SELECT COUNT(*) AS count FROM nhat_ky_he_thong");
    if (rows[0].count === 0) {
      console.log("Inserting dummy logs...");
      // Let's find an admin user to associate with the logs
      const [admins] = await pool.query("SELECT user_id FROM nguoidung WHERE role_id = 1 LIMIT 1");
      const adminId = admins.length > 0 ? admins[0].user_id : null;
      
      const insertQuery = `
        INSERT INTO nhat_ky_he_thong (nguoi_dung_id, hanh_dong, loai_doi_tuong, doi_tuong_id, mo_ta, du_lieu_cu, du_lieu_moi, ip_address)
        VALUES 
        (?, 'DANG_NHAP', 'nguoidung', ?, 'Quản trị viên đăng nhập vào hệ thống', NULL, NULL, '127.0.0.1'),
        (?, 'TAO_NGUOI_DUNG', 'nguoidung', NULL, 'Tạo mới người dùng Nguyễn Văn A', NULL, NULL, '127.0.0.1'),
        (?, 'CAP_NHAT_QUY', 'quy', 1, 'Cập nhật số dư Quỹ phát triển khoa học công nghệ', NULL, NULL, '127.0.0.1')
      `;
      await pool.query(insertQuery, [adminId, adminId, adminId, adminId, adminId]);
      console.log("✅ Dummy logs inserted!");
    }
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error setting up database table:", error);
    process.exit(1);
  }
}

run();
