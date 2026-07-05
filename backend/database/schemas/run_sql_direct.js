import pool from '../../config/db.js';

async function runDirectSQL() {
  const connection = await pool.getConnection();
  
  try {
    console.log('📦 Running Bank Account Refactor Migration (Direct SQL)...\n');

    // BƯỚC 1: Thêm cột loaitaikhoan
    console.log('[1/7] Adding loaitaikhoan column...');
    try {
      await connection.query(`
        ALTER TABLE taikhoannganhang
        ADD COLUMN loaitaikhoan ENUM('Nha truong', 'Sinh vien') NOT NULL DEFAULT 'Sinh vien' 
        COMMENT 'Phân loại: Nha truong (nhận tài trợ) hoặc Sinh vien (nhận giải ngân)'
        AFTER quy_id
      `);
      console.log('  ✅ Column loaitaikhoan added\n');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('  ⚠️  Column already exists\n');
      } else {
        throw error;
      }
    }

    // BƯỚC 2: Cập nhật dữ liệu hiện có
    console.log('[2/7] Updating existing records...');
    const [updateResult] = await connection.query(`
      UPDATE taikhoannganhang
      SET loaitaikhoan = 'Nha truong'
      WHERE quy_id IS NOT NULL
    `);
    console.log(`  ✅ Updated ${updateResult.affectedRows} records to 'Nha truong'\n`);

    // BƯỚC 3: Drop Foreign Key
    console.log('[3/7] Dropping Foreign Key constraint...');
    const [constraints] = await connection.query(`
      SELECT CONSTRAINT_NAME 
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'taikhoannganhang' 
        AND COLUMN_NAME = 'quy_id' 
        AND REFERENCED_TABLE_NAME IS NOT NULL
    `);
    
    if (constraints.length > 0) {
      const constraintName = constraints[0].CONSTRAINT_NAME;
      await connection.query(`ALTER TABLE taikhoannganhang DROP FOREIGN KEY ${constraintName}`);
      console.log(`  ✅ Dropped FK constraint: ${constraintName}\n`);
    } else {
      console.log('  ⚠️  No FK constraint found\n');
    }

    // BƯỚC 4: Modify quy_id to nullable
    console.log('[4/7] Making quy_id nullable...');
    await connection.query(`
      ALTER TABLE taikhoannganhang 
      MODIFY COLUMN quy_id INT NULL 
      COMMENT 'Legacy: Không còn dùng làm FK, chỉ lưu lịch sử'
    `);
    console.log('  ✅ quy_id is now nullable\n');

    // BƯỚC 5: Seed tài khoản nhà trường
    console.log('[5/7] Seeding school bank account...');
    const [existingSchool] = await connection.query(`
      SELECT * FROM taikhoannganhang 
      WHERE sotaikhoan = '1018899889' 
        AND nganhang = 'VIETCOMBANK'
        AND loaitaikhoan = 'Nha truong'
    `);

    if (existingSchool.length === 0) {
      await connection.query(`
        INSERT INTO taikhoannganhang (
          quy_id, 
          sotaikhoan, 
          nganhang, 
          chinhanh, 
          chutaikhoan, 
          loaitaikhoan, 
          trangthai
        ) VALUES (
          NULL,
          '1018899889',
          'VIETCOMBANK',
          'Chi nhánh Trà Vinh',
          'TRUONG DAI HOC TRA VINH',
          'Nha truong',
          'Hoat dong'
        )
      `);
      console.log('  ✅ School bank account seeded\n');
    } else {
      console.log('  ⚠️  School bank account already exists\n');
    }

    // BƯỚC 6: Add index
    console.log('[6/7] Adding index...');
    try {
      await connection.query(`
        CREATE INDEX idx_loaitaikhoan ON taikhoannganhang(loaitaikhoan, trangthai)
      `);
      console.log('  ✅ Index created\n');
    } catch (error) {
      if (error.code === 'ER_DUP_KEYNAME') {
        console.log('  ⚠️  Index already exists\n');
      } else {
        throw error;
      }
    }

    // BƯỚC 7: Verification
    console.log('[7/7] Verification...\n');
    
    const [summary] = await connection.query(`
      SELECT 
        COUNT(*) AS total_accounts,
        SUM(CASE WHEN loaitaikhoan = 'Nha truong' THEN 1 ELSE 0 END) AS school_accounts,
        SUM(CASE WHEN loaitaikhoan = 'Sinh vien' THEN 1 ELSE 0 END) AS student_accounts
      FROM taikhoannganhang
    `);
    
    console.log('📊 Summary:');
    console.table(summary);

    const [schoolAccounts] = await connection.query(`
      SELECT 
        taikhoannganhang_id,
        sotaikhoan,
        nganhang,
        chinhanh,
        chutaikhoan,
        loaitaikhoan,
        trangthai
      FROM taikhoannganhang
      WHERE loaitaikhoan = 'Nha truong'
    `);

    console.log('\n🏦 School Bank Accounts:');
    console.table(schoolAccounts);

    console.log('\n✅ Migration completed successfully!');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    throw error;
  } finally {
    connection.release();
    await pool.end();
  }
}

runDirectSQL().catch(console.error);
