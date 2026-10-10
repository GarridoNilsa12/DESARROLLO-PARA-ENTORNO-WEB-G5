-- ============================================================
--  Coolbox - Esquema de base de datos (MySQL 8.0.16 o superior)
--  Tablas de esta entrega: productos, usuarios, resenas
--  Las tablas de las demás historias (lista de deseos, etc.)
--  se agregan en archivos aparte: 03_..., 04_...
-- ============================================================

CREATE DATABASE IF NOT EXISTS coolbox
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE coolbox;

-- Versión mínima del catálogo: las reseñas necesitan un producto al cual apuntar.
-- Quien desarrolle el catálogo puede ampliarla (imagen, descripción, stock, etc.).
CREATE TABLE IF NOT EXISTS productos (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  codigo     VARCHAR(30)   NOT NULL UNIQUE,   -- mismo id que usa el frontend ('macbook', 'dell', ...)
  nombre     VARCHAR(150)  NOT NULL,
  precio     DECIMAL(10,2) NOT NULL,
  categoria  VARCHAR(40)   NOT NULL,
  creado_en  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- US-login: cuentas de clientes.
CREATE TABLE IF NOT EXISTS usuarios (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  nombre         VARCHAR(80)  NOT NULL,
  email          VARCHAR(120) NOT NULL UNIQUE,
  password_hash  VARCHAR(200) NOT NULL,        -- scrypt: "sal:hash" en hexadecimal, nunca la contraseña en claro
  creado_en      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- US003: reseñas y calificaciones por producto.
-- usuario_id es opcional porque el formulario actual permite publicar como "Anónimo".
CREATE TABLE IF NOT EXISTS resenas (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  producto_id   INT           NOT NULL,
  usuario_id    INT           NULL,
  nombre_autor  VARCHAR(80)   NOT NULL DEFAULT 'Anónimo',
  calificacion  TINYINT       NOT NULL,
  comentario    VARCHAR(1000) NOT NULL,
  verificada    BOOLEAN       NOT NULL DEFAULT FALSE,   -- "compra verificada"
  creado_en     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_resenas_calificacion CHECK (calificacion BETWEEN 1 AND 5),
  CONSTRAINT fk_resenas_producto FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
  CONSTRAINT fk_resenas_usuario  FOREIGN KEY (usuario_id)  REFERENCES usuarios(id)  ON DELETE SET NULL,
  INDEX idx_resenas_producto (producto_id, creado_en)
);
