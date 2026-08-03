-- Migración: nota interna de administración en las reservas.
-- Es privada: no se muestra al huésped en /reserva/:token ni en ningún email.

ALTER TABLE `reservas`
  ADD COLUMN `nota_admin` text COLLATE utf8mb4_unicode_ci DEFAULT NULL AFTER `nota_adicional`;
