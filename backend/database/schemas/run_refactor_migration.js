import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  const connection = await pool.getConnection();
  
  try {
    console.log('📦 Starting Bank Account Refactor Migration...\n');

    // Đọc file SQL
    const sqlFile = path.join(__dirname, 'refactor_bank_accounts.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    // Tách các statements (bỏ qua comments và empty lines)
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`Found ${statements.length} SQL statements to execute.\n`);

    // Thực thi từng statement
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      if (stmt.trim().length === 0) continue;

      try {
        console.log(`[${i + 1}/${statements.length}] Executing...`);
        
        // Bỏ qua các statement PREPARE/EXECUTE/DEALLOCATE vì cần chạy riêng
        if (stmt.includes('PREPARE') || stmt.includes('EXECUTE') || stmt.includes('DEALLOCATE')) {
          console.log('  ⚠️  Skipping dynamic SQL statement (run manually if needed)');
          continue;
        }

        const [result] = await connection.query(stmt);
        
        if (result && result.length > 0) {
          console.log('  ✅ Result:', result);
        } else {
          console.log('  ✅ Success');
        }
      } catch (error) {
        // Bỏ qua lỗi "duplicate column" (đã chạy migration rồi)
        if (error.code === 'ER_DUP_FIELDNAME') {
          console.log('  ⚠️  Column already exists, skipping...');
        } 
        // Bỏ qua lỗi "duplicate key name" (index đã tồn tại)
        else if (error.code === 'ER_DUP_KEYNAME') {
          console.log('  ⚠️  Index already exists, skipping...');
        }
        // Bỏ qua lỗi "duplicate entry" (record đã tồn tại)
        else if (error.code === 'ER_DUP_ENTRY') {
          console.log('  ⚠️  Record already exists, skipping...');
        }
        else {
          console.error('  ❌ Error:', error.message);
          throw error;
        }
      }
      console.log('');
    }

    // Kiểm tra kết quả cuối cùng
    console.log('📊 Verification - Final Results:\n');
    
    const [summary] = await connection.query(`
      SELECT 
        COUNT(*) AS total_accounts,
        SUM(CASE WHEN loaitaikhoan = 'Nha truong' THEN 1 ELSE 0 END) AS school_accounts,
        SUM(CASE WHEN loaitaikhoan = 'Sinh vien' THEN 1 ELSE 0 END) AS student_accounts
      FROM taikhoannganhang
    `);
    
    console.log('Summary:', summary[0]);
    console.log('');

    const [schoolAccounts] = await connection.query(`
      SELECT 
        taikhoannganhang_id,
        sotaikhoan,
        nganhang,
        chutaikhoan,
        loaitaikhoan,
        trangthai
      FROM taikhoannganhang
      WHERE loaitaikhoan = 'Nha truong'
    `);

    console.log('School Bank Accounts:');
    console.table(schoolAccounts);

    console.log('\n✅ Migration completed successfully!');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    throw error;
  } finally {
    connection.release();
    await pool.end();
  }
}

// Chạy migration
runMigration().catch(console.error);
