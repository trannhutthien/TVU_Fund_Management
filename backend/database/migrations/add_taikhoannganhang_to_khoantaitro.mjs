import pool from '../../config/db.js';

/**
 * Migration: Add taikhoannganhang_id column to khoantaitro table
 * Purpose: Track which bank account the donor transferred money to
 */

async function runMigration() {
  const connection = await pool.getConnection();
  
  try {
    console.log('🔄 Starting migration: add_taikhoannganhang_to_khoantaitro');
    
    // Check if column already exists
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'khoantaitro' 
        AND COLUMN_NAME = 'taikhoannganhang_id'
    `);
    
    if (columns.length > 0) {
      console.log('✅ Column taikhoannganhang_id already exists in khoantaitro table');
      return;
    }
    
    // Add the column
    await connection.query(`
      ALTER TABLE khoantaitro
      ADD COLUMN taikhoannganhang_id INT NULL AFTER quy_id,
      ADD CONSTRAINT fk_khoantaitro_taikhoannganhang 
        FOREIGN KEY (taikhoannganhang_id) 
        REFERENCES taikhoannganhang(taikhoannganhang_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
    `);
    
    console.log('✅ Successfully added taikhoannganhang_id column to khoantaitro table');
    
    // Add index for better query performance
    await connection.query(`
      ALTER TABLE khoantaitro
      ADD INDEX idx_taikhoannganhang (taikhoannganhang_id)
    `);
    
    console.log('✅ Successfully added index on taikhoannganhang_id');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    connection.release();
  }
}

// Run migration
runMigration()
  .then(() => {
    console.log('✅ Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  });
