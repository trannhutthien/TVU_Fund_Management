-- Retire 'Doc lap' from the fund operating types
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Update any existing 'Doc lap' funds to 'Tap trung - Be chung'
UPDATE `quy` 
SET `loaidieuhanh` = 'Tap trung - Be chung' 
WHERE `loaidieuhanh` = 'Doc lap';

-- 2. Modify the column to remove 'Doc lap' option and default to 'Tap trung - Be chung'
ALTER TABLE `quy` 
MODIFY COLUMN `loaidieuhanh` enum('Tap trung - Be chung', 'Tap trung - Muc chi') NOT NULL DEFAULT 'Tap trung - Be chung' COMMENT 'Hình thức vận hành quỹ';

SET FOREIGN_KEY_CHECKS = 1;
