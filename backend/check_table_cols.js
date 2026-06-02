import pool from "./config/db.js";

async function main() {
  try {
    const [tables] = await pool.execute('SHOW TABLES');
    console.log('=== TABLES ===');
    console.log(tables);

    for (const row of tables) {
      const tableName = Object.values(row)[0];
      const [cols] = await pool.execute(`DESCRIBE ${tableName}`);
      console.log(`=== Columns of ${tableName} ===`);
      console.log(cols.map(c => c.Field));
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

main();
