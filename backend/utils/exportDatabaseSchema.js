import pool from "../config/db.js";
import fs from "fs";

const exportDatabaseSchema = async () => {
  try {
    console.log("🔍 Đang đọc cấu trúc database...\n");

    // Lấy danh sách tất cả các bảng
    const [tables] = await pool.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE()
      ORDER BY TABLE_NAME
    `);

    let markdown = "# 📊 CẤU TRÚC DATABASE - TVU FUND MANAGEMENT\n\n";
    markdown += `**Ngày xuất:** ${new Date().toLocaleString('vi-VN')}\n\n`;
    markdown += `**Tổng số bảng:** ${tables.length}\n\n`;
    markdown += "---\n\n";

    // Duyệt qua từng bảng
    for (const table of tables) {
      const tableName = table.TABLE_NAME;
      console.log(`📋 Đang đọc bảng: ${tableName}`);

      // Lấy thông tin các cột
      const [columns] = await pool.query(`
        SELECT 
          COLUMN_NAME,
          COLUMN_TYPE,
          IS_NULLABLE,
          COLUMN_KEY,
          COLUMN_DEFAULT,
          EXTRA,
          COLUMN_COMMENT
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
        ORDER BY ORDINAL_POSITION
      `, [tableName]);

      // Lấy thông tin foreign keys
      const [foreignKeys] = await pool.query(`
        SELECT 
          COLUMN_NAME,
          REFERENCED_TABLE_NAME,
          REFERENCED_COLUMN_NAME
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
        AND REFERENCED_TABLE_NAME IS NOT NULL
      `, [tableName]);

      // Tạo map foreign keys
      const fkMap = {};
      foreignKeys.forEach(fk => {
        fkMap[fk.COLUMN_NAME] = {
          table: fk.REFERENCED_TABLE_NAME,
          column: fk.REFERENCED_COLUMN_NAME
        };
      });

      // Viết thông tin bảng
      markdown += `## ${tableName}\n\n`;
      
      // Bảng thông tin cột
      markdown += "| Cột | Kiểu | Null | Key | Default | Extra | Foreign Key |\n";
      markdown += "|-----|------|------|-----|---------|-------|-------------|\n";

      columns.forEach(col => {
        const columnName = col.COLUMN_NAME;
        const columnType = col.COLUMN_TYPE;
        const isNullable = col.IS_NULLABLE === 'YES' ? '✅' : '❌';
        const columnKey = col.COLUMN_KEY || '-';
        const columnDefault = col.COLUMN_DEFAULT !== null ? `\`${col.COLUMN_DEFAULT}\`` : '-';
        const extra = col.EXTRA || '-';
        const fk = fkMap[columnName] 
          ? `→ ${fkMap[columnName].table}(${fkMap[columnName].column})`
          : '-';

        markdown += `| \`${columnName}\` | ${columnType} | ${isNullable} | ${columnKey} | ${columnDefault} | ${extra} | ${fk} |\n`;
      });

      markdown += "\n";

      // Thêm CREATE TABLE statement
      const [createTable] = await pool.query(`SHOW CREATE TABLE ${tableName}`);
      markdown += "### SQL Create Statement\n\n";
      markdown += "```sql\n";
      markdown += createTable[0]['Create Table'];
      markdown += "\n```\n\n";
      markdown += "---\n\n";
    }

    // Lưu file
    const outputPath = "docs/database/DATABASE_SCHEMA_FULL.md";
    fs.writeFileSync(outputPath, markdown);

    console.log(`\n✅ Đã xuất schema thành công!`);
    console.log(`📄 File: ${outputPath}`);
    console.log(`📊 Tổng số bảng: ${tables.length}`);

  } catch (error) {
    console.error("❌ Lỗi:", error.message);
  } finally {
    process.exit(0);
  }
};

exportDatabaseSchema();
