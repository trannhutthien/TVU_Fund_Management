import mysql from 'mysql2/promise';

async function runMigration() {
  const conn = await mysql.createConnection({
    host: 'mysql-735ef23-trannhutthien012345-f859.b.aivencloud.com',
    port: 23536,
    user: 'avnadmin',
    password: 'AVNS_aSpzodktBU9qxNVmx7o',
    database: 'defaultdb',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await conn.query("ALTER TABLE hopdongvayvon ADD COLUMN laisuatphatphantram DECIMAL(5,2) DEFAULT NULL AFTER laisuatphantram");
    console.log('OK: hopdongvayvon.laisuatphatphantram added');
  } catch(e) {
    console.log('hopdongvayvon:', e.message);
  }

  try {
    await conn.query("ALTER TABLE lichtrano ADD COLUMN sotienlaiphat DECIMAL(15,2) NOT NULL DEFAULT 0.00 AFTER sotienlaiphaitra");
    console.log('OK: lichtrano.sotienlaiphat added');
  } catch(e) {
    console.log('lichtrano:', e.message);
  }

  await conn.end();
  console.log('Migration done!');
}

runMigration().catch(console.error);
