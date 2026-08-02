-- Migración: país e idioma del cliente (para saber en qué idioma comunicarse y de dónde vienen)
--   cliente_idioma  idioma en el que el huésped usó la web al reservar (es/en/de/no)
--   cliente_pais    código ISO de 2 letras obtenido de Stripe (dirección de facturación
--                   o, si no está, país emisor de la tarjeta)

ALTER TABLE `reservas`
  ADD COLUMN `cliente_idioma` varchar(5) COLLATE utf8mb4_unicode_ci DEFAULT NULL AFTER `cliente_telefono`,
  ADD COLUMN `cliente_pais` varchar(2) COLLATE utf8mb4_unicode_ci DEFAULT NULL AFTER `cliente_idioma`;
