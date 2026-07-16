"""
Dọn dẹp Aiven database — giữ lại loaiquy + quy, xóa hết các bảng khác.
Dùng pymysql + SSL vì XAMPP MySQL client quá cũ cho Aiven.
"""
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
import pymysql
import ssl

# ── Aiven connection ────────────────────────────────────────────────────
CONN = dict(
    host="mysql-735ef23-trannhutthien012345-f859.b.aivencloud.com",
    port=23536,
    user="avnadmin",
    password="AVNS_aSpzodktBU9qxNVmx7o",
    database="defaultdb",
    charset="utf8mb4",
    ssl={"ca": None},  # Aiven requires SSL but skips CA verification
    connect_timeout=10,
)

# Tables to TRUNCATE (everything except quy + loaiquy)
# Order: leaf tables first (respects FK constraints as safety net)
TABLES_TRUNCATE = [
    # Level 0: No FK dependencies
    "guest_khoantaitro",
    "guest_yeucauhotro",
    "vaitro",
    "donvihoc",

    # Level 1: Only reference nguoidung/vaitro
    "tintuc",
    "nhatkyhethong",
    "danhgia",
    "chucvuquy",
    "sinhviennoibat",
    "dutoanhangnam",

    # Level 2: nguoidung (references vaitro, donvihoc)
    "nguoidung",

    # Level 3: taikhoannganhang, quy_cha self-ref
    "taikhoannganhang",

    # Level 4: Reference quy or nguoidung
    "nhataitro",
    "dotgiaingan",
    "phanbongansach",

    # Level 5: Reference nhataitro/quy
    "khoantaitro",
    "yeucauhotro",

    # Level 6: Reference yeucauhotro
    "pheduyet",
    "dieukhoanthuhoi",
    "hopdongvayvon",
    "nghiemthu",
    "giaodich",

    # Level 7: Reference hopdongvayvon
    "lichtrano",
]

# Tables to KEEP (do NOT truncate)
KEEP_TABLES = {"quy", "loaiquy"}


def main():
    conn = pymysql.connect(**CONN)
    cur = conn.cursor()

    try:
        # Disable FK checks for safe truncation
        cur.execute("SET FOREIGN_KEY_CHECKS = 0")
        print("[OK] SET FOREIGN_KEY_CHECKS = 0")

        truncated = []
        skipped = []
        errors = []

        for table in TABLES_TRUNCATE:
            if table in KEEP_TABLES:
                skipped.append(table)
                continue
            try:
                cur.execute(f"TRUNCATE TABLE `{table}`")
                truncated.append(table)
                print(f"  [OK] TRUNCATE {table}")
            except Exception as e:
                errors.append((table, str(e)))
                print(f"  [FAIL] {table}: {e}")

        # Re-enable FK checks
        cur.execute("SET FOREIGN_KEY_CHECKS = 1")
        print("[OK] SET FOREIGN_KEY_CHECKS = 1")

        # Show row counts for kept tables
        print("\n-- Du lieu giu lai --")
        for table in KEEP_TABLES:
            cur.execute(f"SELECT COUNT(*) FROM `{table}`")
            count = cur.fetchone()[0]
            print(f"  {table}: {count} rows")

        # Summary
        print(f"\n-- Tong ket --")
        print(f"  Da xoa: {len(truncated)} bang")
        if errors:
            print(f"  Loi: {len(errors)} bang")
            for t, e in errors:
                print(f"    - {t}: {e}")
        if skipped:
            print(f"  Bo qua (giu lai): {', '.join(skipped)}")

    finally:
        cur.close()
        conn.close()
        print("[OK] Dong ket noi")


if __name__ == "__main__":
    main()
