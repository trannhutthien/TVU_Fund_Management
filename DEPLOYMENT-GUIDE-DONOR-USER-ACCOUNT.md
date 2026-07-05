# 🚀 Quick Deployment Guide: Donor User Account Creation

> **⚠️ READ THIS BEFORE DEPLOYING**

---

## ⏱️ Time Required: ~15 minutes

- Code deployment: 5 mins
- Database migration: 5-10 mins  
- Verification: 2 mins

---

## ✅ Pre-Deployment Checklist

- [ ] **Backup database** (CRITICAL!)
  ```bash
  mysqldump -u root -p tvu_fund_management > backup_$(date +%Y%m%d_%H%M%S).sql
  ```

- [ ] **Test on development first**
  ```bash
  # On dev environment
  git checkout main
  git pull
  cd backend && npm install
  node database/migrations/fix_orphan_donors.js
  ```

- [ ] **Notify team** about maintenance window
  - Estimated downtime: ~5 minutes
  - Affected features: Creating new donors

- [ ] **Check dependencies**
  ```bash
  cd backend
  npm list bcryptjs  # Should be installed
  ```

---

## 🚀 Deployment Steps

### Step 1: Deploy Code (5 mins)

```bash
# SSH into production server
ssh user@production-server

# Navigate to project
cd /path/to/tvu-fund-management

# Pull latest code
git pull origin main

# Install dependencies (if needed)
cd backend
npm install

# Restart backend
pm2 restart backend
# OR
npm run restart
# OR
systemctl restart tvu-backend
```

**Verify:**
```bash
# Check backend is running
pm2 status backend
# OR
curl http://localhost:5000/api/health
```

---

### Step 2: Run Migration (5-10 mins)

```bash
cd backend/database/migrations
node fix_orphan_donors.js
```

**Expected Output:**
```
╔════════════════════════════════════════════════════════════╗
║  TVU Fund Management - Orphan Donors Migration Script     ║
╚════════════════════════════════════════════════════════════╝

🔍 Starting orphan donors migration...

📊 Found 15 orphan donors to process

✓ Created user account (ID: 123)
✓ Linked donor to existing user
...

============================================================
📊 MIGRATION SUMMARY
============================================================
Total orphan donors found:     15
✅ New users created:          12
🔗 Linked to existing users:   2
⏭️  Skipped (conflicts):        1
✗ Errors:                      0
============================================================

✅ Migration script completed successfully!
```

**If you see errors:**
- Check database connection
- Verify credentials in .env
- Check error logs above
- Contact dev team if needed

---

### Step 3: Verify Deployment (2 mins)

**A. Check Database:**

```sql
-- Should return 0
SELECT COUNT(*) as orphan_count FROM nhataitro 
WHERE nguoidung_id IS NULL AND email IS NOT NULL;

-- Should match number of donors with email
SELECT COUNT(*) as total_donors FROM nhataitro 
WHERE email IS NOT NULL;

SELECT COUNT(*) as linked_donors FROM nhataitro 
WHERE nguoidung_id IS NOT NULL AND email IS NOT NULL;
```

**B. Test Creating New Donor:**

1. Login as staff/admin
2. Go to Donations > Create Donation
3. Select "New Donor"
4. Fill in:
   - Name: "Test Donor"
   - Email: "testdonor@example.com"
   - Phone: "0901234567"
5. Complete donation
6. **Check console logs** for:
   ```
   ✓ Tạo tài khoản người dùng mới ID: XXX
     Email: testdonor@example.com
     Mật khẩu tạm thời: XXXXXXXX
   ```

**C. Test Donor Login:**

1. Go to login page
2. Login with:
   - Email: testdonor@example.com
   - Password: (from console log)
3. Should login successfully
4. Should see donor profile & donation history

---

## ✅ Post-Deployment Tasks

### Immediate (Within 1 hour)

- [ ] Monitor error logs
  ```bash
  tail -f /path/to/logs/error.log
  pm2 logs backend --lines 100
  ```

- [ ] Check for failed donations
  ```sql
  SELECT * FROM khoantaitro 
  WHERE ngaytaitro = CURDATE() AND trangthai = 'Loi';
  ```

- [ ] Test a few more donations manually

### Short-term (Within 24 hours)

- [ ] **Notify existing donors about their accounts**
  - Get list of newly created accounts:
    ```sql
    SELECT u.email, u.hoten, n.tennhataitro
    FROM nguoidung u
    JOIN nhataitro n ON u.id = n.nguoidung_id
    WHERE u.ngay_tao >= '2026-07-05'  -- Deployment date
    AND u.loaitaikhoan = 'NHA_TAI_TRO'
    ORDER BY u.ngay_tao DESC;
    ```
  
  - Send welcome emails manually (until email service is implemented)
  - Include login instructions and temp password

