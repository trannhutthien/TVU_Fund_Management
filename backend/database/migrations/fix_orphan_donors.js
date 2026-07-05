/**
 * Migration Script: Create nguoidung for existing nhataitro with NULL nguoi_dung_id
 * 
 * Purpose:
 * - Tìm tất cả donors có email nhưng chưa có tài khoản người dùng
 * - Tạo tài khoản cho họ và link lại
 * - Fix data inconsistency từ trước khi có update
 * 
 * Usage:
 *   cd backend/database/migrations
 *   node fix_orphan_donors.js
 * 
 * Safety:
 *   - Uses transaction (rollback on error)
 *   - Logs all actions
 *   - Does not delete any data
 */

import pool from '../../config/db.js';
import bcrypt from 'bcryptjs';

const fixOrphanDonors = async () => {
  const connection = await pool.getConnection();
  
  try {
    console.log('\n🔍 Starting orphan donors migration...\n');
    
    await connection.beginTransaction();
    
    // Step 1: Find all orphan donors (có email, nhưng nguoi_dung_id = NULL)
    const [orphanDonors] = await connection.query(`
      SELECT 
        nhataitro_id,
        tennhataitro,
        loainhataitro,
        email,
        sodienthoai,
        diachi
      FROM nhataitro
      WHERE nguoidung_id IS NULL 
        AND email IS NOT NULL
        AND email != ''
        AND email NOT LIKE '%@example.com%'
      ORDER BY nhataitro_id
    `);
    
    console.log(`📊 Found ${orphanDonors.length} orphan donors to process\n`);
    
    if (orphanDonors.length === 0) {
      console.log('✅ No orphan donors found. Database is clean!');
      await connection.commit();
      connection.release();
      return;
    }
    
    let created = 0;
    let linked = 0;
    let skipped = 0;
    let errors = 0;
    
    // Step 2: Process each orphan donor
    for (const donor of orphanDonors) {
      try {
        console.log(`\n📝 Processing donor #${donor.nhataitro_id}: ${donor.tennhataitro}`);
        console.log(`   Email: ${donor.email}`);
        
        // Check if email already exists in nguoidung
        const [existingUsers] = await connection.query(
          `SELECT id, hoten, loaitaikhoan FROM nguoidung WHERE email = ? LIMIT 1`,
          [donor.email]
        );
        
        let nguoiDungId;
        
        if (existingUsers.length > 0) {
          // Email already has a user → Just link
          nguoiDungId = existingUsers[0].id;
          const existingName = existingUsers[0].hoten;
          const existingType = existingUsers[0].loaitaikhoan;
          
          console.log(`   ℹ️  User already exists (ID: ${nguoiDungId}, ${existingType})`);
          console.log(`   ↪️  Linking donor to existing user`);
          
          // Check if this user already has another donor record
          const [otherDonors] = await connection.query(
            `SELECT nhataitro_id FROM nhataitro 
             WHERE nguoidung_id = ? AND nhataitro_id != ? LIMIT 1`,
            [nguoiDungId, donor.nhataitro_id]
          );
          
          if (otherDonors.length > 0) {
            console.log(`   ⚠️  WARNING: User already has another donor record (ID: ${otherDonors[0].nhataitro_id})`);
            console.log(`   ⏭️  Skipping to avoid conflict`);
            skipped++;
            continue;
          }
          
          linked++;
        } else {
          // Create new user
          const tempPassword = Math.random().toString(36).slice(-8);
          const hashedPassword = await bcrypt.hash(tempPassword, 10);
          const maSoDinhDanh = `NTT${Date.now().toString().slice(-6)}${Math.random().toString(36).slice(-4)}`;
          
          const [userInsert] = await connection.query(`
            INSERT INTO nguoidung (
              email, matkhau, hoten, masodinhdanh, sodienthoai,
              vaitro_id, loaitaikhoan, trangthai, diachi
            ) VALUES (?, ?, ?, ?, ?, 4, 'NHA_TAI_TRO', 'Hoat dong', ?)
          `, [
            donor.email,
            hashedPassword,
            donor.tennhataitro,
            maSoDinhDanh,
            donor.sodienthoai,
            donor.diachi
          ]);
          
          nguoiDungId = userInsert.insertId;
          
          console.log(`   ✅ Created user account (ID: ${nguoiDungId})`);
          console.log(`   🔑 Temp password: ${tempPassword}`);
          console.log(`   ⚠️  Remember to notify donor about their account!`);
          
          created++;
        }
        
        // Update nhataitro with nguoi_dung_id
        await connection.query(
          `UPDATE nhataitro SET nguoidung_id = ? WHERE nhataitro_id = ?`,
          [nguoiDungId, donor.nhataitro_id]
        );
        
        console.log(`   ✓ Updated donor record with user ID`);
        
      } catch (donorError) {
        console.error(`   ✗ ERROR processing donor #${donor.nhataitro_id}:`, donorError.message);
        errors++;
        // Continue with other donors
      }
    }
    
    // Step 3: Commit transaction
    await connection.commit();
    
    // Step 4: Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 MIGRATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total orphan donors found:     ${orphanDonors.length}`);
    console.log(`✅ New users created:          ${created}`);
    console.log(`🔗 Linked to existing users:   ${linked}`);
    console.log(`⏭️  Skipped (conflicts):        ${skipped}`);
    console.log(`✗ Errors:                      ${errors}`);
    console.log('='.repeat(60));
    
    if (errors > 0) {
      console.log('\n⚠️  Some donors had errors. Please check logs above.');
    } else if (skipped > 0) {
      console.log('\n⚠️  Some donors were skipped due to conflicts. Please review manually.');
    } else {
      console.log('\n✅ All orphan donors processed successfully!');
    }
    
    // Step 5: Verification
    const [remainingOrphans] = await connection.query(`
      SELECT COUNT(*) as count FROM nhataitro
      WHERE nguoidung_id IS NULL 
        AND email IS NOT NULL
        AND email != ''
        AND email NOT LIKE '%@example.com%'
    `);
    
    console.log(`\n🔍 Verification: ${remainingOrphans[0].count} orphan donors remaining`);
    
  } catch (error) {
    await connection.rollback();
    console.error('\n❌ MIGRATION FAILED:', error);
    console.error('Stack trace:', error.stack);
    throw error;
  } finally {
    connection.release();
  }
};

// ─── Main Execution ──────────────────────────────────────────────────────────

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║  TVU Fund Management - Orphan Donors Migration Script     ║');
console.log('║  Fix donors with NULL nguoi_dung_id                       ║');
console.log('╚════════════════════════════════════════════════════════════╝');

fixOrphanDonors()
  .then(() => {
    console.log('\n✅ Migration script completed successfully!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Migration script failed!');
    console.error('Error:', error.message);
    process.exit(1);
  });
