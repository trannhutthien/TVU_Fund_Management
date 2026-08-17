/**
 * Migration: Add dexuat_id column to khoantaitro table
 * 
 * This migration adds the dexuat_id column to the khoantaitro table to link
 * donation records with program proposals (dexuatchuongtrinh).
 * 
 * Purpose:
 * - dexuat_id = NULL: Regular donations to existing funds (Quỹ Mẹ, Quỹ Thành phần, Chương trình)
 * - dexuat_id != NULL: Donations associated with a new program proposal
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from backend/.env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Parse DATABASE_URL or use individual variables
let dbConfig;

if (process.env.DATABASE_URL) {
  // Parse DATABASE_URL format: mysql://user:pass@host:port/database?ssl-mode=REQUIRED
  const url = new URL(process.env.DATABASE_URL);
  dbConfig = {
    host: url.hostname,
    port: parseInt(url.port) || 3306,
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1), // Remove leading /
    ssl: url.searchParams.get('ssl-mode') === 'REQUIRED' ? { rejectUnauthorized: false } : undefined,
  };
} else {
  dbConfig = {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  };
}

async function runMigration() {
  let connection;
  
  try {
    console.log('🔌 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');
    
    // 1. Check if dexuat_id column already exists
    console.log('\n📋 Checking if dexuat_id column exists in khoantaitro table...');
    const [columns] = await connection.query(
      `SELECT COLUMN_NAME 
       FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'khoantaitro' AND COLUMN_NAME = 'dexuat_id'`,
      [dbConfig.database]
    );
    
    if (columns.length > 0) {
      console.log('⚠️  dexuat_id column already exists, skipping column creation');
    } else {
      console.log('➕ Adding dexuat_id column to khoantaitro table...');
      await connection.query(
        `ALTER TABLE khoantaitro 
         ADD COLUMN dexuat_id INT NULL 
         COMMENT 'ID cua de xuat chuong trinh (NULL = tai tro thuong, NOT NULL = tai tro kem de xuat)'
         AFTER quy_id`
      );
      console.log('✅ dexuat_id column added successfully');
    }
    
    // 2. Check if foreign key constraint already exists
    console.log('\n📋 Checking if foreign key constraint exists...');
    const [constraints] = await connection.query(
      `SELECT CONSTRAINT_NAME 
       FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
       WHERE TABLE_SCHEMA = ? 
       AND TABLE_NAME = 'khoantaitro' 
       AND COLUMN_NAME = 'dexuat_id'
       AND REFERENCED_TABLE_NAME = 'dexuatchuongtrinh'`,
      [dbConfig.database]
    );
    
    if (constraints.length > 0) {
      console.log(`⚠️  Foreign key constraint '${constraints[0].CONSTRAINT_NAME}' already exists, skipping constraint creation`);
    } else {
      console.log('➕ Adding foreign key constraint...');
      await connection.query(
        `ALTER TABLE khoantaitro 
         ADD CONSTRAINT fk_khoantaitro_dexuat 
         FOREIGN KEY (dexuat_id) 
         REFERENCES dexuatchuongtrinh(dexuatchuongtrinh_id)
         ON DELETE SET NULL
         ON UPDATE CASCADE`
      );
      console.log('✅ Foreign key constraint added successfully');
    }
    
    // 3. Verify the column and constraint
    console.log('\n📊 Verification:');
    
    // Check column details
    const [columnDetails] = await connection.query(
      `SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_COMMENT
       FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'khoantaitro' AND COLUMN_NAME = 'dexuat_id'`,
      [dbConfig.database]
    );
    
    if (columnDetails.length > 0) {
      const col = columnDetails[0];
      console.log('  Column details:');
      console.log(`    - Name: ${col.COLUMN_NAME}`);
      console.log(`    - Type: ${col.COLUMN_TYPE}`);
      console.log(`    - Nullable: ${col.IS_NULLABLE}`);
      console.log(`    - Default: ${col.COLUMN_DEFAULT}`);
      console.log(`    - Comment: ${col.COLUMN_COMMENT}`);
    }
    
    // Check foreign key details
    const [fkDetails] = await connection.query(
      `SELECT 
        CONSTRAINT_NAME,
        REFERENCED_TABLE_NAME,
        REFERENCED_COLUMN_NAME
       FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
       WHERE TABLE_SCHEMA = ? 
       AND TABLE_NAME = 'khoantaitro' 
       AND COLUMN_NAME = 'dexuat_id'
       AND REFERENCED_TABLE_NAME IS NOT NULL`,
      [dbConfig.database]
    );
    
    if (fkDetails.length > 0) {
      console.log('\n  Foreign key constraint:');
      console.log(`    - Constraint name: ${fkDetails[0].CONSTRAINT_NAME}`);
      console.log(`    - References: ${fkDetails[0].REFERENCED_TABLE_NAME}.${fkDetails[0].REFERENCED_COLUMN_NAME}`);
    }
    
    // Count existing donations
    const [stats] = await connection.query(
      `SELECT 
        COUNT(*) as total_donations,
        COUNT(dexuat_id) as donations_with_proposals,
        COUNT(*) - COUNT(dexuat_id) as regular_donations
       FROM khoantaitro`
    );
    
    if (stats.length > 0) {
      console.log('\n  Current donation statistics:');
      console.log(`    - Total donations: ${stats[0].total_donations}`);
      console.log(`    - Donations with proposals: ${stats[0].donations_with_proposals}`);
      console.log(`    - Regular donations: ${stats[0].regular_donations}`);
    }
    
    console.log('\n✅ Migration completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Create ProposalModel.js with createProposalWithDonation() method');
    console.log('   2. Create proposalController.js with POST /api/donations/propose-program endpoint');
    console.log('   3. Update frontend to support program proposal form');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Run migration
runMigration();