- [ ] Update documentation/user guides

- [ ] Train staff on new behavior

### Long-term (Within 1 week)

- [ ] Monitor user adoption metrics
- [ ] Collect feedback from donors
- [ ] Plan email service integration

---

## 🔄 Rollback Plan (If Something Goes Wrong)

### Option 1: Restore from Backup (Safest)

```bash
# Stop backend
pm2 stop backend

# Restore database
mysql -u root -p tvu_fund_management < backup_YYYYMMDD_HHMMSS.sql

# Revert code
git revert HEAD
pm2 restart backend
```

### Option 2: Revert Code Only (If migration succeeded but code has issues)

```bash
git log --oneline -5  # Find commit hash
git revert <commit-hash>
pm2 restart backend
```

### Option 3: Manual Cleanup (Last Resort)

```sql
-- Set nguoi_dung_id back to NULL
UPDATE nhataitro 
SET nguoidung_id = NULL 
WHERE nguoidung_id IN (
  SELECT id FROM nguoidung 
  WHERE masodinhdanh LIKE 'NTT%'
  AND ngay_tao > '2026-07-05'
);

-- Delete created users
DELETE FROM nguoidung 
WHERE masodinhdanh LIKE 'NTT%'
AND ngay_tao > '2026-07-05';
```

---

## 🐛 Troubleshooting

### Issue: Migration script fails

**Error:** "Cannot connect to database"
```bash
# Check .env file
cat backend/.env | grep DB_

# Test connection
mysql -u <user> -p<password> -h <host> tvu_fund_management -e "SELECT 1"
```

**Error:** "Email duplicate"
- This is expected and handled
- Migration will link to existing user
- Check logs for details

**Error:** "Transaction rollback"
- Check full error message in console
- Likely a data integrity issue
- Contact dev team with error details

### Issue: Donors can't login after migration

**Check:**
```sql
SELECT u.*, n.* FROM nguoidung u
JOIN nhataitro n ON u.id = n.nguoidung_id
WHERE u.email = 'donor@email.com';
```

**Solution:**
- If no record: Re-run migration
- If password wrong: Check console logs for temp password
- If account locked: Update `trangthai` to 'Hoat dong'

### Issue: Creating new donor shows error "Email required"

**This is expected behavior!**
- Email is now required for new donors
- Staff must provide email
- If donor has no email, cannot create account
- Consider alternative: Create without email (donor_info.email = null) - but they won't get user account

---

## 📞 Emergency Contacts

**During Deployment:**
- On-call Dev: [phone]
- Database Admin: [phone]
- DevOps: [phone]

**After Hours:**
- Emergency hotline: [phone]
- Slack channel: #tech-support

---

## 📊 Success Criteria

After deployment, verify:

✅ **Technical:**
- [ ] Zero orphan donors (with email)
- [ ] No database errors in logs
- [ ] All new donors get user accounts
- [ ] Donors can login successfully

✅ **User Experience:**
- [ ] Staff can create donors normally
- [ ] Donors receive account info
- [ ] Donors can access their profiles
- [ ] No complaints about login issues

✅ **Performance:**
- [ ] Donation creation < 2 seconds
- [ ] Migration completed < 10 minutes
- [ ] No database performance degradation

---

## 📝 Checklist Summary

```
PRE-DEPLOYMENT:
[ ] Database backup created
[ ] Tested on dev environment
[ ] Team notified
[ ] Dependencies checked

DEPLOYMENT:
[ ] Code deployed
[ ] Backend restarted
[ ] Migration script run successfully
[ ] Verification queries passed

POST-DEPLOYMENT:
[ ] Manual test passed
[ ] Donor login tested
[ ] Logs monitored (1 hour)
[ ] Donors notified (24 hours)
[ ] Metrics tracked (1 week)

ROLLBACK (if needed):
[ ] Backup restored
[ ] Code reverted
[ ] Verification passed
[ ] Incident documented
```

---

## 🎉 You're Done!

If all checks pass:
- ✅ Deployment successful
- ✅ Feature is live
- ✅ Monitor for next 24 hours
- ✅ Celebrate! 🎉

**Questions?**
- Check full documentation: `docs/implementation/donor-user-account-creation-COMPLETED.md`
- Contact dev team on Slack: #dev-team
- Email: dev@tvu.edu.vn

---

**Document Version:** 1.0  
**Last Updated:** 2026-07-05  
**Author:** TVU Development Team
