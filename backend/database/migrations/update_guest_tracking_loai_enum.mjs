import pool from '../../config/db.js';

/**
 * Migration: Update guest_tracking.loai ENUM to include 'dexuatchuongtrinh'
 * Date: 2026-08-19
 * Purpose: Fix "Data truncated for column 'loai'" error when creating public proposals
 */

async function updateGuestTrackingLoaiEnum() {
  const connection = await pool.getConnection();
  
  try {
    console.log('Starting migration: Update guest_tracking.loai ENUM...');
    
    // Check if guest_tracking table exists
    const [tables] = await connection.query(`
      SHOW TABLES LIKE 'guest_tracking'
    `);
    
    if (tables.length === 0) {
      console.log('❌ Table guest_tracking does not exist. Skipping migration.');
      return;
    }
    
    // Check current ENUM values
    const [columns] = await connection.query(`
      SHOW COLUMNS FROM guest_tracking WHERE Field = 'loai'
    `);
    
    if (columns.length === 0) {
      console.log('❌ Column loai does not exist in guest_tracking. Skipping migration.');
      return;
    }
    
    const currentType = columns[0].Type;
    console.log(`Current loai column type: ${currentType}`);
    
    // Check if 'dexuatchuongtrinh' is already in the ENUM
    if (currentType.includes('dexuatchuongtrinh')) {
      console.log('✅ ENUM already includes "dexuatchuongtrinh". No migration needed.');
      return;
    }
    
    // Update ENUM to include 'dexuatchuongtrinh'
    console.log('Updating ENUM to include "dexuatchuongtrinh"...');
    await connection.query(`
      ALTER TABLE guest_tracking
      MODIFY COLUMN loai ENUM('yeucauhotro', 'khoantaitro', 'dexuatchuongtrinh') NOT NULL
    `);
    
    console.log('✅ Successfully updated guest_tracking.loai ENUM');
    console.log('   Old: ENUM("yeucauhotro", "khoantaitro")');
    console.log('   New: ENUM("yeucauhotro", "khoantaitro", "dexuatchuongtrinh")');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    connection.release();
  }
}

// Run migration
updateGuestTrackingLoaiEnum()
  .then(() => {
    console.log('\n✅ Migration completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  });
