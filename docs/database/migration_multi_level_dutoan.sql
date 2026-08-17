-- Migration: Multi-level approval for dutoanhangnam (Phuong an C)
-- Them 2 cot: capduyet + parent_id, sua UNIQUE constraint

-- 1. Them cot capduyet va parent_id
ALTER TABLE `dutoanhangnam`
  ADD COLUMN `capduyet` TINYINT(4) NOT NULL DEFAULT 1 COMMENT '1=Hoi dong Quy, 2=Hieu truong' AFTER `ghichu`,
  ADD COLUMN `parent_id` INT(11) NULL DEFAULT NULL COMMENT 'Record cha (cap1) lien ket voi record con (cap2)' AFTER `capduyet`;

-- 2. Sua UNIQUE constraint: namtaichinh + capduyet (moi nam co 2 record)
ALTER TABLE `dutoanhangnam`
  DROP INDEX `namtaichinh`;

ALTER TABLE `dutoanhangnam`
  ADD UNIQUE INDEX `uk_namtaichinh_capduyet` (`namtaichinh`, `capduyet`);

-- 3. Them FK cho parent_id (self-referencing)
ALTER TABLE `dutoanhangnam`
  ADD CONSTRAINT `fk_dutoan_parent`
  FOREIGN KEY (`parent_id`) REFERENCES `dutoanhangnam`(`dutoanhangnam_id`)
  ON DELETE CASCADE ON UPDATE CASCADE;
