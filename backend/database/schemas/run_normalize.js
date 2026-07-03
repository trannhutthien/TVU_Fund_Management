import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  try {
    const sqlPath = path.join(__dirname, 'normalize_student_showcase.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    // Tách các câu lệnh SQL qua dấu ";"
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    console.log(`Running ${statements.length} SQL statements to normalize student showcase database...`);

    const connection = await pool.getConnection();
    try {
      for (const statement of statements) {
        console.log(`Executing statement starting with: "${statement.substring(0, 70)}..."`);
        await connection.query(statement);
      }
      console.log('✅ All normalization SQL statements executed successfully!');
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error('❌ Error executing normalization SQL:', err);
  } finally {
    await pool.end();
  }
}

run();
