import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  try {
    const sqlPath = path.join(__dirname, 'clean_db_for_test.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    console.log(`Running ${statements.length} SQL statements to clean database for testing...`);

    const connection = await pool.getConnection();
    try {
      for (const statement of statements) {
        console.log(`Executing statement: "${statement.substring(0, 80).replace(/\n/g, ' ')}..."`);
        await connection.query(statement);
      }
      console.log('✅ Database cleaned successfully! Ready for test.');
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error('❌ Error executing database cleanup:', err);
  } finally {
    await pool.end();
  }
}

run();
