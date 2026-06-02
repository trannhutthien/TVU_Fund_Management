import pool from "../config/db.js";

async function main() {
  try {
    console.log("Starting migration: adding reconciliation columns to table giaodich...");
    
    // Check if the columns already exist to avoid errors
    const [columns] = await pool.execute("SHOW COLUMNS FROM giaodich LIKE 'doisoattrangthai'");
    
    if (columns.length === 0) {
      await pool.execute(`
        ALTER TABLE giaodich 
        ADD COLUMN doisoattrangthai ENUM('Chua_doi_soat', 'Da_doi_soat', 'Bat_thuong') NOT NULL DEFAULT 'Chua_doi_soat' AFTER trangthai,
        ADD COLUMN sotienthucte DECIMAL(15,2) NULL AFTER doisoattrangthai,
        ADD COLUMN doisoatboiid INT NULL AFTER sotienthucte,
        ADD COLUMN doisoatluc DATETIME NULL AFTER doisoatboiid,
        ADD COLUMN doisoatghichu VARCHAR(255) NULL AFTER doisoatluc,
        ADD CONSTRAINT fk_doisoatboiid FOREIGN KEY (doisoatboiid) REFERENCES nguoidung(nguoidung_id) ON DELETE SET NULL ON UPDATE CASCADE
      `);
      console.log("✓ Successfully added reconciliation columns to table giaodich!");
    } else {
      console.log("Reconciliation columns already exist.");
    }
  } catch (error) {
    console.error("Migration Error:", error);
  } finally {
    await pool.end();
  }
}

main();
