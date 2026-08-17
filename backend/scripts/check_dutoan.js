import pool from '../config/db.js';

async function check() {
  const [rows] = await pool.query('DESCRIBE dutoanhangnam');
  console.log('Table structure:');
  console.table(rows);
  process.exit(0);
}

check();
