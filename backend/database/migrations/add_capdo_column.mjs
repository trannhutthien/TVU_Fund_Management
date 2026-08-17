/**
 * Migration: Add capdo column to quy table
 * 
 * This migration adds the capdo (level) column to the quy table and populates it
 * based on the fund hierarchy:
 * - Level 1: Quỹ Phát triển ĐH Trà Vinh (parent funds without quy_cha_id)
 * - Level 2: Quỹ thành phần (component funds - children of level 1)
 * - Level 3: Quỹ hoạt động (operational funds - children of level 2)
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
    
    // 1. Check if capdo column already exists
    console.log('\n📋 Checking if capdo column exists...');
    const [columns] = await connection.query(
      `SELECT COLUMN_NAME 
       FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'quy' AND COLUMN_NAME = 'capdo'`,
      [dbConfig.database]
    );
    
    if (columns.length > 0) {
      console.log('⚠️  capdo column already exists, skipping column creation');
    } else {
      console.log('➕ Adding capdo column to quy table...');
      await connection.query(
        `ALTER TABLE quy 
         ADD COLUMN capdo TINYINT NOT NULL DEFAULT 1 
         COMMENT 'Cap do quy: 1=Quy me, 2=Quy thanh phan, 3=Quy hoat dong'
         AFTER loaidieuhanh`
      );
      console.log('✅ capdo column added successfully');
    }
    
    // 2. Populate capdo based on fund hierarchy
    console.log('\n🔄 Populating capdo values based on fund hierarchy...');
    
    // Step 1: Set level 1 for all funds without parent (quy_cha_id IS NULL)
    const [level1Result] = await connection.query(
      `UPDATE quy SET capdo = 1 WHERE quy_cha_id IS NULL`
    );
    console.log(`✅ Set ${level1Result.affectedRows} funds to level 1 (Quỹ mẹ)`);
    
    // Step 2: Set level 2 for all funds whose parent is level 1
    const [level2Result] = await connection.query(
      `UPDATE quy q
       INNER JOIN quy parent ON q.quy_cha_id = parent.quy_id
       SET q.capdo = 2
       WHERE parent.capdo = 1`
    );
    console.log(`✅ Set ${level2Result.affectedRows} funds to level 2 (Quỹ thành phần)`);
    
    // Step 3: Set level 3 for all funds whose parent is level 2
    const [level3Result] = await connection.query(
      `UPDATE quy q
       INNER JOIN quy parent ON q.quy_cha_id = parent.quy_id
       SET q.capdo = 3
       WHERE parent.capdo = 2`
    );
    console.log(`✅ Set ${level3Result.affectedRows} funds to level 3 (Quỹ hoạt động)`);
    
    // 3. Verify the results
    console.log('\n📊 Verification - Fund level distribution:');
    const [stats] = await connection.query(
      `SELECT 
        capdo,
        COUNT(*) as count,
        GROUP_CONCAT(tenquy SEPARATOR ', ') as fund_names
       FROM quy
       GROUP BY capdo
       ORDER BY capdo`
    );
    
    for (const row of stats) {
      console.log(`  Level ${row.capdo}: ${row.count} funds`);
      console.log(`    → ${row.fund_names}`);
    }
    
    console.log('\n✅ Migration completed successfully!');
    
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
