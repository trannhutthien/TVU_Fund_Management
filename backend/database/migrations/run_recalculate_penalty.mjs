import mysql from 'mysql2/promise';

async function recalculatePenalties() {
  const conn = await mysql.createConnection({
    host: 'mysql-735ef23-trannhutthien012345-f859.b.aivencloud.com',
    port: 23536,
    user: 'avnadmin',
    password: 'AVNS_aSpzodktBU9qxNVmx7o',
    database: 'defaultdb',
    ssl: { rejectUnauthorized: false }
  });

  // He so phat = 2, Lai suat NH tham chieu = 2.6% => Lai suat phat = 5.2%/nam
  const heSoPhat = 2;
  const laiSuatThamChieu = 2.6;
  const laiSuatPhatNam = heSoPhat * laiSuatThamChieu; // 5.2%

  // Lay tat ca ky 'Qua han' chua hoan toan tra
  const [rows] = await conn.query(`
    SELECT lt.lichtrano_id, lt.ngaydenhan, lt.sotiengocphaitra, lt.sotienthuctra
    FROM lichtrano lt
    WHERE lt.trangthai = 'Qua han'
  `);

  let updated = 0;
  for (const ky of rows) {
    // Goc con lai = sotiengocphaitra - min(sotienthuctra, sotiengocphaitra)
    const gocDaTra = Number(ky.sotienthuctra) > 0
      ? Math.min(Number(ky.sotienthuctra), Number(ky.sotiengocphaitra))
      : 0;
    const soTienGocConLai = Number(ky.sotiengocphaitra) - gocDaTra;

    if (soTienGocConLai <= 0) {
      await conn.query('UPDATE lichtrano SET sotienlaiphat = 0 WHERE lichtrano_id = ?', [ky.lichtrano_id]);
      continue;
    }

    // Tinh so ngay qua han
    const ngayDenHan = new Date(ky.ngaydenhan);
    const ngayHienTai = new Date();
    const soNgayQuaHan = Math.floor((ngayHienTai - ngayDenHan) / (1000 * 60 * 60 * 24));

    if (soNgayQuaHan <= 0) {
      await conn.query('UPDATE lichtrano SET sotienlaiphat = 0 WHERE lichtrano_id = ?', [ky.lichtrano_id]);
      continue;
    }

    // Lai phat = GocConLai × (LaiSuatPhat / 100) × (SoNgayQuaHan / 365)
    const laiPhat = Math.round(soTienGocConLai * (laiSuatPhatNam / 100) * (soNgayQuaHan / 365) * 100) / 100;

    await conn.query('UPDATE lichtrano SET sotienlaiphat = ? WHERE lichtrano_id = ?', [laiPhat, ky.lichtrano_id]);
    updated++;
    console.log(`Ky ${ky.lichtrano_id}: GocConLai=${soTienGocConLai}, NgayQH=${soNgayQuaHan}, Phat=${laiPhat}`);
  }

  console.log(`\nUpdated ${updated} periods with new penalty calculation`);
  await conn.end();
}

recalculatePenalties().catch(console.error);
