import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

const dbUrl = process.env.DATABASE_URL;

async function checkDb() {
  console.log('Connecting to database...');
  const connection = await mysql.createConnection({
    uri: dbUrl,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    const [tables] = await connection.query('SHOW TABLES');
    console.log('Tables in database:', tables.map(t => Object.values(t)[0]));

    for (const tableName of ['guest_yeucauhotro', 'guest_khoantaitro']) {
      try {
        const [desc] = await connection.query(`DESCRIBE ${tableName}`);
        console.log(`\nSchema for ${tableName}:`);
        console.table(desc);
      } catch (err) {
        console.error(`Error describing table ${tableName}:`, err.message);
      }
    }
  } catch (error) {
    console.error('Database connection or query error:', error);
  } finally {
    await connection.end();
  }
}

checkDb();
