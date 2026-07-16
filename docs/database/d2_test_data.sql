-- ═══════════════════════════════════════════════════════════════════════════════
-- D2 TEST DATA: Tạo đơn "Cho vay" đã giải ngân, sẵn sàng nghiệm thu
-- ═══════════════════════════════════════════════════════════════════════════════

-- 1. Đơn #2: Cho vay, Da giai ngan, canghiemthu=1
INSERT INTO `yeucauhotro` (
  `nguoidung_id`, `quy_id`, `dot_id`, `lydo`, `sotiendenghi`,
  `tailieudinhkem`, `trangthai`, `ghichu`, `ngaynop`, `ngaycapnhat`,
  `loaihotro`, `canghiemthu`, `tongkinhphidudan`
) VALUES (
  13, 7, 3,
  'Đơn đề xuất vay vốn từ Quỹ Từ thiện Tiếp sức Đến trường để thực hiện đề tài NCKH về năng lượng tái tạo',
  50000000.00,
  'uploads/documents/test_d2.pdf',
  'Da giai ngan', NULL, '2026-07-01 08:00:00', NOW(),
  'Cho vay', 1, 50000000.00
);

SET @new_id = LAST_INSERT_ID();

-- 2. Phê duyệt 3 cấp cho đơn mới
INSERT INTO `pheduyet` (`yeucauhotro_id`, `capduyet`, `nguoiduyet_id`, `ketqua`, `ghichu`, `ngayduyet`)
VALUES
  (@new_id, 1, 3, 'Da duyet', 'Đủ điều kiện', '2026-07-02 09:00:00'),
  (@new_id, 2, 1, 'Da duyet', NULL, '2026-07-03 10:00:00'),
  (@new_id, 3, 2, 'Da duyet', 'Đủ điều kiện giải ngân', '2026-07-04 11:00:00');

-- 3. Giao dịch Chi (giải ngân) cho đơn mới
INSERT INTO `giaodich` (
  `yeucauhotro_id`, `quy_id`, `loaigiaodich`, `hangmucchi`,
  `nguoinhan_id`, `sotien`, `hinhthuc`, `trangthai`,
  `ghichu`, `nguoithuchien_id`, `ngaygiaodich`, `ngaycapnhat`
) VALUES (
  @new_id, 7, 'Chi', 'Cho_vay',
  13, 50000000.00, 'Chuyen khoan', 'Thanh cong',
  'Giải ngân đề tài NCKH', 2, '2026-07-05 14:00:00', '2026-07-05 14:00:00'
);

-- 4. Cập nhật số dư quỹ 7 (trừ đi 50 triệu)
UPDATE `quy` SET `sodu` = `sodu` - 50000000.00 WHERE `quy_id` = 7;

-- 5. Đơn #3: Cho vay, Da giai ngan, canghiemthu=1 (đơn thứ 2 để test nhiều đơn)
INSERT INTO `yeucauhotro` (
  `nguoidung_id`, `quy_id`, `dot_id`, `lydo`, `sotiendenghi`,
  `tailieudinhkem`, `trangthai`, `ghichu`, `ngaynop`, `ngaycapnhat`,
  `loaihotro`, `canghiemthu`, `tongkinhphidudan`
) VALUES (
  13, 9, 7,
  'Đơn đề xuất vay vốn từ Quỹ Xanh để thực hiện dự án trồng cây xanh trong khuôn viên trường',
  30000000.00,
  'uploads/documents/test_d2_2.pdf',
  'Da giai ngan', NULL, '2026-07-06 08:00:00', NOW(),
  'Cho vay', 1, 30000000.00
);

SET @new_id2 = LAST_INSERT_ID();

INSERT INTO `pheduyet` (`yeucauhotro_id`, `capduyet`, `nguoiduyet_id`, `ketqua`, `ghichu`, `ngayduyet`)
VALUES
  (@new_id2, 1, 3, 'Da duyet', 'Đủ điều kiện', '2026-07-07 09:00:00'),
  (@new_id2, 2, 1, 'Da duyet', NULL, '2026-07-07 10:00:00'),
  (@new_id2, 3, 2, 'Da duyet', 'Đủ điều kiện', '2026-07-07 11:00:00');

INSERT INTO `giaodich` (
  `yeucauhotro_id`, `quy_id`, `loaigiaodich`, `hangmucchi`,
  `nguoinhan_id`, `sotien`, `hinhthuc`, `trangthai`,
  `ghichu`, `nguoithuchien_id`, `ngaygiaodich`, `ngaycapnhat`
) VALUES (
  @new_id2, 9, 'Chi', 'Cho_vay',
  13, 30000000.00, 'Chuyen khoan', 'Thanh cong',
  'Giải ngân dự án trồng cây xanh', 2, '2026-07-08 14:00:00', '2026-07-08 14:00:00'
);

UPDATE `quy` SET `sodu` = `sodu` - 30000000.00 WHERE `quy_id` = 9;

-- Verification
SELECT yeucauhotro_id, nguoidung_id, quy_id, loaihotro, canghiemthu, trangthai, sotiendenghi, tongkinhphidudan
FROM yeucauhotro
WHERE yeucauhotro_id IN (2, 3)
ORDER BY yeucauhotro_id;
