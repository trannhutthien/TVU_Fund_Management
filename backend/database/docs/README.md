# Database Documentation

Thu muc nay chi giu tai lieu schema va logic co gia tri dai han. Cac seed/fix SQL tam thoi da duoc loai bo de tranh chay nham script cu khong khop schema hien tai.

## Tai Lieu Chinh

- [DATABASE_CHANGES_SUMMARY.md](./DATABASE_CHANGES_SUMMARY.md) - Tong hop thay doi database.
- [BUSINESS_LOGIC_UPDATES.md](./BUSINESS_LOGIC_UPDATES.md) - Cap nhat logic nghiep vu lien quan den database.

## Schema Scripts

Schema va migration nam tai `backend/database/schemas/`:

- `COMPLETE_DATABASE_SCHEMA.sql` - Schema tong hop.
- `create_sinh_vien_noi_bat.sql` - Tao bang sinh vien noi bat.
- `create_guest_tables.sql` - Tao bang cho luong khach vang lai.
- `alter_matkhau_nullable.sql` - Dieu chinh cot mat khau.
- `rename_tintuc_columns_to_camelcase.sql` - Migration cot bang tin tuc.
- `run_sql.js` - Helper chay SQL khi can.

## Luu Y

- Backup database truoc khi chay bat ky script nao.
- Uu tien schema tong hop trong `docs/database/tvu_fund_management.sql` khi can dong bo database hien tai.
- Khong them seed/demo data vao thu muc runtime backend neu chi phuc vu test thu cong.
