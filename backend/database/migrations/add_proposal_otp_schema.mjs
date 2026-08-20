import pool from '../../config/db.js';

/**
 * Migration: Add OTP verification schema for proposal guest tracking
 * Date: 2024-01-XX
 * Purpose: Support OTP email verification for public proposal submissions
 * 
 * Changes:
 * 1. Add 'dexuatchuongtrinh' to guest_tracking.loai enum (already done in update_guest_tracking_loai_enum.mjs)
 * 2. Add dexuatchuongtrinh_id foreign key column to guest_tracking
 * 3. Make dexuatchuongtrinh.nhataitro_id nullable
 * 4. Add nguoidung_id foreign key column to dexuatchuongtrinh
 * 
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7
 */

async function migrate() {
  const connection = await pool.getConnection();
  
  try {
    console.log('Starting migration: Add proposal OTP schema...\n');
    
    // ========================================================================
    // STEP 1: Verify guest_tracking table exists
    // ========================================================================
    console.log('STEP 1: Verifying guest_tracking table exists...');
    const [guestTrackingTables] = await connection.query(`
      SHOW TABLES LIKE 'guest_tracking'
    `);
    
    if (guestTrackingTables.length === 0) {
      throw new Error('❌ Table guest_tracking does not exist');
    }
    console.log('✅ guest_tracking table exists\n');
    
    // ========================================================================
    // STEP 2: Check if loai enum includes 'dexuatchuongtrinh'
    // ========================================================================
    console.log('STEP 2: Checking guest_tracking.loai enum...');
    const [loaiColumn] = await connection.query(`
      SHOW COLUMNS FROM guest_tracking WHERE Field = 'loai'
    `);
    
    if (loaiColumn.length === 0) {
      throw new Error('❌ Column loai does not exist in guest_tracking');
    }
    
    const loaiType = loaiColumn[0].Type;
    console.log(`   Current type: ${loaiType}`);
    
    if (!loaiType.includes('dexuatchuongtrinh')) {
      console.log('⚠️  WARNING: "dexuatchuongtrinh" not in enum');
      console.log('   Please run update_guest_tracking_loai_enum.mjs first');
      throw new Error('ENUM_NOT_UPDATED');
    }
    console.log('✅ ENUM includes "dexuatchuongtrinh"\n');
    
    // ========================================================================
    // STEP 3: Add dexuatchuongtrinh_id column to guest_tracking
    // ========================================================================
    console.log('STEP 3: Adding dexuatchuongtrinh_id column to guest_tracking...');
    const [dexuatIdColumn] = await connection.query(`
      SHOW COLUMNS FROM guest_tracking WHERE Field = 'dexuatchuongtrinh_id'
    `);
    
    if (dexuatIdColumn.length > 0) {
      console.log('⏭️  Column dexuatchuongtrinh_id already exists, skipping...\n');
    } else {
      await connection.query(`
        ALTER TABLE guest_tracking
        ADD COLUMN dexuatchuongtrinh_id INT NULL
        AFTER doituong_id
      `);
      console.log('✅ Added dexuatchuongtrinh_id column\n');
    }
    
    // ========================================================================
    // STEP 4: Add foreign key constraint for dexuatchuongtrinh_id
    // ========================================================================
    console.log('STEP 4: Adding foreign key constraint for dexuatchuongtrinh_id...');
    
    // Check if foreign key already exists
    const [existingFks] = await connection.query(`
      SELECT CONSTRAINT_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'guest_tracking'
        AND COLUMN_NAME = 'dexuatchuongtrinh_id'
        AND REFERENCED_TABLE_NAME IS NOT NULL
    `);
    
    if (existingFks.length > 0) {
      console.log(`⏭️  Foreign key already exists: ${existingFks[0].CONSTRAINT_NAME}, skipping...\n`);
    } else {
      await connection.query(`
        ALTER TABLE guest_tracking
        ADD CONSTRAINT fk_guest_tracking_dexuat
        FOREIGN KEY (dexuatchuongtrinh_id)
        REFERENCES dexuatchuongtrinh(dexuatchuongtrinh_id)
        ON DELETE SET NULL
      `);
      console.log('✅ Added foreign key constraint fk_guest_tracking_dexuat\n');
    }
    
    // ========================================================================
    // STEP 5: Verify dexuatchuongtrinh table exists
    // ========================================================================
    console.log('STEP 5: Verifying dexuatchuongtrinh table exists...');
    const [dexuatTables] = await connection.query(`
      SHOW TABLES LIKE 'dexuatchuongtrinh'
    `);
    
    if (dexuatTables.length === 0) {
      throw new Error('❌ Table dexuatchuongtrinh does not exist');
    }
    console.log('✅ dexuatchuongtrinh table exists\n');
    
    // ========================================================================
    // STEP 6: Make dexuatchuongtrinh.nhataitro_id nullable
    // ========================================================================
    console.log('STEP 6: Making dexuatchuongtrinh.nhataitro_id nullable...');
    const [nhataitroColumn] = await connection.query(`
      SHOW COLUMNS FROM dexuatchuongtrinh WHERE Field = 'nhataitro_id'
    `);
    
    if (nhataitroColumn.length === 0) {
      throw new Error('❌ Column nhataitro_id does not exist in dexuatchuongtrinh');
    }
    
    const isNullable = nhataitroColumn[0].Null === 'YES';
    console.log(`   Current: ${nhataitroColumn[0].Type}, Null: ${nhataitroColumn[0].Null}`);
    
    if (isNullable) {
      console.log('⏭️  Column nhataitro_id already nullable, skipping...\n');
    } else {
      await connection.query(`
        ALTER TABLE dexuatchuongtrinh
        MODIFY COLUMN nhataitro_id INT NULL
      `);
      console.log('✅ Made nhataitro_id nullable\n');
    }
    
    // ========================================================================
    // STEP 7: Add nguoidung_id column to dexuatchuongtrinh
    // ========================================================================
    console.log('STEP 7: Adding nguoidung_id column to dexuatchuongtrinh...');
    const [nguoidungColumn] = await connection.query(`
      SHOW COLUMNS FROM dexuatchuongtrinh WHERE Field = 'nguoidung_id'
    `);
    
    if (nguoidungColumn.length > 0) {
      console.log('⏭️  Column nguoidung_id already exists, skipping...\n');
    } else {
      await connection.query(`
        ALTER TABLE dexuatchuongtrinh
        ADD COLUMN nguoidung_id INT NULL
        AFTER nhataitro_id
      `);
      console.log('✅ Added nguoidung_id column\n');
    }
    
    // ========================================================================
    // STEP 8: Add foreign key constraint for nguoidung_id
    // ========================================================================
    console.log('STEP 8: Adding foreign key constraint for nguoidung_id...');
    
    // Check if foreign key already exists
    const [existingNguoidungFks] = await connection.query(`
      SELECT CONSTRAINT_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'dexuatchuongtrinh'
        AND COLUMN_NAME = 'nguoidung_id'
        AND REFERENCED_TABLE_NAME IS NOT NULL
    `);
    
    if (existingNguoidungFks.length > 0) {
      console.log(`⏭️  Foreign key already exists: ${existingNguoidungFks[0].CONSTRAINT_NAME}, skipping...\n`);
    } else {
      await connection.query(`
        ALTER TABLE dexuatchuongtrinh
        ADD CONSTRAINT fk_dexuat_nguoidung
        FOREIGN KEY (nguoidung_id)
        REFERENCES nguoidung(nguoidung_id)
        ON DELETE SET NULL
      `);
      console.log('✅ Added foreign key constraint fk_dexuat_nguoidung\n');
    }
    
    // ========================================================================
    // STEP 9: Verify changes
    // ========================================================================
    console.log('STEP 9: Verifying all changes...\n');
    
    // Verify guest_tracking columns
    const [finalGuestCols] = await connection.query(`
      SHOW COLUMNS FROM guest_tracking 
      WHERE Field IN ('loai', 'dexuatchuongtrinh_id')
    `);
    
    console.log('guest_tracking columns:');
    finalGuestCols.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type}, Null: ${col.Null}, Key: ${col.Key}`);
    });
    
    // Verify dexuatchuongtrinh columns
    const [finalDexuatCols] = await connection.query(`
      SHOW COLUMNS FROM dexuatchuongtrinh 
      WHERE Field IN ('nhataitro_id', 'nguoidung_id')
    `);
    
    console.log('\ndexuatchuongtrinh columns:');
    finalDexuatCols.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type}, Null: ${col.Null}, Key: ${col.Key}`);
    });
    
    console.log('\n✅ Migration completed successfully!');
    console.log('\nSummary:');
    console.log('  ✓ guest_tracking.loai includes "dexuatchuongtrinh"');
    console.log('  ✓ guest_tracking.dexuatchuongtrinh_id (INT NULL, FK)');
    console.log('  ✓ dexuatchuongtrinh.nhataitro_id (INT NULL)');
    console.log('  ✓ dexuatchuongtrinh.nguoidung_id (INT NULL, FK)');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Rollback function to undo the migration
 */
