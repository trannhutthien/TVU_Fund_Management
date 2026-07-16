"""
Tao du lieu nguoi dung + chuc vu quyen theo yeu cau tren Aiven.
Xoa du lieu cu, tao moi voi ten dung.
"""
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

import pymysql
import bcrypt
from datetime import date

CONN = dict(
    host="mysql-735ef23-trannhutthien012345-f859.b.aivencloud.com",
    port=23536,
    user="avnadmin",
    password="AVNS_aSpzodktBU9qxNVmx7o",
    database="defaultdb",
    charset="utf8mb4",
    ssl={"ca": None},
    connect_timeout=10,
)

DEFAULT_PASSWORD = "12345678"


def hash_password(pw):
    return bcrypt.hashpw(pw.encode('utf-8'), bcrypt.gensalt(10)).decode('utf-8')


def main():
    conn = pymysql.connect(**CONN)
    cur = conn.cursor()

    try:
        cur.execute("SET FOREIGN_KEY_CHECKS = 0")

        # ── Xoa du lieu cu ───────────────────────────────────────────────
        print("-- Xoa du lieu cu --")
        for tbl in ['chucvuquy', 'nguoidung', 'donvihoc', 'vaitro']:
            cur.execute(f"DELETE FROM `{tbl}`")
            print(f"  DELETE {tbl}: {cur.rowcount} rows")

        # ── 1. Vai tro ──────────────────────────────────────────────────
        print("\n== Vai tro ==")
        roles = [
            (1, 'Admin', 'Quan tri vien he thong'),
            (2, 'Ke toan', 'Ke toan vien'),
            (3, 'Can bo quy', 'Can bo quan ly quy'),
            (4, 'Nguoi dung', 'Sinh vien / Nguoi nop don'),
            (5, 'Ban kiem soat', 'Ban kiem soat noi bo'),
        ]
        for vaitro_id, tenvaitro, mota in roles:
            cur.execute(
                "INSERT INTO vaitro (vaitro_id, tenvaitro, mota, trangthai) "
                "VALUES (%s, %s, %s, 'Hoat dong')",
                (vaitro_id, tenvaitro, mota)
            )
            print(f"  + vaitro {vaitro_id}: {tenvaitro}")

        # ── 2. Don vi hoc ───────────────────────────────────────────────
        print("\n== Don vi hoc ==")
        cur.execute(
            "INSERT INTO donvihoc (donvihoc_id, madonvi, tenkhoa, trangthai) "
            "VALUES (1, 'CNTT', 'Khoa Cong nghe thong tin', 'Hoat dong')"
        )
        print("  + donvihoc 1: Khoa CNTT")

        # ── 3. Nguoi dung ───────────────────────────────────────────────
        print("\n== Nguoi dung ==")
        pw_hash = hash_password(DEFAULT_PASSWORD)

        users = [
            # Admin
            (1, 'Nguyen Van Binh',     'admin',  'admin@tvu.edu.vn',   1, 'Can bo'),
            # Ke toan
            (2, 'Tran Thi Kim Hong',   'kt001',  'hong@tvu.edu.vn',    2, 'Can bo'),
            # Can bo quy
            (3, 'Tran Van Thang',      'cb001',  'thang@tvu.edu.vn',   3, 'Can bo'),
            # Ban kiem soat (5 nguoi)
            (4, 'Tran Nhat Khanh',     'bks001', 'khanh@tvu.edu.vn',   5, 'Can bo'),
            (5, 'Nguyen Thi Thu',      'bks002', 'thu@tvu.edu.vn',     5, 'Can bo'),
            (6, 'Tran Nhat Quang',     'bks003', 'quang@tvu.edu.vn',   5, 'Can bo'),
            (7, 'Nguyen Hoan Thu',     'bks004', 'hoanthu@tvu.edu.vn', 5, 'Can bo'),
            (8, 'Phan Ngoc Bich',      'bks005', 'bich@tvu.edu.vn',    5, 'Can bo'),
        ]

        for uid, hoten, mssv, email, vaitro_id, loaitaikhoan in users:
            cur.execute(
                "INSERT INTO nguoidung "
                "(nguoidung_id, hoten, masodinhdanh, email, matkhau, vaitro_id, loaitaikhoan, trangthai) "
                "VALUES (%s, %s, %s, %s, %s, %s, %s, 'Hoat dong')",
                (uid, hoten, mssv, email, pw_hash, vaitro_id, loaitaikhoan)
            )
            print(f"  + nguoidung {uid}: {hoten} (role={vaitro_id})")

        # ── 4. Chuc vu quyen ────────────────────────────────────────────
        print("\n== Chuc vu quyen ==")
        chucvu = [
            # (nguoidung_id, tenchucvu, mota, ngaybatdau, ngayketthuc)
            # Ban kiem soat
            (4, 'Chu tich Ban Kiem soat',   'Chu tich, chiu trach nhiem chu tri cac cuoc hop Ban Kiem soat', date(2024,1,1), date(2026,12,31)),
            (5, 'Pho Chu tich Ban Kiem soat','Pho Chu tich, ho tro Chu tich dieu hanh Ban Kiem soat', date(2024,1,1), date(2026,12,31)),
            (6, 'Thu ky Ban Kiem soat',      'Thu ky, quan ly van thu, luu tru ho so cua Ban Kiem soat', date(2024,1,1), date(2026,12,31)),
            (7, 'Uy vien Ban Kiem soat',     'Uy vien, tham gia giam sat va xac nhan hoat dong tai chinh', date(2024,1,1), date(2026,12,31)),
            (8, 'Uy vien Ban Kiem soat',     'Uy vien, tham gia giam sat va xac nhan hoat dong tai chinh', date(2024,1,1), date(2026,12,31)),
        ]

        for nguid, tenchucvu, mota, ngaybd, ngaykt in chucvu:
            cur.execute(
                "INSERT INTO chucvuquy "
                "(nguoidung_id, tenchucvu, mota, ngaybatdau, ngayketthuc, trangthai) "
                "VALUES (%s, %s, %s, %s, %s, 'Dang nhiem vu')",
                (nguid, tenchucvu, mota, ngaybd, ngaykt)
            )
            print(f"  + chucvuquy: {tenchucvu}")

        cur.execute("SET FOREIGN_KEY_CHECKS = 1")

        # Verify
        print("\n== Xac nhan ==")
        for tbl in ['vaitro', 'nguoidung', 'chucvuquy', 'quy', 'loaiquy']:
            cur.execute(f"SELECT COUNT(*) FROM `{tbl}`")
            print(f"  {tbl}: {cur.fetchone()[0]} rows")

        print("\n== Danh sach nguoi dung ==")
        cur.execute("""
            SELECT n.nguoidung_id, n.hoten, n.email, n.vaitro_id, v.tenvaitro, n.loaitaikhoan
            FROM nguoidung n
            JOIN vaitro v ON n.vaitro_id = v.vaitro_id
            ORDER BY n.vaitro_id
        """)
        for r in cur.fetchall():
            print(f"  {r[0]} | {r[1]} | {r[2]} | {r[4]} | {r[5]}")

        print("\n== Chuc vu quyen ==")
        cur.execute("""
            SELECT c.tenchucvu, c.trangthai, n.hoten, n.email
            FROM chucvuquy c
            JOIN nguoidung n ON c.nguoidung_id = n.nguoidung_id
            ORDER BY c.chucvu_id
        """)
        for r in cur.fetchall():
            print(f"  {r[0]} | {r[2]} ({r[3]}) | {r[1]}")

        print(f"\nMat khau tat ca: {DEFAULT_PASSWORD}")

    finally:
        cur.close()
        conn.close()


if __name__ == "__main__":
    main()
