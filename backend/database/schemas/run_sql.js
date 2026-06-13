import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  try {
    const sqlPath = path.join(__dirname, 'create_guest_tables.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    // Split statements by semicolon
    // We want to handle multiline statements correctly, so we split by custom regex or run them as a single command if possible,
    // but connection.query normally does not support multiple queries unless multipleStatements is enabled.
    // So we split by ";" and filter out empty queries.
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    console.log(`Running ${statements.length} SQL statements...`);

    const connection = await pool.getConnection();
    try {
      for (const statement of statements) {
        console.log(`Executing statement starting with: "${statement.substring(0, 50)}..."`);
        await connection.query(statement);
      }
      console.log('✅ All SQL statements executed successfully!');
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error('❌ Error executing SQL:', err);
  } finally {
    await pool.end();
  }
}

run();
