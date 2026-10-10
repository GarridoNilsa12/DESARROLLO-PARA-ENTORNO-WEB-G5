// Capa de acceso a datos de reseñas: aquí vive todo el SQL.

import { consultar } from '../shared/db.mjs';

export const repositorioResenas = {
  async productoExiste(productoId) {
    const filas = await consultar('SELECT id FROM productos WHERE id = ?', [productoId]);
    return filas.length > 0;
  },

  listarPorProducto(productoId) {
    return consultar(
      `SELECT id,
              nombre_autor AS nombre,
              calificacion,
              comentario,
              verificada,
              creado_en AS creadoEn
         FROM resenas
        WHERE producto_id = ?
        ORDER BY creado_en DESC, id DESC`,
      [productoId]
    );
  },

  async crear({ productoId, usuarioId, nombreAutor, calificacion, comentario }) {
    const resultado = await consultar(
      `INSERT INTO resenas (producto_id, usuario_id, nombre_autor, calificacion, comentario)
       VALUES (?, ?, ?, ?, ?)`,
      [productoId, usuarioId, nombreAutor, calificacion, comentario]
    );
    return resultado.insertId;
  }
};
