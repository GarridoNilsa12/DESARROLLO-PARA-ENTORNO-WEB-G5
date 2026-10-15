-- ============================================================
--  Coolbox - Comparador de productos y lista de deseos
--  Ejecutar DESPUÉS de 01_esquema.sql y 02_datos_prueba.sql.
--  producto_id es el id del catálogo del backend (backend/data/productos.js),
--  por eso no lleva llave foránea a la tabla productos.
-- ============================================================

USE coolbox;

CREATE TABLE IF NOT EXISTS comparador (
  producto_id  INT       NOT NULL PRIMARY KEY,
  agregado_en  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lista_deseos (
  producto_id  INT       NOT NULL PRIMARY KEY,
  agregado_en  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Productos de ejemplo en la lista de deseos (MacBook, iPad y Logitech G733), igual que el servidor local.
INSERT IGNORE INTO lista_deseos (producto_id) VALUES (1), (4), (10);
