import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  try {
    const sqlPath = path.join(__dirname, 'create_tvu_parent_fund.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    console.log('Seeding the main parent fund "Quỹ phát triển Đại học Trà Vinh"...');

    const connection = await pool.getConnection();
    try {
      await connection.query(sqlContent);
      console.log('✅ Database seeded successfully with Quỹ phát triển Đại học Trà Vinh!');
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error('❌ Error executing database seeding:', err);
  } finally {
    await pool.end();
  }
}

run();
