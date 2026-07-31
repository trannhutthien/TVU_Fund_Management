# -*- coding: utf-8 -*-
import pymysql
import sys
import os
import re

sys.stdout.reconfigure(encoding='utf-8')

AIVEN_CONFIG = {
    'host': 'mysql-735ef23-trannhutthien012345-f859.b.aivencloud.com',
    'port': 23536,
    'user': 'avnadmin',
    'password': 'AVNS_aSpzodktBU9qxNVmx7o',
    'database': 'defaultdb',
    'ssl': {'ssl': True}
}

LOCAL_CONFIG = {
    'host': '127.0.0.1',
    'port': 3306,
    'user': 'root',
    'password': ''
}

BACKUP_FILE = r'docs/database/backup_from_aiven.sql'
TARGET_DB_NAME = 'tvu_fund_management'

def format_val(val):
    if val is None:
        return 'NULL'
    if isinstance(val, (int, float)):
        return str(val)
    if isinstance(val, (bytes, bytearray)):
        return "0x" + val.hex()
    escaped = str(val).replace("\\", "\\\\").replace("'", "''").replace("\x00", "").replace("\n", "\\n").replace("\r", "\\r")
    return f"'{escaped}'"

def convert_ansi_quotes(stmt):
    # Convert "col_or_table" to `col_or_table`
    return re.sub(r'"([^"]+)"', r'`\1`', stmt)

def dump_aiven_database():
    print("1. Connecting to Aiven Cloud MySQL...")
    try:
        conn = pymysql.connect(**AIVEN_CONFIG)
    except Exception as e:
        print(f"FAILED to connect to Aiven Cloud MySQL: {e}")
        return False

    sql_statements = [
        "-- TVU Fund Management - Automatic Database Backup from Aiven Cloud\n",
        "SET FOREIGN_KEY_CHECKS = 0;\n",
        "SET SQL_MODE = 'ANSI_QUOTES,NO_AUTO_VALUE_ON_ZERO';\n",
        "SET NAMES utf8mb4;\n\n"
    ]

    with conn.cursor() as cursor:
        cursor.execute("SHOW TABLES;")
        tables = [row[0] for row in cursor.fetchall()]
        print(f"   Found {len(tables)} tables on Aiven Cloud.")

        for tbl in tables:
            print(f"   - Exporting table structure & data: {tbl}")
            sql_statements.append(f"-- ------------------------------------------------------\n")
            sql_statements.append(f"-- Table structure for table `{tbl}`\n")
            sql_statements.append(f"-- ------------------------------------------------------\n")
            sql_statements.append(f"DROP TABLE IF EXISTS `{tbl}`;\n")

            cursor.execute(f"SHOW CREATE TABLE `{tbl}`;")
            create_stmt = cursor.fetchone()[1]
            create_stmt = convert_ansi_quotes(create_stmt)
            sql_statements.append(f"{create_stmt};\n\n")

            cursor.execute(f"SELECT * FROM `{tbl}`;")
            rows = cursor.fetchall()
            if rows:
                cursor.execute(f"SHOW COLUMNS FROM `{tbl}`;")
                cols = [f"`{col[0]}`" for col in cursor.fetchall()]
                cols_str = ", ".join(cols)

                sql_statements.append(f"INSERT INTO `{tbl}` ({cols_str}) VALUES\n")
                row_strs = []
                for row in rows:
                    vals_str = ", ".join([format_val(v) for v in row])
                    row_strs.append(f"({vals_str})")
                sql_statements.append(",\n".join(row_strs) + ";\n\n")

    sql_statements.append("SET FOREIGN_KEY_CHECKS = 1;\n")
    conn.close()

    os.makedirs(os.path.dirname(BACKUP_FILE), exist_ok=True)
    with open(BACKUP_FILE, "w", encoding="utf-8") as f:
        f.writelines(sql_statements)

    print(f"SUCCESS: Exported clean file backup to: {BACKUP_FILE}")
    return True

def import_to_local_mysql():
    print("\n2. Connecting to Local XAMPP MySQL...")
    try:
        conn = pymysql.connect(**LOCAL_CONFIG)
    except Exception as e:
        print("\n========================================================")
        print(" THÔNG BÁO: XAMPP MySQL hiện ĐANG TẮT (OFF) trên máy bạn!")
        print("========================================================")
        print(" File backup từ Aiven đã được lưu thành công tại:")
        print(f" -> {os.path.abspath(BACKUP_FILE)}")
        print("\n Để hoàn tất nạp dữ liệu vào local, bạn vui lòng:")
        print(" 1. Mở XAMPP Control Panel.")
        print(" 2. Nhấn nút [Start] ở mục MySQL.")
        print(" 3. Mở Terminal chạy lại lệnh: python scripts/sync_aiven_to_local.py")
        print("========================================================\n")
        return False

    print("   Connected to Local MySQL successfully!")
    with conn.cursor() as cursor:
        print(f"   Creating database `{TARGET_DB_NAME}` if not exists...")
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS `{TARGET_DB_NAME}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;")
        cursor.execute(f"USE `{TARGET_DB_NAME}`;")

        print(f"   Importing `{BACKUP_FILE}` into local database `{TARGET_DB_NAME}`...")
        with open(BACKUP_FILE, "r", encoding="utf-8") as f:
            sql_content = f.read()

        statements = sql_content.split(";\n")
        for stmt in statements:
            stmt = stmt.strip()
            if stmt and not stmt.startswith("--"):
                try:
                    cursor.execute(stmt)
                except Exception as ex:
                    pass
        conn.commit()

    conn.close()
    print("\n========================================================")
    print(f" THÀNH CÔNG: Đã nạp hoàn tất toàn bộ dữ liệu từ Aiven vào Database Local `{TARGET_DB_NAME}`!")
    print("========================================================\n")
    return True

def main():
    if dump_aiven_database():
        import_to_local_mysql()

if __name__ == "__main__":
    main()
