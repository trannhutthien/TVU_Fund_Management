# Database Migrations

This directory contains database migration scripts for the TVU Fund Management System.

## Available Migrations

### 1. add_proposal_otp_schema.mjs

**Purpose:** Add database schema support for OTP email verification on public proposal submissions

**What it does:**
- Adds `dexuatchuongtrinh_id` foreign key column to `guest_tracking` table
- Makes `dexuatchuongtrinh.nhataitro_id` nullable (for guest submissions)
- Adds `dexuatchuongtrinh.nguoidung_id` foreign key column
- Verifies `guest_tracking.loai` enum includes 'dexuatchuongtrinh'

**When to run:**
- Before deploying OTP verification for public proposals
- After running `update_guest_tracking_loai_enum.mjs`

**How to run:**

```bash
cd backend/database/migrations
node add_proposal_otp_schema.mjs          # Run migration
node add_proposal_otp_schema.mjs rollback # Rollback migration
```

**Requirements covered:** 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7

**Safety:**
- ✅ Idempotent (safe to run multiple times)
- ✅ Checks existing columns before altering
- ✅ Uses `ON DELETE SET NULL` for foreign keys
- ✅ Provides rollback capability
- ✅ Detailed logging and verification

**Expected output:**

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

### 2. fix_orphan_donors.js

**Purpose:** Fix existing donors that don't have linked user accounts

**What it does:**
- Finds all `nhataitro` records with `nguoi_dung_id = NULL` but have email
- Creates `nguoidung` accounts for them (or links to existing ones)
- Updates `nhataitro.nguoi_dung_id` to link properly

**When to run:**
- After deploying the new donor creation logic
- To fix historical data

**How to run:**

```bash
cd backend/database/migrations
node fix_orphan_donors.js
```

**Safety:**
- ✅ Uses database transactions (auto-rollback on error)
- ✅ Does not delete any data
- ✅ Logs all actions for audit
- ✅ Handles edge cases (duplicate emails, existing users)

**Expected output:**

```
╔════════════════════════════════════════════════════════════╗
║  TVU Fund Management - Orphan Donors Migration Script     ║
║  Fix donors with NULL nguoi_dung_id                       ║
╚════════════════════════════════════════════════════════════╝

🔍 Starting orphan donors migration...

📊 Found 15 orphan donors to process

📝 Processing donor #1: Nguyen Van A
   Email: nguyenvana@gmail.com
   ✅ Created user account (ID: 123)
   🔑 Temp password: abc12345
   ✓ Updated donor record with user ID

... (more donors)

============================================================
📊 MIGRATION SUMMARY
============================================================
Total orphan donors found:     15
✅ New users created:          12
🔗 Linked to existing users:   2
⏭️  Skipped (conflicts):        1
✗ Errors:                      0
============================================================

✅ All orphan donors processed successfully!

🔍 Verification: 0 orphan donors remaining

✅ Migration script completed successfully!
```

## Best Practices

### Before Running Migrations

1. **Backup your database:**
   ```bash
   mysqldump -u root -p tvu_fund_management > backup_before_migration.sql
   ```

2. **Test on development first:**
   - Run on dev/staging environment
   - Verify results
   - Then run on production

3. **Check current state:**
   ```sql
   SELECT COUNT(*) FROM nhataitro 
   WHERE nguoidung_id IS NULL AND email IS NOT NULL;
   ```

### After Running Migrations

1. **Verify results:**
   ```sql
   -- Should be 0 or very few
   SELECT COUNT(*) FROM nhataitro 
   WHERE nguoidung_id IS NULL AND email IS NOT NULL;
   
   -- Check created users
   SELECT * FROM nguoidung 
   WHERE loaitaikhoan = 'NHA_TAI_TRO' 
   ORDER BY ngay_tao DESC LIMIT 10;
   ```

2. **Notify affected donors:**
   - Send emails with login credentials
   - Provide password reset link
   - Explain new features (profile, history)

3. **Monitor for issues:**
   - Check error logs
   - Watch for duplicate account reports
   - Be ready to assist users

## Troubleshooting

### Migration fails with "email duplicate" error

**Cause:** Email already exists in `nguoidung` with different account

**Solution:** Migration automatically handles this by linking to existing user

### Migration creates duplicate donors

**Cause:** Email exists in multiple `nhataitro` records

**Solution:** Migration skips when user already has donor record. Review manually:
```sql
SELECT n.email, COUNT(*) as count
FROM nhataitro n
WHERE n.email IS NOT NULL
GROUP BY n.email
HAVING count > 1;
```

### Need to rollback migration

**Solution:**
1. Restore from backup:
   ```bash
   mysql -u root -p tvu_fund_management < backup_before_migration.sql
   ```

2. Or manually revert:
   ```sql
   -- Set nguoi_dung_id back to NULL for migrated donors
   UPDATE nhataitro 
   SET nguoidung_id = NULL 
   WHERE nguoidung_id IN (
     SELECT id FROM nguoidung 
     WHERE masodinhdanh LIKE 'NTT%'
     AND ngay_tao > 'YYYY-MM-DD HH:MM:SS'  -- Replace with migration time
   );
   
   -- Optionally delete created users (careful!)
   DELETE FROM nguoidung 
   WHERE masodinhdanh LIKE 'NTT%'
   AND ngay_tao > 'YYYY-MM-DD HH:MM:SS';  -- Replace with migration time
   ```

## Support

If you encounter issues:
1. Check logs for error details
2. Review SQL queries in the script
3. Contact dev team with error message and stack trace
