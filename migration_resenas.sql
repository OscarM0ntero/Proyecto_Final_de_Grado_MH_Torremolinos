CREATE TABLE resenas (
    id_resena INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    pais VARCHAR(100) NOT NULL,
    iso CHAR(2) NOT NULL,
    puntuacion DECIMAL(3,1) NOT NULL,
    texto_positivo TEXT,
    texto_negativo TEXT,
    fecha_estancia VARCHAR(20),
    activa TINYINT(1) DEFAULT 1
);

ALTER TABLE resenas ADD COLUMN titulo VARCHAR(200) NOT NULL DEFAULT '' AFTER iso;
