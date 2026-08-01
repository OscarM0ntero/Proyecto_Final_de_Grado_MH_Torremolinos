
INSERT INTO contenido (id_contenido, titulo_es, titulo_en, titulo_de, titulo_no, texto_es, texto_en, texto_de, texto_no, pagina)
VALUES (
    26,
    'Introducción',
    'Introduction',
    'Einleitung',
    'Introduksjon',
    '¿Tienes alguna pregunta sobre el apartamento, las fechas de disponibilidad o cualquier otro asunto? Escríbenos y te responderemos lo antes posible.',
    'Do you have any questions about the apartment, available dates, or anything else? Write to us and we will get back to you as soon as possible.',
    'Haben Sie Fragen zur Wohnung, zu verfügbaren Terminen oder zu anderen Themen? Schreiben Sie uns und wir antworten Ihnen so schnell wie möglich.',
    'Har du spørsmål om leiligheten, tilgjengelige datoer eller noe annet? Skriv til oss, så svarer vi deg så snart som mulig.',
    'contact'
);

INSERT INTO configuracion VALUES ('precio_mascota', '10', 'Suplemento por mascota en €/noche')
ON DUPLICATE KEY UPDATE descripcion = VALUES(descripcion);


-- Añadir columnas snapshot del cliente en reservas
ALTER TABLE `reservas`
  ADD COLUMN `cliente_nombre`    varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL AFTER `id_usuario`,
  ADD COLUMN `cliente_apellidos` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL AFTER `cliente_nombre`,
  ADD COLUMN `cliente_email`     varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL AFTER `cliente_apellidos`,
  ADD COLUMN `cliente_prefijo`   varchar(10)  COLLATE utf8mb4_unicode_ci DEFAULT NULL AFTER `cliente_email`,
  ADD COLUMN `cliente_telefono`  varchar(20)  COLLATE utf8mb4_unicode_ci DEFAULT NULL AFTER `cliente_prefijo`;

-- Rellenar datos existentes desde la tabla usuarios
UPDATE `reservas` r
  JOIN `usuarios` u ON r.id_usuario = u.id_usuario
  SET
    r.cliente_nombre    = u.nombre,
    r.cliente_apellidos = u.apellidos,
    r.cliente_email     = u.email,
    r.cliente_prefijo   = u.prefijo,
    r.cliente_telefono  = u.telefono;

-- Cambiar FK para que al borrar usuario solo ponga id_usuario a NULL
ALTER TABLE `reservas` DROP FOREIGN KEY `reservas_ibfk_1`;
ALTER TABLE `reservas`
  ADD CONSTRAINT `reservas_ibfk_1`
  FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`)
  ON DELETE SET NULL;