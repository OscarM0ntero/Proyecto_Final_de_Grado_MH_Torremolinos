-- Migración: momento en que el huésped aceptó las condiciones de reserva.
--
-- La casilla del formulario demuestra que el formulario tenía una casilla; esta columna
-- es la que permite acreditar que una reserva concreta se contrató habiendo aceptado las
-- condiciones, y cuándo. La marca la pone el servidor con NOW(), no el navegador: la hora
-- del cliente se puede manipular y no serviría como prueba.
--
-- Queda NULL en las reservas anteriores a este cambio, que es lo correcto: de esas no
-- consta la aceptación, y rellenarlas sería inventarse el dato.

ALTER TABLE `reservas`
  ADD COLUMN `condiciones_aceptadas` datetime DEFAULT NULL AFTER `token_acceso`;
