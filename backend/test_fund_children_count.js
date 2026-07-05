/**
 * Test: Đếm số quỹ con đang hoạt động
 */

import pool from './config/db.js';

async function testChildFundCount() {
  let connection;
  
  try {
    console.log('🧪 Test đếm số quỹ con đang hoạt động\n');
    
    connection = await pool.getConnection();
    
    // 1. Kiểm tra quỹ mẹ (Bể chung)
    console.log('📊 Danh sách quỹ mẹ (Bể chung):');
    const [parentFunds] = await connection.query(`
      SELECT 
        quy_id,
        tenquy,
        loaidieuhanh,
        trangthai
      FROM quy
      WHERE loaidieuhanh = 'Tap trung - Be chung'
      ORDER BY ngaytao DESC
    `);
    console.table(parentFunds);
    
    // 2. Kiểm tra quỹ con (Mục chi)
    console.log('\n📊 Danh sách quỹ con (Mục chi):');
    const [childFunds] = await connection.query(`
      SELECT 
        quy_id,
        tenquy,
        quy_cha_id,
        loaidieuhanh,
        trangthai
      FROM quy
      WHERE loaidieuhanh = 'Tap trung - Muc chi'
      ORDER BY ngaytao DESC
    `);
    console.table(childFunds);
    
    // 3. Test query đếm
    console.log('\n📊 Test query đếm số quỹ con cho từng quỹ mẹ:');
    for (const parent of parentFunds) {
      const [count] = await connection.query(`
        SELECT COUNT(*) as total
        FROM quy qc 
        WHERE qc.quy_cha_id = ?
        AND qc.loaidieuhanh = 'Tap trung - Muc chi'
        AND qc.trangthai = 'Dang hoat dong'
      `, [parent.quy_id]);
      
      console.log(`\n  Quỹ mẹ: "${parent.tenquy}" (ID: ${parent.quy_id})`);
      console.log(`  Số quỹ con đang hoạt động: ${count[0].total}`);
    }
    
    // 4. Test full query từ getPublicFunds
    console.log('\n\n📊 Test full query từ getPublicFunds:');
    const [fullQuery] = await connection.query(`
      SELECT 
        q.quy_id,
        q.tenquy,
        q.loaidieuhanh,
        q.trangthai,
        (SELECT COUNT(*) 
         FROM quy qc 
         WHERE qc.quy_cha_id = q.quy_id 
         AND qc.loaidieuhanh = 'Tap trung - Muc chi'
         AND qc.trangthai = 'Dang hoat dong') as so_quy_con_hoat_dong
      FROM quy q
      WHERE q.loaidieuhanh = 'Tap trung - Be chung'
      ORDER BY q.ngaytao DESC
    `);
    console.table(fullQuery);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    if (connection) connection.release();
    await pool.end();
  }
}

testChildFundCount();
