# Migration Testing Guide: add_proposal_otp_schema.mjs

## Overview

This document provides testing instructions for the OTP verification schema migration for public proposal submissions.

## Pre-Migration Checklist

### 1. Database Backup

```bash
# Create backup before migration
mysqldump -u root -p tvu_fund_management > backup_before_otp_migration_$(date +%Y%m%d_%H%M%S).sql

# Verify backup was created
ls -lh backup_before_otp_migration_*.sql
```

### 2. Verify Prerequisites

Run the prerequisite enum migration first:

```bash
cd backend/database/migrations
node update_guest_tracking_loai_enum.mjs
```

Expected output should confirm that `guest_tracking.loai` includes 'dexuatchuongtrinh'.

### 3. Check Current Schema State

```sql
-- Check guest_tracking table structure
SHOW COLUMNS FROM guest_tracking;

-- Check dexuatchuongtrinh table structure
SHOW COLUMNS FROM dexuatchuongtrinh;

-- Verify loai enum values
SHOW COLUMNS FROM guest_tracking WHERE Field = 'loai';
```

## Running the Migration

### Execute Migration

```bash
cd backend/database/migrations
node add_proposal_otp_schema.mjs
```

### Expected Success Output

```
Starting migration: Add proposal OTP schema...

STEP 1: Verifying guest_tracking table exists...
✅ guest_tracking table exists

STEP 2: Checking guest_tracking.loai enum...
   Current type: enum('yeucauhotro','khoantaitro','dexuatchuongtrinh')
✅ ENUM includes "dexuatchuongtrinh"

STEP 3: Adding dexuatchuongtrinh_id column to guest_tracking...
✅ Added dexuatchuongtrinh_id column

STEP 4: Adding foreign key constraint for dexuatchuongtrinh_id...
✅ Added foreign key constraint fk_guest_tracking_dexuat

STEP 5: Verifying dexuatchuongtrinh table exists...
✅ dexuatchuongtrinh table exists

STEP 6: Making dexuatchuongtrinh.nhataitro_id nullable...
✅ Made nhataitro_id nullable

STEP 7: Adding nguoidung_id column to dexuatchuongtrinh...
✅ Added nguoidung_id column

STEP 8: Adding foreign key constraint for nguoidung_id...
✅ Added foreign key constraint fk_dexuat_nguoidung

STEP 9: Verifying all changes...

guest_tracking columns:
  - loai: enum('yeucauhotro','khoantaitro','dexuatchuongtrinh'), Null: NO, Key: 
  - dexuatchuongtrinh_id: int, Null: YES, Key: MUL

dexuatchuongtrinh columns:
  - nhataitro_id: int, Null: YES, Key: MUL
  - nguoidung_id: int, Null: YES, Key: MUL

✅ Migration completed successfully!

Summary:
  ✓ guest_tracking.loai includes "dexuatchuongtrinh"
  ✓ guest_tracking.dexuatchuongtrinh_id (INT NULL, FK)
  ✓ dexuatchuongtrinh.nhataitro_id (INT NULL)
  ✓ dexuatchuongtrinh.nguoidung_id (INT NULL, FK)
```

## Post-Migration Verification

### 1. Verify Schema Changes

```sql
-- Verify guest_tracking columns
DESCRIBE guest_tracking;

-- Check for dexuatchuongtrinh_id column
SELECT 
  COLUMN_NAME, 
  COLUMN_TYPE, 
  IS_NULLABLE, 
  COLUMN_KEY 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'guest_tracking' 
  AND COLUMN_NAME = 'dexuatchuongtrinh_id';

-- Verify foreign key exists
SELECT 
  CONSTRAINT_NAME,
  COLUMN_NAME,
  REFERENCED_TABLE_NAME,
  REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_NAME = 'guest_tracking'
  AND COLUMN_NAME = 'dexuatchuongtrinh_id'
  AND REFERENCED_TABLE_NAME IS NOT NULL;

-- Verify dexuatchuongtrinh columns
DESCRIBE dexuatchuongtrinh;

-- Check nhataitro_id is nullable
SELECT 
  COLUMN_NAME, 
  IS_NULLABLE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'dexuatchuongtrinh' 
  AND COLUMN_NAME = 'nhataitro_id';

-- Check nguoidung_id column exists
SELECT 
  COLUMN_NAME, 
  COLUMN_TYPE, 
  IS_NULLABLE, 
  COLUMN_KEY 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'dexuatchuongtrinh' 
  AND COLUMN_NAME = 'nguoidung_id';

-- Verify nguoidung_id foreign key
SELECT 
  CONSTRAINT_NAME,
  COLUMN_NAME,
  REFERENCED_TABLE_NAME,
  REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_NAME = 'dexuatchuongtrinh'
  AND COLUMN_NAME = 'nguoidung_id'
  AND REFERENCED_TABLE_NAME IS NOT NULL;
```

### 2. Test Data Insertion

