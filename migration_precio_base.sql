-- Añade precio_base a configuracion y actualiza el evento para leerlo

INSERT INTO configuracion (clave, valor, descripcion)
VALUES ('precio_base', '150', 'Precio base por noche en € para nuevos días del calendario')
ON DUPLICATE KEY UPDATE descripcion = VALUES(descripcion);

-- Recrear el evento para que lea precio_base desde configuracion
DROP EVENT IF EXISTS extender_calendario;

DELIMITER $$

CREATE EVENT extender_calendario
ON SCHEDULE EVERY 1 DAY
STARTS NOW()
ON COMPLETION NOT PRESERVE
ENABLE
DO BEGIN
  DECLARE nueva_fecha DATE;
  DECLARE precio DECIMAL(10,2) DEFAULT 150.00;

  SET nueva_fecha = DATE_ADD(CURDATE(), INTERVAL 12 MONTH);

  SELECT CAST(valor AS DECIMAL(10,2)) INTO precio
  FROM configuracion
  WHERE clave = 'precio_base';

  INSERT IGNORE INTO disponibilidad (fecha, precio, estado, fuente)
  VALUES (nueva_fecha, precio, 'cerrada', 'local');
END$$

DELIMITER ;
