import mysql from 'mysql2/promise';

async function updateExistingContracts() {
  const conn = await mysql.createConnection({
    host: 'mysql-735ef23-trannhutthien012345-f859.b.aivencloud.com',
    port: 23536,
    user: 'avnadmin',
    password: 'AVNS_aSpzodktBU9qxNVmx7o',
    database: 'defaultdb',
    ssl: { rejectUnauthorized: false }
  });

  // Lai suat phat = laisuatnganhangthamchieu * tyleLaiPhatToiDa = 2.6 * 2 = 5.2%
  const laiSuatPhat = 5.2;

  const [result] = await conn.query(
    "UPDATE hopdongvayvon SET laisuatphatphantram = ? WHERE laisuatphatphantram IS NULL AND trangthai = 'Dang thuc hien'",
    [laiSuatPhat]
  );

  console.log(`Updated ${result.affectedRows} contracts with penalty rate ${laiSuatPhat}%`);
  await conn.end();
}

updateExistingContracts().catch(console.error);
