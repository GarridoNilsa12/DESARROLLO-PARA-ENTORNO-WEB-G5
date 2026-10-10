-- ============================================================
--  Coolbox - Datos de prueba
--  Los productos salen de los que ya existen en el comparador.
--  Las 3 reseñas son las mismas que estaban escritas a mano
--  en el componente de reseñas del frontend.
-- ============================================================

USE coolbox;

INSERT INTO productos (codigo, nombre, precio, categoria) VALUES
  ('macbook', 'Apple MacBook Air 13.6" Chip M5',   4999.00, 'laptop'),
  ('dell',    'DELL Inspiron 15 Intel Core i7',    2999.00, 'laptop'),
  ('ipad',    'Apple iPad 11" Wi-Fi 128GB',        1449.00, 'tablet'),
  ('monitor', 'Monitor Gamer LG UltraGear 27"',     999.00, 'monitor'),
  ('ps5fat',  'Consola PlayStation 5 Fat 825GB',   3219.00, 'consola'),
  ('ps5slim', 'PlayStation 5 Slim 1TB + Astro Bot',2499.00, 'consola'),
  ('g733',    'Audífonos Logitech G733 RGB',         429.00, 'audifonos')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre), precio = VALUES(precio), categoria = VALUES(categoria);

-- Reseñas de ejemplo para el producto 'macbook'
INSERT INTO resenas (producto_id, nombre_autor, calificacion, comentario, verificada, creado_en)
SELECT p.id, r.nombre_autor, r.calificacion, r.comentario, r.verificada, r.creado_en
FROM productos p
JOIN (
  SELECT 'Marco T.'  AS nombre_autor, 5 AS calificacion,
         'Excelente relación precio-calidad. La batería rinde todo el día de trabajo remoto.' AS comentario,
         TRUE AS verificada,  NOW() - INTERVAL 3 DAY  AS creado_en
  UNION ALL
  SELECT 'Andrea Q.', 4,
         'Buen rendimiento para tareas de oficina y diseño básico. El teclado podría ser mejor.',
         TRUE,  NOW() - INTERVAL 7 DAY
  UNION ALL
  SELECT 'Renzo P.',  3,
         'Cumple lo básico, pero esperaba más RAM en este rango de precio.',
         FALSE, NOW() - INTERVAL 14 DAY
) r
WHERE p.codigo = 'macbook'
  AND NOT EXISTS (SELECT 1 FROM resenas x WHERE x.producto_id = p.id);
