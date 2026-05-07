-- Migración: campo cancelable en tabla disponibilidad
-- Ejecutar en producción: mysql -u mhuser -p mhtorremolinos < migration_cancelable.sql

ALTER TABLE `disponibilidad`
  ADD COLUMN `cancelable` TINYINT(1) NOT NULL DEFAULT 1
    COMMENT '1 = cancelable, 0 = solo tarifa no cancelable'
  AFTER `estado`;