async function rollback() {
  const connection = await pool.getConnection();
  
  try {
    console.log('Starting rollback: Remove proposal OTP schema...\n');
    
    // Remove foreign key constraint from guest_tracking
    console.log('STEP 1: Removing fk_guest_tracking_dexuat...');
    try {
      await connection.query(`
        ALTER TABLE guest_tracking
        DROP FOREIGN KEY fk_guest_tracking_dexuat
      `);
      console.log('✅ Removed foreign key constraint\n');
    } catch (err) {
      if (err.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
        console.log('⏭️  Foreign key does not exist, skipping...\n');
      } else {
        throw err;
      }
    }
    
    // Remove dexuatchuongtrinh_id column from guest_tracking
    console.log('STEP 2: Removing dexuatchuongtrinh_id column...');
    try {
      await connection.query(`
        ALTER TABLE guest_tracking
        DROP COLUMN dexuatchuongtrinh_id
      `);
      console.log('✅ Removed column\n');
    } catch (err) {
      if (err.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
        console.log('⏭️  Column does not exist, skipping...\n');
      } else {
        throw err;
      }
    }
    
    // Remove foreign key constraint from dexuatchuongtrinh
    console.log('STEP 3: Removing fk_dexuat_nguoidung...');
    try {
      await connection.query(`
        ALTER TABLE dexuatchuongtrinh
        DROP FOREIGN KEY fk_dexuat_nguoidung
      `);
      console.log('✅ Removed foreign key constraint\n');
    } catch (err) {
      if (err.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
        console.log('⏭️  Foreign key does not exist, skipping...\n');
      } else {
        throw err;
      }
    }
    
    // Remove nguoidung_id column from dexuatchuongtrinh
    console.log('STEP 4: Removing nguoidung_id column...');
    try {
      await connection.query(`
        ALTER TABLE dexuatchuongtrinh
        DROP COLUMN nguoidung_id
      `);
      console.log('✅ Removed column\n');
    } catch (err) {
      if (err.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
        console.log('⏭️  Column does not exist, skipping...\n');
      } else {
        throw err;
      }
    }
    
    console.log('⚠️  Note: nhataitro_id remains nullable (manual revert if needed)');
    console.log('⚠️  Note: guest_tracking.loai enum not reverted (manual revert if needed)');
    
    console.log('\n✅ Rollback completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Rollback failed:', error.message);
    throw error;
  } finally {
    connection.release();
  }
}

// ============================================================================
// Run migration or rollback based on command line argument
// ============================================================================
const command = process.argv[2] || 'migrate';

if (command === 'rollback') {
  rollback()
    .then(() => {
      console.log('\n✅ Rollback process completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Rollback process failed:', error);
      process.exit(1);
    });
} else {
  migrate()
    .then(() => {
      console.log('\n✅ Migration process completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Migration process failed:', error);
      process.exit(1);
    });
}
