-- Xóa records trong các bảng liên quan đến yeucauhotro id 14, 15
-- Thứ tự xóa để tránh vi phạm FK constraints

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Xóa lichtrano (liên kết qua hopdongvayvon)
DELETE FROM lichtrano 
WHERE hopdongvayvon_id IN (
    SELECT hopdongvayvon_id FROM hopdongvayvon 
    WHERE yeucauhotro_id IN (14, 15)
);

-- 2. Xóa giaodich (liên kết với yeucauhotro và lichtrano)
DELETE FROM giaodich 
WHERE yeucauhotro_id IN (14, 15);

-- 3. Xóa hopdongvayvon
DELETE FROM hopdongvayvon 
WHERE yeucauhotro_id IN (14, 15);

-- 4. Xóa nghiemthu
DELETE FROM nghiemthu 
WHERE yeucauhotro_id IN (14, 15);

-- 5. Xóa pheduyet
DELETE FROM pheduyet 
WHERE yeucauhotro_id IN (14, 15);

-- 6. Xóa dieukhoanthuhoi
DELETE FROM dieukhoanthuhoi 
WHERE yeucauhotro_id IN (14, 15);

-- 7. Xóa yeucauhotro
DELETE FROM yeucauhotro 
WHERE yeucauhotro_id IN (14, 15);

SET FOREIGN_KEY_CHECKS = 1;

-- Kiểm tra kết quả
SELECT 'Xoa thanh cong!' AS thongbao;
SELECT COUNT(*) AS so_luong_con_lai FROM yeucauhotro WHERE yeucauhotro_id IN (14, 15);
