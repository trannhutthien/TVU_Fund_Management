-- ============================================
-- FIX: Cho phép yeucauhotro_id và nguoinhan_id NULL trong bảng giaodich
-- Ngày: 2026-06-02
-- Lý do: Giao dịch THU (từ khoản tài trợ) không có yeucauhotro_id và nguoinhan_id
-- ============================================

-- Sửa cột yeucauhotro_id và nguoinhan_id cho phép NULL
ALTER TABLE giaodich 
  MODIFY yeucauhotro_id INT NULL COMMENT 'ID yêu cầu hỗ trợ (NULL cho giao dịch THU từ tài trợ)',
  MODIFY nguoinhan_id INT NULL COMMENT 'ID sinh viên nhận tiền (NULL cho giao dịch THU)';

-- Kiểm tra kết quả
SELECT 
  COLUMN_NAME,
  DATA_TYPE,
  IS_NULLABLE,
  COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'tvu_fund_management'
  AND TABLE_NAME = 'giaodich'
  AND COLUMN_NAME IN ('yeucauhotro_id', 'nguoinhan_id');