```sql
-- Test 1: Insert guest_tracking record with dexuatchuongtrinh type
INSERT INTO guest_tracking 
  (tracking_uuid, hoten, email, loai, quy_id, sotien, trangthai, dexuatchuongtrinh_id)
VALUES 
  ('test-uuid-001', 'Test User', 'test@example.com', 'dexuatchuongtrinh', 1, 1000000, 'CHO_XAC_MINH', NULL);

-- Verify insertion
SELECT * FROM guest_tracking WHERE tracking_uuid = 'test-uuid-001';

-- Test 2: Insert dexuatchuongtrinh with NULL nhataitro_id (guest submission)
INSERT INTO dexuatchuongtrinh 
  (quythanhphan_id, khoantaitro_id, nhataitro_id, nguoidung_id, tenchuongtrinh, mota, soluongsuat, sotienmoisuat, loaihotro, trangthai)
VALUES 
  (1, NULL, NULL, NULL, 'Test Program', 'Test Description', 10, 500000, 'Tai tro khong hoan lai', 'Cho duyet');

-- Verify insertion
SELECT * FROM dexuatchuongtrinh WHERE tenchuongtrinh = 'Test Program';

-- Test 3: Link guest_tracking to dexuatchuongtrinh
UPDATE guest_tracking 
SET dexuatchuongtrinh_id = LAST_INSERT_ID()
WHERE tracking_uuid = 'test-uuid-001';

-- Verify link
SELECT 
  gt.tracking_uuid,
  gt.hoten,
  gt.email,
  gt.trangthai as tracking_status,
  dx.tenchuongtrinh,
  dx.trangthai as proposal_status
FROM guest_tracking gt
LEFT JOIN dexuatchuongtrinh dx ON gt.dexuatchuongtrinh_id = dx.dexuatchuongtrinh_id
WHERE gt.tracking_uuid = 'test-uuid-001';

-- Clean up test data
DELETE FROM guest_tracking WHERE tracking_uuid = 'test-uuid-001';
DELETE FROM dexuatchuongtrinh WHERE tenchuongtrinh = 'Test Program';
```

### 3. Test Foreign Key Constraints

```sql
-- Test FK constraint: Try to insert invalid dexuatchuongtrinh_id
-- This should fail with foreign key constraint error
INSERT INTO guest_tracking 
  (tracking_uuid, hoten, email, loai, quy_id, sotien, trangthai, dexuatchuongtrinh_id)
VALUES 
  ('test-fk-001', 'FK Test', 'fk@test.com', 'dexuatchuongtrinh', 1, 100000, 'CHO_XAC_MINH', 99999);

-- Test FK cascade: Create proposal, link to guest_tracking, then delete proposal
-- The dexuatchuongtrinh_id should be set to NULL (ON DELETE SET NULL)
INSERT INTO dexuatchuongtrinh 
  (quythanhphan_id, tenchuongtrinh, soluongsuat, sotienmoisuat, trangthai)
VALUES 
  (1, 'FK Cascade Test', 5, 100000, 'Cho duyet');

SET @proposal_id = LAST_INSERT_ID();

INSERT INTO guest_tracking 
  (tracking_uuid, hoten, email, loai, quy_id, sotien, trangthai, dexuatchuongtrinh_id)
VALUES 
  ('test-fk-002', 'FK Cascade', 'cascade@test.com', 'dexuatchuongtrinh', 1, 500000, 'DA_CHUYEN', @proposal_id);

-- Verify link
SELECT dexuatchuongtrinh_id FROM guest_tracking WHERE tracking_uuid = 'test-fk-002';

-- Delete proposal (should set FK to NULL)
DELETE FROM dexuatchuongtrinh WHERE dexuatchuongtrinh_id = @proposal_id;

-- Verify FK is NULL
SELECT dexuatchuongtrinh_id FROM guest_tracking WHERE tracking_uuid = 'test-fk-002';
-- Should show NULL

-- Clean up
DELETE FROM guest_tracking WHERE tracking_uuid = 'test-fk-002';
```

## Rollback Procedure

### When to Rollback

- Migration fails partway through
- Schema changes cause application errors
- Need to revert for any reason

### Execute Rollback

```bash
cd backend/database/migrations
node add_proposal_otp_schema.mjs rollback
```

### Expected Rollback Output

```
Starting rollback: Remove proposal OTP schema...

STEP 1: Removing fk_guest_tracking_dexuat...
✅ Removed foreign key constraint

STEP 2: Removing dexuatchuongtrinh_id column...
✅ Removed column

STEP 3: Removing fk_dexuat_nguoidung...
✅ Removed foreign key constraint

STEP 4: Removing nguoidung_id column...
✅ Removed column

⚠️  Note: nhataitro_id remains nullable (manual revert if needed)
⚠️  Note: guest_tracking.loai enum not reverted (manual revert if needed)

✅ Rollback completed successfully!
```

### Manual Rollback (if script fails)

