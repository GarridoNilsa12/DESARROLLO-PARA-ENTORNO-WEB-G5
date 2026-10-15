-- ============================================================
--  Coolbox - Categorías y características de los productos (US001)
--  Diseño de Nilsa Garrido, integrado a la base coolbox.
--  Ejecutar DESPUÉS de 01, 02 y 03. Ejecutar UNA sola vez.
--  No modifica reseñas, usuarios ni los datos de productos:
--  solo agrega la columna id_categoria a productos.
-- ============================================================

USE coolbox;

CREATE TABLE IF NOT EXISTS categorias (
  id_categoria INT AUTO_INCREMENT PRIMARY KEY,
  nombre       VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS caracteristicas (
  id_caracteristica INT AUTO_INCREMENT PRIMARY KEY,
  nombre            VARCHAR(100) NOT NULL UNIQUE
);

INSERT IGNORE INTO categorias (id_categoria, nombre) VALUES
  (1, 'Laptops y tablets'),
  (2, 'Monitores'),
  (3, 'Consolas'),
  (4, 'Audio');

INSERT IGNORE INTO caracteristicas (id_caracteristica, nombre) VALUES
  (1, 'Almacenamiento'), (2, 'Conectividad'), (3, 'Pantalla'),
  (4, 'Marca'), (5, 'Procesador'), (6, 'RAM'),
  (7, 'Modelo'), (8, 'Incluye'), (9, 'Iluminación');

-- Cada producto pasa a pertenecer a una categoría.
ALTER TABLE productos
  ADD COLUMN id_categoria INT NULL,
  ADD CONSTRAINT fk_productos_categoria
    FOREIGN KEY (id_categoria) REFERENCES categorias(id_categoria);

UPDATE productos SET id_categoria = CASE categoria
  WHEN 'laptop'    THEN 1
  WHEN 'tablet'    THEN 1
  WHEN 'monitor'   THEN 2
  WHEN 'consola'   THEN 3
  WHEN 'audifonos' THEN 4
END;

-- Valor de cada característica por producto (tabla intermedia).
CREATE TABLE IF NOT EXISTS producto_caracteristica (
  id_producto       INT          NOT NULL,
  id_caracteristica INT          NOT NULL,
  valor             VARCHAR(100) NOT NULL,
  PRIMARY KEY (id_producto, id_caracteristica),
  CONSTRAINT fk_pc_producto FOREIGN KEY (id_producto)
    REFERENCES productos(id) ON DELETE CASCADE,
  CONSTRAINT fk_pc_caracteristica FOREIGN KEY (id_caracteristica)
    REFERENCES caracteristicas(id_caracteristica)
);

INSERT IGNORE INTO producto_caracteristica (id_producto, id_caracteristica, valor)
SELECT p.id, c.id_caracteristica, v.valor
FROM (
  SELECT 'macbook' AS codigo, 'Pantalla' AS caracteristica, '13.6"' AS valor
  UNION ALL SELECT 'macbook', 'Marca', 'Apple'
  UNION ALL SELECT 'macbook', 'Procesador', 'Chip M5'
  UNION ALL SELECT 'dell', 'Pantalla', '15"'
  UNION ALL SELECT 'dell', 'Marca', 'Dell'
  UNION ALL SELECT 'dell', 'Procesador', 'Intel Core i7'
  UNION ALL SELECT 'ipad', 'Almacenamiento', '128 GB'
  UNION ALL SELECT 'ipad', 'Conectividad', 'Wi-Fi'
  UNION ALL SELECT 'ipad', 'Pantalla', '11"'
  UNION ALL SELECT 'ipad', 'Marca', 'Apple'
  UNION ALL SELECT 'monitor', 'Pantalla', '27"'
  UNION ALL SELECT 'monitor', 'Marca', 'LG'
  UNION ALL SELECT 'ps5fat', 'Almacenamiento', '825 GB'
  UNION ALL SELECT 'ps5fat', 'Marca', 'Sony'
  UNION ALL SELECT 'ps5fat', 'Modelo', 'Fat'
  UNION ALL SELECT 'ps5slim', 'Almacenamiento', '1 TB'
  UNION ALL SELECT 'ps5slim', 'Marca', 'Sony'
  UNION ALL SELECT 'ps5slim', 'Modelo', 'Slim'
  UNION ALL SELECT 'ps5slim', 'Incluye', 'Astro Bot'
  UNION ALL SELECT 'g733', 'Marca', 'Logitech'
  UNION ALL SELECT 'g733', 'Iluminación', 'RGB'
) v
JOIN productos p ON p.codigo = v.codigo
JOIN caracteristicas c ON c.nombre = v.caracteristica;
