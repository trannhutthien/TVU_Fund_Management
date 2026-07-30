@echo off
chcp 65001 > nul
echo ===================================================
echo   DONG BO DATABASE TU AIVEN CLOUD VE LOCAL XAMPP
echo ===================================================
echo.

set MYSQL_DUMP="C:\xampp\mysql\bin\mysqldump.exe"
set MYSQL_CLI="C:\xampp\mysql\bin\mysql.exe"
set AIVEN_HOST=mysql-735ef23-trannhutthien012345-f859.b.aivencloud.com
set AIVEN_PORT=23536
set AIVEN_USER=avnadmin
set AIVEN_PASS=AVNS_aSpzodktBU9qxNVmx7o
set AIVEN_DB=defaultdb

set BACKUP_FILE=d:\TotNghiep\TVUDevelopmentFundManager\TVU_Fund_Management\docs\database\backup_from_aiven.sql

echo 1. Dang export du lieu tu Aiven Cloud...
%MYSQL_DUMP% -h %AIVEN_HOST% -P %AIVEN_PORT% -u %AIVEN_USER% -p%AIVEN_PASS% --ssl=REQUIRED --routines --triggers %AIVEN_DB% > "%BACKUP_FILE%"

if %ERRORLEVEL% EQU 0 (
    echo [THANH CONG] Da xuat file backup tai: %BACKUP_FILE%
) else (
    echo [LOI] Khong the export tu Aiven. Kiem tra lai ket noi internet.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo 2. Dang tao Database local (tvu_fund_management)...
%MYSQL_CLI% -u root -e "CREATE DATABASE IF NOT EXISTS tvu_fund_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

echo 3. Dang nap du lieu vao MySQL Local (XAMPP)...
%MYSQL_CLI% -u root tvu_fund_management < "%BACKUP_FILE%"

if %ERRORLEVEL% EQU 0 (
    echo [THANH CONG] Da nap thanh cong du lieu Aiven vao MySQL Local (tvu_fund_management)!
) else (
    echo [LOI] Khong the nap du lieu vao MySQL Local. Hay dam bao XAMPP MySQL dang chay!
)

echo.
pause
