-- Migración: mínimo de noches por reserva
-- Añade la clave de configuración 'min_noches' (editable desde /admin/configuracion).
-- El formulario de reserva y el backend impiden reservas de menos noches que este valor.

INSERT INTO configuracion (clave, valor, descripcion)
VALUES ('min_noches', '1', 'Mínimo de noches por reserva')
ON DUPLICATE KEY UPDATE descripcion = VALUES(descripcion);
