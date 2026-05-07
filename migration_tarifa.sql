-- Migración: tarifa cancelable/no cancelable + tabla configuracion
-- Ejecutar en producción: mysql -u mhuser -p mhtorremolinos < migration_tarifa.sql

ALTER TABLE `reservas`
  ADD COLUMN `tipo_tarifa` ENUM('cancelable','no_cancelable') NOT NULL DEFAULT 'cancelable' AFTER `precio_total`,
  ADD COLUMN `descuento_aplicado` DECIMAL(5,2) NOT NULL DEFAULT 0.00 AFTER `tipo_tarifa`,
  ADD COLUMN `fecha_creacion` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `descuento_aplicado`;

ALTER TABLE `usuarios`
  ADD COLUMN `fecha_registro` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `rol`;

CREATE TABLE IF NOT EXISTS `configuracion` (
  `clave` VARCHAR(100) NOT NULL,
  `valor` VARCHAR(255) NOT NULL,
  `descripcion` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`clave`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `configuracion` (`clave`, `valor`, `descripcion`) VALUES
  ('descuento_no_cancelable', '10', 'Descuento en % para reservas no cancelables'),
  ('dias_cancelacion', '30', 'Días antes de la llegada en que el cliente puede cancelar sin coste')
ON DUPLICATE KEY UPDATE `valor` = `valor`;
