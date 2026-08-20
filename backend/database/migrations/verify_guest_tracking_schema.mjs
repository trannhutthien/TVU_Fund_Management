import pool from '../../config/db.js';

async function verifySchema() {
  try {
    console.log('=== Verifying guest_tracking schema ===\n');
    
    // 1. Check loai column ENUM
    const [loaiColumn] = await pool.query(`
      SHOW COLUMNS FROM guest_tracking WHERE Field = 'loai'
    `);
    
    console.log('1. Column "loai" definition:');
    console.log(`   Type: ${loaiColumn[0].Type}`);
    console.log(`   Null: ${loaiColumn[0].Null}`);
    console.log(`   Default: ${loaiColumn[0].Default || 'NULL'}`);
    
    // Check if dexuatchuongtrinh is in ENUM
    const hasDexuatChuongTrinh = loaiColumn[0].Type.includes('dexuatchuongtrinh');
    console.log(`   Contains "dexuatchuongtrinh": ${hasDexuatChuongTrinh ? '✅ YES' : '❌ NO'}`);
    
    // 2. Check dexuatchuongtrinh_id column
    const [dexuatColumn] = await pool.query(`
      SHOW COLUMNS FROM guest_tracking WHERE Field = 'dexuatchuongtrinh_id'
    `);
    
    console.log('\n2. Column "dexuatchuongtrinh_id":');
    if (dexuatColumn.length > 0) {
      console.log(`   Type: ${dexuatColumn[0].Type}`);
      console.log(`   Null: ${dexuatColumn[0].Null}`);
      console.log(`   Default: ${dexuatColumn[0].Default || 'NULL'}`);
      console.log('   ✅ Column exists');
    } else {
      console.log('   ❌ Column does NOT exist');
    }
    
    // 3. Test insert with dexuatchuongtrinh
    console.log('\n3. Testing INSERT with loai="dexuatchuongtrinh"...');
    const testUuid = `test-${Date.now()}`;
    
    try {
      await pool.execute(`
        INSERT INTO guest_tracking 
        (tracking_uuid, hoten, email, loai, quy_id, sotien, trangthai, dexuatchuongtrinh_id)
        VALUES (?, 'Test User', 'test@example.com', 'dexuatchuongtrinh', 1, 1000000, 'CHO_XAC_MINH', 1)
      `, [testUuid]);
      
      console.log('   ✅ INSERT successful!');
      
      // Clean up test record
      await pool.execute(`DELETE FROM guest_tracking WHERE tracking_uuid = ?`, [testUuid]);
      console.log('   ✅ Test record cleaned up');
      
    } catch (insertError) {
      console.log('   ❌ INSERT failed:', insertError.message);
    }
    
    console.log('\n=== Verification complete ===');
    
  } catch (error) {
    console.error('❌ Verification error:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

verifySchema()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