```sql
-- Remove foreign keys
ALTER TABLE guest_tracking DROP FOREIGN KEY fk_guest_tracking_dexuat;
ALTER TABLE dexuatchuongtrinh DROP FOREIGN KEY fk_dexuat_nguoidung;

-- Remove columns
ALTER TABLE guest_tracking DROP COLUMN dexuatchuongtrinh_id;
ALTER TABLE dexuatchuongtrinh DROP COLUMN nguoidung_id;

-- Optionally revert nhataitro_id to NOT NULL (only if needed)
-- WARNING: This will fail if there are existing NULL values
-- ALTER TABLE dexuatchuongtrinh MODIFY COLUMN nhataitro_id INT NOT NULL;
```

### Restore from Backup

```bash
# Stop application first
# Then restore database
mysql -u root -p tvu_fund_management < backup_before_otp_migration_YYYYMMDD_HHMMSS.sql
```

## Integration Testing

### Test with GuestModel

After migration, test the `verifyAndMigrateProposal` function:

```javascript
// In Node.js REPL or test script
import GuestModel from '../../models/guest/GuestModel.js';

const testData = {
  trackingUuid: 'test-integration-001',
  guestEmail: 'integration@test.com',
  guestHoTen: 'Integration Test User',
  guestSoDienThoai: '0123456789',
  quyThanhPhanId: 1,
  tenChuongTrinh: 'Test Integration Program',
  moTa: 'This is an integration test',
  soLuongSuat: 10,
  soTienMoiSuat: 500000,
  loaiHoTro: 'Tai tro khong hoan lai'
};

const result = await GuestModel.verifyAndMigrateProposal(testData, 'TempPass123!');
console.log('Result:', result);

// Verify in database
// SELECT * FROM guest_tracking WHERE tracking_uuid = 'test-integration-001';
// SELECT * FROM dexuatchuongtrinh WHERE dexuatchuongtrinh_id = <result.proposalId>;
// SELECT * FROM nguoidung WHERE nguoidung_id = <result.nguoiDungId>;
```

## Troubleshooting

### Error: "Column 'dexuatchuongtrinh' not in enum"

**Solution:** Run the prerequisite migration first:
```bash
node update_guest_tracking_loai_enum.mjs
```

### Error: "Foreign key constraint fails"

**Cause:** Referenced table or column doesn't exist

**Solution:** Verify both tables exist and have correct structure:
```sql
SHOW TABLES LIKE 'dexuatchuongtrinh';
SHOW TABLES LIKE 'nguoidung';
DESCRIBE dexuatchuongtrinh;
DESCRIBE nguoidung;
```

### Error: "Can't DROP 'column_name'; check that column/key exists"

**Cause:** Column was already removed or never existed

**Solution:** This is safe to ignore. The migration handles this gracefully.

### Migration runs but columns not added

**Cause:** Migration may have skipped steps thinking they already exist

**Solution:** 
1. Check actual schema: `DESCRIBE guest_tracking;`
2. If columns missing, check for errors in migration output
3. May need to run specific ALTER statements manually

## Success Criteria

Migration is successful when:

✅ All migration steps complete without errors
✅ `guest_tracking.dexuatchuongtrinh_id` column exists and is nullable
✅ Foreign key `fk_guest_tracking_dexuat` exists
✅ `dexuatchuongtrinh.nhataitro_id` is nullable
✅ `dexuatchuongtrinh.nguoidung_id` column exists and is nullable
✅ Foreign key `fk_dexuat_nguoidung` exists
✅ Test data insertions work correctly
✅ Foreign key constraints are enforced
✅ Application can create proposal records with OTP workflow

## Requirements Coverage

This migration satisfies the following requirements from the spec:

- ✅ **R9.1**: guest_tracking.loai includes 'dexuatchuongtrinh'
- ✅ **R9.2**: guest_tracking.dexuatchuongtrinh_id as nullable FK
- ✅ **R9.3**: dexuatchuongtrinh_id can be NULL until verification
- ✅ **R9.4**: dexuatchuongtrinh_id updated with proposal ID after verification
- ✅ **R9.5**: dexuatchuongtrinh supports proposals without nhataitro_id
- ✅ **R9.6**: nhataitro_id set to NULL for guest submissions
- ✅ **R9.7**: khoantaitro_id set to NULL for guest submissions (already supported)

## Next Steps

After successful migration:

1. Deploy code changes for OTP verification controllers
2. Update GuestModel.verifyAndMigrateProposal to set nguoidung_id in dexuatchuongtrinh table
3. Deploy frontend ProposalFormPage component
4. Test end-to-end OTP workflow
5. Monitor for any issues in production

## Support

For issues or questions:
- Check migration logs for detailed error messages
- Verify database connection and permissions
- Consult the design document: `.kiro/specs/proposal-otp-verification/design.md`
- Review requirements: `.kiro/specs/proposal-otp-verification/requirements.md`
