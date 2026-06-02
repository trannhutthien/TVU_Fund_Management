import pool from "../../config/db.js";

async function main() {
  try {
    const [cols] = await pool.execute('DESCRIBE sinhviennoibat');
    console.log('=== TABLE sinhviennoibat ===');
    console.table(cols);

    const [createTable] = await pool.execute('SHOW CREATE TABLE sinhviennoibat');
    console.log('=== CREATE TABLE STATEMENTS ===');
    console.log(createTable[0]['Create Table']);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

main();
