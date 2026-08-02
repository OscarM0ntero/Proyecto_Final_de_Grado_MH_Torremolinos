-- Migración: horas de entrada y salida, configurables desde /admin/configuracion.
-- Se muestran en el formulario de reserva, en la página de gestión y en los emails.

INSERT INTO configuracion (clave, valor, descripcion) VALUES
  ('hora_checkin', '16:00', 'Hora de entrada (check-in)'),
  ('hora_checkout', '11:00', 'Hora de salida (check-out)')
ON DUPLICATE KEY UPDATE descripcion = VALUES(descripcion);
